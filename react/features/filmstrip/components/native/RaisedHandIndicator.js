// @flow

import React from 'react';

import { IconRaisedHand } from '../../../base/icons';
import { BaseIndicator } from '../../../base/react';
import { connect } from '../../../base/redux';
import AbstractRaisedHandIndicator, {
    type Props as AbstractProps,
    _mapStateToProps
} from '../AbstractRaisedHandIndicator';

/**
 * The type of the React {@code Component} props of {@link RaisedHandIndicator}.
 */
 type Props = AbstractProps & {
    /**
     * Boolean to check if is the first who raised hand.
     */
    first: Boolean
};

/**
 * Thumbnail badge showing that the participant would like to speak.
 *
 * @extends Component
 */
class RaisedHandIndicator extends AbstractRaisedHandIndicator<Props> {
    /**
     * Renders the platform specific indicator element.
     *
     * @returns {React$Element<*>}
     */
    _renderIndicator() {
        return (
            <BaseIndicator
                className = { `${this.props.first ? 'raisehandindicatorfirst' : 'raisehandindicator'} indicator show-inline` }
                highlight = { true }
                icon = { IconRaisedHand } />
        );
    }
}

export default connect(_mapStateToProps)(RaisedHandIndicator);
