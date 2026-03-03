import React, { useState } from "react";
import { API } from "../../config/api";

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
import { useAuth } from "../data/AuthContext"
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function Register() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword } = formData;

    if (!name.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return false;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    if (!phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return false;
    }

    if (phone.length < 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return false;
    }

    if (!password) {
      Alert.alert("Error", "Please enter a password");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    if (!acceptedTerms) {
      Alert.alert("Error", "Please accept the terms & conditions");
      return false;
    }

    return true;
  };

const handleRegister = async () => {
  if (!validateForm()) return;

  setIsLoading(true);

  try {
    const response = await fetch(API.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      Alert.alert("Success ✅", "Account created successfully!", [
        {
          text: "Login Now",
          onPress: () => router.replace("/auth/login"),
        },
      ]);
    } else {
      Alert.alert("Error", data.message || "Registration failed");
    }
  } catch (error) {
    console.log("Register Error:", error);
    Alert.alert("Error", "Server not reachable");
  } finally {
    setIsLoading(false);
  }
};


  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, color: "#E9ECEF", text: "" };
    if (password.length < 6) return { strength: 25, color: "#FF4757", text: "Weak" };
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let strength = 25; // Base for length > 6
    if (hasUpperCase) strength += 25;
    if (hasLowerCase) strength += 25;
    if (hasNumbers) strength += 25;
    if (hasSpecialChar) strength += 25;
    
    strength = Math.min(strength, 100);
    
    if (strength < 50) return { strength, color: "#FF4757", text: "Weak" };
    if (strength < 75) return { strength, color: "#FFA502", text: "Fair" };
    return { strength, color: "#06D6A0", text: "Strong" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
            
            
          </Animated.View>

          {/* Main Content */}
          <View style={styles.content}>
            <Animated.View 
              entering={FadeInDown.delay(200).duration(600)}
              style={styles.formContainer}
            >
              <Text style={styles.welcomeText}>Create Account</Text>
              

              {/* Form Fields */}
              <Animated.View 
                entering={FadeInDown.delay(300).duration(600)}
                style={styles.inputContainer}
              >
                <View style={styles.inputIcon}>
                  <Ionicons name="person-outline" size={20} color="#999" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                />
              </Animated.View>

              <Animated.View 
                entering={FadeInDown.delay(350).duration(600)}
                style={styles.inputContainer}
              >
                <View style={styles.inputIcon}>
                  <Ionicons name="mail-outline" size={20} color="#999" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {formData.email.includes('@') && formData.email.includes('.') && (
                  <Ionicons name="checkmark-circle" size={20} color="#06D6A0" />
                )}
              </Animated.View>

              <Animated.View 
                entering={FadeInDown.delay(400).duration(600)}
                style={styles.inputContainer}
              >
                <View style={styles.inputIcon}>
                  <Ionicons name="call-outline" size={20} color="#999" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value.replace(/[^0-9]/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {formData.phone.length === 10 && (
                  <Ionicons name="checkmark-circle" size={20} color="#06D6A0" />
                )}
              </Animated.View>

              {/* Password with Strength Indicator */}
              <Animated.View 
                entering={FadeInDown.delay(450).duration(600)}
                style={styles.passwordContainer}
              >
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="lock-closed-outline" size={20} color="#999" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
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
                </View>

                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.strengthBar}>
                      <View 
                        style={[
                          styles.strengthFill,
                          { 
                            width: `${passwordStrength.strength}%`,
                            backgroundColor: passwordStrength.color 
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.text}
                    </Text>
                  </View>
                )}
              </Animated.View>

              <Animated.View 
                entering={FadeInDown.delay(500).duration(600)}
                style={styles.inputContainer}
              >
                <View style={styles.inputIcon}>
                  <Ionicons name="lock-closed-outline" size={20} color="#999" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
                {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                  <Ionicons name="checkmark-circle" size={20} color="#06D6A0" />
                )}
              </Animated.View>

              {/* Terms & Conditions */}
              <Animated.View 
                entering={FadeInDown.delay(550).duration(600)}
                style={styles.termsContainer}
              >
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                >
                  <View style={[styles.checkboxBox, acceptedTerms && styles.checkboxBoxChecked]}>
                    {acceptedTerms && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the{" "}
                    <Text style={styles.termsLink}>Terms & Conditions</Text>{" "}
                    and{" "}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Register Button */}
              <Animated.View 
                entering={FadeInDown.delay(600).duration(600)}
                style={styles.buttonContainer}
              >
                <TouchableOpacity 
                  style={[
                    styles.registerButton,
                    isLoading && styles.registerButtonDisabled
                  ]}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.registerButtonText}>Creating Account...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.registerButtonText}>Create Account</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <Animated.View 
                entering={FadeInDown.delay(650).duration(600)}
                style={styles.dividerContainer}
              >
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </Animated.View>

              {/* Social Login */}
              <Animated.View 
                entering={FadeInDown.delay(700).duration(600)}
                style={styles.socialContainer}
              >
                <Text style={styles.socialText}>Sign up with</Text>
                <View style={styles.socialButtons}>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => Alert.alert("Coming Soon", "Google signup coming soon!")}
                  >
                    <Image
                      source={{ uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png" }}
                      style={styles.socialIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => Alert.alert("Coming Soon", "Facebook signup coming soon!")}
                  >
                    <Image
                      source={{ uri: "https://cdn-icons-png.flaticon.com/512/5968/5968764.png" }}
                      style={styles.socialIcon}
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Login Link */}
              <Animated.View 
                entering={FadeInDown.delay(750).duration(600)}
                style={styles.loginContainer}
              >
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace("/auth/login")}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </Animated.View>
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
    marginBottom: height * 0.04,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
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
    marginLeft: 8,
  },
  passwordContainer: {
    marginBottom: 12,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E9ECEF",
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 12,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
  },
  termsContainer: {
    marginBottom: 24,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: "#FF8A00",
    borderColor: "#FF8A00",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  termsLink: {
    color: "#FF8A00",
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  registerButton: {
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
  registerButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
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
  socialContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  socialText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    fontSize: 14,
    color: "#666666",
  },
  loginLink: {
    fontSize: 14,
    color: "#FF8A00",
    fontWeight: '700',
  },
});