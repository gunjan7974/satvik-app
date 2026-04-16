import React, { useRef, useState, useEffect } from "react";
import { BASE_URL } from "../../config/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Animated,
  FlatList,
  Alert,
  BackHandler,
} from "react-native";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { ListRenderItem } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../data/ThemeContext";
import { useAuth } from "../data/AuthContext"; // 👈 Import useAuth

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;

// ---------------- TYPES ----------------
type EventType = {
  _id: string;
  name: string;
  basePrice: number;
  icon?: string;
};

type PartyHall = {
  _id: string;
  name: string;
  capacity: number;
  price: number;
  description: string;
  features: string[];
  image: string;
  color: string;
};

type Service = {
  _id: string;
  title: string;
  description: string;
  icon: string;
  price: number;
  selected: boolean;
};

type BookingForm = {
  eventType: string;
  date: Date;
  guests: string;
  name: string;
  email: string;
  phone: string;
  specialRequirements: string;
  budget: string;
  selectedHall: string;
  selectedServices: Service[];
  totalCost: number;
};

// 🔥 TRANSLATIONS FOR 5 LANGUAGES (English, Hindi, Marathi, Tamil, Gujarati)
const translations = {
  en: {
    // Screen
    loading: "Loading Events...",
    bookEvent: "Book Your Event",
    heroDesc: "Ready to plan your special celebration? Let us make it memorable!",

    // Sections
    chooseEventType: "Choose Event Type",
    selectEventSub: "Select from our curated event categories",
    whatWeOffer: "What We Offer",
    offerSub: "Complete event planning services",
    readyToBook: "Ready to Book Your Event?",
    contactSpecialists: "Have questions or ready to get started? Contact our event specialists today!",
    bookNow: "Book Event Now",

    // Event Types
    selectThisEvent: "Select This Event",
    startingFrom: "Starting from",

    // Halls
    selectPartyHall: "Select Party Hall",
    chooseVenue: "Choose the perfect venue for your event",
    capacity: "Capacity",
    people: "people",
    perDay: "per day",
    selectHall: "Select Hall",
    selected: "Selected",

    // Services
    additionalServices: "Additional Services",
    customizeEvent: "Customize your event with our premium services",
    totalEstimated: "Total Estimated Cost:",

    // Form
    eventDetails: "Event Details",
    eventType: "Event Type *",
    date: "Date *",
    selectDate: "Select date",
    guests: "Guests *",
    guestPlaceholder: "e.g., 50",
    contactInfo: "Contact Information",
    fullName: "Full Name *",
    namePlaceholder: "Enter your name",
    email: "Email *",
    emailPlaceholder: "email@example.com",
    phone: "Phone *",
    phonePlaceholder: "9876543210",
    specialRequirements: "Special Requirements",
    requirementsPlaceholder: "Any special requests or requirements...",
    budget: "Budget (Optional)",
    budgetPlaceholder: "e.g., ₹50,000",

    // Review
    reviewBooking: "Review Your Booking",
    eventSummary: "Event Summary",
    eventTypeLabel: "Event Type:",
    dateLabel: "Date:",
    guestsLabel: "Guests:",
    notSpecified: "Not specified",
    selectedHall: "Selected Hall:",
    notSelected: "Not selected",
    servicesLabel: "Services:",
    none: "None",
    totalCost: "Total Cost:",
    contactLabel: "Contact:",
    emailLabel: "Email:",
    phoneLabel: "Phone:",
    toBeDecided: "To be decided",
    note: "Our team will contact you within 24 hours to confirm details.",

    // Steps
    stepEvent: "Event",
    stepHall: "Hall",
    stepContact: "Contact",
    stepReview: "Review",

    // Buttons
    back: "Back",
    next: "Next",
    submit: "Submit",
    close: "Close",

    // Alerts
    error: "Error",
    success: "Success",
    pleaseLogin: "Please login first",
    bookingFailed: "Booking failed",
    bookingSuccess: "Booking Created Successfully!",
    somethingWentWrong: "Something went wrong",
    selectEventFirst: "Please select an event type",
    selectHallFirst: "Please select a party hall",
    fillContactInfo: "Please fill all required contact information",

    // 👇 Guest user messages
    guestWarning: "Guest users cannot book events",
    guestWarningDesc: "Please login to book events and access all features",
    loginRequired: "Login Required",
    login: "Login",
    cancel: "Cancel",
    browseEvents: "Browse Events",

    // Months
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",
  },

  hi: {
    loading: "इवेंट लोड हो रहे हैं...",
    bookEvent: "अपना इवेंट बुक करें",
    heroDesc: "अपने विशेष उत्सव की योजना बनाने के लिए तैयार हैं? इसे यादगार बनाएं!",
    chooseEventType: "इवेंट प्रकार चुनें",
    selectEventSub: "हमारी चयनित इवेंट श्रेणियों में से चुनें",
    whatWeOffer: "हम क्या प्रदान करते हैं",
    offerSub: "संपूर्ण इवेंट प्लानिंग सेवाएं",
    readyToBook: "अपना इवेंट बुक करने के लिए तैयार हैं?",
    contactSpecialists: "सवाल हैं या शुरू करने के लिए तैयार हैं? आज ही हमारे इवेंट विशेषज्ञों से संपर्क करें!",
    bookNow: "अभी इवेंट बुक करें",
    selectThisEvent: "यह इवेंट चुनें",
    startingFrom: "शुरुआती कीमत",
    selectPartyHall: "पार्टी हॉल चुनें",
    chooseVenue: "अपने इवेंट के लिए सही स्थान चुनें",
    capacity: "क्षमता",
    people: "लोग",
    perDay: "प्रति दिन",
    selectHall: "हॉल चुनें",
    selected: "चयनित",
    additionalServices: "अतिरिक्त सेवाएं",
    customizeEvent: "हमारी प्रीमियम सेवाओं के साथ अपने इवेंट को कस्टमाइज़ करें",
    totalEstimated: "अनुमानित कुल लागत:",
    eventDetails: "इवेंट विवरण",
    eventType: "इवेंट प्रकार *",
    date: "तारीख *",
    selectDate: "तारीख चुनें",
    guests: "मेहमान *",
    guestPlaceholder: "जैसे, 50",
    contactInfo: "संपर्क जानकारी",
    fullName: "पूरा नाम *",
    namePlaceholder: "अपना नाम दर्ज करें",
    email: "ईमेल *",
    emailPlaceholder: "email@example.com",
    phone: "फोन *",
    phonePlaceholder: "9876543210",
    specialRequirements: "विशेष आवश्यकताएं",
    requirementsPlaceholder: "कोई विशेष अनुरोध या आवश्यकताएं...",
    budget: "बजट (वैकल्पिक)",
    budgetPlaceholder: "जैसे, ₹50,000",
    reviewBooking: "अपनी बुकिंग की समीक्षा करें",
    eventSummary: "इवेंट सारांश",
    eventTypeLabel: "इवेंट प्रकार:",
    dateLabel: "तारीख:",
    guestsLabel: "मेहमान:",
    notSpecified: "निर्दिष्ट नहीं",
    selectedHall: "चयनित हॉल:",
    notSelected: "चयनित नहीं",
    servicesLabel: "सेवाएं:",
    none: "कोई नहीं",
    totalCost: "कुल लागत:",
    contactLabel: "संपर्क:",
    emailLabel: "ईमेल:",
    phoneLabel: "फोन:",
    toBeDecided: "तय होना बाकी",
    note: "हमारी टीम पुष्टि के लिए 24 घंटे के भीतर आपसे संपर्क करेगी।",
    stepEvent: "इवेंट",
    stepHall: "हॉल",
    stepContact: "संपर्क",
    stepReview: "समीक्षा",
    back: "वापस",
    next: "अगला",
    submit: "जमा करें",
    close: "बंद करें",
    error: "त्रुटि",
    success: "सफलता",
    pleaseLogin: "कृपया पहले लॉगिन करें",
    bookingFailed: "बुकिंग विफल",
    bookingSuccess: "बुकिंग सफलतापूर्वक बनाई गई!",
    somethingWentWrong: "कुछ गलत हो गया",
    selectEventFirst: "कृपया एक इवेंट प्रकार चुनें",
    selectHallFirst: "कृपया एक पार्टी हॉल चुनें",
    fillContactInfo: "कृपया सभी आवश्यक संपर्क जानकारी भरें",

    // 👇 Guest user messages
    guestWarning: "मेहमान उपयोगकर्ता इवेंट बुक नहीं कर सकते",
    guestWarningDesc: "इवेंट बुक करने और सभी सुविधाओं का उपयोग करने के लिए कृपया लॉगिन करें",
    loginRequired: "लॉगिन आवश्यक",
    login: "लॉगिन",
    cancel: "रद्द करें",
    browseEvents: "इवेंट ब्राउज़ करें",

    january: "जनवरी",
    february: "फरवरी",
    march: "मार्च",
    april: "अप्रैल",
    may: "मई",
    june: "जून",
    july: "जुलाई",
    august: "अगस्त",
    september: "सितंबर",
    october: "अक्टूबर",
    november: "नवंबर",
    december: "दिसंबर",
  },

  mr: {
    loading: "इव्हेंट लोड होत आहेत...",
    bookEvent: "तुमचा इव्हेंट बुक करा",
    heroDesc: "तुमच्या खास उत्सवाची योजना करण्यासाठी सज्ज आहात? तो संस्मरणीय बनवा!",
    chooseEventType: "इव्हेंट प्रकार निवडा",
    selectEventSub: "आमच्या क्युरेटेड इव्हेंट श्रेणींमधून निवडा",
    whatWeOffer: "आम्ही काय ऑफर करतो",
    offerSub: "संपूर्ण इव्हेंट प्लॅनिंग सेवा",
    readyToBook: "तुमचा इव्हेंट बुक करण्यासाठी सज्ज आहात?",
    contactSpecialists: "प्रश्न आहेत किंवा सुरू करण्यासाठी सज्ज आहात? आजच आमच्या इव्हेंट तज्ञांशी संपर्क साधा!",
    bookNow: "आताच इव्हेंट बुक करा",
    selectThisEvent: "हा इव्हेंट निवडा",
    startingFrom: "सुरुवातीची किंमत",
    selectPartyHall: "पार्टी हॉल निवडा",
    chooseVenue: "तुमच्या इव्हेंटसाठी योग्य स्थान निवडा",
    capacity: "क्षमता",
    people: "लोक",
    perDay: "प्रतिदिन",
    selectHall: "हॉल निवडा",
    selected: "निवडले",
    additionalServices: "अतिरिक्त सेवा",
    customizeEvent: "आमच्या प्रीमियम सेवांसह तुमचा इव्हेंट सानुकूलित करा",
    totalEstimated: "एकूण अंदाजित खर्च:",
    eventDetails: "इव्हेंट तपशील",
    eventType: "इव्हेंट प्रकार *",
    date: "तारीख *",
    selectDate: "तारीख निवडा",
    guests: "पाहुणे *",
    guestPlaceholder: "उदा., ५०",
    contactInfo: "संपर्क माहिती",
    fullName: "पूर्ण नाव *",
    namePlaceholder: "तुमचे नाव प्रविष्ट करा",
    email: "ईमेल *",
    emailPlaceholder: "email@example.com",
    phone: "फोन *",
    phonePlaceholder: "९८७६५४३२१०",
    specialRequirements: "विशेष आवश्यकता",
    requirementsPlaceholder: "कोणत्याही विशेष विनंत्या किंवा आवश्यकता...",
    budget: "बजेट (पर्यायी)",
    budgetPlaceholder: "उदा., ₹५०,०००",
    reviewBooking: "तुमच्या बुकिंगचे पुनरावलोकन करा",
    eventSummary: "इव्हेंट सारांश",
    eventTypeLabel: "इव्हेंट प्रकार:",
    dateLabel: "तारीख:",
    guestsLabel: "पाहुणे:",
    notSpecified: "निर्दिष्ट नाही",
    selectedHall: "निवडलेला हॉल:",
    notSelected: "निवडला नाही",
    servicesLabel: "सेवा:",
    none: "कोणतीही नाही",
    totalCost: "एकूण खर्च:",
    contactLabel: "संपर्क:",
    emailLabel: "ईमेल:",
    phoneLabel: "फोन:",
    toBeDecided: "ठरवायचे आहे",
    note: "आमची टीम पुष्टीसाठी २४ तासांच्या आत तुमच्याशी संपर्क साधेल.",
    stepEvent: "इव्हेंट",
    stepHall: "हॉल",
    stepContact: "संपर्क",
    stepReview: "पुनरावलोकन",
    back: "मागे",
    next: "पुढे",
    submit: "सबमिट करा",
    close: "बंद करा",
    error: "त्रुटी",
    success: "यश",
    pleaseLogin: "कृपया प्रथम लॉगिन करा",
    bookingFailed: "बुकिंग अयशस्वी",
    bookingSuccess: "बुकिंग यशस्वीरित्या तयार केले!",
    somethingWentWrong: "काहीतरी चूक झाली",
    selectEventFirst: "कृपया एक इव्हेंट प्रकार निवडा",
    selectHallFirst: "कृपया एक पार्टी हॉल निवडा",
    fillContactInfo: "कृपया सर्व आवश्यक संपर्क माहिती भरा",

    // 👇 Guest user messages
    guestWarning: "पाहुणे वापरकर्ते इव्हेंट बुक करू शकत नाहीत",
    guestWarningDesc: "इव्हेंट बुक करण्यासाठी आणि सर्व सुविधा वापरण्यासाठी कृपया लॉगिन करा",
    loginRequired: "लॉगिन आवश्यक",
    login: "लॉगिन",
    cancel: "रद्द करा",
    browseEvents: "इव्हेंट ब्राउझ करा",

    january: "जानेवारी",
    february: "फेब्रुवारी",
    march: "मार्च",
    april: "एप्रिल",
    may: "मे",
    june: "जून",
    july: "जुलै",
    august: "ऑगस्ट",
    september: "सप्टेंबर",
    october: "ऑक्टोबर",
    november: "नोव्हेंबर",
    december: "डिसेंबर",
  },

  ta: {
    loading: "நிகழ்வுகள் ஏற்றப்படுகின்றன...",
    bookEvent: "உங்கள் நிகழ்வை பதிவு செய்யுங்கள்",
    heroDesc: "உங்கள் சிறப்பு கொண்டாட்டத்தை திட்டமிட தயாரா? அதை மறக்க முடியாததாக மாற்றுங்கள்!",
    chooseEventType: "நிகழ்வு வகையை தேர்வு செய்யவும்",
    selectEventSub: "எங்கள் தேர்ந்தெடுக்கப்பட்ட நிகழ்வு வகைகளிலிருந்து தேர்வு செய்யவும்",
    whatWeOffer: "நாங்கள் வழங்குவது",
    offerSub: "முழுமையான நிகழ்வு திட்டமிடல் சேவைகள்",
    readyToBook: "உங்கள் நிகழ்வை பதிவு செய்ய தயாரா?",
    contactSpecialists: "கேள்விகள் உள்ளதா அல்லது தொடங்க தயாரா? இன்றே எங்கள் நிகழ்வு நிபுணர்களை தொடர்பு கொள்ளுங்கள்!",
    bookNow: "இப்போதே நிகழ்வை பதிவு செய்யுங்கள்",
    selectThisEvent: "இந்த நிகழ்வை தேர்வு செய்யவும்",
    startingFrom: "தொடக்க விலை",
    selectPartyHall: "பார்ட்டி ஹால் தேர்வு செய்யவும்",
    chooseVenue: "உங்கள் நிகழ்வுக்கான சரியான இடத்தை தேர்வு செய்யவும்",
    capacity: "கொள்ளளவு",
    people: "மக்கள்",
    perDay: "ஒரு நாளைக்கு",
    selectHall: "ஹால் தேர்வு",
    selected: "தேர்வு செய்யப்பட்டது",
    additionalServices: "கூடுதல் சேவைகள்",
    customizeEvent: "எங்கள் பிரீமியம் சேவைகளுடன் உங்கள் நிகழ்வை தனிப்பயனாக்குங்கள்",
    totalEstimated: "மொத்த மதிப்பீட்டு செலவு:",
    eventDetails: "நிகழ்வு விவரங்கள்",
    eventType: "நிகழ்வு வகை *",
    date: "தேதி *",
    selectDate: "தேதியை தேர்வு செய்யவும்",
    guests: "விருந்தினர்கள் *",
    guestPlaceholder: "எ.கா., 50",
    contactInfo: "தொடர்பு தகவல்",
    fullName: "முழு பெயர் *",
    namePlaceholder: "உங்கள் பெயரை உள்ளிடவும்",
    email: "மின்னஞ்சல் *",
    emailPlaceholder: "email@example.com",
    phone: "தொலைபேசி *",
    phonePlaceholder: "9876543210",
    specialRequirements: "சிறப்பு தேவைகள்",
    requirementsPlaceholder: "ஏதேனும் சிறப்பு கோரிக்கைகள் அல்லது தேவைகள்...",
    budget: "பட்ஜெட் (விருப்ப)",
    budgetPlaceholder: "எ.கா., ₹50,000",
    reviewBooking: "உங்கள் பதிவை மதிப்பாய்வு செய்யுங்கள்",
    eventSummary: "நிகழ்வு சுருக்கம்",
    eventTypeLabel: "நிகழ்வு வகை:",
    dateLabel: "தேதி:",
    guestsLabel: "விருந்தினர்கள்:",
    notSpecified: "குறிப்பிடப்படவில்லை",
    selectedHall: "தேர்ந்தெடுக்கப்பட்ட ஹால்:",
    notSelected: "தேர்ந்தெடுக்கப்படவில்லை",
    servicesLabel: "சேவைகள்:",
    none: "எதுவுமில்லை",
    totalCost: "மொத்த செலவு:",
    contactLabel: "தொடர்பு:",
    emailLabel: "மின்னஞ்சல்:",
    phoneLabel: "தொலைபேசி:",
    toBeDecided: "முடிவு செய்யப்பட வேண்டும்",
    note: "எங்கள் குழு உறுதிப்படுத்த 24 மணி நேரத்திற்குள் உங்களை தொடர்பு கொள்ளும்.",
    stepEvent: "நிகழ்வு",
    stepHall: "ஹால்",
    stepContact: "தொடர்பு",
    stepReview: "மதிப்பாய்வு",
    back: "பின்செல்",
    next: "அடுத்து",
    submit: "சமர்ப்பி",
    close: "மூடு",
    error: "பிழை",
    success: "வெற்றி",
    pleaseLogin: "முதலில் உள்நுழையவும்",
    bookingFailed: "பதிவு தோல்வியடைந்தது",
    bookingSuccess: "பதிவு வெற்றிகரமாக உருவாக்கப்பட்டது!",
    somethingWentWrong: "ஏதோ தவறு நடந்துள்ளது",
    selectEventFirst: "தயவுசெய்து ஒரு நிகழ்வு வகையை தேர்வு செய்யவும்",
    selectHallFirst: "தயவுசெய்து ஒரு பார்ட்டி ஹாலை தேர்வு செய்யவும்",
    fillContactInfo: "தயவுசெய்து அனைத்து தேவையான தொடர்பு தகவல்களையும் பூர்த்தி செய்யவும்",

    // 👇 Guest user messages
    guestWarning: "விருந்தினர் பயனர்கள் நிகழ்வுகளைப் பதிவு செய்ய முடியாது",
    guestWarningDesc: "நிகழ்வுகளைப் பதிவு செய்ய மற்றும் அனைத்து அம்சங்களையும் அணுக தயவுசெய்து உள்நுழையவும்",
    loginRequired: "உள்நுழைவு தேவை",
    login: "உள்நுழைக",
    cancel: "ரத்து",
    browseEvents: "நிகழ்வுகளை உலாவுக",

    january: "ஜனவரி",
    february: "பிப்ரவரி",
    march: "மார்ச்",
    april: "ஏப்ரல்",
    may: "மே",
    june: "ஜூன்",
    july: "ஜூலை",
    august: "ஆகஸ்ட்",
    september: "செப்டம்பர்",
    october: "அக்டோபர்",
    november: "நவம்பர்",
    december: "டிசம்பர்",
  },

  gu: {
    loading: "ઇવેન્ટ્સ લોડ થઈ રહ્યા છે...",
    bookEvent: "તમારો ઇવેન્ટ બુક કરો",
    heroDesc: "તમારી ખાસ ઉજવણીનું આયોજન કરવા તૈયાર છો? તેને યાદગાર બનાવો!",
    chooseEventType: "ઇવેન્ટ પ્રકાર પસંદ કરો",
    selectEventSub: "અમારી ક્યુરેટેડ ઇવેન્ટ શ્રેણીઓમાંથી પસંદ કરો",
    whatWeOffer: "અમે શું ઓફર કરીએ છીએ",
    offerSub: "સંપૂર્ણ ઇવેન્ટ પ્લાનિંગ સેવાઓ",
    readyToBook: "તમારો ઇવેન્ટ બુક કરવા તૈયાર છો?",
    contactSpecialists: "પ્રશ્નો છે અથવા શરૂ કરવા તૈયાર છો? આજે જ અમારા ઇવેન્ટ નિષ્ણાતોનો સંપર્ક કરો!",
    bookNow: "હમણાં ઇવેન્ટ બુક કરો",
    selectThisEvent: "આ ઇવેન્ટ પસંદ કરો",
    startingFrom: "શરૂઆતની કિંમત",
    selectPartyHall: "પાર્ટી હોલ પસંદ કરો",
    chooseVenue: "તમારા ઇવેન્ટ માટે યોગ્ય સ્થળ પસંદ કરો",
    capacity: "ક્ષમતા",
    people: "લોકો",
    perDay: "પ્રતિ દિવસ",
    selectHall: "હોલ પસંદ કરો",
    selected: "પસંદ થયેલ",
    additionalServices: "વધારાની સેવાઓ",
    customizeEvent: "અમારી પ્રીમિયમ સેવાઓ સાથે તમારા ઇવેન્ટને કસ્ટમાઇઝ કરો",
    totalEstimated: "કુલ અંદાજિત ખર્ચ:",
    eventDetails: "ઇવેન્ટ વિગતો",
    eventType: "ઇવેન્ટ પ્રકાર *",
    date: "તારીખ *",
    selectDate: "તારીખ પસંદ કરો",
    guests: "મહેમાનો *",
    guestPlaceholder: "દા.ત., ૫૦",
    contactInfo: "સંપર્ક માહિતી",
    fullName: "પૂરું નામ *",
    namePlaceholder: "તમારું નામ દાખલ કરો",
    email: "ઇમેઇલ *",
    emailPlaceholder: "email@example.com",
    phone: "ફોન *",
    phonePlaceholder: "૯૮૭૬૫૪૩૨૧૦",
    specialRequirements: "ખાસ જરૂરિયાતો",
    requirementsPlaceholder: "કોઈ ખાસ વિનંતીઓ અથવા જરૂરિયાતો...",
    budget: "બજેટ (વૈકલ્પિક)",
    budgetPlaceholder: "દા.ત., ₹૫૦,૦૦૦",
    reviewBooking: "તમારી બુકિંગની સમીક્ષા કરો",
    eventSummary: "ઇવેન્ટ સારાંશ",
    eventTypeLabel: "ઇવેન્ટ પ્રકાર:",
    dateLabel: "તારીખ:",
    guestsLabel: "મહેમાનો:",
    notSpecified: "સ્પષ્ટ થયેલ નથી",
    selectedHall: "પસંદ થયેલ હોલ:",
    notSelected: "પસંદ થયેલ નથી",
    servicesLabel: "સેવાઓ:",
    none: "કોઈ નહીં",
    totalCost: "કુલ ખર્ચ:",
    contactLabel: "સંપર્ક:",
    emailLabel: "ઇમેઇલ:",
    phoneLabel: "ફોન:",
    toBeDecided: "નક્કી કરવાનું બાકી",
    note: "અમારી ટીમ પુષ્ટિ માટે ૨૪ કલાકની અંદર તમારો સંપર્ક કરશે.",
    stepEvent: "ઇવેન્ટ",
    stepHall: "હોલ",
    stepContact: "સંપર્ક",
    stepReview: "સમીક્ષા",
    back: "પાછળ",
    next: "આગળ",
    submit: "સબમિટ કરો",
    close: "બંધ કરો",
    error: "ભૂલ",
    success: "સફળતા",
    pleaseLogin: "કૃપા કરીને પ્રથમ લૉગિન કરો",
    bookingFailed: "બુકિંગ નિષ્ફળ",
    bookingSuccess: "બુકિંગ સફળતાપૂર્વક બનાવાયું!",
    somethingWentWrong: "કંઈક ખોટું થયું",
    selectEventFirst: "કૃપા કરીને ઇવેન્ટ પ્રકાર પસંદ કરો",
    selectHallFirst: "કૃપા કરીને પાર્ટી હોલ પસંદ કરો",
    fillContactInfo: "કૃપા કરીને બધી જરૂરી સંપર્ક માહિતી ભરો",

    // 👇 Guest user messages
    guestWarning: "મહેમાન વપરાશકર્તાઓ ઇવેન્ટ બુક કરી શકતા નથી",
    guestWarningDesc: "ઇવેન્ટ બુક કરવા અને બધી સુવિધાઓનો ઉપયોગ કરવા માટે કૃપા કરીને લોગિન કરો",
    loginRequired: "લોગિન આવશ્યક છે",
    login: "લોગિન",
    cancel: "રદ કરો",
    browseEvents: "ઇવેન્ટ્સ બ્રાઉઝ કરો",

    january: "જાન્યુઆરી",
    february: "ફેબ્રુઆરી",
    march: "માર્ચ",
    april: "એપ્રિલ",
    may: "મે",
    june: "જૂન",
    july: "જુલાઈ",
    august: "ઓગસ્ટ",
    september: "સપ્ટેમ્બર",
    october: "ઑક્ટોબર",
    november: "નવેમ્બર",
    december: "ડિસેમ્બર",
  },
};

// Sample service data
const SERVICE_DATA = [
  {
    id: "1",
    title: "Customized Menu Planning",
    description: "Tailored food and beverage options",
    icon: "🍽️",
    price: 5000
  },
  {
    id: "2",
    title: "Professional Decorations",
    description: "Theme-based decoration and setup",
    icon: "🎨",
    price: 8000
  },
  {
    id: "3",
    title: "Dedicated Event Manager",
    description: "Personal coordinator for seamless execution",
    icon: "👨‍💼",
    price: 10000
  },
  {
    id: "4",
    title: "Photography Services",
    description: "Professional photography and videography",
    icon: "📸",
    price: 12000
  },
  {
    id: "5",
    title: "Special Group Pricing",
    description: "Exclusive discounts for group bookings",
    icon: "💰",
    price: 3000
  },
  {
    id: "6",
    title: "Entertainment Setup",
    description: "Music, DJ, and entertainment arrangements",
    icon: "🎵",
    price: 15000
  },
];

export default function EventsBookingScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const { user, isGuest } = useAuth(); // 👈 Get user and isGuest from auth

  // Language state
  const [languageCode, setLanguageCode] = useState("en");

  // 👇 Guest user state
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Load saved language from AsyncStorage
  useFocusEffect(
    React.useCallback(() => {
      loadLanguage();
      checkUserStatus(); // 👈 Check user status on focus
    }, [])
  );

  // 👇 Check if user is guest
  const checkUserStatus = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        setIsGuestUser(userData.isGuest || false);
      } else {
        // No user found - treat as guest
        setIsGuestUser(true);
      }
    } catch (error) {
      console.log('Error checking user:', error);
      setIsGuestUser(true);
    }
  };

  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang) {
        setLanguageCode(savedLang);
      }
    } catch (error) {
      console.log('Error loading language:', error);
    }
  };

  // 🔥 Translation function
  const t = (key: keyof typeof translations.en) => {
    return translations[languageCode]?.[key] || translations.en[key];
  };

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    eventType: "",
    date: new Date(),
    guests: "",
    name: "",
    email: "",
    phone: "",
    specialRequirements: "",
    budget: "",
    selectedHall: "",
    selectedServices: [],
    totalCost: 0,
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<EventType>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 🔥 SCROLL ANIMATION VALUES
  const scrollY = useRef(new Animated.Value(0)).current;

  // Hero section animations
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });

  const heroScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  // Section 1 animations (Event Types)
  const section1Opacity = scrollY.interpolate({
    inputRange: [0, 150, 300],
    outputRange: [1, 1, 0.8],
    extrapolate: 'clamp',
  });

  const section1TranslateY = scrollY.interpolate({
    inputRange: [0, 150, 300],
    outputRange: [0, 0, -20],
    extrapolate: 'clamp',
  });

  // Section 2 animations (What We Offer)
  const section2Opacity = scrollY.interpolate({
    inputRange: [200, 350, 500],
    outputRange: [0.6, 1, 0.8],
    extrapolate: 'clamp',
  });

  const section2TranslateY = scrollY.interpolate({
    inputRange: [200, 350, 500],
    outputRange: [30, 0, -20],
    extrapolate: 'clamp',
  });

  // CTA animations
  const ctaOpacity = scrollY.interpolate({
    inputRange: [700, 850, 1000],
    outputRange: [0.6, 1, 1],
    extrapolate: 'clamp',
  });

  const ctaScale = scrollY.interpolate({
    inputRange: [700, 850],
    outputRange: [0.9, 1],
    extrapolate: 'clamp',
  });

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Card entrance animations array
  const [cardAnims] = useState(() => SERVICE_DATA.map(() => new Animated.Value(0)));

  useEffect(() => {
    const backAction = () => {
      if (showBookingForm) {
        setShowBookingForm(false);
        return true;
      }
      if (showGuestModal) {
        setShowGuestModal(false);
        return true;
      }
      router.replace("/");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [showBookingForm, showGuestModal, router]);

  // ---------------- DATA ----------------
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [partyHalls, setPartyHalls] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const startTime = Date.now();

      await Promise.all([
        fetchEventTypes(),
        fetchHalls(),
        fetchServices(),
      ]);

      const endTime = Date.now();
      const diff = endTime - startTime;
      const minimumLoadingTime = 1200;

      if (diff < minimumLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - diff));
      }

      setLoading(false);
    };

    loadData();
  }, []);

  // 🔥 ENTRANCE ANIMATION
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(
      150,
      cardAnims.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  // 🔥 AUTO SLIDE FOR EVENT TYPES
  useEffect(() => {
    if (eventTypes.length === 0) return;

    const autoScroll = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1 >= eventTypes.length ? 0 : prevIndex + 1;
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * CARD_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, 2500);

    return () => clearInterval(autoScroll);
  }, [eventTypes]);

  const fetchEventTypes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/events/types`);
      const data = await response.json();
      const formatted = data.map((item: any) => ({
        ...item,
        image: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : null,
      }));
      setEventTypes(formatted);
    } catch (error) {
      console.log("Error fetching event types:", error);
    }
  };

  const fetchHalls = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/events/halls`);
      const data = await response.json();
      const formatted = data.map((item: any) => ({
        ...item,
        image: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : null,
      }));
      setPartyHalls(formatted);
    } catch (error) {
      console.log("Error fetching halls:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/events/services`);
      const data = await response.json();
      const formatted = data.map((item: any) => ({
        ...item,
        image: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : null,
        selected: false,
      }));
      setAllServices(formatted);
    } catch (error) {
      console.log("Error fetching services:", error);
    }
  };

  // 👇 Handle booking button press with guest check
  const handleBookNowPress = () => {
    if (isGuestUser) {
      setShowGuestModal(true);
    } else {
      setShowBookingForm(true);
    }
  };

  // 👇 Handle event select with guest check
  const handleEventSelect = (event: EventType) => {
    if (isGuestUser) {
      setShowGuestModal(true);
    } else {
      setSelectedEventType(event);
      setBookingForm((prev) => ({
        ...prev,
        eventType: event._id
      }));
      setShowBookingForm(true);
    }
  };

  // ---------------- HANDLERS ----------------
  const handleHallSelect = (hall: PartyHall) => {
    const isSelected = bookingForm.selectedHall === hall._id;
    let newTotalCost = isSelected ? 0 : hall.price;

    allServices.forEach(service => {
      if (service.selected) {
        newTotalCost += service.price;
      }
    });

    setBookingForm((prev) => ({
      ...prev,
      selectedHall: isSelected ? "" : hall._id,
      totalCost: newTotalCost
    }));
  };

  const handleServiceToggle = (serviceId: string) => {
    const updatedServices = allServices.map(service => {
      if (service._id === serviceId) {
        return { ...service, selected: !service.selected };
      }
      return service;
    });

    const selectedHall = partyHalls.find(hall => hall._id === bookingForm.selectedHall);
    let newTotalCost = selectedHall ? selectedHall.price : 0;

    updatedServices.forEach(service => {
      if (service.selected) {
        newTotalCost += service.price;
      }
    });

    setAllServices(updatedServices);
    setBookingForm((prev) => ({
      ...prev,
      selectedServices: updatedServices.filter(s => s.selected),
      totalCost: newTotalCost
    }));
  };

  const resetForm = () => {
    setSelectedEventType(null);
    setAllServices(allServices.map(s => ({ ...s, selected: false })));
    setBookingForm({
      eventType: "",
      date: new Date(),
      guests: "",
      name: "",
      email: "",
      phone: "",
      specialRequirements: "",
      budget: "",
      selectedHall: "",
      selectedServices: [],
      totalCost: 0,
    });
    setActiveStep(1);
  };

  const handleBookingSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(t("error"), t("pleaseLogin"));
        return;
      }

      const response = await fetch(`${BASE_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventType: bookingForm.eventType,
          partyHall: bookingForm.selectedHall,
          extraServices: bookingForm.selectedServices.map(s => s._id),
          contactName: bookingForm.name,
          contactPhone: bookingForm.phone,
          eventDate: bookingForm.date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(t("error"), data.message || t("bookingFailed"));
        return;
      }

      // Generate PDF Bill before showing success
      const selectedHallData = partyHalls.find(h => h._id === bookingForm.selectedHall);
      await generateBillPDF(bookingForm, selectedHallData);

      Alert.alert(t("success"), t("bookingSuccess"));
      setShowBookingForm(false);
      resetForm();
    } catch (error) {
      console.log("Booking Error:", error);
      Alert.alert(t("error"), t("somethingWentWrong"));
    }
  };

  const generateBillPDF = async (form: typeof bookingForm, hall: PartyHall | undefined) => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
              .header { text-align: center; border-bottom: 2px solid #FF6B35; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { color: #FF6B35; margin: 0; font-size: 32px; }
              .header p { margin: 5px 0; font-size: 14px; opacity: 0.8; }
              .section { margin-bottom: 25px; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; background: #FFF8E1; padding: 5px 10px; border-left: 4px solid #FF6B35; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; }
              .label { color: #666; }
              .value { font-weight: 500; }
              .total-section { margin-top: 40px; border-top: 2px solid #eee; padding-top: 20px; }
              .total-row { display: flex; justify-content: space-between; font-size: 22px; font-weight: bold; color: #FF6B35; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SATVIK KALEVA</h1>
              <p>Event Booking Confirmation Receipt</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="section">
              <div class="section-title">Customer Details</div>
              <div class="row">
                <span class="label">Name:</span>
                <span class="value">${form.name}</span>
              </div>
              <div class="row">
                <span class="label">Email:</span>
                <span class="value">${form.email}</span>
              </div>
              <div class="row">
                <span class="label">Phone:</span>
                <span class="value">${form.phone}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Event Details</div>
              <div class="row">
                <span class="label">Event Type:</span>
                <span class="value">${selectedEventType?.name || 'Event'}</span>
              </div>
              <div class="row">
                <span class="label">Event Date:</span>
                <span class="value">${form.date.toDateString()}</span>
              </div>
              <div class="row">
                <span class="label">Estimated Guests:</span>
                <span class="value">${form.guests} People</span>
              </div>
              <div class="row">
                <span class="label">Selected Venue:</span>
                <span class="value">${hall?.name || 'Not Selected'}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Services & Charges</div>
              ${hall ? `
              <div class="row">
                <span class="label">${hall.name} (Venue)</span>
                <span class="value">₹${hall.price.toLocaleString()}</span>
              </div>
              ` : ''}
              ${form.selectedServices.map(s => `
              <div class="row">
                <span class="label">${s.title}</span>
                <span class="value">₹${s.price.toLocaleString()}</span>
              </div>
              `).join('')}
            </div>

            <div class="total-section">
              <div class="total-row">
                <span>TOTAL AMOUNT</span>
                <span>₹${form.totalCost.toLocaleString()}</span>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for choosing Satvik Kaleva for your special event!</p>
              <p>This is a computer-generated receipt.</p>
            </div>
          </body>
        </html>
      `;

      await Print.printAsync({ html });
    } catch (error) {
      console.log("PDF Error:", error);
      Alert.alert("PDF Error", "Could not generate or share bill PDF.");
    }
  };

  const goNext = () => {
    if (activeStep === 1) {
      if (!bookingForm.eventType) {
        Alert.alert(t("error"), t("selectEventFirst"));
        return;
      }
    }

    if (activeStep === 2) {
      if (!bookingForm.selectedHall) {
        Alert.alert(t("error"), t("selectHallFirst"));
        return;
      }
    }

    if (activeStep === 3) {
      if (!bookingForm.name || !bookingForm.email || !bookingForm.phone) {
        Alert.alert(t("error"), t("fillContactInfo"));
        return;
      }
    }

    if (activeStep < 4) setActiveStep((p) => p + 1);
    else handleBookingSubmit();
  };

  const goBackStep = () => {
    if (activeStep > 1) setActiveStep((p) => p - 1);
  };

  // ---------------- RENDER ITEMS ----------------
  const renderEventTypeCard: ListRenderItem<EventType> = ({ item, index }) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.eventTypeCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <Text style={[styles.eventTypeTitle, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.eventTypeDescription, { color: colors.subText }]}>
          {t("startingFrom")} ₹{item.basePrice}
        </Text>
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: colors.primary }]}
          onPress={() => handleEventSelect(item)}
        >
          <Text style={styles.selectButtonText}>
            {t("selectThisEvent")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHallCard: ListRenderItem<PartyHall> = ({ item }) => {
    const isSelected = bookingForm.selectedHall === item._id;

    return (
      <TouchableOpacity
        style={[
          styles.hallCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? item.color : colors.border,
          },
          isSelected && {
            backgroundColor: mode === 'dark' ? '#2D2D2D' : '#FFF8E1',
            borderWidth: 2,
          }
        ]}
        onPress={() => handleHallSelect(item)}
      >
        <View style={styles.hallHeader}>
          <View>
            <Text style={[styles.hallName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.hallCapacity, { color: colors.subText }]}>
              {t("capacity")}: {item.capacity} {t("people")}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceText, { color: colors.primary }]}>
              ₹{item.price.toLocaleString()}
            </Text>
            <Text style={[styles.priceLabel, { color: colors.subText }]}>
              {t("perDay")}
            </Text>
          </View>
        </View>

        <Text style={[styles.hallDescription, { color: colors.subText }]}>
          {item.description}
        </Text>

        <View style={styles.hallFeatures}>
          {item.features?.map((feature, idx) => (
            <View
              key={`${item._id}-f-${idx}`}
              style={[
                styles.hallFeatureTag,
                { backgroundColor: mode === 'dark' ? '#2D2D2D' : '#F8F8F8' }
              ]}
            >
              <Ionicons name="checkmark" size={12} color={colors.success} />
              <Text style={[styles.hallFeatureText, { color: colors.text }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.hallFooter}>
          <Ionicons
            name={isSelected ? "radio-button-on" : "radio-button-off"}
            size={20}
            color={isSelected ? colors.primary : colors.subText}
          />
          <Text
            style={[
              styles.selectHallText,
              { color: isSelected ? colors.primary : colors.subText }
            ]}
          >
            {isSelected ? t("selected") : t("selectHall")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderServiceCard = ({ item, index }: { item: typeof SERVICE_DATA[0]; index: number }) => {
    const translateY = cardAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    const scale = cardAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const rotate = cardAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: ["-5deg", "0deg"],
    });

    const opacity = cardAnims[index];

    return (
      <Animated.View
        style={[
          styles.serviceCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity,
            transform: [
              { translateY },
              { scale },
              { rotate }
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          style={{ alignItems: "center" }}
        >
          <Text style={styles.serviceIcon}>{item.icon}</Text>
          <Text style={[styles.serviceTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.serviceDescription, { color: colors.subText }]}>
            {item.description}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEventTypesCarousel = () => (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={eventTypes}
        renderItem={renderEventTypeCard}
        keyExtractor={(item) => item._id}
        horizontal
        snapToInterval={CARD_WIDTH}
        snapToAlignment="center"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: (width - CARD_WIDTH) / 2 - 10,
          alignItems: "center",
        }}
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH,
          offset: CARD_WIDTH * index,
          index,
        })}
      />

      <View style={styles.dotsContainer}>
        {eventTypes.map((_, i) => {
          const inputRange = [
            (i - 1) * CARD_WIDTH,
            i * CARD_WIDTH,
            (i + 1) * CARD_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: "clamp",
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <TouchableOpacity
              key={`dot-${i}`}
              onPress={() => {
                setCurrentIndex(i);
                flatListRef.current?.scrollToOffset({
                  offset: i * CARD_WIDTH,
                  animated: true,
                });
              }}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // 👇 Render guest modal
  const renderGuestModal = () => (
    <Modal
      visible={showGuestModal}
      animationType="fade"
      transparent
      onRequestClose={() => setShowGuestModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.guestModal, { backgroundColor: colors.modalBackground || colors.card }]}>
          <View style={styles.guestModalIcon}>
            <Ionicons name="person-outline" size={60} color={colors.primary} />
          </View>
          
          <Text style={[styles.guestModalTitle, { color: colors.text }]}>
            {t("loginRequired")}
          </Text>
          
          <Text style={[styles.guestModalText, { color: colors.subText }]}>
            {t("guestWarning")}
          </Text>
          
          <Text style={[styles.guestModalDesc, { color: colors.subText }]}>
            {t("guestWarningDesc")}
          </Text>

          <View style={styles.guestModalButtons}>
            <TouchableOpacity
              style={[styles.guestModalButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowGuestModal(false);
                router.push("/auth/login");
              }}
            >
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
              <Text style={styles.guestModalButtonText}>{t("login")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.guestModalButton, styles.guestModalSecondary, { borderColor: colors.border }]}
              onPress={() => setShowGuestModal(false)}
            >
              <Text style={[styles.guestModalButtonText, { color: colors.text }]}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.guestModalNote, { color: colors.subText }]}>
            {t("browseEvents")}
          </Text>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: 0,
        },
      ]}
    >
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        style={{ opacity: fadeAnim }}
      >
        {/* Hero Section with Scroll Animation */}
        <Animated.View
          style={[
            styles.heroSection,
            { backgroundColor: colors.card },
            {
              opacity: heroOpacity,
              transform: [
                { scale: heroScale },
                { translateY: slideAnim }
              ],
            }
          ]}
        >
          <Animated.Text
            style={[
              styles.heroTitle,
              { color: colors.primary },
              {
                opacity: headerAnim,
                transform: [{
                  translateX: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0]
                  })
                }]
              }
            ]}
          >
            {t("bookEvent")}
          </Animated.Text>

          <Animated.Text
            style={[
              styles.heroSubtitle,
              { color: colors.subText },
              {
                opacity: headerAnim,
                transform: [{
                  translateX: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0]
                  })
                }]
              }
            ]}
          >
            {t("heroDesc")}
          </Animated.Text>

          {/* Guest badge - optional */}
          {isGuestUser && (
            <View style={[styles.guestBadge, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="person-outline" size={16} color={colors.warning} />
              <Text style={[styles.guestBadgeText, { color: colors.warning }]}>
                Guest Mode
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Event Types Carousel with Scroll Animation */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: section1Opacity,
              transform: [{ translateY: section1TranslateY }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("chooseEventType")}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.subText }]}>
              {t("selectEventSub")}
            </Text>
          </View>

          {renderEventTypesCarousel()}
        </Animated.View>

        {/* Services Overview - What We Offer with Scroll Animation */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: section2Opacity,
              transform: [{ translateY: section2TranslateY }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("whatWeOffer")}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.subText }]}>
              {t("offerSub")}
            </Text>
          </View>

          <FlatList
            data={SERVICE_DATA}
            renderItem={renderServiceCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.servicesGrid}
            contentContainerStyle={styles.servicesContainer}
          />
        </Animated.View>

        {/* CTA with Scroll Animation */}
        <Animated.View
          style={[
            styles.ctaSection,
            { backgroundColor: colors.card },
            {
              opacity: ctaOpacity,
              transform: [{ scale: ctaScale }]
            }
          ]}
        >
          <Text style={[styles.ctaTitle, { color: colors.primary }]}>
            {t("readyToBook")}
          </Text>
          <Text style={[styles.ctaText, { color: colors.subText }]}>
            {t("contactSpecialists")}
          </Text>

          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            onPress={handleBookNowPress}
          >
            <Ionicons name="calendar" size={22} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>{t("bookNow")}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer spacing for bottom tab */}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>

      {/* Guest Modal */}
      {renderGuestModal()}

      {/* Booking Modal - Only shown for logged-in users */}
      <Modal
        visible={showBookingForm}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBookingForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.modalBackground || colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedEventType ? `${t("bookEvent")} ${selectedEventType.name}` : t("eventDetails")}
              </Text>
              <TouchableOpacity onPress={() => setShowBookingForm(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Steps */}
              <View style={styles.stepsContainer}>
                {[1, 2, 3, 4].map((step) => {
                  const isActive = activeStep >= step;
                  return (
                    <View key={`step-${step}`} style={styles.stepWrapper}>
                      <View
                        style={[
                          styles.stepCircle,
                          isActive
                            ? { backgroundColor: colors.primary }
                            : {
                                backgroundColor: colors.inputBackground,
                                borderWidth: 2,
                                borderColor: colors.border
                              }
                        ]}
                      >
                        <Text
                          style={[
                            styles.stepNumber,
                            { color: isActive ? "#FFFFFF" : colors.subText },
                          ]}
                        >
                          {step}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          { color: isActive ? colors.primary : colors.subText },
                        ]}
                      >
                        {step === 1 ? t("stepEvent") :
                         step === 2 ? t("stepHall") :
                         step === 3 ? t("stepContact") :
                         t("stepReview")}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Step 1: Event Details */}
              {activeStep === 1 && (
                <View style={styles.formSection}>
                  <Text style={[styles.formSectionTitle, { color: colors.text }]}>
                    {t("eventDetails")}
                  </Text>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      {t("eventType")}
                    </Text>
                    <View style={styles.eventTypeSelector}>
                      {eventTypes.map((event) => (
                        <TouchableOpacity
                          key={`etype-${event._id}`}
                          style={[
                            styles.eventTypeOption,
                            {
                              borderColor: colors.primary,
                              backgroundColor: mode === 'dark' ? '#2D2D2D' : '#F8F8F8'
                            },
                            bookingForm.eventType === event._id && [
                              styles.selectedEventType,
                              { backgroundColor: mode === 'dark' ? '#3D2D2D' : '#FFF8E1' }
                            ],
                          ]}
                          onPress={() => {
                            setBookingForm((prev) => ({
                              ...prev,
                              eventType: event._id
                            }));
                            setSelectedEventType(event);
                          }}
                        >
                          <Text style={styles.eventTypeOptionIcon}>🎉</Text>
                          <Text style={[styles.eventTypeOptionText, { color: colors.text }]}>
                            {event.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.label, { color: colors.text }]}>
                        {t("date")}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.inputBackground,
                            borderColor: colors.border,
                            justifyContent: "center",
                          },
                        ]}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text style={{ color: colors.text }}>
                          {bookingForm.date ? bookingForm.date.toDateString() : t("selectDate")}
                        </Text>
                      </TouchableOpacity>

                      {showDatePicker && (
                        <DateTimePicker
                          value={bookingForm.date}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                              setBookingForm((prev) => ({
                                ...prev,
                                date: selectedDate,
                              }));
                            }
                          }}
                        />
                      )}
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.label, { color: colors.text }]}>
                        {t("guests")}
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.inputBackground,
                            color: colors.text,
                            borderColor: colors.border
                          }
                        ]}
                        placeholder={t("guestPlaceholder")}
                        placeholderTextColor={colors.subText}
                        keyboardType="numeric"
                        value={bookingForm.guests}
                        onChangeText={(text) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            guests: text
                          }))
                        }
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Step 2: Hall Selection */}
              {activeStep === 2 && (
                <View style={styles.formSection}>
                  <Text style={[styles.formSectionTitle, { color: colors.text }]}>
                    {t("selectPartyHall")}
                  </Text>
                  <Text style={[styles.sectionDescription, { color: colors.subText }]}>
                    {t("chooseVenue")}
                  </Text>

                  <FlatList
                    data={partyHalls}
                    renderItem={renderHallCard}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.hallsContainer}
                  />

                  <Text style={[styles.formSectionTitle, { marginTop: 30, color: colors.text }]}>
                    {t("additionalServices")}
                  </Text>
                  <Text style={[styles.sectionDescription, { color: colors.subText }]}>
                    {t("customizeEvent")}
                  </Text>

                  <View style={styles.servicesGridModal}>
                    {allServices.map((service) => (
                      <TouchableOpacity
                        key={`service-${service._id}`}
                        style={[
                          styles.serviceOption,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border
                          },
                          service.selected && [
                            styles.selectedServiceOption,
                            {
                              backgroundColor: mode === 'dark' ? '#2D2D2D' : '#FFF8E1',
                              borderColor: colors.primary
                            }
                          ],
                        ]}
                        onPress={() => handleServiceToggle(service._id)}
                      >
                        <View style={styles.serviceOptionHeader}>
                          <Text style={styles.serviceOptionIcon}>
                            {service.icon || "✨"}
                          </Text>
                          <Ionicons
                            name={service.selected ? "checkbox" : "square-outline"}
                            size={20}
                            color={service.selected ? colors.primary : colors.subText}
                          />
                        </View>

                        <Text style={[styles.serviceOptionTitle, { color: colors.text }]}>
                          {service.title}
                        </Text>
                        <Text style={[styles.serviceOptionDescription, { color: colors.subText }]}>
                          {service.description}
                        </Text>

                        <View
                          style={[
                            styles.servicePriceContainer,
                            { backgroundColor: mode === 'dark' ? '#3D2D2D' : `${colors.primary}20` }
                          ]}
                        >
                          <Text style={[styles.servicePriceText, { color: colors.primary }]}>
                            + ₹{service.price.toLocaleString()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View
                    style={[
                      styles.totalCostContainer,
                      { backgroundColor: mode === 'dark' ? '#2D2D2D' : '#FFF8E1' }
                    ]}
                  >
                    <Text style={[styles.totalCostLabel, { color: colors.text }]}>
                      {t("totalEstimated")}
                    </Text>
                    <Text style={[styles.totalCostAmount, { color: colors.primary }]}>
                      ₹{bookingForm.totalCost.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Step 3: Contact Information */}
              {activeStep === 3 && (
                <View style={styles.formSection}>
                  <Text style={[styles.formSectionTitle, { color: colors.text }]}>
                    {t("contactInfo")}
                  </Text>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      {t("fullName")}
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.inputBackground,
                          color: colors.text,
                          borderColor: colors.border
                        }
                      ]}
                      placeholder={t("namePlaceholder")}
                      placeholderTextColor={colors.subText}
                      value={bookingForm.name}
                      onChangeText={(text) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          name: text
                        }))
                      }
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.label, { color: colors.text }]}>
                        {t("email")}
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.inputBackground,
                            color: colors.text,
                            borderColor: colors.border
                          }
                        ]}
                        placeholder={t("emailPlaceholder")}
                        placeholderTextColor={colors.subText}
                        keyboardType="email-address"
                        value={bookingForm.email}
                        onChangeText={(text) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            email: text
                          }))
                        }
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.label, { color: colors.text }]}>
                        {t("phone")}
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.inputBackground,
                            color: colors.text,
                            borderColor: colors.border
                          }
                        ]}
                        placeholder={t("phonePlaceholder")}
                        placeholderTextColor={colors.subText}
                        keyboardType="phone-pad"
                        value={bookingForm.phone}
                        onChangeText={(text) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            phone: text
                          }))
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      {t("specialRequirements")}
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        {
                          backgroundColor: colors.inputBackground,
                          color: colors.text,
                          borderColor: colors.border
                        }
                      ]}
                      placeholder={t("requirementsPlaceholder")}
                      placeholderTextColor={colors.subText}
                      multiline
                      numberOfLines={4}
                      value={bookingForm.specialRequirements}
                      onChangeText={(text) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          specialRequirements: text
                        }))
                      }
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      {t("budget")}
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.inputBackground,
                          color: colors.text,
                          borderColor: colors.border
                        }
                      ]}
                      placeholder={t("budgetPlaceholder")}
                      placeholderTextColor={colors.subText}
                      value={bookingForm.budget}
                      onChangeText={(text) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          budget: text
                        }))
                      }
                    />
                  </View>
                </View>
              )}

              {/* Step 4: Review */}
              {activeStep === 4 && (
                <View style={styles.formSection}>
                  <Text style={[styles.formSectionTitle, { color: colors.text }]}>
                    {t("reviewBooking")}
                  </Text>

                  <View
                    style={[
                      styles.summaryCard,
                      { backgroundColor: mode === 'dark' ? '#2D2D2D' : '#F8F8F8' }
                    ]}
                  >
                    <Text style={[styles.summaryTitle, { color: colors.text }]}>
                      {t("eventSummary")}
                    </Text>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>
                        {t("eventTypeLabel")}
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {bookingForm.eventType || "-"}
                      </Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>
                        {t("dateLabel")}
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {bookingForm.date ? bookingForm.date.toDateString() : t("toBeDecided")}
                      </Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>
                        {t("guestsLabel")}
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {bookingForm.guests || t("notSpecified")}
                      </Text>
                    </View>

                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>
                        {t("selectedHall")}
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {partyHalls.find(h => h._id === bookingForm.selectedHall)?.name || t("notSelected")}
                      </Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>
                        {t("servicesLabel")}
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {bookingForm.selectedServices.length > 0
                          ? bookingForm.selectedServices.map(s => s.title).join(", ")
                          : t("none")}
                      </Text>
                    </View>

                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

                    <View style={[styles.summaryRow, styles.totalCostRow]}>
                      <Text style={[styles.totalLabel, { color: colors.text }]}>
                        {t("totalCost")}
                      </Text>
                      <Text style={[styles.totalAmount, { color: colors.primary }]}>
                        ₹{bookingForm.totalCost.toLocaleString()}
                      </Text>
                    </View>

                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>
                        {t("contactLabel")}
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {bookingForm.name || "-"}
                      </Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>
                        {t("emailLabel")}
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {bookingForm.email || "-"}
                      </Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>
                        {t("phoneLabel")}
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {bookingForm.phone || "-"}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.noteContainer,
                      { backgroundColor: mode === 'dark' ? '#2D2D2D' : '#FFF8E1' }
                    ]}
                  >
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={[styles.noteText, { color: colors.subText }]}>
                      {t("note")}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
              {activeStep > 1 && (
                <TouchableOpacity
                  style={[
                    styles.backButtonModal,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground
                    }
                  ]}
                  onPress={goBackStep}
                >
                  <Ionicons name="arrow-back" size={18} color={colors.text} />
                  <Text style={[styles.backButtonText, { color: colors.text }]}>
                    {t("back")}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: colors.primary }]}
                onPress={goNext}
              >
                <Text style={styles.nextButtonText}>
                  {activeStep === 4 ? t("submit") : t("next")}
                </Text>
                <Ionicons
                  name={activeStep === 4 ? "checkmark-circle" : "arrow-forward"}
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  section: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  carouselContainer: {
    marginBottom: 20,
  },
  eventTypeCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    alignItems: "center",
  },
  eventTypeTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  eventTypeDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
    gap: 10,
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  servicesGrid: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  servicesContainer: {
    paddingBottom: 10,
  },
  serviceCard: {
    width: (width - 50) / 2,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 15,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  ctaSection: {
    padding: 30,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  ctaText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
    maxWidth: 300,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 15,
    gap: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: 'center',
  },
  modalContainer: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "90%",
    width: '100%',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalContent: {
    padding: 20,
    maxHeight: height * 0.7,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  stepWrapper: {
    alignItems: "center",
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "700",
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  formSection: {
    marginBottom: 20,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  formRow: {
    flexDirection: "row",
    gap: 15,
  },
  eventTypeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  eventTypeOption: {
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: (width - 80) / 3,
  },
  selectedEventType: {},
  eventTypeOptionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  eventTypeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  hallCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
  },
  hallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  hallName: {
    fontSize: 18,
    fontWeight: '700',
  },
  hallCapacity: {
    fontSize: 14,
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
  },
  priceLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  hallDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  hallFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  hallFeatureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  hallFeatureText: {
    fontSize: 12,
  },
  hallFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectHallText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hallsContainer: {
    paddingBottom: 10,
  },
  servicesGridModal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  serviceOption: {
    width: (width - 80) / 2,
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    alignItems: 'center',
  },
  selectedServiceOption: {},
  serviceOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceOptionIcon: {
    fontSize: 28,
  },
  serviceOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 5,
  },
  serviceOptionDescription: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 14,
  },
  servicePriceContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  servicePriceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalCostContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginTop: 10,
  },
  totalCostLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalCostAmount: {
    fontSize: 28,
    fontWeight: '800',
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 15,
  },
  totalCostRow: {
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 15,
  },
  backButtonModal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // 👇 Guest modal styles
  guestModal: {
    width: '85%',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  guestModalIcon: {
    marginBottom: 20,
  },
  guestModalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  guestModalText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  guestModalDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  guestModalButtons: {
    width: '100%',
    gap: 12,
    marginBottom: 15,
  },
  guestModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  guestModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  guestModalSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  guestModalNote: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },

  // 👇 Guest badge styles
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  guestBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});