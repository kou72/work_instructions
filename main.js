const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let win = null;

/*
テストを試す時は下のコードをコメントアウトする(自動リロード対応)
*/
require("electron-reload")(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`),
});

function createWindow() {
  if (win) return;
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true },
  });
  win.loadURL("file://" + __dirname + "/index.html");
  //developer tool build
  win.webContents.openDevTools();
  win.on("closed", function () {
    win = null;
  });
}

app.on("ready", createWindow);
app.on("activate", createWindow);
