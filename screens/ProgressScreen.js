import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function ProgressScreen({ onNavigate, onOpenMenu, events, onUpdateSubTaskProgress }) {
  const [activeTab, setActiveTab] = useState('Quiz');

  // Filter events by category tab
  const getCategoryEvents = () => {
    return events.filter(event => {
      if (activeTab === 'Quiz') return event.category === 'Quiz';
      if (activeTab === 'Assignment') return event.category === 'Assignment';
      if (activeTab === 'Exams') return event.category === 'Exam';
      if (activeTab === 'Study Session') return event.category === 'Study Session';
      return false;
    });
  };

  const filteredEvents = getCategoryEvents();

  const navItems = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'chatbot', icon: 'message-square', label: 'Buddy' },
    { id: 'timer', icon: 'clock', label: 'Timer' },
    { id: 'progress', icon: 'bar-chart-2', label: 'Progress' }
  ];

  return (
    <SafeAreaView style={tw`flex-1 bg-[#FDF6EC]`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-6 pt-3 pb-4 bg-white border-b border-[#F5EBE1]`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity 
            onPress={onOpenMenu}
            style={tw`mr-3.5 w-9 h-9 bg-white border border-[#F5EBE1] rounded-full items-center justify-center shadow-sm`}
          >
            <Feather name="menu" size={16} color="#FF7C5C" />
          </TouchableOpacity>
          <Text style={tw`text-lg font-bold text-slate-800 tracking-tight`}>Progress Analyzer</Text>
        </View>
        <Feather name="trending-up" size={18} color="#FF7C5C" />
      </View>

      {/* Category Tabs */}
      <View style={tw`flex-row justify-between px-6 py-4 bg-transparent`}>
        {['Quiz', 'Assignment', 'Exams', 'Study Session'].map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={tw`flex-1 mx-1 py-2.5 rounded-full items-center border ${
                isSelected 
                  ? 'bg-[#FF7C5C] border-[#FF7C5C] shadow-sm shadow-[#FF7C5C]/10' 
                  : 'bg-white border-[#F5EBE1] shadow-xs'
              }`}
            >
              <Text style={tw`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-[#FF7C5C]'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={tw`px-6 pt-2 pb-28`}>
        {/* Study Streak Bento/Headspace Block */}
        <View style={tw`bg-white border border-[#F5EBE1] rounded-[28px] p-5 mb-6 shadow-sm flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-3.5`}>
              <Feather name="zap" size={16} color="#F97316" />
            </View>
            <View>
              <Text style={tw`text-base font-bold text-slate-800`}>5 Days Study Streak 🔥</Text>
              <Text style={tw`text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide`}>Keep your momentum going!</Text>
            </View>
          </View>
          <View style={tw`bg-orange-50 px-3 py-1 rounded-full border border-orange-100`}>
            <Text style={tw`text-[10px] font-bold text-[#F97316]`}>Active</Text>
          </View>
        </View>

        {/* Simplified category progress viewer */}
        <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-4`}>
          Track & Edit Progress Category-wise
        </Text>

        {filteredEvents.length === 0 ? (
          <View style={tw`bg-white border border-[#F5EBE1] rounded-[28px] p-8 items-center`}>
            <Text style={tw`text-slate-400 text-xs font-bold uppercase text-center`}>
              No scheduled {activeTab.toLowerCase()} tasks found
            </Text>
          </View>
        ) : (
          filteredEvents.map((event) => (
            <View 
              key={event.id} 
              style={tw`bg-white border border-[#F5EBE1] rounded-[28px] p-5 mb-5 shadow-sm`}
            >
              {/* Event Name Header & Average progress */}
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw`text-sm font-bold text-slate-800 flex-1 mr-3`} numberOfLines={1}>
                  {event.title}
                </Text>
                <View style={tw`bg-[#FF7C5C]/10 border border-[#FF7C5C]/20 px-2.5 py-0.5 rounded-full`}>
                  <Text style={tw`text-[10px] font-bold text-[#FF7C5C]`}>Avg: {event.progress}%</Text>
                </View>
              </View>

              {/* Sub-tasks lists with individual progress sliders */}
              {event.subTasks && event.subTasks.map((subTask) => (
                <View 
                  key={subTask.id} 
                  style={tw`flex-row items-center justify-between py-3 border-b border-slate-100 last:border-0`}
                >
                  <View style={tw`flex-grow flex-1 mr-4`}>
                    <Text style={tw`text-xs font-bold text-slate-700 mb-1.5`}>{subTask.name}</Text>
                    {/* Inner progress bar status */}
                    <View style={tw`flex-row items-center`}>
                      <View style={tw`flex-grow h-2 bg-slate-100 rounded-full mr-2.5 overflow-hidden`}>
                        <View style={[tw`h-full bg-[#FF7C5C] rounded-full`, { width: `${subTask.progress}%` }]} />
                      </View>
                      <Text style={tw`text-[10px] font-bold text-slate-500 w-8 text-right`}>{subTask.progress}%</Text>
                    </View>
                  </View>

                  {/* Adjuster buttons bar */}
                  <View style={tw`flex-row items-center`}>
                    <TouchableOpacity
                      onPress={() => onUpdateSubTaskProgress(event.id, subTask.id, -10)}
                      style={tw`w-7 h-7 bg-slate-50 border border-slate-200/50 rounded-full items-center justify-center mr-1.5`}
                    >
                      <Text style={tw`text-slate-650 font-bold text-xs`}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onUpdateSubTaskProgress(event.id, subTask.id, 10)}
                      style={tw`w-7 h-7 bg-[#FF7C5C]/10 border border-[#FF7C5C]/20 rounded-full items-center justify-center`}
                    >
                      <Text style={tw`text-[#FF7C5C] font-bold text-xs`}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Headspace Footer Tab Bar */}
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 pt-2.5 pb-6 px-6 flex-row justify-between items-center shadow-lg`}>
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
    </SafeAreaView>
  );
}
