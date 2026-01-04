import { BlurView } from 'expo-blur';
import { Cpu, MessageCircle, Send, ShieldCheck, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function SupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm your OrbitPay assistant. How can I help you today?" },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Window dimensions
    const WINDOW_WIDTH = 350;
    const MARGIN = 24; // right-6

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const contextX = useSharedValue(0);
    const contextY = useSharedValue(0);

    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    const pan = Gesture.Pan()
        .onStart(() => {
            contextX.value = translateX.value;
            contextY.value = translateY.value;
        })
        .onUpdate((event) => {
            translateX.value = contextX.value + event.translationX;
            translateY.value = contextY.value + event.translationY;
        });

    // Derived value to clamp the window's X position
    const windowTranslateX = useDerivedValue(() => {
        const BUTTON_SIZE = 56; // w-14

        // Initial positions (based on right-6 = 24px)
        const initialButtonLeft = SCREEN_WIDTH - MARGIN - BUTTON_SIZE;
        const initialWindowLeft = SCREEN_WIDTH - MARGIN - WINDOW_WIDTH;

        // Where is the button now?
        const currentButtonLeft = initialButtonLeft + translateX.value;

        // Where should the window be to be centered on the button?
        const idealWindowLeft = currentButtonLeft + (BUTTON_SIZE / 2) - (WINDOW_WIDTH / 2);

        // Clamp to screen bounds (left margin 24, right margin 24)
        const minWindowLeft = MARGIN;
        const maxWindowLeft = SCREEN_WIDTH - MARGIN - WINDOW_WIDTH;

        const clampedWindowLeft = Math.min(Math.max(idealWindowLeft, minWindowLeft), maxWindowLeft);

        // Calculate needed translation relative to initial window position
        return clampedWindowLeft - initialWindowLeft;
    });

    useEffect(() => {
        if (isOpen) {
            scale.value = withSpring(1);
            opacity.value = withTiming(1);
        } else {
            scale.value = withTiming(0);
            opacity.value = withTiming(0);
        }
    }, [isOpen]);

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, loading, isOpen]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    const fabStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    const windowStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: windowTranslateX.value },
                { translateY: translateY.value },
                { scale: scale.value }
            ],
            opacity: opacity.value,
        };
    });

    async function sendMessage() {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.content }),
            });

            const data = await res.json();
            setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Sorry, I couldn't understand that." }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <GestureDetector gesture={pan}>
                <Animated.View
                    className="absolute bottom-6 right-6 z-50"
                    style={fabStyle}
                >
                    <TouchableOpacity
                        onPress={() => setIsOpen(!isOpen)}
                        className="h-14 w-14 items-center justify-center rounded-full bg-[#1855F3] shadow-lg shadow-black/30"
                        activeOpacity={0.8}
                    >
                        {isOpen ? (
                            <X color="white" size={24} />
                        ) : (
                            <MessageCircle color="white" size={24} />
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>

            {isOpen && (
                <Animated.View
                    style={[windowStyle]}
                    className="absolute bottom-24 right-6 z-40 w-[350px] max-w-[90%] overflow-hidden rounded-[24px] border border-white/10 shadow-2xl shadow-black/80"
                >
                    <BlurView
                        intensity={40}
                        tint="dark"
                        style={StyleSheet.absoluteFill}
                        className="bg-black/60"
                    />
                    {/* Header */}
                    <View className="relative flex-row items-center justify-between border-b border-white/5 px-5 py-4 bg-white/[0.02]">
                        <View className="flex-row items-center gap-3">
                            <View className="h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#1855F3] to-[#4c7ef5]">
                                <Cpu color="white" size={18} />
                            </View>
                            <View>
                                <Text className="text-[17px] font-bold text-white tracking-tight">OrbitPay AI</Text>
                                <View className="flex-row items-center gap-1.5">
                                    <View className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                    <Text className="text-[10px] font-medium text-emerald-500 uppercase tracking-widest">Online</Text>
                                </View>
                            </View>
                        </View>
                        {/* Use opacity to make a ghost close button if needed, but we have the FAB logic */}
                    </View>

                    {/* Content */}
                    <View className="flex h-96 flex-col">
                        <ScrollView
                            ref={scrollViewRef}
                            className="flex-1 px-4 pt-4"
                            contentContainerStyle={{ paddingBottom: 16 }}
                            showsVerticalScrollIndicator={false}
                        >
                            <View className="flex gap-4">
                                {messages.map((m, i) => (
                                    <View
                                        key={i}
                                        className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${m.role === "user"
                                            ? "self-end rounded-br-sm bg-[#1855F3] shadow-blue-900/20"
                                            : "self-start rounded-bl-sm bg-white/10"
                                            }`}
                                    >
                                        <Text
                                            className={`${m.role === "user" ? "text-white" : "text-gray-100"} text-[15px] leading-[22px]`}
                                        >
                                            {m.content}
                                        </Text>
                                    </View>
                                ))}
                                {loading && (
                                    <View className="self-start rounded-2xl rounded-bl-sm bg-white/5 px-5 py-3.5">
                                        <View className="flex-row items-center gap-2.5">
                                            <ActivityIndicator size="small" color="#94a3b8" />
                                            <Text className="text-xs font-medium text-gray-400">Thinking...</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View className="px-4 pb-4 pt-2">
                            {/* Input Area */}
                            <View className="flex-row items-center gap-2 rounded-[20px] bg-white/5 border border-white/5 p-1.5 pl-4 focus-within:border-[#1855F3]/40 focus-within:bg-white/[0.07] transition-all">
                                <TextInput
                                    value={input}
                                    onChangeText={setInput}
                                    placeholder="Type your message..."
                                    placeholderTextColor="#6b7280"
                                    className="flex-1 text-[15px] text-white h-10"
                                    onSubmitEditing={sendMessage}
                                    selectionColor="#1855F3"
                                />
                                <TouchableOpacity
                                    onPress={sendMessage}
                                    disabled={loading || !input.trim()}
                                    className={`h-10 w-10 items-center justify-center rounded-full ${loading || !input.trim()
                                        ? "bg-white/5 opacity-50"
                                        : "bg-[#1855F3] shadow-lg shadow-blue-500/20"
                                        }`}
                                >
                                    <Send size={18} color={loading || !input.trim() ? "#6b7280" : "white"} strokeWidth={2.5} />
                                </TouchableOpacity>
                            </View>

                            <View className="mt-3 flex-row justify-center items-center gap-1.5 opacity-60">
                                <ShieldCheck size={10} color="#6b7280" />
                                <Text className="text-[9px] text-gray-600 font-medium tracking-wide">SECURE ENCRYPTED CHAT</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}
        </>
    );
}
