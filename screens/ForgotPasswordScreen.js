import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ onNavigate }) {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    Alert.alert(
      "Reset Link Sent",
      `A password reset link has been sent to ${email || 'your email'}.`,
      [{ text: "OK", onPress: () => onNavigate('login') }]
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#FDF6EC]`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6 py-12`}>
          {/* Logo / Header */}
          <View style={tw`items-center mb-8`}>
            <View style={tw`w-20 h-20 bg-[#FF7C5C] rounded-full items-center justify-center shadow-md mb-3`}>
              <FontAwesome name="smile-o" size={44} color="#FFFFFF" />
            </View>
            <Text style={tw`text-2xl font-extrabold text-slate-800 tracking-tight`}>Reset Password</Text>
            <Text style={tw`text-xs text-slate-450 mt-1 font-bold uppercase tracking-wider`}>Recover access to your study dashboard 🌸</Text>
          </View>

          {/* Reset Panel */}
          <View style={tw`bg-white border border-[#F5EBE1] rounded-[32px] p-6 shadow-sm`}>
            {/* Email Input */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-[10px] font-bold text-[#FF7C5C] mb-1.5 uppercase tracking-wider`}>Email Address</Text>
              <View style={tw`flex-row items-center bg-[#FDF6EC]/40 border border-[#F5EBE1] rounded-2xl px-4 py-3`}>
                <Feather name="mail" size={15} color="#94A3B8" style={tw`mr-3`} />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={tw`flex-1 text-slate-700 text-sm`}
                />
              </View>
            </View>

            {/* Send Link Button */}
            <TouchableOpacity
              onPress={handleReset}
              style={tw`bg-[#FF7C5C] rounded-full py-3.5 items-center shadow-md shadow-[#FF7C5C]/10 mb-2`}
            >
              <Text style={tw`text-white font-bold text-sm tracking-wide`}>Send Link</Text>
            </TouchableOpacity>
          </View>

          {/* Back to Login Link */}
          <TouchableOpacity 
            onPress={() => onNavigate('login')}
            style={tw`flex-row items-center justify-center mt-8`}
          >
            <Feather name="arrow-left" size={15} color="#FF7C5C" style={tw`mr-2`} />
            <Text style={tw`text-sm font-bold text-[#FF7C5C]`}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
