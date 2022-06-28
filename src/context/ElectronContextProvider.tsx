import { createState, State, useState } from "@hookstate/core";
import { ipcRenderer } from 'electron';
import { BlockInfo } from "@terra-money/terra.js";
import React, { ReactElement, useEffect } from "react";
import { TerrariumTx } from "../models/TerrariumTx";
import { TerrariumBlock } from "../package";


type TypeElectronContext = {
    localTerraPathConfigured: State<boolean>;
    localTerraStarted: State<boolean | null>;
    blockState: State<TerrariumBlock>,
    txState: State<TerrariumTx[]>,
    logsState: State<string[]>,
}

const ElectronContext = React.createContext<TypeElectronContext>(null as any);

export const ElectronContextProvider = ({ children } : { children: ReactElement }) => {
    const blockState = useState(createState<TerrariumBlock>({ blocks: [], latestHeight: 0 }));
    const txState = useState(createState<TerrariumTx[]>([]));
    const logsState = useState(createState<string[]>([]));
    const localTerraPathConfigured = useState(createState<boolean>(!!window.store.get('localTerraPath')));
    const localTerraStarted = useState(createState<boolean | null>(null));


    useEffect(() => {
        ipcRenderer.on('NewBlock', ((_: any, block: BlockInfo) => {
            const bHeight = Number(block.block.header.height);
            blockState.latestHeight.set(bHeight);
            blockState.blocks.merge([{ ...block }]);
        }));
    
        ipcRenderer.on('Tx', (_: any, tx: TerrariumTx) => {
            txState.merge([{...tx}]);
        });
    
        ipcRenderer.on('NewLogs', ((_: any, log: string) => {
            logsState.merge([log]);
        }));
    
        ipcRenderer.on('LocalTerraRunning', ((_: any, isLocalTerraRunning: boolean) => {
            localTerraStarted.set(isLocalTerraRunning);
        }));
    
        ipcRenderer.on('LocalTerraPath', ((_: any, isLocalTerraPathConfigured: boolean) => {
            localTerraPathConfigured.set(isLocalTerraPathConfigured);
        }));

        return () => {
            ipcRenderer.removeAllListeners('NewBlock');
            ipcRenderer.removeAllListeners('Tx');
            ipcRenderer.removeAllListeners('NewLogs');
            ipcRenderer.removeAllListeners('LocalTerraRunning');
            ipcRenderer.removeAllListeners('LocalTerraPath');
        }
    }, [blockState, txState, logsState, localTerraPathConfigured, localTerraStarted]);

    return (
        <ElectronContext.Provider value={{blockState,txState,logsState,localTerraPathConfigured, localTerraStarted}}>
            {children}
        </ElectronContext.Provider>
    );
}

export default ElectronContext;