let cornerstoneTools = window.cornerstoneTools;

export default {
  set cornerstoneTools (cst) {
    cornerstoneTools = cst;
  },
  get cornerstoneTools () {
    return cornerstoneTools;
  },
  get cornerstone () {
    return cornerstoneTools.external.cornerstone;
  },
  get cornerstoneMath () {
    return cornerstoneTools.external.cornerstoneMath;
  }
};
