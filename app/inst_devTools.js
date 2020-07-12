'use strict';

// Initialises Devtron for debugging purposes.
// Allows a glimpse at IPC calls and require graphs etc.

// Very useful...
// IF Devtron worked.

// Do not call this export function, otherwise you'll get a thrown promise.
module.exports.installDevTools = function() {
    console.log("[DEV_TOOLS] Installing Devtron...")
    const devtron = require('devtron');

    devtron.install();

    console.log("[DEV_TOOLS] Devtron installed.")
}