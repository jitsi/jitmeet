// @flow

import React, { type Node, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '../../base/avatar';
import {
    Icon,
    IconCameraEmpty,
    IconCameraEmptyDisabled,
    IconMicrophoneEmpty,
    IconMicrophoneEmptySlash
} from '../../base/icons';
import { ActionTrigger, MediaState } from '../constants';

import { RaisedHandIndicator } from './RaisedHandIndicator';
import TimeElapsed from '../../speaker-stats/components/TimeElapsed';
import {
    ParticipantActionsHover,
    ParticipantActionsPermanent,
    ParticipantContainer,
    ParticipantContent,
    ParticipantName,
    ParticipantNameContainer,
    ParticipantStates
} from './styled';

/**
 * Participant actions component mapping depending on trigger type.
 */
const Actions = {
    [ActionTrigger.Hover]: ParticipantActionsHover,
    [ActionTrigger.Permanent]: ParticipantActionsPermanent
};

/**
 * Icon mapping for possible participant audio states.
 */
const AudioStateIcons = {
    [MediaState.ForceMuted]: (
        <Icon
            size = { 16 }
            src = { IconMicrophoneEmptySlash } />
    ),
    [MediaState.Muted]: (
        <Icon
            size = { 16 }
            src = { IconMicrophoneEmptySlash } />
    ),
    [MediaState.Unmuted]: (
        <Icon
            size = { 16 }
            src = { IconMicrophoneEmpty } />
    ),
    [MediaState.None]: null
};

/**
 * Icon mapping for possible participant video states.
 */
const VideoStateIcons = {
    [MediaState.ForceMuted]: (
        <Icon
            size = { 16 }
            src = { IconCameraEmptyDisabled } />
    ),
    [MediaState.Muted]: (
        <Icon
            size = { 16 }
            src = { IconCameraEmptyDisabled } />
    ),
    [MediaState.Unmuted]: (
        <Icon
            size = { 16 }
            src = { IconCameraEmpty } />
    ),
    [MediaState.None]: null
};

type Props = {

    /**
     * Type of trigger for the participant actions
     */
    actionsTrigger: ActionTrigger,

    /**
     * Media state for audio
     */
    audioMuteState: MediaState,

    /**
     * React children
     */
    children: Node,

    /**
     * Boolean to check if is the first who raised hand.
     */
    isFirst: Boolean,

    /**
     * Is this item highlighted/raised
     */
    isHighlighted?: boolean,

    /**
     * Callback for when the mouse leaves this component
     */
    onLeave?: Function,

    /**
     * Participant reference
     */
    participant: Object,

    /**
     * Media state for video
     */
    videoMuteState: MediaState
}

export const ParticipantItem = ({
    children,
    isFirst,
    isHighlighted,
    onLeave,
    actionsTrigger = ActionTrigger.Hover,
    audioMuteState = MediaState.None,
    videoMuteState = MediaState.None,
    participant: p
}: Props) => {
    const ParticipantActions = Actions[actionsTrigger];
    const { t } = useTranslation();
    const [waitingTime, setWaitingTime] = useState(Date.now() - p.raisedHandAt);
    const [showHandTime, setShowHandTime] = useState(false);

    useEffect(() => {
        const timeInterval = setInterval(() => {
            const tm = p.raisedHandAt ? Date.now() - p.raisedHandAt : 0;
            setWaitingTime(isNaN(tm) ? 0 : tm);
        }, 1000);

        return () => clearInterval(timeInterval);
    }, [p]);

    return (
        <ParticipantContainer
            isHighlighted = { isHighlighted }
            onMouseLeave = { (e) => { onLeave(e); setShowHandTime(false); } }
            onMouseEnter = { () => setShowHandTime(true) }
            trigger = { actionsTrigger }>
            <Avatar
                className = 'participant-avatar'
                participantId = { p.id }
                size = { 32 } />
            <ParticipantContent>
                <ParticipantNameContainer>
                    <ParticipantName>
                        { p.name }
                    </ParticipantName>
                    { p.local ? <span>&nbsp;({t('chat.you')})</span> : null }
                </ParticipantNameContainer>
                { !p.local && <ParticipantActions children = { children } /> }
                <ParticipantStates>
                    {p.raisedHand && <RaisedHandIndicator isFirst = { isFirst } />}
                    {showHandTime && p.raisedHandAt && <TimeElapsed time = { waitingTime } />}
                    {VideoStateIcons[videoMuteState]}
                    {AudioStateIcons[audioMuteState]}
                </ParticipantStates>
            </ParticipantContent>
        </ParticipantContainer>
    );
};
