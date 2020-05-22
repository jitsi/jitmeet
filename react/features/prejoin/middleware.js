// @flow

import { SET_VIDEO_MUTED } from '../base/media';
import { MiddlewareRegistry } from '../base/redux';
import { updateSettings } from '../base/settings';

import {
    ADD_PREJOIN_AUDIO_TRACK,
    ADD_PREJOIN_VIDEO_TRACK,
    PREJOIN_START_CONFERENCE
} from './actionTypes';
import { mutePrejoinVideo } from './actions';
import { getAllPrejoinConfiguredTracks, isPrejoinPageVisible } from './functions';

declare var APP: Object;

/**
 * The redux middleware for {@link PrejoinPage}.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => async action => {
    switch (action.type) {

    case ADD_PREJOIN_AUDIO_TRACK: {
        const { value: audioTrack } = action;

        if (audioTrack) {
            store.dispatch(
                    updateSettings({
                        micDeviceId: audioTrack.getDeviceId()
                    }),
            );
        }

        break;
    }

    case ADD_PREJOIN_VIDEO_TRACK: {
        const { value: videoTrack } = action;

        if (videoTrack) {
            store.dispatch(
                    updateSettings({
                        cameraDeviceId: videoTrack.getDeviceId()
                    }),
            );
        }

        break;
    }

    case PREJOIN_START_CONFERENCE: {
        const { getState, dispatch } = store;
        const state = getState();
        const { userSelectedSkipPrejoin } = state['features/prejoin'];

        userSelectedSkipPrejoin && dispatch(updateSettings({
            userSelectedSkipPrejoin
        }));


        const tracks = await getAllPrejoinConfiguredTracks(state);

        APP.conference.prejoinStart(tracks);

        break;
    }

    case SET_VIDEO_MUTED: {
        // Don't forward mute video action if not on prejoin page
        if (isPrejoinPageVisible(store.getState())) {
            store.dispatch(mutePrejoinVideo());
        }

        break;
    }

    }

    return next(action);
});
