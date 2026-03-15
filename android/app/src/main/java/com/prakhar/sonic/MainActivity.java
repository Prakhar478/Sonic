package com.prakhar.sonic;

import android.os.Bundle;
import android.view.WindowManager;
import android.content.Intent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(YouTubeMusicPlugin.class);
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        Intent serviceIntent = new Intent(this, MediaPlaybackService.class);
        startForegroundService(serviceIntent);
    }
}
