#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var chalk = require('chalk');
var inquirer = require('inquirer');
var parseGithubUrl = require('parse-github-repo-url');
var Octokit = require('@octokit/rest').Octokit;

var droneVer = require('./');


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
            console.log('...found Drone Version:', chalk.bold.green(packageData.droneVersion));
            versionData = droneVer.parse(packageData.droneVersion);
        } else {
            console.log('...no Drone Version found');
        }
    }
}


/***** GET INPUT DATA (major, mood) *****/

function askForInput() {
    console.log('\nYou need to provide some information to create a proper Drone Version...\n');
    inquirer.prompt([
        {
            type: 'confirm',
            name: 'major',
            message: 'Did you add any cool features recently?',
            default: false,
        },
        {
            type: 'input',
            name: 'mood',
            message: 'Describe your current mood in one word',
        },
    ]).then(gotInputData);
}

function gotInputData(result) {
    if (result.major) {
        versionData.major = (versionData.major || 0) + 1;
    }
    if (result.mood) {
        versionData.mood = result.mood;
    }
    findGithubDetails();
}


/***** GET GITHUB PROJECT DETAILS *****/

function findGithubDetails() {
    if (hasPackage && packageData.repository && packageData.repository.type === 'git') {
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
    var droneVerPackageData = require(path.join(__dirname, './package.json'));
    var octokit = new Octokit({
        userAgent: `drone-ver-cli v${droneVerPackageData.version}`,
    });

    octokit.repos.get({
        owner: githubDetails[0],
        repo: githubDetails[1],
    }).then(
        gotGithubData,
        function () {
            console.log('Got an error from GitHub. Pretending nothing happened.');
            generateDroneVersion();
        }
    );
}

function gotGithubData(result) {
    var issuesCount = versionData.issues || 0;
    var socialCount = versionData.social || 0;
    var data = result.data;
    if (data.hasOwnProperty('open_issues_count')) {
        issuesCount = data.open_issues_count;
    }
    if (data.hasOwnProperty('stargazers_count') && data.hasOwnProperty('forks_count')) {
        socialCount = data.stargazers_count + data.forks_count;
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
    console.log('\nDrone Version: ' + chalk.bold.green(generatedVersion.toString()));
    askIfLiked();
}

function askIfLiked() {
    inquirer.prompt([
        {
            type: 'confirm',
            name: 'regenerate',
            message: 'You may not like that one. Generate a new one?',
            default: false,
        },
    ]).then(gotLikedAnswer);
}

function gotLikedAnswer(result) {
    if (result.regenerate) {
        generateDroneVersion();
    } else {
        askToSave();
    }
}


/***** WRITE PACKAGE DATA *****/

function askToSave() {
    if (hasPackage) {
        inquirer.prompt([
            {
                type: 'confirm',
                name: 'save',
                message: 'Save this version to package.json?',
                default: false,
            },
        ]).then(gotSaveAnswer);
    }
}

function gotSaveAnswer(result) {
    if (result.save) {
        savePackageData();
    }
}

function savePackageData() {
    packageData.droneVersion = generatedVersion.toString();
    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n');
}


/**** KICK IT OFF (run the program) ****/

getPackageData();
askForInput();
