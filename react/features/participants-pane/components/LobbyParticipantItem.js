// @flow

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { setKnockingParticipantApproval } from '../../lobby/actions';
import { ActionTrigger, MediaState } from '../constants';

import { ParticipantItem } from './ParticipantItem';
import { ParticipantActionButton } from './styled';

type Props = {

    /**
     * Boolean to check if is the first who raised hand.
     */
    isFirst: Boolean,

    /**
     * Participant reference
     */
    participant: Object
};

export const LobbyParticipantItem = ({ participant: p, isFirst: isFirst }: Props) => {
    const dispatch = useDispatch();
    const admit = useCallback(() => dispatch(setKnockingParticipantApproval(p.id, true), [ dispatch ]));
    const reject = useCallback(() => dispatch(setKnockingParticipantApproval(p.id, false), [ dispatch ]));
    const { t } = useTranslation();

    return (
        <ParticipantItem
            actionsTrigger = { ActionTrigger.Permanent }
            audioMuteState = { MediaState.None }
            participant = { p }
            videoMuteState = { MediaState.None }
            isFirst = { true }>
            <ParticipantActionButton
                onClick = { reject }>
                {t('lobby.reject')}
            </ParticipantActionButton>
            <ParticipantActionButton
                onClick = { admit }
                primary = { true }>
                {t('lobby.admit')}
            </ParticipantActionButton>
        </ParticipantItem>
    );
};
