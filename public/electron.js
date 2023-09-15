const { app, BrowserWindow } = require('electron')
const path = require('path')
require("dotenv").config();


const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    if (process.env.mode === 'dev') {
        win.loadURL('http://localhost:3000')
    } else {
        win.loadURL(
            `${path.join(__dirname, '../build/index.html')}`
        )
        win.loadFile(
            `${path.join(__dirname, '../build/index.html')}`
        )
    }
    if(process.env.NODE_ENV == "development") win.webContents.openDevTools()

}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', ()=> {
    if(process.platform != 'darwin') app.quit()
})
