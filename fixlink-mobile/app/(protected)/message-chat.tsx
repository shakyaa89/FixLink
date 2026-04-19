import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
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
import { ArrowLeft, Send, UserCircle2 } from "lucide-react-native";
import colors from "@/app/_constants/theme";
import { useMessageStore } from "@/store/messageStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useMemo, useRef, useState } from "react";

// Shows one chat thread and handles realtime messaging.
export default function MessageChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{
    contactId?: string;
    fullName?: string;
    profilePicture?: string;
    jobTitle?: string;
    jobId?: string;
  }>();

  const { user } = useAuthStore();
  const {
    activeChatUser,
    messages,
    loading,
    sending,
    openChat,
    sendMessage,
    connectSocket,
    disconnectSocket,
  } = useMessageStore();

  const [message, setMessage] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const loggedInId = user?._id || user?.id;
  const contactId = params.contactId ? String(params.contactId) : "";

  const contactName = params.fullName ? String(params.fullName) : "Unknown user";
  const contactPicture = params.profilePicture ? String(params.profilePicture) : "";
  const contactJobTitle = params.jobTitle ? String(params.jobTitle) : "";
  const contactJobId = params.jobId ? String(params.jobId) : "";

  const isOwnMessage = useMemo(() => {
    const authId = user?._id || user?.id;
    return (senderId: string) => {
      if (!authId) return false;
      return senderId === authId;
    };
  }, [user]);

  // Sends one message and clears input box.
  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message.trim());
    setMessage("");
  };

  useEffect(() => {
    // Active chat context from route params.
    if (!contactId) return;

    openChat({
      _id: contactId,
      fullName: contactName,
      profilePicture: contactPicture,
      jobTitle: contactJobTitle,
      jobId: contactJobId,
    });
  }, [contactId, contactName, contactPicture, contactJobTitle, contactJobId, openChat]);

  useEffect(() => {
    // Keep realtime socket active.
    if (!loggedInId) return;
    connectSocket(String(loggedInId));

    return () => {
      disconnectSocket();
    };
  }, [loggedInId, connectSocket, disconnectSocket]);

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
    // Keeps newest message visible.
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  };

  useEffect(() => {
    if (loading) return;
    scrollToBottom(messages.length > 0);
  }, [messages.length, loading]);

  if (!contactId) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 items-center justify-center px-6 gap-3">
          <Text className="text-base font-semibold text-text">No contact selected</Text>
          <Pressable
            onPress={() => router.replace("/messages")}
            className="bg-accent rounded-xl px-5 py-3"
          >
            <Text className="text-white font-semibold">Go to Contacts</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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

          {activeChatUser?.profilePicture ? (
            <Image
              source={{ uri: activeChatUser.profilePicture }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-border items-center justify-center">
              <UserCircle2 size={22} color={colors.muted} />
            </View>
          )}

          <View className="flex-1">
            <Text className="text-base font-semibold text-text" numberOfLines={1}>
              {activeChatUser?.fullName || contactName}
            </Text>
            <Text className="text-xs text-muted" numberOfLines={1}>
              {activeChatUser?.jobTitle || contactJobTitle || activeChatUser?.jobId || contactJobId || "Conversation"}
            </Text>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6 pt-4 bg-secondary"
          contentContainerStyle={{ paddingBottom: 16, gap: 8 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (!loading) {
              scrollToBottom(messages.length > 0);
            }
          }}
        >
          {loading && (
            <View className="py-12 items-center">
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          )}

          {!loading && messages.length === 0 && (
            <Text className="text-center text-sm text-muted py-8">
              No messages yet. Say hello!
            </Text>
          )}

          {!loading &&
            messages.map((msg) => (
              <View
                key={msg._id}
                className={`w-full flex-row ${
                  isOwnMessage(msg.senderId) ? "justify-end" : "justify-start"
                }`}
              >
                <View
                  className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                    isOwnMessage(msg.senderId)
                      ? "bg-accent rounded-br-md"
                      : "bg-primary border border-border rounded-bl-md"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isOwnMessage(msg.senderId) ? "text-white" : "text-text"
                    }`}
                  >
                    {msg.content}
                  </Text>
                </View>
              </View>
            ))}
        </ScrollView>

        <View
          className="px-6 py-4 border-t border-border bg-primary flex-row items-center gap-2"
          style={Platform.OS === "android" ? { marginBottom: keyboardHeight > 0 ? 8 : 0 } : undefined}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
            placeholderTextColor={colors.muted}
            className="flex-1 border border-border rounded-xl px-4 py-3 text-text bg-secondary"
            editable={!sending}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable
            onPress={handleSend}
            disabled={sending || !message.trim()}
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              sending || !message.trim() ? "bg-border" : "bg-accent"
            }`}
          >
            {sending ? (
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
