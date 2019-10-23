package org.sunbird.app;

import org.apache.cordova.CordovaActivity;


/**
 * Created by swayangjit on 16/10/19.
 */
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;

public class MainActivity extends CordovaActivity
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        // enable Cordova apps to be started in the background
        Bundle extras = getIntent().getExtras();
        if (extras != null && extras.getBoolean("cdvStartInBackground", false)) {
            moveTaskToBack(true);
        }

        // Set by <content src="index.html" /> in config.xml
        loadUrl(launchUrl);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        // Forward back key events to the web view.
        if (this.appView != null && event.getKeyCode() == KeyEvent.KEYCODE_BACK) {
            View webview = this.appView.getView();

            if (webview != null) {
                webview.dispatchKeyEvent(event);
            }

            return true;
        }

        return super.dispatchKeyEvent(event);
    }
}
