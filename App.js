import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, Platform, Animated, Alert, AppState, NativeModules } from 'react-native';
import * as Notifications from 'expo-notifications';
import { API_BASE_URL } from './config';
import { StatusBar } from 'expo-status-bar';
import { Feather, FontAwesome } from '@expo/vector-icons';
import tw from 'twrnc';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddEventScreen from './screens/AddEventScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import ProgressScreen from './screens/ProgressScreen';
import TimerScreen from './screens/TimerScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import CalendarScreen from './screens/CalendarScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotificationPermissions, scheduleEventReminder, cancelEventReminder } from './services/notificationService';

export default function App() {
  useEffect(() => {
    requestNotificationPermissions();
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      // 1. Instantly load cached events from storage
      try {
        let cachedEvents = null;
        if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
          cachedEvents = localStorage.getItem('cached_events');
        } else {
          cachedEvents = await AsyncStorage.getItem('cached_events');
        }
        if (cachedEvents) {
          const parsed = JSON.parse(cachedEvents);
          if (Array.isArray(parsed)) {
            setEvents(parsed);
          }
        }
      } catch (cacheErr) {
        console.warn('[App] Error loading cached events:', cacheErr);
      }

      let savedSession = null;
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        savedSession = localStorage.getItem('study_buddy_session');
      } else {
        savedSession = await AsyncStorage.getItem('study_buddy_session');
      }

      if (savedSession) {
        const { user, token: savedToken } = JSON.parse(savedSession);
        if (savedToken && user) {
          setUsername(user.fullName || user.email || 'Student');
          setToken(savedToken);
          setCurrentScreen('dashboard');
          fetchEvents(savedToken);
        }
      }
    } catch (err) {
      console.warn('[App] Error restoring session:', err);
    }
  };

  const saveSession = async (user, sessionToken) => {
    try {
      const data = JSON.stringify({ user, token: sessionToken });
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem('study_buddy_session', data);
      } else {
        await AsyncStorage.setItem('study_buddy_session', data);
      }
    } catch (err) {
      console.warn('[App] Failed to save session:', err);
    }
  };

  const clearSession = async () => {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('study_buddy_session');
        localStorage.removeItem('cached_events');
        localStorage.removeItem('cached_chat_history');
      } else {
        await AsyncStorage.removeItem('study_buddy_session');
        await AsyncStorage.removeItem('cached_events');
        await AsyncStorage.removeItem('cached_chat_history');
      }
    } catch (err) {
      console.warn('[App] Failed to clear session:', err);
    }
  };

  const handleLogout = async () => {
    closeMenu();
    setToken(null);
    setUsername('Jane Doe');
    setEvents([]);
    setChatMessages([
      { id: 1, sender: 'bot', text: 'Hi! I am your study buddy. How may I help you today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setCurrentScreen('login');
    await clearSession();
  };

  const handleLogin = (user, sessionToken) => {
    const displayName = user?.fullName || user?.email || 'Student';
    setUsername(displayName);
    setToken(sessionToken);
    setCurrentScreen('dashboard');
    fetchEvents(sessionToken);
    saveSession({ fullName: displayName, email: user?.email }, sessionToken);
  };

  const handleSignup = (user, sessionToken) => {
    const displayName = user?.fullName || user?.email || 'Student';
    setUsername(displayName);
    setToken(sessionToken);
    setCurrentScreen('dashboard');
    fetchEvents(sessionToken);
    saveSession({ fullName: displayName, email: user?.email }, sessionToken);
  };


  const FAVICON_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAABI8klEQVR4nO19B5hkV3Xmf1+s1N0zPXkkzSijnAUoISQRTAYBFoLFmMVmyZgFG++yC7YXtKyNTdwFEwwmGRA5CJAQAgUUGAmFEaMZhdGMNEETejpUeune/c697716Fbuqu6qrqqePVFPd1a/eu+Gcc08+TAiBJWgD5DpFa8UAxhpfhgAISuBuEcLNC5TzCNwZBF4RwisCXgngHhB4YCKQ9xXMAHQDMGwwIwVm0isD3cqBydcINCvFYGbAYDUZH/3DK7/L8TUe4xJUgC0RQDMQIdLTKmn1fxUO/OJBiJk9QkzvgZjZiyC/F7xwAFpxApozDeYWwXxHIrwQHBAcWkhI9J9CTwYRE1OItPQ7PVMzIHQbwkiDp7LgqeVg2ZUwcqvARtaBjawFRtbCyKximjXWYIz0DHoe3S+6/xIkYYkAGiE8tCpcEXDB80+BTz0h3AOPAge2gU3uhJjZD82dhuYVoQtf4S3TwTQdYPRSyMyquDEhPC085HsS1GdCvUsCERKJ5bh4oIgofOfQ4esWOJ0O6XFgbC34iuOhrzgBxvgxYGNHMt0YqZ6h4IogJEEvEYNa88OaAJpxeY6guBfuvocEe+oB+E9tBZt8HGZxAixwoMvLNTASW0h8YYTUmkTaipiU/HGua5xA0vCUIARmUmySmycJApyDiwCc0+c6fCsHf/QIGCtPANadBn3N6TCXb2SMpapPByEA7fAWlQ5PAiAEApfcOgIuXPgHt4pg970Inrwb+oFtQHECZlCCzgwww4TQdTAQooe0EyN2JNbQG92XEIoIKhQ/ugqRnE/3jcQb9Tz1JNIrOFjggwcefJgI7FHw5Rsh1p8D66jzoK16GgxrPB6Y4DTmw1NvOIwIIOL2FQWWizK8fQ8Jf8fvIJ7cBDbxCKzyNSWAGiE8tCpcEXDB80+BTz0h3AOPAge2gU3uhJjZD82dhuYVoQtf4S3TwTQdYPRSyMyquDEhPC085HsS1GdCvUsCERKJ5bh4oIgofOfQ4esWOJ0O6XFgbC34iuOhrzgBxvgxYGNHMt0YqZ6h4IogJEEvEYNa88OaAJpxeY6guBfuvocEe+oB+E9tBZt8HGZxAixwoMvLNTASW0h8YYTUmkTaipiU/HGua5xA0vCUIARmUmySmycJApyDiwCc0+c6fCsHf/QIGCtPANadBn3N6TCXb2SMpapPByEA7fAWlQ5PAiAEApfcOgIuXPgHt4pg970Inrwb+oFtQHECZlCCzgwww4TQdTAQooe0EyN2JNbQG92XEIoIKhQ/ugqRnE/3jcQb9Tz1JNIrOFjggwcefJgI7FHw5Rsh1p8D66jzoK16GgxrPB6Y4DTmw1NvOIwIIOL2FQWWizK8fQ8Jf8fvIJ7cBDbxCKzyNSWAGiE8tCpcEXDB80+BTz0h3AOPAge2gU3uhJjZD82dhuYVoQtf4S3TwTQdYPRSyMyquDEhPC085HsS1GdCvUsCERKJ5bh4oIgofOfQ4esWOJ0O6XFgbC34iuOhrzgBxvgxYGNHMt0YqZ6h4IogJEEvEYNa88OaAJpxeY6guBfuvocEe+oB+E9tBZt8HGZxAixwoMvLNTASW0h8YYTUmkTaipiU/HGua5xA0vCUIARmUmySmycJApyDiwCc0+c6fCsHf/QIGCtPANadBn3N6TCXb2SMpapPByEA7fAWlQ5PAiAEApfcOgIuXPgHt4pg970Inrwb+oFtQHECZlCCzgwww4TQdTAQooe0EyN2JNbQG92XEIoIKhQ/ugqRnE/3jcQb9Tz1JNIrOFjggwcefJgI7FHw5Rsh1p8D66jzoK16GgxrPB6Y4DTmw1NvOIwIIOL2FQWWizK8fQ8Jf8fvIJ7cBDbxCKzyNSWAGiE8tCpcEXDB80+BTz0h3AOPAge2gU3uhJjZD82dhuYVoQtf4S3TwTQdYPRSyMyquDEhPC085HsS1GdCvUsCERKJ5bh4oIgofOfQ4esWOJ0O6XFgbC34iuOhrzgBxvgxYGNHMt0YqZ6h4IogJEEvEYNa88OaAJpxeY6guBfuvocEe+oB+E9tBZt8HGZxAixwoMvLNTASW0h8YYTUmkTaipiU/HGua5xA0vCUIARmUmySmycJApyDiwCc0+c6fCsHf/QIGCtPANadBn3N6TCXb2SMpapPByEA7fAWlQ5PAiAEApfcOgIuXPgHt4pg970Inrwb+oFtQHECZlCCzgwww4TQdTAQooe0EyN2JNbQG92XEIoIKhQ/ugqRnE/3jcQb9Tz1JNIrOFjggwcefJgI7FHw5Rsh1p8D66jzoK16GgxrPB6Y4DTmw1NvOIwIIOL2FQWWizK8fQ8Jf8fvIJ7cBDbxCKzyNSW";

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = "Study Buddy";
      
      // Clear existing favicon & apple icon link elements
      const existingLinks = document.querySelectorAll("link[rel*='icon'], link[rel*='apple-touch-icon']");
      existingLinks.forEach(link => {
        if (link.parentNode) link.parentNode.removeChild(link);
      });
      
      const head = document.getElementsByTagName('head')[0] || document.head;
      
      // 1. Shortcut Icon Link
      const link1 = document.createElement('link');
      link1.type = 'image/png';
      link1.rel = 'shortcut icon';
      link1.href = FAVICON_DATA_URL;
      head.appendChild(link1);
      
      // 2. Regular Icon Link
      const link2 = document.createElement('link');
      link2.type = 'image/png';
      link2.rel = 'icon';
      link2.sizes = '192x192';
      link2.href = FAVICON_DATA_URL;
      head.appendChild(link2);
      
      // 3. Apple Touch Icon Link (forces Safari to reload)
      const link3 = document.createElement('link');
      link3.rel = 'apple-touch-icon';
      link3.href = FAVICON_DATA_URL;
      head.appendChild(link3);

      // 4. Global CSS to remove blue focus outline rings on web inputs
      const styleTag = document.createElement('style');
      styleTag.id = 'remove-focus-outline';
      styleTag.innerHTML = `
        input, textarea, select, button, div, [tabindex], [role="button"] {
          outline: none !important;
          outline-style: none !important;
          box-shadow: none !important;
        }
        *:focus, *:focus-visible, *:focus-within {
          outline: none !important;
          outline-style: none !important;
          box-shadow: none !important;
        }
      `;
      head.appendChild(styleTag);
    }
  }, []);
  
  const [currentScreen, setCurrentScreen] = useState('login');
  const [username, setUsername] = useState('Jane Doe');
  const [token, setToken] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi! I am your study buddy. How may I help you today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);

  // Global Timer & Deep Focus Guard State
  const [customDuration, setCustomDuration] = useState(25 * 60);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isDeepFocus, setIsDeepFocus] = useState(true);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(10);
  const [streakLost, setStreakLost] = useState(false);
  const [isSleepingCooldown, setIsSleepingCooldown] = useState(false);
  const [sleepCooldownSeconds, setSleepCooldownSeconds] = useState(10 * 60);

  const isTimerRunningRef = useRef(isTimerRunning);
  const isDeepFocusRef = useRef(isDeepFocus);
  const showCheatWarningRef = useRef(showCheatWarning);
  const isSleepingCooldownRef = useRef(isSleepingCooldown);
  const lastStartedTimeRef = useRef(0);
  const leftTimeRef = useRef(0);
  const sleepStartTimeRef = useRef(0);

  useEffect(() => { isTimerRunningRef.current = isTimerRunning; }, [isTimerRunning]);
  useEffect(() => { isDeepFocusRef.current = isDeepFocus; }, [isDeepFocus]);
  useEffect(() => { showCheatWarningRef.current = showCheatWarning; }, [showCheatWarning]);
  useEffect(() => { isSleepingCooldownRef.current = isSleepingCooldown; }, [isSleepingCooldown]);

  // Main countdown timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSecondsLeft > 0 && !showCheatWarning && !isSleepingCooldown) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0) {
      setIsTimerRunning(false);
      isTimerRunningRef.current = false;
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft, showCheatWarning, isSleepingCooldown]);

  // Warning countdown timer effect
  useEffect(() => {
    let interval = null;
    if (showCheatWarning && warningSecondsLeft > 0 && !streakLost && !isSleepingCooldown) {
      interval = setInterval(() => {
        setWarningSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Fail focus session automatically!
            handleFailFocusSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showCheatWarning, warningSecondsLeft, streakLost, isSleepingCooldown]);

  // Trigger Focus Guard (Exit Warning)
  const triggerFocusGuard = async () => {
    console.log(`[FocusGuard] triggerFocusGuard called. isTimerRunning = ${isTimerRunningRef.current}, isDeepFocus = ${isDeepFocusRef.current}, leftTime = ${leftTimeRef.current}`);
    if (Date.now() - lastStartedTimeRef.current < 500) {
      console.log(`[FocusGuard] triggerFocusGuard returned early (recent start).`);
      return;
    }

    if (isTimerRunningRef.current && !isSleepingCooldownRef.current) {
      if (leftTimeRef.current === 0) {
        leftTimeRef.current = Date.now();
        console.log(`[FocusGuard] Set leftTimeRef to ${leftTimeRef.current}`);
      }
      
      if (isDeepFocusRef.current && Platform.OS !== 'web') {
        try {
          // Cancel any existing warning notifications
          await Notifications.cancelAllScheduledNotificationsAsync();
          
          // Schedule focus alert warning in 10 seconds
          await Notifications.scheduleNotificationAsync({
            identifier: 'focus-warning',
            content: {
              title: "Focus Interrupted! ⚠️",
              body: "You left the app! Return within 10 seconds or Study Buddy will fall asleep!",
              sound: true,
              channelId: 'default',
            },
            trigger: {
              seconds: 10,
            },
          });
          console.log("[FocusGuard] Scheduled focus warning notification for 10s.");
        } catch (err) {
          console.warn("[FocusGuard] Error scheduling warning notification:", err);
        }
      }
    }
  };

  const handleConfirmFocusLock = () => {
    if (leftTimeRef.current > 0) {
      const elapsedSec = Math.floor((Date.now() - leftTimeRef.current) / 1000);
      setTimerSecondsLeft((prev) => Math.max(0, prev - elapsedSec));
      leftTimeRef.current = 0;
    }
    setShowCheatWarning(false);
    showCheatWarningRef.current = false;
    setIsTimerRunning(true); // Resume timer
  };

  const handleFailFocusSession = () => {
    leftTimeRef.current = 0;
    setIsTimerRunning(false);
    isTimerRunningRef.current = false;
    setShowCheatWarning(false);
    showCheatWarningRef.current = false;
    setStreakLost(true);

    // Start 10-minute sleep cooldown
    isSleepingCooldownRef.current = true;
    setIsSleepingCooldown(true);
    sleepStartTimeRef.current = Date.now();
    setSleepCooldownSeconds(10 * 60);
  };

  const handleReturnFocus = async () => {
    console.log(`[FocusGuard] handleReturnFocus called. leftTime = ${leftTimeRef.current}, isDeepFocus = ${isDeepFocusRef.current}`);
    if (leftTimeRef.current > 0) {
      const elapsedSec = Math.floor((Date.now() - leftTimeRef.current) / 1000);
      console.log(`[FocusGuard] Time elapsed away from app: ${elapsedSec}s`);
      
      if (Platform.OS !== 'web') {
        try {
          await Notifications.cancelAllScheduledNotificationsAsync();
          console.log("[FocusGuard] Dismissed all warning notifications.");
        } catch (err) {
          console.warn("[FocusGuard] Error cancelling notifications:", err);
        }
      }

      let screenWasOff = false;
      let isNativeLockSupported = false;
      
      const { LockDetection } = NativeModules;
      if (Platform.OS === 'android' && LockDetection) {
        isNativeLockSupported = true;
        try {
          screenWasOff = await LockDetection.getAndResetScreenWasOff();
          console.log(`[FocusGuard] LockDetection screenWasOff: ${screenWasOff}`);
        } catch (err) {
          console.warn('[FocusGuard] Error calling LockDetection:', err);
        }
      }

      if (isDeepFocusRef.current) {
        if (isNativeLockSupported && screenWasOff) {
          // Screen locked: study continues normally in the background
          console.log(`[FocusGuard] Valid lock screen study. Deducting ${elapsedSec}s from timer.`);
          setTimerSecondsLeft((prev) => Math.max(0, prev - elapsedSec));
          leftTimeRef.current = 0;
        } else {
          // App switched (or Web/iOS fallback): trigger 10-second warning countdown screen!
          console.log(`[FocusGuard] Interruption detected. Initiating 10s countdown.`);
          setWarningSecondsLeft(10);
          setShowCheatWarning(true);
          showCheatWarningRef.current = true;
          setCurrentScreen('timer');
        }
      } else {
        // Normal focus: just deduct elapsed time
        console.log(`[FocusGuard] Normal Focus: Deducting ${elapsedSec}s from timer.`);
        setTimerSecondsLeft((prev) => Math.max(0, prev - elapsedSec));
        leftTimeRef.current = 0;
      }
    }
    checkFocusGuardStatus();
  };

  // Real-time calculation checker for 10m Sleep Cooldown
  const checkFocusGuardStatus = () => {
    // Check if 10-Minute Sleep Cooldown is active
    if (isSleepingCooldownRef.current && sleepStartTimeRef.current > 0) {
      const sleepElapsedSec = Math.floor((Date.now() - sleepStartTimeRef.current) / 1000);
      const sleepRemaining = (10 * 60) - sleepElapsedSec;

      if (sleepRemaining <= 0) {
        // Sleep cooldown completed! Buddy wakes up!
        setIsSleepingCooldown(false);
        isSleepingCooldownRef.current = false;
        setShowCheatWarning(false);
        showCheatWarningRef.current = false;
        setStreakLost(false);
        setSleepCooldownSeconds(10 * 60);
        sleepStartTimeRef.current = 0;
      } else {
        setSleepCooldownSeconds(sleepRemaining);
      }
    }
  };

  // Continuous status checker ticker
  useEffect(() => {
    const interval = setInterval(() => {
      checkFocusGuardStatus();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cross-Platform Global Focus Guard Event Listener (Web & Mobile/iOS)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleVisibility = () => {
        if (document.hidden) {
          triggerFocusGuard();
        } else {
          handleReturnFocus();
        }
      };

      const handleBlur = () => {
        triggerFocusGuard();
      };

      const handleFocus = () => {
        handleReturnFocus();
      };

      document.addEventListener("visibilitychange", handleVisibility);
      window.addEventListener("blur", handleBlur);
      window.addEventListener("focus", handleFocus);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibility);
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("focus", handleFocus);
      };
    } else {
      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'inactive' || nextAppState === 'background') {
          triggerFocusGuard();
        } else if (nextAppState === 'active') {
          handleReturnFocus();
        }
      });

      return () => {
        if (subscription && subscription.remove) {
          subscription.remove();
        }
      };
    }
  }, []);

  // Animated values for drawer transitions
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Pre-load dummy events matching the wireframe with sub-tasks
  const [events, setEvents] = useState([]);

  const fetchEvents = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setEvents(data);
        // Persist to offline cache
        try {
          const stringified = JSON.stringify(data);
          if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
            localStorage.setItem('cached_events', stringified);
          } else {
            await AsyncStorage.setItem('cached_events', stringified);
          }
        } catch (cacheErr) {
          console.warn('[App] Failed to cache events:', cacheErr);
        }
      } else {
        if (response.status === 401) {
          handleLogout();
          Alert.alert("Session Expired", "Your session has expired. Please log in again.");
          return;
        }
        console.error('[App] Fetch events failed or returned non-array:', data);
        setEvents([]);
      }
    } catch (err) {
      console.error('[App] Network error fetching events:', err.message);
    }
  };

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleAddEvent = async (newEvent) => {

    let subTasks = [];
    if (newEvent.category === 'Exam') {
      subTasks = [
        { id: Math.random().toString(), name: 'Revise Notes', progress: 0 },
        { id: Math.random().toString(), name: 'Revise Quizzes', progress: 0 },
        { id: Math.random().toString(), name: 'Revise Assignments', progress: 0 },
        { id: Math.random().toString(), name: 'Do Practice Questions', progress: 0 }
      ];
    } else if (newEvent.category === 'Quiz') {
      subTasks = [
        { id: Math.random().toString(), name: 'Revise Notes', progress: 0 },
        { id: Math.random().toString(), name: 'Do Practice Questions', progress: 0 }
      ];
    } else if (newEvent.category === 'Assignment') {
      subTasks = [
        { id: Math.random().toString(), name: 'Do Research', progress: 0 },
        { id: Math.random().toString(), name: 'Complete Draft', progress: 0 }
      ];
    } else {
      subTasks = [
        { id: Math.random().toString(), name: 'Make Notes', progress: 0 },
        { id: Math.random().toString(), name: 'Active Recall Review', progress: 0 }
      ];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newEvent.title,
          date: newEvent.date,
          category: newEvent.category,
          subTasks,
          progress: 0
        })
      });

      const data = await response.json();
      if (response.ok) {
        setEvents((prev) => [data, ...prev]);
        setCurrentScreen('dashboard');

        // Execute side effects asynchronously outside the React state setter callback
        (async () => {
          try {
            const updated = [data, ...events];
            const stringified = JSON.stringify(updated);
            if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
              localStorage.setItem('cached_events', stringified);
            } else {
              await AsyncStorage.setItem('cached_events', stringified);
            }
          } catch (cacheErr) {
            console.warn('[App] Failed to update offline events cache:', cacheErr);
          }

          // Schedule a local notification reminder
          try {
            const notificationId = await scheduleEventReminder(data);
            if (notificationId) {
              const storedMap = await AsyncStorage.getItem('event_notification_map');
              const map = storedMap ? JSON.parse(storedMap) : {};
              map[data.id] = notificationId;
              await AsyncStorage.setItem('event_notification_map', JSON.stringify(map));
            }
          } catch (notifErr) {
            console.warn('[App] Failed to schedule event reminder:', notifErr);
          }
        })();
      } else {
        if (response.status === 401) {
          handleLogout();
          Alert.alert("Session Expired", "Your session has expired. Please log in again.");
          return;
        }
        Alert.alert("Error", data.error || "Failed to create event");
      }
    } catch (err) {
      console.error('[App] Add event error:', err.message);
      Alert.alert("Error", "Network error adding event");
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setEvents((prev) => prev.filter((event) => event.id !== id));

        // Execute side effects asynchronously outside the React state setter callback
        (async () => {
          try {
            const updated = events.filter((event) => event.id !== id);
            const stringified = JSON.stringify(updated);
            if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
              localStorage.setItem('cached_events', stringified);
            } else {
              await AsyncStorage.setItem('cached_events', stringified);
            }
          } catch (cacheErr) {
            console.warn('[App] Failed to update offline events cache:', cacheErr);
          }

          // Cancel any scheduled notification reminder
          try {
            const storedMap = await AsyncStorage.getItem('event_notification_map');
            if (storedMap) {
              const map = JSON.parse(storedMap);
              const notificationId = map[id];
              if (notificationId) {
                await cancelEventReminder(notificationId);
                delete map[id];
                await AsyncStorage.setItem('event_notification_map', JSON.stringify(map));
              }
            }
          } catch (notifErr) {
            console.warn('[App] Failed to cancel event reminder:', notifErr);
          }
        })();
      } else {
        if (response.status === 401) {
          handleLogout();
          Alert.alert("Session Expired", "Your session has expired. Please log in again.");
          return;
        }
        const data = await response.json();
        Alert.alert("Error", data.error || "Failed to delete event");
      }
    } catch (err) {
      console.error('[App] Delete event error:', err.message);
    }
  };

  const handleUpdateSubTaskProgress = (eventId, subTaskId, delta) => {
    const eventToUpdate = events.find(e => e.id === eventId);
    if (!eventToUpdate) return;

    const updatedSubTasks = eventToUpdate.subTasks.map((st) => {
      if (st.id === subTaskId) {
        const newProg = Math.max(0, Math.min(100, st.progress + delta));
        return { ...st, progress: newProg };
      }
      return st;
    });

    const avgProgress = Math.round(
      updatedSubTasks.reduce((sum, st) => sum + st.progress, 0) / updatedSubTasks.length
    );

    const updatedEvent = {
      ...eventToUpdate,
      subTasks: updatedSubTasks,
      progress: avgProgress
    };

    // Optimistic instant local update
    setEvents((prev) => prev.map((e) => (e.id === eventId ? updatedEvent : e)));

    // Background server update (non-blocking)
    if (token) {
      fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          progress: avgProgress,
          subTasks: updatedSubTasks
        })
      }).then(res => {
        if (res.status === 401) {
          handleLogout();
          Alert.alert("Session Expired", "Your session has expired. Please log in again.");
        }
      }).catch((err) => {
        console.error('[App] Progress update sync error:', err.message);
      });
    }
  };


  const handleSaveProfile = (newName) => {
    setUsername(newName);
    setCurrentScreen('dashboard');
  };



  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMenuOpen(false);
    });
  };

  useEffect(() => {
    if (isMenuOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isMenuOpen]);

  // Switch renderer for mock navigation
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'signup':
        return <SignupScreen onNavigate={handleNavigate} onSignup={handleSignup} />;
      case 'forgot_password':
        return <ForgotPasswordScreen onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <DashboardScreen 
            events={events} 
            onDeleteEvent={handleDeleteEvent} 
            onNavigate={handleNavigate} 
            onOpenMenu={openMenu}
            username={username}
            isMenuOpen={isMenuOpen}
          />
        );
      case 'add_event':
        return <AddEventScreen onAddEvent={handleAddEvent} onNavigate={handleNavigate} />;
      case 'chatbot':
        return (
          <ChatbotScreen 
            onNavigate={handleNavigate} 
            onOpenMenu={openMenu} 
            token={token} 
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            isSleepingCooldown={isSleepingCooldown}
            isMenuOpen={isMenuOpen}
            onLogout={handleLogout}
          />
        );
      case 'progress':
        return (
          <ProgressScreen 
            events={events}
            onUpdateSubTaskProgress={handleUpdateSubTaskProgress}
            onNavigate={handleNavigate} 
            onOpenMenu={openMenu} 
            isMenuOpen={isMenuOpen}
          />
        );
      case 'timer':
        return (
          <TimerScreen 
            onNavigate={handleNavigate} 
            onOpenMenu={openMenu}
            customDuration={customDuration}
            setCustomDuration={setCustomDuration}
            secondsLeft={timerSecondsLeft}
            setSecondsLeft={setTimerSecondsLeft}
            isRunning={isTimerRunning}
            setIsRunning={setIsTimerRunning}
            isDeepFocus={isDeepFocus}
            setIsDeepFocus={setIsDeepFocus}
            showCheatWarning={showCheatWarning}
            setShowCheatWarning={setShowCheatWarning}
            warningSecondsLeft={warningSecondsLeft}
            setWarningSecondsLeft={setWarningSecondsLeft}
            streakLost={streakLost}
            setStreakLost={setStreakLost}
            isSleepingCooldown={isSleepingCooldown}
            setIsSleepingCooldown={setIsSleepingCooldown}
            sleepCooldownSeconds={sleepCooldownSeconds}
            setSleepCooldownSeconds={setSleepCooldownSeconds}
            isTimerRunningRef={isTimerRunningRef}
            isDeepFocusRef={isDeepFocusRef}
            showCheatWarningRef={showCheatWarningRef}
            isSleepingCooldownRef={isSleepingCooldownRef}
            lastStartedTimeRef={lastStartedTimeRef}
            leftTimeRef={leftTimeRef}
            isMenuOpen={isMenuOpen}
            onConfirmFocusLock={handleConfirmFocusLock}
            onFailFocusSession={handleFailFocusSession}
          />
        );
      case 'edit_profile':
        return (
          <EditProfileScreen 
            username={username} 
            onSaveProfile={handleSaveProfile} 
            onNavigate={handleNavigate} 
            token={token}
          />
        );
      case 'calendar':
        return (
          <CalendarScreen 
            onNavigate={handleNavigate} 
            events={events} 
          />
        );
      default:
        return <LoginScreen onNavigate={handleNavigate} onLogin={handleLogin} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {renderScreen()}

      {/* Floating Glass Hamburger Drawer Side Menu Overlay */}
      {isMenuOpen && (
        <View style={styles.overlayContainer}>
          {/* Backdrop click to close */}
          <Animated.View style={[
            tw`absolute inset-0 bg-slate-900/20 backdrop-blur-md`,
            { opacity: fadeAnim }
          ]}>
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={closeMenu} 
              style={tw`absolute inset-0`}
            />
          </Animated.View>
          
          {/* Side Drawer Body - Frosted Glass Styled */}
          <Animated.View style={[
            tw`w-72 h-full bg-white/95 border-r border-white/70 shadow-2xl z-50`,
            { transform: [{ translateX: slideAnim }], elevation: 100000 }
          ]}>
            <SafeAreaView style={tw`flex-1`}>
              <View style={tw`flex-1 p-6 justify-between`}>
                <View>
                  {/* Drawer Header */}
                  <View style={tw`flex-row items-center justify-between mb-8`}>
                    <Text style={tw`text-lg font-bold text-slate-900 tracking-tight`}>Study Buddy</Text>
                    <TouchableOpacity 
                      onPress={closeMenu}
                      style={tw`w-9 h-9 bg-slate-100/80 border border-slate-200/60 rounded-full items-center justify-center shadow-xs`}
                    >
                      <Feather name="x" size={16} color="#6366F1" />
                    </TouchableOpacity>
                  </View>

                  {/* Profile Card (Frosted Glass Card) */}
                  <View style={tw`bg-indigo-50/90 border border-indigo-100/80 rounded-[24px] p-4.5 mb-6 shadow-xs`}>
                    <View style={tw`flex-row items-center`}>
                      <View style={tw`w-11 h-11 bg-indigo-600 rounded-full items-center justify-center mr-3.5 shadow-sm shadow-indigo-500/30`}>
                        <FontAwesome name="smile-o" size={20} color="white" />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={tw`text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider`}>Active Student</Text>
                        <Text style={tw`text-sm font-bold text-slate-900`} numberOfLines={1}>{username}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Menu items (Glass Cards) */}
                  <TouchableOpacity
                    onPress={() => {
                      closeMenu();
                      handleNavigate('edit_profile');
                    }}
                    style={tw`flex-row items-center bg-white/80 border border-slate-200/60 rounded-[20px] p-4 mb-4 shadow-sm`}
                  >
                    <View style={tw`w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mr-3`}>
                      <Feather name="user" size={14} color="#6366F1" />
                    </View>
                    <Text style={tw`text-sm font-semibold text-slate-800`}>Edit Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      closeMenu();
                      handleNavigate('calendar');
                    }}
                    style={tw`flex-row items-center bg-white/80 border border-slate-200/60 rounded-[20px] p-4 mb-4 shadow-sm`}
                  >
                    <View style={tw`w-8 h-8 bg-cyan-50 rounded-full items-center justify-center mr-3`}>
                      <Feather name="calendar" size={14} color="#06B6D4" />
                    </View>
                    <Text style={tw`text-sm font-semibold text-slate-800`}>Full Calendar</Text>
                  </TouchableOpacity>
                </View>

                {/* Logout Footer Option (Frosted Glass Style) */}
                <TouchableOpacity
                  onPress={handleLogout}
                  style={tw`flex-row items-center justify-center bg-rose-50 border border-rose-100 rounded-[20px] p-4 shadow-sm`}
                >
                  <Feather name="log-out" size={15} color="#EF4444" style={tw`mr-2`} />
                  <Text style={tw`text-rose-600 font-bold text-sm uppercase tracking-wider`}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Premium Modern Slate Canvas
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    elevation: 99999, // Android elevation support to prevent bleed-through
    flexDirection: 'row',
  }
});
