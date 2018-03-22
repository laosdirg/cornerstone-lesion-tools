import { expect } from 'chai';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import { webWorkerManager, wadouri, external } from 'cornerstone-wado-image-loader';
import { computeScore, computeVoxelSize, computeIOPProjectedDistance, computeOverlapFactor } from '../../src/lesionTools/score.js';
import score from '../../src/lesionTools/score.js';
import * as cornerstoneLesionTools from '../../src/index.js';

describe('#scoring', function () {
  this.timeout(0);

  before(function () {
    external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstone = cornerstone;

    // Initialize the web worker manager
    const config = {
      maxWebWorkers: 1,
      startWebWorkersOnDemand: true,
      webWorkerPath: '/base/node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.js',
      taskConfiguration: {
        decodeTask: {
          loadCodecsOnStartup: true,
          initializeCodecsOnStartup: false,
          codecsPath: '/base/node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderCodecs.js',
          usePDFJS: false
        }
      }
    };

    webWorkerManager.initialize(config);
  });

  beforeEach(function () {
    this.element = document.createElement('div');
    const options = {};

    cornerstone.enable(this.element, options);
  });

  it('should properly load test', function (done) {
    const imageId = 'wadouri:http://localhost:9876/base/test/images/CTImage.dcm';

    let loadObject;

    const stack = {
      currentImageIdIndex: 0,
      imageIds: [imageId]
    };


    try {
      loadObject = wadouri.loadImage(imageId);
    } catch (error) {
      done(error);
    }

    loadObject.promise.then((image) => {
      console.timeEnd(name);
      expect(image).to.be.an('object');

      cornerstone.displayImage(this.element, image);
      cornerstoneTools.addStackStateManager(this.element, ['stack', 'regions', 'drawing']);
      cornerstoneTools.addToolState(this.element, 'stack', stack);

      cornerstoneLesionTools.threshold(this.element);

      return score(this.element);
    }).then((score) => {
      console.log("SCORE:", score);
      done();
    }, err => {
      console.error(err);
      done(err);
    });
  });

  afterEach(function () {
    cornerstone.disable(this.element);
  });
});

describe('#computeVoxelSize', function() {
  let metaData;
  let voxels;

  beforeEach(() => {
    metaData = {}
  });

  it('should compute the correct voxel size', function() {
    metaData.sliceThickness = 1;
    metaData.pixelSpacing = [1, 1];

    expect(computeVoxelSize(metaData)).to.be.equal(1)

    metaData.sliceThickness = 2;
    metaData.pixelSpacing = [1, 1];

    expect(computeVoxelSize(metaData)).to.be.equal(2)

    metaData.sliceThickness = 2;
    metaData.pixelSpacing = [1, 2];

    expect(computeVoxelSize(metaData)).to.be.equal(4)

    metaData.sliceThickness = 2;
    metaData.pixelSpacing = [2, 2];

    expect(computeVoxelSize(metaData)).to.be.equal(8)
  });

  it('should throw an error if a value is 0', function() {
    metaData.sliceThickness = 0;
    metaData.pixelSpacing = [1, 1];

    expect(() => computeVoxelSize(metaData)).to.throw()

    metaData.sliceThickness = 1;
    metaData.pixelSpacing = [0, 1];

    expect(() => computeVoxelSize(metaData)).to.throw()

    metaData.sliceThickness = 1;
    metaData.pixelSpacing = [1, 0];

    expect(() => computeVoxelSize(metaData)).to.throw()
  })


})

describe('#computeScore', function () {
  let metaData;
  let voxels;

  beforeEach(() => {
    metaData = {
      sliceLocation: 100,
      sliceThickness: 3,
      pixelSpacing: [1,1],
      KVP: 120,
      rescaleSlope: 1,
      rescaleIntercept: 0,
      rescaleType: 'HU',
      maxHU: 130
    }

    voxels = [130];
  });



  it('should compute the correct score for all possible KVP values', function () {
    metaData.KVP = 150
    expect(computeScore(metaData, voxels)).to.be.equal(1.06)

    metaData.KVP = 140
    expect(computeScore(metaData, voxels)).to.be.equal(1.04)

    metaData.KVP = 130
    expect(computeScore(metaData, voxels)).to.be.equal(1.02)

    metaData.KVP = 120
    expect(computeScore(metaData, voxels)).to.be.equal(1)

    metaData.KVP = 110
    expect(computeScore(metaData, voxels)).to.be.equal(0.98)

    metaData.KVP = 100
    expect(computeScore(metaData, voxels)).to.be.equal(0.96)

    metaData.KVP = 90
    expect(computeScore(metaData, voxels)).to.be.equal(0.93)

    metaData.KVP = 80
    expect(computeScore(metaData, voxels)).to.be.equal(0.89)

    metaData.KVP = 70
    expect(computeScore(metaData, voxels)).to.be.equal(0.85)
  });

  it('should add scores from each voxel', function() {
    voxels = [130, 130];
    expect(computeScore(metaData, voxels)).to.be.equal(2)
  })

  it('should return a score of 0 if no voxels are selected', function () {
    voxels = [];
    expect(computeScore(metaData, voxels)).to.be.equal(0)
  })
});

describe('#computeIOPProjectedDistance', function() {
  it('should compute distance of 0 for any positions if they are equal', function() {
    const imageOrientation = [[1,0,0], [0,1,0]]

    let imagePosition = [[1,1,1], [1,1,1]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(0)

    imagePosition = [[2,2,2], [2,2,2]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(0)

    imagePosition = [[0,0,0], [0,0,0]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(0)

    imagePosition = [[-1,-1,-1], [-1,-1,-1]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(0)

    imagePosition = [[1,1,1], [0,0,0]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.not.be.equal(0)
  });

  it('should compute correct distance along all three axis', function() {
    let imageOrientation = [[1,0,0], [0,1,0]]
    let imagePosition = [[1,0,1], [1,0,2]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(1)

    imageOrientation = [[1,0,0], [0,0,1]]
    imagePosition = [[1,1,0], [1,2,0]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(1)

    imageOrientation = [[0,0,1], [0,1,0]]
    imagePosition = [[1,0,1], [2,0,1]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(1)
  })

  it('should compute the absolute distance', function() {
    let imageOrientation = [[1,0,0], [0,1,0]]
    let imagePosition = [[1,0,2], [1,0,1]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(1)

    imageOrientation = [[1,0,0], [0,0,1]]
    imagePosition = [[1,2,0], [1,1,0]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(1)

    imageOrientation = [[0,0,1], [0,1,0]]
    imagePosition = [[2,0,1], [1,0,1]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(1)
  })

  it('should used the normalized normal vector', function() {
    let imageOrientation = [[2,0,0], [0,1,0]]
    let imagePosition = [[1,0,1], [1,0,2]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(1)

    imageOrientation = [[1,0,0], [0,0,1]]
    imagePosition = [[1,1,0], [1,2,0]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(1)

    imageOrientation = [[0,0,1], [0,1,0]]
    imagePosition = [[1,0,1], [2,0,1]]
    expect(computeIOPProjectedDistance(imagePosition, imageOrientation))
      .to.be.equal(1)
  })
});

describe('#computeOverlapFactor', function() {
  it('should compute overlapFactor of 1 if slices are exactly next to each other', function() {
    let distance = 3
    let sliceThickness = 3
    expect(computeOverlapFactor(distance, sliceThickness)).to.be.equal(1)
  });

  it('should compute overlapFactor of 1 if slices are not overlapping', function() {
    let distance = 4
    let sliceThickness = 3
    expect(computeOverlapFactor(distance, sliceThickness)).to.be.equal(1)
  });


  it('should compute the correct overlapFactor when overlapping', function() {
    let distance = 1
    let sliceThickness = 2
    expect(computeOverlapFactor(distance, sliceThickness)).to.be.equal(0.75)

    distance = 2
    sliceThickness = 4
    expect(computeOverlapFactor(distance, sliceThickness)).to.be.equal(0.75)

    distance = 3
    sliceThickness = 4
    expect(computeOverlapFactor(distance, sliceThickness)).to.be.equal(0.875)
  })

  it('should throw if distance is 0 or negative', function() {
    let distance = 0
    let sliceThickness = 1
    expect(() => computeOverlapFactor(distance, sliceThickness)).to.throw()
  })

});
