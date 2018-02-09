const GOOGLE_API_CLIENT_LIBRARY_URL = 'https://apis.google.com/js/api.js';
const GOOGLE_API_SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly'
].join(' ');

/**
 * A promise for dynamically loading the Google API Client Library.
 *
 * @private
 * @type {Promise}
 */
let googleClientLoadPromise;

/**
 * A singleton for loading and interacting with the Google API.
 */
const googleApi = {
    /**
     * Obtains Google API Client Library, loading the library dynamically if
     * needed.
     *
     * @returns {Promise}
     */
    get() {
        const globalGoogleApi = this._getGoogleApiClient();

        if (!globalGoogleApi) {
            return this.load();
        }

        return Promise.resolve(globalGoogleApi);
    },

    /**
     * Gets the profile for the user signed in to the Google API Client Library.
     *
     * @returns {Promise}
     */
    getCurrentUserProfile() {
        return this.get()
            .then(() => this.isSignedIn())
            .then(isSignedIn => {
                if (!isSignedIn) {
                    return null;
                }

                return this._getGoogleApiClient()
                    .auth2.getAuthInstance()
                    .currentUser.get()
                    .getBasicProfile();
            });
    },

    /**
     * Sets the Google Web Client ID used for authenticating with Google and
     * making Google API requests.
     *
     * @param {string} clientId - The client ID to be used with the API library.
     * @returns {Promise}
     */
    initializeClient(clientId) {
        return this.get()
            .then(api => api.client.init({
                clientId,
                scope: GOOGLE_API_SCOPES
            }));
    },

    /**
     * Checks whether a user is currently authenticated with Google through an
     * initialized Google API Client Library.
     *
     * @returns {Promise}
     */
    isSignedIn() {
        return this.get()
            .then(api => Boolean(api
                && api.auth2
                && api.auth2.getAuthInstance
                && api.auth2.getAuthInstance().isSignedIn
                && api.auth2.getAuthInstance().isSignedIn.get()));
    },

    /**
     * Generates a script tag and downloads the Google API Client Library.
     *
     * @returns {Promise}
     */
    load() {
        if (googleClientLoadPromise) {
            return googleClientLoadPromise;
        }

        googleClientLoadPromise = new Promise((resolve, reject) => {
            const scriptTag = document.createElement('script');

            scriptTag.async = true;
            scriptTag.addEventListener('error', () => {
                scriptTag.remove();

                googleClientLoadPromise = null;

                reject();
            });
            scriptTag.addEventListener('load', resolve);
            scriptTag.type = 'text/javascript';

            scriptTag.src = GOOGLE_API_CLIENT_LIBRARY_URL;

            document.head.appendChild(scriptTag);
        });

        return googleClientLoadPromise
            .then(() => new Promise((resolve, reject) =>
                this._getGoogleApiClient().load('client:auth2', {
                    callback: resolve,
                    onerror: reject
                })))
            .then(() => this._getGoogleApiClient());
    },

    /**
     * Prompts the participant to sign in to the Google API Client Library, even
     * if already signed in.
     *
     * @returns {Promise}
     */
    forceSignIn() {
        return this.get()
            .then(api => api.auth2.getAuthInstance().signIn());
    },

    /**
     * Executes a request for a list of all YouTube broadcasts associated with
     * user currently signed in to the Google API Client Library.
     *
     * @returns {Promise}
     */
    requestAvailableYouTubeBroadcasts() {
        const url = this._getURLForLiveBroadcasts();

        return this.get()
            .then(api => api.client.request(url));
    },

    /**
     * Executes a request to get all live streams associated with a broadcast
     * in YouTube.
     *
     * @param {string} boundStreamID - The bound stream ID associated with a
     * broadcast in YouTube.
     * @returns {Promise}
     */
    requestLiveStreamsForYouTubeBroadcast(boundStreamID) {
        const url = this._getURLForLiveStreams(boundStreamID);

        return this.get()
            .then(api => api.client.request(url));
    },

    /**
     * Prompts the participant to sign in to the Google API Client Library, if
     * not already signed in.
     *
     * @returns {Promise}
     */
    signIn() {
        return this.get()
            .then(() => this.isSignedIn())
            .then(isSignedIn => {
                if (!isSignedIn) {
                    return this.forceSignIn();
                }
            });
    },

    /**
     * Returns the global Google API Client Library object. Direct use of this
     * method is discouraged; instead use the {@link get} method.
     *
     * @private
     * @returns {Object|undefined}
     */
    _getGoogleApiClient() {
        return window.gapi;
    },

    /**
     * Returns the URL to the Google API endpoint for retrieving the currently
     * signed in user's YouTube broadcasts.
     *
     * @private
     * @returns {string}
     */
    _getURLForLiveBroadcasts() {
        return [
            'https://content.googleapis.com/youtube/v3/liveBroadcasts',
            '?broadcastType=persistent',
            '&mine=true&part=id%2Csnippet%2CcontentDetails%2Cstatus'
        ].join('');
    },

    /**
     * Returns the URL to the Google API endpoint for retrieving the live
     * streams associated with a YouTube broadcast's bound stream.
     *
     * @param {string} boundStreamID - The bound stream ID associated with a
     * broadcast in YouTube.
     * @returns {string}
     */
    _getURLForLiveStreams(boundStreamID) {
        return [
            'https://content.googleapis.com/youtube/v3/liveStreams',
            '?part=id%2Csnippet%2Ccdn%2Cstatus',
            `&id=${boundStreamID}`
        ].join('');
    }
};

export default googleApi;
