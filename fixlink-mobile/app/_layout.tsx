import { Stack } from "expo-router";
import "../global.css"
import { SafeAreaView } from "react-native-safe-area-context";
import NavBar from "@/components/Navbar";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const { checking, checkAuth, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [])

  if (checking) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ActivityIndicator />
      </SafeAreaView>);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      {user && <NavBar />}
      <Toast />
    </SafeAreaView>);
}
