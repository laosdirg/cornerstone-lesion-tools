import { expect } from 'chai';
import pointInsidePolygon from '../../src/util/pointInsidePolygon.js';

describe('#pointInsidePolygon', function () {
  const points = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 }
  ];

  it('should return true when inside', function () {
    const point = { x: 5, y: 5 };
    expect(pointInsidePolygon(point, points)).to.be.true;
  });

  it('should return false when outside', function () {
    const point = { x: 15, y: 15 };
    expect(pointInsidePolygon(point, points)).to.be.false;
  });

});
