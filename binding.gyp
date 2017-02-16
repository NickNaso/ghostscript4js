{
  "targets": [
    {
      "target_name": "ghostscript4js",
      "sources": ["src/ghostscript4js.cc"],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "conditions": [
        ['OS=="linux"', {
          'variables': {
            "GS4JS_LIB%": "<!(echo $GS4JS_ENV_LIB)",
            "conditions": [
              ['"<!(echo $GS4JS_ENV_LIB)" == ""', {
                "GS4JS_LIB%": "/usr/lib/x86_64-linux-gnu/libgs.so"
              }]
            ],
          },
          "libraries": ["<(GS4JS_LIB)"]
        }],
        ['OS=="win"', {
           
        }],
        ['OS=="mac"', {
          'variables': {
            "GS4JS_LIB%": "<!(echo $GS4JS_ENV_LIB)",
            "conditions": [
              ['"<!(echo $GS4JS_ENV_LIB)" == ""', {
                "GS4JS_LIB%": "/usr/local/lib/libgs.dylib"
              }]
            ]
          },
          "libraries": ["<(GS4JS_LIB)"]
        }]
      ]
    }
  ]
}
