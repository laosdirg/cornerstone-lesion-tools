import external from '../externalModules.js';
import { getConfiguration } from '../configuration.js';
import { TYPED_ARRAY, TOOL_TYPE } from '../constants.js';

const { getToolState } = external.cornerstoneTools;

function getDensityFactor (hu) {
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
function mode (array) {
  if (array.length === 0) {
    return null;
  }
  const modeMap = {};
  let maxEl = array[0];
  let maxCount = 1;

  for (let i = 0; i < array.length; i++) {
    const el = array[i];

    if (modeMap[el] === null) {
      modeMap[el] = 1;
    } else {
      modeMap[el]++;
    }

    if(modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }

  return maxEl;
}

export function computeVoxelSize (metaData) {
  if (metaData.sliceThickness === 0 ||
      metaData.pixelSpacing[0] === 0 ||
      metaData.pixelSpacing[1] === 0) {
    throw new Error('sliceThickness or pixelSpacing was 0');
  }
  const zLength = metaData.sliceThickness;
  const xLength = metaData.pixelSpacing[0];
  const yLength = metaData.pixelSpacing[1];


  return zLength * xLength * yLength; // In mm³
}

export function computeScore (metaData, voxels) {
  // Division by 3 because Agatson score assumes a slice thickness of 3 mm
  const voxelSizeScaled = computeVoxelSize(metaData) / 3;
  const densityFactor = getDensityFactor(metaData.maxHU);
  const volume = voxels.length * voxelSizeScaled;

  const { KVPToMultiplier } = getConfiguration();
  const KVPMultiplier = KVPToMultiplier[metaData.KVP];
  const cascore = volume * densityFactor * KVPMultiplier;

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
export function computeIOPProjectedDistance (imagePositions, imageOrientation) {
  const imagePosition1Vector = new external.cornerstoneMath.Vector3();

  imagePosition1Vector.fromArray(imagePositions[0]);

  const imagePosition2Vector = new external.cornerstoneMath.Vector3();

  imagePosition2Vector.fromArray(imagePositions[1]);

  const imageOrientationRowVector = new external.cornerstoneMath.Vector3();

  imageOrientationRowVector.fromArray(imageOrientation[0]);

  const imageOrientationColumnVector = new external.cornerstoneMath.Vector3();

  imageOrientationColumnVector.fromArray(imageOrientation[1]);

  // Compute unit normal of Image Orientation crossVectors
  const orientationNormal = new external.cornerstoneMath.Vector3();

  orientationNormal.crossVectors(imageOrientationRowVector, imageOrientationColumnVector);
  // Project both position vectors on normal
  const projection1 = imagePosition1Vector.projectOnVector(orientationNormal);
  const projection2 = imagePosition2Vector.projectOnVector(orientationNormal);

  // Compute distance of projected vectors
  return projection1.distanceTo(projection2);
}

export function computeOverlapFactor (distance, sliceThickness) {
  if (distance <= 0) {
    throw new Error('Distance must be > 0');
  }

  if (distance >= sliceThickness) {
    return 1;
  }

  const overlap = sliceThickness - distance;

  return (sliceThickness - overlap) / (sliceThickness);
}

function bfs (x, y, view, visitedVoxels, label, image) {
  const { intercept, slope, width } = image;
  const pixelData = image.getPixelData();
  const lesionVoxels = [];
  const stack = [[x, y]];

  while (stack.length > 0) {
    const [x, y] = stack.shift();

    // If visited is 0, the element has not been visisted before
    if (visitedVoxels[x][y] === 0 && view[y * width + x] === label) {
      stack.push([x - 1, y]);
      stack.push([x + 1, y]);
      stack.push([x, y - 1]);
      stack.push([x, y + 1]);

      const value = pixelData[x + y * width];
      const hu = (value * slope) + intercept;

      if (hu >= 130) {
        lesionVoxels.push(hu);
      }
      visitedVoxels[x][y] = 1;
    }

  }

  return lesionVoxels;
}

/**
 * Calculate CaScore per label per slice per lesion
 *
 */
export function score (element) {
  const { regionColorsRGB } = getConfiguration();

  const regionsToolData = getToolState(element, TOOL_TYPE);
  const stackToolData = getToolState(element, 'stack');
  const { buffer } = regionsToolData.data[0];
  const { imageIds } = stackToolData.data[0];

  // Extract and group region-voxels
  const voxelsEachRegion = regionColorsRGB.slice(1).map(() => imageIds.map(() => []));
  const maxHUEachRegion = regionColorsRGB.slice(1).map(() => imageIds.map(() => []));

  let overlapFactor;
  let prevImagePosition;
  const overlapFactors = [];

  const metaData = {};

  return Promise.all(imageIds.map((imageId, imageIndex) =>
    external.cornerstone.loadImage(imageId).then((image) => {

      const imagePlane = external.cornerstone.metaData.get('imagePlaneModule', imageId);
      const modalityLut = external.cornerstone.metaData.get('modalityLutModule', imageId);

      metaData.sliceThickness = imagePlane.sliceThickness;
      metaData.pixelSpacing = imagePlane.pixelSpacing;
      metaData.rescaleSlope = modalityLut.rescaleSlope;
      metaData.rescaleIntercept = modalityLut.rescaleIntercept;
      metaData.rescaleType = modalityLut.rescaleType;

      const imagePositionPatient = imagePlane.imagePositionPatient;
      const imageOrientationTmp = imagePlane.imageOrientationPatient;
      const imageOrientation = [
        imageOrientationTmp.slice(0, 3),
        imageOrientationTmp.slice(3)
      ];

      const dataSet = image.data;
      metaData.KVP = dataSet.floatString('x00180060');
      /* What is this?
       if (metaData.rescaleType !== 'HU') {
         console.warn(`Modality LUT does not convert to Hounsfield units but to ${metaData.rescaleType}. Agatston score is not defined for this unit type.`);

         return;
      }
       */

      if (prevImagePosition) {
        const distance = computeIOPProjectedDistance([prevImagePosition, imagePositionPatient], imageOrientation);

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

      const { height, width } = image;
      const sliceSize = width * height;
      const offset = imageIndex * sliceSize;

      const view = new TYPED_ARRAY(buffer, offset, sliceSize);

      // Initialze with 0's
      const visitedVoxels = Array(width).fill().map(() => Array(height).fill(0));

      for (let x = 0; x < width; x += 1) {
        for (let y = 0; y < height; y += 1) {
          // Extract label from view into ArrayBuffer
          const label = view[y * width + x];

          if (label > 1) {
            const lesionVoxels = bfs(x, y, view, visitedVoxels, label, image);

            if (lesionVoxels.length) {
              const maxHU = Math.max(...lesionVoxels);

              voxelsEachRegion[label - 2][imageIndex].push(lesionVoxels);
              maxHUEachRegion[label - 2][imageIndex].push(maxHU);
            }
          }
        }
      }
    })
  // When all images have been processed
  )).then(() => voxelsEachRegion.map((slicesInLabel, labelIdx) => {
    const cascore = [];

    slicesInLabel.forEach((lesions, sliceIdx) => {
      lesions.forEach((voxels, lesionIdx) => {
        metaData.maxHU = maxHUEachRegion[labelIdx][sliceIdx][lesionIdx];

        const cascoreCurrent = voxels.length > 0 ? computeScore(metaData, voxels) : 0;

        cascore.push(cascoreCurrent);
      });
    });
    const sum = cascore.reduce((acc, val) => acc + val, 0);

    return sum;
  }));
}

export default score;
