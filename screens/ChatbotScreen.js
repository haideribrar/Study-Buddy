import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function ChatbotScreen({ onNavigate, onOpenMenu }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi! I am your study buddy. What are we studying today?', time: '11:40 AM' },
    { id: 2, sender: 'user', text: 'I need to review physics equations for my midterm.', time: '11:41 AM' },
    { id: 3, sender: 'bot', text: 'Great choice! I can generate quiz questions, summarize main formulas, or explain concepts. What would you like to start with?', time: '11:41 AM' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollViewRef = useRef();

  const handleSend = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot reply
    setTimeout(() => {
      let botReplyText = "I can help you review that! Let me know if you want me to quiz you on this topic, explain key terms, or create a mock assignment plan.";
      
      const lowerText = inputText.toLowerCase();
      if (lowerText.includes('quiz') || lowerText.includes('question') || lowerText.includes('test')) {
        botReplyText = "Let's do a quick quiz! Here is your first question:\n\n*Question 1*: What is the formula for Force in Classical Mechanics?\n\nA) F = mv\nB) F = ma\nC) F = m/a\n\nReply with your answer!";
      } else if (lowerText.includes('assignment') || lowerText.includes('project') || lowerText.includes('homework')) {
        botReplyText = "Got it. Let's break down your assignment into milestones. \n\n1. Review assignment details & rubric (Day 1)\n2. Perform basic research & gather sources (Day 2)\n3. Outline the sections & draft introduction (Day 3)\n4. Complete the draft & review equations (Day 4)\n\nDoes this timeline work for you?";
      } else if (lowerText.includes('exam') || lowerText.includes('test') || lowerText.includes('midterm') || lowerText.includes('final')) {
        botReplyText = "Exams can be tough, but we will ace it! Let's outline a study schedule. Would you like me to highlight the most common questions for your specific subject?";
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
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
    <View style={tw`flex-grow flex-1 bg-[#FDF6EC]`}>
      {/* Header */}
      <SafeAreaView style={tw`bg-white`}>
        <View style={tw`flex-row items-center justify-between px-6 pt-3 pb-4 bg-white border-b border-[#F5EBE1]`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity 
              onPress={onOpenMenu}
              style={tw`mr-3.5 w-9 h-9 bg-white border border-[#F5EBE1] rounded-full items-center justify-center shadow-sm`}
            >
              <Feather name="menu" size={16} color="#FF7C5C" />
            </TouchableOpacity>
            <Text style={tw`text-lg font-bold text-slate-800 tracking-tight`}>Study Buddy</Text>
          </View>
          <View style={tw`bg-[#FF7C5C]/10 border border-[#FF7C5C]/20 px-3.5 py-1 rounded-full flex-row items-center`}>
            <View style={tw`w-1.5 h-1.5 bg-[#FF7C5C] rounded-full mr-1.5`} />
            <Text style={tw`text-[10px] font-bold text-[#FF7C5C] uppercase tracking-wider`}>Active</Text>
          </View>
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
          contentContainerStyle={tw`px-6 py-6`}
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
                  <View style={tw`w-8.5 h-8.5 bg-[#FF7C5C]/10 rounded-full items-center justify-center mr-2.5 mt-0.5 shadow-sm`}>
                    <FontAwesome name="smile-o" size={16} color="#FF7C5C" />
                  </View>
                )}

                {/* Speech Bubble */}
                <View 
                  style={tw`max-w-[75%] rounded-[24px] px-4.5 py-3 shadow-sm ${
                    isBot 
                      ? 'bg-white border border-[#F5EBE1] rounded-tl-sm' 
                      : 'bg-[#FF7C5C] rounded-tr-sm'
                  }`}
                >
                  <Text style={tw`text-sm font-semibold leading-relaxed ${isBot ? 'text-slate-700' : 'text-white'}`}>
                    {msg.text}
                  </Text>
                  <Text style={tw`text-[9px] mt-1.5 text-right font-medium ${isBot ? 'text-slate-400' : 'text-orange-100'}`}>
                    {msg.time}
                  </Text>
                </View>

                {/* User Icon */}
                {!isBot && (
                  <View style={tw`w-8.5 h-8.5 bg-indigo-50 border border-indigo-100 rounded-full items-center justify-center ml-2.5 mt-0.5 shadow-sm`}>
                    <Feather name="user" size={14} color="#858CE9" />
                  </View>
                )}
              </View>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={tw`flex-row mb-4 justify-start`}>
              <View style={tw`w-8.5 h-8.5 bg-[#FF7C5C]/10 rounded-full items-center justify-center mr-2.5 mt-0.5 shadow-sm`}>
                <FontAwesome name="smile-o" size={16} color="#FF7C5C" />
              </View>
              <View style={tw`bg-white border border-[#F5EBE1] rounded-[24px] rounded-tl-sm px-4.5 py-3 shadow-sm flex-row items-center`}>
                <ActivityIndicator size="small" color="#FF7C5C" />
                <Text style={tw`text-xs font-bold text-slate-400 ml-2`}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={tw`px-6 py-3.5 bg-white border-t border-[#F5EBE1] flex-row items-center shadow-sm`}>
          <TextInput
            placeholder="Type your study question here..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            style={tw`flex-1 bg-[#FDF6EC]/40 border border-[#F5EBE1] rounded-full px-5 py-2.5 text-slate-700 text-sm mr-3`}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={tw`w-10 h-10 bg-[#FF7C5C] rounded-full items-center justify-center shadow-sm`}
          >
            <Feather name="send" size={14} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Footer Tab Bar */}
      <View style={tw`bg-white border-t border-slate-100 pt-2.5 pb-7 px-6 flex-row justify-between items-center shadow-lg`}>
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
    </View>
  );
}
