package com.anonymous.StudyBuddy

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class LockDetectionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        var screenWasOff = false
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
                        screenWasOff = true
                    }
                }
            }
            context.registerReceiver(receiver, filter)
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
        val wasOff = screenWasOff
        screenWasOff = false
        promise.resolve(wasOff)
    }
}
