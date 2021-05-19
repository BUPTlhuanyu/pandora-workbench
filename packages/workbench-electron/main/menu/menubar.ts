/**
 * @file
 * src/vs/workbench/electron-sandbox/actions/developerActions.ts
 * src/vs/platform/menubar/electron-main/menubar.ts
 * src/vs/platform/actions/common/actions.ts
 * vscode 对 menu 的实现都归于 action，非常复杂
 */
import {Menu, MenuItem} from 'electron';

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

function __separator__(): MenuItem {
    return new MenuItem({type: 'separator'});
}

export class Menubar {
    // private menubarMenus: {[id: string]: IMenubarMenu};
    constructor() {
        // this.menubarMenus = Object.create(null);
        this.install();
    }

    // private addFallbackHandlers(): void {}

    private install(): void {
        // Menus
        const menubar = new Menu();

        // app
        const applicationMenu = new Menu();
        this.setMacApplicationMenu(applicationMenu);
        const macApplicationMenuItem = new MenuItem({ label: 'pandora', submenu: applicationMenu });
        menubar.append(macApplicationMenuItem);

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
        const preferences = new MenuItem({
            label: 'preferences',
            click() {
                
            }
        });

        const update = new MenuItem({
            label: 'update',
            click() {
                
            }
        });

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
            preferences,
            update,
            __separator__(),
            services,
            __separator__(),
            quit
        ];
        actions.forEach(i => macApplicationMenu.append(i));
    }

    private setHelpMenu(helpMenu: Menu) {
        // Toggle Developer Tools
        const toggleDevtools = new MenuItem({
            label: 'Toggle Developer Tools',
            role: 'toggleDevTools'
        });
        const actions = [
            __separator__(),
            toggleDevtools
        ];
        actions.forEach(i => helpMenu.append(i));
    }
}
