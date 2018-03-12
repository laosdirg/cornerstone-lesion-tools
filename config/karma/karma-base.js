const path = require('path');
const webpackConfig = require('../webpack');

// Deleting output.library to avoid "Uncaught SyntaxError: Unexpected token /" error
// when running testes (var test/foo_test.js = ...)
delete webpackConfig.output.library;

// Code coverage
webpackConfig.module.rules.push({
  test: /\.js$/,
  include: path.resolve('./src/'),
  loader: 'istanbul-instrumenter-loader',
  query: {
    esModules: true
  }
});

module.exports = {
  basePath: '../../',
  frameworks: ['mocha'],
  reporters: ['progress', 'coverage'],
  files: [
    'node_modules/cornerstone-core/dist/cornerstone.js',
    'node_modules/cornerstone-math/dist/cornerstoneMath.js',
    'node_modules/cornerstone-tools/dist/cornerstoneTools.js',
    'node_modules/promise-polyfill/dist/promise.min.js',
    'node_modules/dicom-parser/dist/dicomParser.js',
    'node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderCodecs.js',
    'node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoader.js',
    'node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.js',
    'test/*_test.js',
    'test/**/*_test.js',
    {pattern: 'test/images/**', watched: false, included: false, served: true, nocache: false}
  ],

  plugins: [
    'karma-webpack',
    'karma-mocha',
    'karma-phantomjs-launcher',
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-coverage'
  ],

  preprocessors: {
    'src/**/*.js': ['webpack'],
    'test/**/*_test.js': ['webpack']
  },

  webpack: webpackConfig,

  webpackMiddleware: {
    noInfo: false,
    stats: {
      chunks: false,
      timings: false,
      errorDetails: true
    }
  },

  coverageReporter: {
    dir: './coverage',
    reporters: [
      {type: 'html', subdir: 'html'},
      {type: 'lcov', subdir: '.'},
      {type: 'text', subdir: '.', file: 'text.txt'},
      {type: 'text-summary', subdir: '.', file: 'text-summary.txt'}
    ]
  }
};
