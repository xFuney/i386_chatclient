ed:// I'm gonna kill myself for doing this, probably
'use strict';

// Chat Client Entry Point
// Funey and i386sh/zer0 2020

// Load all required libraries
const {
    app,
    BrowserWindow,
    Tray,
    Menu
} = require('electron')

const ipc = require('electron').ipcMain;
const fs = require('fs');
const path = require("path");
const io = require('socket.io-client')

// Initialise globals.
var tray;
var nickname;
let config = {
    username: "Anonymous",
    serverIP: "https://chat.i386.tech",
    bio: "I am a i386chat user."
};
const ignored = [];

let configDir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
if (fs.existsSync(path.join(configDir, "/i386chat_config.json"))) {
    config = require(path.join(configDir, "/i386chat_config.json"))
} else {
    fs.writeFileSync(path.join(configDir, "/i386chat_config.json"), JSON.stringify(config))
}

function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele != value;
    });
}

// Client-side command database.
// Initialise functions for commands.
var commands = [{
        "command": "help",
        "execute": function (args, chatWindow) {
            var SendThis = 'i386chat has: '

            var i;
            for (i = 0; i < commands.length; i++) {
                SendThis += '//' + commands[i]["command"]
                if (i < commands.length - 1) {
                    SendThis += ', '
                }
            }

            chatWindow.webContents.send('command-output', SendThis)

        }
    },
    {
        "command": "as-on",
        "execute": function (args, chatWindow) {
            chatWindow.webContents.send('change-autoscroll-state', true)
        }
    },
    {
        "command": "as-off",
        "execute": function (args, chatWindow) {
            chatWindow.webContents.send('change-autoscroll-state', false)
        }
    },
    {
        "command": "whisper",
        "execute": function (args, chatWindow, socket) {
            if (!args[1]) return chatWindow.webContents.send('command-output', "Usage: //whisper <id (click on a username to get it!)> <message>");
            if (!args[2]) return chatWindow.webContents.send('command-output', "Usage: //whisper <id (click on a username to get it!)> <message>");
            socket.emit("private_message", {
                text: args.slice(2).join(" "),
                author: nickname,
                idReceiver: args[1]
            })
            chatWindow.webContents.send('command-output', 'Sent "' + args.slice(2).join(" ") + '" to ' + args[1] + '.')
        }
    },
    {
        "command": "rainbow",
        "execute": function (args, chatWindow, socket) {
            socket.emit("rainbow_name_code", args[1] || " ");
        }
    },
    {
        "command": "online",
        "execute": function (args, chatWindow, socket) {
            socket.emit("get_online_users");
        }
    },
    {
        "command": "nick",
        "execute": function (args, chatWindow, socket) {
            if (!args[1]) return chatWindow.webContents.send('command-output', "No nickname set.")
            config["username"] = args.slice(1).join(" ");
            fs.writeFileSync(path.join(configDir, "/i386chat_config.json"), JSON.stringify(config))
            chatWindow.webContents.send('command-output', "Nickname changed, you'll have to restart i386chat.")
        }
    },
    {
        "command": "bio",
        "execute": function (args, chatWindow, socket) {
            if (!args[1]) return chatWindow.webContents.send('command-output', "No bio set.")
            if (args.slice(1).join(" ").length > 125) return chatWindow.webContents.send('command-output', "Bio limit is 125 characters.")
            config["bio"] = args.slice(1).join(" ");
            socket.emit("bio_change", {
                onConnect: false,
                bio: args.slice(1).join(" ")
            })
            fs.writeFileSync(path.join(configDir, "/i386chat_config.json"), JSON.stringify(config))
        }
    },
    {
        "command": "ignore",
        "execute": function (args, chatWindow, socket) {
            if (!args[1]) return chatWindow.webContents.send('command-output', "Usage: //ignore <id>")

            if (ignored.includes(""+args.join(" "))) {
                ignored = arrayRemove(ignored, args.slice(1).join(" "));
                chatWindow.webContents.send('command-output',
                    "Removed " + args.slice(1).join(" ") + " from the ignored list.");
            } else {
                ignored.push(args.slice(1).join(" "));

                chatWindow.webContents.send('command-output',
                    `Added ${args.slice(1).join(" ")} to the ignore list.`);
            }
        }
    }
]

// Initialise browser window functions

// Tray Icon Initialisation

function InitialiseTray() {
    tray = new Tray('./content/tray.ico')

    const contextMenu = Menu.buildFromTemplate([{
            label: 'Item1',
            type: 'radio'
        },
        {
            label: 'Item2',
            type: 'radio'
        },
        {
            label: 'Item3',
            type: 'radio',
            checked: true
        },
        {
            label: 'Item4',
            type: 'radio'
        }
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
        for (i = 0; i < commands.length; i++) {
            if (command == commands[i]["command"]) {
                console.log("executed")
                commands[i]["execute"](args, chatWindow, socket)
            }
        }
    }

    ipc.on('execute-command', function (event, arg) {
        ParseAndExecuteCmd(arg)
    })
    ipc.on("client_load", function (event, arg) {
        chatWindow.webContents.send('connected', [nickname, serverIP])
    })

    // Initialise socket connection.
    var socket = io.connect(serverIP, {
        reconnect: true
    });

    socket.on('connect', function () {
        console.log("Successfully connected.");
        socket.emit("nickname_selection", nickname);
        socket.emit("bio_change", {
            onConnect: true,
            bio: config.bio
        })
        if (config.rainbow) socket.emit("rainbow_name_code", config.rainbow);
    })

    socket.on('chat_message', function (msg) {

        console.log(msg.author + " >> " + msg.text);
        if (ignored.includes("" + msg.id)) return console.log("Author is in ignored list.");
        chatWindow.webContents.send('message', msg)
    })
    socket.on("command_output", function (msg) {
        chatWindow.webContents.send('command-output', msg)
    })
    socket.on("user_join", function (msg) {
        chatWindow.webContents.send('user_join', msg)
    })
    socket.on('private_message', function (msg) {
        if (ignored.includes("" + msg.id)) return console.log("Author is in ignored list.");
        chatWindow.webContents.send('private-message', msg)
    })

    socket.on('disconnect', function () {
        chatWindow.webContents.send('connection-lost')
    })

    ipc.on('send--message', function (event, arg) {
        socket.emit('chat_message', {
            text: arg,
            author: nickname
        });
    })
    ipc.on('appQuit', function (event, arg) {
        socket.disconnect();
        socket = null;
        app.quit();
    })
}

// Login window (shown before main window)
function CreateLoginWindow() {
    const loginWindow = new BrowserWindow({
        width: 300,
        height: 350,
        frame: false,
        resizable: false,
        titleBarStyle: 'hidden',
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
        titleBarStyle: 'hidden',
        //icon: require("path").join(__dirname, '/content/main.ico'),
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile("./content/main.html");

    let UserHostname = config.username;
    let ServerIP = config.serverIP;

    // Initialise server instance.
    InitialiseChat(config.serverIP, mainWindow, UserHostname);

    mainWindow.webContents.on('did-finish-load', () => {
        let code = `document.getElementById("nick").innerHTML = "` + UserHostname + `"; document.getElementById("serverIP").innerHTML = "` + ServerIP + `"; `;
        mainWindow.webContents.executeJavaScript(code);
    });
}

function AppReady() {
    CreateMainWindow();
}

app.whenReady().then(AppReady);
