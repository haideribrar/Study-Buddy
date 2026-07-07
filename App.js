import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
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

export default function App() {
  const FAVICON_DATA_URL = "data:image/png;base64,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";

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
    }
  }, []);
  
  const [currentScreen, setCurrentScreen] = useState('login');
  const [username, setUsername] = useState('Jane Doe');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Pre-load dummy events matching the wireframe with sub-tasks
  const [events, setEvents] = useState([
    { 
      id: '0', 
      title: 'Physics Group Study Session', 
      date: 'May 10, 2025', 
      category: 'Study Session', 
      progress: 50,
      subTasks: [
        { id: 'ss1', name: 'Make Notes', progress: 50 },
        { id: 'ss2', name: 'Active Recall Review', progress: 50 }
      ]
    },
    { 
      id: '1', 
      title: 'Physics Equations Exam', 
      date: 'May 13, 2025', 
      category: 'Exam', 
      progress: 50,
      subTasks: [
        { id: 'e1', name: 'Revise Notes', progress: 50 },
        { id: 'e2', name: 'Revise Quizzes', progress: 100 },
        { id: 'e3', name: 'Revise Assignments', progress: 0 },
        { id: 'e4', name: 'Do Practice Questions', progress: 50 }
      ]
    },
    { 
      id: '2', 
      title: 'Calculus Derivative Rules Assignment', 
      date: 'May 15, 2025', 
      category: 'Assignment', 
      progress: 50,
      subTasks: [
        { id: 'a1', name: 'Do Research', progress: 100 },
        { id: 'a2', name: 'Complete Draft', progress: 0 }
      ]
    },
    { 
      id: '3', 
      title: 'Organic Chemistry Intro Quiz', 
      date: 'May 18, 2025', 
      category: 'Quiz', 
      progress: 50,
      subTasks: [
        { id: 'q1', name: 'Revise Notes', progress: 100 },
        { id: 'q2', name: 'Do Practice Questions', progress: 0 }
      ]
    }
  ]);

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = (user) => {
    setUsername(user);
    setCurrentScreen('dashboard');
  };

  const handleSignup = (user) => {
    setUsername(user);
    setCurrentScreen('dashboard');
  };

  const handleAddEvent = (newEvent) => {
    // Generate sub-tasks list depending on the event category
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
      // Study Session category default
      subTasks = [
        { id: Math.random().toString(), name: 'Make Notes', progress: 0 },
        { id: Math.random().toString(), name: 'Active Recall Review', progress: 0 }
      ];
    }

    const event = {
      id: Math.random().toString(),
      ...newEvent,
      subTasks,
      progress: 0
    };
    setEvents((prev) => [event, ...prev]);
    setCurrentScreen('dashboard');
  };

  const handleDeleteEvent = (id) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const handleUpdateSubTaskProgress = (eventId, subTaskId, delta) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === eventId) {
          const updatedSubTasks = event.subTasks.map((st) => {
            if (st.id === subTaskId) {
              const newProg = Math.max(0, Math.min(100, st.progress + delta));
              return { ...st, progress: newProg };
            }
            return st;
          });
          const avgProgress = Math.round(
            updatedSubTasks.reduce((sum, st) => sum + st.progress, 0) / updatedSubTasks.length
          );
          return {
            ...event,
            subTasks: updatedSubTasks,
            progress: avgProgress
          };
        }
        return event;
      })
    );
  };

  const handleSaveProfile = (newName) => {
    setUsername(newName);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUsername('Jane Doe');
    setCurrentScreen('login');
    setIsMenuOpen(false);
  };

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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
          />
        );
      case 'add_event':
        return <AddEventScreen onAddEvent={handleAddEvent} onNavigate={handleNavigate} />;
      case 'chatbot':
        return <ChatbotScreen onNavigate={handleNavigate} onOpenMenu={openMenu} />;
      case 'progress':
        return (
          <ProgressScreen 
            events={events}
            onUpdateSubTaskProgress={handleUpdateSubTaskProgress}
            onNavigate={handleNavigate} 
            onOpenMenu={openMenu} 
          />
        );
      case 'timer':
        return <TimerScreen onNavigate={handleNavigate} onOpenMenu={openMenu} />;
      case 'edit_profile':
        return (
          <EditProfileScreen 
            username={username} 
            onSaveProfile={handleSaveProfile} 
            onNavigate={handleNavigate} 
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

      {/* Headspace Hamburger Drawer Side Menu Overlay */}
      {isMenuOpen && (
        <View style={styles.overlayContainer}>
          {/* Backdrop click to close */}
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={closeMenu} 
            style={tw`absolute inset-0 bg-[#FF7C5C]/20`}
          />
          
          {/* Side Drawer Body - Headspace UI Styled */}
          <SafeAreaView style={tw`w-72 h-full bg-[#FDF6EC] border-r border-[#F5EBE1] shadow-lg p-6 justify-between z-50`}>
            <View>
              {/* Drawer Header */}
              <View style={tw`flex-row items-center justify-between mb-8`}>
                <Text style={tw`text-lg font-bold text-slate-800 tracking-tight`}>Study Buddy Menu</Text>
                <TouchableOpacity 
                  onPress={closeMenu}
                  style={tw`w-8 h-8 bg-white border border-[#F5EBE1] rounded-full items-center justify-center shadow-sm`}
                >
                  <Feather name="x" size={14} color="#FF7C5C" />
                </TouchableOpacity>
              </View>

              {/* Profile Card (Headspace Box) */}
              <View style={tw`bg-white border border-[#F5EBE1] rounded-[24px] p-4.5 mb-6 shadow-sm`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-10 h-10 bg-[#FF7C5C]/10 rounded-full items-center justify-center mr-3.5`}>
                    <FontAwesome name="smile-o" size={18} color="#FF7C5C" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-[10px] font-bold text-[#FF7C5C] uppercase tracking-wider`}>Active Student</Text>
                    <Text style={tw`text-sm font-bold text-slate-800`} numberOfLines={1}>{username}</Text>
                  </View>
                </View>
              </View>

              {/* Menu items (Headspace elements) */}
              <TouchableOpacity
                onPress={() => {
                  closeMenu();
                  setCurrentScreen('edit_profile');
                }}
                style={tw`flex-row items-center bg-white border border-[#F5EBE1] rounded-[20px] p-4 mb-4.5 shadow-sm`}
              >
                <View style={tw`w-7 h-7 bg-slate-50 rounded-full items-center justify-center mr-3`}>
                  <Feather name="user" size={13} color="#475569" />
                </View>
                <Text style={tw`text-sm font-bold text-slate-700`}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  closeMenu();
                  setCurrentScreen('calendar');
                }}
                style={tw`flex-row items-center bg-white border border-[#F5EBE1] rounded-[20px] p-4 mb-4.5 shadow-sm`}
              >
                <View style={tw`w-7 h-7 bg-slate-50 rounded-full items-center justify-center mr-3`}>
                  <Feather name="calendar" size={13} color="#475569" />
                </View>
                <Text style={tw`text-sm font-bold text-slate-700`}>Full Calendar</Text>
              </TouchableOpacity>
            </View>

            {/* Logout Footer Option (Headspace Style) */}
            <TouchableOpacity
              onPress={handleLogout}
              style={tw`flex-row items-center justify-center bg-white border border-red-100 rounded-[20px] p-4 shadow-sm`}
            >
              <Feather name="log-out" size={13} color="#EF4444" style={tw`mr-2`} />
              <Text style={tw`text-red-500 font-bold text-sm`}>Log Out</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6EC', // Warm calming peach backdrop
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    flexDirection: 'row',
  }
});
