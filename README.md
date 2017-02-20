<p align="center">
<img src="node-love-ghostscript.png"/>
</p>

# Ghostscript4JS 
## This module binds the Ghostscript C API to bring its power to the Node.JS world

* [Introduction](#introduction)
* [Motivations](#motivations)
* [Prerequisites](#prerequisites)
* [Installation](#install)
* [Installation options](#installoptions)
* [Usage](#usage)
* [Team](#team)
* [Acknowledgements](#acknowledgements)
* [License](#license)


<a name="introduction"></a>
## Introduction

**Ghostscript** is a suite of software based on an interpreter for Adobe Systems' PostScript and Portable Document Format (PDF)
page description languages. Its main purposes are the rasterization or rendering of such page description language files,
for the display or printing of document pages, and the conversion between PostScript and PDF files.

Ghostscript can be used as a raster image processor (RIP) for raster computer printers—for instance, as an input filter
of line printer daemon—or as the RIP engine behind PostScript and PDF viewers.

Ghostscript can also be used as a file format converter, such as PostScript to PDF converter. The **ps2pdf** conversion program,
which comes with the ghostscript distribution, is described by its documentation as a "work-alike for nearly all the functionality
(but not the user interface) of Adobe's Acrobat Distiller product".[3] This converter is basically a thin wrapper around
ghostscript's pdfwrite output device, which supports PDF/A-1 and PDF/A-2 as well as PDF/X-3 output.[3]

Ghostscript can also serve as the back-end for **PDF** to **raster image** (png, tiff, jpeg, etc.) converter; this is often
combined with a PostScript printer driver in "virtual printer" PDF creators.[citation needed]

As it takes the form of a language interpreter, Ghostscript can also be used as a general purpose programming environment.

Ghostscript has been ported to many operating systems, including Unix-like systems, classic **Mac OS**, **OpenVMS**, **Microsoft Windows**,
**Plan 9**, **MS-DOS**, **FreeDOS**, **OS/2**, **Atari TOS and AmigaOS**.

### More resource and info about Ghostscript

* [Introduction to Ghostscript](https://www.gnu.org/software/ghostscript/intro.html)

* [Ghostscript on Wikipedia](https://en.wikipedia.org/wiki/Ghostscript)

* [Ghostscript documentation](https://www.ghostscript.com/Documentation.html)

<a name="motivations"></a>
## Motivations

At time i created this module i do not able to find any module on npm that execute Ghostscript command through its C API,
otherwise there are some module that call Ghostscript through the execution of the corresponding shell command. This is
good way to start use some library from node, but there are the following drawbacks:

* **Performance** - The call to the shell command take more time and more resources than call a library C or C++ API directly

from Node.js environment.

* **Errror handler** - Sometimes you cannot intercept and handle errors in a good and proper way.

To fit all needs Ghostscript4JS has sync and async method so it could be used in a web application where it's very important
to not block the event loop, so all request will be served whiout any delay originated by our application.

[Understanding Node.js event loop](https://nodesource.com/blog/understanding-the-nodejs-event-loop/)

<a name="prerequisites"></a>
## Prerequisites

Before install Ghostscript4JS youe need to assure you have been installed the following preequisites:

* Install **Node.JS** see: [Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/)

* Install **Node.js native addon build tool** see: [node-gyp](https://github.com/nodejs/node-gyp)

* Install **Ghostscript** for your Operating System.

## Linux

### Debian systems

Install Ghostscript

```bash
sudo apt-get install ghostscript
```

then

```bash
sudo apt-get install libgs-dev
```

At this point you need to set enviroment variable **GS4JS_HOME** to  ```/usr/lib/x86_64-linux-gnu```

### Red Hat | Fedora

```bash
yum install ghostscript
```

then

```bash
yum install ghostscript-devel
```

At this point you need to set enviroment variable **GS4JS_HOME** to  ```/usr/lib64``` or ```/usr/lib``` based on you architecture

In general based on your Linux OS and architecture you have to set environment variable **GS4JS_HOME** to point on folder contains ```libgs.so``` library.

## Windows

* Download last Ghostscript version for your platform [x86](https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs920/gs920w32.exe) or [x64](https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs920/gs920w64.exe)

* Install Ghostscript on your system for example in ```C:\gs```

* Add enviroment variable **GS4JS_HOME** to point on a folder contains Ghostscript DLL and Library files (Es. gsdll64.dll and gsdll64.lib) typically they are located in **bin** folder of you ghostscript installation for example ```C:\gs\bin```

## macOS

* Install Homebrew following the official guide [here](https://brew.sh/index_it.html)

* Open terminal and install Ghostscript

```bash
brew install ghostscript
```

* Set environment variable **GS4JS_HOME** to ```/usr/local/lib```

## Official installation guide to install Ghostscript

* [Installation from official documentation](https://ghostscript.com/doc/current/Install.htm)

* [Download Ghostscript](https://ghostscript.com/download/gsdnld.html)

<a name="install"></a>
## Installation

If you want use ghostscript4js you have to install it. There are two methods for that:

In dependencies of your ```package.json``` add the following item:

```json
"ghostscript4js": "version"
```

then digit

```console
npm install
```

**Example**:

```json
"ghostscript4js": "*" for the latest version
"ghostscript4js": "1.0.0" for the version 1.0.0
```

**OR**

launch this command:

```console
npm install ghostscript4js --save
```

<a name="installoptions"></a>
## Installation options

The module ghostscript4js allow you to use some installation options

* **--GS4JS_HOME** Set the GS4JS_HOME variable that represent the path in your system where is located the ghostscript library

Es. ```npm install ghostscript4js --GS4JS_HOME="C:/gs/bin"```

* **--GS4JS_LIB** Set the GS4JS_LIB variable that represent the file name for the ghostscript library installed in your system

Es. ```npm install ghostscript4js --GS4JS_LIB="libgs.so"```

* **--GS4JS_LIB** Set the GS4JS_DLL variable that represent the file name for the ghostscript DLL installed in your windows system

Es. ```npm install ghostscript4js --GS4JS_DLL="gsdll64.dll"```

<a name="usage"></a>
## Usage

```JavaScript
'use strict'

const gs = require('ghostscript4js')

try {
  // Take decision based on Ghostscript version
  const version = gs.version()
  console.log(version)
  gs.executeSync('-sDEVICE=pngalpha -o my.png -sDEVICE=pngalpha -r144 my.pdf')
} catch (err) {
  // Handle error
  throw err
}
```

## API

### version

**version()** method return an object that contains information about version of Ghostscript library
installed on the system. It is important in those circumstances where you have to take
decision based on different version.
The returned data aee similar to the example repoted below:

```JavaScript
{
  product: "GPL Ghostscript",
  copyright: "Copyright (C) 2016 Artifex Software, Inc.  All rights reserved.",
  revision: 919,
  revisiondate: 20160323
}
```

This is a synchronous method and return the version info or throw an Error to indicate that
something was wrong in executing it.

#### Example - version

```JavaScript
'use strict'

const gs = require('ghostscript4js')

try {
  const version = gs.version()
  console.log(version)
  // Take decision based on Ghostscript version
  if (version.revision > 916) {
    // ... some stuff
  } else {
    // ... other stuff
  }
} catch (err) {
  // Handle error
  throw err
}
```

### executeSync

**executeSync(cmd)** method take the Ghostscript command parameters in input as a string and execute it in a synchronous way.
If something wrong happens in calling this method an Error with description and code error will be thrown.

#### Example - executeSync

```JavaScript
'use strict'

const gs = require('ghostscript4js')

try {
  gs.executeSync('-sDEVICE=pngalpha -o my.png -sDEVICE=pngalpha -r144 my.pdf')
} catch (err) {
  // Handle error
  throw err
}
```

### execute

**execute(cmd, callback)** method take in input the Ghostscript command parameters as a string and an optional callbackand. The execution will be asynchronous so
this ensure better performance especially in a web application enviroment, because the Node.Js event loop will not block.
This method has optional callback function as input in that case a possible error will be handled by this function. If noone function will be provided the method
return a Promise that will be resolved or rejected all as reported in the following example.

#### Example - execute

```JavaScript
'use strict'

const gs = require('ghostscript4js')

let cmd = '-sDEVICE=pngalpha -o my.png -sDEVICE=pngalpha -r144 my.pdf'
gs.execute(cmd, function (err) {
  if (err) {
    console.log("Ooops... something wrong happened")
  }
})

```

```JavaScript
'use strict'

const gs = require('ghostscript4js')

let cmd = '-sDEVICE=pngalpha -o my.png -sDEVICE=pngalpha -r144 my.pdf'
gs.execute(cmd)
.then(() => {
  console.log("All is ok")
})
.catch((err) => {
 console.log("Ooops... something wrong happened")
})

```

### Error

The error raised from **ghostscript4js** in all of its method is an instance of Error object that cointains a message that
describe what happened and at the same time cointains the Ghostscript error code so you can inspect what ahhpened in a better
way. At this link [Ghostscript error codes](https://ghostscript.com/doc/current/API.htm#return_codes) you can find all Ghostscript
errors code.

### Min and Max supported revision

This module was builded based on Ghostscript C API that is compatible with some specifica versions. The module has two
properties  **MIN_SUPPORTED_REVISION** and  **MAX_SUPPORTED_REVISION** which respectively indicate the maximum and minimum of supported
Ghostscript's version.

#### Example - Min and Max supported revision

```JavaScript
'use strict'

const gs = require('ghostscript4js')

console.log(gs.MIN_SUPPORTED_REVISION)
console.log(gs.MAX_SUPPORTED_REVISION)

```

<a name="team"></a>
## The Team

### Nicola Del Gobbo

<https://github.com/NickNaso/>

<https://www.npmjs.com/~nicknaso>

<https://twitter.com/NickNaso>

### Mauro Doganieri

<https://github.com/mauro-d>

<https://www.npmjs.com/~mauro-d>

<https://twitter.com/maurodoganieri>

<a name="acknowledgements"></a>
## Acknowledgements

Thank you to all people that encourage me every day.

<a name="license"></a>
## License

Licensed under [Apache license V2](./LICENSE)
