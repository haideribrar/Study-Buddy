import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function CalendarScreen({ onNavigate, events }) {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // May 2025 Calendar days
  const prevMonthDays = [27, 28, 29, 30];
  const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const nextMonthDays = [1, 2, 3, 4, 5, 6, 7];

  const calendarCells = [
    ...prevMonthDays.map(d => ({ day: d, isCurrent: false })),
    ...currentMonthDays.map(d => ({ day: d, isCurrent: true })),
    ...nextMonthDays.map(d => ({ day: d, isCurrent: false }))
  ].slice(0, 35);

  const isReminderDay = (day) => {
    // Reminder days matching dummy events (10, 13, 15, 18)
    return day === 10 || day === 13 || day === 15 || day === 18;
  };

  const getReminderBadgeColor = (day) => {
    if (day === 10) return 'bg-[#FF7C5C]'; // Study Session
    if (day === 13) return 'bg-[#858CE9]'; // Exam
    if (day === 15) return 'bg-indigo-400'; // Assignment
    return 'bg-amber-400'; // Quiz
  };

  return (
    <View style={tw`flex-grow flex-1 bg-[#FDF6EC]`}>
      {/* Header */}
      <SafeAreaView style={tw`bg-white`}>
        <View style={tw`flex-row items-center justify-between px-6 pt-3 pb-4 bg-white border-b border-[#F5EBE1]`}>
          <TouchableOpacity 
            onPress={() => onNavigate('dashboard')}
            style={tw`w-9 h-9 bg-white border border-[#F5EBE1] rounded-full items-center justify-center shadow-sm`}
          >
            <Feather name="arrow-left" size={16} color="#FF7C5C" />
          </TouchableOpacity>
          <Text style={tw`text-lg font-bold text-slate-800 tracking-tight`}>Study Calendar</Text>
          <View style={tw`w-9`} />
        </View>
      </SafeAreaView>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`px-6 pt-6 pb-24`}>
        {/* Headspace Banner */}
        <View style={tw`bg-white border border-[#F5EBE1] rounded-[32px] p-5 mb-5 shadow-sm`}>
          <Text style={tw`text-sm font-bold text-slate-800 mb-0.5`}>Monthly Tracker 📅</Text>
          <Text style={tw`text-slate-400 text-xs font-semibold`}>
            Your upcoming tasks and reminders are pinned in the grid below.
          </Text>
        </View>

        {/* Headspace Grid Month Box */}
        <View style={tw`bg-white border border-[#F5EBE1] rounded-[32px] p-5 shadow-sm mb-5`}>
          <Text style={tw`text-base font-bold text-slate-800 text-center uppercase tracking-wide mb-4`}>May 2025</Text>

          {/* Week labels */}
          <View style={tw`flex-row justify-between mb-3`}>
            {daysOfWeek.map((day, idx) => (
              <View key={idx} style={tw`flex-1 items-center`}>
                <Text style={tw`text-xs font-bold text-slate-400`}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Day blocks */}
          <View style={tw`flex-row flex-wrap justify-between`}>
            {calendarCells.map((cell, idx) => {
              const isReminder = cell.isCurrent && isReminderDay(cell.day);
              const reminderColor = isReminder ? getReminderBadgeColor(cell.day) : '';
              return (
                <View 
                  key={idx} 
                  style={tw`w-[13%] aspect-square items-center justify-center m-[0.5%] border rounded-full ${
                    cell.isCurrent ? 'bg-[#FDF6EC]/40 border-[#F5EBE1]' : 'bg-transparent border-transparent'
                  }`}
                >
                  <View style={tw`w-full h-full items-center justify-center relative`}>
                    <Text style={tw`text-xs font-bold ${cell.isCurrent ? 'text-slate-850' : 'text-slate-300'}`}>
                      {cell.day}
                    </Text>
                    {isReminder && (
                      <View style={tw`absolute bottom-1 w-1.5 h-1.5 rounded-full ${reminderColor}`} />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Reminders List */}
        <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5`}>Monthly Reminders</Text>
        
        {events.map((event) => (
          <View 
            key={event.id}
            style={tw`bg-white border border-[#F5EBE1] rounded-[24px] p-4 mb-3.5 shadow-sm flex-row items-center justify-between`}
          >
            <View style={tw`flex-row items-center flex-1 mr-3`}>
              <View style={tw`w-9 h-9 bg-[#FF7C5C]/10 rounded-full items-center justify-center mr-3`}>
                {event.category === 'Study Session' ? (
                  <FontAwesome name="smile-o" size={16} color="#FF7C5C" />
                ) : (
                  <Feather name="calendar" size={14} color="#858CE9" />
                )}
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs font-bold text-slate-750`} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={tw`text-[10px] font-semibold text-slate-400 mt-0.5`}>{event.date}</Text>
              </View>
            </View>
            <View style={tw`bg-[#FDF6EC] border border-[#F5EBE1] px-3 py-1 rounded-full`}>
              <Text style={tw`text-[9px] font-bold text-[#FF7C5C]`}>{event.progress}%</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
