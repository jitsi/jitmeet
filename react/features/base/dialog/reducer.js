import { assign, ReducerRegistry } from '../redux';

import { HIDE_DIALOG, OPEN_DIALOG } from './actionTypes';
import jitsiLocalStorage from '../../../../modules/util/JitsiLocalStorage';

/**
 * Reduces redux actions which show or hide dialogs.
 *
 * @param {State} state - The current redux state.
 * @param {Action} action - The redux action to reduce.
 * @param {string} action.type - The type of the redux action to reduce..
 * @returns {State} The next redux state that is the result of reducing the
 * specified action.
 */
ReducerRegistry.register('features/base/dialog', (state = {}, action) => {
    switch (action.type) {
    case HIDE_DIALOG:
        return assign(state, {
            component: undefined,
            componentProps: undefined
        });

    case OPEN_DIALOG: {
        const { localStorageKeyForDoNotShowWarning } = action.componentProps;

        if (localStorageKeyForDoNotShowWarning
            && jitsiLocalStorage.getItem(localStorageKeyForDoNotShowWarning)
                === 'true') {
            // there is a setting to not show this dialog
            return state;
        }

        return assign(state, {
            component: action.component,
            componentProps: action.componentProps
        });
    }
    }

    return state;
});
