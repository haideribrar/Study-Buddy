import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function DashboardScreen({ events = [], onDeleteEvent, onNavigate, onOpenMenu, username, isMenuOpen }) {

  
  // Robust date parser for DD/MM/YYYY or ISO strings
  const parseEventDate = (dateStr) => {
    if (!dateStr) return new Date(8640000000000000);
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date(8640000000000000) : d;
  };

  // Memoized, processed, and sorted events (closest due date first)
  const processedEvents = React.useMemo(() => {
    const safeEvents = Array.isArray(events) ? events : [];
    return [...safeEvents]
      .filter((e) => e && typeof e === 'object')
      .map((e) => ({
        ...e,
        parsedDate: parseEventDate(e.date),
        upcomingText: getUpcomingDaysText(e.date),
        catConfig: getCategoryBarConfig(e.category),
      }))
      .sort((a, b) => a.parsedDate - b.parsedDate);
  }, [events]);

  const getUpcomingDaysText = (dateStr) => {
    if (!dateStr) return null;
    let eventDate;
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        eventDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    } else {
      eventDate = new Date(dateStr);
    }

    if (!eventDate || isNaN(eventDate.getTime())) return null;

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const eventMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    const diffTime = eventMidnight - todayMidnight;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `Upcoming in ${diffDays} days`;
    if (diffDays === -1) return '1 day ago';
    return `${Math.abs(diffDays)} days ago`;
  };

  const getCategoryBarConfig = (category) => {
    if (category === 'Quiz') {
      return {
        barBg: 'bg-amber-100',
        borderColor: 'border-b border-amber-200',
        textColor: 'text-amber-900',
        label: 'Quiz 📝'
      };
    }
    if (category === 'Exam') {
      return {
        barBg: 'bg-indigo-100',
        borderColor: 'border-b border-indigo-200',
        textColor: 'text-indigo-900',
        label: 'Exam 🎓'
      };
    }
    if (category === 'Assignment') {
      return {
        barBg: 'bg-cyan-100',
        borderColor: 'border-b border-cyan-200',
        textColor: 'text-cyan-900',
        label: 'Assignment 📄'
      };
    }
    return {
      barBg: 'bg-emerald-100',
      borderColor: 'border-b border-emerald-200',
      textColor: 'text-emerald-900',
      label: 'Study Session 🧠'
    };
  };

  const navItems = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'chatbot', icon: 'message-square', label: 'Buddy' },
    { id: 'timer', icon: 'clock', label: 'Timer' },
    { id: 'progress', icon: 'bar-chart-2', label: 'Progress' }
  ];

  return (
    <View style={tw`flex-grow flex-1 bg-[#F8FAFC]`}>
      {/* Header */}
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
            <Text style={tw`text-lg font-bold text-slate-900 tracking-tight`}>Study Buddy</Text>
          </View>
          <View style={tw`flex-row items-center bg-indigo-50/80 border border-indigo-100/60 rounded-full py-1 px-3.5 shadow-xs`}>
            <View style={tw`w-2 h-2 rounded-full bg-indigo-600 mr-2`} />
            <Text style={tw`text-xs font-semibold text-indigo-700`}>{username}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`px-6 pt-6 pb-32`}>
        {/* Glass Hero Banner */}
        <View style={[tw`rounded-[28px] p-6 mb-6.5 shadow-xl relative overflow-hidden`, { backgroundColor: '#4F46E5' }]}>
          <Text style={tw`text-white text-xl font-bold mb-1.5`}>Welcome Back, {(username || 'Student').split(' ')[0]}! ✨</Text>
          <Text style={tw`text-indigo-100 text-xs mb-4.5 leading-relaxed font-medium`}>
            Your AI Study Buddy is online and ready to help you prepare for exams, summarize notes, or solve problems.
          </Text>
          <TouchableOpacity 
            onPress={() => onNavigate('chatbot')}
            style={[tw`border rounded-full py-2.5 px-5 align-self-start shadow-xs`, { backgroundColor: 'rgba(255, 255, 255, 0.25)', borderColor: 'rgba(255, 255, 255, 0.4)' }]}
          >
            <Text style={tw`text-white font-bold text-xs`}>Talk to Buddy 💬</Text>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={tw`flex-row items-center justify-between mb-5`}>
          <View>
            <Text style={tw`text-lg font-bold text-slate-900 tracking-tight`}>Upcoming Events</Text>
            <Text style={tw`text-[11px] font-medium text-slate-500`}>Sorted by closest due date</Text>
          </View>
          <TouchableOpacity 
            onPress={() => onNavigate('add_event')}
            style={[tw`flex-row items-center rounded-full px-4 py-2.5 shadow-md`, { backgroundColor: '#4F46E5' }]}
          >
            <Feather name="plus" size={14} color="white" style={tw`mr-1.5`} />
            <Text style={tw`text-white font-bold text-xs`}>Add Event</Text>
          </TouchableOpacity>
        </View>

        {/* Events List (Frosted Glass Cards) */}
        {processedEvents.length === 0 ? (
          <View style={tw`bg-white/80 border border-slate-200/60 rounded-[28px] p-8 items-center shadow-sm shadow-indigo-500/5`}>
            <View style={tw`w-14 h-14 bg-indigo-50 rounded-full items-center justify-center mb-3`}>
              <Feather name="calendar" size={24} color="#6366F1" />
            </View>
            <Text style={tw`text-slate-800 font-bold text-sm mb-1`}>No Events Scheduled</Text>
            <Text style={tw`text-slate-500 text-xs text-center px-4 mb-4 font-medium`}>
              Add an exam, assignment, or study session to track your preparation.
            </Text>
            <TouchableOpacity
              onPress={() => onNavigate('add_event')}
              style={[tw`rounded-full py-2.5 px-5 shadow-sm`, { backgroundColor: '#4F46E5' }]}
            >
              <Text style={tw`text-white font-bold text-xs`}>Create Your First Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          processedEvents.map((event) => {
            const catConfig = event.catConfig;
            const upcomingText = event.upcomingText;

            return (
              <View 
                key={event.id}
                style={tw`bg-white border border-slate-200/80 rounded-[24px] mb-4 shadow-sm shadow-indigo-500/5 overflow-hidden`}
              >
                {/* Top Category Header Bar */}
                <View style={[
                  tw`px-4 py-2 flex-row items-center justify-between`,
                  tw(`${catConfig.barBg} ${catConfig.borderColor}`)
                ]}>
                  <Text style={tw(`text-[10px] font-extrabold uppercase tracking-wider ${catConfig.textColor}`)}>
                    {catConfig.label}
                  </Text>
                  {upcomingText ? (
                    <View style={tw`bg-white/90 border border-slate-200/60 px-2.5 py-0.5 rounded-full shadow-xs`}>
                      <Text style={tw`text-[9px] font-bold text-slate-700`}>
                        {upcomingText}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Main Card Content */}
                <View style={tw`p-4 flex-row items-center`}>
                  {/* Event Category Icon */}
                  <View style={tw`w-11 h-11 bg-indigo-50/80 border border-indigo-100/60 rounded-full items-center justify-center mr-3.5 shadow-xs`}>
                    {event.category === 'Study Session' ? (
                      <FontAwesome name="smile-o" size={18} color="#4F46E5" />
                    ) : (
                      <FontAwesome name="graduation-cap" size={18} color="#0EA5E9" />
                    )}
                  </View>

                  {/* Event Information */}
                  <View style={tw`flex-grow flex-1 mr-2`}>
                    <Text style={tw`text-sm font-bold text-slate-900 mb-1`} numberOfLines={1}>
                      {event.title}
                    </Text>
                    
                    {/* Date line */}
                    <View style={tw`flex-row items-center mb-2.5`}>
                      <Feather name="calendar" size={12} color="#64748B" style={tw`mr-1.5`} />
                      <Text style={tw`text-[11px] font-semibold text-slate-500`}>{event.date}</Text>
                    </View>

                    {/* Progress bar */}
                    <View style={tw`flex-row items-center`}>
                      <View style={tw`flex-1 h-2.5 bg-slate-100 rounded-full mr-2.5 overflow-hidden`}>
                        <View style={[
                          tw`h-full rounded-full`, 
                          { backgroundColor: '#4F46E5', width: `${event.progress || 0}%` }
                        ]} />
                      </View>
                      <Text style={tw`text-[10px] font-bold text-slate-600 w-8 text-right`}>{event.progress}%</Text>
                    </View>
                  </View>

                  {/* Delete Trash Button */}
                  <TouchableOpacity 
                    onPress={() => onDeleteEvent(event.id)}
                    style={tw`p-2 bg-rose-50 border border-rose-100 rounded-full ml-1`}
                  >
                    <Feather name="trash-2" size={13} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Glass Navigation Bar */}
      {!isMenuOpen && (
        <View style={tw`absolute bottom-6 left-6 right-6 bg-white/90 border border-white/80 rounded-full py-2.5 px-6 flex-row justify-between items-center shadow-xl shadow-indigo-500/10 backdrop-blur-lg`}>
          {navItems.map((item) => {
            const isActive = item.id === 'dashboard';
            return (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => onNavigate(item.id)}
                style={tw`items-center px-3`}
              >
                <View style={[
                  tw`p-2 rounded-full`,
                  isActive ? tw`bg-indigo-50 border border-indigo-100` : {}
                ]}>
                  <Feather name={item.icon} size={18} color={isActive ? '#6366F1' : '#94A3B8'} />
                </View>
                <Text style={tw(`text-[9px] mt-0.5 font-bold ${isActive ? 'text-indigo-600' : 'text-slate-400'}`)}>
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
