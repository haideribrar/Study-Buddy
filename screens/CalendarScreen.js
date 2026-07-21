import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function CalendarScreen({ onNavigate, events }) {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Current Month & Year State
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Date utilities
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // Sunday=0, Monday=1...

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const isCurrentMonthToday = currentMonth === todayMonth && currentYear === todayYear;

  const formattedToday = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleJumpToToday = () => {
    setCurrentMonth(todayMonth);
    setCurrentYear(todayYear);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getUpcomingDaysText = (dateStr) => {
    if (!dateStr) return null;
    let eventDate;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        eventDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    } else {
      eventDate = new Date(dateStr);
    }

    if (!eventDate || isNaN(eventDate.getTime())) return null;

    const todayMidnight = new Date(todayYear, todayMonth, todayDay);
    const eventMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    const diffTime = eventMidnight - todayMidnight;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `Upcoming in ${diffDays} days`;
    if (diffDays === -1) return '1 day ago';
    return `${Math.abs(diffDays)} days ago`;
  };

  // Match events for a specific day in the selected month/year
  const getEventsForDay = (day) => {
    const dayStr = day.toString().padStart(2, '0');
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const dateKey = `${dayStr}/${monthStr}/${currentYear}`;
    return (events || []).filter(e => e.date === dateKey);
  };

  const getCategoryColor = (category) => {
    if (category === 'Study Session') return 'bg-emerald-500';
    if (category === 'Exam') return 'bg-indigo-600';
    if (category === 'Assignment') return 'bg-cyan-500';
    return 'bg-amber-400'; // Quiz
  };

  // Build grid blocks
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const calendarCells = [];
  // Offset slots
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push({ day: '', isCurrent: false });
  }
  // Month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, isCurrent: true });
  }
  // Trailing empty slots to complete 7-column rows
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    calendarCells.push({ day: '', isCurrent: false });
  }

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

  // Filter and sort events matching the selected month and year by closest date first
  const filteredEventsForMonth = (events || []).filter(e => {
    if (!e.date) return false;
    const parts = e.date.split('/');
    if (parts.length < 3) return false;
    const eventMonth = parseInt(parts[1], 10) - 1;
    const eventYear = parseInt(parts[2], 10);
    return eventMonth === currentMonth && eventYear === currentYear;
  }).sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));

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

  return (
    <View style={tw`flex-grow flex-1 bg-[#F8FAFC]`}>
      {/* Glass Header */}
      <SafeAreaView style={tw`bg-white/80 backdrop-blur-md border-b border-slate-200/50`}>
        <View style={tw`flex-row items-center justify-between px-6 pt-3 pb-4`}>
          <TouchableOpacity 
            onPress={() => onNavigate('dashboard')}
            style={tw`w-9 h-9 bg-white border border-slate-200/60 rounded-full items-center justify-center shadow-xs`}
          >
            <Feather name="arrow-left" size={16} color="#6366F1" />
          </TouchableOpacity>
          <Text style={tw`text-lg font-bold text-slate-900 tracking-tight`}>Study Calendar</Text>
          <View style={tw`w-9`} />
        </View>
      </SafeAreaView>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`px-6 pt-6 pb-28`}>
        {/* Monthly Tracker Banner */}
        <View style={tw`bg-white/85 border border-slate-200/60 rounded-[24px] p-5 mb-5 shadow-sm shadow-indigo-500/5`}>
          <Text style={tw`text-sm font-bold text-slate-900 mb-1`}>Monthly Tracker 📅</Text>
          <Text style={tw`text-slate-500 text-xs font-medium`}>
            Your upcoming tasks and reminders are pinned in the grid below. Today's date is outlined in cyan.
          </Text>
        </View>

        {/* Calendar Grid Container (Frosted Glass Widget) */}
        <View style={tw`bg-white border border-slate-200/80 rounded-[28px] p-5 shadow-sm shadow-indigo-500/5 mb-5`}>
          {/* Today's Date Banner */}
          <View style={tw`flex-row items-center justify-between bg-indigo-50 border border-indigo-100/80 px-4 py-2.5 rounded-2xl mb-4 shadow-xs`}>
            <View style={tw`flex-row items-center`}>
              <Feather name="clock" size={14} color="#4F46E5" style={tw`mr-2`} />
              <Text style={tw`text-xs font-bold text-slate-800`}>Today:</Text>
              <Text style={tw`text-xs font-bold text-indigo-700 ml-1.5`}>{formattedToday}</Text>
            </View>
            {!isCurrentMonthToday && (
              <TouchableOpacity 
                onPress={handleJumpToToday}
                style={[tw`px-3 py-1 rounded-full shadow-xs`, { backgroundColor: '#4F46E5' }]}
              >
                <Text style={tw`text-[10px] font-bold text-white`}>Today</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Calendar Header with Navigation */}
          <View style={tw`flex-row items-center justify-between mb-5`}>
            <TouchableOpacity onPress={handlePrevMonth} style={tw`p-2 bg-indigo-50 border border-indigo-100 rounded-full shadow-xs`}>
              <Feather name="chevron-left" size={16} color="#4F46E5" />
            </TouchableOpacity>
            <Text style={tw`text-base font-extrabold text-slate-900 uppercase tracking-wide`}>
              {new Date(currentYear, currentMonth).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={tw`p-2 bg-indigo-50 border border-indigo-100 rounded-full shadow-xs`}>
              <Feather name="chevron-right" size={16} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          {/* Week Labels */}
          <View style={tw`flex-row justify-between mb-3 border-b border-slate-100 pb-2`}>
            {daysOfWeek.map((day, idx) => (
              <View key={idx} style={tw`flex-1 items-center`}>
                <Text style={tw`text-xs font-bold text-slate-400`}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Day Blocks */}
          <View style={tw`flex-row flex-wrap justify-start`}>
            {calendarCells.map((cell, idx) => {
              const dayEvents = cell.isCurrent ? getEventsForDay(cell.day) : [];
              const hasEvents = dayEvents.length > 0;
              const dotColor = hasEvents ? getCategoryColor(dayEvents[0].category) : '';
              const isToday = cell.isCurrent && isCurrentMonthToday && cell.day === todayDay;

              return (
                <View 
                  key={idx} 
                  style={[
                    tw`w-[13.5%] aspect-square items-center justify-center m-[0.3%] rounded-full`,
                    isToday 
                      ? tw`bg-cyan-50 border-2 border border-cyan-500 shadow-sm` 
                      : cell.isCurrent ? tw`bg-slate-50/60 border border-slate-100` : tw`bg-transparent border-transparent`
                  ]}
                >
                  <View style={tw`w-full h-full items-center justify-center relative`}>
                    <Text style={tw`text-xs font-bold ${isToday ? 'text-cyan-700 font-extrabold' : cell.isCurrent ? 'text-slate-800' : 'text-slate-300'}`}>
                      {cell.day}
                    </Text>
                    {hasEvents && (
                      <View style={[
                        tw`absolute bottom-1 w-1.5 h-1.5 rounded-full`,
                        isToday ? tw`bg-cyan-500` : tw`${dotColor}`
                      ]} />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Reminders List for Selected Month */}
        <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5`}>
          Reminders for {new Date(currentYear, currentMonth).toLocaleDateString('default', { month: 'long' })}
        </Text>
        
        {filteredEventsForMonth.length > 0 ? (
          filteredEventsForMonth.map((event) => {
            const catConfig = getCategoryBarConfig(event.category);
            const upcomingText = getUpcomingDaysText(event.date);

            return (
              <View 
                key={event.id}
                style={tw`bg-white/85 border border-slate-200/60 rounded-[24px] mb-4 shadow-sm shadow-indigo-500/5 overflow-hidden`}
              >
                {/* Top Category Header Bar */}
                <View style={[
                  tw`px-4 py-2 flex-row items-center justify-between`,
                  tw`${catConfig.barBg} ${catConfig.borderColor}`
                ]}>
                  <Text style={tw`text-[10px] font-extrabold uppercase tracking-wider ${catConfig.textColor}`}>
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
                      <FontAwesome name="smile-o" size={18} color="#6366F1" />
                    ) : (
                      <FontAwesome name="graduation-cap" size={18} color="#06B6D4" />
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
                          { backgroundColor: '#4F46E5', width: `${event.progress}%` }
                        ]} />
                      </View>
                      <Text style={tw`text-[10px] font-bold text-slate-600 w-8 text-right`}>{event.progress}%</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={tw`bg-white/80 border border-slate-200/60 rounded-[24px] p-6 shadow-sm items-center`}>
            <Feather name="info" size={18} color="#64748B" style={tw`mb-2`} />
            <Text style={tw`text-xs font-semibold text-slate-400`}>No events scheduled for this month.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
