import external from '../externalModules.js';
import { TYPED_ARRAY } from './constants.js';

const { displayTool, getToolState } = external.cornerstoneTools;

const configuration = {
  drawAlpha: 1,
  regionColorsRGB: [
    [255, 0, 255],
    [246, 193, 91],
    [237, 148, 69],
    [230, 103, 49],
    [184, 74, 41],
    [106, 58, 45]
  ]
};

/**
 * Draw regions on image
 */
function onImageRendered ({ detail }) {
  const { canvasContext, element, enabledElement, image } = detail;
  const { width, height } = image;

  const stackToolData = getToolState(element, 'stack');
  const regionsToolData = getToolState(element, 'regions');

  // Ensure tool is enabled
  if (!regionsToolData || !regionsToolData.data || !regionsToolData.data.length) {
    return;
  }

  if (!regionsToolData.data[0].drawBuffer || width !== regionsToolData.data[0].drawBuffer.canvas.width) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(width, height);

    canvas.width = width;
    canvas.height = height;

    regionsToolData.data[0].drawBuffer = {
      canvas,
      imageData
    };
  }

  // Extract tool data
  const { currentImageIdIndex } = stackToolData.data[0];
  const { drawBuffer, buffer } = regionsToolData.data[0];

  const doubleBuffer = drawBuffer.canvas;
  const imageData = drawBuffer.imageData;

  const pixels = imageData.data;
  const sliceSize = width * height;
  const sliceOffset = currentImageIdIndex * sliceSize;
  const view = new TYPED_ARRAY(buffer, sliceOffset, sliceSize);

  for (let offset = 0; offset < view.length; offset += 1) {
    // Each pixel is represented by four elements in the imageData array
    const imageDataOffset = offset * 4;
    const label = view[offset];

    if (label) {
      const color = configuration.regionColorsRGB[label - 1];

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
  external.cornerstone.setToPixelCoordinateSystem(enabledElement, canvasContext);
  // Finally, draw offscreen canvas onto context
  canvasContext.drawImage(doubleBuffer, 0, 0);
}

const lesionIndicator = displayTool(onImageRendered);

lesionIndicator.setConfiguration(configuration);

export default lesionIndicator;
