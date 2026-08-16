import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';

export default function ForgotPasswordScreen({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [hint, setHint] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleReset = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!hint.trim()) {
      setErrorMessage("Please enter your password reset hint.");
      return;
    }
    if (!newPassword.trim()) {
      setErrorMessage("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }
    if (!confirmPassword.trim()) {
      setErrorMessage("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, hint, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      setSuccessMessage("Password reset successfully! You can now log in.");
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
        <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6 py-12`}>
          {/* Header */}
          <View style={tw`items-center mb-8`}>
            <Image
              source={require('../assets/icon.png')}
              style={tw`w-20 h-20 rounded-2xl mb-3 shadow-xs`}
              resizeMode="contain"
            />
            <Text style={tw`text-2xl font-extrabold text-slate-900 tracking-tight`}>Reset Password</Text>
            <Text style={tw`text-[10px] text-indigo-600 mt-1 font-extrabold uppercase tracking-widest text-center`}>Enter your hint to recover access</Text>
          </View>

          {/* Reset Panel */}
          <View style={tw`bg-white/90 border border-slate-200/80 rounded-[32px] p-6 shadow-lg shadow-indigo-500/5`}>
            {/* Email Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wider`}>Email Address</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5`}>
                <Feather name="mail" size={16} color="#4F46E5" style={tw`mr-3`} />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={(val) => { setEmail(val); setErrorMessage(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    tw`flex-1 text-slate-800 text-base font-semibold`,
                    Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                  ]}
                />
              </View>
            </View>

            {/* Hint Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wider`}>Password Reset Hint</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5`}>
                <Feather name="help-circle" size={16} color="#4F46E5" style={tw`mr-3`} />
                <TextInput
                  placeholder="Enter the hint you set at signup"
                  placeholderTextColor="#94A3B8"
                  value={hint}
                  onChangeText={(val) => { setHint(val); setErrorMessage(''); }}
                  autoCapitalize="none"
                  style={[
                    tw`flex-1 text-slate-800 text-base font-semibold`,
                    Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                  ]}
                />
              </View>
            </View>

            {/* New Password Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wider`}>New Password</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5`}>
                <Feather name="lock" size={16} color="#4F46E5" style={tw`mr-3`} />
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={(val) => { setNewPassword(val); setErrorMessage(''); }}
                  autoCapitalize="none"
                  style={[
                    tw`flex-1 text-slate-800 text-base font-semibold`,
                    Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                  ]}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wider`}>Confirm Password</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5`}>
                <Feather name="lock" size={16} color="#4F46E5" style={tw`mr-3`} />
                <TextInput
                  placeholder="Confirm new password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={(val) => { setConfirmPassword(val); setErrorMessage(''); setSuccessMessage(''); }}
                  autoCapitalize="none"
                  style={[
                    tw`flex-1 text-slate-800 text-base font-semibold`,
                    Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
                  ]}
                />
              </View>
            </View>

            {/* Inline Error Message */}
            {errorMessage ? (
              <View style={tw`bg-red-50 border border-red-200/80 rounded-2xl px-4 py-2.5 mb-3 flex-row items-center`}>
                <Feather name="alert-circle" size={14} color="#EF4444" style={tw`mr-2`} />
                <Text style={tw`text-red-600 font-bold text-xs flex-1`}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Inline Success Message */}
            {successMessage ? (
              <View style={tw`bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-2.5 mb-3 flex-row items-center`}>
                <Feather name="check-circle" size={14} color="#10B981" style={tw`mr-2`} />
                <Text style={tw`text-emerald-700 font-bold text-xs flex-1`}>{successMessage}</Text>
              </View>
            ) : null}

            {/* Reset Password Button */}
            <TouchableOpacity
              onPress={handleReset}
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
                <Text style={tw`text-white font-extrabold text-sm tracking-wide text-center`}>Reset Password</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login Link inside Card */}
            <TouchableOpacity 
              onPress={() => onNavigate('login')}
              style={tw`flex-row items-center justify-center pt-2 border-t border-slate-100`}
            >
              <Feather name="arrow-left" size={14} color="#4F46E5" style={tw`mr-1.5`} />
              <Text style={tw`text-xs font-bold text-indigo-600`}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
