/*! cornerstone-lesion-tools - 0.1.0 - 2018-03-12 | (c) 2017 Chris Hafey | undefined */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("cornerstoneLesionTools", [], factory);
	else if(typeof exports === 'object')
		exports["cornerstoneLesionTools"] = factory();
	else
		root["cornerstoneLesionTools"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var cornerstoneTools = window.cornerstoneTools;

exports.default = {
  set cornerstoneTools(cst) {
    cornerstoneTools = cst;
  },
  get cornerstoneTools() {
    return cornerstoneTools;
  },
  get cornerstone() {
    return cornerstoneTools.external.cornerstone;
  },
  get cornerstoneMath() {
    return cornerstoneTools.external.cornerstoneMath;
  }
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfiguration = getConfiguration;
exports.setConfiguration = setConfiguration;
var configuration = {
  snap: false, // Snap to thresholded region or not
  historySize: 4,
  layersAbove: 1,
  layersBelow: 1,
  historyPosition: 0,
  toolRegionValue: 2,
  calciumThresholdHu: '-', // Placeholder until it gets set ('-' shows up nicely in text input)
  drawAlpha: 1,
  regionColorsRGB: [[255, 0, 255], [246, 193, 91], [237, 148, 69], [230, 103, 49], [184, 74, 41], [106, 58, 45]],
  KVPToMultiplier: {
    150: 1.06,
    140: 1.04,
    130: 1.02,
    120: 1,
    110: 0.98,
    100: 0.96,
    90: 0.93,
    80: 0.89,
    70: 0.85
  },
  growIterationsPerChunk: 2
};

configuration.calciumThresholdHuParsed = parseInt(configuration.calciumThresholdHu, 10);

function getConfiguration() {
  return configuration;
}

function setConfiguration(config) {
  console.log("c", config);
  configuration = config;
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var TYPED_ARRAY = exports.TYPED_ARRAY = Uint8Array;
var TOOL_TYPE = exports.TOOL_TYPE = 'regions';

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createUndoStep = createUndoStep;
exports.undo = undo;
exports.redo = redo;

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _configuration = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getToolState = _externalModules2.default.cornerstoneTools.getToolState;

/**
 * Store current state to history
 */

function createUndoStep(element) {
  var thresholdingData = getToolState(element, 'regions');

  var state = thresholdingData.data[0];
  // Make a copy using .slice()
  var current = state.buffer.slice();

  // Put at end of history
  state.history.push(current);
  // Remove oldest if too much history
  if (state.history.length > (0, _configuration.getConfiguration)().historySize) {
    state.history.shift();
  }
}

function undo(element) {
  var thresholdingData = getToolState(element, 'regions');
  var state = thresholdingData.data[0];

  if (state.history.length < 1) {
    return;
  }

  var replacement = state.history.pop();

  state.buffer = replacement;
  _externalModules2.default.cornerstone.updateImage(element);
}

function redo() {
  // Not implemented
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _externalModules = __webpack_require__(0);

Object.defineProperty(exports, 'external', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_externalModules).default;
  }
});

var _configuration = __webpack_require__(1);

Object.defineProperty(exports, 'getConfiguration', {
  enumerable: true,
  get: function get() {
    return _configuration.getConfiguration;
  }
});
Object.defineProperty(exports, 'setConfiguration', {
  enumerable: true,
  get: function get() {
    return _configuration.setConfiguration;
  }
});

var _display = __webpack_require__(5);

Object.defineProperty(exports, 'display', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_display).default;
  }
});

var _threshold = __webpack_require__(6);

Object.defineProperty(exports, 'threshold', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_threshold).default;
  }
});

var _grow = __webpack_require__(7);

Object.defineProperty(exports, 'grow', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_grow).default;
  }
});

var _draw = __webpack_require__(8);

Object.defineProperty(exports, 'draw', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_draw).default;
  }
});

var _score = __webpack_require__(10);

Object.defineProperty(exports, 'score', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_score).default;
  }
});

var _history = __webpack_require__(3);

Object.defineProperty(exports, 'undo', {
  enumerable: true,
  get: function get() {
    return _history.undo;
  }
});
Object.defineProperty(exports, 'redo', {
  enumerable: true,
  get: function get() {
    return _history.redo;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _constants = __webpack_require__(2);

var _configuration = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _external$cornerstone = _externalModules2.default.cornerstoneTools,
    displayTool = _external$cornerstone.displayTool,
    getToolState = _external$cornerstone.getToolState;

/**
 * Draw regions on image
 */

function onImageRendered(_ref) {
  var detail = _ref.detail;

  var configuration = (0, _configuration.getConfiguration)();
  var canvasContext = detail.canvasContext,
      element = detail.element,
      enabledElement = detail.enabledElement,
      image = detail.image;
  var width = image.width,
      height = image.height;


  var stackToolData = getToolState(element, 'stack');
  var regionsToolData = getToolState(element, 'regions');

  // Ensure tool is enabled
  if (!regionsToolData || !regionsToolData.data || !regionsToolData.data.length) {
    return;
  }

  if (!regionsToolData.data[0].drawBuffer || width !== regionsToolData.data[0].drawBuffer.canvas.width) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var _imageData = context.createImageData(width, height);

    canvas.width = width;
    canvas.height = height;

    regionsToolData.data[0].drawBuffer = {
      canvas: canvas,
      imageData: _imageData
    };
  }

  // Extract tool data
  var currentImageIdIndex = stackToolData.data[0].currentImageIdIndex;
  var _regionsToolData$data = regionsToolData.data[0],
      drawBuffer = _regionsToolData$data.drawBuffer,
      buffer = _regionsToolData$data.buffer;


  var doubleBuffer = drawBuffer.canvas;
  var imageData = drawBuffer.imageData;

  var pixels = imageData.data;
  var sliceSize = width * height;
  var sliceOffset = currentImageIdIndex * sliceSize;
  var view = new _constants.TYPED_ARRAY(buffer, sliceOffset, sliceSize);

  for (var offset = 0; offset < view.length; offset += 1) {
    // Each pixel is represented by four elements in the imageData array
    var imageDataOffset = offset * 4;
    var label = view[offset];

    if (label) {
      var color = configuration.regionColorsRGB[label - 1];

      pixels[imageDataOffset + 0] = color[0];
      pixels[imageDataOffset + 1] = color[1];
      pixels[imageDataOffset + 2] = color[2];
      pixels[imageDataOffset + 3] = configuration.drawAlpha * 255;
    } else {
      pixels[imageDataOffset + 3] = 0;
    }
  }

  // Put image data back into offscreen canvas
  doubleBuffer.getContext('2d').putImageData(imageData, 0, 0);
  // Set transforms based on zoom/pan/etc
  _externalModules2.default.cornerstone.setToPixelCoordinateSystem(enabledElement, canvasContext);
  // Finally, draw offscreen canvas onto context
  canvasContext.drawImage(doubleBuffer, 0, 0);
}

var lesionIndicator = displayTool(onImageRendered);

exports.default = lesionIndicator;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _constants = __webpack_require__(2);

var _configuration = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _external$cornerstone = _externalModules2.default.cornerstoneTools,
    addToolState = _external$cornerstone.addToolState,
    getToolState = _external$cornerstone.getToolState;

/**
 * Perform the thresholding on a stack
 */

function performThresholding(imageIds) {
  var width = void 0,
      height = void 0,
      view = void 0,
      buffer = void 0;

  var configuration = (0, _configuration.getConfiguration)();

  // Thresholding promises
  return Promise.all(imageIds.map(function (imageId, imageIdIndex) {
    return _externalModules2.default.cornerstone.loadImage(imageId).then(function (image) {
      if (!buffer) {
        // Initialize variables on first loaded image
        width = image.width;
        height = image.height;

        var length = width * height * imageIds.length;

        buffer = new ArrayBuffer(length);
        view = new _constants.TYPED_ARRAY(buffer);
      }

      var intercept = image.intercept,
          slope = image.slope;

      var pixelData = image.getPixelData();
      var sliceSize = width * height;

      for (var i = 0; i < sliceSize; i++) {
        var value = pixelData[i];
        // Calculate hu-value
        var hu = value * slope + intercept;
        // Check against threshold
        var label = hu >= configuration.calciumThresholdHu ? 1 : 0;
        // Calculate offset within view into ArrayBufer
        var offset = imageIdIndex * sliceSize + i;

        // Finally, assign label
        view[offset] = label;
      }
    });
  }
  // When all promises resolve, return the buffer and its dimensions
  )).then(function () {
    return {
      buffer: buffer,
      width: width,
      height: height
    };
  });
}

function ensureToolData(element) {
  var regionsData = void 0;

  var regionsToolData = getToolState(element, _constants.TOOL_TYPE);

  if (!regionsToolData || !regionsToolData.data || !regionsToolData.data.length) {
    regionsData = {
      enabled: 1,
      buffer: null,
      width: null,
      height: null,
      history: [],
      drawBuffer: null
    };
    addToolState(element, _constants.TOOL_TYPE, regionsData);
  } else {
    regionsData = regionsToolData.data[0];
  }

  return regionsData;
}

function threshold(element) {
  var stackToolData = getToolState(element, 'stack');

  if (!stackToolData || !stackToolData.data || !stackToolData.data.length) {
    return;
  }

  var stackData = stackToolData.data[0];
  var regionsData = ensureToolData(element);

  performThresholding(stackData.imageIds).then(function (regions) {
    // Add threshold data to tool state
    regionsData.buffer = regions.buffer;
    regionsData.width = regions.width;
    regionsData.height = regions.height;

    // Update the element to apply the viewport and tool changes
    _externalModules2.default.cornerstone.updateImage(element);
  });
}
// Module/private exports
exports.default = threshold;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _history = __webpack_require__(3);

var _configuration = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _external$cornerstone = _externalModules2.default.cornerstoneTools,
    getToolState = _external$cornerstone.getToolState,
    simpleMouseButtonTool = _external$cornerstone.simpleMouseButtonTool,
    isMouseButtonEnabled = _external$cornerstone.isMouseButtonEnabled,
    getToolOptions = _external$cornerstone.getToolOptions;


var toolType = 'regionsGrow';

// Get neighbour linear indices within slice bounds
function linearNeighbours(width, height, highSlice, lowSlice, index) {
  var sliceSize = width * height;
  var neighbours = [index - 1, index + 1, index - width, index + width];

  // Stay within bounds
  var sliceIndex = Math.floor(index / sliceSize);

  if (sliceIndex < highSlice) {
    neighbours.push(index + sliceSize);
  }
  if (sliceIndex > lowSlice) {
    neighbours.push(index - sliceSize);
  }

  return neighbours;
}

function regionGrowing(regions, point) {
  var _getConfiguration = (0, _configuration.getConfiguration)(),
      growIterationsPerChunk = _getConfiguration.growIterationsPerChunk,
      toolRegionValue = _getConfiguration.toolRegionValue,
      layersAbove = _getConfiguration.layersAbove,
      layersBelow = _getConfiguration.layersBelow;

  var width = regions.width,
      height = regions.height,
      buffer = regions.buffer;

  var _point = _slicedToArray(point, 3),
      x = _point[0],
      y = _point[1],
      slice = _point[2];

  var highSlice = slice + layersBelow;
  var lowSlice = slice - layersAbove;

  var view = new Uint8Array(buffer);

  // Calculate linear indices and offsets
  var sliceSize = width * height;
  var sliceOffset = sliceSize * slice;
  var clickIndex = y * width + x;
  var linearIndex = sliceOffset + clickIndex;
  var fromValue = view[linearIndex];

  // Only continue if we clicked in thresholded area in different color
  if (fromValue === 0 || fromValue === toolRegionValue) {
    return Promise.resolve();
  }

  // Growing starts at clicked voxel
  var activeVoxels = [linearIndex];

  return new Promise(function (resolve) {
    function chunk() {
      for (var i = 0; i < growIterationsPerChunk; i++) {
        // While activeVoxels is not empty
        if (activeVoxels.length === 0) {
          return resolve();
        }

        // Set the active voxels to nextValue
        activeVoxels.forEach(function (i) {
          view[i] = toolRegionValue;
        });

        // The new active voxels are neighbours of curent active voxels
        var nextVoxels = activeVoxels.map(function (i) {
          return linearNeighbours(width, height, highSlice, lowSlice, i);
        }).reduce( // Flatten the array of arrays to array of indices
        function (acc, cur) {
          return acc.concat(cur);
        }, []).filter( // Remove duplicates
        function (value, index, self) {
          return self.indexOf(value) === index;
        }).filter( // Remove voxels that does not have the correct fromValue
        function (i) {
          return view[i] === fromValue;
        });

        activeVoxels = nextVoxels;
      }
      setTimeout(chunk, 0);
    }

    chunk();
  });
}

function mouseDownCallback(e) {
  var _e$detail = e.detail,
      currentPoints = _e$detail.currentPoints,
      element = _e$detail.element,
      which = _e$detail.which;

  var options = getToolOptions(toolType, element);

  if (isMouseButtonEnabled(which, options.mouseButtonMask)) {
    var _getToolState$data = _slicedToArray(getToolState(element, 'stack').data, 1),
        stackData = _getToolState$data[0];

    var _getToolState$data2 = _slicedToArray(getToolState(element, 'regions').data, 1),
        regionsData = _getToolState$data2[0];

    var currentImageIdIndex = stackData.currentImageIdIndex;
    var _currentPoints$image = currentPoints.image,
        x = _currentPoints$image.x,
        y = _currentPoints$image.y;

    var point = [Math.round(x), Math.round(y), currentImageIdIndex];

    (0, _history.createUndoStep)(element);
    regionGrowing(regionsData, point).then(function () {
      _externalModules2.default.cornerstone.updateImage(element);
    });
  }
}

exports.default = simpleMouseButtonTool(mouseDownCallback, toolType);

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _pointInsidePolygon = __webpack_require__(9);

var _pointInsidePolygon2 = _interopRequireDefault(_pointInsidePolygon);

var _configuration = __webpack_require__(1);

var _history = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _external$cornerstone = _externalModules2.default.cornerstoneTools,
    toolColors = _external$cornerstone.toolColors,
    getToolState = _external$cornerstone.getToolState,
    getToolOptions = _external$cornerstone.getToolOptions,
    setToolOptions = _external$cornerstone.setToolOptions,
    simpleMouseButtonTool = _external$cornerstone.simpleMouseButtonTool,
    isMouseButtonEnabled = _external$cornerstone.isMouseButtonEnabled;


var toolType = 'draw';

function updateRegions(element) {
  var _getConfiguration = (0, _configuration.getConfiguration)(),
      snap = _getConfiguration.snap,
      toolRegionValue = _getConfiguration.toolRegionValue,
      layersAbove = _getConfiguration.layersAbove,
      layersBelow = _getConfiguration.layersBelow;

  (0, _history.createUndoStep)(element);

  // Get tool data
  var stackData = getToolState(element, 'stack');
  var thresholdingData = getToolState(element, 'regions');
  var options = getToolOptions(toolType, element);

  // Extract tool data
  var slice = stackData.data[0].currentImageIdIndex;
  var numSlices = stackData.data[0].imageIds.length;
  var regions = thresholdingData.data[0];

  // Extract region data
  var buffer = regions.buffer;
  var width = regions.width;
  var height = regions.height;

  // Find operation bounds
  var startSlice = Math.max(0, slice - layersAbove);
  var endSlice = Math.min(numSlices, slice + layersBelow);

  // Setup view into buffer
  var sliceSize = width * height;
  var sliceOffset = startSlice * sliceSize;
  var view = new Uint8Array(buffer, sliceOffset);

  // Mark points inside
  for (var dslice = 0; dslice <= endSlice - startSlice; dslice += 1) {
    for (var x = 0; x < width; x += 1) {
      for (var y = 0; y < height; y += 1) {
        var index = x + y * width + dslice * sliceSize;
        var prevValue = view[index];

        var snapBool = void 0;

        if (snap) {
          snapBool = prevValue > 0;
        } else {
          snapBool = true;
        }
        var point = {
          x: x,
          y: y
        };

        if (snapBool && (0, _pointInsidePolygon2.default)(point, options.points)) {
          view[index] = toolRegionValue;
        }
      }
    }
  }
}

// Draw regions on the canvas
function imageRenderedCallback(e) {
  var _e$detail = e.detail,
      canvasContext = _e$detail.canvasContext,
      enabledElement = _e$detail.enabledElement,
      element = _e$detail.element;

  // Points

  var options = getToolOptions(toolType, element);
  var points = options.points;

  if (points.length < 2) {
    return;
  }

  // Set the canvas context to the image coordinate system
  _externalModules2.default.cornerstone.setToPixelCoordinateSystem(enabledElement, canvasContext);

  canvasContext.fillStyle = toolColors.getFillColor();
  canvasContext.strokeStyle = toolColors.getActiveColor();
  canvasContext.beginPath();
  canvasContext.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(function (point) {
    canvasContext.lineTo(point.x, point.y);
  });
  canvasContext.closePath();
  canvasContext.stroke();
  canvasContext.fill();
}

function dragCallback(e) {
  var _e$detail2 = e.detail,
      currentPoints = _e$detail2.currentPoints,
      element = _e$detail2.element;

  var options = getToolOptions(toolType, element);

  options.points.push(currentPoints.image);
  _externalModules2.default.cornerstone.updateImage(element);

  e.preventDefault();
  e.stopPropagation();
}

// Disable drawing and tracking on mouse up also update regions
function mouseUpCallback(e) {
  var element = e.detail.element;


  element.removeEventListener('cornerstonetoolsmousedrag', dragCallback);
  element.removeEventListener('cornerstonetoolsmouseup', mouseUpCallback);
  element.removeEventListener('cornerstonetoolsmouseclick', mouseUpCallback);
  element.removeEventListener('cornerstoneimagerendered', imageRenderedCallback);

  updateRegions(element);
  _externalModules2.default.cornerstone.updateImage(element);
}

// Start drawing and tracking on mouse up, also reset points array
function mouseDownCallback(e) {
  var _e$detail3 = e.detail,
      element = _e$detail3.element,
      which = _e$detail3.which;

  var options = getToolOptions(toolType, element);

  if (isMouseButtonEnabled(which, options.mouseButtonMask)) {
    options.points = [];

    setToolOptions(toolType, element, options);

    element.addEventListener('cornerstonetoolsmousedrag', dragCallback);
    element.addEventListener('cornerstonetoolsmouseup', mouseUpCallback);
    element.addEventListener('cornerstonetoolsmouseclick', mouseUpCallback);
    element.addEventListener('cornerstoneimagerendered', imageRenderedCallback);

    e.preventDefault();
    e.stopPropagation();
  }
}

exports.default = simpleMouseButtonTool(mouseDownCallback, toolType);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = pointInsidePolygon;
// Determine if a point is inside a polygon
function pointInsidePolygon(point, polygon) {
  var x = point.x,
      y = point.y;

  var n = polygon.length;
  var inside = false;

  for (var i = 0, j = n - 1; i < n; j = i++) {
    var _polygon$i = polygon[i],
        xi = _polygon$i.x,
        yi = _polygon$i.y;
    var _polygon$j = polygon[j],
        xj = _polygon$j.x,
        yj = _polygon$j.y;


    var intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.computeVoxelSize = computeVoxelSize;
exports.computeScore = computeScore;
exports.computeIOPProjectedDistance = computeIOPProjectedDistance;
exports.computeOverlapFactor = computeOverlapFactor;
exports.score = score;

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _configuration = __webpack_require__(1);

var _constants = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getToolState = _externalModules2.default.cornerstoneTools.getToolState;


function getDensityFactor(hu) {
  if (hu < 130) {
    return 0;
  } else if (hu < 200) {
    return 1;
  } else if (hu < 300) {
    return 2;
  } else if (hu < 400) {
    return 3;
  }

  return 4;
}

// Finds the value with the most occurrences in array
// Should be O(n)
function mode(array) {
  if (array.length === 0) {
    return null;
  }
  var modeMap = {};
  var maxEl = array[0];
  var maxCount = 1;

  for (var i = 0; i < array.length; i++) {
    var el = array[i];

    if (modeMap[el] === null) {
      modeMap[el] = 1;
    } else {
      modeMap[el]++;
    }

    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }

  return maxEl;
}

function computeVoxelSize(metaData) {
  if (metaData.sliceThickness === 0 || metaData.pixelSpacing[0] === 0 || metaData.pixelSpacing[1] === 0) {
    throw new Error('sliceThickness or pixelSpacing was 0');
  }
  var zLength = metaData.sliceThickness;
  var xLength = metaData.pixelSpacing[0];
  var yLength = metaData.pixelSpacing[1];

  return zLength * xLength * yLength; // In mm³
}

function computeScore(metaData, voxels) {
  // Division by 3 because Agatson score assumes a slice thickness of 3 mm
  var voxelSizeScaled = computeVoxelSize(metaData) / 3;
  var densityFactor = getDensityFactor(metaData.maxHU);
  var volume = voxels.length * voxelSizeScaled;

  var _getConfiguration = (0, _configuration.getConfiguration)(),
      KVPToMultiplier = _getConfiguration.KVPToMultiplier;

  var KVPMultiplier = KVPToMultiplier[metaData.KVP];
  var cascore = volume * densityFactor * KVPMultiplier;

  /*
   console.log(`modeOverlapFactor: ${metaData.modeOverlapFactor}`);
   console.log(`voxels.length: ${voxels.length}`);
   console.log(`voxelSizeScaled: ${voxelSizeScaled}`);
   console.log(`Volume: ${volume}`);
   console.log(`Max HU: ${metaData.maxHU}`);
   console.log(`densityFactor: ${densityFactor}`);
   console.log(`KVPMultiplier: ${KVPMultiplier}`);
   console.log(`CAscore: ${cascore}`); */

  // If modeOverlapFactor factor is undefined it is because there is only one slice in the series.
  // In this case obviously modeOverlapFactor is meaningless and should not be multiplied with cascore.
  if (metaData.modeOverlapFactor) {
    return cascore * metaData.modeOverlapFactor;
  }

  return cascore;
}

/*
* Computes the distance between two slices based on the DICOM Image Plane Module
* @param imagePositions {Array[2][3]} - DICOM tag (0020, 0032) of two slices
* @param imageOrientation {Array[2][3]} - DICOM tag (0020, 0037) of first slice
*/
function computeIOPProjectedDistance(imagePositions, imageOrientation) {
  var imagePosition1Vector = new _externalModules2.default.cornerstoneMath.Vector3();

  imagePosition1Vector.fromArray(imagePositions[0]);

  var imagePosition2Vector = new _externalModules2.default.cornerstoneMath.Vector3();

  imagePosition2Vector.fromArray(imagePositions[1]);

  var imageOrientationRowVector = new _externalModules2.default.cornerstoneMath.Vector3();

  imageOrientationRowVector.fromArray(imageOrientation[0]);

  var imageOrientationColumnVector = new _externalModules2.default.cornerstoneMath.Vector3();

  imageOrientationColumnVector.fromArray(imageOrientation[1]);

  // Compute unit normal of Image Orientation crossVectors
  var orientationNormal = new _externalModules2.default.cornerstoneMath.Vector3();

  orientationNormal.crossVectors(imageOrientationRowVector, imageOrientationColumnVector);
  // Project both position vectors on normal
  var projection1 = imagePosition1Vector.projectOnVector(orientationNormal);
  var projection2 = imagePosition2Vector.projectOnVector(orientationNormal);

  // Compute distance of projected vectors
  return projection1.distanceTo(projection2);
}

function computeOverlapFactor(distance, sliceThickness) {
  if (distance <= 0) {
    throw new Error('Distance must be > 0');
  }

  if (distance >= sliceThickness) {
    return 1;
  }

  var overlap = sliceThickness - distance;

  return (sliceThickness - overlap) / sliceThickness;
}

function bfs(x, y, view, visitedVoxels, label, image) {
  var intercept = image.intercept,
      slope = image.slope,
      width = image.width;

  var pixelData = image.getPixelData();
  var lesionVoxels = [];
  var stack = [[x, y]];

  while (stack.length > 0) {
    var _stack$shift = stack.shift(),
        _stack$shift2 = _slicedToArray(_stack$shift, 2),
        _x = _stack$shift2[0],
        _y = _stack$shift2[1];

    // If visited is 0, the element has not been visisted before


    if (visitedVoxels[_x][_y] === 0 && view[_y * width + _x] === label) {
      stack.push([_x - 1, _y]);
      stack.push([_x + 1, _y]);
      stack.push([_x, _y - 1]);
      stack.push([_x, _y + 1]);

      var value = pixelData[_x + _y * width];
      var hu = value * slope + intercept;

      if (hu >= 130) {
        lesionVoxels.push(hu);
      }
      visitedVoxels[_x][_y] = 1;
    }
  }

  return lesionVoxels;
}

/**
 * Calculate CaScore per label per slice per lesion
 *
 */
function score(element) {
  var _getConfiguration2 = (0, _configuration.getConfiguration)(),
      regionColorsRGB = _getConfiguration2.regionColorsRGB;

  var regionsToolData = getToolState(element, _constants.TOOL_TYPE);
  var stackToolData = getToolState(element, 'stack');
  var buffer = regionsToolData.data[0].buffer;
  var imageIds = stackToolData.data[0].imageIds;

  // Extract and group region-voxels

  var voxelsEachRegion = regionColorsRGB.slice(1).map(function () {
    return imageIds.map(function () {
      return [];
    });
  });
  var maxHUEachRegion = regionColorsRGB.slice(1).map(function () {
    return imageIds.map(function () {
      return [];
    });
  });

  var overlapFactor = void 0;
  var prevImagePosition = void 0;
  var overlapFactors = [];

  var metaData = {};

  return Promise.all(imageIds.map(function (imageId, imageIndex) {
    return _externalModules2.default.cornerstone.loadImage(imageId).then(function (image) {
      var dataSet = image.data;

      metaData.sliceThickness = dataSet.floatString('x00180050');
      metaData.pixelSpacing = dataSet.string('x00280030').split('\\').map(parseFloat);
      metaData.KVP = dataSet.floatString('x00180060');
      metaData.rescaleSlope = dataSet.floatString('x00281053');
      metaData.rescaleIntercept = dataSet.floatString('x00281052');
      metaData.rescaleType = dataSet.string('x00281054');

      var imagePositionPatient = dataSet.string('x00200032').split('\\').map(parseFloat);
      var imageOrientationTmp = dataSet.string('x00200037').split('\\').map(parseFloat);
      var imageOrientation = [imageOrientationTmp.slice(0, 3), imageOrientationTmp.slice(3)];

      /* What is this?
       if (metaData.rescaleType !== 'HU') {
         console.warn(`Modality LUT does not convert to Hounsfield units but to ${metaData.rescaleType}. Agatston score is not defined for this unit type.`);
          return;
      }
       */

      if (prevImagePosition) {
        var distance = computeIOPProjectedDistance([prevImagePosition, imagePositionPatient], imageOrientation);

        overlapFactor = computeOverlapFactor(distance, metaData.sliceThickness);

        // Find overlapfactor with the highest occurance
        overlapFactors.push(overlapFactor);
        metaData.modeOverlapFactor = mode(overlapFactors);

        // Save imagePositionPatient for next overlapFactor computation
        prevImagePosition = imagePositionPatient;
      } else {
        prevImagePosition = imagePositionPatient;
      }

      // Overlap has been calculated, now we investigate voxels

      var height = image.height,
          width = image.width;

      var sliceSize = width * height;
      var offset = imageIndex * sliceSize;

      var view = new _constants.TYPED_ARRAY(buffer, offset, sliceSize);

      // Initialze with 0's
      var visitedVoxels = Array(width).fill().map(function () {
        return Array(height).fill(0);
      });

      for (var x = 0; x < width; x += 1) {
        for (var y = 0; y < height; y += 1) {
          // Extract label from view into ArrayBuffer
          var label = view[y * width + x];

          if (label > 1) {
            var lesionVoxels = bfs(x, y, view, visitedVoxels, label, image);

            if (lesionVoxels.length) {
              var maxHU = Math.max.apply(Math, _toConsumableArray(lesionVoxels));

              voxelsEachRegion[label - 2][imageIndex].push(lesionVoxels);
              maxHUEachRegion[label - 2][imageIndex].push(maxHU);
            }
          }
        }
      }
    });
  }
  // When all images have been processed
  )).then(function () {
    return voxelsEachRegion.map(function (slicesInLabel, labelIdx) {
      var cascore = [];

      slicesInLabel.forEach(function (lesions, sliceIdx) {
        lesions.forEach(function (voxels, lesionIdx) {
          metaData.maxHU = maxHUEachRegion[labelIdx][sliceIdx][lesionIdx];

          var cascoreCurrent = voxels.length > 0 ? computeScore(metaData, voxels) : 0;

          cascore.push(cascoreCurrent);
        });
      });
      var sum = cascore.reduce(function (acc, val) {
        return acc + val;
      }, 0);

      return sum;
    });
  });
}

exports.default = score;

/***/ })
/******/ ]);
});
//# sourceMappingURL=cornerstoneLesionTools.js.map