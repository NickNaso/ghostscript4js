{
  "targets": [
    {
      "target_name": "ghostscript4js",
      "sources": ["src/ghostscript4js.cc"],
      "cflags!": [ "-lng" ],
      "cflags_cc!": [ "-lng" ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
