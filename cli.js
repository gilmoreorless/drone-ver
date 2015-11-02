#!/usr/bin/env node

var droneVer = require('./');
var fs = require('fs');
var path = require('path');
var prompt = require('prompt');
// var GitHubApi = require('github');

/**
 * TODO:
 *
 * - Read version from package.json (if found)
 * - Ask for input (coolness, mood)
 * - Get data from GitHub
 * - Generate version
 * - Print version, ask if it's good
 *   - If yes, save to package.json
 *   - If no, repeat
 */

var parts = {};

/// READ PACKAGE

var packagePath = path.join(process.cwd(), 'package.json');
var hasPackage = false;
var packageData;
try {
    fs.accessSync(packagePath);
    hasPackage = true;
} catch (e) {}

if (hasPackage) {
    packageData = require(packagePath);
    console.log('Found an existing package.json, checking for Drone Version...');
    if (packageData.droneVersion) {
        console.log('...found existing Drone Version:', packageData.droneVersion);
        parts = droneVer.parse(packageData.droneVersion);
    } else {
        console.log('...no Drone Version found');
    }
}

/// GENERATE DATA

prompt.message = '';
prompt.delimiter = '';

prompt.start();

var promptConfig = {
    properties: {
        major: {
            description: '  How many cool features did you add?'.green.bold,
            type: 'number'
        },
        mood: {
            description: '  Describe your current mood in one word:'.green.bold,
            type: 'string'
        }
    }
};

console.log('You need to provide some information to create a proper Drone Version...');

prompt.get(promptConfig, function (err, result) {
    if (err) {
        console.log(''); // Force a new line
        process.exit(1);
    }
    if (result.major) {
        parts.major = result.major;
    }
    if (result.mood) {
        parts.mood = result.mood;
    }
    var version = droneVer.create(parts);
    console.log('Drone Version: ' + version);

    prompt.get(['Save?'], function (err, result) {
        if (result && result['Save?'].toLowerCase() === 'y') {
            packageData.droneVersion = version.toString();
            fs.writeFile(packagePath, JSON.stringify(packageData, null, 2));
        }
    });
});
