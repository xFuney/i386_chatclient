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
    document.getElementById("messages").innerHTML += '<li>' + message + `</li>`;

    if (!soundSuppresed) {
        playAud("SystemMessage")
    }
}

function playAud(type) {
    if (type == "mention") {
        var audio = new Audio(SoundURL["WasMentioned"]);
        audio.play();
    } else if (type == "connected") {
        var audio = new Audio(SoundURL["SuccessfulConnection"]);
        //audio.play();
    } else if (type == "disconnected-fatal") {
        var audio = new Audio(SoundURL["ConnectionFailure"]);
        //audio.play();
    }
}

ipcRenderer.on("connection-lost", function (event, args) {
    SendSystemMessage("Connection failure. Please restart the app.", true);

    if (autoscroll) {
        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight;
    }

    playAud("disconnected-fatal");
    document.getElementById("alerts").innerHTML += `<div class="bg_blur" id="alert"><div class="alert-box"><br \><h1 class="alert_center"> Lost connection to main server - restart app. </h1><button class="alert_centerbutton" onmousedown="const { ipcRenderer, remote } = require('electron'); this.addEventListener('click', function () { ipcRenderer.send('load_relog'); remote.app.exit(); });">OK</button></div></div>`
})

ipcRenderer.on("change-autoscroll-state", function (event, args) {
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
        document.getElementById("messages").innerHTML += `<li><span onclick="SendSystemMessage('${msg.author}\\'s bio: ${msg.bio}',true)" ${msg.rainbow}>` + msg.author + `(${msg.id}) </span> >> <span class="mentioned">` + msg.text + `</span></li>`;
    } else {
        document.getElementById("messages").innerHTML += `<li><span onclick="SendSystemMessage('${msg.author}\\'s bio: ${msg.bio}',true)" ${msg.rainbow}>` + msg.author + ` (${msg.id}) </span> >> ` + msg.text + `</li>`;
    }


    if (autoscroll) {
        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight;
    }

});

ipcRenderer.on("private-message", function (event, msg) {
    playAud("mention")
    document.getElementById("messages").innerHTML += `<li onclick="SendSystemMessage('${msg.author}\\'s bio: ${msg.bio}',true)"  style="border-radius:1.2px;background-color:#d96f52;color:black;" class="private-message">` + msg.author + ` (${msg.id}) (PM) >> ` + msg.text + `</li>`;

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
ipcRenderer.on('user_join', function (event, info) {
    document.getElementById("messages").innerHTML += info.text + "<br>";

    if (autoscroll) {
        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight;
    }
});
ipcRenderer.on('connected', function (event, info) {
    SendSystemMessage('Connected successfully with nickname "' + info[0] + '".', true)
    playAud("connected");

    if (autoscroll) {
        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight;
    }
})

document.getElementById("field2").onsubmit = function (arg) {
    console.log(document.getElementById("m").value)
    arg.preventDefault()

    if (document.getElementById("m").value.startsWith("//")) {
        ipcRenderer.send('execute-command', document.getElementById("m").value);
        document.getElementById("m").value = "";
        return document.getElementById("m").focus();
    }

    // Send
    ipcRenderer.send('send--message', document.getElementById("m").value)

    document.getElementById("m").value = "";
    document.getElementById("m").focus();
}

const menu = new remote.Menu();

menu.append(new remote.MenuItem({
    label: 'File',
    submenu: [{
        label: 'About',
        click: () => alert("i386chat, written by xFuney and zer0.")
    }, {
        label: 'Quit',
        click: () => ipcRenderer.send("appQuit")
    }]
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
titlebar.updateTitle('i386chat');

// Tell IPC we're loaded.
ipcRenderer.send("client_load")
