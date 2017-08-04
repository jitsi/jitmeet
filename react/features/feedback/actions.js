import { FEEDBACK_REQUEST_IN_PROGRESS } from '../../../modules/UI/UIErrors';

import { openDialog } from '../../features/base/dialog';

import {
    CANCEL_FEEDBACK,
    SET_SHOULD_SHOW_POST_CALL_FEEDBACK,
    SUBMIT_FEEDBACK
} from './actionTypes';
import { FeedbackDialog } from './components';

/**
 * Caches the passed in feedback in the redux store.
 *
 * @param {number} score - The quality score given to the conference.
 * @param {string} message - A description entered by the participant that
 * explains the rating.
 * @returns {{
 *     type: CANCEL_FEEDBACK,
 *     message: string,
 *     score: number
 * }}
 */
export function cancelFeedback(score, message) {
    return {
        type: CANCEL_FEEDBACK,
        message,
        score
    };
}

/**
 * Potentially open the {@code FeedbackDialog}. It will not be opened if it is
 * already open or feedback has already been submitted.
 *
 * @param {JistiConference} conference - The conference for which the feedback
 * would be about. The conference is passed in because feedback can occur after
 * a conference has been left, so references to it may no longer exist in redux.
 * @returns {Promise} Resolved with value - false if the dialog is enabled and
 * resolved with true if the dialog is disabled or the feedback was already
 * submitted. Rejected if another dialog is already displayed.
 */
export function maybeOpenFeedbackDialog(conference) {
    return (dispatch, getState) => {
        const state = getState();

        if (state['features/base/dialog'].component === FeedbackDialog) {
            // Feedback is currently being displayed.

            return Promise.reject(FEEDBACK_REQUEST_IN_PROGRESS);
        } else if (state['features/feedback'].submitted) {
            // Feedback has been submitted already.

            return Promise.resolve({
                thankYouDialogVisible: true,
                feedbackSubmitted: true
            });
        } else if (state['features/feedback'].shouldShowPostCallFeedbackDialog
            && conference.isCallstatsEnabled()) {
            return new Promise(resolve => {
                dispatch(openFeedbackDialog(conference, () => {
                    const { submitted } = getState()['features/feedback'];

                    resolve({
                        feedbackSubmitted: submitted,
                        thankYouDialogVisible: false
                    });
                }));
            });
        }

        // If the feedback functionality isn't enabled we show a thank
        // you dialog. Signaling it (true), so the caller
        // of requestFeedback can act on it
        return Promise.resolve({
            thankYouDialogVisible: true,
            feedbackSubmitted: false
        });
    };
}

/**
 * Opens {@code FeedbackDialog}.
 *
 * @param {JitsiConference} conference - The JitsiConference that is being
 * rated. The conference is passed in because feedback can occur after a
 * conference has been left, so references to it may no longer exist in redux.
 * @param {Function} [onClose] - An optional callback to invoke when the dialog
 * is closed.
 * @returns {Object}
 */
export function openFeedbackDialog(conference, onClose) {
    return openDialog(FeedbackDialog, {
        conference,
        onClose
    });
}

/**
 * Sets whether or not feedback should display automatically at the end of the
 * conference.
 *
 * @param {boolean} shouldShow - Whether or not feedback should display at the
 * end of the conference.
 * @returns {{
 *     type: SET_SHOULD_SHOW_POST_CALL_FEEDBACK,
 *     shouldShow: boolean
 * }}
 */
export function shouldShowPostCallFeedbackDialog(shouldShow) {
    return {
        type: SET_SHOULD_SHOW_POST_CALL_FEEDBACK,
        shouldShow
    };
}

/**
 * Send the passed in feedback.
 *
 * @param {number} score - An integer between 1 and 5 indicating the user
 * feedback. The negative integer -1 is used to denote no score was selected.
 * @param {string} message - Detailed feedback from the user to explain the
 * rating.
 * @param {JitsiConference} conference - The JitsiConference for which the
 * feedback is being left.
 * @returns {{
 *     type: SUBMIT_FEEDBACK
 * }}
 */
export function submitFeedback(score, message, conference) {
    conference.sendFeedback(score, message);

    return {
        type: SUBMIT_FEEDBACK
    };
}
