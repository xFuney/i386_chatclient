// I'm gonna kill myself for doing this, probably
'use strict';

// Chat Client Entry Point
// Funey 2020

// Load all required libraries
const { app, BrowserWindow, Tray, Menu  } = require('electron')
const ipc = require('electron').ipcMain;

const io = require('socket.io-client')

// Initialise globals.
var tray;
var nickname;

// Client-side command database.
    // Initialise functions for commands.
    var commands = [
        {
            "command": "help",
            "execute": function(args, chatWindow) {
                var SendThis = 'i386 Chat Commands: '

                var i;
                for ( i = 0; i < commands.length; i++ ) {
                    SendThis += '//' + commands[i]["command"]
                    if ( i < commands.length - 1 ) {
                        SendThis += ', '
                    } 
                }
    
                chatWindow.webContents.send('command-output', SendThis)
    
            }
        },
        {
            "command": "autoscroll-on",
            "execute": function (args, chatWindow) {
                chatWindow.webContents.send('change-autoscroll-state', true)
            }
        },
        {
            "command": "autoscroll-off",
            "execute": function (args, chatWindow) {
                chatWindow.webContents.send('change-autoscroll-state', false)
            }
        },
        {
            "command": "whisper",
            "execute": function(args, chatWindow, socket) {
                if (!args[1]) return chatWindow.webContents.send('command-output', "Usage: //whisper <id (click on a username to get it!)> <message>");
                if (!args[2]) return chatWindow.webContents.send('command-output', "Usage: //whisper <id (click on a username to get it!)> <message>");
                socket.emit("private_message", {
                    text: args.slice(2).join(" "),
                    author: nickname,
                    idReceiver: args[1]
                })
                chatWindow.webContents.send('command-output', 'Sent "' +  args.slice(2).join(" ") + '" to ' + args[1] + '.')
            }
        }
    ]

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
    
    function ParseAndExecuteCmd(message) {
        const ParsedMessage = message.substr(2, message.length)
        const args = ParsedMessage.split(" ")
        const command = args[0].toLowerCase();
    
        console.log(args)
        console.log(ParsedMessage)
    
        //console.log(command)
        var i;
        for ( i = 0; i < commands.length; i++ ) {
            if ( command == commands[i]["command"] ) {
                console.log("ex")
                commands[i]["execute"](args, chatWindow, socket)
            }
        }
    }

    ipc.on('execute-command', function(event, arg) { 
        ParseAndExecuteCmd(arg)
    })

    ipc.on("client_load", function(event, arg) { 
        chatWindow.webContents.send('connected', [nickname, serverIP])
    })
    
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

    socket.on('private_message', function(msg) {
        chatWindow.webContents.send('private-message', msg)
    })

    socket.on('disconnect', function() {
        chatWindow.webContents.send('connection-lost')
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
        icon: 'content\\main.ico',
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
        icon: 'content\\main.ico',
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile("./content/main.html");

    let UserHostname = "funeytest";
    let ServerIP = "https://chat.i386.tech"
    
    // Initialise server instance.
    InitialiseChat("https://chat.i386.tech", mainWindow, UserHostname);

    mainWindow.webContents.on('did-finish-load', ()=>{
        let code = `document.getElementById("nick").innerHTML = "` + UserHostname + `"; document.getElementById("serverIP").innerHTML = "` + ServerIP + `"; `;
        mainWindow.webContents.executeJavaScript(code);
    });
}
function AppReady() {
    CreateMainWindow();
}

app.whenReady().then(AppReady);