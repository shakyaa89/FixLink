import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import colors from "@/app/_constants/theme";
import { AiApi, type AiChatMessage } from "@/api/Apis";
import { useAuthStore } from "@/store/authStore";
import Toast from "react-native-toast-message";
import { AxiosError } from "axios";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AiChatScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! How can I help you today?",
    },
  ]);

  const category = useMemo(
    () => (user?.providerCategory ? String(user.providerCategory) : ""),
    [user],
  );

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const scrollToBottom = (animated = true) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  };

  useEffect(() => {
    scrollToBottom(messages.length > 1);
  }, [messages.length, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history: AiChatMessage[] = nextMessages.map((message) => ({
        role: message.role,
        content: message.content,
      }));

      const response = await AiApi.chat({
        message: trimmed,
        history,
        category,
      });

      const reply =
        response?.data?.reply ||
        "I could not generate a response right now. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1:
          error instanceof AxiosError
            ? error.response?.data?.message ||
              "Could not reach AI service. Please try again."
            : "Could not reach AI service. Please try again.",
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I could not reach the AI service right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <View className="px-6 py-4 border-b border-border bg-primary flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 border border-border rounded-xl items-center justify-center active:bg-secondary"
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-base font-semibold text-text" numberOfLines={1}>
              AI Chat
            </Text>
            <Text className="text-xs text-muted" numberOfLines={1}>
              Ask about FixLink services
            </Text>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6 pt-4 bg-secondary"
          contentContainerStyle={{ paddingBottom: 16, gap: 8 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollToBottom(messages.length > 1)}
        >
          {messages.map((message, index) => (
            <View
              key={`${message.role}-${index}`}
              className={`w-full flex-row ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <View
                className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                  message.role === "assistant"
                    ? "bg-primary border border-border rounded-bl-md"
                    : "bg-accent rounded-br-md"
                }`}
              >
                <Text className={`text-sm ${message.role === "assistant" ? "text-text" : "text-white"}`}>
                  {message.content}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View className="w-full flex-row justify-start">
              <View className="max-w-[80%] px-3 py-2 rounded-2xl bg-primary border border-border rounded-bl-md flex-row items-center gap-2">
                <ActivityIndicator size="small" color={colors.accent} />
                <Text className="text-sm text-text">Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View
          className="px-6 py-4 border-t border-border bg-primary flex-row items-center gap-2"
          style={Platform.OS === "android" ? { marginBottom: keyboardHeight > 0 ? 8 : 0 } : undefined}
        >
          <TextInput
            className="flex-1 border border-border rounded-xl px-4 py-3 text-text bg-secondary"
            placeholder="Type a message"
            placeholderTextColor={colors.muted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            editable={!loading}
            returnKeyType="send"
          />
          <Pressable
            onPress={sendMessage}
            disabled={loading || !input.trim()}
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              loading || !input.trim() ? "bg-border" : "bg-accent"
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Send size={18} color={colors.primary} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
