import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';

const renderMessageText = (text, isBot) => {
  if (!text) return null;
  // Split by markdown bold format (**bold text**)
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <Text key={index} style={tw`font-extrabold ${isBot ? 'text-slate-900' : 'text-white'}`}>
          {boldText}
        </Text>
      );
    }
    return part;
  });
};

export default function ChatbotScreen({ onNavigate, onOpenMenu, token, chatMessages, setChatMessages, isSleepingCooldown }) {
  const [internalMessages, setInternalMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi! I am your study buddy. How may I help you today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messages = chatMessages || internalMessages;
  const setMessages = setChatMessages || setInternalMessages;

  const scrollViewRef = useRef();
  const fetchedHistoryRef = useRef(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ai/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data.length > 0) {
          const formatted = data.map(m => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error('[ChatbotScreen] Failed to fetch chat history:', err.message);
      }
    };

    if (token && !fetchedHistoryRef.current) {
      fetchedHistoryRef.current = true;
      fetchHistory();
    }
  }, [token]);


  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    if (isSleepingCooldown) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const sleepingBotMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'You exited the focus mode or left the app during Deep Focus, so I fell fast asleep! Currently I am unavailable for you 😴. I will wake up automatically once the 10-minute sleep cooldown finishes on the Timer screen!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, sleepingBotMsg]);
      }, 500);
      return;
    }

    setIsTyping(true);

    try {
      // Map previous message state to standard role format
      const formattedHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      // Append new user message
      formattedHistory.push({
        role: 'user',
        content: userText
      });

      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: formattedHistory,
          systemInstruction: "You are a university StudyBuddy assistant. Help the user with quiz questions, explanations, assignments, timelines, study scheduling, flashcards, and key terms in a calm, clear, and encouraging tone."
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI response');
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('[ChatbotScreen] Error calling AI service:', err.message);
      const errMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Oops, I am having trouble thinking right now. Please ensure the server is online and you are logged in.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]);

  const navItems = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'chatbot', icon: 'message-square', label: 'Buddy' },
    { id: 'timer', icon: 'clock', label: 'Timer' },
    { id: 'progress', icon: 'bar-chart-2', label: 'Progress' }
  ];

  return (
    <View style={tw`flex-grow flex-1 bg-[#F8FAFC]`}>
      {/* Glass Header */}
      <SafeAreaView style={tw`bg-white/80 backdrop-blur-md border-b border-slate-200/50`}>
        <View style={tw`flex-row items-center justify-between px-6 pt-3 pb-4`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity 
              onPress={onOpenMenu}
              style={tw`mr-3.5 w-9 h-9 bg-white border border-slate-200/60 rounded-full items-center justify-center shadow-xs`}
            >
              <Feather name="menu" size={16} color="#6366F1" />
            </TouchableOpacity>
            <Text style={tw`text-lg font-bold text-slate-900 tracking-tight`}>Study Buddy AI</Text>
          </View>
          {isSleepingCooldown ? (
            <View style={tw`bg-amber-50 border border-amber-200/60 px-3.5 py-1 rounded-full flex-row items-center shadow-xs`}>
              <View style={tw`w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5`} />
              <Text style={tw`text-[10px] font-bold text-amber-700 uppercase tracking-wider`}>Inactive 😴</Text>
            </View>
          ) : (
            <View style={tw`bg-emerald-50 border border-emerald-200/60 px-3.5 py-1 rounded-full flex-row items-center shadow-xs`}>
              <View style={tw`w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5`} />
              <Text style={tw`text-[10px] font-bold text-emerald-700 uppercase tracking-wider`}>Active</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Chat Container */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={tw`flex-1`}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Message Scroll View */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={tw`px-6 py-6 pb-48`}
          style={tw`flex-1`}
        >
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <View 
                key={msg.id}
                style={tw`flex-row mb-5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {/* Bot Icon */}
                {isBot && (
                  <View style={tw`w-8.5 h-8.5 bg-indigo-50 border border-indigo-100/60 rounded-full items-center justify-center mr-2.5 mt-0.5 shadow-xs`}>
                    <FontAwesome name="smile-o" size={16} color="#6366F1" />
                  </View>
                )}

                {/* Speech Bubble */}
                <View 
                  style={[
                    tw`max-w-[78%] rounded-[24px] px-4.5 py-3 shadow-xs`,
                    isBot 
                      ? tw`bg-white border border-slate-200/80 rounded-tl-xs shadow-slate-200/50` 
                      : [tw`rounded-tr-xs shadow-md`, { backgroundColor: '#4F46E5' }]
                  ]}
                >
                  <Text style={tw`text-sm font-medium leading-relaxed ${isBot ? 'text-slate-800' : 'text-white'}`}>
                    {renderMessageText(msg.text, isBot)}
                  </Text>
                  <Text style={tw`text-[9px] mt-1.5 text-right font-semibold ${isBot ? 'text-slate-400' : 'text-indigo-100'}`}>
                    {msg.time}
                  </Text>
                </View>

                {/* User Icon */}
                {!isBot && (
                  <View style={tw`w-8.5 h-8.5 bg-indigo-50 border border-indigo-100/60 rounded-full items-center justify-center ml-2.5 mt-0.5 shadow-xs`}>
                    <Feather name="user" size={14} color="#4F46E5" />
                  </View>
                )}
              </View>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={tw`flex-row mb-4 justify-start`}>
              <View style={tw`w-8.5 h-8.5 bg-indigo-50 border border-indigo-100/60 rounded-full items-center justify-center mr-2.5 mt-0.5 shadow-xs`}>
                <FontAwesome name="smile-o" size={16} color="#4F46E5" />
              </View>
              <View style={tw`bg-white border border-slate-200/80 rounded-[24px] rounded-tl-xs px-4.5 py-3 shadow-xs flex-row items-center`}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={tw`text-xs font-semibold text-slate-500 ml-2`}>Buddy is typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Floating Input Bar */}
        <View style={tw`px-6 py-3.5 bg-white/95 border-t border-slate-200/60 flex-row items-center mb-28`}>
          <TextInput
            placeholder="Type your study question here..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            style={[
              tw`flex-1 bg-slate-50 border border-slate-200/80 rounded-full px-5 py-2.5 text-slate-800 text-sm mr-3`,
              Platform.OS === 'web' ? { outlineStyle: 'none' } : {}
            ]}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[tw`w-10 h-10 rounded-full items-center justify-center shadow-md`, { backgroundColor: '#4F46E5' }]}
          >
            <Feather name="send" size={14} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Floating Glass Navigation Bar */}
      <View style={tw`absolute bottom-6 left-6 right-6 bg-white/90 border border-white/80 rounded-full py-2.5 px-6 flex-row justify-between items-center shadow-xl shadow-indigo-500/10 backdrop-blur-lg`}>
        {navItems.map((item) => {
          const isActive = item.id === 'chatbot';
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
                <Feather name={item.icon} size={18} color={isActive ? '#6366F1' : '#94A3B8'} />
              </View>
              <Text style={tw`text-[9px] mt-0.5 font-bold ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
