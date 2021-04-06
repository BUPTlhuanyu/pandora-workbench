(function () {
    'use strict';

    const {ipcRenderer, webFrame, crashReporter, contextBridge} = require('electron');

    // #######################################################################
    // ###                                                                 ###
    // ###       !!! DO NOT USE GET/SET PROPERTIES ANYWHERE HERE !!!       ###
    // ###       !!!  UNLESS THE ACCESS IS WITHOUT SIDE EFFECTS  !!!       ###
    // ###       (https://github.com/electron/electron/issues/25516)       ###
    // ###                                                                 ###
    // #######################################################################

    const globals = {
        /**
         * A minimal set of methods exposed from Electron's `ipcRenderer`
         * to support communication to main process.
         */
        ipcRenderer: {
            /**
             * @param {string} channel
             * @param {any[]} args
             */
            send(channel, ...args) {
                if (validateIPC(channel)) {
                    ipcRenderer.send(channel, ...args);
                }
            },

            /**
             * @param {string} channel
             * @param {any[]} args
             * @returns {Promise<any> | undefined}
             */
            invoke(channel, ...args) {
                if (validateIPC(channel)) {
                    return ipcRenderer.invoke(channel, ...args);
                }
            },

            /**
             * @param {string} channel
             * @param {(event: import('electron').IpcRendererEvent, ...args: any[]) => void} listener
             */
            on(channel, listener) {
                if (validateIPC(channel)) {
                    ipcRenderer.on(channel, listener);
                }
            },

            /**
             * @param {string} channel
             * @param {(event: import('electron').IpcRendererEvent, ...args: any[]) => void} listener
             */
            once(channel, listener) {
                if (validateIPC(channel)) {
                    ipcRenderer.once(channel, listener);
                }
            },

            /**
             * @param {string} channel
             * @param {(event: import('electron').IpcRendererEvent, ...args: any[]) => void} listener
             */
            removeListener(channel, listener) {
                if (validateIPC(channel)) {
                    ipcRenderer.removeListener(channel, listener);
                }
            }
        },

        ipcMessagePort: {
            /**
             * @param {string} channelRequest
             * @param {string} channelResponse
             * @param {string} requestNonce
             */
            connect(channelRequest, channelResponse, requestNonce) {
                if (validateIPC(channelRequest) && validateIPC(channelResponse)) {
                    const responseListener = (
                        /** @type {import('electron').IpcRendererEvent} */ e,
                        /** @type {string} */ responseNonce
                    ) => {
                        // validate that the nonce from the response is the same
                        // as when requested. and if so, use `postMessage` to
                        // send the `MessagePort` safely over, even when context
                        // isolation is enabled
                        if (requestNonce === responseNonce) {
                            ipcRenderer.off(channelResponse, responseListener);
                            window.postMessage(requestNonce, '*', e.ports);
                        }
                    };

                    // request message port from main and await result
                    ipcRenderer.on(channelResponse, responseListener);
                    ipcRenderer.send(channelRequest, requestNonce);
                }
            }
        },

        /**
         * Support for subset of methods of Electron's `webFrame` type.
         */
        webFrame: {
            /**
             * @param {number} level
             */
            setZoomLevel(level) {
                if (typeof level === 'number') {
                    webFrame.setZoomLevel(level);
                }
            }
        },

        /**
         * Support for subset of methods of Electron's `crashReporter` type.
         */
        crashReporter: {
            /**
             * @param {string} key
             * @param {string} value
             */
            addExtraParameter(key, value) {
                crashReporter.addExtraParameter(key, value);
            }
        },

        /**
         * Support for a subset of access to node.js global `process`.
         *
         * Note: when `sandbox` is enabled, the only properties available
         * are https://github.com/electron/electron/blob/master/docs/api/process.md#sandbox
         */
        process: {
            get platform() {
                return process.platform;
            },
            get arch() {
                return process.arch;
            },
            get env() {
                return process.env;
            },
            get versions() {
                return process.versions;
            },
            get type() {
                return 'renderer';
            },
            get execPath() {
                return process.execPath;
            },

            /**
             * @returns {Promise<typeof process.env>}
             */
            getShellEnv() {
                return shellEnv;
            },

            /**
             * @param {{[key: string]: string}} userEnv
             * @returns {Promise<void>}
             */
            resolveEnv(userEnv) {
                return resolveEnv(userEnv);
            },

            /**
             * @returns {Promise<import('electron').ProcessMemoryInfo>}
             */
            getProcessMemoryInfo() {
                return process.getProcessMemoryInfo();
            },

            /**
             * @param {string} type
             * @param {() => void} callback
             */
            on(type, callback) {
                if (validateProcessEventType(type)) {
                    process.on(type, callback);
                }
            }
        },

        /**
         * Some information about the context we are running in.
         */
        context: {
            get sandbox() {
                return process.sandboxed;
            }
        }
    };
    // TODO: contextIsolation
    window.taotie = globals;

    //#region Utilities

    /**
     * @param {string} channel
     * @returns {true | never}
     */
    function validateIPC(channel) {
        if (!channel || !channel.startsWith('vscode:')) {
            throw new Error(`Unsupported event IPC channel '${channel}'`);
        }

        return true;
    }

    /**
     * @param {string} type
     * @returns {type is 'uncaughtException'}
     */
    function validateProcessEventType(type) {
        if (type !== 'uncaughtException') {
            throw new Error(`Unsupported process event '${type}'`);
        }

        return true;
    }

    /** @type {Promise<typeof process.env> | undefined} */
    let shellEnv = undefined;

    /**
     * If VSCode is not run from a terminal, we should resolve additional
     * shell specific environment from the OS shell to ensure we are seeing
     * all development related environment variables. We do this from the
     * main process because it may involve spawning a shell.
     *
     * @param {{[key: string]: string}} userEnv
     * @returns {Promise<void>}
     */
    async function resolveEnv(userEnv) {
        if (!shellEnv) {
            // Apply `userEnv` directly
            Object.assign(process.env, userEnv);

            // Resolve `shellEnv` from the main side
            shellEnv = new Promise(function (resolve) {
                ipcRenderer.once('taotie:acceptShellEnv', function (event, shellEnvResult) {
                    if (
                        !process.env[
                            'SKIP_PROCESS_ENV_PATCHING'
                        ] /* TODO@bpasero for https://github.com/microsoft/vscode/issues/108804 */
                    ) {
                        // Assign all keys of the shell environment to our process environment
                        // But make sure that the user environment wins in the end over shell environment
                        Object.assign(process.env, shellEnvResult, userEnv);
                    }

                    resolve({...process.env, ...shellEnvResult, ...userEnv});
                });

                ipcRenderer.send('taotie:fetchShellEnv');
            });
        }

        await shellEnv;
    }

    //#endregion
})();
