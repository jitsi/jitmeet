// @flow

import React, { Component } from 'react';
import type { Dispatch } from 'redux';

import { InputDialog } from '../../base/dialog';
import { connect } from '../../base/redux';

import { endRoomLockRequest } from '../actions';

/**
 * The style of the {@link TextInput} rendered by {@code RoomLockPrompt}. As it
 * requests the entry of a password, {@code TextInput} automatically correcting
 * the entry of the password is a pain to deal with as a user.
 */
const _TEXT_INPUT_PROPS = {
    autoCapitalize: 'none',
    autoCorrect: false
};

/**
 * The style of the {@link TextInput} rendered by {@code RoomLockPrompt} when
 * only digits are required.
 */
const _DIGITS_INPUT_PROPS = {
    keyboardType: 'number-pad',
    maxLength: 10
};

/**
 * The type of the React {@code Component} props of {@link RoomLockPrompt}.
 */
type Props = {

    /**
     * The JitsiConference which requires a password.
     */
    conference: Object,

    /**
     * Whether passwords are only digits.
     */
    digitOnlyPasswords: boolean,

    /**
     * Redux store dispatch function.
     */
    dispatch: Dispatch<any>
};

/**
 * Implements a React Component which prompts the user for a password to lock  a
 * conference/room.
 */
class RoomLockPrompt extends Component<Props> {
    /**
     * Initializes a new RoomLockPrompt instance.
     *
     * @param {Props} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onCancel = this._onCancel.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        let textInputProps = _TEXT_INPUT_PROPS;

        if (this.props.digitOnlyPasswords) {
            textInputProps = {
                ...textInputProps,
                ..._DIGITS_INPUT_PROPS
            };
        }

        return (
            <InputDialog
                contentKey = 'dialog.passwordLabel'
                onCancel = { this._onCancel }
                onSubmit = { this._onSubmit }
                textInputProps = { textInputProps } />
        );
    }

    _onCancel: () => boolean;

    /**
     * Notifies this prompt that it has been dismissed by cancel.
     *
     * @private
     * @returns {boolean} True to hide this dialog/prompt; otherwise, false.
     */
    _onCancel() {
        // An undefined password is understood to cancel the request to lock the
        // conference/room.
        return this._onSubmit(undefined);
    }

    _onSubmit: (?string) => boolean;

    /**
     * Notifies this prompt that it has been dismissed by submitting a specific
     * value.
     *
     * @param {string|undefined} value - The submitted value.
     * @private
     * @returns {boolean} False because we do not want to hide this
     * dialog/prompt as the hiding will be handled inside endRoomLockRequest
     * after setting the password is resolved.
     */
    _onSubmit(value: ?string) {
        this.props.dispatch(endRoomLockRequest(this.props.conference, value));

        return false; // Do not hide.
    }
}

export default connect()(RoomLockPrompt);
