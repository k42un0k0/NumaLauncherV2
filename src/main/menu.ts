import { Menu, MenuItemConstructorOptions } from "electron";

export function createMenu() {
  // Extend default included application menu to continue support for quit keyboard shortcut
  const applicationSubMenu: MenuItemConstructorOptions = {
    label: "Application",
    submenu: [
      {
        label: "About Application",
        role: "about",
      },
      {
        type: "separator",
      },
      {
        label: "Quit",
        role: "quit",
        accelerator: "Command+Q",
      },
    ],
  };
  // Extend default included application menu to continue support for quit keyboard shortcut
  const windowMenu: MenuItemConstructorOptions = {
    label: "Window",
    submenu: [
      {
        role: "reload",
        accelerator: "CmdOrCtrl+R",
      },
    ],
  };

  // New edit menu adds support for text-editing keyboard shortcuts
  const editSubMenu: MenuItemConstructorOptions = {
    label: "Edit",
    submenu: [
      {
        label: "Undo",
        accelerator: "CmdOrCtrl+Z",
        role: "undo",
      },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        role: "redo",
      },
      {
        type: "separator",
      },
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        role: "cut",
      },
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        role: "copy",
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        role: "paste",
      },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        role: "selectAll",
      },
    ],
  };
  const menuObject = Menu.buildFromTemplate([applicationSubMenu, editSubMenu, windowMenu]);
  Menu.setApplicationMenu(menuObject);
}
