'use strict'

let GS4JS_HOME = ""
if (process.env.GS4JS_HOME) {
    GS4JS_HOME = process.env.GS4JS_HOME
    GS4JS_HOME = GS4JS_HOME.split("\\").join("/")
}
process.stdout.write(GS4JS_HOME)
