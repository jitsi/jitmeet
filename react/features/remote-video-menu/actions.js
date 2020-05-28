// @flow
import type { Dispatch } from 'redux';

import {
    AUDIO_MUTE,
    createRemoteMuteConfirmedEvent,
    createRemoteUnMuteConfirmedEvent,
    createToolbarEvent,
    sendAnalytics
} from '../analytics';
import { hideDialog } from '../base/dialog';
import {
    getLocalParticipant,
    muteRemoteParticipant,
    unMuteRemoteParticipant
} from '../base/participants';
import { setAudioMuted } from '../base/media';
import UIEvents from '../../../service/UI/UIEvents';

import { RemoteVideoMenu } from './components';

declare var APP: Object;

/**
 * Hides the remote video menu.
 *
 * @returns {Function}
 */
export function hideRemoteVideoMenu() {
    return hideDialog(RemoteVideoMenu);
}

/**
 * Mutes the local participant.
 *
 * @param {boolean} enable - Whether to mute or unmute.
 * @returns {Function}
 */
export function muteLocal(enable: boolean) {
    return (dispatch: Dispatch<any>) => {
        sendAnalytics(createToolbarEvent(AUDIO_MUTE, { enable }));
        dispatch(setAudioMuted(enable, /* ensureTrack */ true));

        // FIXME: The old conference logic as well as the shared video feature
        // still rely on this event being emitted.
        typeof APP === 'undefined'
            || APP.UI.emitEvent(UIEvents.AUDIO_MUTED, enable, true);
    };
}

/**
 * Mutes the remote participant with the given ID.
 *
 * @param {string} participantId - ID of the participant to mute.
 * @returns {Function}
 */
export function muteRemote(participantId: string) {
    return (dispatch: Dispatch<any>) => {
        sendAnalytics(createRemoteMuteConfirmedEvent(participantId));
        dispatch(muteRemoteParticipant(participantId));
    };
}


/**
 * UnMutes the remote participant with the given ID.
 *
 * @param {string} participantId - ID of the participant to unmute.
 * @returns {Function}
 */
export function unMuteRemote(participantId: string) {
    return (dispatch: Dispatch<any>) => {
        sendAnalytics(createRemoteUnMuteConfirmedEvent(participantId));
        dispatch(unMuteRemoteParticipant(participantId));
    };
}

/**
 * Mutes all participants.
 *
 * @param {Array<string>} exclude - Array of participant IDs to not mute.
 * @returns {Function}
 */
export function muteAllParticipants(exclude: Array<string>) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState();
        const localId = getLocalParticipant(state).id;
        const participantIds = state['features/base/participants']
            .map(p => p.id);

        /* eslint-disable no-confusing-arrow */
        participantIds
            .filter(id => !exclude.includes(id))
            .map(id => id === localId ? muteLocal(true) : muteRemote(id))
            .map(dispatch);
        /* eslint-enable no-confusing-arrow */
    };
}

/**
 * UnMutes all participants.
 *
 * @param {Array<string>} exclude - Array of participant IDs to not un mute.
 * @returns {Function}
 */
export function unMuteAllParticipants(exclude: Array<string>) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState();
        const localId = getLocalParticipant(state).id;
        const participantIds = state['features/base/participants']
            .map(p => p.id);

        /* eslint-disable no-confusing-arrow */
        participantIds
            .filter(id => !exclude.includes(id))
            .map(id => id === localId ? muteLocal(false) : unMuteRemote(id))
            .map(dispatch);
        /* eslint-enable no-confusing-arrow */
    };
}
