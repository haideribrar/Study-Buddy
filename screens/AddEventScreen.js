import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, StatusBar } from 'react-native';
import tw from 'twrnc';
import { Feather } from '@expo/vector-icons';
import { scheduleEventReminder } from '../services/notificationService';


export default function AddEventScreen({ onAddEvent, onNavigate }) {

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('Exam');
  const [showDropdown, setShowDropdown] = useState(false);

  // Custom Calendar States
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  const categories = ['Exam', 'Quiz', 'Assignment', 'Study Session'];

  // Calendar Logic Helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    // Adjust JS default (Sunday=0) to Monday=0, Sunday=6
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const dayCells = [];

    // Offset empty slots at start
    for (let i = 0; i < firstDay; i++) {
      dayCells.push(<View key={`empty-start-${i}`} style={tw`w-[14.28%] h-9 mb-1`} />);
    }

    // Calendar day buttons
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const monthStr = (calendarMonth + 1).toString().padStart(2, '0');
      const dateStr = `${dayStr}/${monthStr}/${calendarYear}`;
      const isSelected = date === dateStr;

      const cellDate = new Date(calendarYear, calendarMonth, day);
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isPast = cellDate < todayMidnight;

      dayCells.push(
        <TouchableOpacity
          key={`day-${day}`}
          disabled={isPast}
          onPress={() => {
            setDate(dateStr);
            setShowCalendar(false);
          }}
          style={tw`w-[14.28%] h-9 items-center justify-center mb-1`}
        >
          <View style={[
            tw`w-8 h-8 items-center justify-center rounded-full`,
            isSelected ? [tw`shadow-xs`, { backgroundColor: '#4F46E5' }] : tw`bg-transparent`
          ]}>
            <Text style={tw.style(`text-xs font-semibold ${
              isSelected 
                ? 'text-white font-extrabold' 
                : isPast ? 'text-slate-300 line-through' : 'text-slate-700'
            }`)}>
              {day}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Offset empty slots at end to complete 7-column rows
    const totalCells = dayCells.length;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
      dayCells.push(<View key={`empty-end-${i}`} style={tw`w-[14.28%] h-9 mb-1`} />);
    }

    return dayCells;
  };

  const parseDateSafe = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const handleSubmit = async () => {

    if (!title || !date) {
      Alert.alert("Required Fields", "Please enter both Event Title and Date.");
      return;
    }

    const eventDate = parseDateSafe(date);
    if (eventDate) {
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const eventMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      
      if (eventMidnight < todayMidnight) {
        Alert.alert("Invalid Date", "You cannot schedule events in the past. Please select today or a future date.");
        return;
      }
    }
    
    const newEvent = {
      title,
      date,
      description,
      goal,
      category,
      progress: 0
    };

    onAddEvent(newEvent);
  };


  const navItems = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'chatbot', icon: 'message-square', label: 'Buddy' },
    { id: 'timer', icon: 'clock', label: 'Timer' },
    { id: 'progress', icon: 'bar-chart-2', label: 'Progress' }
  ];

  return (
    <SafeAreaView style={[
      tw`flex-1 bg-[#F8FAFC]`,
      { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0 }
    ]}>

      {/* Glass Header */}
      <View style={tw`flex-row items-center justify-between px-6 pt-3 pb-4 bg-white/80 border-b border-slate-200/60`}>
        <TouchableOpacity 
          onPress={() => onNavigate('dashboard')}
          style={tw`w-9 h-9 bg-white border border-slate-200/60 rounded-full items-center justify-center shadow-xs`}
        >
          <Feather name="arrow-left" size={16} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold text-slate-900 tracking-tight`}>Add New Event</Text>
        <View style={tw`w-9`} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView contentContainerStyle={tw`px-6 pt-6 pb-32`}>
          <Text style={tw`text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide`}>Fill in the details</Text>
          
          <View style={tw`bg-white border border-slate-200/80 rounded-[32px] p-6 shadow-lg shadow-indigo-500/5`}>
            {/* Title Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wider`}>Event Title</Text>
              <TextInput
                placeholder="e.g. Midterm Physics Exam"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
                style={[
                  tw`bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-slate-800 text-base font-semibold`,
                  Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                ]}
              />
            </View>

            {/* Date Input with Calendar Picker Toggle */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wider`}>Event Date</Text>
              <TouchableOpacity
                onPress={() => setShowCalendar(!showCalendar)}
                style={tw`flex-row items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5`}
              >
                <Text style={tw.style(`text-sm text-slate-800 ${date ? 'font-semibold' : 'text-slate-400'}`)}>
                  {date || 'Select from calendar picker'}
                </Text>
                <Feather name="calendar" size={16} color="#4F46E5" />
              </TouchableOpacity>

              {/* Inline Calendar Panel */}
              {showCalendar && (
                <View style={tw`mt-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-md`}>
                  {/* Calendar Navigation */}
                  <View style={tw`flex-row items-center justify-between mb-3.5`}>
                    <TouchableOpacity onPress={handlePrevMonth} style={tw`p-1.5 bg-indigo-50 rounded-full`}>
                      <Feather name="chevron-left" size={16} color="#4F46E5" />
                    </TouchableOpacity>
                    <Text style={tw`text-xs font-extrabold text-slate-900`}>
                      {new Date(calendarYear, calendarMonth).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={handleNextMonth} style={tw`p-1.5 bg-indigo-50 rounded-full`}>
                      <Feather name="chevron-right" size={16} color="#4F46E5" />
                    </TouchableOpacity>
                  </View>

                  {/* Calendar Day Labels */}
                  <View style={tw`flex-row justify-between mb-2 border-b border-slate-100 pb-1.5`}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, index) => (
                      <View key={index} style={tw`w-[14.28%] items-center`}>
                        <Text style={tw`text-[10px] font-extrabold text-slate-400`}>{d}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Calendar Matrix Grid */}
                  <View style={tw`flex-row flex-wrap justify-start`}>
                    {renderCalendarDays()}
                  </View>
                </View>
              )}
            </View>

            {/* Description Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wider`}>Description (Optional)</Text>
              <TextInput
                placeholder="Topics covered, details, etc."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={[
                  tw`bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-slate-800 text-base font-semibold h-20`,
                  Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                ]}
              />
            </View>

            {/* Goal Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wider`}>Goal (Optional)</Text>
              <TextInput
                placeholder="e.g., Get an A, complete 10 practices"
                placeholderTextColor="#94A3B8"
                value={goal}
                onChangeText={setGoal}
                style={[
                  tw`bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-slate-800 text-base font-semibold`,
                  Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                ]}
              />
            </View>

            {/* Category Dropdown */}
            <View style={tw`mb-8`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wider`}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setShowDropdown(!showDropdown)}
                style={tw`flex-row items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5`}
              >
                <Text style={tw`text-slate-800 text-sm font-semibold`}>{category}</Text>
                <Feather name="chevron-down" size={16} color="#4F46E5" />
              </TouchableOpacity>

              {showDropdown && (
                <View style={tw`mt-2 bg-white border border-slate-200/80 rounded-[20px] overflow-hidden shadow-md`}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        setCategory(cat);
                        setShowDropdown(false);
                      }}
                      style={tw`px-4 py-3.5 border-b border-slate-100 last:border-0`}
                    >
                      <Text style={tw`text-sm font-semibold text-slate-800`}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Create Event Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={[tw`rounded-full py-4 px-6 items-center justify-center shadow-md`, { backgroundColor: '#4F46E5' }]}
            >
              <Text style={tw`text-white font-extrabold text-base tracking-wide text-center`}>Create Event</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Glass Navigation Bar */}
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
                <Feather name={item.icon} size={18} color={isActive ? '#4F46E5' : '#94A3B8'} />
              </View>
              <Text style={tw.style(`text-[9px] mt-0.5 font-bold ${isActive ? 'text-indigo-600' : 'text-slate-400'}`)}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
