# drone-ver

A Node module and CLI for generating versions according to the [drone-ver][drone-ver] specification (a.k.a. the best way to version something).

If you have not read the drone-ver specification yet, why not? It's required reading for this module. **[Go and read it now][drone-ver].** Do not pass Go. Do not use [Go][golang]. Do not collect $200.

...

...

OK, all caught up now? Excellent, let us proceed.


## Usage

The simplest way to use drone-ver is via the command line.

```sh
npm install -g drone-ver

cd /path/to/your/node/project
drone-ver
```

This will ask you some important questions to generate a valid drone-version, then optionally save it to your `package.json` under the `"droneVersion"` key. It will also query GitHub for some of the data so, um, make sure you have a network connection, I guess?

![A SCREENSHOT WILL GO HERE EVENTUALLY]()

### Node module

For more control over the version, you can include drone-ver as a dependency.

```sh
npm install --save-dev drone-ver
```

Include it like any other module.

```js
var droneVer = require('drone-ver');
```

#### create()

Create a new Drone Version with your own data.

```js
var version = droneVer.create({
    major: 3,
    mood: 'whimsical',
    issues: 183,
    social: 5,
    dictionary: 'random',
    unixtime: Date.now()
});
```

All data properties are optional. You're not allowed to specify the last part of the version — it is always 7.

The return value is an object with data properties for the parts of the version. But you're probably just going to want the full version string.

```
version.major;  // 3
version.mood;   // 'whimsical'
version.seven;  // 7

version.toString();  // '3.whimsical.183.5.random.1446168078224.7'
```

#### compare(version1, version2, options)

Compares two Drone Versions (as returned by `.create()`). Return value:

* `-1` if `version1` is lower than `version2`
* `0` if the versions are equal
* `1` if `version1` is higher than `version2`

Comparison is done on the `unixtime` portion of the version, as defined by point 7 of the specification. If you want the MORE EXCITING comparison, pass `{moreExciting: true}` as the `options` parameter, and it will compare the versions based on their `dictionary` portions.


## IAQ (Infrequently Asked Questions)

### Why would you use Drone Versioning for a project?

Pfft, why _wouldn't_ you?

### This is a joke, right?

You are within a labyrinth. At the exit gate are two guards. One always answers "yes" and the other always answers "no". You must choose which one to believe.

Alternatively, go find an ice cream to eat, or something. Sorry, what was the question again?


## Credits

Thanks to [Curtis Lassam][curtis] for writing [cube-drone][cube-drone] and [drone-ver][drone-ver-comic].

Oh, and for [Horse Drawing Tycoon][horse-video].


[curtis]: https://twitter.com/classam
[drone-ver]: http://drone-ver.org/
[drone-ver-comic]: http://curtis.lassam.net/comics/cube_drone/161.gif
[cube-drone]: http://cube-drone.com/
[horse-video]: https://www.youtube.com/watch?v=BRbcoXq_x2M
[golang]: https://golang.org/
