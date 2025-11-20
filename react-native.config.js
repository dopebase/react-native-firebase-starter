module.exports = {
  dependencies: {
  },
  project: {
    ios: {},
    android: {}, // grouped into "project"
  },
  assets: ['./src/assets/fonts/'], // stays the same
  sourceDir: '.',
}

// A dependency conflict will occur on Android platform if you do not comment out one of the two.
