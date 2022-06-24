const path = require('path');
const Store = require('electron-store');
const { app, shell, ipcMain, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev')
require('dotenv').config()

const store = new Store();

const {
  startLocalTerra,
  stopLocalTerra,
  blockWs,
  txWs,
  downloadLocalTerra,
  subscribeToLocalTerraEvents,
  validateLocalTerraPath,
} = require('./utils');

const {
  showPathSelectionDialog,
  ShowWrongDirectoryDialog,
  showLocalTerraAlreadyExistsDialog
} = require('./dialogs');

async function init() {
  let browserWindow = new BrowserWindow({
    width: 1200,
    height: 720,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });
  let localTerraProcess;

  if (isDev) {
    browserWindow.loadURL('http://localhost:3000');
    browserWindow.webContents.openDevTools();
  }
  else {
    browserWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)
  }

  browserWindow.on('closed', () => {
    browserWindow = null;

    if (localTerraProcess) {
      stopLocalTerra(localTerraProcess);
    }
  });

  browserWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  txWs.subscribeTx({}, async ({ value }) => {
    browserWindow.webContents.send('Tx', value);
  });

  blockWs.subscribe('NewBlock', {}, ({ value }) => {
    browserWindow.webContents.send('NewBlock', value);
  });

  ipcMain.handle('SetLocalTerraPath', async () => {
    const { filePaths } = await showPathSelectionDialog();
    const isValid = validateLocalTerraPath(filePaths[0]);

    if (isValid) {
      await store.set('localTerraPath', filePaths[0]);
      localTerraProcess = startLocalTerra(filePaths[0]);
      await subscribeToLocalTerraEvents(localTerraProcess, browserWindow);
    }
    else {
      await ShowWrongDirectoryDialog();
      throw Error(`LocalTerra does not exist under the path '${localTerraPath}'`);
    }
  })

  ipcMain.handle('InstallLocalTerra', async () => {
    let localTerraPath;
    try {
      localTerraPath = await downloadLocalTerra();
      localTerraProcess = startLocalTerra(localTerraPath);
      await subscribeToLocalTerraEvents(localTerraProcess, browserWindow);
      await store.set('localTerraPath', localTerraPath);
    }
    catch (e) {
      await showLocalTerraAlreadyExistsDialog();
      throw Error("LocalTerra already exists under the default path")
    }
  });

  ipcMain.handle('UpdateLocalTerraConfig', async (_, localTerraConfig) => {
    const localTerraPath = await store.get('localTerraPath');
    
    if (localTerraConfig.isActive) {
      localTerraProcess = startLocalTerra(localTerraPath);
      await subscribeToLocalTerraEvents(localTerraProcess, browserWindow);
    }
    else {
      stopLocalTerra(localTerraProcess);
      browserWindow.webContents.send('LocalTerraStatusChanged', localTerraConfig);
    }

    return localTerraConfig;
  });

  app.on('window-all-closed', () => {
    stopLocalTerra(localTerraProcess);
  });

  const localTerraPath = await store.get('localTerraPath');
  if (localTerraPath) {
    localTerraProcess = startLocalTerra(localTerraPath);
    await subscribeToLocalTerraEvents(localTerraProcess, browserWindow);
  }
}

app.on('ready', init);