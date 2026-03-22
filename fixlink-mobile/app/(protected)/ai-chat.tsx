import { useEffect, useMemo, useState } from "react";
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
import { ArrowLeft } from "lucide-react-native";
import colors from "@/app/_constants/theme";
import { AiApi, type AiChatMessage } from "@/api/Apis";
import { useAuthStore } from "@/store/authStore";
import Toast from "react-native-toast-message";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AiChatScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
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
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1:
          error?.response?.data?.message ||
          "Could not reach AI service. Please try again.",
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
        <View className="flex-1 px-6 py-6 gap-4">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 border border-border rounded-xl items-center justify-center active:bg-secondary"
            >
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>
            <View className="gap-1">
              <Text className="text-2xl font-bold text-text">AI Chat</Text>
              <Text className="text-sm text-muted">Ask about FixLink services</Text>
            </View>
          </View>

          <View className="flex-1 border border-border bg-secondary rounded-2xl overflow-hidden">
            <ScrollView
              className="flex-1 px-4 py-4"
              contentContainerStyle={{ gap: 10 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((message, index) => (
                <View
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "assistant"
                      ? "self-start max-w-[85%] bg-primary border border-border rounded-xl px-3 py-2"
                      : "self-end max-w-[85%] bg-accent rounded-xl px-3 py-2"
                  }
                >
                  <Text
                    className={
                      message.role === "assistant" ? "text-text text-sm" : "text-white text-sm"
                    }
                  >
                    {message.content}
                  </Text>
                </View>
              ))}

              {loading && (
                <View className="self-start max-w-[85%] bg-primary border border-border rounded-xl px-3 py-2 flex-row items-center gap-2">
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text className="text-sm text-text">Thinking...</Text>
                </View>
              )}
            </ScrollView>

            <View
              className="border-t border-border p-3 bg-primary flex-row items-center gap-2"
              style={Platform.OS === "android" ? { marginBottom: keyboardHeight > 0 ? 8 : 0 } : undefined}
            >
              <TextInput
                className="flex-1 text-base text-text border border-border rounded-xl px-3 py-2.5 bg-secondary"
                placeholder="Type a message..."
                placeholderTextColor={colors.muted}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={sendMessage}
                editable={!loading}
                returnKeyType="send"
              />
              <Pressable
                onPress={sendMessage}
                disabled={loading}
                className="bg-accent rounded-xl px-4 py-2.5 active:opacity-90 disabled:opacity-60"
              >
                <Text className="text-white font-semibold text-sm">Send</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
