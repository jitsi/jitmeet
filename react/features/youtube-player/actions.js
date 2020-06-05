// @flow

import { openDialog } from '../base/dialog';

import { SET_SHARED_VIDEO_STATUS } from './actionTypes';
import { EnterVideoLinkPrompt } from './components';

/**
 * Updates the current known status of the shared YouTube video.
 *
 * @param {string} status - The current status of the YouTube video being shared.
 * @param {string} time - The current position of the YouTube video being shared.
 * @param {string} ownerId - The participantId of the user sharing the YouTube video.
 * @returns {{
 *     type: SET_SHARED_VIDEO_STATUS,
 *     status: string,
 *     time: string,
 *     ownerId: string
 * }}
 */
export function setSharedVideoStatus(status: string, time: string, ownerId: string) {
    return {
        type: SET_SHARED_VIDEO_STATUS,
        status,
        time,
        ownerId
    };
}

/**
 * Starts the flow for starting or stopping a shared YouTube video.
 *
 * @returns {{
 *     type: TOGGLE_SHARED_VIDEO
 * }}
 */
export function toggleSharedVideo() {
    return {
        type: 'TOGGLE_SHARED_VIDEO'
    };
}

/**
 * Displays the prompt for entering the youtube video link.
 *
 * @param {Function} onPostSubmit - The function to be invoked when a valid link is entered.
 * @returns {Function}
 */
export function showEnterVideoLinkPrompt(onPostSubmit: ?Function) {
    return openDialog(EnterVideoLinkPrompt, { onPostSubmit });
}
