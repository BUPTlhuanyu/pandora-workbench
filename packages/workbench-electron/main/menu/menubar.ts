/**
 * @file
 * src/vs/workbench/electron-sandbox/actions/developerActions.ts
 * src/vs/platform/menubar/electron-main/menubar.ts
 * src/vs/platform/actions/common/actions.ts
 * vscode 对 menu 的实现都归于 action，非常复杂
 */
// TODO: 
// 1. 复用
// 2. 设置 settings 方案
import {Menu, MenuItem} from 'electron';
import {camelToWords} from '../../lib/utils';
import {ICommandService} from 'services/command';

export interface IMenubarMenuItemAction {
    id: string;
    label: string;
    checked?: boolean; // Assumed false if missing
    enabled?: boolean; // Assumed true if missing
}

export interface IMenubarMenu {
    items: Array<MenubarMenuItem>;
}

export interface IMenubarMenuRecentItemAction {
    id: string;
    label: string;
    uri: string;
    remoteAuthority?: string;
    enabled?: boolean;
}

export interface IMenubarMenuItemSubmenu {
    id: string;
    label: string;
    submenu: IMenubarMenu;
}

export interface IMenubarMenuItemSeparator {
    id: 'pandora.menubar.separator';
}

export type MenubarMenuItem =
    | IMenubarMenuItemAction
    | IMenubarMenuItemSubmenu
    | IMenubarMenuItemSeparator
    | IMenubarMenuRecentItemAction;

type Role =
    | '|'
    | 'undo'
    | 'redo'
    | 'cut'
    | 'copy'
    | 'paste'
    | 'pasteAndMatchStyle'
    | 'delete'
    | 'selectAll'
    | 'reload'
    | 'forceReload'
    | 'toggleDevTools'
    | 'resetZoom'
    | 'zoomIn'
    | 'zoomOut'
    | 'togglefullscreen'
    | 'window'
    | 'minimize'
    | 'close'
    | 'help'
    | 'about'
    | 'services'
    | 'hide'
    | 'hideOthers'
    | 'unhide'
    | 'quit'
    | 'startSpeaking'
    | 'stopSpeaking'
    | 'zoom'
    | 'front'
    | 'appMenu'
    | 'fileMenu'
    | 'editMenu'
    | 'viewMenu'
    | 'recentDocuments'
    | 'toggleTabBar'
    | 'selectNextTab'
    | 'selectPreviousTab'
    | 'mergeAllWindows'
    | 'clearRecentDocuments'
    | 'moveTabToNewWindow'
    | 'windowMenu';

function __separator__(): MenuItem {
    return new MenuItem({type: 'separator'});
}

export class Menubar {
    private oldMenus: Menu[];
    // private menubarMenus: {[id: string]: IMenubarMenu};
    constructor(
        @ICommandService private readonly commandService: ICommandService
    ) {
        // this.menubarMenus = Object.create(null);
        this.oldMenus = [];
        this.install();
    }

    // private addFallbackHandlers(): void {}

    private install(): void {
        const oldMenu = Menu.getApplicationMenu();
		if (oldMenu) {
			this.oldMenus.push(oldMenu);
		}
        // Menus
        const menubar = new Menu();

        // app
        const applicationMenu = new Menu();
        this.setMacApplicationMenu(applicationMenu);
        const macApplicationMenuItem = new MenuItem({label: 'Pandora', submenu: applicationMenu});
        menubar.append(macApplicationMenuItem);

        // edit
        const editMenu = new Menu();
        this.setEditMenu(editMenu);
        const editItem = new MenuItem({label: 'Edit', submenu: editMenu});
        menubar.append(editItem);

        // file
        const fileMenu = new Menu();
        this.setFileMenu(fileMenu);
        const fileItem = new MenuItem({label: 'File', submenu: fileMenu});
        menubar.append(fileItem);

        // Window
        const windowMenu = new Menu();
        this.setWindowMenu(windowMenu);
        const windowItem = new MenuItem({label: 'Window', submenu: windowMenu});
        menubar.append(windowItem);

        // Help
        const helpMenu = new Menu();
        this.setHelpMenu(helpMenu);
        const helpMenuItem = new MenuItem({label: 'Help', submenu: helpMenu, role: 'help'});
        menubar.append(helpMenuItem);

        // 设置成窗口顶部菜单
        if (menubar.items && menubar.items.length > 0) {
            Menu.setApplicationMenu(menubar);
        } else {
            Menu.setApplicationMenu(null);
        }
    }

    private setMacApplicationMenu(macApplicationMenu: Menu): void {
        // const preferences = new MenuItem({
        //     label: 'preferences',
        //     click() {}
        // });

        // const update = new MenuItem({
        //     label: 'update',
        //     click() {}
        // });

        const services = new MenuItem({
            label: 'services',
            role: 'services'
        });

        const quit = new MenuItem({
            label: 'quit',
            role: 'quit'
        });

        const actions = [
            // about,
            // __separator__(),
            // preferences,
            // update,
            __separator__(),
            services,
            __separator__(),
            quit
        ];
        actions.forEach(i => macApplicationMenu.append(i));
    }

    private setHelpMenu(helpMenu: Menu): void {
        // Toggle Developer Tools
        const toggleDevtools = new MenuItem({
            label: 'Toggle Developer Tools',
            role: 'toggleDevTools'
        });
        const actions = [__separator__(), toggleDevtools];
        actions.forEach(i => helpMenu.append(i));
    }

    private appendRoleMenu(menu: Menu, roles: Role[]) {
        roles.forEach(role => {
            if (role === '|') {
                menu.append(__separator__());
            } else {
                menu.append(
                    new MenuItem({
                        label: camelToWords(role),
                        role
                    })
                );
            }
        });
    }

    private setFileMenu(fileMenu: Menu): void {
        const newFile = new MenuItem({
            label: 'new file',
            click: () => {
                this.commandService.createFile();
            }
        });
        const newFolder = new MenuItem({
            label: 'new folder',
            click: () => {
                this.commandService.createDir();
            }
        });
        const rename = new MenuItem({
            label: 'rename',
            click: () => {
                this.commandService.rename();
            }
        });
        const moveToTrash = new MenuItem({
            label: 'move to trash',
            click: () => {
                this.commandService.moveToTrash();
            }
        });
        const revealInFinder = new MenuItem({
            label: 'reveal in finder',
            click: () => {
                this.commandService.revealInFinder();
            }
        });
        const actions = [newFile, newFolder, rename, __separator__(), moveToTrash, __separator__(), revealInFinder];
        actions.forEach(i => fileMenu.append(i));
    }

    private setEditMenu(editMenu: Menu): void {
        const roles: Role[] = ['undo', 'redo', '|', 'cut', 'copy', 'paste', 'pasteAndMatchStyle', 'delete', 'selectAll'];
        this.appendRoleMenu(editMenu, roles);
    }

    private setWindowMenu(windowMenu: Menu): void {
        const roles: Role[] = [
            'reload',
            'forceReload',
            '|',
            'resetZoom',
            'zoomIn',
            'zoomOut',
            'togglefullscreen',
            'minimize',
            '|',
            'close',
            'hide',
            'hideOthers',
            'unhide'
        ];
        this.appendRoleMenu(windowMenu, roles);
    }
}

export class HomeMenubar {
    constructor(
        // @ICommandService private readonly commandService: ICommandService
    ) {
        this.install();
    }

    // private addFallbackHandlers(): void {}

    private install(): void {
        // Menus
        const menubar = new Menu();

        // app
        const applicationMenu = new Menu();
        this.setMacApplicationMenu(applicationMenu);
        const macApplicationMenuItem = new MenuItem({label: 'Pandora', submenu: applicationMenu});
        menubar.append(macApplicationMenuItem);

        // Window
        const windowMenu = new Menu();
        this.setWindowMenu(windowMenu);
        const windowItem = new MenuItem({label: 'Window', submenu: windowMenu});
        menubar.append(windowItem);

        // Help
        const helpMenu = new Menu();
        this.setHelpMenu(helpMenu);
        const helpMenuItem = new MenuItem({label: 'Help', submenu: helpMenu, role: 'help'});
        menubar.append(helpMenuItem);

        // 设置成窗口顶部菜单
        if (menubar.items && menubar.items.length > 0) {
            Menu.setApplicationMenu(menubar);
        } else {
            Menu.setApplicationMenu(null);
        }
    }

    private setMacApplicationMenu(macApplicationMenu: Menu): void {
        // const preferences = new MenuItem({
        //     label: 'preferences',
        //     click() {}
        // });

        const services = new MenuItem({
            label: 'services',
            role: 'services'
        });

        const quit = new MenuItem({
            label: 'quit',
            role: 'quit'
        });

        const actions = [
            // about,
            // __separator__(),
            // preferences,
            // update,
            __separator__(),
            services,
            __separator__(),
            quit
        ];
        actions.forEach(i => macApplicationMenu.append(i));
    }

    private setHelpMenu(helpMenu: Menu): void {
        // Toggle Developer Tools
        const toggleDevtools = new MenuItem({
            label: 'Toggle Developer Tools',
            role: 'toggleDevTools'
        });
        const actions = [__separator__(), toggleDevtools];
        actions.forEach(i => helpMenu.append(i));
    }

    private appendRoleMenu(menu: Menu, roles: Role[]) {
        roles.forEach(role => {
            if (role === '|') {
                menu.append(__separator__());
            } else {
                menu.append(
                    new MenuItem({
                        label: camelToWords(role),
                        role
                    })
                );
            }
        });
    }

    private setWindowMenu(windowMenu: Menu): void {
        const roles: Role[] = [
            'reload',
            'forceReload',
            '|',
            'resetZoom',
            'zoomIn',
            'zoomOut',
            'togglefullscreen',
            'minimize',
            '|',
            'close',
            'hide',
            'hideOthers',
            'unhide'
        ];
        this.appendRoleMenu(windowMenu, roles);
    }
}
