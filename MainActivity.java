package org.sunbird.app;
/**
 * Created by swayangjit on 16/10/19.
 */
import android.os.Bundle;
import android.view.KeyEvent;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Enable Capacitor apps to be started in the background
        boolean startInBackground = getIntent().getBooleanExtra("cdvStartInBackground", false);
        if (startInBackground) {
            moveTaskToBack(true);
        }

        load();
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        // Forward back key events to the web view.
        if (getBridge().getWebView() != null && event.getKeyCode() == KeyEvent.KEYCODE_BACK) {
            getBridge().getWebView().dispatchKeyEvent(event);
            return true;
        }
        return super.dispatchKeyEvent(event);
    }
}