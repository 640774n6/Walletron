package com.bholland.tronclient;

import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;

public class TronClientModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public TronClientModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "TronClient";
    }

    @ReactMethod 
    public void getAccount(String accountAddress, Promise promise) {
      promise.resolve(null);
    }
}
