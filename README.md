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
| Ghostscript | **10.08** from [libgs](https://github.com/NickNaso/libgs), installed with the package<br>from **9.19** to **10.08** when the Ghostscript installed on the system is used |
| Node.js | **20** or later |
| Operating systems | Linux, macOS, Windows and FreeBSD, see [Supported platforms](#platforms) |

The supported Ghostscript range is also exposed at runtime by the
[`MIN_SUPPORTED_REVISION` and `MAX_SUPPORTED_REVISION`](#minmax) properties. Ghostscript encodes
its version as a revision number: for example version 10.08.0 has revision `10080`.

<a name="platforms"></a>

### Supported platforms

Ghostscript is provided by [libgs](https://github.com/NickNaso/libgs), which builds it for the platforms of Node.js.
Each platform has its own package, listed in the `optionalDependencies` of ghostscript4js, and npm installs only the
one matching the `os`, `cpu` and `libc` of the system:

|                   | x86 | x64 | armv6 | armv7 | arm64 | ppc64le | s390x | loong64 | riscv64 |
| ----------------- | --- | --- | ----- | ----- | ----- | ------- | ----- | ------- | ------- |
| Windows           | ✅  | ✅  |       |       | ✅    |         |       |         |         |
| macOS >= 13.5     |     | ✅  |       |       | ✅    |         |       |         |         |
| Linux glibc       | ✅  | ✅  | ✅    | ✅    | ✅    | ✅      | ✅    | ✅      | ✅      |
| Linux musl        |     | ✅  | ✅    | ✅    | ✅    |         |       |         |         |
| FreeBSD           |     | ✅  |       |       |       |         |       |         |         |

On Linux, macOS and FreeBSD Ghostscript is linked statically into the addon, so it does not depend on the libraries of
the system. On Windows the addon loads the Ghostscript DLL of the libgs package, which is copied next to it. A
[prebuilt binary](#prebuilt) of the addon is available for each of these platforms.

<a name="prerequisites"></a>

## Prerequisites

Before installing Ghostscript4JS make sure you have the following prerequisites:

* **Node.js** 20 or later, see: [Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/)

Ghostscript does not need to be installed: npm installs it together with the package, from [libgs](#platforms). Do not
disable the optional dependencies (for example with `--omit=optional`), because libgs is installed as one of them.

On the most common platforms the installation downloads a [prebuilt binary](#prebuilt) of the addon. Otherwise the
native addon is compiled during installation by [Marmotta](https://github.com/napi-bindings/marmotta), which uses
[Zig](https://ziglang.org/) as compiler toolchain, so Python, `make` or a C++ compiler are not required. If Zig is not
available on `PATH`, Marmotta downloads it automatically. When downloads are not allowed, set the environment variable
**MARMOTTA_ZIG_DIR** to the folder of an existing Zig installation. On macOS the build also needs the Xcode Command
Line Tools, which provide the `iconv` library of the system.

<a name="system"></a>

### Use the Ghostscript installed on the system

The addon is built with the Ghostscript installed on the system, instead of libgs, when one of the options
**GS4JS_HOME**, **GS4JS_LIB**, **GS4JS_DLL** or **GS4JS_INCLUDE** is set, as described in
[Installation options](#installoptions). In this case the addon is always built from source, because the prebuilt
binaries use libgs. Ghostscript must be installed with its shared library, as described below.

The headers of the Ghostscript API (`iapi.h`) are taken from **GS4JS_INCLUDE** when it is set, otherwise from the
package, which contains a copy that works with all the supported versions of Ghostscript.

The Ghostscript of the system is also used, with a warning, when npm did not install a libgs package because there is
none for the platform or the optional dependencies were disabled.

#### Linux

Install Ghostscript and its development package, then set **GS4JS_HOME** to the folder containing `libgs.so` and
**GS4JS_INCLUDE** to the folder containing `iapi.h`:

| Distribution | Install command | GS4JS_HOME | GS4JS_INCLUDE |
| --- | --- | --- | --- |
| Debian / Ubuntu (x64) | `apt-get install ghostscript libgs-dev` | `/usr/lib/x86_64-linux-gnu` | `/usr/include/ghostscript` |
| Debian / Ubuntu (arm64) | `apt-get install ghostscript libgs-dev` | `/usr/lib/aarch64-linux-gnu` | `/usr/include/ghostscript` |
| Red Hat / Fedora | `dnf install ghostscript ghostscript-devel` | `/usr/lib64` | `/usr/include/ghostscript` |
| Arch Linux | `pacman -S ghostscript` | `/usr/lib` | `/usr/include/ghostscript` |
| Alpine | `apk add ghostscript ghostscript-dev` | `/usr/lib` | `/usr/include/ghostscript` |

In general, set **GS4JS_HOME** to the folder containing the `libgs.so` library for your distribution and architecture.

#### Windows

* Download the latest Ghostscript release for your platform from the
  [official download page](https://ghostscript.com/releases/gsdnld.html).

* Install Ghostscript. By default the installer uses a folder like `C:\Program Files\gs\gs10.08.0`.

* Set the environment variable **GS4JS_HOME** to the `bin` folder of your Ghostscript installation, which contains
  `gsdll64.dll` and `gsdll64.lib`, for example `C:\Program Files\gs\gs10.08.0\bin`.

The Windows installer does not include the headers of the API, so the ones of the package are used. During the build
the Ghostscript DLL is copied next to the addon, so it is found at runtime without changing `PATH`.

When npm did not install the libgs package, the prebuilt binary uses the DLL of the Ghostscript installed in
`C:gsin`, if there is one.

#### macOS

* Install Homebrew following the [official guide](https://brew.sh/).

* Install Ghostscript:

```bash
brew install ghostscript
```

* Set **GS4JS_HOME** to the folder containing `libgs.dylib` and **GS4JS_INCLUDE** to the folder containing `iapi.h`:

```bash
export GS4JS_HOME="$(brew --prefix ghostscript)/lib"
export GS4JS_INCLUDE="$(brew --prefix ghostscript)/include/ghostscript"
```

When **GS4JS_HOME** is not set, the library is searched in `/usr/local/lib` and in the Homebrew installation of
Ghostscript.

#### Official Ghostscript installation guide

* [Installation from official documentation](https://ghostscript.readthedocs.io/en/latest/Install.html)

* [Download Ghostscript](https://ghostscript.com/releases/gsdnld.html)

<a name="install"></a>

## Installation

```console
npm install ghostscript4js
```

npm installs the libgs package of the platform. The installation then uses a prebuilt binary of the addon when one is
available for the platform, and otherwise builds the addon from source.

<a name="prebuilt"></a>

### Prebuilt binaries

Each release includes prebuilt binaries of the addon, built with libgs. During the installation the binary for the
current platform is downloaded from the [GitHub release](https://github.com/NickNaso/ghostscript4js/releases) of the
installed version and loaded once to check that it works. Ghostscript does not need to be installed on the system.

| Platform | Requirements |
| --- | --- |
| Linux x64, arm64, armv6, armv7, ppc64le, s390x and riscv64 with glibc | glibc 2.28 or later |
| Linux x86 with glibc | glibc 2.17 or later |
| Linux loong64 with glibc | glibc 2.36 or later |
| Linux x64, arm64, armv6 and armv7 with musl, such as Alpine | none |
| macOS x64 and arm64 | macOS 13.5 or later |
| Windows x64, arm64 and x86 | none: the DLL of the libgs package is copied next to the addon. Windows x86 needs Node.js 20 or 22, the last versions for 32-bit Windows |
| FreeBSD x64 | none |

The binaries for armv6 (Raspberry Pi 1 and Zero) and armv7 are different, as the libgs libraries: the one matching the
ARM version of Node.js is downloaded.

The addon is built from source, as described in [Prerequisites](#prerequisites), when:

* there is no binary for the platform, or it cannot be downloaded;
* the binary cannot be loaded;
* **GS4JS_BUILD_FROM_SOURCE** or npm's `--build-from-source` option is set;
* **GS4JS_HOME**, **GS4JS_LIB**, **GS4JS_DLL** or **GS4JS_INCLUDE** is set, to use the
  [Ghostscript installed on the system](#system);
* the package is installed from a clone of the repository.

Run `npm install --foreground-scripts` to see whether the prebuilt binary was used and, if not, why.

<a name="installoptions"></a>

## Installation options

The following options change how the addon is installed and which Ghostscript it is built with. Each option can be
passed to `npm install` or set as an environment variable with the same name; the environment variable is used when
both are set.

Setting any of **GS4JS_HOME**, **GS4JS_LIB**, **GS4JS_DLL** and **GS4JS_INCLUDE** builds the addon with the
[Ghostscript installed on the system](#system) instead of libgs; the options that are not set take their default.

| Option | Description | Default |
| --- | --- | --- |
| **GS4JS_HOME** | Folder containing the Ghostscript library of the system | Linux: `/usr/lib/x86_64-linux-gnu`<br>Windows: `C:/gs/bin`<br>macOS: detected automatically |
| **GS4JS_LIB** | File name of the Ghostscript library of the system | Linux: `libgs.so`<br>Windows: `gsdll64.lib` (`gsdll32.lib` on 32-bit)<br>macOS: `libgs.dylib` |
| **GS4JS_DLL** | File name of the Ghostscript DLL of the system, only on Windows | `gsdll64.dll` (`gsdll32.dll` on 32-bit) |
| **GS4JS_INCLUDE** | Folder containing the headers of the Ghostscript API of the system (`iapi.h`) | the headers contained in the package |
| **GS4JS_BUILD_FROM_SOURCE** | Build the addon from source instead of downloading the prebuilt binary | not set |
| **GS4JS_BINARY_HOST** | URL the prebuilt binaries are downloaded from, for example a mirror of the GitHub releases. The binary is downloaded from `<GS4JS_BINARY_HOST>/<version>/ghostscript4js-<version>-<platform>.node.gz` | `https://github.com/NickNaso/ghostscript4js/releases/download` |

For example:

```console
npm install ghostscript4js --GS4JS_HOME="C:/Program Files/gs/gs10.08.0/bin"
```

```console
GS4JS_HOME=/usr/lib64 GS4JS_INCLUDE=/usr/include/ghostscript npm install ghostscript4js
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

Clone the repository and run:

```console
npm install    # installs the dependencies, libgs included, and builds the addon with Marmotta, never using a prebuilt binary
npm test       # runs the test suite
npm run debug  # rebuilds the addon without optimizations and with debug information
```

The build is described in `marmotta.config.js`, and the addon is written to `build/Release/ghostscript4js.node`.
`libgs.js` chooses between libgs and the [Ghostscript installed on the system](#system) and finds the libgs package of
the platform. You can also call Marmotta directly, for example `npx marmotta rebuild`. See the
[Marmotta documentation](https://github.com/napi-bindings/marmotta#readme) for all commands and options, such as
`MARMOTTA_HOME` to change where Zig and the temporary build files are stored.

To cross-compile with `npx marmotta build --target <zig target>`, the libgs package of the target must be installed,
for example `@libgs/linux-arm64` for `--target aarch64-linux-gnu`. npm installs only the package of the running
system: install the one of the target with npm's `--os`, `--cpu` and `--libc` options, which take the values of
`process.platform`, `process.arch` and `glibc` or `musl`, for example
`npm install --os=linux --cpu=arm64 --libc=glibc`. Run `npm install` again to go back to the package of the running
system. The Zig target `arm` is used for both armv6 and armv7: the armv7
package is chosen unless the environment variable **GS4JS_ARM_VERSION** is set to `6`, for example
`GS4JS_ARM_VERSION=6 npx marmotta build --target arm-linux-gnueabihf` with `@libgs/linux-armv6` installed. The addon
is then built for the same CPU as the libgs library, without the NEON instructions of the default arm CPU of Zig.

The version of libgs is set in the `optionalDependencies` of `package.json`, with the same version for all the
packages. To update Ghostscript, change it for every `@libgs/*` package and update `MAX_SUPPORTED_REVISION` in
`lib/ghostscript4js.js` when the Ghostscript version changes.

Every pull request and every push to `master` are built and tested with libgs on Linux, macOS and Windows, and with
the Ghostscript installed on the system on one runner of each operating system. When a release is
published, the `Release` workflow builds the [prebuilt binaries](#prebuilt) for the 19 platforms of libgs: natively on
the platforms with a GitHub runner, and otherwise cross-compiled with Zig and tested with QEMU, or in a FreeBSD virtual
machine. It attaches them to the release as
`ghostscript4js-<version>-<platform>.node.gz` and then installs the package on each platform to check that they are
downloaded and loaded. The release tag must be the version in `package.json`, for example `3.3.0`, because the
installation downloads the binaries from that tag. Publish the package to npm after the workflow has completed,
otherwise the first installations build the addon from source. The workflow can also be run manually to build and test
the binaries without a release.

<a name="troubleshooting"></a>

## Troubleshooting

* **`@libgs/<platform> is not installed, using the Ghostscript installed on the system`** during the installation: npm
  did not install libgs, because the optional dependencies were disabled or there is no libgs package for the platform
  (see [Supported platforms](#platforms)). Install without `--omit=optional`, or install Ghostscript on the system as
  described in [Use the Ghostscript installed on the system](#system).

* **`Ghostscript library not found`** during the installation: the addon is built with the Ghostscript installed on the
  system and the library is not in the folder used for the build. Set **GS4JS_HOME** (and **GS4JS_LIB** if the file name
  is different) as described in [Installation options](#installoptions), or unset all the **GS4JS_HOME**,
  **GS4JS_LIB**, **GS4JS_DLL** and **GS4JS_INCLUDE** options to use libgs.

* **The addon cannot be loaded on Linux** with an error about `libgs.so`: the addon is built with the Ghostscript
  installed on the system, and its shared library is not installed or not in the library search path. Install the
  Ghostscript library package of your distribution.

* **The addon cannot be loaded on Windows**: check that the Ghostscript DLL (`gsdll64.dll`) is in the `build/Release`
  folder of the module. The DLL also needs the Microsoft Visual C++ Redistributable, which is installed together with
  Ghostscript and with most Windows applications.

* **A damaged PDF file is processed without errors**: Ghostscript repairs the file and completes successfully.
  Pass `-dPDFSTOPONERROR` or `-dPDFSTOPONWARNING` to get an error instead, as described in [Damaged PDF files](#damaged-pdf-files).

* **Zig cannot be downloaded**: install Zig separately and add it to `PATH`, or set **MARMOTTA_ZIG_DIR**.

* **The prebuilt binary cannot be downloaded**, for example behind a proxy: the addon is built from source instead. Set
  **GS4JS_BINARY_HOST** to a mirror of the GitHub releases, or set **GS4JS_BUILD_FROM_SOURCE** to skip the download.

<a name="docker"></a>

## Docker

Check out the example `Dockerfile` in `examples/docker`. It creates an image based on Node.js 24 and Debian bookworm.
Ghostscript is installed by npm from libgs, so the image does not need the Ghostscript packages of Debian.

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
  copyright: 'Copyright (C) 2026 Artifex Software, Inc.  All rights reserved.',
  revision: 10080,
  revisiondate: 20260908
}
```

If you want to look around in the container you can get a shell like:

```console
docker run -it ghostscript4js /bin/bash
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
