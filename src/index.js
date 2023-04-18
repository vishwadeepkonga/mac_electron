const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('path')
app.commandLine.appendSwitch('enable-features', 'DesktopCaptureApi')

let mainWindow;

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('customprotocol', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
    app.setAsDefaultProtocolClient('customprotocol')
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    const url = commandLine.pop().substring(24);
    createWindow(url);
    // dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop().substring(17)}`)

  })

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
  // Otherwise, leave the URL argument undefined.
  const url = process.argv[1] ? `${process.argv[1].substring(24)}` : undefined;
  // dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
console.log(url);
  createWindow(url);
  })
  
  app.on('open-url', (event, url) => {
    if (url === 'customprotocol://close') {
      app.quit();
    } else {
      // Handle other custom protocol URLs here
    }
  });
}

function createWindow (url) {
  // Close the existing window if it exists
  // if (mainWindow) {
  //   mainWindow.close();
  // }

  // Create the browser window.
  mainWindow = new BrowserWindow({

    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: false,
    },
    autoHideMenuBar: true
  })

  if (url) {
    mainWindow.loadURL(`http://${url}`);
    console.log(url);
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }
  mainWindow.maximize();
  // mainWindow.close()
  // mainWindow.on('closed', () => {
  //   mainWindow = null;
  // })
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Handle URL refresh here
    console.log('URL refreshed:', url)
    app.quit() // Close the app when the URL is refreshed
  })

    
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
}
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q. 
// app.on('window-all-closed', () => {
//   mainWindow.close();
// })
app.on('open-url', (event, url) => {
  const ourl=url.substring(24)
  // dialog.showErrorBox('Welcome Back', `You arrived from: ${ourl}`)
  createWindow(ourl)
})



app.on('window-all-closed', function () {
  if (process.platform !== 'darwin')     
app.quit()
})

// Handle window controls via IPC
// ipcMain.on('shell:open', () => {
//   const pageDirectory = __dirname.replace('app.asar', 'app.asar.unpacked')
//   const pagePath = path.join('file://', pageDirectory, 'index.html')
//   shell.openExternal(pagePath)
// })

app.on('before-quit', () => {
  app.exit();
});

ipcMain.on('leave-meeting', () => {
  app.quit();
})