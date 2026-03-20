import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Monitor, LogOut } from "lucide-react-native";
import colors from "@/app/_constants/theme";
import { useAuthStore } from "@/store/authStore";

export default function AdminMobileRestrictionScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 px-6 py-6 justify-center">
        <View className="bg-secondary border border-border rounded-2xl p-6 items-center">
          <View className="w-14 h-14 rounded-2xl bg-accent/10 items-center justify-center mb-4">
            <Monitor size={28} color={colors.accent} />
          </View>

          <Text className="text-xl font-bold text-text text-center">Mobile Access Restricted</Text>
          <Text className="text-sm text-muted text-center mt-2 leading-6">
            Please login from web. Admin access is available on the web app only.
          </Text>

          <Pressable
            className="mt-6 bg-danger rounded-xl px-5 py-3.5 flex-row items-center gap-2"
            onPress={async () => {
              await logout();
              router.replace("/");
            }}
          >
            <LogOut size={18} color="white" />
            <Text className="text-white font-semibold">Logout</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
