export const taotie: ITaotie = (window as any).taotie;

interface ITaotie {
    /**
     * A minimal set of methods exposed from Electron's `ipcRenderer`
     * to support communication to main process.
     */
    ipcRenderer: {
        /**
         * @param {string} channel
         * @param {any[]} args
         */
        send: (channel: string, ...args: any[]) => void;

        /**
         * @param {string} channel
         * @param {any[]} args
         * @returns {Promise<any> | undefined}
         */
        invoke: (channel: string, ...args: any[]) => Promise<any>;

        /**
         * @param {string} channel
         * @param {(event: any, ...args: any[]) => void} listener
         */
        on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;

        /**
         * @param {string} channel
         * @param {(event: any, ...args: any[]) => void} listener
         */
        once: (channel: string, listener: (event: any, ...args: any[]) => void) => void;

        /**
         * @param {string} channel
         * @param {(event: any, ...args: any[]) => void} listener
         */
        removeListener: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
    };

    ipcMessagePort: {
        /**
         * @param {string} channelRequest
         * @param {string} channelResponse
         * @param {string} requestNonce
         */
        connect: (channelRequest: string, channelResponse: string, requestNonce: string) => void;
    };

    /**
     * Support for subset of methods of Electron's `webFrame` type.
     */
    webFrame: {
        /**
         * @param {number} level
         */
        setZoomLevel: (level: number) => void;
    };

    /**
     * Support for subset of methods of Electron's `crashReporter` type.
     */
    crashReporter: {
        /**
         * @param {string} key
         * @param {string} value
         */
        addExtraParameter: (key: string, value: string) => void;
    };

    /**
     * Support for a subset of access to node.js global `process`.
     *
     * Note: when `sandbox` is enabled, the only properties available
     * are https://github.com/electron/electron/blob/master/docs/api/process.md#sandbox
     */
    process: any;

    /**
     * Some information about the context we are running in.
     */
    context: any;
}
