import JitsiMeetJS from '../base/lib-jitsi-meet';

const { status: statusConstants } = JitsiMeetJS.constants.recording;

/**
 * Searches in the passed in redux state for an active recording session of the
 * passed in mode.
 *
 * @param {Object} state - The redux state to search in.
 * @param {string} mode - Find an active recording session of the given mode.
 * @returns {Object|undefined}
 */
export function getActiveSession(state, mode) {
    const { sessions } = state['features/recording'];

    return sessions.find(session => session.mode === mode
        && (session.status === statusConstants.ON
            || session.status === statusConstants.PENDING));
}
