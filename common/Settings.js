'use strict'

// Load libraries.

const fs = require('fs');
const path = require("path");

// Set up defaults for configuration file.

const DefaultConfiguration = {
    username: "Anonymous",
    serverIP: "https://chat.i386.tech",
    bio: "I am a i386chat user.",
    baseCss: "body{display:block;overflow:hidden;margin:0;padding:0}.msger-inputarea{display:flex;padding:10px;border-top:var(--border)}.msger-inputarea *{padding:10px;border:0;border-radius:3px;font-size:1em}.msger-input{flex:1}.msger-send-btn{margin-left:10px;cursor:pointer;transition:background .23s}.msger-chat{flex:1;overflow-y:scroll;overflow-x:hidden;padding:10px;display:inline-block;width:100%;max-width:calc(100% - 24px)}.msger{display:flex;flex-flow:column wrap;justify-content:space-between;width:100%;max-width:calc(100% - 28px);margin:10px;height:100%;max-height:calc(100% - 32px);position:absolute;top:0;left:0;line-height:22px}.bg_blur{background:rgba(0,0,0,.7);bottom:0;left:0;position:fixed;right:0;top:0;z-index:1111111111}.alert-box{height:100px;width:500px;position:absolute;top:0;bottom:0;left:0;right:0;display:-webkit-box;display:flex;margin:auto;text-align:center;overflow:hidden;-webkit-box-shadow:0 0 20px 5px rgba(21,21,21,.74);box-shadow:0 0 20px 5px rgba(21,21,21,.74);background:red;border-radius:4px;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}.alert_center{position:absolute;top:25%;font-size:16px;bottom:0;left:0;right:0;margin:auto}.alert_centerbutton{position:absolute;top:50%;bottom:0;left:0;right:0;margin:auto;width:100px;height:25px}::-webkit-scrollbar{width:10px}li{list-style-type:none;list-style:none}",
    mainCss: "body{background:#36393f;font-family:'Roboto',sans-serif}.msger-inputarea{background:#525760}.msger-input{background:#40444b;color:#fff}.msger-send-btn{background:#6a707c;color:#fff;font-weight:bold}.msger-send-btn:hover{background:#7e8591}.msger-chat{background:#494d55;color:#fff}.msger{background:#494d55;border:3px solid #494d55;border-radius:5px;box-shadow:0 15px 15px -5px rgba(0,0,0,0.2)}.mentioned{color:#f5cb42}.private-message{color:#f5cb42}.alert-box{color:#fff}::-webkit-scrollbar-track{background:#333;border-radius:10px}::-webkit-scrollbar-thumb{background:#252220;border-radius:10px}::-webkit-scrollbar-thumb:hover{background:#252220}" // TODO: Fix that shoddy indentation.
};

module.exports.read = function( FileName ) {
    // Make sure the filename gets set to something if it wasn't declared.
    FileName = FileName || "i386chat_config.json";

    console.log('[SETTINGS] Reading configuration from file "' + FileName + '"...')
    let configDir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
    if (fs.existsSync(path.join(configDir, "/" + FileName))) {
        console.log('[SETTINGS] Configuration file "' + FileName + '" exists. Returning.')
        return require(path.join(configDir, "/" + FileName))
    } else {
        console.log('[SETTINGS] Configuration file "' + FileName + '" does NOT exist. Creating configuration based off DefaultConfiguration and returning.')
        fs.writeFileSync(path.join(configDir, "/" + FileName), JSON.stringify(DefaultConfiguration))
        return DefaultConfiguration;
    }
    
}

module.exports.changeProperty = function ( property, value, FileName ) {
    // Make sure the filename gets set to something if it wasn't declared.
    FileName = FileName || "i386chat_config.json";

    console.log('[SETTINGS] Changing property "' + property + '" in configuration file "' + FileName + '"...')
    let configDir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
    if (fs.existsSync(path.join(configDir, "/" + FileName))) {
        console.log('[SETTINGS] Configuration file "' + FileName + '" exists. Making changes.')
        var CurrentConfig = require(path.join(configDir, "/" + FileName));
        CurrentConfig[property] = value;
        console.log('[SETTINGS] Saving changes made to "' + FileName + '".')
        fs.writeFileSync(path.join(configDir, "/" + FileName), JSON.stringify(CurrentConfig))
    } else {
        console.log('[SETTINGS] Configuration file "' + FileName + '" does not exist. Cannot make changes - returning.');
        return false;
    }
}
