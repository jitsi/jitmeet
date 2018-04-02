// @flow

import React from 'react';
import { TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';

import { Icon } from '../../base/font-icons';

import AbstractToolbarButton from './AbstractToolbarButton';
import type {
    Props as AbstractToolbarButtonProps
} from './AbstractToolbarButton';

/**
 * The type of the React {@link Component} props of {@link ToolbarButton}.
 */
type Props = AbstractToolbarButtonProps & {

    /**
     * Indicates whether this {@code ToolbarButton} is disabled.
     */
    disabled: boolean
};

/**
 * Represents a button in {@link Toolbar} on React Native.
 *
 * @extends AbstractToolbarButton
 */
class ToolbarButton extends AbstractToolbarButton<Props> {
    _onClick: () => void;

    /**
     * Renders the button of this {@code ToolbarButton}.
     *
     * @param {Object} children - The children, if any, to be rendered inside
     * the button. Presumably, contains the icon of this {@code ToolbarButton}.
     * @protected
     * @returns {ReactElement} The button of this {@code ToolbarButton}.
     */
    _renderButton(children) {
        const props = {};

        'accessibilityLabel' in this.props
            && (props.accessibilityLabel = this.props.accessibilityLabel);
        'disabled' in this.props && (props.disabled = this.props.disabled);
        'onClick' in this.props && (props.onPress = this._onClick);
        'style' in this.props && (props.style = this.props.style);
        'underlayColor' in this.props
            && (props.underlayColor = this.props.underlayColor);

        return React.createElement(TouchableHighlight, props, children);
    }

    /**
     * Renders the icon of this {@code ToolbarButton}.
     *
     * @inheritdoc
     */
    _renderIcon() {
        return super._renderIcon(Icon);
    }
}

export default connect()(ToolbarButton);
