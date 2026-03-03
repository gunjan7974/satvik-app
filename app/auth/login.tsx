import React, { useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../data/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert("Error", "Please fill all fields");
    return;
  }

  setIsLoading(true);

  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/login`,
      {
        email: email.trim(),
        password: password.trim(),
      }
    );

    const userData = response.data;

    console.log("Login Success:", userData);

    // 🔐 Save token
    await AsyncStorage.setItem("token", userData.token);

    // 💾 Save full user data
    await AsyncStorage.setItem("userInfo", JSON.stringify(userData));

    // 🧠 Update Auth Context
    await login(userData);

    // 🚀 Redirect to Home
    router.replace("/");

  } catch (error) {
    console.log("Login Error:", error.response?.data);

    Alert.alert(
      "Login Failed",
      error.response?.data?.message || "Invalid email or password"
    );
  } finally {
    setIsLoading(false);
  }
};


  const handleGuestLogin = () => {
    Alert.alert(
      "Continue as Guest",
      "You can browse the menu, but ordering requires login",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Continue", 
          onPress: () => router.replace("/")
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <Animated.View 
            entering={FadeIn.duration(600)}
            style={styles.header}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FF8A00" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              
              <Text style={styles.appName}>Sattvik Kaleva</Text>
            </View>
          </Animated.View>

          {/* Main Content */}
          <View style={styles.content}>
            <Animated.View 
              entering={FadeInDown.delay(200).duration(600)}
              style={styles.formContainer}
            >
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.subTitle}>Sign in to continue your food journey</Text>

            {/* Email Input */}
<Animated.View 
  entering={FadeInDown.delay(300).duration(600)}
  style={styles.inputContainer}
>
  <View style={styles.inputIcon}>
    <Ionicons name="mail-outline" size={20} color="#999" />
  </View>
  <TextInput
    style={styles.input}
    placeholder="Email"
    placeholderTextColor="#999"
    keyboardType="email-address"
    autoCapitalize="none"
    value={email}
    onChangeText={setEmail}
  />
</Animated.View>


              {/* Password Input */}
              <Animated.View 
                entering={FadeInDown.delay(400).duration(600)}
                style={styles.inputContainer}
              >
                <View style={styles.inputIcon}>
                  <Ionicons name="lock-closed-outline" size={20} color="#999" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <Animated.View 
                entering={FadeInDown.delay(500).duration(600)}
                style={styles.buttonContainer}
              >
                <TouchableOpacity 
                  style={[
                    styles.loginButton,
                    isLoading && styles.loginButtonDisabled
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loginButtonText}>Logging in...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Login</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <Animated.View 
                entering={FadeInDown.delay(600).duration(600)}
                style={styles.dividerContainer}
              >
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </Animated.View>

              {/* Alternative Options */}
              <Animated.View 
                entering={FadeInDown.delay(700).duration(600)}
                style={styles.alternativeContainer}
              >
                <TouchableOpacity 
                  style={styles.googleButton}
                  onPress={() => Alert.alert("Coming Soon", "Google login feature coming soon!")}
                >
                  <Image
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png" }}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.guestButton}
                  onPress={handleGuestLogin}
                >
                  <Ionicons name="person-outline" size={20} color="#FF8A00" />
                  <Text style={styles.guestButtonText}>Continue as Guest</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Sign Up Link */}
              <Animated.View 
                entering={FadeInDown.delay(800).duration(600)}
                style={styles.signupContainer}
              >
                <Text style={styles.signupText}>New to Sattvik Kaleva? </Text>
                <TouchableOpacity onPress={() => router.push("/auth/registration")}>
                  <Text style={styles.signupLink}>Create Account</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Terms */}
              <Text style={styles.termsText}>
                By continuing, you agree to our Terms & Conditions
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF8A0010",
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: "#FF8A00",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.05,
  },
  formContainer: {
    marginTop: height * 0.02,
  },
  welcomeText: {
    fontSize: isSmallDevice ? 32 : 40,
    fontWeight: '800',
    color: "#1A1A1A",
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#666666",
    textAlign: 'center',
    marginBottom: height * 0.05,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    height: isSmallDevice ? 56 : 60,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: isSmallDevice ? 15 : 16,
    color: "#1A1A1A",
    padding: 0,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#FF8A00",
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#FF8A00",
    borderRadius: 16,
    paddingVertical: isSmallDevice ? 16 : 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: "#FF8A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E9ECEF",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#999999",
    fontWeight: '600',
  },
  alternativeContainer: {
    gap: 12,
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: isSmallDevice ? 14 : 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    gap: 12,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '600',
    color: "#1A1A1A",
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: isSmallDevice ? 14 : 16,
    borderWidth: 1,
    borderColor: "#FF8A00",
    gap: 8,
  },
  guestButtonText: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '600',
    color: "#FF8A00",
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  signupText: {
    fontSize: 14,
    color: "#666666",
  },
  signupLink: {
    fontSize: 14,
    color: "#FF8A00",
    fontWeight: '700',
  },
  termsText: {
    fontSize: 12,
    color: "#999999",
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
});