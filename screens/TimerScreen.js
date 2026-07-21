import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Platform, AppState, StatusBar } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';


export default function TimerScreen({
  onNavigate,
  onOpenMenu,
  customDuration,
  setCustomDuration,
  secondsLeft,
  setSecondsLeft,
  isRunning,
  setIsRunning,
  isDeepFocus,
  setIsDeepFocus,
  showCheatWarning,
  setShowCheatWarning,
  warningSecondsLeft,
  setWarningSecondsLeft,
  streakLost,
  setStreakLost,
  isSleepingCooldown,
  setIsSleepingCooldown,
  sleepCooldownSeconds,
  setSleepCooldownSeconds,
  isTimerRunningRef,
  isDeepFocusRef,
  showCheatWarningRef,
  isSleepingCooldownRef,
  lastStartedTimeRef,
  leftTimeRef,
  isMenuOpen
}) {
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (isSleepingCooldownRef.current) return;
    const nextRunning = !isRunning;
    isTimerRunningRef.current = nextRunning;
    if (nextRunning) {
      lastStartedTimeRef.current = Date.now();
      leftTimeRef.current = 0;
      if (showCheatWarningRef) showCheatWarningRef.current = false;
      setShowCheatWarning(false);
    }
    setIsRunning(nextRunning);
  };

  const handleReset = () => {
    leftTimeRef.current = 0;
    isTimerRunningRef.current = false;
    if (showCheatWarningRef) showCheatWarningRef.current = false;
    setIsRunning(false);
    setSecondsLeft(customDuration);
    setShowCheatWarning(false);
    setStreakLost(false);
    setWarningSecondsLeft(10);
  };

  // Adjust time duration (+5 min or -5 min) when paused
  const adjustMinutes = (amount) => {
    if (isRunning) return; // Prevent adjustment mid-countdown
    
    const newMinutes = Math.max(5, Math.floor(customDuration / 60) + amount * 5); // Minimum 5 minutes
    const newSeconds = newMinutes * 60;

    setCustomDuration(newSeconds);
    setSecondsLeft(newSeconds);
  };

  const handleResumeSaveStreak = () => {
    leftTimeRef.current = 0;
    if (showCheatWarningRef) showCheatWarningRef.current = false;
    setShowCheatWarning(false);
    setStreakLost(false);
    isTimerRunningRef.current = true;
    setIsRunning(true);
  };

  const navItems = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'chatbot', icon: 'message-square', label: 'Buddy' },
    { id: 'timer', icon: 'clock', label: 'Timer' },
    { id: 'progress', icon: 'bar-chart-2', label: 'Progress' }
  ];

  return (
    <View style={tw`flex-grow flex-1 bg-[#F8FAFC]`}>
      {/* Glass Header */}
      <SafeAreaView style={[
        tw`bg-white/80 backdrop-blur-md border-b border-slate-200/50`,
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0 }
      ]}>

        <View style={tw`flex-row items-center justify-between px-6 pt-3 pb-4`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity 
              onPress={onOpenMenu}
              style={tw`mr-3.5 w-9 h-9 bg-white border border-slate-200/60 rounded-full items-center justify-center shadow-xs`}
            >
              <Feather name="menu" size={16} color="#6366F1" />
            </TouchableOpacity>
            <Text style={tw`text-lg font-bold text-slate-900 tracking-tight`}>Study Timer</Text>
          </View>
          <Feather name="clock" size={18} color="#6366F1" />
        </View>
      </SafeAreaView>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`flex-grow items-center justify-center px-6 pb-32 pt-4`}>
        {/* Cheat/Distraction Warning Overlay */}
        {showCheatWarning || isSleepingCooldown ? (
          <View style={tw`bg-white/90 border border-indigo-100 rounded-[32px] w-full max-w-sm p-6 items-center shadow-xl shadow-indigo-500/10 mb-6 backdrop-blur-md`}>
            {streakLost || isSleepingCooldown ? (
              /* Study Buddy Sleeping 10-Minute Cooldown Screen */
              <View style={tw`items-center w-full`}>
                <View style={tw`w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full items-center justify-center mb-3 shadow-xs`}>
                  <Text style={tw`text-3xl`}>😴</Text>
                </View>
                <Text style={tw`text-base font-bold text-slate-900 mb-1 text-center`}>Study Buddy is Asleep 💤</Text>
                <Text style={tw`text-slate-500 text-xs text-center leading-relaxed font-medium mb-4 px-2`}>
                  You left the screen for more than 10 seconds! Study Buddy fell fast asleep and is in a 10-minute sleep cooldown.
                </Text>

                {/* 10-Minute Cooldown Countdown */}
                <View style={tw`bg-indigo-50 border border-indigo-100 rounded-full px-5 py-2 mb-2 shadow-xs`}>
                  <Text style={tw`text-xl font-extrabold text-indigo-600`}>
                    {formatTime(sleepCooldownSeconds)}
                  </Text>
                </View>
                <Text style={tw`text-[10px] font-bold text-indigo-500 uppercase tracking-wide mb-5`}>
                  🔒 Mandatory 10m Sleep Cooldown Active
                </Text>

                <View style={tw`w-full bg-slate-100/80 border border-slate-200/60 rounded-full py-3.5 items-center`}>
                  <Text style={tw`text-slate-400 font-bold text-xs uppercase tracking-wide`}>
                    😴 Buddy Wakes Up Automatically at 00:00
                  </Text>
                </View>
              </View>
            ) : (
              /* Active 10-Second Rescue Warning Countdown */
              <View style={tw`items-center w-full`}>
                <View style={tw`w-16 h-16 bg-amber-50 border border-amber-100 rounded-full items-center justify-center mb-3 shadow-xs`}>
                  <Text style={tw`text-3xl`}>😴</Text>
                </View>
                
                {/* 10s countdown display */}
                <View style={tw`bg-rose-50 border border-rose-100 rounded-full px-4 py-1 mb-3 shadow-xs`}>
                  <Text style={tw`text-lg font-extrabold text-rose-500`}>00:{warningSecondsLeft.toString().padStart(2, '0')}</Text>
                </View>

                <Text style={tw`text-sm font-bold text-slate-900 mb-1 text-center`}>
                  Study Buddy is Getting Sleepy! 💤
                </Text>
                <Text style={tw`text-slate-500 text-[11px] text-center leading-relaxed font-medium mb-5 px-1`}>
                  Return to the app before the 10-second timer expires or Buddy will fall asleep for 10 minutes!
                </Text>

                {/* Upper Option: Rescue Focus */}
                <TouchableOpacity
                  onPress={handleResumeSaveStreak}
                  style={[tw`w-full rounded-full py-3.5 items-center shadow-md mb-3`, { backgroundColor: '#4F46E5' }]}
                >
                  <Text style={tw`text-white font-bold text-xs uppercase tracking-wide`}>
                    🛡️ Resume Focus & Keep Buddy Awake
                  </Text>
                </TouchableOpacity>

                {/* Lower Option: Reset Timer */}
                <TouchableOpacity
                  onPress={handleReset}
                  style={tw`w-full bg-slate-50 border border-slate-200/80 rounded-full py-3.5 items-center shadow-xs`}
                >
                  <Text style={tw`text-slate-700 font-bold text-xs uppercase tracking-wide`}>
                    Reset Session
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : isRunning && isDeepFocus ? (
          /* Active Deep Focus Layout with Awake Mascot */
          <View style={tw`bg-white border border-slate-200/80 rounded-[48px] w-full max-w-sm p-8 items-center shadow-lg shadow-indigo-500/5 mb-6`}>
            <View style={tw`w-52 h-52 bg-indigo-50/60 border-4 border-indigo-100 rounded-full items-center justify-center relative mb-5 shadow-inner`}>
              <View style={tw`w-40 h-40 bg-white border border-indigo-100 rounded-full items-center justify-center shadow-sm`}>
                <Text style={tw`text-3xl mb-1`}>🧠</Text>
                <Text style={tw`text-3xl font-extrabold text-slate-900 tracking-tight`}>
                  {formatTime(secondsLeft)}
                </Text>
              </View>
            </View>

            {/* Deep Focus Indicator */}
            <View style={tw`w-full border-t border-slate-100 pt-4 items-center`}>
              <View style={tw`bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full flex-row items-center mb-1.5 shadow-xs`}>
                <Text style={tw`text-xs mr-1.5`}>😊</Text>
                <Text style={tw`text-[10px] font-bold text-emerald-700 uppercase tracking-wide`}>Study Buddy Active & Cheering</Text>
              </View>
              <Text style={tw`text-[10px] font-medium text-slate-400 text-center`}>
                Keep screen active. Leaving &gt;10s puts Buddy to sleep for 10m!
              </Text>
            </View>
          </View>
        ) : (
          /* Standard Timer Layout */
          <View style={tw`bg-white border border-slate-200/80 rounded-[48px] w-full max-w-sm p-8 items-center shadow-lg shadow-indigo-500/5 mb-6`}>
            <View style={tw`w-52 h-52 bg-indigo-50/60 border-4 border-indigo-100/80 rounded-full items-center justify-center relative mb-6 shadow-inner`}>
              <Text style={tw`text-4xl font-extrabold text-slate-900 tracking-tight`}>
                {formatTime(secondsLeft)}
              </Text>
              <Text style={tw`text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-2 bg-indigo-50 border border-indigo-100 px-3 py-0.5 rounded-full shadow-xs`}>
                Focus Session ⚡
              </Text>
            </View>

            {/* Adjust controls (5 min steps) */}
            {!isRunning && (
              <View style={tw`flex-row items-center justify-between w-full bg-slate-50 border border-slate-200/80 rounded-[20px] px-4.5 py-3 mb-2 shadow-xs`}>
                <Text style={tw`text-[10px] font-bold text-slate-600 uppercase tracking-wide`}>Adjust duration (5 minutes)</Text>
                <View style={tw`flex-row items-center`}>
                  <TouchableOpacity
                    onPress={() => adjustMinutes(-1)}
                    style={tw`w-8 h-8 bg-white border border-slate-200/80 rounded-full items-center justify-center mr-2 shadow-xs`}
                  >
                    <Text style={tw`text-slate-700 font-bold text-sm`}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => adjustMinutes(1)}
                    style={tw`w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-full items-center justify-center shadow-xs`}
                  >
                    <Text style={tw`text-indigo-600 font-bold text-sm`}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Deep Focus toggle settings block */}
        {!isRunning && !showCheatWarning && (
          <View style={tw`bg-white border border-slate-200/80 rounded-[28px] p-5.5 w-full max-w-sm mb-6 shadow-sm shadow-indigo-500/5`}>
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mr-3 shadow-xs`}>
                  <Feather name="shield" size={15} color="#4F46E5" />
                </View>
                <Text style={tw`text-sm font-bold text-slate-900`}>Deep Focus Guard</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const nextDeep = !isDeepFocus;
                  isDeepFocusRef.current = nextDeep;
                  setIsDeepFocus(nextDeep);
                }}
                style={tw`w-12 h-7 rounded-full p-0.5 justify-center border border-slate-200 ${
                  isDeepFocus ? 'bg-indigo-600 items-end' : 'bg-slate-200 items-start'
                }`}
              >
                <View style={tw`w-5.5 h-5.5 bg-white rounded-full shadow-xs`} />
              </TouchableOpacity>
            </View>
            <Text style={tw`text-[10px] font-medium text-slate-500 leading-relaxed`}>
              Ensures you don't exit the app, or your Study Buddy goes inactive for 10 minutes!
            </Text>
          </View>
        )}

        {/* Buttons Controls */}
        {!showCheatWarning && (
          <View style={tw`flex-row items-center justify-between bg-white border border-slate-200/80 rounded-[24px] px-6 py-4 shadow-sm shadow-indigo-500/5 w-full max-w-sm justify-around mb-6`}>
            <TouchableOpacity
              onPress={handleReset}
              disabled={!isRunning && secondsLeft === customDuration}
              style={tw`w-11 h-11 bg-slate-50 border border-slate-200/80 rounded-full items-center justify-center shadow-xs ${
                !isRunning && secondsLeft === customDuration ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <Feather name="rotate-ccw" size={16} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStartPause}
              style={[tw`rounded-full px-8 py-3.5 flex-row items-center shadow-md`, { backgroundColor: '#4F46E5' }]}
            >
              <Feather name={isRunning ? "pause" : "play"} size={16} color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-bold text-sm uppercase tracking-wide`}>
                {isRunning ? 'Pause' : 'Start'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Glass Navigation Bar */}
      {!isMenuOpen && (
        <View style={tw`absolute bottom-6 left-6 right-6 bg-white/90 border border-white/80 rounded-full py-2.5 px-6 flex-row justify-between items-center shadow-xl shadow-indigo-500/10 backdrop-blur-lg`}>
          {navItems.map((item) => {
            const isActive = item.id === 'timer';
            return (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => {
                  onNavigate(item.id);
                }}
                style={tw`items-center px-3`}
              >
                <View style={[
                  tw`p-2 rounded-full`,
                  isActive ? tw`bg-indigo-50 border border-indigo-100` : {}
                ]}>
                  <Feather name={item.icon} size={18} color={isActive ? '#6366F1' : '#94A3B8'} />
                </View>
                <Text style={tw`text-[9px] mt-0.5 font-bold ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
