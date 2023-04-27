const { app, BrowserWindow } = require('electron')
require("dotenv").config();


const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false
    })

    win.loadFile('main.html')
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
