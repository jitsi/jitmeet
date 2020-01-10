package org.jitsi.meet.sdk;

import androidx.core.app.ActivityCompat;

import com.facebook.react.modules.core.PermissionAwareActivity;

/**
 * This interface serves as the umbrella interface that applications not using
 * {@code JitsiMeetActivity} must implement in order to ensure full
 * functionality.
 */
public interface JitsiMeetActivityInterface
    extends ActivityCompat.OnRequestPermissionsResultCallback,
            PermissionAwareActivity {
}
