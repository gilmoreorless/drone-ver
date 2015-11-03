var randomWord = require('random-word');

var parts = ['major', 'mood', 'issues', 'social', 'dictionary', 'unixtime', 'seven'];

function getProp(obj, prop, def, cast) {
    var value;
    if (obj.hasOwnProperty(prop)) {
        value = obj[prop];
        if (cast) {
            value = cast(value) || def;
        }
    } else {
        value = def;
    }
    return value;
}

function singleWord(string) {
    return string.replace(/\s/g, '-');
}

function unixtime() {
    return Math.floor(Date.now() / 1000);
}

function DroneVersion(data) {
    data = data || {};
    this.major      = getProp(data, 'major', 0, Number);
    this.mood       = singleWord(getProp(data, 'mood', 'indecisive', String)).toLowerCase();
    this.issues     = getProp(data, 'issues', 0, Number);
    this.social     = getProp(data, 'social', 0, Number);
    this.dictionary = getProp(data, 'dictionary', randomWord(), String).toLowerCase();
    this.unixtime   = getProp(data, 'unixtime', unixtime(), Number);
    this.seven = 7;
}

DroneVersion.prototype.toString = function () {
    return parts.map(function (part) {
        return this[part];
    }, this).join('.');
};


function create(data) {
    return new DroneVersion(data);
}

function parse(version) {
    if (!version) {
        return create();
    }
    if (version instanceof DroneVersion) {
        return version;
    }
    var bits = (version || '').split('.');
    var data = {};
    parts.forEach(function (part, i) {
        if (typeof bits[i] !== undefined) {
            data[part] = bits[i];
        }
    });
    // Check for dirty, nasty semverses
    // TODO: Use a proper dependency for this
    if (!isNaN(+data.mood)) {
        throw new TypeError('Woah, that version looks a bit too sensible to me');
    }
    // Normalise a bit
    data.major = +data.major || 0;
    data.issues = +data.issues || 0;
    data.social = +data.social || 0;
    // Return a version
    return create(data);
}

function compareParts(part1, part2) {
    if (part1 == part2) return 0;
    return part1 < part2 ? -1 : 1;
}

function compare(version1, version2, opts) {
    opts = opts || {};
    if (opts.moreExciting) {
        return compareParts(version1.dictionary, version2.dictionary);
    }
    return compareParts(version1.unixtime, version2.unixtime);
}

exports.create = create;
exports.parse = parse;
exports.compare = compare;
