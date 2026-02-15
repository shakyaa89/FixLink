import { Stack } from "expo-router";
import "../global.css"
import { SafeAreaView } from "react-native-safe-area-context";
import NavBar from "@/components/Navbar";

export default function RootLayout() {
  return (
  <SafeAreaView style={{flex : 1}}>
      <Stack screenOptions={{ headerShown: false }} />
      <NavBar />
  </SafeAreaView>);
}
