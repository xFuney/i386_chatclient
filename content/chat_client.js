// Chat Client Controlling JS
// Woot.

var ipcRenderer = require("electron").ipcRenderer;
var remote = require("electron").remote;

var SoundURL = {
    "WasMentioned": "https://i386.tech/juntos.mp3",
    "SuccessfulConnection": "OpenSFX.wav",
    "ConnectionFailure": "FailSFX.wav"
}

function playAud(type) {
    if ( type == "mention" ) {
        var audio = new Audio(SoundURL["WasMentioned"]);
        audio.play();
    }
}

ipcRenderer.on("message", function (event, msg) {
    if (msg.text.includes(`[` + document.getElementById("nick").innerHTML + `]`)) {
        playAud("mention")
        document.getElementById("messages").innerHTML += '<h3 class="mentioned">' + msg.author + " >> " + msg.text + `</h3>`;
    } else {
        document.getElementById("messages").innerHTML += '<h3>' + msg.author + " >> " + msg.text + `</h3>`;
    }

    
});

document.getElementById("inputarea").onsubmit = function(arg) {
    console.log(document.getElementById("user_input").value)
    arg.preventDefault()

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

// Mention stuff
