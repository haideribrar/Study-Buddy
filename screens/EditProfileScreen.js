import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';

export default function EditProfileScreen({ username, onSaveProfile, onNavigate, token }) {
  const [name, setName] = useState(username);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName: name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      onSaveProfile(name);
      Alert.alert("Success", "Profile name updated! 👤");
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#F8FAFC]`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-6 pt-3 pb-4 bg-white/80 border-b border-slate-200/60`}>
        <TouchableOpacity 
          onPress={() => onNavigate('dashboard')}
          style={tw`w-9 h-9 bg-white border border-slate-200/60 rounded-full items-center justify-center shadow-xs`}
        >
          <Feather name="arrow-left" size={16} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold text-slate-900 tracking-tight`}>Edit Profile</Text>
        <View style={tw`w-9`} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-grow flex-1 justify-center px-6`}
      >
        <View style={tw`bg-white/90 border border-slate-200/70 rounded-[32px] p-7 shadow-lg shadow-indigo-500/5 items-center`}>
          {/* Avatar circle */}
          <View style={tw`w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-full items-center justify-center shadow-xs mb-6`}>
            <FontAwesome name="user" size={36} color="#4F46E5" />
          </View>

          {/* Edit Field */}
          <View style={tw`w-full mb-6`}>
            <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wider`}>Student Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[
                tw`bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-slate-800 font-semibold text-sm`,
                Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
              ]}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            style={[
              tw`w-full rounded-full py-3.5 items-center shadow-md mb-3.5`,
              { backgroundColor: '#4F46E5' },
              isLoading ? tw`opacity-60` : {}
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={tw`text-white font-bold text-sm uppercase tracking-wide`}>Save Changes</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => onNavigate('dashboard')}
            style={tw`w-full bg-slate-100 border border-slate-200/70 rounded-full py-3.5 items-center shadow-xs`}
          >
            <Text style={tw`text-slate-700 font-bold text-sm`}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
