/* eslint-disable no-unused-expressions */
import { expect } from 'chai';

import * as cornerstoneLesionTools from '../src/index';

describe('A test that pulls in all modules', function () {
  it('pulls in all modules', function () {
    expect(cornerstoneLesionTools).to.exist;
  });
});
