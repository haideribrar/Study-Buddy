import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function TimerScreen({ onNavigate, onOpenMenu }) {
  const [customDuration, setCustomDuration] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Deep Focus Guard States
  const [isDeepFocus, setIsDeepFocus] = useState(false);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(10);
  const [streakLost, setStreakLost] = useState(false);

  // Main countdown timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0 && !showCheatWarning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, showCheatWarning]);

  // ACTUALLY FUNCTIONAL: Web Visibility Change Listener
  // Detects if the user switches browser tabs or minimizes the window!
  useEffect(() => {
    if (!isRunning || !isDeepFocus || showCheatWarning) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningSecondsLeft(10);
        setStreakLost(false);
        setShowCheatWarning(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, isDeepFocus, showCheatWarning]);

  // Warning 10-second countdown timer effect
  useEffect(() => {
    let warnInterval = null;
    if (showCheatWarning && warningSecondsLeft > 0 && isRunning && !streakLost) {
      warnInterval = setInterval(() => {
        setWarningSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (showCheatWarning && warningSecondsLeft === 0 && !streakLost) {
      setStreakLost(true);
      setIsRunning(false);
    }
    return () => clearInterval(warnInterval);
  }, [showCheatWarning, warningSecondsLeft, isRunning, streakLost]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
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
    setShowCheatWarning(false);
    setStreakLost(false);
    setIsRunning(true);
  };

  const navItems = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'chatbot', icon: 'message-square', label: 'Buddy' },
    { id: 'timer', icon: 'clock', label: 'Timer' },
    { id: 'progress', icon: 'bar-chart-2', label: 'Progress' }
  ];

  return (
    <View style={tw`flex-grow flex-1 bg-[#FDF6EC]`}>
      {/* Header */}
      <SafeAreaView style={tw`bg-white`}>
        <View style={tw`flex-row items-center justify-between px-6 pt-3 pb-4 bg-white border-b border-[#F5EBE1]`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity 
              onPress={onOpenMenu}
              style={tw`mr-3.5 w-9 h-9 bg-white border border-[#F5EBE1] rounded-full items-center justify-center shadow-sm`}
            >
              <Feather name="menu" size={16} color="#FF7C5C" />
            </TouchableOpacity>
            <Text style={tw`text-lg font-bold text-slate-800 tracking-tight`}>Study Timer</Text>
          </View>
          <Feather name="clock" size={18} color="#FF7C5C" />
        </View>
      </SafeAreaView>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`flex-grow items-center justify-center px-6 pb-28 pt-4`}>
        {/* Cheat/Distraction Warning Overlay */}
        {showCheatWarning ? (
          <View style={tw`bg-white border border-red-100 rounded-[32px] w-full max-w-sm p-6 items-center shadow-md mb-6`}>
            {streakLost ? (
              /* Streak Lost Screen */
              <View style={tw`items-center w-full`}>
                <View style={tw`w-14 h-14 bg-red-50 rounded-full items-center justify-center mb-4`}>
                  <Feather name="frown" size={26} color="#EF4444" />
                </View>
                <Text style={tw`text-base font-bold text-slate-855 mb-2`}>Streak Lost! 😢</Text>
                <Text style={tw`text-slate-450 text-xs text-center leading-relaxed font-semibold mb-6 px-3`}>
                  You didn't return to the app in time. You have lost 1 day of your study streak.
                </Text>
                <TouchableOpacity
                  onPress={handleReset}
                  style={tw`w-full bg-[#FF7C5C] rounded-full py-3.5 items-center shadow-sm`}
                >
                  <Text style={tw`text-white font-bold text-xs uppercase tracking-wide`}>Start New Session</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Active 10-Second Warning Count Down */
              <View style={tw`items-center w-full`}>
                <View style={tw`w-14 h-14 bg-red-50 rounded-full items-center justify-center mb-4`}>
                  <Feather name="alert-triangle" size={26} color="#EF4444" />
                </View>
                
                {/* 10s countdown display */}
                <View style={tw`bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-3.5`}>
                  <Text style={tw`text-lg font-black text-red-500`}>00:{warningSecondsLeft.toString().padStart(2, '0')}</Text>
                </View>

                <Text style={tw`text-sm font-bold text-slate-800 mb-2 text-center`}>
                  Return to the App!
                </Text>
                <Text style={tw`text-slate-500 text-[11px] text-center leading-relaxed font-semibold mb-5.5 px-1`}>
                  Return to the app before the timer runs out, or you will lose 1 day of your streak!
                </Text>

                {/* Upper Option: Rescue Focus */}
                <TouchableOpacity
                  onPress={handleResumeSaveStreak}
                  style={tw`w-full bg-[#FF7C5C] rounded-full py-3.5 items-center shadow-sm mb-3.5`}
                >
                  <Text style={tw`text-white font-bold text-xs uppercase tracking-wide`}>
                    Resume Focus
                  </Text>
                </TouchableOpacity>

                {/* Lower Option: Reset/Exit Timer */}
                <TouchableOpacity
                  onPress={handleReset}
                  style={tw`w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 items-center`}
                >
                  <Text style={tw`text-slate-600 font-bold text-xs uppercase tracking-wide`}>
                    Reset Timer
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : isRunning && isDeepFocus ? (
          /* Active Deep Focus Layout */
          <View style={tw`bg-white border border-[#F5EBE1] rounded-[48px] w-full max-w-sm p-8 items-center shadow-sm mb-6`}>
            <View style={tw`w-52 h-52 bg-[#FDF6EC]/80 rounded-full items-center justify-center relative mb-6`}>
              <View style={tw`absolute inset-1 rounded-full border-2 border-[#FF7C5C] opacity-40`} />
              <View style={tw`w-40 h-40 bg-[#FF7C5C]/10 rounded-full items-center justify-center`}>
                <Text style={tw`text-4xl font-extrabold text-slate-800 tracking-tight`}>
                  {formatTime(secondsLeft)}
                </Text>
                <Text style={tw`text-[10px] font-bold text-[#FF7C5C] uppercase tracking-wider mt-1.5`}>
                  Focus Session ⚡
                </Text>
              </View>
            </View>

            {/* Deep Focus Indicator (Guard Status ONLY) */}
            <View style={tw`w-full border-t border-[#F5EBE1] pt-5.5`}>
              <View style={tw`flex-row items-center justify-between mb-2`}>
                <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-wide`}>Guard Status</Text>
                <View style={tw`bg-emerald-50 border border-emerald-250 px-3 py-1 rounded-full flex-row items-center`}>
                  <View style={tw`w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5`} />
                  <Text style={tw`text-[9px] font-bold text-emerald-500 uppercase`}>ON 🟢</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Standard Timer Layout */
          <View style={tw`bg-white border border-[#F5EBE1] rounded-[48px] w-full max-w-sm p-8 items-center shadow-sm mb-6`}>
            <View style={tw`w-52 h-52 bg-[#FDF6EC]/40 rounded-full items-center justify-center relative mb-6`}>
              <View style={tw`absolute inset-2 rounded-full border border-[#FF7C5C]/20 border-dashed`} />
              <Text style={tw`text-4xl font-extrabold text-slate-800 tracking-tight`}>
                {formatTime(secondsLeft)}
              </Text>
              <Text style={tw`text-[9px] font-bold text-[#FF7C5C] uppercase tracking-widest mt-2 bg-[#FF7C5C]/10 px-2.5 py-0.5 rounded-full`}>
                Focus Session ⚡
              </Text>
            </View>

            {/* Adjust controls (5 min steps) */}
            {!isRunning && (
              <View style={tw`flex-row items-center justify-between w-full bg-[#FDF6EC]/40 border border-[#F5EBE1] rounded-[20px] px-4.5 py-3 mb-2`}>
                <Text style={tw`text-[10px] font-bold text-[#FF7C5C] uppercase tracking-wide`}>Adjust duration (5m)</Text>
                <View style={tw`flex-row items-center`}>
                  <TouchableOpacity
                    onPress={() => adjustMinutes(-1)}
                    style={tw`w-8 h-8 bg-white border border-[#F5EBE1] rounded-full items-center justify-center mr-2 shadow-xs`}
                  >
                    <Text style={tw`text-slate-655 font-bold text-sm`}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => adjustMinutes(1)}
                    style={tw`w-8 h-8 bg-[#FF7C5C]/10 rounded-full items-center justify-center shadow-xs`}
                  >
                    <Text style={tw`text-[#FF7C5C] font-bold text-sm`}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Deep Focus toggle settings block (only visible when not running) */}
        {!isRunning && !showCheatWarning && (
          <View style={tw`bg-white border border-[#F5EBE1] rounded-[28px] p-5.5 w-full max-w-sm mb-6 shadow-sm`}>
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-8 h-8 bg-[#FF7C5C]/10 rounded-full items-center justify-center mr-3`}>
                  <Feather name="shield" size={14} color="#FF7C5C" />
                </View>
                <Text style={tw`text-sm font-bold text-slate-800`}>Deep Focus Guard</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsDeepFocus(!isDeepFocus)}
                style={tw`w-10 h-6 rounded-full p-0.5 justify-center ${
                  isDeepFocus ? 'bg-[#FF7C5C] items-end' : 'bg-slate-200 items-start'
                }`}
              >
                <View style={tw`w-5 h-5 bg-white rounded-full shadow-xs`} />
              </TouchableOpacity>
            </View>
            <Text style={tw`text-[10px] font-semibold text-slate-400 leading-relaxed`}>
              Make sure you don't exit the app, or you will lose your study streak!
            </Text>
          </View>
        )}

        {/* Buttons Controls */}
        {!showCheatWarning && (
          <View style={tw`flex-row items-center justify-between bg-white border border-[#F5EBE1] rounded-[24px] px-6 py-4 shadow-sm w-full max-w-sm justify-around mb-6`}>
            <TouchableOpacity
              onPress={handleReset}
              disabled={!isRunning && secondsLeft === customDuration}
              style={tw`w-10 h-10 bg-slate-50 border border-slate-200 rounded-full items-center justify-center ${
                !isRunning && secondsLeft === customDuration ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <Feather name="rotate-ccw" size={14} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStartPause}
              style={tw`bg-[#FF7C5C] rounded-full px-8 py-3 flex-row items-center shadow-md shadow-[#FF7C5C]/10`}
            >
              <Feather name={isRunning ? "pause" : "play"} size={14} color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-bold text-sm uppercase tracking-wide`}>
                {isRunning ? 'Pause' : 'Start'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer Tab Bar */}
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 pt-2.5 pb-7 px-6 flex-row justify-between items-center shadow-lg`}>
        {navItems.map((item) => {
          const isActive = item.id === 'timer';
          return (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => onNavigate(item.id)}
              style={tw`items-center px-3`}
            >
              <View style={[
                tw`p-2 rounded-full`,
                isActive ? tw`bg-[#FF7C5C]/15` : {}
              ]}>
                <Feather name={item.icon} size={16} color={isActive ? '#FF7C5C' : '#64748B'} />
              </View>
              <Text style={tw`text-[9px] mt-1 font-bold ${isActive ? 'text-[#FF7C5C]' : 'text-slate-500'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
