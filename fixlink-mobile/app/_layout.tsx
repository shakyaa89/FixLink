import { Stack } from "expo-router";
import "../global.css"
import NavBar from "@/components/Navbar";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const { checking, checkAuth, user, authInitialized } = useAuthStore();

  useEffect(() => {
    if (!authInitialized) {
      checkAuth();
    }
  }, [authInitialized, checkAuth])

  if (checking) {
    return (
      <View style={{ flex: 1 }}>
        <ActivityIndicator />
      </View>);
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      {user && user.role !== "admin" && <NavBar />}
      <Toast />
    </View>);
}
