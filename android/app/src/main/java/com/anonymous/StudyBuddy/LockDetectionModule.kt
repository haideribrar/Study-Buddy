package com.anonymous.StudyBuddy

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.PowerManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class LockDetectionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        var receiverRegistered = false
        var receiver: BroadcastReceiver? = null
        
        fun registerReceiverIfNeeded(context: Context) {
            if (receiverRegistered) return
            
            val filter = IntentFilter()
            filter.addAction(Intent.ACTION_SCREEN_OFF)
            filter.addAction(Intent.ACTION_USER_PRESENT)
            
            receiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context?, intent: Intent?) {
                    if (intent?.action == Intent.ACTION_SCREEN_OFF) {
                        context?.let {
                            val prefs = it.getSharedPreferences("LockDetectionPrefs", Context.MODE_PRIVATE)
                            prefs.edit().putBoolean("screenWasOff", true).apply()
                        }
                    }
                }
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
            } else {
                context.registerReceiver(receiver, filter)
            }
            receiverRegistered = true
        }
    }

    init {
        registerReceiverIfNeeded(reactContext.applicationContext)
    }

    override fun getName(): String {
        return "LockDetection"
    }

    @ReactMethod
    fun getAndResetScreenWasOff(promise: Promise) {
        val prefs = reactApplicationContext.getSharedPreferences("LockDetectionPrefs", Context.MODE_PRIVATE)
        val wasOff = prefs.getBoolean("screenWasOff", false)
        if (wasOff) {
            prefs.edit().putBoolean("screenWasOff", false).apply()
        }
        promise.resolve(wasOff)
    }

    @ReactMethod
    fun setScreenWasOff(wasOff: Boolean, promise: Promise) {
        val prefs = reactApplicationContext.getSharedPreferences("LockDetectionPrefs", Context.MODE_PRIVATE)
        prefs.edit().putBoolean("screenWasOff", wasOff).apply()
        promise.resolve(null)
    }

    @ReactMethod
    fun isScreenOn(promise: Promise) {
        try {
            val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            val isOn = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
                powerManager.isInteractive
            } else {
                @Suppress("DEPRECATION")
                powerManager.isScreenOn
            }
            promise.resolve(isOn)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
