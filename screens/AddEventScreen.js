import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import tw from 'twrnc';
import { Feather } from '@expo/vector-icons';

export default function AddEventScreen({ onAddEvent, onNavigate }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('Exam');
  const [showDropdown, setShowDropdown] = useState(false);

  const categories = ['Exam', 'Quiz', 'Assignment', 'Study Session'];

  const handleSubmit = () => {
    if (!title || !date) {
      Alert.alert("Required Fields", "Please enter both Event Title and Date.");
      return;
    }
    
    onAddEvent({
      title,
      date,
      description,
      goal,
      category,
      progress: 0
    });
  };

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
        <TouchableOpacity 
          onPress={() => onNavigate('dashboard')}
          style={tw`w-9 h-9 bg-white border border-[#F5EBE1] rounded-full items-center justify-center shadow-sm`}
        >
          <Feather name="arrow-left" size={16} color="#FF7C5C" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold text-slate-800 tracking-tight`}>Add New Event</Text>
        <View style={tw`w-9`} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView contentContainerStyle={tw`px-6 pt-6 pb-28`}>
          <Text style={tw`text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide`}>Fill in the details</Text>
          
          <View style={tw`bg-white border border-[#F5EBE1] rounded-[32px] p-6 shadow-sm`}>
            {/* Title Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-[#FF7C5C] mb-1.5 uppercase tracking-wider`}>Event Title</Text>
              <TextInput
                placeholder="e.g. Midterm Physics Exam"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
                style={tw`bg-[#FDF6EC]/40 border border-[#F5EBE1] rounded-2xl px-4 py-3 text-slate-750 text-sm`}
              />
            </View>

            {/* Date Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-[#FF7C5C] mb-1.5 uppercase tracking-wider`}>Event Date</Text>
              <View style={tw`flex-row items-center bg-[#FDF6EC]/40 border border-[#F5EBE1] rounded-2xl px-3.5`}>
                <TextInput
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#94A3B8"
                  value={date}
                  onChangeText={setDate}
                  style={tw`flex-1 py-3 text-slate-750 text-sm`}
                />
                <Feather name="calendar" size={15} color="#FF7C5C" />
              </View>
            </View>

            {/* Description Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-[#FF7C5C] mb-1.5 uppercase tracking-wider`}>Description (Optional)</Text>
              <TextInput
                placeholder="Topics covered, details, etc."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={tw`bg-[#FDF6EC]/40 border border-[#F5EBE1] rounded-2xl px-4 py-3 text-slate-750 text-sm h-20`}
              />
            </View>

            {/* Goal Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-[#FF7C5C] mb-1.5 uppercase tracking-wider`}>Goal (Optional)</Text>
              <TextInput
                placeholder="e.g., Get an A, complete 10 practices"
                placeholderTextColor="#94A3B8"
                value={goal}
                onChangeText={setGoal}
                style={tw`bg-[#FDF6EC]/40 border border-[#F5EBE1] rounded-2xl px-4 py-3 text-slate-750 text-sm`}
              />
            </View>

            {/* Category Dropdown */}
            <View style={tw`mb-8`}>
              <Text style={tw`text-[10px] font-bold text-[#FF7C5C] mb-1.5 uppercase tracking-wider`}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setShowDropdown(!showDropdown)}
                style={tw`flex-row items-center justify-between bg-[#FDF6EC]/40 border border-[#F5EBE1] rounded-2xl px-4 py-3`}
              >
                <Text style={tw`text-slate-700 text-sm font-semibold`}>{category}</Text>
                <Feather name="chevron-down" size={15} color="#FF7C5C" />
              </TouchableOpacity>

              {showDropdown && (
                <View style={tw`mt-2 bg-white border border-[#F5EBE1] rounded-[20px] overflow-hidden shadow-md`}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        setCategory(cat);
                        setShowDropdown(false);
                      }}
                      style={tw`px-4 py-3 border-b border-[#FDF6EC]`}
                    >
                      <Text style={tw`text-sm font-semibold text-slate-655 text-slate-600`}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Create Event Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={tw`bg-[#FF7C5C] rounded-full py-3.5 items-center shadow-md shadow-[#FF7C5C]/10`}
            >
              <Text style={tw`text-white font-bold text-sm tracking-wide`}>Create Event</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Tab Bar */}
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
