import UserRegister from "@/components/registration/UserRegister";
import ServiceProviderRegistration from "@/components/registration/ServiceProviderRegistration";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import colors from "@/app/_constants/theme";

export default function RegisterScreen() {
  const [userRole, setUserRole] = useState<"user" | "serviceProvider">("user");

  return (
    <View className="flex-1 bg-primary">
      <View className="px-6 pt-6 pb-2">
        <View className="flex-row bg-secondary rounded-xl border border-border p-1">
          <Pressable
            className={`flex-1 py-3 rounded-lg items-center ${userRole === "user" ? "bg-accent" : "bg-transparent"}`}
            onPress={() => setUserRole("user")}
          >
            <Text
              style={{ color: userRole === "user" ? "#fff" : colors.text }}
              className="font-semibold"
            >
              User
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-3 rounded-lg items-center ${userRole === "serviceProvider" ? "bg-accent" : "bg-transparent"}`}
            onPress={() => setUserRole("serviceProvider")}
          >
            <Text
              style={{ color: userRole === "serviceProvider" ? "#fff" : colors.text }}
              className="font-semibold"
            >
              Service Provider
            </Text>
          </Pressable>
        </View>
      </View>

      {userRole === "user" && <UserRegister />}
      {userRole === "serviceProvider" && <ServiceProviderRegistration />}
    </View>
  );
}
