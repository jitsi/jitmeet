/**
 * The type of Redux action which signals that the list of known available
 * audio and video sources has changed.
 *
 * {
 *     type: UPDATE_DEVICE_LIST,
 *     devices: Array<MediaDeviceInfo>,
 * }
 */
export const UPDATE_DEVICE_LIST = 'UPDATE_DEVICE_LIST';

/**
 * The type of Redux action which will add a pending device requests that will
 * be executed later when it is possible (when the conference is joined).
 *
 * {
 *     type: ADD_PENDING_DEVICE_REQUEST,
 *     request: Object
 * }
 */
export const ADD_PENDING_DEVICE_REQUEST = 'ADD_PENDING_DEVICE_REQUEST';

/**
 * The type of Redux action which will remove all pending device requests.
 *
 * {
 *     type: REMOVE_PENDING_DEVICE_REQUESTS
 * }
 */
export const REMOVE_PENDING_DEVICE_REQUESTS = 'REMOVE_PENDING_DEVICE_REQUESTS';
