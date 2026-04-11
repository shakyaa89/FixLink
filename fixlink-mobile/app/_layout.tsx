import { Stack } from "expo-router";
import "../global.css"
import NavBar from "@/components/Navbar";
import { useAuthStore } from "@/store/authStore";
import { JSX, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast, { BaseToast, ToastConfigParams } from "react-native-toast-message";
import { Text } from "@react-navigation/elements";
import { Check, X } from "lucide-react-native";

export default function RootLayout() {
  const { checking, checkAuth, user, authInitialized } = useAuthStore();

  const toastConfig: Record<string, (props: ToastConfigParams<any>) => JSX.Element> = {
    success: ({ text1 }) => (
      <View
        style={{
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: 12,
          paddingVertical: 8,
          paddingHorizontal: 16,
          maxWidth: '90%',
          borderWidth: 1,
          borderColor: '#12b981',
        }}
      >
        <Check size={26} color="#12b981" />

        {text1 && (
          <Text
            style={{
              marginLeft: 8,
              textAlign: 'center',
              color: '#12b981',
              fontSize: 16,
            }}
          >
            {text1}
          </Text>
        )}
      </View>
    ),

    error: ({ text1 }) => (
      <View
        style={{
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: 12,
          paddingVertical: 8,
          paddingHorizontal: 16,
          maxWidth: '90%',
          borderWidth: 1,
          borderColor: '#ef4444',
        }}
      >
        <X size={26} color="#ef4444" />

        {text1 && (
          <Text
            style={{
              marginLeft: 8,
              textAlign: 'center',
              color: '#ef4444',
              fontSize: 16,
            }}
          >
            {text1}
          </Text>
        )}
      </View>
    ),
  };

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
      <Toast config={toastConfig} />
    </View>);
}
