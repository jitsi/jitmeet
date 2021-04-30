// @flow

import React, { Component } from "react";

import { translate } from "../../base/i18n";
import { getParticipants } from "../../base/participants";
import { connect } from "../../base/redux";

import SpeakerStatsItem from "./SpeakerStatsItem";
import SpeakerStatsLabels from "./SpeakerStatsLabels";

declare var interfaceConfig: Object;

/**
 * The type of the React {@code Component} props of {@link RaiseHandStats}.
 */
type Props = {

    /**
     * The JitsiConference from which stats will be pulled.
     */
    conference: Object,

    /**
     * The JitsiConference from which stats will be pulled.
     */
    _participants: Object[],

    /**
     * The function to translate human-readable text.
     */
    t: Function,
};

/**
 * The type of the React {@code Component} state of {@link RaiseHandStats}.
 */
type State = {
    /**
     * The stats summary provided by the Redux store.
     */
    participants: Object[]
};

/**
 * React component for displaying a list of speaker stats.
 *
 * @extends Component
 */
class RaiseHandStats extends Component<Props, State> {
    _updateInterval: IntervalID;

    /**
     * Initializes a new RaiseHandStats instance.
     *
     * @param {Object} props - The read-only React Component props with which
     * the new instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            participants: props._participants
        };

        // Bind event handlers so they are only bound once per instance.
        this._updateStats = this._updateStats.bind(this);
    }

    /**
     * Begin polling for speaker stats updates.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._updateInterval = setInterval(this._updateStats, 1000);
    }

    /**
     * Stop polling for speaker stats updates.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        clearInterval(this._updateInterval);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const items = this.state.participants.filter((p) => p.raisedHandAt).sort((a, b) => {
            if (a.raisedHandAt < b.raisedHandAt) {
                return -1;
            }
            if (a.raisedHandAt > b.raisedHandAt) {
                return 1;
            }
            return 0;
        }).map((p) => this._createStatsItem(p));

        return (
            <div className="speaker-stats">
                <SpeakerStatsLabels raisedHand />
                {items}
            </div>
        );
    }

    /**
     * Create a SpeakerStatsItem instance for the passed in participant.
     *
     * @param {object} participant -  Participant used to look up the associated
     * speaker stats from the Redux store.
     * @returns {SpeakerStatsItem|null}
     * @private
     */
    _createStatsItem(participant) {
        if (!participant || !participant.raisedHandAt) {
            return null;
        }

        const { t } = this.props;
        const meString = t("me");

        let displayName = participant.name;
        
        if (participant.local) {
            displayName = `${displayName} (${meString})`;
        }

        return (
            <SpeakerStatsItem
                displayName={displayName}
                dominantSpeakerTime={(Date.now() - participant.raisedHandAt)}
                hasLeft={false}
                isDominantSpeaker={participant.dominantSpeaker}
                key={participant.id}
            />
        );
    }

    _updateStats: () => void;

    /**
     * Update the internal state with the latest speaker stats.
     *
     * @returns {void}
     * @private
     */
    _updateStats() {
        const participants = this.props._participants;

        this.setState({ participants });
    }
}

/**
 * Maps (parts of) the redux state to the associated SpeakerStats's props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {{
 *     _localDisplayName: ?string
 * }}
 */
function _mapStateToProps(state) {
    return {
        /**
         * The local display name.
         *
         * @private
         * @type {string|undefined}
         */
        _participants: getParticipants(state)
    };
}

export default translate(connect(_mapStateToProps)(RaiseHandStats));
