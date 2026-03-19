import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  BackHandler
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FadeIn, FadeInDown } from "react-native-reanimated";

import { useAuth } from "../data/AuthContext";
import { BASE_URL } from "../../config/api";

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function Login() {
  const router = useRouter();
  const { login, loginGuest, logout, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
  try {

    const userInfo = await AsyncStorage.getItem("userInfo");

    if (!userInfo) return;

    const parsedUser = JSON.parse(userInfo);

    // अगर guest है तो login page open रहने दो
    if (parsedUser.isGuest) return;

    // अगर real user login है तभी home भेजो
    router.replace("/");

  } catch (error) {
    console.log("User check error:", error);
  }
};

  // Back button handler
  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const handleBackPress = async () => {
    try {

      const userInfo = await AsyncStorage.getItem("userInfo");

      if (userInfo) {
        router.replace("/");
      } else {
        handleGuestLogin();
      }

    } catch (error) {
      console.log("Back press error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout(); // AuthContext ka logout call karo
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/login`,
        {
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }
      );

      const userData = response.data;

      console.log("Login Success:", userData);

      // Add isGuest flag to user data
      const userWithGuestFlag = {
        ...userData,
        isGuest: false,
        lastLogin: new Date().toISOString()
      };

      // Save token
      if (userData.token) {
        await AsyncStorage.setItem("token", userData.token);
      }

      // Save full user data
      await AsyncStorage.setItem("userInfo", JSON.stringify(userWithGuestFlag));

      // Update Auth Context
      await login(userWithGuestFlag);

      // Show success message
      Alert.alert(
        "Success",
        `Welcome back, ${userData.name || 'User'}!`,
        [
          {
            text: "Continue",
            onPress: () => router.replace("/")
          }
        ]
      );

    } catch (error) {
      console.log("Login Error:", error.response?.data || error.message);

      let errorMessage = "Invalid email or password";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid credentials";
      } else if (error.response?.status === 404) {
        errorMessage = "User not found";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Connection timeout. Please try again";
      } else if (!error.response) {
        errorMessage = "Network error. Check your connection";
      }

      Alert.alert(
        "Login Failed",
        errorMessage,
        [{ text: "Try Again" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setIsLoading(true);

      const guestUserData = {
        _id: "guest_user",
        name: "Guest User",
        initials: "SK",
        email: "guest@sattvikkaleva.com",
        isGuest: true,
        avatar: null
      };

      // remove old token
      await AsyncStorage.removeItem("token");

      // save guest info
      await AsyncStorage.setItem("userInfo", JSON.stringify(guestUserData));

      // update auth context
      await loginGuest(guestUserData);

      router.replace("/");

    } catch (error) {
      console.log("Guest login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password?",
      "Please contact support or use 'Forgot Password' option",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Contact Support",
          onPress: () => {
            // Add your support contact logic here
            Alert.alert("Support", "Please email: support@sattvikkaleva.com");
          }
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
              onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FF8A00" />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Text style={styles.appName}>Sattvik Kaleva</Text>
            </View>

            {/* Empty view for spacing */}
            <View style={{ width: 44 }} />
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
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
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
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
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
                      <Text style={styles.loginButtonText}>Please wait...</Text>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                <TouchableOpacity
                  onPress={() => router.push("/auth/registration")}
                  disabled={isLoading}
                >
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