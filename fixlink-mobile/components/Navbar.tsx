import { View, Text, Pressable } from "react-native";
import { Home, MessageSquare, Menu, BriefcaseBusiness, LogOut } from "lucide-react-native";
import colors from "../app/_constants/theme";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import Toast from "react-native-toast-message";


export default function NavBar() {
    const router = useRouter();
    const {logout} = useAuthStore();

    function HandleLogout(){
        logout();
        Toast.show({
            type: 'success',
            text2: "Logged out successfully!"
        })
        router.push("/");
    }

    return (
        <View className="bg-primary border border-t border-border">
            <View className="flex-row items-center justify-around px-4 py-2">
                <Pressable
                    className="flex-1 items-center gap-1 py-2 active:opacity-70"
                    onPress={() => router.push("/users/ViewJobs")}
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
                    onPress={() => router.push("/")}
                >
                    <View className={`p-2 rounded-xl`}>
                        <MessageSquare
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
                >
                    <View className={`p-2 rounded-xl`}>
                        <Menu
                            size={24}
                            color={colors.muted}
                            strokeWidth={2}
                        />
                    </View>
                    <Text
                        className={`text-xs font-medium `}
                    >
                        Menu
                    </Text>
                </Pressable>
                <Pressable
                    className="flex-1 items-center gap-1 py-2 active:opacity-70"
                    onPress={HandleLogout}
                >
                    <View className={`p-2 rounded-xl`}>
                        <LogOut
                            size={24}
                            color={colors.muted}
                            strokeWidth={2}
                        />
                    </View>
                    <Text
                        className={`text-xs font-medium `}
                    >
                        Logout
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}