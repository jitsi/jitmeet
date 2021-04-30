// @flow

import React from 'react';

import { Icon, IconRaisedHandHollow } from '../../base/icons';

import { RaisedHandIndicatorBackground, FirstRaisedHandIndicatorBackground } from './styled';

type Props = {

    /**
     * Boolean to check if is the first who raised hand.
     */
    isFirst: Boolean
}

export const RaisedHandIndicator = ({ isFirst }: Props) => {
    if (isFirst) {
        return (
            <FirstRaisedHandIndicatorBackground>
                <Icon
                    size = { 15 }
                    src = { IconRaisedHandHollow } />
            </FirstRaisedHandIndicatorBackground>)
    }

    return (
        <RaisedHandIndicatorBackground>
            <Icon
                size = { 15 }
                src = { IconRaisedHandHollow } />
        </RaisedHandIndicatorBackground>)
}
