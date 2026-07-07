import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function EditProfileScreen({ username, onSaveProfile, onNavigate }) {
  const [name, setName] = useState(username);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }
    onSaveProfile(name);
    Alert.alert("Success", "Profile name updated! 👤");
  };

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
        <Text style={tw`text-lg font-bold text-slate-800 tracking-tight`}>Edit Profile</Text>
        <View style={tw`w-9`} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-grow flex-1 justify-center px-6`}
      >
        <View style={tw`bg-white border border-[#F5EBE1] rounded-[32px] p-7 shadow-sm items-center`}>
          {/* Avatar circle */}
          <View style={tw`w-20 h-20 bg-[#FF7C5C]/10 rounded-full items-center justify-center shadow-sm mb-6`}>
            <FontAwesome name="user" size={36} color="#FF7C5C" />
          </View>

          {/* Edit Field */}
          <View style={tw`w-full mb-6`}>
            <Text style={tw`text-[10px] font-bold text-[#FF7C5C] mb-1.5 uppercase tracking-wider`}>Student Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={tw`bg-[#FDF6EC]/40 border border-[#F5EBE1] rounded-2xl px-4 py-3 text-slate-700 font-semibold text-sm`}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            style={tw`w-full bg-[#FF7C5C] rounded-full py-3.5 items-center shadow-md shadow-[#FF7C5C]/10 mb-4`}
          >
            <Text style={tw`text-white font-bold text-sm`}>Save Changes</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => onNavigate('dashboard')}
            style={tw`w-full bg-slate-50 border border-slate-200/60 rounded-full py-3.5 items-center shadow-sm`}
          >
            <Text style={tw`text-slate-650 font-bold text-sm`}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
