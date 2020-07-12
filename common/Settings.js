'use strict'

// Load libraries.

const fs = require('fs');
const path = require("path");

// Set up defaults for configuration file.

const DefaultConfiguration = {
    username: "Anonymous",
    serverIP: "https://chat.i386.tech",
    bio: "I am a i386chat user.",
    baseCss: "@webkit-keyframes rainbowk{100%,0%{color:red}8%{color:#ff7f00}16%{color:#ff0}25%{color:#7fff00}33%{color:#0f0}41%{color:#00ff7f}50%{color:#0ff}58%{color:#007fff}66%{color:#00f}75%{color:#7f00ff}83%{color:#f0f}91%{color:#ff007f}}@ms-keyframes rainbowk{100%,0{color:red}8%{color:#ff7f00}16%{color:#ff0}25%{color:#7fff00}33%{color:#0f0}41%{color:#00ff7f}50%{color:#0ff}58%{color:#007fff}66%{color:#00f}75%{color:#7f00ff}83%{color:#f0f}91%{color:#ff007f}}.mentioned{border-radius:1.2px;background-color:#f5cb42;color:black}@keyframes rainbowk{100%,0%{color:red}8%{color:#ff7f00}16%{color:#ff0}25%{color:#7fff00}33%{color:#0f0}41%{color:#00ff7f}50%{color:#0ff}58%{color:#007fff}66%{color:#00f}75%{color:#7f00ff}83%{color:#f0f}91%{color:#ff007f}}.rainbow{-webkit-animation:rainbowk 5s infinite;-ms-animation:rainbowk 5s infinite;animation:rainbowk 5s infinite}strong{color:white}body{display:block;overflow:hidden;margin:0;padding:0;background-color:black}*{background-color:black}.msger-chat{flex:1;overflow-y:scroll;overflow-x:hidden;padding:10px;display:inline-block;width:100%;max-width:calc(100% - 24px);background-color:black;margin-bottom:15px}.msger{display:flex;flex-flow:column wrap;justify-content:space-between;width:100%;max-width:calc(100% - 28px);height:100%;max-height:calc(100% - 32px);position:absolute;top:0;left:0;background-color:black;line-height:22px}form{background:#000;padding:3px;position:fixed;bottom:0;width:100%}.c{width:100%}.bg_blur{background:rgba(0,0,0,.7);bottom:0;left:0;position:fixed;right:0;top:0;z-index:1111111111}.alert-box{height:100px;width:500px;position:absolute;top:0;bottom:0;left:0;right:0;display:-webkit-box;display:flex;margin:auto;text-align:center;overflow:hidden;-webkit-box-shadow:0 0 20px 5px rgba(21,21,21,.74);box-shadow:0 0 20px 5px rgba(21,21,21,.74);background:red;border-radius:4px;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}.alert_center{position:absolute;top:25%;font-size:16px;bottom:0;left:0;right:0;margin:auto}.alert_centerbutton{position:absolute;top:50%;bottom:0;left:0;right:0;margin:auto;width:100px;height:25px}::-webkit-scrollbar{width:0}",
    mainCss: "/* this is a thing */"
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