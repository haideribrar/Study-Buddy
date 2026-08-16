import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';

const showAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    alert(`${title}: ${message}`);
    if (buttons && buttons[0] && buttons[0].onPress) {
      buttons[0].onPress();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

export default function SignupScreen({ onNavigate, onSignup }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetHint, setResetHint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignup = async () => {
    setErrorMessage('');
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !resetHint.trim()) {
      setErrorMessage("Please fill in all fields, including the reset hint.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Sign up the user
      const signupResponse = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, fullName, resetHint })
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.error || 'Sign up failed');
      }

      // 2. Perform auto-login to retrieve token and user profile
      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.error || 'Auto-login failed');
      }

      onSignup(loginData.user, loginData.token);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#F8FAFC]`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6 py-6`}>
          <View style={tw`items-center mb-5`}>
            <Image
              source={require('../assets/icon.png')}
              style={tw`w-16 h-16 rounded-2xl mb-2 shadow-xs`}
              resizeMode="contain"
            />
            <Text style={tw`text-xl font-extrabold text-slate-900 tracking-tight`}>Create Account</Text>
            <Text style={tw`text-[9px] text-indigo-600 mt-0.5 font-extrabold uppercase tracking-widest`}>Begin your focused study program</Text>
          </View>

          {/* Glass Signup Panel */}
          <View style={tw`bg-white border border-slate-200/80 rounded-[28px] p-5.5 shadow-lg shadow-indigo-500/5`}>
            {/* Full Name Input */}
            <View style={tw`mb-3`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider`}>Full Name</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5`}>
                <Feather name="user" size={15} color="#4F46E5" style={tw`mr-2.5`} />
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={setFullName}
                  style={[
                    tw`flex-1 text-slate-800 text-base font-semibold`,
                    Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                  ]}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={tw`mb-3`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider`}>Email Address</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5`}>
                <Feather name="mail" size={15} color="#4F46E5" style={tw`mr-2.5`} />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    tw`flex-1 text-slate-800 text-base font-semibold`,
                    Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                  ]}
                />
              </View>
            </View>

            {/* Password Reset Hint Input */}
            <View style={tw`mb-3`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider`}>Password Reset Hint</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5`}>
                <Feather name="help-circle" size={15} color="#4F46E5" style={tw`mr-2.5`} />
                <TextInput
                  placeholder="e.g. Your first pet's name"
                  placeholderTextColor="#94A3B8"
                  value={resetHint}
                  onChangeText={setResetHint}
                  style={[
                    tw`flex-1 text-slate-800 text-base font-semibold`,
                    Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                  ]}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={tw`mb-3`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider`}>Password</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5`}>
                <Feather name="lock" size={15} color="#4F46E5" style={tw`mr-2.5`} />
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  style={[
                    tw`flex-1 text-slate-800 text-base font-semibold`,
                    Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                  ]}
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
            <View style={tw`mb-3`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider`}>Confirm Password</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5`}>
                <Feather name="lock" size={15} color="#4F46E5" style={tw`mr-2.5`} />
                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(val) => { setConfirmPassword(val); setErrorMessage(''); }}
                  autoCapitalize="none"
                  style={[
                    tw`flex-1 text-slate-800 text-base font-semibold`,
                    Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                  ]}
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

            {/* Inline Error Message */}
            {errorMessage ? (
              <View style={tw`bg-red-50 border border-red-200/80 rounded-2xl px-4 py-2 mb-3 flex-row items-center`}>
                <Feather name="alert-circle" size={14} color="#EF4444" style={tw`mr-2`} />
                <Text style={tw`text-red-600 font-bold text-xs flex-1`}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignup}
              disabled={isLoading}
              style={[
                tw`rounded-full py-3.5 px-6 items-center justify-center shadow-md mb-3.5`,
                { backgroundColor: '#4F46E5' },
                isLoading ? tw`opacity-60` : {}
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={tw`text-white font-extrabold text-sm tracking-wide text-center`}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Login Navigation Link inside Card */}
            <View style={tw`flex-row justify-center items-center pt-1 border-t border-slate-100`}>
              <Text style={tw`text-slate-500 text-xs font-semibold`}>Already have an account? </Text>
              <TouchableOpacity onPress={() => onNavigate('login')}>
                <Text style={tw`text-xs font-bold text-indigo-600`}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
