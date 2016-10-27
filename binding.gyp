{
  "targets": [
    {
      "target_name": "ghostscript4js",
      "sources": ["src/ghostscript4js.cc"],
      'cflags!': [ '-lns' ],
      'cflags_cc!': [ '-lns' ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
