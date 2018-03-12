import external from '../externalModules.js';
import { getConfiguration } from '../configuration.js';

const { getToolState } = external.cornerstoneTools;

/**
 * Store current state to history
 */
export function createUndoStep (element) {
  const thresholdingData = getToolState(element, 'regions');

  const state = thresholdingData.data[0];
  // Make a copy using .slice()
  const current = state.buffer.slice();

  // Put at end of history
  state.history.push(current);
  // Remove oldest if too much history
  if (state.history.length > getConfiguration().historySize) {
    state.history.shift();
  }
}

export function undo (element) {
  const thresholdingData = getToolState(element, 'regions');
  const state = thresholdingData.data[0];

  if (state.history.length < 1) {
    return;
  }

  const replacement = state.history.pop();

  state.buffer = replacement;
  external.cornerstone.updateImage(element);
}

export function redo () {
  // Not implemented
}
