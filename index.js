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

function DroneVersion(data) {
    data = data || {};
    this.major      = getProp(data, 'major', 0, Number);
    this.mood       = getProp(data, 'mood', 'indecisive', String);
    this.issues     = getProp(data, 'issues', 0, Number);
    this.social     = getProp(data, 'social', 0, Number);
    this.dictionary = getProp(data, 'dictionary', randomWord(), String);
    this.unixtime   = getProp(data, 'unixtime', Date.now(), Number);
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
exports.compare = compare;
