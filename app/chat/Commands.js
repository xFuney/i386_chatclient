'use strict';

// This script is usually called by the ChatManager, we handle commands here.
// Nothing else should really call this, as there'd be no point.

// Get user configuration
const GlobalSettings = require('../../common/Settings');
const UserConfig = GlobalSettings.read();

// Initialise command construct.

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
            author: UserConfig.username,
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
        GlobalSettings.changeProperty("username", args.slice(1).join(" "))
        chatWindow.webContents.send('command-output', "Nickname changed, you'll have to restart i386chat.")
    }
},
{
    "command": "bio",
    "execute": function (args, chatWindow, socket) {
        if (!args[1]) return chatWindow.webContents.send('command-output', "No bio set.")
        if (args.slice(1).join(" ").length > 125) return chatWindow.webContents.send('command-output', "Bio limit is 125 characters.")
        socket.emit("bio_change", {
            onConnect: false,
            bio: args.slice(1).join(" ")
        })
        GlobalSettings.changeProperty("bio", args.slice(1).join(" "))
    }
},
{
    "command": "ignore",
    "execute": function (args, chatWindow, socket) {
        if (!args[1]) return chatWindow.webContents.send('command-output', "Usage: //ignore <id>")

        return chatWindow.webContents.send('command-output', 'Command not currently implemented. Sorry.')

        if (ignored.includes(""+args.slice(1).join(" "))) {
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

module.exports.ParseAndExecuteCmd = function (socket, ActiveWindow, message) {
    console.log("[COMMAND] Command parsing called.")
    const ParsedMessage = message.substr(2, message.length)
    const args = ParsedMessage.split(" ")
    const command = args[0].toLowerCase();

    //console.log(command)
    var i;
    for (i = 0; i < commands.length; i++) {
        if (command == commands[i]["command"]) {
            console.log("[COMMAND] Command " + command + " found in command listing. Executing...");
            commands[i]["execute"](args, ActiveWindow, socket)
        }
    }
}
