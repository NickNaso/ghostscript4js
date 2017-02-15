{
  "targets": [
    {
      "target_name": "ghostscript4js",
      "sources": ["src/ghostscript4js.cc"],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "libraries": [
        "/usr/lib/x86_64-linux-gnu/libgs.so"]
    }
  ]
}
