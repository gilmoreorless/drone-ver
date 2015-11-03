#!/usr/bin/env node

var droneVer = require('./');
var fs = require('fs');
var path = require('path');
var prompt = require('prompt');
var parseGithubUrl = require('parse-github-repo-url');
var GithubApi = require('github');

/**
 * TODO:
 *
 * - Read version from package.json (if found)
 * - Ask for input (coolness, mood)
 * - Get data from GitHub
 * - Generate version
 *   - If unliked, re-generate dictionary word
 * - Print version, ask if it's good
 *   - If yes, save to package.json
 *   - If no, repeat
 */

/***** USEFUL INFORMATION *****/

// Storage for the parts of a Drone Version
var versionData = {};
// Generated Drone Version
var generatedVersion;
// File path to package.json
var packagePath = path.join(process.cwd(), 'package.json');
// Boolean: Whether the cwd has a package.json
var hasPackage = false;
// package.json data
var packageData;
// GitHub repo details for cwd project (can be false)
var githubDetails = false;


/***** READ PACKAGE DATA *****/

function getPackageData() {
    try {
        fs.accessSync(packagePath);
        hasPackage = true;
    } catch (e) {}

    if (hasPackage) {
        packageData = require(packagePath);
        console.log('Found an existing package.json, checking for Drone Version...');
        if (packageData.droneVersion) {
            console.log('...found Drone Version:', packageData.droneVersion.bold);
            versionData = droneVer.parse(packageData.droneVersion);
        } else {
            console.log('...no Drone Version found');
        }
    }
}


/***** GET INPUT DATA (major, mood) *****/

var promptConfigInputData = {
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

function askForInput() {
    console.log('\nYou need to provide some information to create a proper Drone Version...\n');
    prompt.get(promptConfigInputData, gotInputData);
}

function gotInputData(err, result) {
    if (err) {
        console.log(''); // Force a new line
        process.exit(1);
    }
    if (result.major) {
        versionData.major = (versionData.major || 0) + result.major;
    }
    if (result.mood) {
        versionData.mood = result.mood;
    }
    findGithubDetails();
}


/***** GET GITHUB PROJECT DETAILS *****/

function findGithubDetails() {
    if (packageData.repository && packageData.repository.type === 'git') {
        var gitUrl = packageData.repository.url;
        githubDetails = parseGithubUrl(gitUrl);
        if (githubDetails) {
            console.log('\nFound GitHub repository URL. Fetching details...');
            fetchGithubData();
        }
    }
    if (!githubDetails) {
        generateDroneVersion();
    }
}

function fetchGithubData() {
    var githubClient = new GithubApi({
        version: '3.0.0',
        protocol: 'https',
        headers: {
            'user-agent': 'drone-ver-cli'
        }
    });

    githubClient.repos.get({
        user: githubDetails[0],
        repo: githubDetails[1],
    }, gotGithubData);
}

function gotGithubData(err, result) {
    if (err) {
        console.log('Got an error from GitHub. Pretending nothing happened.');
        generateDroneVersion();
        return;
    }
    var issuesCount = versionData.issues || 0;
    var socialCount = versionData.social || 0;
    if (result.hasOwnProperty('open_issues_count')) {
        issuesCount = result.open_issues_count;
    }
    if (result.hasOwnProperty('stargazers_count') && result.hasOwnProperty('forks_count')) {
        socialCount = result.stargazers_count + result.forks_count;
    }
    versionData.issues = issuesCount;
    versionData.social = socialCount;
    generateDroneVersion();
}



/***** GENERATE VERSION *****/

function generateDroneVersion() {
    // Make sure we get a new version
    delete versionData.dictionary;
    delete versionData.unixtime;
    // Do the magic
    generatedVersion = droneVer.create(versionData);
    console.log('\nDrone Version: ' + generatedVersion.toString().bold);
    askToSave();
}


/***** WRITE PACKAGE DATA *****/

var promptConfigSavePackage = {
    properties: {
        save: {
            description: '  Save this version to package.json? [y/N] '.green.bold,
            type: 'string'
        }
    }
};

function askToSave() {
    if (hasPackage) {
        prompt.get(promptConfigSavePackage, gotSaveAnswer);
    }
}

function gotSaveAnswer(err, result) {
    if (err) {
        console.log(''); // Force a new line
        process.exit(1);
    }
    if (result.save && result.save.toLowerCase() === 'y') {
        savePackageData();
    }
}

function savePackageData() {
    packageData.droneVersion = generatedVersion.toString();
    fs.writeFile(packagePath, JSON.stringify(packageData, null, 2));
}


/**** KICK IT OFF (run the program) ****/

prompt.message = '';
prompt.delimiter = '';
prompt.start();

getPackageData();
askForInput();
