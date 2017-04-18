{ 
  "targets": [
    {
      "target_name": "ghostscript4js",
      "sources": ["src/ghostscript4js.cc"],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "conditions": [
        ['OS=="linux"', {
          'variables': {
            "GS4JS_HOME%": "<!(echo $GS4JS_HOME)",
            "GS4JS_LIB%": "libgs.so",
            "conditions": [
              ['"<!(echo $GS4JS_HOME)" == ""', {
                "GS4JS_HOME%": "/usr/lib/x86_64-linux-gnu"
              }]
            ]
          },
          "libraries": ["<(GS4JS_HOME)/<(GS4JS_LIB)"]
        }],
        ['OS=="win"', {
          "conditions": [
            ['target_arch=="x64"', {
              "variables": {
                "GS4JS_HOME%": "<!(node gs4js-env-home.js)",  
                "GS4JS_LIB%": "gsdll64.lib",
                "GS4JS_DLL%": "gsdll64.dll",
                "conditions": [
                  ['"<!(node gs4js-env-home.js)" == ""', {
                    "GS4JS_HOME%": "C:/gs/bin"
                  }]
                ]
              }
            }, 
            {
              "variables": { 
                "GS4JS_HOME%": "<!(node gs4js-env-home.js)",  
                "GS4JS_LIB%": "gsdll32.lib",
                "GS4JS_DLL%": "gsdll32.dll",
                "conditions": [
                  ['"<!(node gs4js-env-home.js)" == ""', {
                    "GS4JS_HOME%": "C:/gs/bin"
                  }]
                ]
              }
            }]
          ],
          "libraries": ["<(module_root_dir)/build/Release/<(GS4JS_LIB)"],
          "copies": [
            {
              "destination": "<(module_root_dir)/build/Release",
              "files": ["<(GS4JS_HOME)/<(GS4JS_DLL)", "<(GS4JS_HOME)/<(GS4JS_LIB)"]
            }
          ]
        }],
        ['OS=="mac"', {
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
          },
          'variables': {
            "GS4JS_HOME%": "<!(echo $GS4JS_HOME)",
            "GS4JS_LIB%": "libgs.dylib",
            "conditions": [
              ['"<!(echo $GS4JS_HOME)" == ""', {
                "GS4JS_HOME%": "/usr/local/lib"
              }]
            ]
          },
          "libraries": ["<(GS4JS_HOME)/<(GS4JS_LIB)"]
        }]
      ]
    }
  ]
}