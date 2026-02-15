import { useRouter } from "expo-router";
import { Pressable, Text, TextInput, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "./_constants/theme";
import { useState } from "react";
import { Home, Mail, Lock, Eye, EyeOff, ArrowLeft, User, Phone } from "lucide-react-native";

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<"user" | "provider">("user");

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 py-8 gap-8">
          {/* Header */}
          <View className="gap-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 border border-border rounded-xl items-center justify-center active:bg-secondary"
            >
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>

            <View className="gap-2">
              <Text className="text-4xl font-bold text-text">Create account</Text>
              <Text className="text-base text-muted leading-relaxed">
                Set up your FixLink profile in minutes.
              </Text>
            </View>
          </View>

          {/* Account Type Selection */}
          <View className="gap-3">
            <Text className="text-sm font-medium text-text">I am a</Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setAccountType("user")}
                className={`flex-1 border rounded-xl p-4 ${accountType === "user"
                  ? "bg-accent border-accent"
                  : "bg-secondary border-border"
                  }`}
              >
                <Text className={`text-base font-semibold ${accountType === "user" ? "text-white" : "text-text"
                  }`}>
                  User
                </Text>
                <Text className={`text-sm mt-1 ${accountType === "user" ? "text-white/80" : "text-muted"
                  }`}>
                  Find service providers
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setAccountType("provider")}
                className={`flex-1 border rounded-xl p-4 ${accountType === "provider"
                  ? "bg-accent border-accent"
                  : "bg-secondary border-border"
                  }`}
              >
                <Text className={`text-base font-semibold ${accountType === "provider" ? "text-white" : "text-text"
                  }`}>
                  Pro
                </Text>
                <Text className={`text-sm mt-1 ${accountType === "provider" ? "text-white/80" : "text-muted"
                  }`}>
                  Offer my services
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Form */}
          <View className="gap-5">
            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Full name</Text>
              <View className="border border-border rounded-xl px-4 py-3 flex-row items-center gap-3 bg-secondary">
                <User size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-text text-base"
                  placeholder="Jane Doe"
                  placeholderTextColor={colors.muted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Email</Text>
              <View className="border border-border rounded-xl px-4 py-3 flex-row items-center gap-3 bg-secondary">
                <Mail size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-text text-base"
                  placeholder="you@example.com"
                  placeholderTextColor={colors.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Phone number</Text>
              <View className="border border-border rounded-xl px-4 py-3 flex-row items-center gap-3 bg-secondary">
                <Phone size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-text text-base"
                  placeholder="(555) 123-4567"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Password</Text>
              <View className="border border-border rounded-xl px-4 py-3 flex-row items-center gap-3 bg-secondary">
                <Lock size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-text text-base"
                  placeholder="Create a password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={colors.muted} />
                  ) : (
                    <Eye size={20} color={colors.muted} />
                  )}
                </Pressable>
              </View>
              <Text className="text-xs text-muted">
                At least 8 characters with a mix of letters and numbers
              </Text>
            </View>
          </View>

          {/* Terms */}
          <View className="bg-secondary border border-border rounded-xl p-4">
            <Text className="text-sm text-muted leading-relaxed">
              By creating an account, you agree to our{" "}
              <Text className="text-accent font-medium">Terms of Service</Text> and{" "}
              <Text className="text-accent font-medium">Privacy Policy</Text>
            </Text>
          </View>

          {/* CTA */}
          <View className="gap-4">
            <Pressable
              className="bg-accent rounded-xl py-4 items-center active:opacity-90"
              onPress={() => router.push("/")}
            >
              <Text className="text-white text-base font-bold">Create Account</Text>
            </Pressable>

            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-sm text-muted">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            <Pressable
              className="border border-border rounded-xl py-4 items-center bg-secondary active:bg-border/20"
              onPress={() => { }}
            >
              <Text className="text-text text-base font-semibold">Continue with Google</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View className="items-center pt-4 pb-6">
            <Pressable
              onPress={() => router.push("/login")}
            >
              <Text className="text-base text-muted">
                Already have an account?{" "}
                <Text className="text-accent font-semibold">Log in</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}