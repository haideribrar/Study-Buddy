import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function DashboardScreen({ events, onDeleteEvent, onNavigate, onOpenMenu, username }) {
  
  // Sort events priority-wise (closest due date first)
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateA - dateB;
  });

  const navItems = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'chatbot', icon: 'message-square', label: 'Buddy' },
    { id: 'timer', icon: 'clock', label: 'Timer' },
    { id: 'progress', icon: 'bar-chart-2', label: 'Progress' }
  ];

  return (
    <SafeAreaView style={tw`flex-1 bg-[#FDF6EC]`}>
      {/* Headspace Header */}
      <View style={tw`flex-row items-center justify-between px-6 pt-3 pb-4 bg-white border-b border-[#F5EBE1]`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity 
            onPress={onOpenMenu}
            style={tw`mr-3.5 w-9 h-9 bg-white border border-[#F5EBE1] rounded-full items-center justify-center shadow-sm`}
          >
            <Feather name="menu" size={16} color="#FF7C5C" />
          </TouchableOpacity>
          <Text style={tw`text-lg font-bold text-slate-800 tracking-tight`}>Study Buddy</Text>
        </View>
        <View style={tw`flex-row items-center bg-[#FF7C5C]/10 border border-[#FF7C5C]/20 rounded-full py-1 px-3.5 shadow-sm`}>
          <View style={tw`w-2 h-2 rounded-full bg-[#FF7C5C] mr-2`} />
          <Text style={tw`text-xs font-bold text-[#FF7C5C]`}>{username}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={tw`px-6 pt-6 pb-28`}>
        {/* Banner - Calming Card */}
        <View style={tw`bg-[#858CE9] rounded-[32px] p-5.5 mb-6.5 shadow-sm`}>
          <Text style={tw`text-white text-lg font-bold mb-1.5`}>Ready to Focus? 🧠</Text>
          <Text style={tw`text-indigo-100 text-xs mb-4.5 leading-relaxed`}>
            Your chatbot Study Buddy is online and ready to help you quiz, outline, or solve problems.
          </Text>
          <TouchableOpacity 
            onPress={() => onNavigate('chatbot')}
            style={tw`bg-white/20 border border-white/30 rounded-full py-2.5 px-5 align-self-start`}
          >
            <Text style={tw`text-white font-bold text-xs`}>Talk to Buddy</Text>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={tw`flex-row items-center justify-between mb-5`}>
          <View>
            <Text style={tw`text-lg font-bold text-slate-800 tracking-tight`}>Upcoming Events</Text>
          </View>
          <TouchableOpacity 
            onPress={() => onNavigate('add_event')}
            style={tw`flex-row items-center bg-[#FF7C5C]/10 border border-[#FF7C5C]/20 rounded-full px-4 py-2`}
          >
            <Feather name="plus" size={13} color="#FF7C5C" style={tw`mr-1.5`} />
            <Text style={tw`text-[#FF7C5C] font-bold text-xs`}>Add Event</Text>
          </TouchableOpacity>
        </View>

        {/* Events List (Rounded Peach Cards) */}
        {sortedEvents.length === 0 ? (
          <View style={tw`bg-white border border-[#F5EBE1] rounded-[32px] p-8 items-center shadow-sm`}>
            <Feather name="calendar" size={32} color="#94A3B8" style={tw`mb-3`} />
            <Text style={tw`text-slate-700 font-bold text-sm mb-1`}>No Events Scheduled</Text>
            <Text style={tw`text-slate-400 text-xs text-center px-4 mb-4 font-semibold`}>
              Add an exam, assignment, or study session to track your preparation.
            </Text>
            <TouchableOpacity
              onPress={() => onNavigate('add_event')}
              style={tw`border border-[#FF7C5C]/20 bg-[#FF7C5C]/5 rounded-full py-2 px-5`}
            >
              <Text style={tw`text-[#FF7C5C] font-bold text-xs`}>Create Your First Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sortedEvents.map((event) => (
            <View 
              key={event.id}
              style={tw`bg-white border border-[#F5EBE1] rounded-[28px] p-4.5 mb-4 shadow-sm flex-row items-center`}
            >
              {/* Event Category Image - Friendly Circle */}
              <View style={tw`w-12 h-12 bg-[#FF7C5C]/10 rounded-full items-center justify-center mr-3.5`}>
                {event.category === 'Study Session' ? (
                  <FontAwesome name="smile-o" size={20} color="#FF7C5C" />
                ) : (
                  <FontAwesome name="graduation-cap" size={20} color="#858CE9" />
                )}
              </View>

              {/* Event Information */}
              <View style={tw`flex-grow flex-1 mr-2`}>
                <Text style={tw`text-sm font-bold text-slate-800 mb-0.5`} numberOfLines={1}>
                  {event.title}
                </Text>
                <View style={tw`flex-row items-center mb-2.5`}>
                  <Feather name="calendar" size={10} color="#64748B" style={tw`mr-1`} />
                  <Text style={tw`text-[11px] font-bold text-slate-500`}>{event.date}</Text>
                  {event.category && (
                    <Text style={tw`text-[9px] bg-[#FDF6EC] text-[#FF7C5C] font-bold px-2.5 py-0.5 rounded-full ml-2 border border-[#F5EBE1] uppercase`}>
                      {event.category}
                    </Text>
                  )}
                </View>

                {/* Progress bar */}
                <View style={tw`flex-row items-center`}>
                  <View style={tw`flex-1 h-2 bg-slate-100 rounded-full mr-2.5 overflow-hidden`}>
                    <View style={[
                      tw`h-full rounded-full`, 
                      { 
                        backgroundColor: event.category === 'Study Session' ? '#FF7C5C' : '#858CE9',
                        width: `${event.progress}%` 
                      }
                    ]} />
                  </View>
                  <Text style={tw`text-[10px] font-bold text-slate-600 w-8 text-right`}>{event.progress}%</Text>
                </View>
              </View>

              {/* Actions */}
              <TouchableOpacity 
                onPress={() => onDeleteEvent(event.id)}
                style={tw`p-2 bg-red-50 rounded-full`}
              >
                <Feather name="trash-2" size={13} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Headspace Tab Bar */}
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 pt-2.5 pb-6 px-6 flex-row justify-between items-center shadow-lg`}>
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
