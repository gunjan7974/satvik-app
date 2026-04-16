import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  ImageBackground,
  Easing,
  Platform,
  Modal,
  Alert,
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import Colors from "../../constants/colors";
import * as Haptics from 'expo-haptics';
import { useTheme } from "../data/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { emitCartUpdate } from "../../constants/CartEventEmitter";
import SuccessPopup from "../../components/SuccessPopup";


import { BASE_URL } from "../../config/api";

/* ================= TYPE DEFINITIONS ================= */
interface FoodItem {
  id: string;
  name: string;
  subname?: string;
  image: any;
  color: string;
  items: string;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  image: string;
  type: string;
  status: string;
  price: string;
  discount: string;
  badge: string;
  badgeColor: string;
}

// Guest Cart Item Type
interface GuestCartItem {
  _id: string;
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image?: any;
  category?: string;
}

/* ================= SLIDER IMAGES ================= */
const SLIDER_IMAGES = [
  require("../../assets/images/ev.png"),
  require("../../assets/images/fe.png"),
  require("../../assets/images/bs.png"),
  require("../../assets/images/of.png"),
];

const { width, height } = Dimensions.get("window");

// 🔥 TRANSLATIONS FOR 5 LANGUAGES
const translations: Record<string, any> = {

  // English
  en: {
    // Header
    discoverFlavors: "Discover flavors you'll love",
    discoverDelicious: "Discover delicious food",

    // Search
    searchPlaceholder: "Search food items...",
    suggestionsFor: "Suggestions for",

    // Sections
    todaysSpecials: "Today's Specials",
    viewAll: "View All",
    allCategories: "All Categories",
    showLess: "Show Less",
    moreCategories: "More Categories",
    upcomingEvents: "Upcoming Events",
    eventsSubtitle: "Don't miss out on these experiences",
    seeAll: "See All",

    // Empty State
    noCategories: "No categories found",
    trySearch: "Try searching with different keywords",

    // Buttons
    showLess: "Show Less",

    // PUA Mode
    puaActivated: "PUA Mode Activated",
    puaDescription: "Professional animations enabled",
    security: "Security",
    proModeActive: "PRO MODE ACTIVE",

    // Loading
    loadingFood: "Loading delicious food...",

    // Food Card
    rating: "Rating",

    // Cart Messages
    addedToCart: "Added to Cart",
    itemAdded: "Item added to your cart",
    viewCart: "View Cart",
    continueShopping: "Continue Shopping",
    loginRequired: "Login Required",
    pleaseLogin: "Please login to order food",
    guestMode: "Guest Mode",
  },

  // Hindi
  hi: {
    discoverFlavors: "ऐसे स्वाद खोजें जो आपको पसंद आएंगे",
    discoverDelicious: "स्वादिष्ट भोजन खोजें",

    searchPlaceholder: "खाद्य पदार्थ खोजें...",
    suggestionsFor: "के लिए सुझाव",

    todaysSpecials: "आज के स्पेशल",
    viewAll: "सभी देखें",
    allCategories: "सभी श्रेणियाँ",
    showLess: "कम दिखाएं",
    moreCategories: "और श्रेणियाँ",
    upcomingEvents: "आगामी कार्यक्रम",
    eventsSubtitle: "इन अनुभवों को न चूकें",
    seeAll: "सभी देखें",

    noCategories: "कोई श्रेणी नहीं मिली",
    trySearch: "अलग कीवर्ड से खोजें",

    showLess: "कम दिखाएं",

    puaActivated: "PUA मोड सक्रिय",
    puaDescription: "प्रोफेशनल एनिमेशन सक्षम",
    security: "सुरक्षा",
    proModeActive: "प्रो मोड सक्रिय",

    loadingFood: "स्वादिष्ट भोजन लोड हो रहा है...",

    rating: "रेटिंग",

    addedToCart: "कार्ट में जोड़ा गया",
    itemAdded: "आइटम आपके कार्ट में जोड़ दिया गया है",
    viewCart: "कार्ट देखें",
    continueShopping: "खरीदारी जारी रखें",
    loginRequired: "लॉगिन आवश्यक",
    pleaseLogin: "कृपया ऑर्डर करने के लिए लॉगिन करें",
    guestMode: "अतिथि मोड",
  },

  // Marathi
  mr: {
    discoverFlavors: "तुम्हाला आवडतील असे फ्लेवर्स शोधा",
    discoverDelicious: "स्वादिष्ट अन्न शोधा",

    searchPlaceholder: "खाद्यपदार्थ शोधा...",
    suggestionsFor: "साठी सूचना",

    todaysSpecials: "आजचे स्पेशल",
    viewAll: "सर्व पहा",
    allCategories: "सर्व श्रेणी",
    showLess: "कमी दाखवा",
    moreCategories: "आणखी श्रेणी",
    upcomingEvents: "आगामी कार्यक्रम",
    eventsSubtitle: "हे अनुभव चुकवू नका",
    seeAll: "सर्व पहा",

    noCategories: "कोणतीही श्रेणी सापडली नाही",
    trySearch: "वेगळ्या कीवर्डने शोधा",

    showLess: "कमी दाखवा",

    puaActivated: "PUA मोड सक्रिय",
    puaDescription: "प्रोफेशनल अ‍ॅनिमेशन सक्षम",
    security: "सुरक्षा",
    proModeActive: "प्रो मोड सक्रिय",

    loadingFood: "स्वादिष्ट अन्न लोड होत आहे...",

    rating: "रेटिंग",

    addedToCart: "कार्टमध्ये जोडले",
    itemAdded: "वस्तू तुमच्या कार्टमध्ये जोडली गेली आहे",
    viewCart: "कार्ट पहा",
    continueShopping: "खरेदी सुरू ठेवा",
    loginRequired: "लॉगिन आवश्यक",
    pleaseLogin: "कृपया ऑर्डर करण्यासाठी लॉगिन करा",
    guestMode: "पाहुणा मोड",
  },

  // Tamil
  ta: {
    discoverFlavors: "உங்களுக்குப் பிடித்த சுவைகளைக் கண்டறியுங்கள்",
    discoverDelicious: "சுவையான உணவைக் கண்டறியுங்கள்",

    searchPlaceholder: "உணவுப் பொருட்களைத் தேடுங்கள்...",
    suggestionsFor: "க்கான பரிந்துரைகள்",

    todaysSpecials: "இன்றைய ஸ்பெஷல்கள்",
    viewAll: "அனைத்தையும் காண்க",
    allCategories: "அனைத்து வகைகள்",
    showLess: "குறைவாக காட்டு",
    moreCategories: "மேலும் வகைகள்",
    upcomingEvents: "வரவிருக்கும் நிகழ்வுகள்",
    eventsSubtitle: "இந்த அனுபவங்களை தவறவிடாதீர்கள்",
    seeAll: "அனைத்தையும் காண்க",

    noCategories: "வகைகள் எதுவும் கிடைக்கவில்லை",
    trySearch: "வேறு முக்கிய வார்த்தைகளில் தேடுங்கள்",

    showLess: "குறைவாக காட்டு",

    puaActivated: "PUA பயன்முறை செயல்படுத்தப்பட்டது",
    puaDescription: "தொழில்முறை அனிமேஷன்கள் இயக்கப்பட்டன",
    security: "பாதுகாப்பு",
    proModeActive: "புரோ பயன்முறை செயலில்",

    loadingFood: "சுவையான உணவு ஏற்றப்படுகிறது...",

    rating: "மதிப்பீடு",

    addedToCart: "வண்டியில் சேர்க்கப்பட்டது",
    itemAdded: "பொருள் உங்கள் வண்டியில் சேர்க்கப்பட்டது",
    viewCart: "வண்டியைப் பார்",
    continueShopping: "ஷாப்பிங் தொடர்க",
    loginRequired: "உள்நுழைவு தேவை",
    pleaseLogin: "ஆர்டர் செய்ய உள்நுழையவும்",
    guestMode: "விருந்தினர் முறை",
  },

  // Gujarati
  gu: {
    discoverFlavors: "તમને ગમતા સ્વાદ શોધો",
    discoverDelicious: "સ્વાદિષ્ટ ભોજન શોધો",

    searchPlaceholder: "ખાદ્ય વસ્તુઓ શોધો...",
    suggestionsFor: "માટે સૂચનો",

    todaysSpecials: "આજના સ્પેશિયલ",
    viewAll: "બધા જુઓ",
    allCategories: "બધી શ્રેણીઓ",
    showLess: "ઓછું બતાવો",
    moreCategories: "વધુ શ્રેણીઓ",
    upcomingEvents: "આગામી કાર્યક્રમો",
    eventsSubtitle: "આ અનુભવો ચૂકશો નહીં",
    seeAll: "બધા જુઓ",

    noCategories: "કોઈ શ્રેણી મળી નથી",
    trySearch: "અલગ કીવર્ડથી શોધો",

    showLess: "ઓછું બતાવો",

    puaActivated: "PUA મોડ સક્રિય",
    puaDescription: "પ્રોફેશનલ એનિમેશન સક્ષમ",
    security: "સુરક્ષા",
    proModeActive: "પ્રો મોડ સક્રિય",

    loadingFood: "સ્વાદિષ્ટ ભોજન લોડ થઈ રહ્યું છે...",

    rating: "રેટિંગ",

    addedToCart: "કાર્ટમાં ઉમેરાયું",
    itemAdded: "વસ્તુ તમારા કાર્ટમાં ઉમેરાઈ ગઈ છે",
    viewCart: "કાર્ટ જુઓ",
    continueShopping: "ખરીદી ચાલુ રાખો",
    loginRequired: "લૉગિન આવશ્યક છે",
    pleaseLogin: "કૃપા કરીને ઓર્ડર કરવા લૉગિન કરો",
    guestMode: "મહેમાન મોડ",
  },
};

export default function HomeScreen() {
  const { colors, mode } = useTheme();

  // 🔥 Language state
  const [language, setLanguage] = useState("en");

  // 🔥 Translation function
  const t = (key: string) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activePUA, setActivePUA] = useState(false);
  const [showPUAModal, setShowPUAModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [securityLevel, setSecurityLevel] = useState("standard");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [addedItemName, setAddedItemName] = useState("");

  // Guest cart state
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);

  // Slider Refs
  const promoSliderRef = useRef<FlatList>(null);
  const eventsSliderRef = useRef<FlatList>(null);

  // Slider States
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Original Animated Values
  const scrollXP = useRef(new Animated.Value(0)).current;
  const scrollXE = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  // Enhanced Animations
  const fadeInUp = useRef(new Animated.Value(50)).current;
  const staggerValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleHeader = useRef(new Animated.Value(0.95)).current;
  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const puaGlowAnim = useRef(new Animated.Value(0)).current;
  const parallaxScroll = useRef(new Animated.Value(0)).current;

  // 🔥 Load saved language and guest cart
  useFocusEffect(
    useCallback(() => {
      loadLanguage();
      loadGuestCart();
    }, [])
  );

  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang) {
        setLanguage(savedLang);
      }
      
      const savedFavs = await AsyncStorage.getItem('favorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch (error) {
      console.log('Error loading language or favorites:', error);
    }
  };

  // Load guest cart from AsyncStorage
  const loadGuestCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('guestCart');
      if (savedCart) {
        setGuestCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.log("Error loading guest cart:", error);
    }
  };

  // Save guest cart to AsyncStorage
  const saveGuestCart = async (cart: GuestCartItem[]) => {
    try {
      await AsyncStorage.setItem('guestCart', JSON.stringify(cart));
      setGuestCart(cart);
    } catch (error) {
      console.log("Error saving guest cart:", error);
    }
  };

  // Add to guest cart function
  const addToGuestCart = (item: any, qty: number = 1) => {
    const existingItemIndex = guestCart.findIndex(cartItem => cartItem.foodId === item.id);
    
    let updatedCart: GuestCartItem[];
    
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedCart = [...guestCart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + qty
      };
    } else {
      // Add new item
      const newItem: GuestCartItem = {
        _id: Date.now().toString(), // Temporary ID for guest cart
        foodId: item.id,
        name: item.name,
        price: item.price || 0,
        quantity: qty,
        image: item.image,
        category: item.subname
      };
      updatedCart = [...guestCart, newItem];
    }
    
    saveGuestCart(updatedCart);
    
    const updatedCount = updatedCart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    emitCartUpdate(updatedCount);
    
    // Show success message with options
    setAddedItemName(item.name);
    setShowSuccessPopup(true);
    
    // Optional: Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      let newFavs = [...favorites];
      if (newFavs.includes(id)) {
        newFavs = newFavs.filter(favId => favId !== id);
      } else {
        newFavs.push(id);
      }
      setFavorites(newFavs);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
      
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.log('Error toggling favorite:', error);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${BASE_URL}/api/foods`);
      
      const rawData = response.data.menus || (Array.isArray(response.data) ? response.data : []);

      const formattedData = rawData.map((item: any) => ({
        id: item._id,
        name: item.name,
        subname: item.category || "",
        image: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : null,
        color: "#FF6B35",
        items: `₹${item.price}`,
        price: item.price,
        description: item.description || "",
        raw: item
      }));

      setFoods(formattedData);
    } catch (error) {
      console.log("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Enhanced entrance animation sequence
    Animated.stagger(100, [
      Animated.spring(scaleHeader, {
        toValue: 1,
        tension: 20,
        friction: 8,
        useNativeDriver: true,
      }),

      Animated.timing(fadeInUp, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(cardAnim, {
          toValue: 1,
          tension: 25,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(staggerValue, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Pulsing animation for active elements
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Subtle rotation
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateLoop.start();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, []);

  // 🔥 FIX 1: Auto-slide for Promo - FASTER (changed from 3500 to 2500)
  useEffect(() => {
    let promoIndex = 0;

    const promoInterval = setInterval(() => {
      promoIndex = promoIndex === SLIDER_IMAGES.length - 1 ? 0 : promoIndex + 1;

      promoSliderRef.current?.scrollToIndex({
        index: promoIndex,
        animated: true,
      });

      setCurrentPromoIndex(promoIndex);
    }, 2500); // 🔥 FASTER: 2.5 seconds instead of 3.5

    return () => {
      clearInterval(promoInterval);
    };
  }, []);

  // 🔥 FIX 2: Auto-slide for Events - WORKING NOW
  useEffect(() => {
    if (!EVENTS_DATA || EVENTS_DATA.length === 0) return;

    let eventsIndex = 0;

    const eventsInterval = setInterval(() => {
      eventsIndex = eventsIndex === EVENTS_DATA.length - 1 ? 0 : eventsIndex + 1;

      eventsSliderRef.current?.scrollToIndex({
        index: eventsIndex,
        animated: true,
      });

      setCurrentEventIndex(eventsIndex);
    }, 3000); // 3 seconds

    return () => {
      clearInterval(eventsInterval);
    };
  }, []); // 🔥 Removed dependency on currentEventIndex to avoid re-creation

  /* ===== PUA ACTIVATION FUNCTION ===== */
  const activatePUAMode = () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
    }

    Animated.sequence([
      Animated.timing(puaGlowAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(puaGlowAnim, {
        toValue: 0.5,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    setActivePUA(true);
    setSecurityLevel("enhanced");
    setShowPUAModal(true);

    setTimeout(() => {
      setShowPUAModal(false);
    }, 3000);
  };

  // 🔥 ADD BUTTON (Quick add to cart) - UPDATED FOR GUEST
  const addOrder = async (item: any) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        // Guest user - add to guest cart
        addToGuestCart(item, quantity);

        setShowItemModal(false);
        setQuantity(1);
        setSelectedItem(null);
        return;
      }

      await axios.post(
        `${BASE_URL}/api/cart`,
        {
          foodId: item.id,
          quantity: quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // 🔥 update cart badge live
      const currentCount = await AsyncStorage.getItem("cartCount");
      const newCount = currentCount ? JSON.parse(currentCount) + quantity : quantity;
      await emitCartUpdate(newCount);

      setShowItemModal(false);
      setQuantity(1);
      setSelectedItem(null);

      setAddedItemName(item.name);
      setShowSuccessPopup(true);

    } catch (error: any) {
      console.log("ORDER ERROR:", error.response?.data || error.message);
      Alert.alert("Error", "Could not add item to cart.");
    }
  };

  // 🔥 ADD TO CART BUTTON (Add and go to cart) - UPDATED FOR GUEST
  const addToCart = async (item: any) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        // Guest user - add to guest cart and go to cart
        addToGuestCart(item, quantity);
        
        setShowItemModal(false);
        setQuantity(1);
        setSelectedItem(null);
        
        router.push("/cart");
        return;
      }

      await axios.post(
        `${BASE_URL}/api/cart`,
        {
          foodId: item.id,
          quantity: quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // 🔥 update cart badge live
      const currentCount = await AsyncStorage.getItem("cartCount");
      const newCount = currentCount ? JSON.parse(currentCount) + quantity : quantity;
      await emitCartUpdate(newCount);

      setShowItemModal(false);
      setQuantity(1);
      setSelectedItem(null);

      router.push("/cart");

    } catch (error: any) {
      console.log("CART ERROR:", error.response?.data || error.message);
      Alert.alert("Error", "Could not add item to cart.");
    }
  };

  // Get search suggestions
  const getSearchSuggestions = () => {
    if (search.trim() === "") return [];

    const searchTerm = search.toLowerCase();
    return foods.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      (item.subname && item.subname.toLowerCase().includes(searchTerm))
    ).slice(0, 5);
  };

  const suggestions = getSearchSuggestions();

  // Filter data based on search
  const filteredData = foods.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.subname && item.subname.toLowerCase().includes(search.toLowerCase()))
  );

  // Show only first 6 items initially, or all when showAllCategories is true
  const displayedData = showAllCategories
    ? filteredData
    : filteredData.slice(0, 6);

  /* ===== ENHANCED FOOD CARD WITH ANIMATIONS ===== */
  const renderFoodCard = ({ item, index }: { item: FoodItem; index: number }) => {
    const cardScale = cardAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
    });

    const translateY = cardAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    const cardOpacity = staggerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const staggerDelay = index * 80;
    const cardStagger = staggerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [staggerDelay, 0],
    });

    const displayName = item.subname
      ? `${item.name}\n${item.subname}`
      : item.name;

    return (
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            opacity: cardOpacity,
            transform: [{ scale: cardScale }, { translateY: Animated.add(translateY, cardStagger) }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Animated.sequence([
              Animated.timing(cardAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.spring(cardAnim, {
                toValue: 1,
                tension: 200,
                friction: 4,
                useNativeDriver: true,
              }),
            ]).start();

            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }

            // Instead of navigating to menu, show modal for direct order
            setSelectedItem(item);
            setQuantity(1);
            setShowItemModal(true);
          }}
          style={styles.cardTouchable}
        >
          <ImageBackground
            source={typeof item.image === 'string' ? { uri: item.image } : item.image}
            style={styles.cardImage}
            imageStyle={styles.cardImageStyle}
          >
            <Animated.View style={[
              styles.gradientOverlay,
              {
                backgroundColor: item.color + '40',
                opacity: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.8],
                })
              }
            ]} />

            {activePUA && (
              <Animated.View
                style={[
                  styles.floatingParticle,
                  {
                    backgroundColor: item.color,
                    transform: [
                      {
                        translateX: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 20],
                        })
                      },
                      {
                        translateY: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -15],
                        })
                      },
                      {
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        })
                      }
                    ],
                    opacity: rotateAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 0.6, 0.3],
                    })
                  }
                ]}
              />
            )}

            <View style={styles.cardContent}>
              <Animated.View
                style={[
                  styles.categoryIcon,
                  {
                    backgroundColor: item.color + '30',
                    transform: [
                      {
                        scale: cardAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        })
                      }
                    ]
                  }
                ]}
              >
                <Ionicons name="fast-food" size={20} color={item.color} />
              </Animated.View>

              <View style={styles.textContainer}>
                <Animated.Text
                  style={[
                    styles.cardName,
                    {
                      color: colors.text,
                      opacity: cardAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.5, 1],
                      }),
                    }
                  ]}
                >
                  {displayName}
                </Animated.Text>
              </View>

              <Animated.View
                style={[
                  styles.itemCount,
                  {
                    backgroundColor: mode === 'dark' ? colors.background + '80' : 'rgba(255,255,255,0.9)',
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [1, 1.15],
                          outputRange: [1, 1.1],
                        })
                      }
                    ]
                  }
                ]}
              >
                <Text style={[styles.itemCountText, { color: colors.primary }]}>{item.items}</Text>
              </Animated.View>

              <TouchableOpacity
                style={styles.favoriteBadge}
                onPress={() => toggleFavorite(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                  size={18}
                  color={favorites.includes(item.id) ? "#FF4757" : "#FFFFFF"}
                />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  /* ===== ENHANCED PROMO SLIDER ITEM ===== */
  const renderPromoSliderItem = ({ item, index }: { item: any; index: number }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const translateX = scrollXP.interpolate({
      inputRange,
      outputRange: [-width * 0.2, 0, width * 0.2],
      extrapolate: 'clamp',
    });

    const scale = scrollXP.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.slide,
          {
            transform: [
              { translateX },
              { scale }
            ]
          }
        ]}
      >
        <Image source={item} style={styles.sliderImage} />
        <Animated.View
          style={[
            styles.slideOverlay,
            {
              backgroundColor: 'rgba(0,0,0,0.3)',
              opacity: scrollXP.interpolate({
                inputRange,
                outputRange: [0.2, 0.3, 0.2],
                extrapolate: 'clamp',
              })
            }
          ]}
        />
        <Animated.View
          style={[
            styles.slideContent,
            {
              transform: [
                {
                  translateY: scrollXP.interpolate({
                    inputRange,
                    outputRange: [20, 0, 20],
                    extrapolate: 'clamp',
                  })
                }
              ]
            }
          ]}
        >
          <Animated.View
            style={[
              styles.offerTag,
              {
                backgroundColor: colors.primary,
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.15],
                      outputRange: [1, 1.1],
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.offerTagText}>🔥 30% OFF</Text>
          </Animated.View>
          <Animated.Text
            style={[
              styles.slideTitle,
              {
                color: '#fff',
                opacity: scrollXP.interpolate({
                  inputRange,
                  outputRange: [0.5, 1, 0.5],
                  extrapolate: 'clamp',
                })
              }
            ]}
          >
            Weekend Special
          </Animated.Text>
          <Text style={[styles.slideSubtitle, { color: '#fff' }]}>Order any 2 items & get discount</Text>
        </Animated.View>
      </Animated.View>
    );
  };

  /* ===== ENHANCED EVENT CARD ===== */
  const renderEventCard = ({ item, index }: { item: EventItem; index: number }) => {
    const getEventIcon = (type: string) => {
      switch (type) {
        case 'music': return 'musical-notes';
        case 'festival': return 'restaurant';
        case 'dining': return 'wine';
        case 'wine': return 'wine-outline';
        default: return 'mic';
      }
    };

    return (
      <View style={styles.eventSlide}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          style={styles.eventTouchable}
        >
          <ImageBackground
            source={{ uri: item.image }}
            style={styles.eventImage}
            imageStyle={styles.eventImageStyle}
          >
            <Animated.View
              style={[
                styles.eventBadge,
                {
                  backgroundColor: item.badgeColor,
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.15],
                        outputRange: [1, 1.05],
                      })
                    }
                  ]
                }
              ]}
            >
              <Text style={styles.eventBadgeText}>{item.badge}</Text>
            </Animated.View>

            <View style={[styles.eventOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Animated.View
                  style={[
                    styles.eventType,
                    {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: [
                        {
                          rotate: cardAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <Ionicons
                    name={getEventIcon(item.type) as any}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.eventTypeText}>{item.type.toUpperCase()}</Text>
                </Animated.View>
                <View style={[styles.eventPrice, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                  <Text style={[styles.eventPriceText, { color: colors.textDark }]}>{item.price}</Text>
                </View>
              </View>

              <Text style={[styles.eventTitle, { color: '#fff' }]}>{item.title}</Text>
              <Text style={[styles.eventDescription, { color: 'rgba(255,255,255,0.9)' }]}>{item.description}</Text>

              <View style={styles.eventFooter}>
                <View style={styles.eventInfo}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={[styles.eventInfoText, { color: 'rgba(255,255,255,0.8)' }]}>{item.date}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={[styles.eventInfoText, { color: 'rgba(255,255,255,0.8)' }]}>{item.venue}</Text>
                </View>
              </View>

              {item.discount && (
                <Animated.View
                  style={[
                    styles.discountTag,
                    {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: [
                        {
                          translateX: pulseAnim.interpolate({
                            inputRange: [1, 1.15],
                            outputRange: [0, 5],
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <Ionicons name="pricetag" size={12} color="#fff" />
                  <Text style={[styles.discountText, { color: '#fff' }]}>{item.discount}</Text>
                </Animated.View>
              )}
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  // Function to toggle show all categories
  const toggleShowAllCategories = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowAllCategories(!showAllCategories);
  };

  // 🔥 FIX 3: Handle search suggestion selection - DIRECT ORDER
  const handleSuggestionSelect = (item: any) => {
    setSearch("");
    setShowSuggestions(false);

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Set selected item and show modal for direct order
    setSelectedItem(item);
    setQuantity(1);
    setShowItemModal(true);
  };

  // 🔥 FIX 4: Handle search submit
  const handleSearchSubmit = () => {
    if (search.trim() !== "") {
      setShowSuggestions(false);
      router.push({
        pathname: "/menu",
        params: { search: search.trim() },
      });
    }
  };

  // EVENTS_DATA
  const EVENTS_DATA: EventItem[] = [
    {
      id: "1",
      title: "Live Music Night",
      date: "Tonight • 8 PM",
      venue: "Rooftop Lounge",
      description: "Acoustic performance with local artists",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
      type: "music",
      status: "live",
      price: "Free Entry",
      discount: "First drink free",
      badge: "LIVE NOW",
      badgeColor: "#FF4757",
    },
    {
      id: "2",
      title: "Food Festival 2024",
      date: "Oct 25-27 • All Day",
      venue: "Main Courtyard",
      description: "50+ Food stalls from across India",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
      type: "festival",
      status: "upcoming",
      price: "₹199 Entry",
      discount: "20% off on combos",
      badge: "COMING SOON",
      badgeColor: "#2ED573",
    },
    {
      id: "3",
      title: "Chef's Special Dinner",
      date: "Every Friday • 7 PM",
      venue: "Fine Dining Hall",
      description: "7-course meal curated by Master Chef",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
      type: "dining",
      status: "weekly",
      price: "₹1499 per person",
      discount: "Wine pairing included",
      badge: "LIMITED SEATS",
      badgeColor: "#FFA502",
    },
    {
      id: "4",
      title: "Karaoke Night",
      date: "Saturday • 9 PM",
      venue: "Bar Area",
      description: "Sing your heart out with friends",
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
      type: "entertainment",
      status: "upcoming",
      price: "No Cover",
      discount: "Happy hour prices",
      badge: "POPULAR",
      badgeColor: "#3742FA",
    },
    {
      id: "5",
      title: "Wine Tasting",
      date: "Oct 30 • 6 PM",
      venue: "Wine Cellar",
      description: "Premium wines with cheese pairing",
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
      type: "wine",
      status: "exclusive",
      price: "₹2499",
      discount: "Early bird 15% off",
      badge: "EXCLUSIVE",
      badgeColor: "#9C88FF",
    },
  ];

  return (
    <Animated.ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: parallaxScroll } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* PUA Activation Modal */}
      <Modal
        visible={showPUAModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPUAModal(false)}
      >
        <View style={styles.puaModalOverlay}>
          <Animated.View
            style={[
              styles.puaModal,
              {
                backgroundColor: colors.card,
                transform: [
                  {
                    scale: puaGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }
                ],
                opacity: puaGlowAnim
              }
            ]}
          >
            <Ionicons name="shield-checkmark" size={60} color="#4CD964" />
            <Text style={[styles.puaModalTitle, { color: colors.text }]}>{t("puaActivated")}</Text>
            <Text style={[styles.puaModalText, { color: colors.subText }]}>{t("puaDescription")}</Text>
            <Text style={styles.puaSecurityLevel}>{t("security")}: {securityLevel.toUpperCase()}</Text>
          </Animated.View>
        </View>
      </Modal>

      {/* ===== ENHANCED HEADER ===== */}
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            opacity: fadeAnim,
            transform: [
              { scale: scaleHeader },
              {
                translateY: parallaxScroll.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, -20],
                  extrapolate: 'clamp',
                })
              }
            ]
          }
        ]}
      >
        <View>
          <Animated.Text
            style={[
              styles.heyText,
              {
                color: colors.text,
                opacity: fadeAnim,
                transform: [
                  {
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    })
                  }
                ]
              }
            ]}
          >
            {t("discoverFlavors")}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.subText,
              {
                color: colors.subText,
                opacity: fadeAnim,
                transform: [
                  {
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    })
                  }
                ]
              }
            ]}
          >
            {t("discoverDelicious")}
          </Animated.Text>
        </View>

        <TouchableOpacity
          onPress={activatePUAMode}
          style={styles.puaButton}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.puaButtonInner,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }
                ]
              }
            ]}
          >
            <Ionicons
              name={activePUA ? "shield" : "shield-outline"}
              size={24}
              color={activePUA ? "#4CD964" : colors.primary}
            />
          </Animated.View>
          {activePUA && (
            <Animated.View
              style={[
                styles.puaActiveIndicator,
                {
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.15],
                        outputRange: [1, 1.2],
                      })
                    }
                  ]
                }
              ]}
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* ===== ENHANCED SEARCH BAR ===== */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: fadeInUp }
            ]
          }
        ]}
      >
        <Animated.View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [
                {
                  scale: searchFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.02],
                  })
                },
              ],
              shadowOpacity: searchFocusAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.2],
              }),
              shadowRadius: searchFocusAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 20],
              }),
            }
          ]}
        >
          <Ionicons name="search" size={20} color={colors.subText} style={styles.searchIcon} />
          <TextInput
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={colors.subText}
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setShowSuggestions(text.length > 0);
            }}
            onFocus={() => {
              Animated.spring(searchFocusAnim, {
                toValue: 1,
                tension: 40,
                friction: 7,
                useNativeDriver: true,
              }).start();
              if (search.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              Animated.spring(searchFocusAnim, {
                toValue: 0,
                tension: 40,
                friction: 7,
                useNativeDriver: true,
              }).start();
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            style={[styles.searchInput, { color: colors.text }]}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                Animated.spring(searchFocusAnim, {
                  toValue: 0,
                  tension: 40,
                  friction: 7,
                  useNativeDriver: true,
                }).start();
                setSearch("");
                setShowSuggestions(false);
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={colors.subText} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Enhanced Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <Animated.View
            style={[
              styles.suggestionsContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: searchFocusAnim,
                transform: [
                  {
                    translateY: searchFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    })
                  }
                ]
              }
            ]}
          >
            <View style={[styles.suggestionsHeader, {
              borderBottomColor: colors.border,
              backgroundColor: mode === 'dark' ? colors.background : '#FAFAFA'
            }]}>
              <Text style={[styles.suggestionsHeaderText, { color: colors.subText }]}>
                {t("suggestionsFor")} "<Text style={[styles.searchTermHighlight, { color: colors.primary }]}>{search}</Text>"
              </Text>
            </View>
            <ScrollView
              style={styles.suggestionsScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.suggestionItem,
                    {
                      borderBottomColor: colors.border,
                      backgroundColor: colors.card
                    },
                    index === suggestions.length - 1 && styles.suggestionItemLast
                  ]}
                  onPress={() => handleSuggestionSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.suggestionItemImageContainer, { backgroundColor: mode === 'dark' ? colors.background : '#F5F5F5' }]}>
                    <Image
                      source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                      style={styles.suggestionImage}
                    />
                  </View>
                  <View style={styles.suggestionItemDetails}>
                    <Text style={[styles.suggestionItemName, { color: colors.text }]}>{item.name}</Text>
                    {item.subname && (
                      <Text style={[styles.suggestionItemCategory, { color: colors.subText }]}>{item.subname}</Text>
                    )}
                    <View style={styles.suggestionItemRating}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={[styles.suggestionItemRatingText, { color: colors.text }]}>4.5</Text>
                    </View>
                  </View>
                  <View style={[styles.suggestionItemPriceContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.suggestionItemPrice, { color: colors.primary }]}>{item.items}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </Animated.View>

      {/* ===== PROMO SLIDER ===== */}
      <View style={styles.sliderSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("todaysSpecials")}
          </Text>
        </View>

        <FlatList
          ref={promoSliderRef}
          data={SLIDER_IMAGES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToAlignment="center"
          snapToInterval={width}
          keyExtractor={(_, i) => i.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollXP } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentPromoIndex(newIndex);
          }}
          renderItem={renderPromoSliderItem}
        />

        {/* Enhanced Dot Indicators */}
        <View style={styles.dotsContainer}>
          {SLIDER_IMAGES.map((_, i) => {
            const inputRange = [
              (i - 1) * width,
              i * width,
              (i + 1) * width,
            ];

            const dotWidth = scrollXP.interpolate({
              inputRange,
              outputRange: [6, 24, 6],
              extrapolate: 'clamp',
            });

            const dotScale = scrollXP.interpolate({
              inputRange,
              outputRange: [0.8, 1.2, 0.8],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i.toString()}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    transform: [{ scale: dotScale }],
                    backgroundColor: scrollXP.interpolate({
                      inputRange,
                      outputRange: ['#CCCCCC', colors.primary, '#CCCCCC'],
                      extrapolate: 'clamp',
                    }),
                  }
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* ===== FOOD CATEGORIES GRID ===== */}
      <View style={styles.categoriesSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("allCategories")}</Text>
          <View style={styles.headerRight}>
            <Text style={[styles.categoryCount, { color: colors.subText }]}>
              {filteredData.length}
            </Text>
            {filteredData.length > 6 && (
              <TouchableOpacity
                onPress={toggleShowAllCategories}
                style={styles.viewAllButton}
              >
                <Animated.Text
                  style={[
                    styles.seeAllText,
                    {
                      color: colors.primary,
                      transform: [
                        {
                          scale: pulseAnim.interpolate({
                            inputRange: [1, 1.15],
                            outputRange: [1, 1.05],
                          })
                        }
                      ]
                    }
                  ]}
                >
                  {showAllCategories ? t("showLess") : t("viewAll")}
                </Animated.Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {displayedData.length > 0 ? (
          <FlatList
            data={displayedData}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            renderItem={renderFoodCard}
            contentContainerStyle={styles.cardsContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="fast-food-outline" size={80} color={colors.subText} />
            <Text style={[styles.emptyText, { color: colors.text }]}>{t("noCategories")}</Text>
            <Text style={[styles.emptySubText, { color: colors.subText }]}>
              {t("trySearch")}
            </Text>
          </View>
        )}

        {/* Show More Button */}
        {!showAllCategories && filteredData.length > 6 && search.length === 0 && (
          <TouchableOpacity
            style={[styles.showMoreButton, {
              backgroundColor: mode === 'dark' ? colors.background + '80' : '#F8F9FF',
              borderColor: colors.primary + '20'
            }]}
            onPress={toggleShowAllCategories}
          >
            <Animated.Text
              style={[
                styles.showMoreText,
                {
                  color: colors.primary,
                  transform: [
                    {
                      translateY: pulseAnim.interpolate({
                        inputRange: [1, 1.15],
                        outputRange: [0, -2],
                      })
                    }
                  ]
                }
              ]}
            >
              + {filteredData.length - 6} {t("moreCategories")}
            </Animated.Text>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: pulseAnim.interpolate({
                      inputRange: [1, 1.15],
                      outputRange: ['0deg', '180deg'],
                    })
                  }
                ]
              }}
            >
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* Show Less Button */}
        {showAllCategories && filteredData.length > 6 && (
          <TouchableOpacity
            style={[styles.showLessButton, {
              backgroundColor: mode === 'dark' ? colors.background + '80' : '#F8F9FF',
              borderColor: colors.primary + '20'
            }]}
            onPress={toggleShowAllCategories}
          >
            <Text style={[styles.showLessText, { color: colors.primary }]}>
              {t("showLess")}
            </Text>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: pulseAnim.interpolate({
                      inputRange: [1, 1.15],
                      outputRange: ['0deg', '-180deg'],
                    })
                  }
                ]
              }}
            >
              <Ionicons name="chevron-up" size={20} color={colors.primary} />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      {/* ===== UPCOMING EVENTS SLIDER ===== */}
      <View style={styles.eventsSection}>
        <View style={styles.sectionTitleRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("upcomingEvents")}
            </Text>
            <Text style={[styles.eventsSubtitle, { color: colors.subText }]}>
              {t("eventsSubtitle")}
            </Text>
          </View>
        </View>

        {/* Horizontal Events Slider */}
        <View style={styles.eventsSliderWrapper}>
          <FlatList
            ref={eventsSliderRef}
            data={EVENTS_DATA}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToAlignment="center"
            snapToInterval={width}
            keyExtractor={(item) => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollXE } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentEventIndex(newIndex);
            }}
            renderItem={renderEventCard}
          />

          {/* Events Dots Indicator */}
          <View style={styles.eventsDotsContainer}>
            {EVENTS_DATA.map((_, i) => {
              const inputRange = [
                (i - 1) * width,
                i * width,
                (i + 1) * width,
              ];

              const dotScale = scrollXE.interpolate({
                inputRange,
                outputRange: [0.8, 1.2, 0.8],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={i.toString()}
                  style={[
                    styles.eventsDot,
                    {
                      transform: [{ scale: dotScale }],
                      backgroundColor: scrollXE.interpolate({
                        inputRange,
                        outputRange: ['#CCCCCC', colors.primary, '#CCCCCC'],
                        extrapolate: 'clamp',
                      }),
                    }
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>

      {/* PUA Footer Indicator */}
      {activePUA && (
        <Animated.View
          style={[
            styles.puaFooter,
            {
              backgroundColor: 'rgba(76, 217, 100, 0.1)',
              borderColor: 'rgba(76, 217, 100, 0.2)',
              opacity: puaGlowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              })
            }
          ]}
        >
          <Ionicons name="shield" size={16} color="#4CD964" />
          <Text style={styles.puaFooterText}>{t("proModeActive")}</Text>
        </Animated.View>
      )}

      {/* ITEM MODAL FOR DIRECT ORDER - UPDATED FOR GUEST */}
      {selectedItem && (
        <Modal
          transparent
          visible={showItemModal}
          animationType="slide"
          onRequestClose={() => {
            setShowItemModal(false);
            setSelectedItem(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => {
                setShowItemModal(false);
                setSelectedItem(null);
              }}
            />
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Image
                source={typeof selectedItem.image === 'string' ? { uri: selectedItem.image } : selectedItem.image}
                style={styles.modalImage}
              />

              <View style={styles.modalHeaderInfo}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemName, { color: colors.text }]}>{selectedItem.name}</Text>
                  <Text style={[styles.modalItemDescription, { color: colors.subText }]}>{selectedItem.description || selectedItem.subname}</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setShowItemModal(false);
                    setSelectedItem(null);
                  }}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Quantity Selector */}
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={[styles.quantityButton, { borderColor: colors.border }]}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={[styles.quantityButtonText, { color: colors.text }]}>-</Text>
                </TouchableOpacity>
                
                <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
                
                <TouchableOpacity
                  style={[styles.quantityButton, { borderColor: colors.border }]}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={[styles.quantityButtonText, { color: colors.text }]}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                {/* ADD BUTTON (Quick add to cart) */}
                <TouchableOpacity
                  style={[styles.addButton, { borderColor: colors.primary }]}
                  onPress={() => addOrder(selectedItem)}
                >
                  <Text style={[styles.addButtonText, { color: colors.primary }]}>
                    {t("add")}
                  </Text>
                </TouchableOpacity>

                {/* ADD TO CART BUTTON (Add and go to cart) */}
                <TouchableOpacity
                  style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
                  onPress={() => addToCart(selectedItem)}
                >
                  <Ionicons name="cart" size={20} color="#FFF" />
                  <Text style={styles.addToCartButtonText}>
                    {t("addToCart")} • ₹{(selectedItem.price * quantity).toFixed(0)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Reusable Success Popup */}
      <SuccessPopup 
        visible={showSuccessPopup} 
        itemName={addedItemName} 
        onClose={() => setShowSuccessPopup(false)} 
      />
    </Animated.ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderBottomWidth: 1,
  },
  heyText: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    opacity: 0.8,
  },
  puaButton: {
    padding: 10,
    position: "relative",
  },
  puaButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  puaActiveIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CD964',
  },
  puaModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  puaModal: {
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  puaModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  puaModalText: {
    fontSize: 14,
    marginBottom: 12,
  },
  puaSecurityLevel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CD964',
    letterSpacing: 1,
  },
  addButton: {
    height: 56,
    paddingHorizontal: 25,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "700"
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -10,
    marginBottom: 20,
    position: "relative",
    zIndex: 1000,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    zIndex: 10,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    marginLeft: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 20,
    right: 20,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
    borderWidth: 1,
    maxHeight: 350,
  },
  suggestionsHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  suggestionsHeaderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchTermHighlight: {
    fontWeight: '700',
  },
  suggestionsScrollView: {
    borderRadius: 12,
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  suggestionItemImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  suggestionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  suggestionItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  suggestionItemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionItemCategory: {
    fontSize: 12,
    marginBottom: 4,
  },
  suggestionItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionItemRatingText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },
  suggestionItemPriceContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  suggestionItemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  sliderSection: {
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  eventsSubtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  slide: {
    width: width,
    height: 200,
    position: "relative",
  },
  sliderImage: {
    width: "100%",
    height: "100%",
  },
  slideOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  slideContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  offerTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  offerTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  slideSubtitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardsContainer: {
    paddingBottom: 8,
  },
  card: {
    width: "48%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  cardTouchable: {
    flex: 1,
  },
  cardImage: {
    width: "100%",
    height: 180,
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    borderRadius: 20,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingParticle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -20,
    right: -20,
  },
  cardContent: {
    padding: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    marginBottom: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  itemCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  itemCountText: {
    fontSize: 11,
    fontWeight: '500',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
  },
  showMoreText: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  showLessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  showLessText: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
  eventsSection: {
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  eventsSliderWrapper: {
    position: 'relative',
  },
  eventSlide: {
    width: width,
    height: 240,
  },
  eventTouchable: {
    flex: 1,
  },
  eventImage: {
    width: "100%",
    height: "100%",
    justifyContent: 'space-between',
  },
  eventImageStyle: {
    borderRadius: 0,
  },
  eventOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  eventBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eventBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  eventContent: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  eventTypeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  eventPrice: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  eventPriceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 24,
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventInfoText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  discountTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  eventsDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  eventsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  puaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  puaFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CD964',
    marginLeft: 8,
    letterSpacing: 1,
  },
  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: height * 0.4,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  modalHeaderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalItemName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalItemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 'auto',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 28,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    gap: 10,
  },
  addToCartButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});