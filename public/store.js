const Store = require('electron-store');
const fs = require('fs');

class TerrariumStore extends Store {
  constructor() {
    super();
    this.contracts = this.get('contracts') || [];
    this.localTerraPath = this.get('localTerraPath');
  }

  async setLocalTerraPath(path) {
    return this.set('localTerraPath', path);
  }

  async getLocalTerraPath() {
    return this.get('localTerraPath');
  }

  // eslint-disable-next-line class-methods-use-this
  async getBlocktime() {
    return window.ipcRenderer.invoke('getBlocktime');
  }

  // eslint-disable-next-line class-methods-use-this
  async setBlocktime(newBlocktime) {
    return window.ipcRenderer.invoke('setBlocktime', newBlocktime);
  }

  // eslint-disable-next-line class-methods-use-this
  async getOpenAtLogin() {
    return window.ipcRenderer.invoke('getOpenAtLogin');
  }

  // eslint-disable-next-line class-methods-use-this
  async setOpenAtLogin(status) {
    return window.ipcRenderer.invoke('setOpenAtLogin', status);
  }

  setContracts() {
    this.set('contracts', this.contracts);
    return this.contracts;
  }

  async getContracts() {
    this.contracts = await this.get('contracts') || [];
    this.checkIfContractsExists(this.contracts);
    return this.contracts;
  }

  importContracts(contracts) {
    if (contracts) {
      this.contracts = [...this.contracts, ...contracts];
      return this.setContracts();
    }
  }

  async deleteContract(contract) {
    this.contracts = this.contracts.filter((name) => name !== contract);
    this.setContracts();
  }

  async deleteAllContracts() {
    this.contracts = [];
    return this.setContracts();
  }

  checkIfContractsExists(contracts) {
    contracts.forEach((contract) => {
      if (!fs.existsSync(contract.path)) {
        this.deleteContract(contract);
      }
    });
  }
}
const store = new TerrariumStore();

module.exports = { store };
