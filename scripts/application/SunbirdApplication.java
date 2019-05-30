package org.sunbird;

import android.support.multidex.MultiDexApplication;

import com.crashlytics.android.Crashlytics;

import org.sunbird.config.BuildConfigUtil;

import io.fabric.sdk.android.Fabric;

/**
 * Created by swayangjit on 12/4/19.
 */
public class SunbirdApplication extends MultiDexApplication {
  public static final String PACKAGE_NAME = "org.sunbird.app";
  @Override
  public void onCreate() {
    super.onCreate();
    initCrashlytics();
  }
  private void initCrashlytics() {
    if (BuildConfigUtil.getBuildConfigValue(PACKAGE_NAME, "USE_CRASHLYTICS")) {
      Fabric.with(this, new Crashlytics());
    }
  }
}
