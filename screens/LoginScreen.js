import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
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

export default function LoginScreen({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.emailExists === false) {
          throw new Error('User not found.');
        } else if (data.emailExists === true) {
          setFailedAttempts(prev => prev + 1);
          throw new Error('Incorrect password.');
        }
        throw new Error(data.error || 'Incorrect password or email.');
      }

      setFailedAttempts(0);
      onLogin(data.user, data.token);
    } catch (err) {
      setErrorMessage(err.message || "Login failed.");
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
        <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6 py-10`}>
          {/* Modern Branding Logo */}
          <View style={tw`items-center mb-6`}>
            <View style={tw`w-18 h-18 bg-indigo-50 border border-indigo-100 rounded-full items-center justify-center shadow-xs mb-3`}>
              <FontAwesome name="smile-o" size={36} color="#4F46E5" />
            </View>
            <Text style={tw`text-2xl font-extrabold text-slate-900 tracking-tight`}>
              Study Buddy
            </Text>
            <Text style={tw`text-[10px] text-indigo-600 mt-0.5 font-extrabold uppercase tracking-widest`}>
              Calm & Focused Learning
            </Text>
          </View>

          {/* Glass Card Panel */}
          <View style={tw`bg-white border border-slate-200/80 rounded-[32px] p-6 shadow-lg shadow-indigo-500/5`}>
            <Text style={tw`text-xl font-bold text-slate-900 tracking-tight mb-1`}>Welcome Back</Text>
            <Text style={tw`text-xs font-semibold text-slate-500 mb-5`}>Log in to access your custom study modules</Text>

            {/* Email Input */}
            <View style={tw`mb-3.5`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider`}>Email Address</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3`}>
                <Feather name="mail" size={16} color="#4F46E5" style={tw`mr-3`} />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={(val) => { setEmail(val); setErrorMessage(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    tw`flex-1 text-slate-800 text-sm font-semibold`,
                    Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                  ]}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={tw`mb-3.5`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider`}>Password</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3`}>
                <Feather name="lock" size={16} color="#4F46E5" style={tw`mr-3`} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => { setPassword(val); setErrorMessage(''); }}
                  autoCapitalize="none"
                  style={[
                    tw`flex-1 text-slate-800 text-sm font-semibold`,
                    Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                  ]}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <Feather name="eye-off" size={16} color="#94A3B8" />
                  ) : (
                    <Feather name="eye" size={16} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Inline Error Message */}
            {errorMessage ? (
              <View style={tw`bg-red-50 border border-red-200/80 rounded-2xl px-4 py-2.5 mb-3 flex-row items-center`}>
                <Feather name="alert-circle" size={14} color="#EF4444" style={tw`mr-2`} />
                <Text style={tw`text-red-600 font-bold text-xs flex-1`}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Forgot Password Link */}
            <TouchableOpacity 
              onPress={() => onNavigate('forgot_password')}
              style={tw`self-end mb-4 flex-row items-center`}
            >
              <Feather name="help-circle" size={13} color="#4F46E5" style={tw`mr-1.5`} />
              <Text style={tw`text-xs font-bold text-indigo-600`}>Forgot Password? Reset via Hint</Text>
            </TouchableOpacity>

            {/* Log In Button */}
            <TouchableOpacity
              onPress={handleLogin}
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
                <Text style={tw`text-white font-extrabold text-sm tracking-wide text-center`}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Signup Navigation Link inside Card */}
            <View style={tw`flex-row justify-center items-center pt-2 border-t border-slate-100`}>
              <Text style={tw`text-slate-500 text-xs font-semibold`}>Don’t have an account? </Text>
              <TouchableOpacity onPress={() => onNavigate('signup')}>
                <Text style={tw`text-xs font-bold text-indigo-600`}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
