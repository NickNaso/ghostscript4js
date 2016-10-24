# ghostscript4js
Ghostscript4JS binds the Ghostscript C API to bring Ghostscript power to the Node.JS world.

### This project is not yet finished give me another time :-)

## Note

To build, and run the module, you must have ``libgs-dev`` installed.

On Debian systems, this can be achieved using ``apt-get install libgs-dev``.

In general ``libgs-dev`` install the header files interface to call the Ghostscript C API but you need to check if libgs.so is installed on your system before use it.

### Compile C++ source

```bash
g++ -g -o output-file source-file
```
### Compile C source

```bash
cc source-file -o output-file
```
