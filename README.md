## The module is almost ready need some time to write documentation 

<p align="center">
<img src="" width="" height=""/>
</p>

# Ghostscript4JS 
## This module binds the Ghostscript C API to bring its power to the Node.JS world

* [Introduction](#introduction)
* [Motivations](#motivations)
* [Prerequisites](#prerequisites)
* [Installation](#install)
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

* **Performance** The call to shell command take more time and more resource than call a library directly from Node.js environment.

* **Errror handler** Sometimes you cannot intercept and handle errors in a good way.


<a name="prerequisites"></a>
## Prerequisites

<a name="install"></a>
## Installation

<a name="usage"></a>
## Usage

<a name="team"></a>
## The Team

### Nicola Del Gobbo

<https://github.com/NickNaso/>

<https://www.npmjs.com/~nicknaso>

<https://twitter.com/NickNaso>

<a name="acknowledgements"></a>
## Acknowledgements

Thank you to all people that encourage me every day.

<a name="license"></a>
## License

Licensed under [Apache license V2](./LICENSE)