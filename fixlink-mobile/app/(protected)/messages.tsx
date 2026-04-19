import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ChevronRight,
  MessageCircleMore,
} from "lucide-react-native";
import colors from "@/app/_constants/theme";
import { useMessageStore } from "@/store/messageStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

// Lists recent chats and opens selected conversation.
export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    recentChats,
    contactsLoading,
    loadContacts,
  } = useMessageStore();

  const loggedInId = user?._id || user?.id;

  useEffect(() => {
    // Contacts are scoped to the currently authenticated user.
    if (!loggedInId) return;
    loadContacts();
  }, [loggedInId, loadContacts]);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 gap-6">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 border border-border rounded-xl items-center justify-center active:bg-secondary"
            >
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>
            <View className="gap-1">
              <Text className="text-2xl font-bold text-text">Messages</Text>
              <Text className="text-sm text-muted">Select a contact to chat</Text>
            </View>
          </View>

          {contactsLoading && (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color={colors.accent} />
              <Text className="text-sm text-muted mt-3">Loading contacts...</Text>
            </View>
          )}

          {!contactsLoading && recentChats.length === 0 && (
            <View className="bg-secondary border border-border rounded-2xl p-8 items-center gap-3">
              <View className="w-14 h-14 rounded-2xl bg-border items-center justify-center">
                <MessageCircleMore size={28} color={colors.muted} />
              </View>
              <Text className="text-base font-semibold text-text">No contacts yet</Text>
              <Text className="text-sm text-muted text-center">
                Your contacts appear here when you have an in-progress job.
              </Text>
            </View>
          )}

          {!contactsLoading && recentChats.length > 0 && (
            <View className="gap-3">
              {recentChats.map((chat) => (
                <Pressable
                  key={chat._id}
                  onPress={() =>
                    router.push({
                      pathname: "/message-chat",
                      params: {
                        contactId: chat._id,
                        fullName: chat.fullName,
                        profilePicture: chat.profilePicture || "",
                        jobTitle: chat.jobTitle || "",
                        jobId: chat.jobId || "",
                      },
                    })
                  }
                  className="bg-secondary border border-border rounded-2xl p-4"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 rounded-full bg-border items-center justify-center">
                      <MessageCircleMore size={22} color={colors.muted} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-text" numberOfLines={1}>
                        {chat.fullName}
                      </Text>
                      <Text className="text-xs text-muted" numberOfLines={1}>
                        {chat.jobTitle ? `Job: ${chat.jobTitle}` : chat.jobId || "Conversation"}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.muted} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <View className="pt-2">
            <Pressable
              onPress={() => loadContacts()}
              className="border border-border rounded-xl py-3 items-center"
            >
              <Text className="text-sm font-semibold text-text">Refresh Contacts</Text>
            </Pressable>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}