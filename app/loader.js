'use strict';

// This part of the program initiates everything necessary for other parts of the program to function.
// Think of this as what runs before anything is displayed to the user.

const { app, Menu } = require('electron');
const releaseInformation = require("./releaseInfo")

// Display versioning information to log.
console.log("i386ChatClient " + releaseInformation.version);
console.log("On release branch: " + releaseInformation.branch);

// Get application-wide constants.
const AppConstants = require('../common/AppConstants');
const { platform } = require('custom-electron-titlebar/lib/common/platform');

// Initialise and get user settings.
const UserSettings = require('../common/Settings').read();

if ( process.platform == 'win32' ) {
    // Windows can be a bit dodgy with icons and stuff.
    // This (apparently) fixes it.

    console.log("[LOADER] Win32 platform detected, setting App User Model ID.")
    app.setAppUserModelId(AppConstants.Global_AppID)
}

// On most clients, you'd usually find some stuff about automatic updating.
// This client isn't about that, get it yourself or build from source.
// We won't stop you.

require('./interface')