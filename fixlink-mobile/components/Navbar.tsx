import { View, Text, Pressable } from "react-native";
import { Home, User, BriefcaseBusiness, MessageCircle } from "lucide-react-native";
import colors from "../app/_constants/theme";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";


export default function NavBar() {
    const router = useRouter();
    const { user } = useAuthStore();

    function goToDashboard() {
        if (user?.role === "user") {
            router.push("/user/dashboard");
            return;
        }

        if (user?.role === "serviceProvider") {
            router.push("/service-provider/dashboard");
            return;
        }

        if (user?.role === "admin") {
            router.push("/admin-mobile");
            return;
        }

        router.push("/jobs");
    }

    return (
        <View className="bg-primary border border-t border-border">
            <View className="flex-row items-center justify-around px-4 py-4">
                <Pressable
                    className="flex-1 items-center gap-1 py-2 active:opacity-70"
                    onPress={goToDashboard}
                >
                    <View className={`p-2 rounded-xl`}>
                        <Home
                            size={24}
                            color={colors.muted}
                            strokeWidth={2}
                        />
                    </View>
                    <Text
                        className={`text-xs font-medium `}
                    >
                        Home
                    </Text>
                </Pressable>
                <Pressable
                    className="flex-1 items-center gap-1 py-2 active:opacity-70"
                    onPress={() => router.push("/jobs")}
                >
                    <View className={`p-2 rounded-xl`}>
                        <BriefcaseBusiness
                            size={24}
                            color={colors.muted}
                            strokeWidth={2}
                        />
                    </View>
                    <Text
                        className={`text-xs font-medium `}
                    >
                        Jobs
                    </Text>
                </Pressable>
                <Pressable
                    className="flex-1 items-center gap-1 py-2 active:opacity-70"
                    onPress={() => router.push("/(protected)/messages")}
                >
                    <View className={`p-2 rounded-xl`}>
                        <MessageCircle
                            size={24}
                            color={colors.muted}
                            strokeWidth={2}
                        />
                    </View>
                    <Text
                        className={`text-xs font-medium `}
                    >
                        Messages
                    </Text>
                </Pressable>
                <Pressable
                    className="flex-1 items-center gap-1 py-2 active:opacity-70"
                    onPress={() => router.push("/profile")}
                >
                    <View className={`p-2 rounded-xl`}>
                        <User
                            size={24}
                            color={colors.muted}
                            strokeWidth={2}
                        />
                    </View>
                    <Text
                        className={`text-xs font-medium `}
                    >
                        Profile
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}