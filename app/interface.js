'use strict';

// This is the part that actually handles the interface.
// The loader process should have done everything it needed to, and now we can start to show stuff to the user.

// Electron initialisation.
const { app, BrowserWindow, Tray } = require('electron');
const ipc = require('electron').ipcMain;

// Get user configuration
const GlobalSettings = require('../common/Settings');
const UserConfig = GlobalSettings.read()

// Stuff for initialising development tools.
const DevTools = require('./inst_devTools')

// File system manipulation.
const fs = require('fs');
const path = require("path");

// Chat Management is handled elsewhere.
const ChatManager = require('./chat/ChatManager')

// Initialise functions for displaying things to user.

function CreateMainWindow() {
    console.log("[INTERFACE] Creating main window.")
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        titleBarStyle: 'hidden',
        //icon: require("path").join(__dirname, '/content/main.ico'),
        webPreferences: {
            nodeIntegration: true
        }
    });

    const CurrentConfig = GlobalSettings.read();
    mainWindow.setBackgroundColor('#36393F')

    console.log("[INTERFACE] Loading client display (you should now see the UI).")
    mainWindow.loadFile("./app/rendererProc/main_client.html");

    // Install Developer Tools

    // TODO: Find alternative to Devtron OR fix Devtron source.
    //DevTools.installDevTools();

    // Load up some local variables for easier management.
    let UserHostname = CurrentConfig.username;
    let ServerIP = CurrentConfig.serverIP;

    // Initialise server instance.
    ChatManager.init(ServerIP, mainWindow, UserHostname)

    mainWindow.webContents.on('did-finish-load', () => {
        console.log("[INTERFACE] Window finished load. Injecting theming/configuration JS.")
        let code = `
        function addStyle(styleString) {
            const style = document.createElement('style');
            style.textContent = styleString;
            document.head.append(style);
        }

        // This initialises nickname and server IP variables in the Renderer.
        document.getElementById("nick").innerHTML = "` + UserHostname + `"; 
        document.getElementById("serverIP").innerHTML = "` + ServerIP + `"; 

        // Now we initialise the STYLESHEETING
        addStyle("` + CurrentConfig.baseCss + `");
        addStyle("` + CurrentConfig.mainCss + `");
        `;
        mainWindow.webContents.executeJavaScript(code);
    });
}

// Function to run when the application is declared "ready" by Electron.
function AppReady() {
    console.log("[INTERFACE] Electron application is now ready.")
    CreateMainWindow();
}

// Add a handler to Electron's readiness event.
app.whenReady().then(AppReady);