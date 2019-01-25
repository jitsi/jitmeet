package org.jitsi.meet.sdk.connection_service;

import android.os.Build;
import android.support.annotation.RequiresApi;
import android.telecom.CallAudioState;
import android.telecom.Connection;
import android.telecom.DisconnectCause;
import android.telecom.PhoneAccountHandle;
import android.telecom.TelecomManager;
import android.util.Log;

import com.facebook.react.bridge.WritableNativeMap;

import org.jitsi.meet.sdk.AudioModeModule;
import org.jitsi.meet.sdk.ReactContextUtils;
import org.jitsi.meet.sdk.ReactInstanceManagerHolder;

/**
 * Connection implementation for Jitsi Meet's {@link ConnectionService}.
 *
 * @author Pawel Domas
 */
@RequiresApi(api = Build.VERSION_CODES.O)
public class ConnectionImpl extends Connection {

    /**
     * The constant which defines the key for the "has video" property. The key
     * is used in the map which carries the call's state passed as the arugment
     * of the {@link RNConnectionService#updateCall} method.
     */
    static final String KEY_HAS_VIDEO = "hasVideo";

    /**
     * The logger's TAG.
     * FIXME use MODULE_NAME constant
     */
    private static final String TAG = ConnectionService.TAG;

    private final ConnectionService service;

    ConnectionImpl(ConnectionService service) {
        this.service = service;
    }

    /**
     * Called when system wants to disconnect the call.
     *
     * {@inheritDoc}
     */
    @Override
    public void onDisconnect() {
        Log.d(TAG, "onDisconnect " + getCallUUID());
        WritableNativeMap data = new WritableNativeMap();
        data.putString("callUUID", getCallUUID());
        ReactContextUtils.emitEvent(
                    null,
                    "org.jitsi.meet:features/connection_service#disconnect",
                    data);
    }

    /**
     * Called when system wants to abort the call.
     *
     * {@inheritDoc}
     */
    @Override
    public void onAbort() {
        Log.d(TAG, "onAbort " + getCallUUID());
        WritableNativeMap data = new WritableNativeMap();
        data.putString("callUUID", getCallUUID());
        ReactContextUtils.emitEvent(
                null,
                "org.jitsi.meet:features/connection_service#abort",
                data);
    }

    /**
     * Called when there's change to the call audio state. Either by the system
     * after the connection is initialized or in response to
     * {@link #setAudioRoute(int)}.
     *
     * @param state the new {@link CallAudioState}
     */
    @Override
    public void onCallAudioStateChanged(CallAudioState state) {
        Log.d(TAG, "onCallAudioStateChanged: " + state);
        AudioModeModule audioModeModule
            = ReactInstanceManagerHolder
                    .getNativeModule(AudioModeModule.class);
        if (audioModeModule != null) {
            audioModeModule.onCallAudioStateChange(state);
        }
    }

    /**
     * Unregisters the account when the call is disconnected.
     *
     * @param state - the new connection's state.
     */
    @Override
    public void onStateChanged(int state) {
        Log.d(TAG,
              String.format("onStateChanged: %s %s",
                            Connection.stateToString(state),
                            getCallUUID()));

        if (state == STATE_DISCONNECTED) {
            ConnectionList.getInstance().remove(this);
            TelecomManager telecom
                = service.getSystemService(TelecomManager.class);
            if (telecom != null) {
                PhoneAccountHandle account = getPhoneAccountHandle();
                if (account != null) {
                    telecom.unregisterPhoneAccount(account);
                }
            }
        }
    }

    /**
     * Retrieves the UUID of the call associated with this connection.
     *
     * @return call UUID
     */
    String getCallUUID() {
        return getExtras().getString(ConnectionService.EXTRAS_CALL_UUID);
    }

    private PhoneAccountHandle getPhoneAccountHandle() {
        return getExtras().getParcelable(
                ConnectionService.EXTRA_PHONE_ACCOUNT_HANDLE);
    }

    @Override
    public String toString() {
        return String.format(
                "ConnectionImpl[adress=%s, uuid=%s]@%d",
                getAddress(), getCallUUID(), hashCode());
    }
}