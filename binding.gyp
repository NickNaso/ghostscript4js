{ 
  "targets": [
    {
      "target_name": "ghostscript4js",
      "sources": ["src/ghostscript4js.cc"],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'dependencies': [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "conditions": [
        ['OS=="linux"', {
          'variables': {
            "GS4JS_HOME%": "<!(echo $GS4JS_HOME)",
            "GS4JS_LIB%": "<!(echo $GS4JS_LIB)",
            "conditions": [
              ['"<!(echo $GS4JS_HOME)" == ""', {
                "GS4JS_HOME%": "/usr/lib/x86_64-linux-gnu"
              }],
              ['"<!(echo $GS4JS_LIB)" == ""', {
                "GS4JS_LIB%": "libgs.so"
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
                "GS4JS_LIB%": "<!(node gs4js-env-lib.js)",
                "GS4JS_DLL%": "<!(node gs4js-env-dll.js)",
                "conditions": [
                  ['"<!(node gs4js-env-home.js)" == ""', {
                    "GS4JS_HOME%": "C:/gs/bin"
                  }],
                  ['"<!(node gs4js-env-lib.js)" == ""', {
                    "GS4JS_LIB%": "gsdll64.lib"
                  }],
                  ['"<!(node gs4js-env-dll.js)" == ""', {
                    "GS4JS_DLL%": "gsdll64.dll"
                  }]
                ]
              }
            }, 
            {
              "variables": { 
                "GS4JS_HOME%": "<!(node gs4js-env-home.js)",  
                "GS4JS_LIB%": "<!(node gs4js-env-lib.js)",
                "GS4JS_DLL%": "<!(node gs4js-env-dll.js)",
                "conditions": [
                  ['"<!(node gs4js-env-home.js)" == ""', {
                    "GS4JS_HOME%": "C:/gs/bin"
                  }],
                  ['"<!(node gs4js-env-lib.js)" == ""', {
                    "GS4JS_LIB%": "gsdll32.lib"
                  }],
                  ['"<!(node gs4js-env-dll.js)" == ""', {
                    "GS4JS_DLL%": "gsdll32.dll"
                  }]
                ]
              }
            }]
          ],
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1
            }
          },
          "libraries": ["<(module_root_dir)/build/Release/<(GS4JS_LIB)"],
          "copies": [
            {
              "destination": "<(module_root_dir)/build/Release",
              "files": ["<(GS4JS_HOME)/<(GS4JS_DLL)", "<(GS4JS_HOME)/<(GS4JS_LIB)"]
            }
          ]
        }],
        ['OS=="mac"', {
          'cflags+': ['-fvisibility=hidden'],
          'xcode_settings': {
            #'CLANG_CXX_LANGUAGE_STANDARD': 'c++11',
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            #'CLANG_CXX_LIBRARY': 'libc++',
            'GCC_SYMBOLS_PRIVATE_EXTERN': 'YES', # -fvisibility=hidden
            #'MACOSX_DEPLOYMENT_TARGET': '10.7'
          },
          'variables': {
            "GS4JS_HOME%": "<!(echo $GS4JS_HOME)",
            "GS4JS_LIB%": "<!(echo $GS4JS_LIB)",
            "conditions": [
              ['"<!(echo $GS4JS_HOME)" == ""', {
                "GS4JS_HOME%": "/usr/local/lib"
              }],
              ['"<!(echo $GS4JS_LIB)" == ""', {
                "GS4JS_LIB%": "libgs.dylib"
              }]
            ]
          },
          "libraries": ["<(GS4JS_HOME)/<(GS4JS_LIB)"]
        }]
      ]
    }
  ]
}