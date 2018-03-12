let configuration = {
  snap: false, // Snap to thresholded region or not
  historySize: 4,
  layersAbove: 1,
  layersBelow: 1,
  historyPosition: 0,
  toolRegionValue: 2,
  calciumThresholdHu: '-', // Placeholder until it gets set ('-' shows up nicely in text input)
  drawAlpha: 1,
  regionColorsRGB: [
    [255, 0, 255],
    [246, 193, 91],
    [237, 148, 69],
    [230, 103, 49],
    [184, 74, 41],
    [106, 58, 45]
  ],
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

export function getConfiguration () {
  return configuration;
}

export function setConfiguration (config) {
  configuration = config;
}
