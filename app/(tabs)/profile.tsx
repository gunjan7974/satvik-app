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
  },

  hi: {
    editProfile: "प्रोफ़ाइल संपादित करें",
    accountInfo: "खाता जानकारी",
    email: "ईमेल",
    phone: "फ़ोन",
    changePassword: "पासवर्ड बदलें",
    savedAddresses: "सहेजे गए पते",
    addNew: "नया जोड़ें",
    noAddresses: "कोई पता सहेजा नहीं",
    noAddressesSub: "ऑर्डर शुरू करने के लिए अपना पहला पता जोड़ें",
    addAddress: "पता जोड़ें",
    default: "डिफ़ॉल्ट",
    setDefault: "डिफ़ॉल्ट सेट करें",
    youCanAdd: "आप",
    moreAddress: "और पता जोड़ सकते हैं",
    moreAddresses: "और पते जोड़ सकते हैं",
    ordersWallet: "ऑर्डर और वॉलेट",
    myOrders: "मेरे ऑर्डर",
    viewAllOrders: "सभी ऑर्डर देखें",
    wallet: "वॉलेट",
    balance: "बैलेंस",
    addMoney: "पैसे जोड़ें",
    referEarn: "रेफर करें और कमाएं",
    earnPerReferral: "प्रति रेफरल ₹100 कमाएं",
    preferences: "प्राथमिकताएं",
    notifications: "सूचनाएं",
    notificationSub: "ऑर्डर अपडेट प्राप्त करें",
    darkMode: "डार्क मोड",
    enabled: "सक्षम",
    disabled: "अक्षम",
    language: "भाषा",
    helpSupport: "सहायता",
    helpCenter: "सहायता केंद्र",
    contactUs: "संपर्क करें",
    contactSub: "24/7 ग्राहक सहायता",
    termsPrivacy: "नियम और गोपनीयता",
    appVersion: "ऐप संस्करण",
    logout: "लॉगआउट",
    cancel: "रद्द करें",
    save: "सहेजें",
    saveChanges: "बदलाव सहेजें",
    delete: "हटाएं",
    selectLanguage: "भाषा चुनें",
    searchLanguage: "भाषा खोजें...",
    noLanguages: "कोई भाषा नहीं मिली",
    addNewAddress: "नया पता जोड़ें",
    addressType: "पते का प्रकार",
    home: "घर",
    work: "कार्यालय",
    other: "अन्य",
    addressName: "पते का नाम (जैसे, घर, कार्यालय)",
    fullAddress: "पूरा पता",
    phoneNumber: "फ़ोन नंबर",
    setAsDefault: "डिफ़ॉल्ट पते के रूप में सेट करें",
    saveAddress: "पता सहेजें",
    selectLiveLocation: "लाइव स्थान चुनें",
    fetchingLocation: "पता प्राप्त किया जा रहा है...",
    locationError: "स्थान त्रुटि",
    locationPermissionDenied: "स्थान तक पहुँचने की अनुमति नहीं दी गई",
    success: "सफलता",
    error: "त्रुटि",
    warning: "चेतावनी",
    cameraPermission: "कैमरा अनुमति आवश्यक है",
    galleryPermission: "गैलरी अनुमति आवश्यक है",
    uploadFailed: "छवि अपलोड विफल",
    profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट हुई!",
    addressAdded: "पता सफलतापूर्वक जोड़ा गया!",
    passwordChanged: "पासवर्ड सफलतापूर्वक बदला गया!",
    photoUpdated: "प्रोफ़ाइल फ़ोटो अपडेट हुई",
    fillAllFields: "कृपया सभी फ़ील्ड भरें",
    limitReached: "आप केवल 3 पते सहेज सकते हैं।",
    deleteAddress: "पता हटाएं",
    deleteConfirm: "क्या आप वाकई इस पते को हटाना चाहते हैं?",
    logoutConfirm: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
    languageChanged: "ऐप भाषा सेट हो गई",
    copied: "कॉपी हो गया!",
    copyCode: "रेफरल कोड क्लिपबोर्ड पर कॉपी हो गया",
    invalidAmount: "अमान्य राशि",
    enterValidAmount: "कृपया मान्य राशि दर्ज करें",
    nameRequired: "नाम आवश्यक है",
    nameMinLength: "नाम कम से कम 3 अक्षर का होना चाहिए",
    emailRequired: "ईमेल आवश्यक है",
    emailInvalid: "मान्य ईमेल दर्ज करें",
    phoneRequired: "फ़ोन आवश्यक है",
    phoneInvalid: "मान्य 10-अंकीय फ़ोन दर्ज करें",
    fixErrors: "त्रुटियां सुधारें",
    pleaseCorrect: "कृपया हाइलाइट किए गए फ़ील्ड सुधारें।",
    currentPassword: "वर्तमान पासवर्ड",
    newPassword: "नया पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    passwordRequired: "पासवर्ड आवश्यक है",
    passwordMinLength: "पासवर्ड कम से कम 6 अक्षर का होना चाहिए",
    passwordMismatch: "पासवर्ड मेल नहीं खाते",
    passwordIncorrect: "वर्तमान पासवर्ड गलत है",
    referralTitle: "रेफर करें और कमाएं",
    referralMessage: "अपना रेफरल कोड शेयर करें: CHHAVI123\n\nआपके दोस्त को पहले ऑर्डर पर ₹100 की छूट\nजब वे अपना पहला ऑर्डर पूरा करेंगे तो आपको ₹100 मिलेंगे",
    copyCode: "कोड कॉपी करें",
    share: "शेयर करें",
    addMoneyTitle: "वॉलेट में पैसे जोड़ें",
    enterAmount: "जोड़ने के लिए राशि दर्ज करें:",
    loadingProfile: "प्रोफ़ाइल लोड हो रही है...",
    whatsappNotInstalled: "इस डिवाइस पर WhatsApp इंस्टॉल नहीं है।",
    callNotAvailable: "इस डिवाइस पर कॉल नहीं किया जा सकता।",
  },

  mr: {
    editProfile: "प्रोफाइल संपादित करा",
    accountInfo: "खात्याची माहिती",
    email: "ईमेल",
    phone: "फोन",
    changePassword: "पासवर्ड बदला",
    savedAddresses: "जतन केलेले पत्ते",
    addNew: "नवीन जोडा",
    noAddresses: "कोणताही पत्ता जतन केलेला नाही",
    noAddressesSub: "ऑर्डर सुरू करण्यासाठी तुमचा पहिला पत्ता जोडा",
    addAddress: "पत्ता जोडा",
    default: "डीफॉल्ट",
    setDefault: "डीफॉल्ट सेट करा",
    youCanAdd: "तुम्ही",
    moreAddress: "आणखी एक पत्ता जोडू शकता",
    moreAddresses: "आणखी पत्ते जोडू शकता",
    ordersWallet: "ऑर्डर आणि वॉलेट",
    myOrders: "माझे ऑर्डर",
    viewAllOrders: "सर्व ऑर्डर पहा",
    wallet: "वॉलेट",
    balance: "शिल्लक",
    addMoney: "पैसे जोडा",
    referEarn: "रेफर करा आणि कमवा",
    earnPerReferral: "प्रति रेफरल ₹100 कमवा",
    preferences: "प्राधान्ये",
    notifications: "सूचना",
    notificationSub: "ऑर्डर अपडेट मिळवा",
    darkMode: "डार्क मोड",
    enabled: "सक्षम",
    disabled: "अक्षम",
    language: "भाषा",
    helpSupport: "मदत",
    helpCenter: "मदत केंद्र",
    contactUs: "संपर्क करा",
    contactSub: "24/7 ग्राहक सहाय्य",
    termsPrivacy: "अटी आणि गोपनीयता",
    appVersion: "अॅप आवृत्ती",
    logout: "लॉगआउट",
    cancel: "रद्द करा",
    save: "जतन करा",
    saveChanges: "बदल जतन करा",
    delete: "हटवा",
    selectLanguage: "भाषा निवडा",
    searchLanguage: "भाषा शोधा...",
    noLanguages: "कोणतीही भाषा सापडली नाही",
    addNewAddress: "नवीन पत्ता जोडा",
    addressType: "पत्त्याचा प्रकार",
    home: "घर",
    work: "कार्यालय",
    other: "इतर",
    addressName: "पत्त्याचे नाव (उदा., घर, कार्यालय)",
    fullAddress: "पूर्ण पत्ता",
    phoneNumber: "फोन नंबर",
    setAsDefault: "डीफॉल्ट पत्ता म्हणून सेट करा",
    saveAddress: "पत्ता जतन करा",
    selectLiveLocation: "थेट स्थान निवडा",
    fetchingLocation: "पत्ता शोधत आहे...",
    locationError: "स्थान त्रुटी",
    locationPermissionDenied: "स्थान ॲक्सेस करण्याची परवानगी नाकारली गेली",
    success: "यशस्वी",
    error: "त्रुटी",
    warning: "चेतावणी",
    cameraPermission: "कॅमेरा परवानगी आवश्यक आहे",
    galleryPermission: "गॅलरी परवानगी आवश्यक आहे",
    uploadFailed: "प्रतिमा अपलोड अयशस्वी",
    profileUpdated: "प्रोफाइल यशस्वीरित्या अपडेट झाले!",
    addressAdded: "पत्ता यशस्वीरित्या जोडला गेला!",
    passwordChanged: "पासवर्ड यशस्वीरित्या बदलला गेला!",
    photoUpdated: "प्रोफाइल फोटो अपडेट झाला",
    fillAllFields: "कृपया सर्व फील्ड भरा",
    limitReached: "तुम्ही फक्त 3 पत्ते जतन करू शकता.",
    deleteAddress: "पत्ता हटवा",
    deleteConfirm: "तुम्हाला खात्री आहे की हा पत्ता हटवायचा आहे?",
    logoutConfirm: "तुम्हाला खात्री आहे की लॉगआउट करायचे आहे?",
    languageChanged: "अॅप भाषा सेट झाली",
    copied: "कॉपी झाले!",
    copyCode: "रेफरल कोड क्लिपबोर्डवर कॉपी झाला",
    invalidAmount: "अवैध रक्कम",
    enterValidAmount: "कृपया वैध रक्कम प्रविष्ट करा",
    nameRequired: "नाव आवश्यक आहे",
    nameMinLength: "नाव किमान 3 अक्षरांचे असावे",
    emailRequired: "ईमेल आवश्यक आहे",
    emailInvalid: "वैध ईमेल प्रविष्ट करा",
    phoneRequired: "फोन आवश्यक आहे",
    phoneInvalid: "वैध 10-अंकी फोन प्रविष्ट करा",
    fixErrors: "त्रुटी सुधारा",
    pleaseCorrect: "कृपया हायलाइट केलेल्या फील्ड सुधारा.",
    currentPassword: "सध्याचा पासवर्ड",
    newPassword: "नवीन पासवर्ड",
    confirmPassword: "पासवर्डची पुष्टी करा",
    passwordRequired: "पासवर्ड आवश्यक आहे",
    passwordMinLength: "पासवर्ड किमान 6 अक्षरांचा असावा",
    passwordMismatch: "पासवर्ड जुळत नाहीत",
    passwordIncorrect: "सध्याचा पासवर्ड चुकीचा आहे",
    referralTitle: "रेफर करा आणि कमवा",
    referralMessage: "तुमचा रेफरल कोड शेअर करा: CHHAVI123\n\nतुमच्या मित्राला पहिल्या ऑर्डरवर ₹100 सूट\nजेव्हा ते पहिली ऑर्डर पूर्ण करतील तेव्हा तुम्हाला ₹100 मिळतील",
    copyCode: "कोड कॉपी करा",
    share: "शेअर करा",
    addMoneyTitle: "वॉलेटमध्ये पैसे जोडा",
    enterAmount: "जोडण्यासाठी रक्कम प्रविष्ट करा:",
    loadingProfile: "प्रोफाइल लोड होत आहे...",
    whatsappNotInstalled: "या डिव्हाइसवर WhatsApp इंस्टॉल केलेले नाही.",
    callNotAvailable: "या डिव्हाइसवर कॉल करणे शक्य नाही.",
  },

  te: {
    editProfile: "ప్రొఫైల్‌ను సవరించండి",
    accountInfo: "ఖాతా సమాచారం",
    email: "ఇమెయిల్",
    phone: "ఫోన్",
    changePassword: "పాస్‌వర్డ్ మార్చండి",
    savedAddresses: "సేవ్ చేసిన చిరునామాలు",
    addNew: "కొత్తది జోడించండి",
    noAddresses: "చిరునామాలు సేవ్ చేయబడలేదు",
    noAddressesSub: "ఆర్డర్ చేయడం ప్రారంభించడానికి మీ మొదటి చిరునామాను జోడించండి",
    addAddress: "చిరునామా జోడించండి",
    default: "డిఫాల్ట్",
    setDefault: "డిఫాల్ట్‌గా సెట్ చేయండి",
    youCanAdd: "మీరు",
    moreAddress: "మరో చిరునామా జోడించవచ్చు",
    moreAddresses: "మరిన్ని చిరునామాలు జోడించవచ్చు",
    ordersWallet: "ఆర్డర్లు & వాలెట్",
    myOrders: "నా ఆర్డర్లు",
    viewAllOrders: "అన్ని ఆర్డర్లు చూడండి",
    wallet: "వాలెట్",
    balance: "బ్యాలెన్స్",
    addMoney: "డబ్బు జోడించండి",
    referEarn: "రెఫర్ & సంపాదించండి",
    earnPerReferral: "ప్రతి రెఫరల్‌కు ₹100 సంపాదించండి",
    preferences: "ప్రాధాన్యతలు",
    notifications: "నోటిఫికేషన్లు",
    notificationSub: "ఆర్డర్ అప్‌డేట్‌లను స్వీకరించండి",
    darkMode: "డార్క్ మోడ్",
    enabled: "ప్రారంభించబడింది",
    disabled: "నిలిపివేయబడింది",
    language: "భాష",
    helpSupport: "సహాయం",
    helpCenter: "సహాయ కేంద్రం",
    contactUs: "మమ్మల్ని సంప్రదించండి",
    contactSub: "24/7 కస్టమర్ సపోర్ట్",
    termsPrivacy: "నిబంధనలు & గోప్యత",
    appVersion: "యాప్ వెర్షన్",
    logout: "లాగ్అవుట్",
    cancel: "రద్దు చేయండి",
    save: "సేవ్ చేయండి",
    saveChanges: "మార్పులను సేవ్ చేయండి",
    delete: "తొలగించండి",
    selectLanguage: "భాషను ఎంచుకోండి",
    searchLanguage: "భాష కోసం వెతకండి...",
    noLanguages: "భాషలు కనుగొనబడలేదు",
    addNewAddress: "కొత్త చిరునామా జోడించండి",
    addressType: "చిరునామా రకం",
    home: "హోమ్",
    work: "వర్క్",
    other: "ఇతర",
    addressName: "చిరునామా పేరు (ఉదా., హోమ్, ఆఫీస్)",
    fullAddress: "పూర్తి చిరునామా",
    phoneNumber: "ఫోన్ నంబర్",
    setAsDefault: "డిఫాల్ట్ చిరునామాగా సెట్ చేయండి",
    saveAddress: "చిరునామా సేవ్ చేయండి",
    selectLiveLocation: "లైవ్ లొకేషన్‌ను ఎంచుకోండి",
    fetchingLocation: "చిరునామాను పొందుతోంది...",
    locationError: "లొకేషన్ లోపం",
    locationPermissionDenied: "లొకేషన్ యాక్సెస్ చేయడానికి అనుమతి నిరాకరించబడింది",
    success: "విజయం",
    error: "లోపం",
    warning: "హెచ్చరిక",
    cameraPermission: "కెమెరా అనుమతి అవసరం",
    galleryPermission: "గ్యాలరీ అనుమతి అవసరం",
    uploadFailed: "చిత్రం అప్‌లోడ్ విఫలమైంది",
    profileUpdated: "ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది!",
    addressAdded: "చిరునామా విజయవంతంగా జోడించబడింది!",
    passwordChanged: "పాస్‌వర్డ్ విజయవంతంగా మార్చబడింది!",
    photoUpdated: "ప్రొఫైల్ ఫోటో నవీకరించబడింది",
    fillAllFields: "దయచేసి అన్ని ఫీల్డ్‌లను పూరించండి",
    limitReached: "మీరు 3 చిరునామాలు మాత్రమే సేవ్ చేయగలరు.",
    deleteAddress: "చిరునామాను తొలగించండి",
    deleteConfirm: "మీరు ఈ చిరునామాను తొలగించాలనుకుంటున్నారా?",
    logoutConfirm: "మీరు లాగ్అవుట్ చేయాలనుకుంటున్నారా?",
    languageChanged: "యాప్ భాష సెట్ చేయబడింది",
    copied: "కాపీ చేయబడింది!",
    copyCode: "రెఫరల్ కోడ్ క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది",
    invalidAmount: "చెల్లని మొత్తం",
    enterValidAmount: "దయచేసి చెల్లుబాటు అయ్యే మొత్తాన్ని నమోదు చేయండి",
    nameRequired: "పేరు అవసరం",
    nameMinLength: "పేరు కనీసం 3 అక్షరాలతో ఉండాలి",
    emailRequired: "ఇమెయిల్ అవసరం",
    emailInvalid: "చెల్లుబాటు అయ్యే ఇమెయిల్‌ను నమోదు చేయండి",
    phoneRequired: "ఫోన్ అవసరం",
    phoneInvalid: "చెల్లుబాటు అయ్యే 10-అంకెల ఫోన్‌ను నమోదు చేయండి",
    fixErrors: "లోపాలను సరిచేయండి",
    pleaseCorrect: "దయచేసి హైలైట్ చేయబడిన ఫీల్డ్‌లను సరిచేయండి.",
    currentPassword: "ప్రస్తుత పాస్‌వర్డ్",
    newPassword: "కొత్త పాస్‌వర్డ్",
    confirmPassword: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    passwordRequired: "పాస్‌వర్డ్ అవసరం",
    passwordMinLength: "పాస్‌వర్డ్ కనీసం 6 అక్షరాలతో ఉండాలి",
    passwordMismatch: "పాస్‌వర్డ్‌లు సరిపోలడం లేదు",
    passwordIncorrect: "ప్రస్తుత పాస్‌వర్డ్ తప్పు",
    referralTitle: "రెఫర్ & సంపాదించండి",
    referralMessage: "మీ రెఫరల్ కోడ్‌ను షేర్ చేయండి: CHHAVI123\n\nమీ స్నేహితుడికి మొదటి ఆర్డర్‌పై ₹100 తగ్గింపు\nవారు మొదటి ఆర్డర్ పూర్తి చేసినప్పుడు మీకు ₹100 లభిస్తాయి",
    copyCode: "కోడ్‌ను కాపీ చేయండి",
    share: "షేర్ చేయండి",
    addMoneyTitle: "వాలెట్‌లో డబ్బు జోడించండి",
    enterAmount: "జోడించడానికి మొత్తాన్ని నమోదు చేయండి:",
    loadingProfile: "ప్రొఫైల్ లోడ్ అవుతోంది...",
    whatsappNotInstalled: "ఈ పరికరంలో WhatsApp ఇన్‌స్టాల్ చేయబడలేదు.",
    callNotAvailable: "ఈ పరికరంలో కాల్ చేయడం సాధ్యం కాదు.",
  },

  gu: {
    editProfile: "પ્રોફાઇલ સંપાદિત કરો",
    accountInfo: "એકાઉન્ટ માહિતી",
    email: "ઇમેઇલ",
    phone: "ફોન",
    changePassword: "પાસવર્ડ બદલો",
    savedAddresses: "સાચવેલા સરનામાં",
    addNew: "નવું ઉમેરો",
    noAddresses: "કોઈ સરનામું સાચવેલ નથી",
    noAddressesSub: "ઓર્ડર શરૂ કરવા માટે તમારું પ્રથમ સરનામું ઉમેરો",
    addAddress: "સરનામું ઉમેરો",
    default: "ડિફોલ્ટ",
    setDefault: "ડિફોલ્ટ તરીકે સેટ કરો",
    youCanAdd: "તમે",
    moreAddress: "વધુ એક સરનામું ઉમેરી શકો છો",
    moreAddresses: "વધુ સરનામાં ઉમેરી શકો છો",
    ordersWallet: "ઓર્ડર અને વોલેટ",
    myOrders: "મારા ઓર્ડર",
    viewAllOrders: "બધા ઓર્ડર જુઓ",
    wallet: "વોલેટ",
    balance: "બેલેન્સ",
    addMoney: "પૈસા ઉમેરો",
    referEarn: "રેફર અને કમાઓ",
    earnPerReferral: "દરેક રેફરલ પર ₹100 કમાઓ",
    preferences: "પસંદગીઓ",
    notifications: "સૂચનાઓ",
    notificationSub: "ઓર્ડર અપડેટ્સ પ્રાપ્ત કરો",
    darkMode: "ડાર્ક મોડ",
    enabled: "સક્ષમ",
    disabled: "અક્ષમ",
    language: "ભાષા",
    helpSupport: "મદદ",
    helpCenter: "મદદ કેન્દ્ર",
    contactUs: "અમારો સંપર્ક કરો",
    contactSub: "24/7 ગ્રાહક સહાય",
    termsPrivacy: "શરતો અને ગોપનીયતા",
    appVersion: "એપ વર્ઝન",
    logout: "લૉગઆઉટ",
    cancel: "રદ કરો",
    save: "સાચવો",
    saveChanges: "ફેરફારો સાચવો",
    delete: "કાઢી નાખો",
    selectLanguage: "ભાષા પસંદ કરો",
    searchLanguage: "ભાષા શોધો...",
    noLanguages: "કોઈ ભાષા મળી નથી",
    addNewAddress: "નવું સરનામું ઉમેરો",
    addressType: "સરનામાનો પ્રકાર",
    home: "ઘર",
    work: "કાર્યાલય",
    other: "અન્ય",
    addressName: "સરનામાનું નામ (દા.ત., ઘર, કાર્યાલય)",
    fullAddress: "સંપૂર્ણ સરનામું",
    phoneNumber: "ફોન નંબર",
    setAsDefault: "ડિફોલ્ટ સરનામા તરીકે સેટ કરો",
    saveAddress: "સરનામું સાચવો",
    selectLiveLocation: "લાઇવ લોકેશન પસંદ કરો",
    fetchingLocation: "સરનામું મેળવી રહ્યું છે...",
    locationError: "લોકેશન ભૂલ",
    locationPermissionDenied: "લોકેશન ઍક્સેસ કરવાની પરવાનગી નકારવામાં આવી",
    success: "સફળતા",
    error: "ભૂલ",
    warning: "ચેતવણી",
    cameraPermission: "કેમેરા પરવાનગી આવશ્યક છે",
    galleryPermission: "ગેલેરી પરવાનગી આવશ્યક છે",
    uploadFailed: "છબી અપલોડ નિષ્ફળ",
    profileUpdated: "પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ!",
    addressAdded: "સરનામું સફળતાપૂર્વક ઉમેરાયું!",
    passwordChanged: "પાસવર્ડ સફળતાપૂર્વક બદલાયો!",
    photoUpdated: "પ્રોફાઇલ ફોટો અપડેટ થયો",
    fillAllFields: "કૃપા કરીને બધા ક્ષેત્રો ભરો",
    limitReached: "તમે ફક્ત 3 સરનામાં સાચવી શકો છો.",
    deleteAddress: "સરનામું કાઢી નાખો",
    deleteConfirm: "શું તમે ખરેખર આ સરનામું કાઢી નાખવા માંગો છો?",
    logoutConfirm: "શું તમે ખરેખર લૉગઆઉટ કરવા માંગો છો?",
    languageChanged: "એપ ભાષા સેટ થઈ",
    copied: "કૉપિ થયું!",
    copyCode: "રેફરલ કોડ ક્લિપબોર્ડ પર કૉપિ થયો",
    invalidAmount: "અમાન્ય રકમ",
    enterValidAmount: "કૃપા કરીને માન્ય રકમ દાખલ કરો",
    nameRequired: "નામ આવશ્યક છે",
    nameMinLength: "નામ ઓછામાં ઓછા 3 અક્ષરોનું હોવું જોઈએ",
    emailRequired: "ઇમેઇલ આવશ્યક છે",
    emailInvalid: "માન્ય ઇમેઇલ દાખલ કરો",
    phoneRequired: "ફોન આવશ્યક છે",
    phoneInvalid: "માન્ય 10-અંકનો ફોન દાખલ કરો",
    fixErrors: "ભૂલો સુધારો",
    pleaseCorrect: "કૃપા કરીને હાઇલાઇટ કરેલા ક્ષેત્રો સુધારો.",
    currentPassword: "વર્તમાન પાસવર્ડ",
    newPassword: "નવો પાસવર્ડ",
    confirmPassword: "પાસવર્ડની પુષ્ટિ કરો",
    passwordRequired: "પાસવર્ડ આવશ્યક છે",
    passwordMinLength: "પાસવર્ડ ઓછામાં ઓછા 6 અક્ષરોનો હોવો જોઈએ",
    passwordMismatch: "પાસવર્ડ મેળ ખાતા નથી",
    passwordIncorrect: "વર્તમાન પાસવર્ડ ખોટો છે",
    referralTitle: "રેફર અને કમાઓ",
    referralMessage: "તમારો રેફરલ કોડ શેર કરો: CHHAVI123\n\nતમારા મિત્રને પ્રથમ ઓર્ડર પર ₹100 ની છૂટ\nજ્યારે તેઓ પ્રથમ ઓર્ડર પૂર્ણ કરે ત્યારે તમને ₹100 મળશે",
    copyCode: "કોડ કૉપિ કરો",
    share: "શેર કરો",
    addMoneyTitle: "વોલેટમાં પૈસા ઉમેરો",
    enterAmount: "ઉમેરવા માટે રકમ દાખલ કરો:",
    loadingProfile: "પ્રોફાઇલ લોડ થઈ રહી છે...",
    whatsappNotInstalled: "આ ઉપકરણ પર WhatsApp ઇન્સ્ટોલ કરેલ નથી.",
    callNotAvailable: "આ ઉપકરણ પર કૉલ કરવો શક્ય નથી.",
  },
};

export default function ProfileScreen() {
  const { colors, mode, toggle } = useTheme();
  const { isLoggedIn } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth/login");
    }
  }, [isLoggedIn]);

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
      // Load addresses
      const savedAddresses = await AsyncStorage.getItem('userAddresses');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
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
    if (!user) return;
    setEditingUser({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    });
    setShowEditModal(true);
  };

  const handleChangeAvatar = () => {
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
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    saveAddresses(updatedAddresses);
  };

  const handleDeleteAddress = (id: string) => {
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
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("userInfo");
            await AsyncStorage.removeItem("userAddresses");
            await AsyncStorage.removeItem("appLanguage");
            router.replace("/auth/login");
          },
        },
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
    router.push({
      pathname: "/order",
      params: { userId: user?._id },
    });
  };

  const handleReferral = () => {
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

  useEffect(() => {
    console.log("PROFILE SCREEN MOUNTED ✅");
    fetchProfile();
  }, []);

  useFocusEffect(
  useCallback(() => {
    fetchProfile();
  }, [])
);

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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ PROFILE DATA:", response.data);
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.log("❌ PROFILE ERROR:", error.response?.data || error.message);
      setLoading(false);
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

  return (
    <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={dynamicStyles.header}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.initialsAvatar, { backgroundColor: "#FFF3E0" }]}>
              <Text style={styles.initialsText}>{getInitials(user?.name)}</Text>
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
});