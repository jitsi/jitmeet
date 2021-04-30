// @flow

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { getLobbyState } from '../../lobby/functions';

import { LobbyParticipantItem } from './LobbyParticipantItem';
import { Heading } from './styled';

export const LobbyParticipantList = () => {
    const {
        lobbyEnabled,
        knockingParticipants: participants
    } = useSelector(getLobbyState);
    const { t } = useTranslation();

    if (!lobbyEnabled || !participants.length) {
        return null;
    }

    const isFirstRaisedHand = (id) => {
        const first = [...participants].filter((p) => p.raisedHandAt).sort((a, b) => {
            if (a.raisedHandAt < b.raisedHandAt) {
                return -1;
            }
            if (a.raisedHandAt > b.raisedHandAt) {
                return 1;
            }
            return 0;
        })[0];

        return first && first.id === id;
    };

    return (
    <>
        <Heading>{t('participantsPane.headings.lobby', { count: participants.length })}</Heading>
        <div>
            {participants.map(p => (
                <LobbyParticipantItem
                    key = { p.id }
                    participant = { p }
                    isFirst = { isFirstRaisedHand(p.id) } />)
            )}
        </div>
    </>
    );
};
