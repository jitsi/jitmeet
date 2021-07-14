// @flow

import { getCurrentConference } from '../base/conference';

/**
 * Approves (lets in) or rejects a knocking participant.
 *
 * @param {Function} getState - Function to get the Redux state.
 * @param {string} id - The id of the knocking participant.
 * @param {boolean} approved - True if the participant is approved, false otherwise.
 * @returns {Function}
 */
export function setKnockingParticipantApproval(getState: Function, id: string, approved: boolean) {
    const conference = getCurrentConference(getState());

    if (conference) {
        if (approved) {
            conference.lobbyApproveAccess(id);
        } else {
            conference.lobbyDenyAccess(id);
        }
    }
}


/**
 * Selector to return lobby state.
 *
 * @param {any} state - State object.
 * @returns {boolean}
 */
export function getLobbyEnabled(state: any) {
    return state['features/lobby'].lobbyEnabled;
}


/**
 * Selector to return a list of knocking participants.
 *
 * @param {any} state - State object.
 * @returns {Array<Object>}
 */
export function getKnockingParticipants(state: any) {
    return state['features/lobby'].knockingParticipants;
}
