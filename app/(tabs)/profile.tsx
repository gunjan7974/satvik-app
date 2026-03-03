import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";
import { useEffect } from "react";
import React, { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Switch,
  StatusBar,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useTheme } from "../data/ThemeContext";
import { Linking } from "react-native";


// Types
interface Address {
  id: string;
  type: "home" | "work" | "other";
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
}
export default function ProfileScreen() {
  const { colors, mode, toggle } = useTheme();
const [user, setUser] = useState<any>(null);
  const handleHelpCenter = () => {
  const phone = "9644974442"; 
  const message = "Hello, I need help with my order.";
  const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;

  Linking.openURL(url).catch(() => {
    Alert.alert("Error", "WhatsApp is not installed on this device.");
  });
};
  const [editErrors, setEditErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      type: "home",
      name: "Home",
      address: "123 Main St, Sector 5, Raipur, Chhattisgarh",
      phone: "+91 9876543210",
      isDefault: true,
    },
    {
      id: "2",
      type: "work",
      name: "Office",
      address: "Tech Park, Floor 7, Office No. 702, Raipur",
      phone: "+91 9876543211",
      isDefault: false,
    },
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("English");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>({
  name: "",
  email: "",
  phone: "",
});

  const [newAddress, setNewAddress] = useState({
    type: "home" as "home" | "work" | "other",
    name: "",
    address: "",
    phone: "",
    isDefault: false,
  });
  // StatusBar color based on theme
  React.useEffect(() => {
    StatusBar.setBarStyle(mode === 'dark' ? 'light-content' : 'dark-content');
  }, [mode]);

  // Handlers (same as before)
const handleEditProfile = () => {
  if (!user) return;

  setEditingUser({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
  });

  setShowEditModal(true);
};

const handleChangeAvatar = () => {
  Alert.alert("Change Profile Picture", "", [
    {
      text: "Take Photo",
      onPress: () => openCamera(),
    },
    {
      text: "Choose from Gallery",
      onPress: () => openGallery(),
    },
    {
      text: "Cancel",
      style: "cancel",
    },
  ]);
};

const openCamera = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Camera permission required");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.6,
    base64: true,
  });

  if (!result.canceled) {
    uploadImage(result.assets[0].base64);
  }
};

const openGallery = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Gallery permission required");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.6,
    base64: true,
  });

  if (!result.canceled) {
    uploadImage(result.assets[0].base64);
  }
};

const uploadImage = async (base64: string) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.put(
      `${BASE_URL}/api/auth/profile`,
      {
        avatar: `data:image/jpeg;base64,${base64}`,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setUser(response.data);
    Alert.alert("Success", "Profile picture updated");

  } catch (error: any) {
    console.log("Upload Error:", error.response?.data || error.message);
    Alert.alert("Error", "Image upload failed");
  }
};

  const validateEmail = (email: string) => {
  const value = email.toLowerCase().trim();
  const re = /^[a-z0-9._%+-]+@(gmail\.com|yahoo\.com)$/;
  return re.test(value);
};

const validatePhoneIN = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("91") ? digits.slice(2) : digits;
  return normalized.length === 10;
};

const validateEditProfile = () => {
  const errors: { name?: string; email?: string; phone?: string } = {};

  const name = (editingUser.name || "").trim();
  const email = (editingUser.email || "").trim();
  const phone = (editingUser.phone || "").trim();

  if (!name) errors.name = "Name is required";
  else if (name.length < 3) errors.name = "Name must be at least 3 characters";

  if (!email) errors.email = "Email is required";
  else if (!validateEmail(email)) errors.email = "Enter a valid email";

  if (!phone) errors.phone = "Phone is required";
  else if (!validatePhoneIN(phone)) errors.phone = "Enter a valid 10-digit phone";

  setEditErrors(errors);
  return Object.keys(errors).length === 0;
};


 const handleSaveProfile = async () => {
  if (!validateEditProfile()) {
    Alert.alert("Fix Errors", "Please correct the highlighted fields.");
    return;
  }

  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.put(
      `${BASE_URL}/api/auth/profile`,
      {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUser({
      ...user,
      ...response.data,
    });

    setShowEditModal(false);
    setEditErrors({});
    Alert.alert("Success", "Profile updated successfully!");

  } catch (error) {
    console.log("Update Error:", error.response?.data);
    Alert.alert("Error", "Profile update failed");
  }
};



  const handleAddAddress = () => {
  if (!newAddress.name || !newAddress.address || !newAddress.phone) {
    Alert.alert("Error", "Please fill all fields");
    return;
  }

  if (addresses.length >= 3) {
    Alert.alert("Limit Reached", "You can save only 3 addresses.");
    return;
  }

  const updatedAddresses = [...addresses];

  if (newAddress.isDefault) {
    updatedAddresses.forEach(addr => (addr.isDefault = false));
  }

  updatedAddresses.push({
    id: Date.now().toString(),
    ...newAddress,
  });

  setAddresses(updatedAddresses);

  setNewAddress({
    type: "home",
    name: "",
    address: "",
    phone: "",
    isDefault: false,
  });

  setShowAddressModal(false);
  Alert.alert("Success", "Address added successfully!");
};


  const handleSetDefaultAddress = (id: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    setAddresses(updatedAddresses);
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedAddresses = addresses.filter(addr => addr.id !== id);
            setAddresses(updatedAddresses);
          },
        },
      ]
    );
  };
   
  const handleCallSupport = () => {
  const phone = "9644974442"; 
  const url = `tel:${phone}`;

  Linking.openURL(url).catch(() => {
    Alert.alert("Error", "Unable to make a call on this device.");
  });
};


 const handleLogout = async () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("userInfo");

          router.replace("/auth/login");
        },
      },
    ]
  );
};


const [showLanguageModal, setShowLanguageModal] = useState(false);

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
];


  const handleNavigateToOrders = () => {
    router.push({
      pathname: "/order",
      params: { userId: user._id },

    });
  };

  const handleReferral = () => {
    Alert.alert(
      "Refer & Earn",
      `Share your referral code: CHHAVI123\n\nYour friend gets ₹100 off on first order\nYou get ₹100 when they complete their first order`,
      [
        { text: "Copy Code", onPress: () => {
          Alert.alert("Copied!", "Referral code copied to clipboard");
        }},
        { text: "Share", onPress: () => {
          Alert.alert("Share", "Share referral link via...");
        }},
        { text: "OK" },
      ]
    );
  };

  const handleAddMoney = () => {
    Alert.prompt(
      "Add Money to Wallet",
      "Enter amount to add:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
         onPress: (amount?: string) => {
         const val = Number((amount ?? "").trim());
         if (!Number.isFinite(val) || val <= 0) 
        {
          Alert.alert("Invalid Amount", "Please enter a valid amount");
          return;
        }

        setUser((prev: any) => ({
    ...prev,
    walletBalance: (prev?.walletBalance ?? 0) + val,
  }));
}

        },
      ],
      "plain-text",
      "",
      "numeric"
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      "Change Language",
      "Select your preferred language",
      [
        { text: "English", onPress: () => setLanguage("English") },
        { text: "हिंदी", onPress: () => setLanguage("Hindi") },
        { text: "मराठी", onPress: () => setLanguage("Marathi") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home": return <Ionicons name="home" size={22} color={colors.primary} />;
      case "work": return <Ionicons name="business" size={22} color={colors.primary} />;
      default: return <Ionicons name="location" size={22} color={colors.primary} />;
    }
  };

  const handleSupport = () => {
    Alert.alert("Support", "Contact support@example.com or call 1800-XXX-XXXX");
  };

  const handleTerms = () => {
    Alert.alert("Terms & Privacy", "Terms and privacy policy content here...");
  };

useEffect(() => {
  console.log("PROFILE SCREEN MOUNTED ✅");
  fetchProfile();
}, []);

const fetchProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.log("❌ No token found");
      router.replace("/auth/login");
      return;
    }

    const response = await axios.get(
      `${BASE_URL}/api/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ PROFILE DATA:", response.data);
    setUser(response.data);

  } catch (error) {
    console.log("❌ PROFILE ERROR:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      router.replace("/auth/login");
    }
  }
};
  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      alignItems: "center",
      backgroundColor: colors.card,
      paddingVertical: 30,
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    name: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    phone: {
      fontSize: 14,
      color: colors.subText,
      marginBottom: 8,
    },
    walletContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: mode === 'dark' ? '#3E2723' : '#FFF3E0',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 12,
    },
    walletText: {
      color: colors.warning,
      fontWeight: "600",
      marginLeft: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    addText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 14,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    itemSub: {
      color: colors.subText,
      fontSize: 13,
      marginTop: 2,
    },
    addressName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    addressText: {
      color: colors.subText,
      fontSize: 14,
      marginBottom: 2,
      lineHeight: 18,
    },
    phoneText: {
      color: colors.subText,
      fontSize: 13,
    },
    preferenceTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    preferenceSub: {
      color: colors.subText,
      fontSize: 13,
      marginTop: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: colors.modalBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "90%",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    modalInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.subText,
      marginBottom: 12,
      marginTop: 8,
    },
    addressTypeBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      gap: 8,
    },
    addressTypeActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    addressTypeText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.subText,
    },
    addressTypeTextActive: {
      color: "#fff",
    },
    checkboxText: {
      marginLeft: 12,
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
    modalActions: {
      flexDirection: "row",
      padding: 20,
      borderTopWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    cancelButton: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.subText,
      fontWeight: "600",
      fontSize: 16,
    },
  });
if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={dynamicStyles.header}>
        <View style={styles.avatarContainer}>
 <Image
  source={
    user?.avatar
      ? { uri: user.avatar }
      : require("../../assets/images/gunjan.png")
  }
  style={styles.avatar}
/>

          <TouchableOpacity 
            style={[styles.cameraIcon, { backgroundColor: colors.primary }]} 
             onPress={handleChangeAvatar}
          >
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={dynamicStyles.name}>{user.name}</Text>
        <Text style={dynamicStyles.phone}>{user.phone}</Text>
        
        <View style={dynamicStyles.walletContainer}>
          <FontAwesome5 name="wallet" size={16} color={colors.warning} />
          <Text style={dynamicStyles.walletText}>Wallet: ₹{user.walletBalance}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.editBtn, { backgroundColor: colors.primary }]} 
           onPress={handleEditProfile} 
        >
          <Ionicons name="pencil" size={14} color="#fff" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Account Information */}
      <View style={styles.section}>
        <Text style={dynamicStyles.sectionTitle}>Account Information</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProfileItem
            icon={<Ionicons name="mail" size={22} color={colors.primary} />}
            title="Email"
            subtitle={user.email}
            showChevron={false}
            colors={colors}
          />
          <ProfileItem
            icon={<Ionicons name="call" size={22} color={colors.primary} />}
            title="Phone"
            subtitle={user.phone}
            showChevron={false}
            colors={colors}
          />
          <ProfileItem
            icon={<Ionicons name="key" size={22} color={colors.primary} />}
            title="Change Password"
            onPress={() => Alert.alert("Coming Soon", "Password change feature will be available soon")}
            colors={colors}
          />
        </View>
      </View>

      {/* Addresses Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>Saved Addresses</Text>
          <TouchableOpacity onPress={() => setShowAddressModal(true)}>
            <Text style={dynamicStyles.addText}>+ Add New</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {addresses.map((address) => (
            <View key={address.id} style={[styles.addressItem, { borderColor: colors.border }]}>
              <View style={styles.addressHeader}>
                <View style={styles.addressLeft}>
                  {getAddressIcon(address.type)}
                  <View style={{ marginLeft: 12 }}>
                    <Text style={dynamicStyles.addressName}>
                      {address.name} {address.isDefault && (
                        <Text style={[styles.defaultBadge, { backgroundColor: mode === 'dark' ? '#1B5E20' : '#E8F5E9' }]}>
                          Default
                        </Text>
                      )}
                    </Text>
                    <Text style={dynamicStyles.addressText}>{address.address}</Text>
                    <Text style={dynamicStyles.phoneText}>{address.phone}</Text>
                  </View>
                </View>
                <View style={styles.addressActions}>
                  {!address.isDefault && (
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: colors.inputBackground }]}
                      onPress={() => handleSetDefaultAddress(address.id)}
                    >
                      <Text style={[styles.actionText, { color: colors.primary }]}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.deleteBtn, { backgroundColor: colors.inputBackground }]}
                    onPress={() => handleDeleteAddress(address.id)}
                  >
                    <Ionicons name="trash" size={14} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Orders & Wallet */}
      <View style={styles.section}>
        <Text style={dynamicStyles.sectionTitle}>Orders & Wallet</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProfileItem
            icon={<MaterialIcons name="receipt-long" size={22} color={colors.warning} />}
            title="My Orders"
            subtitle="View all orders"
            onPress={handleNavigateToOrders}
            colors={colors}
          />
          <ProfileItem
            icon={<FontAwesome5 name="wallet" size={20} color={colors.warning} />}
            title="Wallet"
            subtitle={`₹${user.walletBalance} Balance`}
            rightAction={
              <TouchableOpacity 
                style={[styles.addMoneyBtn, { backgroundColor: colors.warning }]} 
                onPress={handleAddMoney}
              >
                <Text style={styles.addMoneyText}>Add Money</Text>
              </TouchableOpacity>
            }
            colors={colors}
          />
          <ProfileItem
            icon={<Ionicons name="gift" size={22} color={colors.warning} />}
            title="Refer & Earn"
            subtitle="Earn ₹100 per referral"
            onPress={handleReferral}
            colors={colors}
          />
        </View>
      </View>

     

      {/* Preferences - DARK MODE TOGGLE HERE */}
      <View style={styles.section}>
        <Text style={dynamicStyles.sectionTitle}>Preferences</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.preferenceItem, { borderColor: colors.border }]}>
            <View style={styles.preferenceLeft}>
              <Ionicons name="notifications" size={22} color="#009688" />
              <View style={{ marginLeft: 12 }}>
                <Text style={dynamicStyles.preferenceTitle}>Notifications</Text>
                <Text style={dynamicStyles.preferenceSub}>Receive order updates</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: "#009688" }}
              thumbColor="#fff"
            />
          </View>
          
          {/* DARK MODE TOGGLE */}
          <View style={[styles.preferenceItem, { borderColor: colors.border }]}>
            <View style={styles.preferenceLeft}>
              <Ionicons 
                name={mode === 'dark' ? "moon" : "sunny"} 
                size={22} 
                color={mode === 'dark' ? "#FFD700" : "#FF9800"} 
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={dynamicStyles.preferenceTitle}>Dark Mode</Text>
                <Text style={dynamicStyles.preferenceSub}>
                  {mode === "dark" ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>
            <Switch
              value={mode === "dark"}
              onValueChange={toggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          
          <ProfileItem
            icon={<Ionicons name="language" size={22} color="#009688" />}
            title="Language"
            subtitle={language}
            onPress={handleLanguageChange}
            colors={colors}
          />
        </View>
      </View>

      {/* Help & Support */}
      <View style={styles.section}>
        <Text style={dynamicStyles.sectionTitle}>Help & Support</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProfileItem
  icon={<Ionicons name="help-circle" size={22} color="#607D8B" />}
  title="Help Center"
  onPress={handleHelpCenter}
  colors={colors}
/>

          <ProfileItem
  icon={<Ionicons name="chatbubble" size={22} color="#607D8B" />}
  title="Contact Us"
  subtitle="24/7 Customer Support"
  onPress={handleCallSupport}
  colors={colors}
/>

          <ProfileItem
            icon={<Ionicons name="document-text" size={22} color="#607D8B" />}
            title="Terms & Privacy"
            onPress={handleTerms}
            colors={colors}
          />
          <ProfileItem
            icon={<Ionicons name="information-circle" size={22} color="#607D8B" />}
            title="App Version"
            subtitle="v2.0.1"
            showChevron={false}
            colors={colors}
          />
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutBtn, { backgroundColor: colors.danger }]} 
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <View style={[styles.modalHeader, { borderColor: colors.border }]}>
              <Text style={dynamicStyles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <TextInput
  style={[
    dynamicStyles.modalInput,
    editErrors.name && { borderColor: colors.danger, borderWidth: 1.5 },
  ]}
  placeholder="Full Name"
  placeholderTextColor={colors.subText}
  value={editingUser.name}
  onChangeText={(text) => {
    setEditingUser({ ...editingUser, name: text });
    if (editErrors.name) setEditErrors((p) => ({ ...p, name: undefined }));
  }}
/>

{editErrors.name ? (
  <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 12, fontSize: 12 }}>
    {editErrors.name}
  </Text>
) : null}

              <TextInput
  style={[
    dynamicStyles.modalInput,
    editErrors.email && { borderColor: colors.danger, borderWidth: 1.5 },
  ]}
  placeholder="Email"
  placeholderTextColor={colors.subText}
  value={editingUser.email}
  onChangeText={(text) => {
    setEditingUser({ ...editingUser, email: text });
    if (editErrors.email) setEditErrors((p) => ({ ...p, email: undefined }));
  }}
  keyboardType="email-address"
  autoCapitalize="none"
/>

{editErrors.email ? (
  <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 12, fontSize: 12 }}>
    {editErrors.email}
  </Text>
) : null}

              <TextInput
  style={[
    dynamicStyles.modalInput,
    editErrors.phone && { borderColor: colors.danger, borderWidth: 1.5 },
  ]}
  placeholder="Phone Number"
  placeholderTextColor={colors.subText}
  value={editingUser.phone}
  onChangeText={(text) => {
    setEditingUser({ ...editingUser, phone: text });
    if (editErrors.phone) setEditErrors((p) => ({ ...p, phone: undefined }));
  }}
  keyboardType="phone-pad"
/>

{editErrors.phone ? (
  <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 12, fontSize: 12 }}>
    {editErrors.phone}
  </Text>
) : null}

            </ScrollView>
            
            <View style={dynamicStyles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, dynamicStyles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Address Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <View style={[styles.modalHeader, { borderColor: colors.border }]}>
              <Text style={dynamicStyles.modalTitle}>Add New Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={dynamicStyles.modalLabel}>Address Type</Text>
              <View style={styles.addressTypeContainer}>
                {["home", "work", "other"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      dynamicStyles.addressTypeBtn,
                      newAddress.type === type && dynamicStyles.addressTypeActive,
                    ]}
                    onPress={() => setNewAddress({...newAddress, type: type as any})}
                  >
                    <Ionicons 
                      name={type === "home" ? "home" : type === "work" ? "business" : "location"} 
                      size={20} 
                      color={newAddress.type === type ? "#fff" : colors.subText} 
                    />
                    <Text style={[
                      dynamicStyles.addressTypeText,
                      newAddress.type === type && dynamicStyles.addressTypeTextActive,
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TextInput
                style={dynamicStyles.modalInput}
                placeholder="Address Name (e.g., Home, Office)"
                placeholderTextColor={colors.subText}
                value={newAddress.name}
                onChangeText={(text) => setNewAddress({...newAddress, name: text})}
              />
              
              <TextInput
                style={[dynamicStyles.modalInput, styles.textArea]}
                placeholder="Full Address"
                placeholderTextColor={colors.subText}
                value={newAddress.address}
                onChangeText={(text) => setNewAddress({...newAddress, address: text})}
                multiline
                numberOfLines={3}
              />
              
              <TextInput
                style={dynamicStyles.modalInput}
                placeholder="Phone Number"
                placeholderTextColor={colors.subText}
                value={newAddress.phone}
                onChangeText={(text) => setNewAddress({...newAddress, phone: text})}
                keyboardType="phone-pad"
              />
              
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setNewAddress({...newAddress, isDefault: !newAddress.isDefault})}
              >
                <Ionicons 
                  name={newAddress.isDefault ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={newAddress.isDefault ? colors.primary : colors.subText} 
                />
                <Text style={dynamicStyles.checkboxText}>Set as default address</Text>
              </TouchableOpacity>
            </ScrollView>
            
            <View style={dynamicStyles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, dynamicStyles.cancelButton]}
                onPress={() => setShowAddressModal(false)}
              >
                <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleAddAddress}
              >
                <Text style={styles.saveButtonText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Updated ProfileItem Component with theme support
function ProfileItem({
  icon,
  title,
  subtitle,
  onPress,
  rightAction,
  showChevron = true,
  colors,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightAction?: React.ReactNode;
  showChevron?: boolean;
  colors: any;
}) {
  return (
    <TouchableOpacity
      style={[styles.item, { borderColor: colors.border }]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.itemLeft}>
        {icon}
        <View style={{ marginLeft: 12 }}>
          <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.itemSub, { color: colors.subText }]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.itemRight}>
        {rightAction}
        {showChevron && onPress && (
          <Ionicons name="chevron-forward" size={18} color={colors.subText} />
        )}
      </View>
    </TouchableOpacity>
  );
}

// Static styles (unchanged)
const styles = StyleSheet.create({
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#2E7D32",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 4,
  },
  editText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    marginHorizontal: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemSub: {
    fontSize: 13,
    marginTop: 2,
  },
  addressItem: {
    padding: 18,
    borderBottomWidth: 1,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  addressLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  defaultBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  addressActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  addMoneyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  addMoneyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  defaultPayment: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
  },
  preferenceLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
    marginTop: 10,
    elevation: 3,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalContent: {
    padding: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButton: {},
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  addressTypeContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
});