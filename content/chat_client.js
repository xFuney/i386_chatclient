// Chat Client Controlling JS
// Woot.

var remote = require("electron").remote;
var ipcRenderer = require("electron").ipcRenderer;

var autoscroll = true;

var SoundURL = {
    "WasMentioned": "https://i386.tech/juntos.mp3",
    "SuccessfulConnection": "./OpenSFX.wav",
    "ConnectionFailure": "./FailSFX.wav"
}

function SendSystemMessage(message, soundSuppresed) {
    document.getElementById("messages").innerHTML += '<h3 class="sys_msg">' + message + `</h3>`;

    if (!soundSuppresed) {
        playAud("SystemMessage")
    }
}

function playAud(type) {
    if ( type == "mention" ) {
        var audio = new Audio(SoundURL["WasMentioned"]);
        audio.play();
    } else if ( type == "connected" ) {
        var audio = new Audio(SoundURL["SuccessfulConnection"]);
        audio.play();
    } else if ( type == "disconnected-fatal" ) {
        var audio = new Audio(SoundURL["ConnectionFailure"]);
        audio.play();
    }
}

ipcRenderer.on("connection-lost", function(event, args) {
    SendSystemMessage("Connection failure. Please restart the app.", true);

    if (autoscroll) {
        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight;
    }

    playAud("disconnected-fatal");
    document.getElementById("alerts").innerHTML += `<div class="bg_blur" id="alert"><div class="alert-box"><br \><h1 class="alert_center"> Lost connection to main server - restart app. </h1><button class="alert_centerbutton" onmousedown="const { ipcRenderer, remote } = require('electron'); this.addEventListener('click', function () { ipcRenderer.send('load_relog'); remote.app.exit(); });">OK</button></div></div>`
})

ipcRenderer.on("change-autoscroll-state", function(event, args) {
    autoscroll = args
    if (args) {
        SendSystemMessage("Auto-scrolling has been ENABLED!", true);
    } else {
        SendSystemMessage("Auto-scrolling has been DISABLED!", true);
    }
})

ipcRenderer.on("message", function (event, msg) {
    if (msg.text.includes(`[` + document.getElementById("nick").innerHTML + `]`)) {
        playAud("mention")
        document.getElementById("messages").innerHTML += '<h3 class="mentioned">' + msg.author + " >> " + msg.text + `</h3>`;
    } else {
        document.getElementById("messages").innerHTML += '<h3>' + msg.author + " >> " + msg.text + `</h3>`;
    }

    
    if (autoscroll) {
        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight;
    }
    
});

ipcRenderer.on("private-message", function (event, msg) {
    playAud("mention")
    document.getElementById("messages").innerHTML += '<h3 class="private-message">' + msg.author + " (PM) >> " + msg.text + `</h3>`;

    if (autoscroll) {
        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight;
    }
    
});

ipcRenderer.on("command-output", function (event, msg) {
    SendSystemMessage(msg, true)

    if (autoscroll) {
        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight;
    }
});

ipcRenderer.on('connected', function(event, info) {
    SendSystemMessage('Connected successfully with nickname "' + info[0] + '".', true)
    playAud("connected");

    if (autoscroll) {
        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight;
    }
})

document.getElementById("inputarea").onsubmit = function(arg) {
    console.log(document.getElementById("user_input").value)
    arg.preventDefault()

    if (document.getElementById("user_input").value.startsWith("//")) {
        ipcRenderer.send('execute-command', document.getElementById("user_input").value);
        document.getElementById("user_input").value = "";
        return document.getElementById("user_input").focus();
    }

    // Send
    ipcRenderer.send('send--message', document.getElementById("user_input").value)

    document.getElementById("user_input").value = "";
    document.getElementById("user_input").focus();
}

const menu = new remote.Menu();

menu.append(new remote.MenuItem({
    label: 'Help',
    submenu: [
        {
            label: 'DevTools',
            click: () => remote.getCurrentWindow().toggleDevTools()
        },

        {
            type: 'separator'
        },
        {
            label: 'About',
            click: () => alert("i386.tech Chat Server Program\nBy Funey, 2020.\n\nThanks to zer0 for making this possible.")
        },
    ]
}));


const customTitlebar = require('custom-electron-titlebar');
// 2. Create the custom titlebar with your own settings
//    To make it work, we just need to provide the backgroundColor property
//    Other properties are optional.
let titlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#202225')
});

titlebar.updateMenu(menu);
// 3. Update Titlebar text
titlebar.updateTitle('i386.tech Chat Server');

// Tell IPC we're loaded.
ipcRenderer.send("client_load")


