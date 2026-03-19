import axios from "axios";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";
import { useEffect } from "react";
import React, { useState } from "react";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
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
  FlatList,
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
import { useAuth } from "../data/AuthContext";

// Types
interface Address {
  id: string;
  type: "home" | "work" | "other";
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

// Languages data - Only 5 languages
const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
];

// 🔥 TRANSLATIONS OBJECT - Only 5 languages
const translations = {
  en: {
    // Profile
    editProfile: "Edit Profile",
    accountInfo: "Account Information",
    email: "Email",
    phone: "Phone",
    changePassword: "Change Password",
    savedAddresses: "Saved Addresses",
    addNew: "Add New",
    noAddresses: "No addresses saved",
    noAddressesSub: "Add your first address to start ordering",
    addAddress: "Add Address",
    default: "DEFAULT",
    setDefault: "Set Default",
    youCanAdd: "You can add",
    moreAddress: "more address",
    moreAddresses: "more addresses",

    // Orders & Wallet
    ordersWallet: "Orders & Wallet",
    myOrders: "My Orders",
    viewAllOrders: "View all orders",
    wallet: "Wallet",
    balance: "Balance",
    addMoney: "Add Money",
    referEarn: "Refer & Earn",
    earnPerReferral: "Earn ₹100 per referral",

    // Preferences
    preferences: "Preferences",
    notifications: "Notifications",
    notificationSub: "Receive order updates",
    darkMode: "Dark Mode",
    enabled: "Enabled",
    disabled: "Disabled",
    language: "Language",

    // Help & Support
    helpSupport: "Help & Support",
    helpCenter: "Help Center",
    contactUs: "Contact Us",
    contactSub: "24/7 Customer Support",
    termsPrivacy: "Terms & Privacy",
    appVersion: "App Version",

    // Buttons
    logout: "Logout",
    cancel: "Cancel",
    save: "Save",
    saveChanges: "Save Changes",
    delete: "Delete",

    // Modals
    selectLanguage: "Select Language",
    searchLanguage: "Search language...",
    noLanguages: "No languages found",
    addNewAddress: "Add New Address",
    addressType: "Address Type",
    home: "Home",
    work: "Work",
    other: "Other",
    addressName: "Address Name (e.g., Home, Office)",
    fullAddress: "Full Address",
    phoneNumber: "Phone Number",
    setAsDefault: "Set as default address",
    saveAddress: "Save Address",
    selectLiveLocation: "Select Live Location",
    fetchingLocation: "Fetching address...",
    locationError: "Location Error",
    locationPermissionDenied: "Permission to access location was denied",

    // Alerts
    success: "Success",
    error: "Error",
    warning: "Warning",
    cameraPermission: "Camera permission required",
    galleryPermission: "Gallery permission required",
    uploadFailed: "Image upload failed",
    profileUpdated: "Profile updated successfully!",
    addressAdded: "Address added successfully!",
    passwordChanged: "Password changed successfully!",
    photoUpdated: "Profile picture updated",
    fillAllFields: "Please fill all fields",
    limitReached: "You can save only 3 addresses.",
    deleteAddress: "Delete Address",
    deleteConfirm: "Are you sure you want to delete this address?",
    logoutConfirm: "Are you sure you want to logout?",
    languageChanged: "App language set to",
    copied: "Copied!",
    copyCode: "Referral code copied to clipboard",
    invalidAmount: "Invalid Amount",
    enterValidAmount: "Please enter a valid amount",

    // Form validation
    nameRequired: "Name is required",
    nameMinLength: "Name must be at least 3 characters",
    emailRequired: "Email is required",
    emailInvalid: "Enter a valid email",
    phoneRequired: "Phone is required",
    phoneInvalid: "Enter a valid 10-digit phone",
    fixErrors: "Fix Errors",
    pleaseCorrect: "Please correct the highlighted fields.",

    // Password
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    passwordRequired: "Password is required",
    passwordMinLength: "Password must be at least 6 characters",
    passwordMismatch: "Passwords do not match",
    passwordIncorrect: "Current password is incorrect",

    // Referral
    referralTitle: "Refer & Earn",
    referralMessage: "Share your referral code: CHHAVI123\n\nYour friend gets ₹100 off on first order\nYou get ₹100 when they complete their first order",
    copyCode: "Copy Code",
    share: "Share",

    // Wallet
    addMoneyTitle: "Add Money to Wallet",
    enterAmount: "Enter amount to add:",

    // Loading
    loadingProfile: "Loading Profile...",

    // WhatsApp
    whatsappNotInstalled: "WhatsApp is not installed on this device.",
    callNotAvailable: "Unable to make a call on this device.",

    // 👇 Guest user messages
    guestWelcome: "Welcome, Guest!",
    guestSubtitle: "You're browsing as a guest",
    loginToAccess: "Login to access all features",
    loginNow: "Login Now",
    createAccount: "Create Account",
    guestFeatures: "Guest Features",
    browseMenu: "Browse Menu",
    browseMenuDesc: "Explore our delicious menu",
    viewEvents: "View Events",
    viewEventsDesc: "Check out our upcoming events",
    contactSupport: "Contact Support",
    contactSupportDesc: "Get help from our team",
    guestLimitations: "Guest Limitations",
    orderLimit: "Cannot place orders",
    addressLimit: "Cannot save addresses",
    walletLimit: "No wallet access",
    referralLimit: "Cannot refer & earn",
    loginPrompt: "Login to unlock all features!",
    guestInfo: "Guest users can browse but cannot perform actions like ordering, saving addresses, or accessing wallet.",
  },

  hi: {
    // ... (existing Hindi translations)
    guestWelcome: "स्वागत है, अतिथि!",
    guestSubtitle: "आप अतिथि के रूप में ब्राउज़ कर रहे हैं",
    loginToAccess: "सभी सुविधाओं तक पहुंचने के लिए लॉगिन करें",
    loginNow: "अभी लॉगिन करें",
    createAccount: "खाता बनाएं",
    guestFeatures: "अतिथि सुविधाएं",
    browseMenu: "मेनू ब्राउज़ करें",
    browseMenuDesc: "हमारा स्वादिष्ट मेनू देखें",
    viewEvents: "इवेंट देखें",
    viewEventsDesc: "हमारे आगामी इवेंट देखें",
    contactSupport: "सहायता से संपर्क करें",
    contactSupportDesc: "हमारी टीम से मदद प्राप्त करें",
    guestLimitations: "अतिथि सीमाएं",
    orderLimit: "ऑर्डर नहीं कर सकते",
    addressLimit: "पते सहेज नहीं सकते",
    walletLimit: "वॉलेट एक्सेस नहीं",
    referralLimit: "रेफर और कमा नहीं सकते",
    loginPrompt: "सभी सुविधाएं अनलॉक करने के लिए लॉगिन करें!",
    guestInfo: "अतिथि उपयोगकर्ता ब्राउज़ कर सकते हैं लेकिन ऑर्डर करना, पते सहेजना या वॉलेट एक्सेस करना जैसी क्रियाएं नहीं कर सकते।",
  },

  mr: {
    // ... (existing Marathi translations)
    guestWelcome: "स्वागत आहे, पाहुण्या!",
    guestSubtitle: "तुम्ही पाहुणे म्हणून ब्राउझ करत आहात",
    loginToAccess: "सर्व सुविधांमध्ये प्रवेश करण्यासाठी लॉगिन करा",
    loginNow: "आताच लॉगिन करा",
    createAccount: "खाते तयार करा",
    guestFeatures: "पाहुणे सुविधा",
    browseMenu: "मेनू ब्राउझ करा",
    browseMenuDesc: "आमचा स्वादिष्ट मेनू पहा",
    viewEvents: "इव्हेंट पहा",
    viewEventsDesc: "आमचे आगामी इव्हेंट पहा",
    contactSupport: "सहाय्याशी संपर्क करा",
    contactSupportDesc: "आमच्या टीमकडून मदत मिळवा",
    guestLimitations: "पाहुणे मर्यादा",
    orderLimit: "ऑर्डर करू शकत नाही",
    addressLimit: "पत्ते जतन करू शकत नाही",
    walletLimit: "वॉलेट प्रवेश नाही",
    referralLimit: "रेफर आणि कमवू शकत नाही",
    loginPrompt: "सर्व सुविधा अनलॉक करण्यासाठी लॉगिन करा!",
    guestInfo: "पाहुणे वापरकर्ते ब्राउझ करू शकतात परंतु ऑर्डर करणे, पत्ते जतन करणे किंवा वॉलेट प्रवेश करणे यासारख्या क्रिया करू शकत नाहीत.",
  },

  te: {
    // ... (existing Telugu translations)
    guestWelcome: "స్వాగతం, అతిథి!",
    guestSubtitle: "మీరు అతిథిగా బ్రౌజ్ చేస్తున్నారు",
    loginToAccess: "అన్ని ఫీచర్లను యాక్సెస్ చేయడానికి లాగిన్ చేయండి",
    loginNow: "ఇప్పుడే లాగిన్ చేయండి",
    createAccount: "ఖాతా సృష్టించండి",
    guestFeatures: "అతిథి ఫీచర్లు",
    browseMenu: "మెనూ బ్రౌజ్ చేయండి",
    browseMenuDesc: "మా రుచికరమైన మెనూని అన్వేషించండి",
    viewEvents: "ఈవెంట్లను చూడండి",
    viewEventsDesc: "మా రాబోయే ఈవెంట్లను చూడండి",
    contactSupport: "సహాయాన్ని సంప్రదించండి",
    contactSupportDesc: "మా టీమ్ నుండి సహాయం పొందండి",
    guestLimitations: "అతిథి పరిమితులు",
    orderLimit: "ఆర్డర్ చేయలేరు",
    addressLimit: "చిరునామాలు సేవ్ చేయలేరు",
    walletLimit: "వాలెట్ యాక్సెస్ లేదు",
    referralLimit: "రెఫర్ & సంపాదించలేరు",
    loginPrompt: "అన్ని ఫీచర్లను అన్‌లాక్ చేయడానికి లాగిన్ చేయండి!",
    guestInfo: "అతిథి వినియోగదారులు బ్రౌజ్ చేయవచ్చు కానీ ఆర్డర్ చేయడం, చిరునామాలు సేవ్ చేయడం లేదా వాలెట్ యాక్సెస్ చేయడం వంటి చర్యలు చేయలేరు.",
  },

  gu: {
    // ... (existing Gujarati translations)
    guestWelcome: "સ્વાગત છે, મહેમાન!",
    guestSubtitle: "તમે મહેમાન તરીકે બ્રાઉઝ કરી રહ્યા છો",
    loginToAccess: "બધી સુવિધાઓને ઍક્સેસ કરવા માટે લૉગિન કરો",
    loginNow: "હમણાં લૉગિન કરો",
    createAccount: "ખાતું બનાવો",
    guestFeatures: "મહેમાન સુવિધાઓ",
    browseMenu: "મેનુ બ્રાઉઝ કરો",
    browseMenuDesc: "અમારું સ્વાદિષ્ટ મેનુ અન્વેષણ કરો",
    viewEvents: "ઇવેન્ટ્સ જુઓ",
    viewEventsDesc: "અમારી આગામી ઇવેન્ટ્સ જુઓ",
    contactSupport: "સહાયનો સંપર્ક કરો",
    contactSupportDesc: "અમારી ટીમ પાસેથી મદદ મેળવો",
    guestLimitations: "મહેમાન મર્યાદાઓ",
    orderLimit: "ઓર્ડર કરી શકતા નથી",
    addressLimit: "સરનામાં સાચવી શકતા નથી",
    walletLimit: "વોલેટ ઍક્સેસ નથી",
    referralLimit: "રેફર અને કમાઈ શકતા નથી",
    loginPrompt: "બધી સુવિધાઓ અનલૉક કરવા માટે લૉગિન કરો!",
    guestInfo: "મહેમાન વપરાશકર્તાઓ બ્રાઉઝ કરી શકે છે પરંતુ ઓર્ડર કરવા, સરનામાં સાચવવા અથવા વોલેટ ઍક્સેસ કરવા જેવી ક્રિયાઓ કરી શકતા નથી.",
  },
};

export default function ProfileScreen() {
  const { colors, mode, toggle } = useTheme();
  const { user: authUser, isGuest, loginGuest, logout } = useAuth(); // 👈 Use auth context
  const [user, setUser] = useState<any>(null);

useEffect(() => {
  if (authUser) {
    setUser(authUser);
  }
}, [authUser]);

  const [loading, setLoading] = useState(true);
  const [isGuestUser, setIsGuestUser] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkUserStatus();
    }, [])
  );

  // 👇 Check if user is guest
  const checkUserStatus = async () => {
    
    try {

      const userInfo = await AsyncStorage.getItem("userInfo");

      if (!userInfo) {
        setIsGuestUser(true);
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userInfo);

      if (parsedUser?.isGuest) {
        setIsGuestUser(true);
        setUser(parsedUser);
        setLoading(false);
        return;
      }

      setIsGuestUser(false);
      fetchProfile();

    } catch (error) {
      console.log("User check error", error);
      setIsGuestUser(true);
      setLoading(false);
    }
  };

  const handleHelpCenter = () => {
    const phone = "9644974442";
    const message = "Hello, I need help with my order.";
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(t("error"), t("whatsappNotInstalled"));
    });
  };

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const handleSelectLiveLocation = async () => {
    if (isGuestUser) {
      Alert.alert(t("loginRequired"), t("loginToAccess"));
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t("locationError"), t("locationPermissionDenied"));
        return;
      }

      setIsFetchingLocation(true);
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = `${addr.name || ""}, ${addr.street || ""}, ${addr.district || ""}, ${addr.city || ""}, ${addr.region || ""}, ${addr.postalCode || ""}, ${addr.country || ""}`.replace(/^[ ,]+|[ ,]+$/g, "").replace(/, ,/g, ",");
        setNewAddress((prev) => ({ ...prev, address: formattedAddress }));
      }
    } catch (error) {
      console.log("Location Error:", error);
      Alert.alert(t("locationError"), t("error"));
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const [editErrors, setEditErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  // Address state - User filled addresses only (no default)
  const [addresses, setAddresses] = useState<Address[]>([]); // Empty initially
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("English");
  const [languageCode, setLanguageCode] = useState("en");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSearchQuery, setLanguageSearchQuery] = useState("");

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // 🔥 Translation function
  const t = (key: string) => {
    return translations[languageCode as keyof typeof translations]?.[key as keyof typeof translations.en] || translations.en[key as keyof typeof translations.en] || key;
  };

  // StatusBar color based on theme
  React.useEffect(() => {
    StatusBar.setBarStyle(mode === 'dark' ? 'light-content' : 'dark-content');
  }, [mode]);

  // Load saved addresses and language from AsyncStorage
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      // Load addresses (only for logged-in users)
      if (!isGuestUser) {
        const savedAddresses = await AsyncStorage.getItem('userAddresses');
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses));
        }
      }
      // Load language
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang) {
        const lang = LANGUAGES.find(l => l.code === savedLang);
        if (lang) {
          setLanguage(lang.name);
          setLanguageCode(lang.code);
        }
      }
    } catch (error) {
      console.log('Error loading saved data:', error);
    }
  };

  const saveAddresses = async (newAddresses: Address[]) => {
    try {
      await AsyncStorage.setItem('userAddresses', JSON.stringify(newAddresses));
      setAddresses(newAddresses);
    } catch (error) {
      console.log('Error saving addresses:', error);
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "?";
    const words = name.split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Filter languages based on search
  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(languageSearchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(languageSearchQuery.toLowerCase())
  );

  const handleEditProfile = () => {
    if (isGuestUser) {
      Alert.alert(t("loginRequired"), t("loginToAccess"));
      return;
    }
    if (!user) return;
    setEditingUser({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    });
    setShowEditModal(true);
  };

  const handleChangeAvatar = () => {
    if (isGuestUser) {
      Alert.alert(t("loginRequired"), t("loginToAccess"));
      return;
    }
    Alert.alert(t("editProfile"), "", [
      { text: t("cameraPermission"), onPress: () => openCamera() },
      { text: t("galleryPermission"), onPress: () => openGallery() },
      { text: t("cancel"), style: "cancel" },
    ]);
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("error"), t("cameraPermission"));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.3,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const image = result.assets[0];

      console.log("IMAGE DATA:", image);

      if (!image.base64) {
        Alert.alert("Error", "Image processing failed");
        return;
      }

      uploadImage(image.base64);
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("error"), t("galleryPermission"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].base64);
    }
  };

  const uploadImage = async (base64: string) => {
    console.log("BASE64 LENGTH:", base64.length);

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.put(
        `${BASE_URL}/api/auth/profile`,
        {
          avatar: `data:image/jpeg;base64,${base64}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedUser = response.data;

      setUser(updatedUser);

      await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUser));
      router.replace("/");

      Alert.alert(t("success"), t("photoUpdated"));
    } catch (error) {
      console.log("UPLOAD ERROR:", error);
      Alert.alert(t("error"), t("uploadFailed"));
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

    if (!name) errors.name = t("nameRequired");
    else if (name.length < 3) errors.name = t("nameMinLength");

    if (!email) errors.email = t("emailRequired");
    else if (!validateEmail(email)) errors.email = t("emailInvalid");

    if (!phone) errors.phone = t("phoneRequired");
    else if (!validatePhoneIN(phone)) errors.phone = t("phoneInvalid");

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = t("passwordRequired");
    }
    if (!passwordData.newPassword) {
      errors.newPassword = t("passwordRequired");
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = t("passwordMinLength");
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = t("passwordRequired");
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = t("passwordMismatch");
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateEditProfile()) {
      Alert.alert(t("fixErrors"), t("pleaseCorrect"));
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = { ...user, ...response.data };

      setUser(updatedUser);

      await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUser));

      router.replace("/");
      setShowEditModal(false);
      setEditErrors({});
      Alert.alert(t("success"), t("profileUpdated"));
    } catch (error) {
      console.log("❌ PROFILE ERROR:", error.response?.data || error.message);
    }
  };

  // Change Password Function
  const handleChangePassword = async () => {
    if (!validatePassword()) {
      Alert.alert(t("fixErrors"), t("pleaseCorrect"));
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert(t("success"), t("passwordChanged"));
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
    } catch (error: any) {
      console.log("Password Change Error:", error.response?.data);
      if (error.response?.data?.message === "Current password is incorrect") {
        setPasswordErrors({ currentPassword: t("passwordIncorrect") });
      } else {
        Alert.alert(t("error"), error.response?.data?.message || "Failed to change password");
      }
    }
  };

  // Add Address - Max 3 addresses
  const handleAddAddress = () => {
    if (isGuestUser) {
      Alert.alert(t("loginRequired"), t("loginToAccess"));
      return;
    }

    if (!newAddress.name || !newAddress.address || !newAddress.phone) {
      Alert.alert(t("error"), t("fillAllFields"));
      return;
    }
    if (addresses.length >= 3) {
      Alert.alert(t("warning"), t("limitReached"));
      return;
    }

    const updatedAddresses = [...addresses];

    // If this is first address, make it default automatically
    if (addresses.length === 0) {
      newAddress.isDefault = true;
    }

    // If setting as default, remove default from others
    if (newAddress.isDefault) {
      updatedAddresses.forEach(addr => (addr.isDefault = false));
    }

    const addressToAdd = {
      id: Date.now().toString(),
      ...newAddress,
    };

    updatedAddresses.push(addressToAdd);

    // Save to AsyncStorage
    saveAddresses(updatedAddresses);

    setNewAddress({
      type: "home",
      name: "",
      address: "",
      phone: "",
      isDefault: false,
    });
    setShowAddressModal(false);
    Alert.alert(t("success"), t("addressAdded"));
  };

  const handleSetDefaultAddress = (id: string) => {
    if (isGuestUser) return;

    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    saveAddresses(updatedAddresses);
  };

  const handleDeleteAddress = (id: string) => {
    if (isGuestUser) return;

    Alert.alert(
      t("deleteAddress"),
      t("deleteConfirm"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => {
            const updatedAddresses = addresses.filter(addr => addr.id !== id);
            saveAddresses(updatedAddresses);
          },
        },
      ]
    );
  };

  const handleCallSupport = () => {
    const phone = "9644974442";
    const url = `tel:${phone}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(t("error"), t("callNotAvailable"));
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      t("logout"),
      t("logoutConfirm"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("logout"),
          style: "destructive",
          onPress: async () => {
            try {
              // Delete user data from local storage
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("cartCount");

              // Create guest user fallback
              const guestUser = {
                _id: "guest_user",
                name: "Guest User",
                email: "",
                isGuest: true,
                avatar: null
              };
              await AsyncStorage.setItem("userInfo", JSON.stringify(guestUser));

              // Update AuthContext and redirect
              await loginGuest();
              router.replace("/");
            } catch (error) {
              console.log("Logout error:", error);
            }
          }
        }
      ]
    );
  };

  // Language change with translation update
  const handleLanguageSelect = async (lang) => {
    setLanguage(lang.name);
    setLanguageCode(lang.code);
    setShowLanguageModal(false);
    setLanguageSearchQuery("");

    await AsyncStorage.setItem("appLanguage", lang.code);

    router.replace("/"); // 🔥 THIS LINE FIXES EVERYTHING

    Alert.alert(t("success"), `${t("languageChanged")} ${lang.name}`);
  };

  const handleNavigateToOrders = () => {
    if (isGuestUser) {
      Alert.alert(t("loginRequired"), t("loginToAccess"));
      return;
    }
    router.push({
      pathname: "/order",
      params: { userId: user?._id },
    });
  };

  const handleReferral = () => {
    if (isGuestUser) {
      Alert.alert(t("loginRequired"), t("loginToAccess"));
      return;
    }

    Alert.alert(
      t("referralTitle"),
      t("referralMessage"),
      [
        {
          text: t("copyCode"),
          onPress: () => {
            Alert.alert(t("copied"), t("copyCode"));
          },
        },
        {
          text: t("share"),
          onPress: () => {
            Alert.alert(t("share"), "Share referral link via...");
          },
        },
        { text: t("cancel") },
      ]
    );
  };

  const handleAddMoney = () => {
    if (isGuestUser) {
      Alert.alert(t("loginRequired"), t("loginToAccess"));
      return;
    }

    Alert.prompt(
      t("addMoneyTitle"),
      t("enterAmount"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("addMoney"),
          onPress: (amount?: string) => {
            const val = Number((amount ?? "").trim());
            if (!Number.isFinite(val) || val <= 0) {
              Alert.alert(t("invalidAmount"), t("enterValidAmount"));
              return;
            }
            setUser((prev: any) => ({
              ...prev,
              walletBalance: (prev?.walletBalance ?? 0) + val,
            }));
          },
        },
      ],
      "plain-text",
      "",
      "numeric"
    );
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Ionicons name="home" size={22} color={colors.primary} />;
      case "work":
        return <Ionicons name="business" size={22} color={colors.primary} />;
      default:
        return <Ionicons name="location" size={22} color={colors.primary} />;
    }
  };

  const handleSupport = () => {
    Alert.alert(t("helpSupport"), "Contact support@example.com or call 1800-XXX-XXXX");
  };

  const handleTerms = () => {
    Alert.alert(t("termsPrivacy"), "Terms and privacy policy content here...");
  };


  const fetchProfile = async () => {
  try {

    const userInfo = await AsyncStorage.getItem("userInfo");

    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);

      // 👇 Guest user
      if (parsedUser?.isGuest) {
        setIsGuestUser(true);
        setUser(parsedUser);
        setLoading(false);
        return;
      }
    }

    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setIsGuestUser(true);
      setLoading(false);
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

    setUser(response.data);
    setLoading(false);

  } catch (error) {
    console.log("PROFILE ERROR:", error.response?.data || error.message);
    setLoading(false);
  }
};

  // 👇 Render guest view
  const renderGuestView = () => {
    return (
      <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
        {/* Guest Header */}
        <View style={dynamicStyles.header}>
          <View style={styles.avatarContainer}>
            <View style={[styles.initialsAvatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.initialsText, { color: colors.primary }]}>
                {user?.initials || (user?.name ? getInitials(user.name) : "SK")}
              </Text>
            </View>
          </View>
          <Text style={dynamicStyles.name}>{t("guestWelcome")}</Text>
          <Text style={dynamicStyles.phone}>{t("guestSubtitle")}</Text>

          <View style={styles.guestInfoCard}>
            <Ionicons name="information-circle" size={20} color={colors.warning} />
            <Text style={[styles.guestInfoText, { color: colors.subText }]}>
              {t("guestInfo")}
            </Text>
          </View>

          <View style={styles.guestActions}>
            <TouchableOpacity
              style={[styles.guestActionBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/auth/login")}
            >
              <Ionicons name="log-in" size={18} color="#fff" />
              <Text style={styles.guestActionText}>{t("loginNow")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.guestActionBtn, styles.guestActionSecondary, { borderColor: colors.primary }]}
              onPress={() => router.push("/auth/registration")}
            >
              <Text style={[styles.guestActionSecondaryText, { color: colors.primary }]}>
                {t("createAccount")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Guest Features */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t("guestFeatures")}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.item, { borderColor: colors.border }]}
              onPress={() => router.push("/menu")}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="restaurant" size={22} color={colors.success} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{t("browseMenu")}</Text>
                  <Text style={[styles.itemSub, { color: colors.subText }]}>{t("browseMenuDesc")}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subText} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.item, { borderColor: colors.border }]}
              onPress={() => router.push("/event")}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="calendar" size={22} color={colors.warning} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{t("viewEvents")}</Text>
                  <Text style={[styles.itemSub, { color: colors.subText }]}>{t("viewEventsDesc")}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subText} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.item, { borderColor: colors.border }]}
              onPress={handleCallSupport}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="call" size={22} color={colors.info} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{t("contactSupport")}</Text>
                  <Text style={[styles.itemSub, { color: colors.subText }]}>{t("contactSupportDesc")}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Guest Limitations */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t("guestLimitations")}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.limitItem, { borderColor: colors.border }]}>
              <Ionicons name="close-circle" size={22} color={colors.danger} />
              <Text style={[styles.limitText, { color: colors.text }]}>{t("orderLimit")}</Text>
            </View>
            <View style={[styles.limitItem, { borderColor: colors.border }]}>
              <Ionicons name="close-circle" size={22} color={colors.danger} />
              <Text style={[styles.limitText, { color: colors.text }]}>{t("addressLimit")}</Text>
            </View>
            <View style={[styles.limitItem, { borderColor: colors.border }]}>
              <Ionicons name="close-circle" size={22} color={colors.danger} />
              <Text style={[styles.limitText, { color: colors.text }]}>{t("walletLimit")}</Text>
            </View>
            <View style={[styles.limitItem, { borderColor: colors.border }]}>
              <Ionicons name="close-circle" size={22} color={colors.danger} />
              <Text style={[styles.limitText, { color: colors.text }]}>{t("referralLimit")}</Text>
            </View>
          </View>
        </View>

        {/* Login Prompt */}
        <View style={[styles.loginPromptCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
          <Text style={[styles.loginPromptText, { color: colors.primary }]}>
            {t("loginPrompt")}
          </Text>
          <TouchableOpacity
            style={[styles.loginPromptBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.loginPromptBtnText}>{t("loginNow")}</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences - Language and Dark Mode (Available for guests) */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t("preferences")}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.preferenceItem, { borderColor: colors.border }]}>
              <View style={styles.preferenceLeft}>
                <Ionicons name="notifications" size={22} color="#009688" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={dynamicStyles.preferenceTitle}>{t("notifications")}</Text>
                  <Text style={dynamicStyles.preferenceSub}>{t("notificationSub")}</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: "#009688" }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.preferenceItem, { borderColor: colors.border }]}>
              <View style={styles.preferenceLeft}>
                <Ionicons
                  name={mode === 'dark' ? "moon" : "sunny"}
                  size={22}
                  color={mode === 'dark' ? "#FFD700" : "#FF9800"}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={dynamicStyles.preferenceTitle}>{t("darkMode")}</Text>
                  <Text style={dynamicStyles.preferenceSub}>
                    {mode === "dark" ? t("enabled") : t("disabled")}
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

            <TouchableOpacity
              style={[styles.item, { borderColor: colors.border }]}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="language" size={22} color="#009688" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{t("language")}</Text>
                  <Text style={[styles.itemSub, { color: colors.subText }]}>{language}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t("helpSupport")}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.item, { borderColor: colors.border }]}
              onPress={handleHelpCenter}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{t("helpCenter")}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subText} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.item, { borderColor: colors.border }]}
              onPress={handleCallSupport}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="call" size={22} color="#25D366" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{t("contactUs")}</Text>
                  <Text style={[styles.itemSub, { color: colors.subText }]}>{t("contactSub")}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subText} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.item, { borderColor: colors.border }]}
              onPress={handleTerms}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="document-text" size={22} color="#607D8B" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{t("termsPrivacy")}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subText} />
            </TouchableOpacity>

            <View style={[styles.item, { borderColor: colors.border }]}>
              <View style={styles.itemLeft}>
                <Ionicons name="information-circle" size={22} color="#607D8B" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{t("appVersion")}</Text>
                  <Text style={[styles.itemSub, { color: colors.subText }]}>v2.0.1</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Logout/Login Button for Guest */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/auth/login")}
        >
          <Ionicons name="log-in" size={20} color="#fff" />
          <Text style={styles.logoutText}>{t("loginNow")}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
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
      backgroundColor: colors.modalBackground || colors.card,
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
    languageItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    languageName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    languageNative: {
      fontSize: 14,
      color: colors.subText,
      marginTop: 2,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      margin: 16,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    },
    passwordInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    passwordInput: {
      flex: 1,
      padding: 16,
      fontSize: 16,
      color: colors.text,
    },
    eyeIcon: {
      padding: 16,
    },
    // Address Box Styles
    addressBox: {
      marginHorizontal: 20,
      marginBottom: 16,
    },
    addressCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    addressTypeBadge: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    addressTypeBadgeText: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
      color: colors.primary,
    },
    defaultBadgeSmall: {
      backgroundColor: colors.success + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 8,
    },
    defaultBadgeSmallText: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.success,
    },
    emptyAddressContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 30,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    emptyAddressText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginTop: 12,
      marginBottom: 4,
    },
    emptyAddressSubText: {
      fontSize: 14,
      color: colors.subText,
      textAlign: "center",
      marginBottom: 16,
    },
    addFirstBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    addFirstBtnText: {
      color: "#fff",
      fontWeight: "600",
      marginLeft: 8,
    },
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <Ionicons name="person-circle-outline" size={60} color={colors.primary} />
        <Text style={{ marginTop: 10, fontSize: 16, color: colors.text }}>
          {t("loadingProfile")}
        </Text>
      </View>
    );
  }

  // If guest user, show guest view
  if (isGuestUser) {
    return renderGuestView();
  }

  return (
    <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={dynamicStyles.header}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.initialsAvatar, { backgroundColor: "#FFF3E0" }]}>
              <Text style={styles.initialsText}>
                {user?.initials
                  ? user.initials
                  : user?.name
                    ? getInitials(user.name)
                    : "SK"}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.cameraIcon, { backgroundColor: colors.primary }]}
            onPress={handleChangeAvatar}
          >
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={dynamicStyles.name}>{user?.name}</Text>
        <Text style={dynamicStyles.phone}>{user?.phone}</Text>
        <View style={dynamicStyles.walletContainer}>
          <FontAwesome5 name="wallet" size={16} color={colors.warning} />
          <Text style={dynamicStyles.walletText}>{t("wallet")}: ₹{user?.walletBalance || 0}</Text>
        </View>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: colors.primary }]}
          onPress={handleEditProfile}
        >
          <Ionicons name="pencil" size={14} color="#fff" />
          <Text style={styles.editText}>{t("editProfile")}</Text>
        </TouchableOpacity>
      </View>

      {/* Account Information */}
      <View style={styles.section}>
        <Text style={dynamicStyles.sectionTitle}>{t("accountInfo")}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProfileItem
            icon={<Ionicons name="mail" size={22} color={colors.primary} />}
            title={t("email")}
            subtitle={user?.email}
            showChevron={false}
            colors={colors}
            t={t}
          />
          <ProfileItem
            icon={<Ionicons name="call" size={22} color={colors.primary} />}
            title={t("phone")}
            subtitle={user?.phone}
            showChevron={false}
            colors={colors}
            t={t}
          />
          <ProfileItem
            icon={<Ionicons name="key" size={22} color={colors.primary} />}
            title={t("changePassword")}
            onPress={() => setShowPasswordModal(true)}
            colors={colors}
            t={t}
          />
        </View>
      </View>

      {/* Addresses Section - Box Style with User Filled Addresses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>{t("savedAddresses")}</Text>
          {addresses.length < 3 && (
            <TouchableOpacity onPress={() => setShowAddressModal(true)}>
              <Text style={dynamicStyles.addText}>+ {t("addNew")}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={dynamicStyles.addressBox}>
          {addresses.length === 0 ? (
            // Empty state - No addresses
            <View style={dynamicStyles.emptyAddressContainer}>
              <Ionicons name="location-outline" size={50} color={colors.subText} />
              <Text style={dynamicStyles.emptyAddressText}>{t("noAddresses")}</Text>
              <Text style={dynamicStyles.emptyAddressSubText}>
                {t("noAddressesSub")}
              </Text>
              <TouchableOpacity
                style={dynamicStyles.addFirstBtn}
                onPress={() => setShowAddressModal(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={dynamicStyles.addFirstBtnText}>{t("addAddress")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Show addresses in boxes
            addresses.map((address) => (
              <View key={address.id} style={dynamicStyles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={dynamicStyles.addressTypeBadge}>
                    {getAddressIcon(address.type)}
                    <Text style={dynamicStyles.addressTypeBadgeText}>
                      {address.name}
                    </Text>
                    {address.isDefault && (
                      <View style={dynamicStyles.defaultBadgeSmall}>
                        <Text style={dynamicStyles.defaultBadgeSmallText}>{t("default")}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.addressActions}>
                    {!address.isDefault && addresses.length > 1 && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.inputBackground }]}
                        onPress={() => handleSetDefaultAddress(address.id)}
                      >
                        <Text style={[styles.actionText, { color: colors.primary }]}>{t("setDefault")}</Text>
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
                <Text style={dynamicStyles.addressText}>{address.address}</Text>
                <Text style={dynamicStyles.phoneText}>{address.phone}</Text>
              </View>
            ))
          )}

          {/* Show remaining slots info */}
          {addresses.length > 0 && addresses.length < 3 && (
            <View style={[styles.remainingSlots, { backgroundColor: colors.inputBackground }]}>
              <Text style={{ color: colors.subText }}>
                {t("youCanAdd")} {3 - addresses.length} {3 - addresses.length > 1 ? t("moreAddresses") : t("moreAddress")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Orders & Wallet */}
      <View style={styles.section}>
        <Text style={dynamicStyles.sectionTitle}>{t("ordersWallet")}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProfileItem
            icon={<MaterialIcons name="receipt-long" size={22} color={colors.warning} />}
            title={t("myOrders")}
            subtitle={t("viewAllOrders")}
            onPress={handleNavigateToOrders}
            colors={colors}
            t={t}
          />
          <ProfileItem
            icon={<FontAwesome5 name="wallet" size={20} color={colors.warning} />}
            title={t("wallet")}
            subtitle={`₹${user?.walletBalance || 0} ${t("balance")}`}
            rightAction={
              <TouchableOpacity
                style={[styles.addMoneyBtn, { backgroundColor: colors.warning }]}
                onPress={handleAddMoney}
              >
                <Text style={styles.addMoneyText}>{t("addMoney")}</Text>
              </TouchableOpacity>
            }
            colors={colors}
            t={t}
          />
          <ProfileItem
            icon={<Ionicons name="gift" size={22} color={colors.warning} />}
            title={t("referEarn")}
            subtitle={t("earnPerReferral")}
            onPress={handleReferral}
            colors={colors}
            t={t}
          />
        </View>
      </View>

      {/* Preferences - DARK MODE TOGGLE & LANGUAGE */}
      <View style={styles.section}>
        <Text style={dynamicStyles.sectionTitle}>{t("preferences")}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.preferenceItem, { borderColor: colors.border }]}>
            <View style={styles.preferenceLeft}>
              <Ionicons name="notifications" size={22} color="#009688" />
              <View style={{ marginLeft: 12 }}>
                <Text style={dynamicStyles.preferenceTitle}>{t("notifications")}</Text>
                <Text style={dynamicStyles.preferenceSub}>{t("notificationSub")}</Text>
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
                <Text style={dynamicStyles.preferenceTitle}>{t("darkMode")}</Text>
                <Text style={dynamicStyles.preferenceSub}>
                  {mode === "dark" ? t("enabled") : t("disabled")}
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

          {/* LANGUAGE SELECTION */}
          <ProfileItem
            icon={<Ionicons name="language" size={22} color="#009688" />}
            title={t("language")}
            subtitle={language}
            onPress={() => setShowLanguageModal(true)}
            colors={colors}
            t={t}
          />
        </View>
      </View>

      {/* Help & Support */}
      <View style={styles.section}>
        <Text style={dynamicStyles.sectionTitle}>{t("helpSupport")}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProfileItem
            icon={<Ionicons name="help-circle" size={22} color="#607D8B" />}
            title={t("helpCenter")}
            onPress={handleHelpCenter}
            colors={colors}
            t={t}
          />
          <ProfileItem
            icon={<Ionicons name="chatbubble" size={22} color="#607D8B" />}
            title={t("contactUs")}
            subtitle={t("contactSub")}
            onPress={handleCallSupport}
            colors={colors}
            t={t}
          />
          <ProfileItem
            icon={<Ionicons name="document-text" size={22} color="#607D8B" />}
            title={t("termsPrivacy")}
            onPress={handleTerms}
            colors={colors}
            t={t}
          />
          <ProfileItem
            icon={<Ionicons name="information-circle" size={22} color="#607D8B" />}
            title={t("appVersion")}
            subtitle="v2.0.1"
            showChevron={false}
            colors={colors}
            t={t}
          />
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.danger }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>{t("logout")}</Text>
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
              <Text style={dynamicStyles.modalTitle}>{t("editProfile")}</Text>
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
                placeholder={t("nameRequired")}
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
                placeholder={t("email")}
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
                placeholder={t("phone")}
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
                <Text style={dynamicStyles.cancelButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>{t("saveChanges")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <View style={[styles.modalHeader, { borderColor: colors.border }]}>
              <Text style={dynamicStyles.modalTitle}>{t("changePassword")}</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setPasswordErrors({});
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {/* Current Password */}
              <View style={dynamicStyles.passwordInputContainer}>
                <TextInput
                  style={[
                    dynamicStyles.passwordInput,
                    passwordErrors.currentPassword && { color: colors.danger }
                  ]}
                  placeholder={t("currentPassword")}
                  placeholderTextColor={colors.subText}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => {
                    setPasswordData({ ...passwordData, currentPassword: text });
                    if (passwordErrors.currentPassword)
                      setPasswordErrors({ ...passwordErrors, currentPassword: undefined });
                  }}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  style={dynamicStyles.eyeIcon}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons
                    name={showCurrentPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.subText}
                  />
                </TouchableOpacity>
              </View>
              {passwordErrors.currentPassword ? (
                <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 12, fontSize: 12 }}>
                  {passwordErrors.currentPassword}
                </Text>
              ) : null}

              {/* New Password */}
              <View style={dynamicStyles.passwordInputContainer}>
                <TextInput
                  style={[
                    dynamicStyles.passwordInput,
                    passwordErrors.newPassword && { color: colors.danger }
                  ]}
                  placeholder={t("newPassword")}
                  placeholderTextColor={colors.subText}
                  value={passwordData.newPassword}
                  onChangeText={(text) => {
                    setPasswordData({ ...passwordData, newPassword: text });
                    if (passwordErrors.newPassword)
                      setPasswordErrors({ ...passwordErrors, newPassword: undefined });
                  }}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={dynamicStyles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.subText}
                  />
                </TouchableOpacity>
              </View>
              {passwordErrors.newPassword ? (
                <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 12, fontSize: 12 }}>
                  {passwordErrors.newPassword}
                </Text>
              ) : null}

              {/* Confirm Password */}
              <View style={dynamicStyles.passwordInputContainer}>
                <TextInput
                  style={[
                    dynamicStyles.passwordInput,
                    passwordErrors.confirmPassword && { color: colors.danger }
                  ]}
                  placeholder={t("confirmPassword")}
                  placeholderTextColor={colors.subText}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => {
                    setPasswordData({ ...passwordData, confirmPassword: text });
                    if (passwordErrors.confirmPassword)
                      setPasswordErrors({ ...passwordErrors, confirmPassword: undefined });
                  }}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={dynamicStyles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.subText}
                  />
                </TouchableOpacity>
              </View>
              {passwordErrors.confirmPassword ? (
                <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 12, fontSize: 12 }}>
                  {passwordErrors.confirmPassword}
                </Text>
              ) : null}
            </ScrollView>
            <View style={dynamicStyles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, dynamicStyles.cancelButton]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setPasswordErrors({});
                }}
              >
                <Text style={dynamicStyles.cancelButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleChangePassword}
              >
                <Text style={styles.saveButtonText}>{t("changePassword")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Modal with Search */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <View style={[styles.modalHeader, { borderColor: colors.border }]}>
              <Text style={dynamicStyles.modalTitle}>{t("selectLanguage")}</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowLanguageModal(false);
                  setLanguageSearchQuery("");
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={dynamicStyles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={colors.subText}
                style={dynamicStyles.searchIcon}
              />
              <TextInput
                style={dynamicStyles.searchInput}
                placeholder={t("searchLanguage")}
                placeholderTextColor={colors.subText}
                value={languageSearchQuery}
                onChangeText={setLanguageSearchQuery}
              />
              {languageSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setLanguageSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color={colors.subText} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredLanguages}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    dynamicStyles.languageItem,
                    languageCode === item.code && { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => handleLanguageSelect(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={dynamicStyles.languageName}>{item.name}</Text>
                    <Text style={dynamicStyles.languageNative}>{item.nativeName}</Text>
                  </View>
                  {languageCode === item.code && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Ionicons name="search" size={40} color={colors.subText} />
                  <Text style={{ color: colors.subText, marginTop: 12 }}>{t("noLanguages")}</Text>
                </View>
              )}
            />
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
              <Text style={dynamicStyles.modalTitle}>{t("addNewAddress")}</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={dynamicStyles.modalLabel}>{t("addressType")}</Text>
              <View style={styles.addressTypeContainer}>
                {["home", "work", "other"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      dynamicStyles.addressTypeBtn,
                      newAddress.type === type && dynamicStyles.addressTypeActive,
                    ]}
                    onPress={() => setNewAddress({ ...newAddress, type: type as any })}
                  >
                    <Ionicons
                      name={type === "home" ? "home" : type === "work" ? "business" : "location"}
                      size={20}
                      color={newAddress.type === type ? "#fff" : colors.subText}
                    />
                    <Text
                      style={[
                        dynamicStyles.addressTypeText,
                        newAddress.type === type && dynamicStyles.addressTypeTextActive,
                      ]}
                    >
                      {type === "home" ? t("home") : type === "work" ? t("work") : t("other")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  dynamicStyles.modalInput,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    backgroundColor: colors.primary + "10",
                    borderColor: colors.primary,
                    borderStyle: "dashed",
                  },
                ]}
                onPress={handleSelectLiveLocation}
                disabled={isFetchingLocation}
              >
                {isFetchingLocation ? (
                  <Text style={{ color: colors.primary, fontWeight: "600" }}>{t("fetchingLocation")}</Text>
                ) : (
                  <>
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontWeight: "600" }}>{t("selectLiveLocation")}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TextInput
                style={dynamicStyles.modalInput}
                placeholder={t("addressName")}
                placeholderTextColor={colors.subText}
                value={newAddress.name}
                onChangeText={(text) => setNewAddress({ ...newAddress, name: text })}
              />

              <TextInput
                style={[dynamicStyles.modalInput, styles.textArea]}
                placeholder={t("fullAddress")}
                placeholderTextColor={colors.subText}
                value={newAddress.address}
                onChangeText={(text) => setNewAddress({ ...newAddress, address: text })}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={dynamicStyles.modalInput}
                placeholder={t("phoneNumber")}
                placeholderTextColor={colors.subText}
                value={newAddress.phone}
                onChangeText={(text) => setNewAddress({ ...newAddress, phone: text })}
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setNewAddress({ ...newAddress, isDefault: !newAddress.isDefault })}
              >
                <Ionicons
                  name={newAddress.isDefault ? "checkbox" : "square-outline"}
                  size={24}
                  color={newAddress.isDefault ? colors.primary : colors.subText}
                />
                <Text style={dynamicStyles.checkboxText}>{t("setAsDefault")}</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={dynamicStyles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, dynamicStyles.cancelButton]}
                onPress={() => setShowAddressModal(false)}
              >
                <Text style={dynamicStyles.cancelButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleAddAddress}
              >
                <Text style={styles.saveButtonText}>{t("saveAddress")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ProfileItem Component with theme support
function ProfileItem({
  icon,
  title,
  subtitle,
  onPress,
  rightAction,
  showChevron = true,
  colors,
  t,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightAction?: React.ReactNode;
  showChevron?: boolean;
  colors: any;
  t: (key: string) => string;
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

// Static styles
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
  initialsAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#2E7D32",
  },
  initialsText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000",
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
    marginBottom: 8,
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
    fontWeight: "600",
  },
  addressActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
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
  remainingSlots: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },

  // 👇 Guest view styles
  guestInfoCard: {
    flexDirection: "row",
    backgroundColor: "#FFA50020",
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    gap: 12,
  },
  guestInfoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  guestActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  guestActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  guestActionSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  guestActionSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  guestActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  limitItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  limitText: {
    fontSize: 15,
    fontWeight: "500",
  },
  loginPromptCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 24,
  },
  loginPromptText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  loginPromptBtn: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginPromptBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});