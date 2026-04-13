import { View, Text, Pressable } from "react-native";
import { Home, User, BriefcaseBusiness, MessageCircle, Bot } from "lucide-react-native";
import colors from "../app/_constants/theme";
import { usePathname, useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { isServiceProviderProfileComplete } from "@/utils/serviceProviderProfile";


export default function NavBar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuthStore();

    const navigateIfNeeded = (target: string, aliases: string[] = []) => {
        const currentPath = pathname || "";
        const candidates = [target, ...aliases];

        if (candidates.includes(currentPath)) {
            return;
        }

        router.push(target as never);
    };

    function goToDashboard() {
        if (user?.role === "user") {
            navigateIfNeeded("/user/dashboard", ["/(protected)/user/dashboard"]);
            return;
        }

        if (user?.role === "serviceProvider") {
            const isProviderComplete = isServiceProviderProfileComplete(user);
            navigateIfNeeded(
                isProviderComplete && user.verificationStatus !== "rejected"
                    ? "/service-provider/dashboard"
                    : "/service-provider/complete-profile",
                ["/(protected)/service-provider/dashboard", "/(protected)/service-provider/complete-profile"]
            );
            return;
        }

        if (user?.role === "admin") {
            navigateIfNeeded("/admin-mobile", ["/(protected)/admin-mobile"]);
            return;
        }

        navigateIfNeeded("/jobs", ["/(protected)/jobs"]);
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
                    onPress={() => navigateIfNeeded("/jobs", ["/(protected)/jobs"])}
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
                    onPress={() => navigateIfNeeded("/ai-chat", ["/(protected)/ai-chat"])}
                >
                    <View className={`p-2 rounded-xl`}>
                        <Bot
                            size={24}
                            color={colors.muted}
                            strokeWidth={2}
                        />
                    </View>
                    <Text
                        className={`text-xs font-medium `}
                    >
                        AI Chat
                    </Text>
                </Pressable>
                <Pressable
                    className="flex-1 items-center gap-1 py-2 active:opacity-70"
                    onPress={() => navigateIfNeeded("/messages", ["/(protected)/messages"])}
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
                    onPress={() => navigateIfNeeded("/profile", ["/(protected)/profile"])}
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