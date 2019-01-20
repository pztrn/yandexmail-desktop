const { app, BrowserWindow, Menu, Tray } = require('electron')
const nativeImage = require('electron').nativeImage
const windowStateKeeper = require('electron-window-state');
var path = require('path');
const ipc = require('electron').ipcMain;

let mainWindow;
let tray = null;

let normalIcon = nativeImage.createFromPath(path.join(__dirname, "assets", "icons", "icon.png"));
let unreadIcon = nativeImage.createFromPath(path.join(__dirname, "assets", "icons", "unread.png"));

function createWindow() {
    // Window state - load previous session data or fallback to default.
    let mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 700
    });

    mainWindow = new BrowserWindow({
        width: mainWindowState.width,
        height: mainWindowState.height,
        x: mainWindowState.x,
        y: mainWindowState.y,
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            contextIsolation: true,
            webviewTag: false,
            preload: path.resolve(__dirname, 'renderer.js')
        }
    });
    mainWindowState.manage(mainWindow);

    mainWindow.webContents.openDevTools();
    mainWindow.loadURL('https://mail.yandex.ru/');
    //mainWindow.loadFile(path.join(__dirname, "index.html"));
    mainWindow.on('closed', function () {
        mainWindow = null;
    })

    mainWindow.setIcon(normalIcon);

    // Tray icon.
    tray = new Tray(normalIcon);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Yandex.Mail window', type: 'normal', click: showHideMainWindow },
        { label: '-', type: 'separator' },
        { label: 'Exit Yandex.Mail wrapper', type: 'normal', click: quitWrapper }
    ]);
    tray.setTitle('Yandex.Mail');
    tray.setToolTip('Yandex.Mail');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        showHideMainWindow(null, mainWindow, null);
    });

    mainWindow.Notification = function (title, options) {
        options.icon = unreadIcon;
        notification = new Notification(title, options);
        checkForUnreads();
    };
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        quitWrapper();
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

ipc.on("has-unread", function () {
    mainWindow.setIcon(unreadIcon);
    tray.setImage(unreadIcon);
});

ipc.on("has-no-unread", function () {
    mainWindow.setIcon(normalIcon);
    tray.setImage(normalIcon);
})

function showHideMainWindow() {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
}

function quitWrapper() {
    app.quit();
}