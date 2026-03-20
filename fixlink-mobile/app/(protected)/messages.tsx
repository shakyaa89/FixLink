import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MessageCircleMore } from "lucide-react-native";
import colors from "@/app/_constants/theme";

export default function MessagesScreen() {
  const router = useRouter();

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
              <Text className="text-sm text-muted">Your conversations</Text>
            </View>
          </View>

          <View className="bg-secondary border border-border rounded-2xl p-8 items-center gap-3">
            <View className="w-14 h-14 rounded-2xl bg-border items-center justify-center">
              <MessageCircleMore size={28} color={colors.muted} />
            </View>
            <Text className="text-base font-semibold text-text">No messages yet</Text>
            <Text className="text-sm text-muted text-center">
              Your chats will appear here once you start a conversation.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}