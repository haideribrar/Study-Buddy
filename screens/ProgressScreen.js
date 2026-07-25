import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function ProgressScreen({ onNavigate, onOpenMenu, events, onUpdateSubTaskProgress, isMenuOpen }) {
  const [activeTab, setActiveTab] = useState('Quiz');


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

  // Filter events by category tab and sort by closest due date first
  const getCategoryEvents = () => {
    return (events || [])
      .filter((event) => event && typeof event === 'object')
      .filter(event => {
      if (activeTab === 'Quiz') return event.category === 'Quiz';
      if (activeTab === 'Assignment') return event.category === 'Assignment';
      if (activeTab === 'Exams') return event.category === 'Exam';
      if (activeTab === 'Study Session') return event.category === 'Study Session';
      return false;
    }).sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));
  };

  const filteredEvents = getCategoryEvents();

  // Daily Goal Streak calculation: track completed/progressed sub-tasks
  let totalSubTasks = 0;
  let completedSubTasks = 0;
  
  (events || []).forEach(e => {
    if (e.subTasks && e.subTasks.length > 0) {
      totalSubTasks += e.subTasks.length;
      completedSubTasks += e.subTasks.filter(st => st.progress > 0).length;
    }
  });

  const dailyGoalPercent = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;
  const isGoalCompletedToday = dailyGoalPercent === 100 && totalSubTasks > 0;
  const hasStartedToday = completedSubTasks > 0;
  
  // Streak counter (base 5 days + 1 if daily goal completed)
  const streakDays = 5 + (isGoalCompletedToday ? 1 : 0);

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
            <Text style={tw`text-lg font-bold text-slate-900 tracking-tight`}>Progress Analyzer</Text>
          </View>
          <Feather name="trending-up" size={18} color="#6366F1" />
        </View>
      </SafeAreaView>

      {/* Category Glass Tabs */}
      <View style={tw`flex-row justify-between px-6 py-4 bg-transparent`}>
        {['Quiz', 'Assignment', 'Exams', 'Study Session'].map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                tw`flex-1 mx-1 py-2.5 rounded-full items-center border shadow-xs`,
                isSelected 
                  ? tw`bg-indigo-100 border-indigo-300 shadow-sm`
                  : tw`bg-white border-slate-200/80`
              ]}
            >
              <Text style={tw(`text-[10px] ${isSelected ? 'text-indigo-700 font-extrabold' : 'text-slate-600 font-semibold'}`)}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`px-6 pt-2 pb-32`}>
        {/* Category Progress Header */}
        <Text style={tw`text-xs font-bold text-slate-500 uppercase tracking-wider mb-4`}>
          Track & Edit Progress Category-wise
        </Text>

        {filteredEvents.length === 0 ? (
          <View style={tw`bg-white border border-slate-200/80 rounded-[24px] p-8 items-center shadow-sm shadow-indigo-500/5`}>
            <Text style={tw`text-slate-400 text-xs font-semibold uppercase text-center`}>
              No scheduled {activeTab.toLowerCase()} tasks found
            </Text>
          </View>
        ) : (
          filteredEvents.map((event) => (
            <View 
              key={event.id} 
              style={tw`bg-white border border-slate-200/80 rounded-[24px] p-5 mb-4 shadow-sm shadow-indigo-500/5`}
            >
              {/* Event Name Header & Average progress */}
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw`text-sm font-bold text-slate-900 flex-1 mr-3`} numberOfLines={1}>
                  {event.title}
                </Text>
                <View style={tw`bg-indigo-50 border border-indigo-100 px-3 py-0.5 rounded-full shadow-xs`}>
                  <Text style={tw`text-[10px] font-bold text-indigo-700`}>Avg: {event.progress}%</Text>
                </View>
              </View>

              {/* Sub-tasks lists with individual progress sliders */}
              {event.subTasks && event.subTasks.map((subTask) => (
                <View 
                  key={subTask.id} 
                  style={tw`flex-row items-center justify-between py-3 border-b border-slate-100 last:border-0`}
                >
                  <View style={tw`flex-grow flex-1 mr-4`}>
                    <Text style={tw`text-xs font-bold text-slate-800 mb-1.5`}>{subTask.name}</Text>
                    {/* Inner progress bar status */}
                    <View style={tw`flex-row items-center`}>
                      <View style={tw`flex-grow h-2.5 bg-slate-100 rounded-full mr-2.5 overflow-hidden`}>
                        <View style={[tw`h-full rounded-full`, { backgroundColor: '#4F46E5', width: `${subTask.progress || 0}%` }]} />
                      </View>
                      <Text style={tw`text-[10px] font-bold text-slate-600 w-8 text-right`}>{subTask.progress}%</Text>
                    </View>
                  </View>

                  {/* Adjuster Glass buttons */}
                  <View style={tw`flex-row items-center`}>
                    <TouchableOpacity
                      onPress={() => onUpdateSubTaskProgress(event.id, subTask.id, -10)}
                      style={tw`w-8 h-8 bg-slate-100 border border-slate-200/80 rounded-full items-center justify-center mr-1.5 shadow-xs`}
                    >
                      <Text style={tw`text-slate-700 font-bold text-xs`}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onUpdateSubTaskProgress(event.id, subTask.id, 10)}
                      style={[tw`w-8 h-8 rounded-full items-center justify-center shadow-xs`, { backgroundColor: '#4F46E5' }]}
                    >
                      <Text style={tw`text-white font-bold text-xs`}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Glass Navigation Bar */}
      {!isMenuOpen && (
        <View style={tw`absolute bottom-6 left-6 right-6 bg-white/90 border border-white/80 rounded-full py-2.5 px-6 flex-row justify-between items-center shadow-xl shadow-indigo-500/10 backdrop-blur-lg`}>
          {navItems.map((item) => {
            const isActive = item.id === 'progress';
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
