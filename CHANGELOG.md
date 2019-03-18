# Changelog


## 3.1.0 / 2019-03-18

* Fixed and improved the error handling. For more explanations see the PR [#41](https://github.com/NickNaso/ghostscript4js/pull/41)
    - Add unit test to intercept the error 
    - Change GhostscriptManager to throw string instead of char*
    - Change SetError call to set exception string
    - Fix test to not hardcode ghostscript version to 2017

## 3.0.0 / 2018-07-05

* Complete the port to N-API using node-addon-api
* Undefinedfilename error on Windows if file path contains spaces - Fix issue [#33](https://github.com/NickNaso/ghostscript4js/issues/33)
* Added code of conduct
* Small updates on documentation - executeSync and execute function allow to pass array of strings as arguments.
* Verified and updated the compatibility against the ghostscript version 9.23

## 2.0.11-n-api / 2018-03-22

* Empty output with when using pdfwrite - Fix issue [#30](https://github.com/NickNaso/ghostscript4js/issues/30)
* N-API porting of ghostscript4js - Fix issue [#29](https://github.com/NickNaso/ghostscript4js/issues/29)
* Ghostscript 9.22 - Fix issue [#27](https://github.com/NickNaso/ghostscript4js/issues/27)

## 2.0.7 / 2017-02-09

* Issue with the new update ghostscript4js@2.0.5 - Fix issue [#24](https://github.com/NickNaso/ghostscript4js/issues/24)

## 2.0.5 / 2017-01-09

* GS4JS_LIB variable isn't used - Fix issue [#23](https://github.com/NickNaso/ghostscript4js/issues/23)

## 2.0.3 / 2017-30-06

* Specify --c++11 and --libc++ cplusplus flags in node-gyp settings - PR [#22](https://github.com/NickNaso/ghostscript4js/pull/22)

* Removed V8 API in the initialization code for the add-ons

## 2.0.1 / 2017-18-04

* Warning on Microsoft compiler - Fix issue [#18](https://github.com/NickNaso/ghostscript4js/issues/18)

* Removed unused file **g4js-env-home.js**

## 2.0.0 / 2017-18-04

* **`ghostscript4js`** support for Ghostscript **9.21**. For more info see the [changelog](https://ghostscript.com/doc/9.21/News.htm).  

* Fix typo and other little errors in documentation.

* Problem calling execute method multiple time consecutively - Fix issue [#15](https://github.com/NickNaso/ghostscript4js/issues/15).

## 1.0.19 / 2017-06-04

* Invalid file path problem - Fix issue [#16](https://github.com/NickNaso/ghostscript4js/issues/16).

## 1.0.11 / 2017-11-03

* Installation problem - Fix issue [#13](https://github.com/NickNaso/ghostscript4js/issues/14).

## 1.0.7 / 2017-03-03

* Added compatibility with Ghostscript version.

* Fix issue [#13](https://github.com/NickNaso/ghostscript4js/issues/13).

## 1.0.5 / 2017-02-22

* Fix in documentation of **`ghostscript4js`**.

## 1.0.3 / 2017-02-20

* Fix in documentation of **`ghostscript4js`**.

## 1.0.0 / 2017-02-20

* Initial version of **`ghostscript4js`** binds the Ghostscript C API to bring Ghostscript power to the Node.JS world.
