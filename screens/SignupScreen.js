import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function SignupScreen({ onNavigate, onSignup }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = () => {
    onSignup(fullName || 'User');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#FDF6EC]`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6 py-12`}>
          <View style={tw`items-center mb-8`}>
            <View style={tw`w-20 h-20 bg-[#FF7C5C] rounded-full items-center justify-center shadow-md mb-3`}>
              <FontAwesome name="smile-o" size={44} color="#FFFFFF" />
            </View>
            <Text style={tw`text-2xl font-extrabold text-slate-800 tracking-tight`}>Create Account</Text>
            <Text style={tw`text-xs text-slate-450 mt-1 font-bold uppercase tracking-wider`}>Begin your focused study program 🌸</Text>
          </View>

          {/* Headspace Signup Panel */}
          <View style={tw`bg-white border border-[#F5EBE1] rounded-[32px] p-6 shadow-sm`}>
            {/* Full Name Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-[#FF7C5C] mb-1.5 uppercase tracking-wider`}>Full Name</Text>
              <View style={tw`flex-row items-center bg-[#FDF6EC]/40 border border-[#F5EBE1] rounded-2xl px-4 py-3`}>
                <Feather name="user" size={15} color="#94A3B8" style={tw`mr-3`} />
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={setFullName}
                  style={tw`flex-1 text-slate-700 text-sm`}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={tw`mb-4`}>
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

            {/* Password Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-[#FF7C5C] mb-1.5 uppercase tracking-wider`}>Password</Text>
              <View style={tw`flex-row items-center bg-[#FDF6EC]/40 border border-[#F5EBE1] rounded-2xl px-4 py-3`}>
                <Feather name="lock" size={15} color="#94A3B8" style={tw`mr-3`} />
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  style={tw`flex-1 text-slate-700 text-sm`}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <Feather name="eye-off" size={15} color="#94A3B8" />
                  ) : (
                    <Feather name="eye" size={15} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-[10px] font-bold text-[#FF7C5C] mb-1.5 uppercase tracking-wider`}>Confirm Password</Text>
              <View style={tw`flex-row items-center bg-[#FDF6EC]/40 border border-[#F5EBE1] rounded-2xl px-4 py-3`}>
                <Feather name="lock" size={15} color="#94A3B8" style={tw`mr-3`} />
                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                  style={tw`flex-1 text-slate-700 text-sm`}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <Feather name="eye-off" size={15} color="#94A3B8" />
                  ) : (
                    <Feather name="eye" size={15} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignup}
              style={tw`bg-[#FF7C5C] rounded-full py-3.5 items-center shadow-md shadow-[#FF7C5C]/10`}
            >
              <Text style={tw`text-white font-bold text-sm tracking-wide`}>Sign Up</Text>
            </TouchableOpacity>

            {/* OR Separator */}
            <View style={tw`flex-row items-center my-4`}>
              <View style={tw`flex-1 h-[1px] bg-slate-100`} />
              <Text style={tw`text-[10px] font-bold text-slate-400 px-3 uppercase`}>OR</Text>
              <View style={tw`flex-1 h-[1px] bg-slate-100`} />
            </View>

            {/* Google Signup */}
            <TouchableOpacity
              onPress={handleSignup}
              style={tw`flex-row items-center justify-center border border-slate-200 bg-white rounded-full py-3 shadow-sm`}
            >
              <Feather name="chrome" size={15} color="#475569" style={tw`mr-2`} />
              <Text style={tw`text-slate-655 font-bold text-sm text-slate-600`}>Sign Up with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Login Navigation Link */}
          <View style={tw`flex-row justify-center mt-8`}>
            <Text style={tw`text-slate-400 text-sm font-semibold`}>Already have an account? </Text>
            <TouchableOpacity onPress={() => onNavigate('login')}>
              <Text style={tw`text-sm font-bold text-[#FF7C5C]`}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
