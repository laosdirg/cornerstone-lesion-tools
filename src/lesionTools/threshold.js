import external from '../externalModules.js';
import { TYPED_ARRAY, TOOL_TYPE } from '../constants.js';
import { getConfiguration } from '../configuration.js';

const { addToolState, getToolState } = external.cornerstoneTools;

/**
 * Perform the thresholding on a stack
 */
function performThresholding (imageIds) {
  let width, height, view, buffer;

  const configuration = getConfiguration();

  // Thresholding promises
  return Promise.all(imageIds.map((imageId, imageIdIndex) =>
    external.cornerstone.loadImage(imageId).then((image) => {
      if (!buffer) {
        // Initialize variables on first loaded image
        width = image.width;
        height = image.height;

        const length = width * height * imageIds.length;

        buffer = new ArrayBuffer(length);
        view = new TYPED_ARRAY(buffer);
      }

      const { intercept, slope } = image;
      const pixelData = image.getPixelData();
      const sliceSize = width * height;

      for (let i = 0; i < sliceSize; i++) {
        const value = pixelData[i];
        // Calculate hu-value
        const hu = (value * slope) + intercept;
        // Check against threshold
        const label = (hu >= configuration.calciumThresholdHu) ? 1 : 0;
        // Calculate offset within view into ArrayBufer
        const offset = imageIdIndex * sliceSize + i;

        // Finally, assign label
        view[offset] = label;
      }
    })
  // When all promises resolve, return the buffer and its dimensions
  )).then(() => ({
    buffer,
    width,
    height
  }));
}

function ensureToolData (element) {
  let regionsData;

  const regionsToolData = getToolState(element, TOOL_TYPE);

  if (!regionsToolData || !regionsToolData.data || !regionsToolData.data.length) {
    regionsData = {
      enabled: 1,
      buffer: null,
      width: null,
      height: null,
      history: [],
      drawBuffer: null
    };
    addToolState(element, TOOL_TYPE, regionsData);
  } else {
    regionsData = regionsToolData.data[0];
  }

  return regionsData;
}

function threshold (element) {
  const stackToolData = getToolState(element, 'stack');

  if (!stackToolData || !stackToolData.data || !stackToolData.data.length) {
    return;
  }

  const stackData = stackToolData.data[0];
  const regionsData = ensureToolData(element);

  performThresholding(stackData.imageIds).then((regions) => {
    // Add threshold data to tool state
    regionsData.buffer = regions.buffer;
    regionsData.width = regions.width;
    regionsData.height = regions.height;

    // Update the element to apply the viewport and tool changes
    external.cornerstone.updateImage(element);
  });
}
// Module/private exports
export default threshold;
