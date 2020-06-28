// @flow

import { getAmplitudeIdentity } from '../analytics';
import {
    CONFERENCE_JOINED
} from '../base/conference';
import { LIB_WILL_INIT } from '../base/lib-jitsi-meet';
import { MiddlewareRegistry } from '../base/redux';

import RTCStats from './RTCStats';
import logger from './logger';

/**
 * Middleware which intercepts lib-jitsi-meet initialization and conference join in order init the
 * rtcstats-client.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const state = store.getState();
    const config = state['features/base/config'];
    const { analytics } = config;

    switch (action.type) {
    case LIB_WILL_INIT: {
        if (analytics.rtcstatsEndpoint) {
            // RTCStats "proxies" WebRTC functions such as GUM and RTCPeerConnection by rewriting the global
            // window functions. Because lib-jitsi-meet uses references to those functions that are taken on
            // init, we need to add these proxies before it initializes, otherwise lib-jitsi-meet will use the
            // original non proxy versions of these functions.
            try {
                // Initialize but don't connect to the rtcstats server wss, as it will start sending data for all
                // media calls made even before the conference started.
                RTCStats.init({
                    rtcstatsEndpoint: analytics.rtcstatsEndpoint,
                    rtcstatsPollInterval: analytics.rtcstatsPollInterval
                });
            } catch (error) {
                logger.error('Failed to initialize RTCStats: ', error);
            }
        }
        break;
    }
    case CONFERENCE_JOINED: {
        if (analytics.rtcstatsEndpoint) {
            // Once the conference started connect to the rtcstats server and send data.
            try {
                RTCStats.connect();

                // The current implementation of rtcstats-server is configured to send data to amplitude, thus
                // we add identity specific information so we can corelate on the amplitude side. If amplitude is
                // not configured an empty object will be sent.
                RTCStats.sendIdentityData({
                    ...getAmplitudeIdentity(),
                    ...config
                });
            } catch (error) {
                // If the connection failed do not impact jitsi-meet just silently fail.
                logger.error('RTCStats connect failed with: ', error);
            }
        }
        break;
    }
    }

    return next(action);
});
