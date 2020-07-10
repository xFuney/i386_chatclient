// I'm gonna kill myself for doing this, probably
'use strict';

// Chat Client Entry Point
// Funey 2020

// Load all required libraries
const { app, BrowserWindow, Tray, Menu  } = require('electron')

const io = require('socket.io-client')
const ipc = require('electron').ipcMain

// Initialise globals.
var tray;
var nickname;

// Initialise browser window functions

// Tray Icon Initialisation

function InitialiseTray() {
    tray = new Tray('./content/tray.ico')

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Item1', type: 'radio' },
      { label: 'Item2', type: 'radio' },
      { label: 'Item3', type: 'radio', checked: true },
      { label: 'Item4', type: 'radio' }
    ])
    tray.setToolTip('i386 Chat Client')
    tray.setContextMenu(contextMenu)
}

function InitialiseChat(serverIP, chatWindow, nickname) {


    // Initialise socket connection.
    var socket = io.connect(serverIP, {reconnect: true});

    socket.on('connect', function() {
        console.log("Successfully connected.");
        socket.emit("nickname_selection", nickname);
    })

    socket.on('chat_message', function(msg) {
        console.log(msg.author + " >> " + msg.text);
        chatWindow.webContents.send('message', msg)
    })

    ipc.on('send--message', function(event, arg) { 
        socket.emit('chat_message', {
            text: arg,
            author: nickname
        });
    })

}

// Login window (shown before main window)
function CreateLoginWindow() {
    const loginWindow = new BrowserWindow({
        width: 300,
        height: 350,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    loginWindow.loadFile("./content/login.html");
    InitialiseTray();
}

// Main window (chat client loaded, with user.)
function CreateMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile("./content/main.html");

    let UserHostname = "funeytest";
    // Initialise server instance.
    InitialiseChat("https://chat.i386.tech", mainWindow, UserHostname);

    mainWindow.webContents.on('did-finish-load', ()=>{
        
        let ServerIP = "https://chat.i386.tech"
        let code = `document.getElementById("nick").innerHTML = "` + UserHostname + `"; document.getElementById("serverIP").innerHTML = "` + ServerIP + `"; `;
        mainWindow.webContents.executeJavaScript(code);
    });
}
function AppReady() {
    CreateMainWindow();
}

app.whenReady().then(AppReady);