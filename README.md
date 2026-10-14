<p align="center">
<img src="https://raw.githubusercontent.com/NickNaso/ghostscript4js/master/node-love-ghostscript.png"/>
</p>

# Ghostscript4JS

## This module binds the Ghostscript C API to bring its power to the Node.JS world

[![CI](https://github.com/NickNaso/ghostscript4js/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/NickNaso/ghostscript4js/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/ghostscript4js)](https://www.npmjs.com/package/ghostscript4js)

* [Introduction](#introduction)
* [Motivations](#motivations)
* [Supported versions](#supported)
* [Prerequisites](#prerequisites)
* [Installation](#install)
* [Installation options](#installoptions)
* [Usage](#usage)
* [API](#api)
* [Security](#security)
* [Development](#development)
* [Troubleshooting](#troubleshooting)
* [Docker](#docker)
* [Code of conduct](CODE_OF_CONDUCT.md)
* [Team](#team)
* [Acknowledgements](#acknowledgements)
* [License](#license)

<a name="introduction"></a>

## Introduction

**Ghostscript** is a suite of software based on an interpreter for Adobe Systems' PostScript and Portable Document Format (PDF)
page description languages. Its main purposes are the rasterization or rendering of such page description language files,
for the display or printing of document pages, and the conversion between PostScript and PDF files.

Ghostscript can be used as a raster image processor (RIP) for raster computer printers, for instance as an input filter
of a line printer daemon, or as the RIP engine behind PostScript and PDF viewers.

Ghostscript can also be used as a file format converter, such as a PostScript to PDF converter. The **ps2pdf** conversion program,
which comes with the Ghostscript distribution, is described by its documentation as a "work-alike for nearly all the functionality
(but not the user interface) of Adobe's Acrobat Distiller product". This converter is basically a thin wrapper around
Ghostscript's pdfwrite output device, which supports PDF/A and PDF/X output.

Ghostscript can also serve as the back-end for **PDF** to **raster image** (png, tiff, jpeg, etc.) converters; this is often
combined with a PostScript printer driver in "virtual printer" PDF creators.

As it takes the form of a language interpreter, Ghostscript can also be used as a general purpose programming environment.

### More resources and info about Ghostscript

* [Introduction to Ghostscript](https://www.gnu.org/software/ghostscript/intro.html)

* [Ghostscript on Wikipedia](https://en.wikipedia.org/wiki/Ghostscript)

* [Ghostscript documentation](https://ghostscript.readthedocs.io/)

<a name="motivations"></a>

## Motivations

When I created this module I was not able to find any module on npm that executes Ghostscript commands through its C API;
the existing modules called Ghostscript by executing the corresponding shell command. This is a
good way to start using a library from Node.js, but it has the following drawbacks:

* **Performance** - Calling a shell command takes more time and more resources than calling a C or C++ API directly from Node.js.

* **Error handling** - Sometimes you cannot intercept and handle errors in a good and proper way.

To fit all needs Ghostscript4JS has sync and async methods, so it can be used in a web application where it's very important
to not block the event loop, so all requests will be served without any delay originated by your application.

[Understanding Node.js event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)

<a name="supported"></a>

## Supported versions

| Component | Supported versions |
| --- | --- |
| Ghostscript | from **9.19** to **10.08** |
| Node.js | **20** or later |
| Operating systems | Linux, macOS and Windows (x64 and arm64) |

The supported Ghostscript range is also exposed at runtime by the
[`MIN_SUPPORTED_REVISION` and `MAX_SUPPORTED_REVISION`](#minmax) properties. Ghostscript encodes
its version as a revision number: for example version 10.08.0 has revision `10080`.

<a name="prerequisites"></a>

## Prerequisites

Before installing Ghostscript4JS make sure you have the following prerequisites:

* **Node.js** 20 or later, see: [Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/)

* **Ghostscript** with its shared library for your operating system, as described below.

The native addon is compiled during installation by [Marmotta](https://github.com/napi-bindings/marmotta), which uses
[Zig](https://ziglang.org/) as compiler toolchain, so Python, `make` or a C++ compiler are not required. If Zig is not
available on `PATH`, Marmotta downloads it automatically. When downloads are not allowed, set the environment variable
**MARMOTTA_ZIG_DIR** to the folder of an existing Zig installation.

### Linux

Install Ghostscript and its development package, then set **GS4JS_HOME** to the folder containing `libgs.so`
when it is not the default `/usr/lib/x86_64-linux-gnu`.

| Distribution | Install command | GS4JS_HOME |
| --- | --- | --- |
| Debian / Ubuntu (x64) | `apt-get install ghostscript libgs-dev` | not needed |
| Debian / Ubuntu (arm64) | `apt-get install ghostscript libgs-dev` | `/usr/lib/aarch64-linux-gnu` |
| Red Hat / Fedora | `dnf install ghostscript ghostscript-devel` | `/usr/lib64` |
| Arch Linux | `pacman -S ghostscript` | `/usr/lib` |
| Alpine | `apk add ghostscript ghostscript-dev` | `/usr/lib` |

In general, set **GS4JS_HOME** to the folder containing the `libgs.so` library for your distribution and architecture.

### Windows

* Download the latest Ghostscript release for your platform from the
  [official download page](https://ghostscript.com/releases/gsdnld.html).

* Install Ghostscript. By default the installer uses a folder like `C:\Program Files\gs\gs10.08.0`.

* Set the environment variable **GS4JS_HOME** to the `bin` folder of your Ghostscript installation, which contains
  `gsdll64.dll` and `gsdll64.lib`, for example `C:\Program Files\gs\gs10.08.0\bin`. It is not needed when Ghostscript
  is installed in `C:\gs`, because `C:\gs\bin` is the default.

During the build the Ghostscript DLL is copied next to the addon, so it is found at runtime without changing `PATH`.

### macOS

* Install Homebrew following the [official guide](https://brew.sh/).

* Install Ghostscript:

```bash
brew install ghostscript
```

The library is found automatically in `/usr/local/lib` or in the Homebrew installation of Ghostscript. If it is installed
elsewhere, set **GS4JS_HOME** to the folder containing `libgs.dylib`, for example:

```bash
export GS4JS_HOME="$(brew --prefix ghostscript)/lib"
```

### Official Ghostscript installation guide

* [Installation from official documentation](https://ghostscript.readthedocs.io/en/latest/Install.html)

* [Download Ghostscript](https://ghostscript.com/releases/gsdnld.html)

<a name="install"></a>

## Installation

```console
npm install ghostscript4js
```

The addon is built from source during the installation, so Ghostscript must be installed first.

<a name="installoptions"></a>

## Installation options

The following options change where the Ghostscript library is searched during the build. Each option can be passed to
`npm install` or set as an environment variable with the same name; the environment variable is used when both are set.

| Option | Description | Default |
| --- | --- | --- |
| **GS4JS_HOME** | Folder containing the Ghostscript library | Linux: `/usr/lib/x86_64-linux-gnu`<br>Windows: `C:/gs/bin`<br>macOS: detected automatically |
| **GS4JS_LIB** | File name of the Ghostscript library | Linux: `libgs.so`<br>Windows: `gsdll64.lib` (`gsdll32.lib` on 32-bit)<br>macOS: `libgs.dylib` |
| **GS4JS_DLL** | File name of the Ghostscript DLL, only on Windows | `gsdll64.dll` (`gsdll32.dll` on 32-bit) |

For example:

```console
npm install ghostscript4js --GS4JS_HOME="C:/Program Files/gs/gs10.08.0/bin"
```

```console
GS4JS_HOME=/usr/lib64 npm install ghostscript4js
```

<a name="usage"></a>

## Usage

```js
'use strict'

const gs = require('ghostscript4js')

try {
  // Take decision based on Ghostscript version
  const version = gs.version()
  console.log(version)
  gs.executeSync('-sDEVICE=pngalpha -o my.png -r144 my.pdf')
} catch (err) {
  // Handle error
  throw err
}
```

<a name="api"></a>

## API

### version

**version()** returns an object that contains information about the version of the Ghostscript library
installed on the system. It is useful when you have to take decisions based on different versions.
The returned data is similar to the example below:

```js
{
  product: 'GPL Ghostscript',
  copyright: 'Copyright (C) 2026 Artifex Software, Inc.  All rights reserved.',
  revision: 10080,
  revisiondate: 20260908
}
```

This is a synchronous method that returns the version info or throws an Error to indicate that
something went wrong during its execution.

#### Example - version

```js
'use strict'

const gs = require('ghostscript4js')

try {
  const version = gs.version()
  console.log(version)
  // Take decision based on Ghostscript version
  if (version.revision >= 10000) {
    // ... Ghostscript 10 or later
  } else {
    // ... other stuff
  }
} catch (err) {
  // Handle error
  throw err
}
```

### executeSync

**executeSync(cmd)** takes the Ghostscript command parameters as a string or an array of strings and executes them synchronously.
If something goes wrong an Error with description and error code is thrown.

Use an array of strings when a parameter contains spaces, for example a file name, because a string is split on spaces.

#### Example - executeSync

```js
'use strict'

const gs = require('ghostscript4js')

try {
  gs.executeSync('-sDEVICE=pngalpha -o my.png -r144 my.pdf')
  gs.executeSync(['-sDEVICE=pngalpha', '-o', 'my image.png', '-r144', 'my document.pdf'])
} catch (err) {
  // Handle error
  throw err
}
```

### execute

**execute(cmd, callback)** takes the Ghostscript command parameters as a string or an array of strings and an optional callback.
The execution is asynchronous, so it does not block the Node.js event loop: this is the method to use in a web application.
If a callback is provided, a possible error is passed to it; otherwise the method returns a Promise that is resolved or rejected
as shown in the following examples.

#### Example - execute

```js
'use strict'

const gs = require('ghostscript4js')

const cmd = '-sDEVICE=pngalpha -o my.png -r144 my.pdf'
gs.execute(cmd, function (err) {
  if (err) {
    console.log("Ooops... something wrong happened")
  }
})
```

```js
'use strict'

const gs = require('ghostscript4js')

const cmd = '-sDEVICE=pngalpha -o my.png -r144 my.pdf'
gs.execute(cmd)
  .then(() => {
    console.log("All is ok")
  })
  .catch((err) => {
    console.log("Ooops... something wrong happened")
  })
```

### Error

The errors raised by **ghostscript4js** in all of its methods are instances of Error with a message that
describes what happened and contains the Ghostscript error code, so you can inspect what happened in a better
way. See [Ghostscript return codes](https://ghostscript.readthedocs.io/en/latest/API.html#return-codes) for the list of Ghostscript error codes.

#### Damaged PDF files

By default Ghostscript tries to process damaged PDF files anyway: it substitutes missing fonts, repairs or ignores invalid
content and completes successfully, printing only a summary such as `This file had errors that were repaired or ignored`.
In that case no error is raised, exactly as the `gs` command line program exits with code 0.

To make the execution fail, and get an Error, pass one of these options to Ghostscript:

* **-dPDFSTOPONERROR** stops on errors in the PDF file, for example invalid operators in a page content.
* **-dPDFSTOPONWARNING** stops on warnings too. Since Ghostscript 10.07.0 this also covers the problems that
  Ghostscript repairs, such as a text object that is not closed; with earlier versions these problems are still
  ignored.

```js
'use strict'

const gs = require('ghostscript4js')

gs.execute('-dPDFSTOPONERROR -sDEVICE=pngalpha -o my.png -r144 my.pdf')
  .then(() => {
    console.log("The PDF was processed without errors")
  })
  .catch((err) => {
    console.log("The PDF is damaged:", err.message)
  })
```

<a name="minmax"></a>

### Min and Max supported revision

This module is built on the Ghostscript C API, which is compatible with specific versions. The module has two
properties, **MIN_SUPPORTED_REVISION** and **MAX_SUPPORTED_REVISION**, which respectively indicate the minimum and maximum
supported Ghostscript revision (see [Supported versions](#supported)).

#### Example - Min and Max supported revision

```js
'use strict'

const gs = require('ghostscript4js')

console.log(gs.MIN_SUPPORTED_REVISION) // 919
console.log(gs.MAX_SUPPORTED_REVISION) // 10080

const { revision } = gs.version()
if (revision < gs.MIN_SUPPORTED_REVISION || revision > gs.MAX_SUPPORTED_REVISION) {
  console.warn(`Ghostscript revision ${revision} has not been tested with ghostscript4js`)
}
```

<a name="security"></a>

## Security

Ghostscript interprets PostScript and PDF, which are programming languages, so processing files from untrusted sources
is a risk. Keep Ghostscript updated, because new releases often fix security issues, and do not disable the `SAFER` mode,
which is enabled by default since Ghostscript 9.50 and restricts file system access from documents. Avoid the `-dNOSAFER`
option when you process files you do not control.

<a name="development"></a>

## Development

Clone the repository, install Ghostscript as described in [Prerequisites](#prerequisites) and run:

```console
npm install    # installs the dependencies and builds the addon with Marmotta
npm test       # runs the test suite
npm run debug  # rebuilds the addon without optimizations and with debug information
```

The build is described in `marmotta.config.js`, and the addon is written to `build/Release/ghostscript4js.node`.
You can also call Marmotta directly, for example `npx marmotta rebuild`. See the
[Marmotta documentation](https://github.com/napi-bindings/marmotta#readme) for all commands and options, such as
`MARMOTTA_HOME` to change where Zig and the temporary build files are stored.

Every pull request and every push to `master` are built and tested on Linux, macOS and Windows. When a release is
published, the addon is built for each platform and attached to the release as a zip archive. The archives contain only
the addon: Ghostscript must still be installed, and on Windows `gsdll64.dll` must be placed next to the addon or be
available on `PATH`.

<a name="troubleshooting"></a>

## Troubleshooting

* **`Ghostscript library not found`** during the installation: the library is not in the folder used for the build.
  Set **GS4JS_HOME** (and **GS4JS_LIB** if the file name is different) as described in [Installation options](#installoptions).

* **The addon cannot be loaded on Linux** with an error about `libgs.so`: the Ghostscript shared library is not installed
  or not in the library search path. Install the Ghostscript library package of your distribution.

* **The addon cannot be loaded on Windows**: check that the Ghostscript DLL is in the `build/Release` folder of the module.
  The DLL also needs the Microsoft Visual C++ Redistributable, which is installed together with Ghostscript.

* **A damaged PDF file is processed without errors**: Ghostscript repairs the file and completes successfully.
  Pass `-dPDFSTOPONERROR` or `-dPDFSTOPONWARNING` to get an error instead, as described in [Damaged PDF files](#damaged-pdf-files).

* **Zig cannot be downloaded**: install Zig separately and add it to `PATH`, or set **MARMOTTA_ZIG_DIR**.

<a name="docker"></a>

## Docker

Check out the example `Dockerfile` in `examples/docker`. It creates an image based on Node.js 24 and Debian bookworm.

To build the image do:

```console
cd examples/docker
docker build -t ghostscript4js .
```

Now you can run the image. By default it does `npm start` (which is `node index.js`) and exits.

```console
docker run ghostscript4js
```

Running the container should output something like:

```js
{
  product: 'GPL Ghostscript',
  copyright: 'Copyright (C) 2022 Artifex Software, Inc.  All rights reserved.',
  revision: 10000,
  revisiondate: 20220921
}
```

If you want to look around in the container you can get a shell like:

```console
docker run -it ghostscript4js /bin/bash
gs --version
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
