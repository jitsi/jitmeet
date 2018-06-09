// @flow

import AbstractGoogleClient from './AbstractGoogleClient';

const GOOGLE_API_CLIENT_LIBRARY_URL = 'https://apis.google.com/js/api.js';

/**
 * A class for loading and interacting with the Google API.
 *
 * @extends AbstractGoogleClient
 */
export default class WebGoogleClient extends AbstractGoogleClient {
    googleClientLoadPromise: ?Promise<*>;

    /**
     * Initializes a new WebGoogleClient instance.
     */
    constructor() {
        super();

        /**
         * A promise for dynamically loading the Google API Client Library.
         *
         * @private
         * @type {Promise|null}
         */
        this.googleClientLoadPromise = null;
    }

    /**
     * Sets the Google Web Client ID used for authenticating with Google and
     * making Google API requests.
     *
     * @param {string} clientId - The client ID to be used with the API library.
     * @returns {Promise}
     */
    initializeClientId(clientId: string): Promise<*> {
        return this.get()
            .then(api => new Promise((resolve, reject) => {
                // setTimeout is used as a workaround for api.client.init not
                // resolving consistently when the Google API Client Library is
                // loaded asynchronously. See:
                // github.com/google/google-api-javascript-client/issues/399
                setTimeout(() => {
                    api.client.init({
                        clientId,
                        scope: this._getApiScope()
                    })
                    .then(resolve)
                    .catch(reject);
                }, 500);
            }));
    }

    /**
     * Checks whether a user is currently authenticated with Google through an
     * initialized Google API Client Library.
     *
     * @returns {Promise}
     */
    isSignedIn(): Promise<*> {
        return this.get()
            .then(api => Boolean(api
                && api.auth2
                && api.auth2.getAuthInstance
                && api.auth2.getAuthInstance().isSignedIn
                && api.auth2.getAuthInstance().isSignedIn.get()));
    }

    /**
     * Executes a request for a list of all YouTube broadcasts associated with
     * user currently signed in to the Google API Client Library.
     *
     * @returns {Promise}
     */
    requestAvailableYouTubeBroadcasts(): Promise<*> {
        const url = this._getURLForLiveBroadcasts();

        return this.get()
            .then(api => api.client.request(url));
    }

    /**
     * Executes a request to get all live streams associated with a broadcast
     * in YouTube.
     *
     * @param {string} boundStreamID - The bound stream ID associated with a
     * broadcast in YouTube.
     * @returns {Promise}
     */
    requestLiveStreamsForYouTubeBroadcast(boundStreamID: string): Promise<*> {
        const url = this._getURLForLiveStreams({ id: boundStreamID });

        return this.get()
            .then(api => api.client.request(url));
    }

    /**
     * Prompts the participant to sign in to the Google API Client Library, even
     * if already signed in.
     *
     * @returns {Promise}
     */
    showAccountSelection(): Promise<*> {
        return this.get()
            .then(api => api.auth2.getAuthInstance().signIn());
    }

    _getApiScope: () => string;

    /**
     * Returns the global Google API Client Library object. Direct use of this
     * method is discouraged; instead use the {@link get} method.
     *
     * @private
     * @returns {Object|undefined}
     */
    _getGoogleApiClient() {
        return window.gapi;
    }

    /**
     * Fetches the local participant's Google profile information.
     *
     * @private
     * @returns {Promise<Object>}
     */
    _getUserProfile(): Promise<*> {
        return this.get()
            .then(api => {
                const profile = api.auth2.getAuthInstance()
                    .currentUser.get()
                    .getBasicProfile();

                return {
                    email: profile.getEmail()
                };
            });
    }

    _getURLForLiveBroadcasts: (?Object) => string;

    _getURLForLiveStreams: (Object) => string;

    /**
     * Generates a script tag and downloads the Google API Client Library.
     *
     * @returns {Promise}
     */
    _load(): Promise<*> {
        if (this.googleClientLoadPromise) {
            return this.googleClientLoadPromise;
        }

        if (this._getGoogleApiClient()) {
            return Promise.resolve(this._getGoogleApiClient());
        }

        this.googleClientLoadPromise = new Promise((resolve, reject) => {
            const scriptTag = document.createElement('script');

            scriptTag.async = true;
            scriptTag.addEventListener('error', () => {
                scriptTag.remove();

                this.googleClientLoadPromise = null;

                reject();
            });
            scriptTag.addEventListener('load', resolve);
            scriptTag.type = 'text/javascript';

            scriptTag.src = GOOGLE_API_CLIENT_LIBRARY_URL;

            document.head
                && document.head.appendChild(scriptTag);
        })
            .then(() => new Promise((resolve, reject) =>
                this._getGoogleApiClient().load('client:auth2', {
                    callback: resolve,
                    onerror: reject
                })))
            .then(() => this._getGoogleApiClient());

        return this.googleClientLoadPromise;
    }
}
