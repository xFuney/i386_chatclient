'use strict';

// ipcMain.js
// Handles IPC for chat management and other IPC-related things.

// We still need to initialise the same things Chat Manager does, as we want to manipulate things here too.

// Initialise electron.
const { app, BrowserWindow, Tray, dialog } = require('electron');
const ipc = require('electron').ipcMain;

// Stuff for theming.
const fs = require('fs');
const uglifycss = require('uglifycss');

// Get user configuration
const GlobalSettings = require('../common/Settings');
const UserConfig = GlobalSettings.read();

// Initialise handler for commands.
const Commands = require('./chat/Commands');

// TODO: Maybe move this to an external IPC handler script(?)
module.exports.init = function (socket, ServerIP, ChatWindow, Username) {
    console.log("[CHAT_MANAGER] Initialising IPC events for client communication.")
    // TODO: Refactor every IPC call event.
    ipc.on('execute-command', function (event, arg) {
        Commands.ParseAndExecuteCmd(socket, ChatWindow, arg)
    })

    ipc.on('change-theme', function (event, arg) {
        if ( arg == "base" ) {
            // Client wants to change the base theme.
            dialog.showOpenDialog({
                properties: ['openFile']
              }).then(result => {
                if ( result.cancelled ) return;

                // Now let another function handle it.
                ChangeBaseTheme(result.filePaths[0], ChatWindow)
              }).catch(err => {
                console.log(err)
              });

        } else if ( arg == "theme" ) {
            // Client wants to change the styling theme.
            dialog.showOpenDialog({
                properties: ['openFile']
              }).then(result => {
                if ( result.cancelled ) return;

                // Now let another function handle it.
                ChangeMainTheme(result.filePaths[0], ChatWindow)
              }).catch(err => {
                console.log(err)
              });
        }
    })

    ipc.on("client_load", function (event, arg) {
        ChatWindow.webContents.send('connected', [Username, ServerIP])
    })

    ipc.on('send--message', function (event, arg) {
        socket.emit('chat_message', {
            text: arg,
            author: Username
        });
    })
    ipc.on('appQuit', function (event, arg) {
        console.log("[CHAT_MANAGER] IPC Quit event fired. Shutting down application.")

        console.log("[CHAT_MANAGER] Disconnecting socket and nullifying.")
        socket.disconnect();
        socket = null;
        console.log("[CHAT_MANAGER] Forcing application exit. Goodbye.")
        app.quit();
    })
}