import { ReducerRegistry } from '../base/redux';
import { HIDE_RECORDING_LABEL, RECORDING_STATE_UPDATED } from './actionTypes';

/**
 * Reduces the Redux actions of the feature features/recording.
 */
ReducerRegistry.register('features/recording', (state = {}, action) => {
    switch (action.type) {
    case HIDE_RECORDING_LABEL:
        return {
            ...state,
            displayRecordingLabel: false
        };

    case RECORDING_STATE_UPDATED:
        return {
            ...state,
            displayRecordingLabel: true,
            recordingState: action.recordingState
        };

    default:
        return state;
    }
});
