'use strict';

// This script should be called by the Interface.
// This handles the socketing and such for sending to the Renderer process.

// Initialise electron.
const { app, BrowserWindow, Tray, dialog } = require('electron');
const ipc = require('electron').ipcMain;

// Stuff for theming.
const fs = require('fs');
const uglifycss = require('uglifycss');

// Get user configuration
const GlobalSettings = require('../../common/Settings');
const UserConfig = GlobalSettings.read();

// Initialise handler for commands.
const Commands = require('./Commands');

// Initialise handler for IPC calls (ipcMain).

const IPC = require('../ipcMain')

// Initialise socket library.
const io = require('socket.io-client')

function ChangeNickname(socket, NewNickname) {
    socket.emit("nickname_selection", NewNickname);
    console.log("[CHAT_MANAGER] Set nickname to " + NewNickname + ".");
}

function ChangeBio(socket, Bio, IsOnConnect) {
    socket.emit("bio_change", {
        onConnect: IsOnConnect,
        bio: Bio
    });

    console.log('[CHAT_MANAGER] Set bio to "' + Bio + '".');
}

function SendMessage(socket, Nickname, Message) {
    socket.emit('chat_message', {
        text: Message,
        author: Nickname
    });
}

function SendCommand(socket, Message, ChatWindow) {
    Commands.ParseAndExecuteCmd(socket, ChatWindow, Message)
}

// Handler for theme changing.
function ChangeBaseTheme( path, ChatWindow ) {
    // Changing the base theme.
    try {
        var data = fs.readFileSync(path, 'utf8');
        data = uglifycss.processString(data);
        GlobalSettings.changeProperty("baseCss", data)
        console.log("[CHAT_MANAGER] Changed base theme, reloading client.")
        ChatWindow.webContents.reload();
    } catch(e) {
        console.log('Error:', e.stack);
    }
}

function ChangeMainTheme( path, ChatWindow ) {
    // Changing the main theme.
    try {
        var data = fs.readFileSync(path, 'utf8');
        data = uglifycss.processString(data);
        GlobalSettings.changeProperty("mainCss", data);
        console.log("[CHAT_MANAGER] Changed main theme, reloading client.")
        ChatWindow.webContents.reload();
    } catch(e) {
        console.log('Error:', e.stack);
    }
}


// We need to throw every non-global variable at the IPC handler for proper initialisation...



module.exports.init = function(ServerIP, ChatWindow, Username) {
    // When this is executed, the Interface has opened the main chat page.
    // Now we can connect to the server.

    // Connects to the server passed to the function.

    console.log("[CHAT_MANAGER] Attempting socket connection to " + ServerIP + ".")
    var socket = io.connect(ServerIP, {
        reconnect: true
    });

    // Initialise IPC calls.
    IPC.init(socket, ServerIP, ChatWindow, Username);

    socket.on('connect', function () {
        // Let console know we've connected.
        console.log("[CHAT_MANAGER] Connected to " + ServerIP + " successfully.");
        // Set nickname upon connection, otherwise we're view-only.
        ChangeNickname(socket, Username);

        // Set bio.
        ChangeBio(socket, UserConfig.bio, true);

        // Code for zer0's "rainbow name". Not usually provided by your average client.
        if (UserConfig.rainbow) socket.emit("rainbow_name_code", UserConfig.rainbow);
    })

    // TODO: Refactor EVERY socket handler.
    socket.on('chat_message', function (msg) {
        //console.log(msg.author + " >> " + msg.text);
        //if (ignored.includes("" + msg.id)) return console.log("Author is in ignored list.");
        ChatWindow.webContents.send('message', msg)
    })
    socket.on("command_output", function (msg) {
        ChatWindow.webContents.send('command-output', msg)
    })
    socket.on("user_join", function (msg) {
        ChatWindow.webContents.send('user_join', msg)
    })
    socket.on('private_message', function (msg) {
        //if (ignored.includes("" + msg.id)) return console.log("Author is in ignored list.");
        ChatWindow.webContents.send('private-message', msg)
    })

    socket.on('disconnect', function () {
        ChatWindow.webContents.send('connection-lost')
    })
}


