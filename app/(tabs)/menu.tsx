import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
  Animated,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { ActivityIndicator } from "react-native";
import axios from "axios";
import { BASE_URL } from "@/config/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { emitCartUpdate } from "../../constants/CartEventEmitter";
import { useTheme } from "../data/ThemeContext";
import SuccessPopup from "../../components/SuccessPopup";

const { width, height } = Dimensions.get("window");

/* ================= AVAILABLE IMAGES ================= */
const AVAILABLE_IMAGES = {
  si: require("../../assets/images/si.png"),
  bn: require("../../assets/images/bn.png"),
  mb: require("../../assets/images/mb.png"),
  soup: require("../../assets/images/soup.png"),
  bs: require("../../assets/images/bs.png"),
  ev: require("../../assets/images/ev.png"),
  fe: require("../../assets/images/fe.png"),
  mc: require("../../assets/images/mc.png"),
  ms: require("../../assets/images/ms.png"),
  of: require("../../assets/images/of.png"),
  r: require("../../assets/images/r.png"),
  ts: require("../../assets/images/ts.png"),
  roti: require("../../assets/images/roti.png"),
};

// 🔥 TRANSLATIONS FOR 5 LANGUAGES
const translations = {
  en: {
    loading: "Loading delicious menu...",
    searchPlaceholder: "Search food items...",
    suggestionsFor: "Suggestions for",
    filters: "Filters",
    filtersApplied: "Filters • Applied",
    applyFilters: "Apply Filters",
    resetAll: "Reset All",
    sortBy: "Sort By",
    relevance: "Relevance",
    priceLowHigh: "Price: Low to High",
    priceHighLow: "Price: High to Low",
    rating: "Rating",
    name: "Name",
    minimumRating: "Minimum Rating",
    allRatings: "All Ratings",
    stars35: "3.5+ Stars",
    stars40: "4.0+ Stars",
    stars45: "4.5+ Stars",
    priceRange: "Price Range",
    allPrices: "All Prices",
    under100: "Under ₹100",
    between100200: "₹100 - ₹200",
    above200: "Above ₹200",
    noItemsFound: "No items found",
    resetAllFilters: "Reset All Filters",
    category: "Category",
    addToCart: "Add to Cart",
    add: "Add",
    addedToCart: "Added to Cart",
    itemAdded: "Item added to your cart",
    guestMode: "Guest Mode",
    loginToSync: "Login to sync your cart",
    quickFilters: {
      topRated: "Top Rated",
      lowToHigh: "₹ Low to High",
    },
    itemModal: {
      addToCart: "Add to Cart",
    },
  },

  hi: {
    loading: "स्वादिष्ट मेन्यू लोड हो रहा है...",
    searchPlaceholder: "खाद्य पदार्थ खोजें...",
    suggestionsFor: "सुझाव",
    filters: "फ़िल्टर",
    filtersApplied: "फ़िल्टर • लागू",
    applyFilters: "फ़िल्टर लागू करें",
    resetAll: "सभी रीसेट करें",
    sortBy: "क्रमबद्ध करें",
    relevance: "प्रासंगिकता",
    priceLowHigh: "मूल्य: कम से अधिक",
    priceHighLow: "मूल्य: अधिक से कम",
    rating: "रेटिंग",
    name: "नाम",
    minimumRating: "न्यूनतम रेटिंग",
    allRatings: "सभी रेटिंग",
    stars35: "3.5+ स्टार",
    stars40: "4.0+ स्टार",
    stars45: "4.5+ स्टार",
    priceRange: "मूल्य सीमा",
    allPrices: "सभी मूल्य",
    under100: "₹100 से कम",
    between100200: "₹100 - ₹200",
    above200: "₹200 से अधिक",
    noItemsFound: "कोई आइटम नहीं मिला",
    resetAllFilters: "सभी फ़िल्टर रीसेट करें",
    category: "श्रेणी",
    addToCart: "कार्ट में जोड़ें",
    add: "जोड़ें",
    addedToCart: "कार्ट में जोड़ा गया",
    itemAdded: "आइटम आपके कार्ट में जोड़ दिया गया है",
    guestMode: "अतिथि मोड",
    loginToSync: "अपना कार्ट सिंक करने के लिए लॉगिन करें",
    quickFilters: {
      topRated: "टॉप रेटेड",
      lowToHigh: "₹ कम से अधिक",
    },
    itemModal: {
      addToCart: "कार्ट में जोड़ें",
    },
  },

  mr: {
    loading: "स्वादिष्ट मेनू लोड होत आहे...",
    searchPlaceholder: "अन्न शोधा...",
    suggestionsFor: "सूचना",
    filters: "फिल्टर",
    filtersApplied: "फिल्टर • लागू",
    applyFilters: "फिल्टर लागू करा",
    resetAll: "सर्व रीसेट करा",
    sortBy: "क्रमवारी लावा",
    relevance: "संबंधितता",
    priceLowHigh: "किंमत: कमी ते जास्त",
    priceHighLow: "किंमत: जास्त ते कमी",
    rating: "रेटिंग",
    name: "नाव",
    minimumRating: "किमान रेटिंग",
    allRatings: "सर्व रेटिंग",
    stars35: "3.5+ स्टार",
    stars40: "4.0+ स्टार",
    stars45: "4.5+ स्टार",
    priceRange: "किंमत श्रेणी",
    allPrices: "सर्व किंमती",
    under100: "₹100 पेक्षा कमी",
    between100200: "₹100 - ₹200",
    above200: "₹200 पेक्षा जास्त",
    noItemsFound: "कोणतीही वस्तू सापडली नाही",
    resetAllFilters: "सर्व फिल्टर रीसेट करा",
    category: "श्रेणी",
    addToCart: "कार्टमध्ये जोडा",
    add: "जोडा",
    addedToCart: "कार्टमध्ये जोडले",
    itemAdded: "वस्तू तुमच्या कार्टमध्ये जोडली गेली आहे",
    guestMode: "पाहुणा मोड",
    loginToSync: "तुमचे कार्ट सिंक करण्यासाठी लॉगिन करा",
    quickFilters: {
      topRated: "टॉप रेटेड",
      lowToHigh: "₹ कमी ते जास्त",
    },
    itemModal: {
      addToCart: "कार्टमध्ये जोडा",
    },
  },

  ta: {
    loading: "சுவையான மெனு ஏற்றப்படுகிறது...",
    searchPlaceholder: "உணவு பொருட்களை தேடுங்கள்...",
    suggestionsFor: "பரிந்துரைகள்",
    filters: "வடிப்பான்கள்",
    filtersApplied: "வடிப்பான்கள் • பயன்படுத்தப்பட்டது",
    applyFilters: "வடிப்பான்களை பயன்படுத்து",
    resetAll: "அனைத்தையும் மீட்டமை",
    sortBy: "வரிசைப்படுத்து",
    relevance: "பொருத்தம்",
    priceLowHigh: "விலை: குறைந்தது முதல் அதிகம்",
    priceHighLow: "விலை: அதிகம் முதல் குறைந்தது",
    rating: "மதிப்பீடு",
    name: "பெயர்",
    minimumRating: "குறைந்தபட்ச மதிப்பீடு",
    allRatings: "அனைத்து மதிப்பீடுகள்",
    stars35: "3.5+ நட்சத்திரங்கள்",
    stars40: "4.0+ நட்சத்திரங்கள்",
    stars45: "4.5+ நட்சத்திரங்கள்",
    priceRange: "விலை வரம்பு",
    allPrices: "அனைத்து விலைகள்",
    under100: "₹100 க்கும் குறைவு",
    between100200: "₹100 - ₹200",
    above200: "₹200 க்கும் மேல்",
    noItemsFound: "எந்த பொருளும் கிடைக்கவில்லை",
    resetAllFilters: "அனைத்து வடிப்பான்களையும் மீட்டமை",
    category: "வகை",
    addToCart: "வண்டியில் சேர்க்கவும்",
    add: "சேர்",
    addedToCart: "வண்டியில் சேர்க்கப்பட்டது",
    itemAdded: "பொருள் உங்கள் வண்டியில் சேர்க்கப்பட்டது",
    guestMode: "விருந்தினர் முறை",
    loginToSync: "உங்கள் வண்டியை ஒத்திசைக்க உள்நுழைக",
    quickFilters: {
      topRated: "சிறந்த மதிப்பீடு",
      lowToHigh: "₹ குறைந்தது முதல் அதிகம்",
    },
    itemModal: {
      addToCart: "வண்டியில் சேர்க்கவும்",
    },
  },

  gu: {
    loading: "સ્વાદિષ્ટ મેનુ લોડ થઈ રહ્યું છે...",
    searchPlaceholder: "ખાદ્ય વસ્તુઓ શોધો...",
    suggestionsFor: "સૂચનો",
    filters: "ફિલ્ટર્સ",
    filtersApplied: "ફિલ્ટર્સ • લાગુ કરેલ",
    applyFilters: "ફિલ્ટર્સ લાગુ કરો",
    resetAll: "બધું રીસેટ કરો",
    sortBy: "ક્રમમાં ગોઠવો",
    relevance: "સુસંગતતા",
    priceLowHigh: "કિંમત: ઓછી થી વધુ",
    priceHighLow: "કિંમત: વધુ થી ઓછી",
    rating: "રેટિંગ",
    name: "નામ",
    minimumRating: "ન્યૂનતમ રેટિંગ",
    allRatings: "બધા રેટિંગ્સ",
    stars35: "3.5+ સ્ટાર",
    stars40: "4.0+ સ્ટાર",
    stars45: "4.5+ સ્ટાર",
    priceRange: "કિંમત શ્રેણી",
    allPrices: "બધી કિંમતો",
    under100: "₹100 થી ઓછી",
    between100200: "₹100 - ₹200",
    above200: "₹200 થી વધુ",
    noItemsFound: "કોઈ વસ્તુ મળી નથી",
    resetAllFilters: "બધા ફિલ્ટર્સ રીસેટ કરો",
    category: "શ્રેણી",
    addToCart: "કાર્ટમાં ઉમેરો",
    add: "ઉમેરો",
    addedToCart: "કાર્ટમાં ઉમેરાયું",
    itemAdded: "વસ્તુ તમારા કાર્ટમાં ઉમેરાઈ ગઈ છે",
    guestMode: "મહેમાન મોડ",
    loginToSync: "તમારું કાર્ટ સિંક કરવા માટે લૉગિન કરો",
    quickFilters: {
      topRated: "ટોપ રેટેડ",
      lowToHigh: "₹ ઓછી થી વધુ",
    },
    itemModal: {
      addToCart: "કાર્ટમાં ઉમેરો",
    },
  },
};

// Filter types
type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'name';
type RatingFilter = 'all' | '3.5+' | '4.0+' | '4.5+';
type PriceFilter = 'all' | 'under-100' | '100-200' | '200+';

// Guest Cart Item Type
interface GuestCartItem {
  _id: string;
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

// Helper function to highlight search term in text
const HighlightText = ({ text, searchTerm, style, colors }: { text: string; searchTerm: string; style: any; colors: any }) => {
  if (!searchTerm.trim()) {
    return <Text style={style}>{text}</Text>;
  }

  const lowerText = text.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const index = lowerText.indexOf(lowerSearchTerm);

  if (index === -1) {
    return <Text style={style}>{text}</Text>;
  }

  const before = text.substring(0, index);
  const matched = text.substring(index, index + searchTerm.length);
  const after = text.substring(index + searchTerm.length);

  return (
    <Text style={style}>
      {before}
      <Text style={[style, { color: colors.primary, fontWeight: '800' }]}>
        {matched}
      </Text>
      {after}
    </Text>
  );
};

export default function MenuScreen() {
  const { colors, mode } = useTheme();
  const router = useRouter();
  const { categoryId } = useLocalSearchParams();

  // Language state
  const [languageCode, setLanguageCode] = useState("en");

  // Load saved language and guest cart on focus
  useFocusEffect(
    useCallback(() => {
      loadLanguage();
      loadGuestCart();
    }, [])
  );

  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang && translations[savedLang as keyof typeof translations]) {
        setLanguageCode(savedLang);
      }

      const savedFavs = await AsyncStorage.getItem('favorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }

      // Remove old loadGuestCart call since we now handle it in useFocusEffect directly
    } catch (error) {
      console.log('Error loading language or favorites:', error);
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
        import('expo-haptics').then(Haptics => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
      }
    } catch (error) {
      console.log('Error toggling favorite:', error);
    }
  };

  // 🔥 Translation function
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[languageCode as keyof typeof translations];

    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Fallback to English
        let fallback: any = translations.en;
        for (const fk of keys) {
          fallback = fallback?.[fk];
        }
        return fallback || key;
      }
    }
    return value || key;
  };

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Guest cart state
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [addedItemName, setAddedItemName] = useState("");

  // Filter states
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [compactView, setCompactView] = useState(false);

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const filterSlideAnim = useRef(new Animated.Value(300)).current;
  const itemAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const suggestionAnim = useRef(new Animated.Value(0)).current;

  // 🔥 FIX: Check if any filter is active (excluding search)
  const isFilterActive = () => {
    return sortBy !== 'relevance' || ratingFilter !== 'all' || priceFilter !== 'all';
  };

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(itemAnim, {
        toValue: 0,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Filter modal animation
  useEffect(() => {
    if (showFiltersModal) {
      Animated.timing(filterSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      filterSlideAnim.setValue(300);
    }
  }, [showFiltersModal]);

  useEffect(() => {
    fetchMenuItems();
  }, []);



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

  const fetchMenuItems = async () => {
    try {
      setLoading(true);

      let url = `${BASE_URL}/api/foods`;

      if (categoryId) {
        url = `${BASE_URL}/api/foods?category=${categoryId}`;
      }

      const response = await axios.get(url);
      setMenuItems(response.data);

    } catch (error) {
      console.log("Menu Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Helper function to extract numeric price
  const extractPrice = (price: any): number => {
    return typeof price === "number" ? price : 0;
  };

  // Function to get search suggestions
  const getSearchSuggestions = (query: string) => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase().trim();

    const suggestions = menuItems
      .filter(item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8);

    return suggestions;
  };

  // Function to get ALL items based on search and filters
  const getFilteredItems = () => {
    let items = [...menuItems];

    // Apply search filter
    if (searchQuery.trim()) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply rating filter
    if (ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter.replace('+', ''));
      items = items.filter(item => (item.rating || 4) >= minRating);
    }

    // Apply price filter
    if (priceFilter !== 'all') {
      items = items.filter(item => {
        const price = extractPrice(item.price);
        switch (priceFilter) {
          case 'under-100':
            return price < 100;
          case '100-200':
            return price >= 100 && price <= 200;
          case '200+':
            return price > 200;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    items.sort((a, b) => {
      const priceA = extractPrice(a.price);
      const priceB = extractPrice(b.price);

      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'rating':
          return (b.rating || 4) - (a.rating || 4);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'relevance':
        default:
          return 0;
      }
    });

    return items;
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const suggestions = getSearchSuggestions(searchQuery);
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
      Animated.spring(suggestionAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
      suggestionAnim.setValue(0);
    }
  }, [searchQuery]);

  const itemsToDisplay = getFilteredItems();

  const handleSearchItemSelect = (item: any) => {
    setSearchQuery(item.name);
    setSelectedItem(item);
    setShowSuggestions(false);
    setShowItemModal(true);
  };

  // Add to guest cart function
  const addToGuestCart = (item: any, qty: number = 1) => {
    const existingItemIndex = guestCart.findIndex(cartItem => cartItem.foodId === item._id);
    
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
        foodId: item._id,
        name: item.name,
        price: item.price,
        quantity: qty,
        image: item.image,
        category: item.category
      };
      updatedCart = [...guestCart, newItem];
    }
    
    saveGuestCart(updatedCart);
    
    const updatedCount = updatedCart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    emitCartUpdate(updatedCount);
    
    // Show success message
    setAddedItemName(item.name);
    setShowSuccessPopup(true);
    
    // Optional: Haptic feedback
    if (Platform.OS === 'ios') {
      import('expo-haptics').then(Haptics => 
        Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success)
      );
    }
  };

  // Modified addToCart function for guest users
  const addToCart = async (item: any) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        // Guest user - save to local storage
        addToGuestCart(item, quantity);
        
        setShowItemModal(false);
        setQuantity(1);
        
        // Navigate to cart
        router.push("/cart");
        return;
      }

      // Logged in user - add to server cart
      await axios.post(
        `${BASE_URL}/api/cart`,
        {
          foodId: item._id,
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
      
      // Show success message for logged in user
      setAddedItemName(item.name);
      setShowSuccessPopup(true);
      
      router.push("/cart");

    } catch (error: any) {
      console.log("CART ERROR:", error.response?.data || error.message);
      
      // Handle 401 error
      if (error.response?.status === 401) {
        Alert.alert(
          "Session Expired",
          "Please login again",
          [
            { text: "OK", onPress: () => router.push("/login") }
          ]
        );
      }
    }
  };

  // Updated function for the "Add" button (Quick add to cart for guest)
  const addOrder = async (item) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        // Guest user - quick add
        addToGuestCart(item, quantity);
        
        setShowItemModal(false);
        setSelectedItem(null);
        setQuantity(1);
        
        setAddedItemName(item.name);
        setShowSuccessPopup(true);
        return;
      }

      // Logged in user - add to server cart
      await axios.post(
        `${BASE_URL}/api/cart`,
        {
          foodId: item._id,
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

        setAddedItemName(item.name);
        setShowSuccessPopup(true);

      setShowItemModal(false);
      setSelectedItem(null);
      setQuantity(1);

    } catch (error) {
      console.log("QUICK ADD ERROR:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        Alert.alert(
          "Session Expired",
          "Please login again",
          [
            { text: "OK", onPress: () => router.push("/login") }
          ]
        );
      } else {
        Alert.alert("Error", "Could not add item to cart. Please try again.");
      }
    }
  };

  const updateQuantity = (_id: string, delta: number) => {
    // Update guest cart quantity
    const updatedCart = guestCart.map(item =>
      item._id === _id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    saveGuestCart(updatedCart);
  };

  const removeFromCart = (id: string) => {
    const updatedCart = guestCart.filter(item => item._id !== id);
    saveGuestCart(updatedCart);
  };

  // Reset all filters
  const resetFilters = () => {
    setSortBy('relevance');
    setRatingFilter('all');
    setPriceFilter('all');
    // 🔥 Don't reset search query here
  };

  const renderStars = (rating?: number) => {
    const safeRating = rating ?? 4;

    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= safeRating ? "star" : "star-outline"}
            size={12}
            color={star <= safeRating ? "#FFD700" : colors.border}
          />
        ))}
        <Text style={[styles.ratingText, { color: colors.text }]}>
          {safeRating.toFixed(1)}
        </Text>
      </View>
    );
  };

  // 🔥 FIX: Always use full card layout, only use compact when filters are active
  const renderCard = (item: any) => {
    if (compactView) {
      // Compact card (when filters are active)
      return (
        <TouchableOpacity
          style={[styles.compactCard, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}
          activeOpacity={0.7}
          onPress={() => {
            setSelectedItem(item);
            setShowItemModal(true);
          }}
        >
          <View style={styles.compactImageContainer}>
            <Image
              source={{
                uri: item.image && item.image.startsWith("http")
                  ? item.image
                  : "https://via.placeholder.com/150"
              }}
              style={styles.compactImage}
            />
            <View style={[styles.vegIndicator, { borderColor: colors.success }]}>
              <View style={[styles.vegDot, { backgroundColor: colors.success }]} />
            </View>
          </View>

          <View style={styles.compactContent}>
            <View style={styles.compactHeader}>
              <Text style={[styles.compactName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
              <View style={[styles.compactCategoryTag, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.compactCategoryText, { color: colors.primary }]}>{item.category}</Text>
              </View>
            </View>

            <Text style={[styles.compactDescription, { color: colors.subText }]} numberOfLines={2}>
              {item.description}
            </Text>

            {renderStars(item.rating || 4)}

            <View style={styles.compactFooter}>
              <Text style={[styles.compactPrice, { color: colors.primary }]}>₹{item.price}</Text>
              <TouchableOpacity
                style={[styles.compactAddButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setSelectedItem(item);
                  setQuantity(1);
                  setShowItemModal(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.compactAddButtonText}>{t('addToCart')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      // Full card (default view - even with search)
      return (
        <TouchableOpacity
          style={[styles.fullCard, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}
          activeOpacity={0.7}
          onPress={() => {
            setSelectedItem(item);
            setShowItemModal(true);
          }}
        >
          <View style={styles.fullImageContainer}>
            <Image
              source={{
                uri: item.image && item.image.startsWith("http")
                  ? item.image
                  : "https://via.placeholder.com/150"
              }}
              style={styles.fullImage}
            />
            <View style={[styles.vegIndicator, { borderColor: colors.success }]}>
              <View style={[styles.vegDot, { backgroundColor: colors.success }]} />
            </View>
          </View>

          <View style={styles.fullContent}>
            <View style={styles.fullHeader}>
              <Text style={[styles.fullName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={[styles.fullCategoryTag, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.fullCategoryText, { color: colors.primary }]}>
                  {item.category}
                </Text>
              </View>
            </View>

            <Text style={[styles.fullDescription, { color: colors.subText }]} numberOfLines={2}>
              {item.description}
            </Text>

            {renderStars(item.rating || 4)}

            <View style={styles.fullFooter}>
              <Text style={[styles.fullPrice, { color: colors.primary }]}>₹{item.price}</Text>

              <TouchableOpacity
                style={[styles.fullAddButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setSelectedItem(item);
                  setQuantity(1);
                  setShowItemModal(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.fullAddButtonText}>{t('addToCart')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  // Calculate cart total for display
  const cartTotal = guestCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = guestCart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
          }
        ]}
      >
        {/* ===== SUCCESS MESSAGE ===== */}


        {/* ===== SEARCH BAR ===== */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBox, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}>
            <Ionicons name="search" size={20} color={colors.subText} style={styles.searchIcon} />
            <TextInput
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={colors.subText}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.trim()) {
                  setShowSuggestions(true);
                }
              }}
              style={[styles.searchInput, { color: colors.text }]}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={colors.subText} />
              </TouchableOpacity>
            )}
          </View>

          {/* ===== SEARCH SUGGESTIONS ===== */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <Animated.View style={[
              styles.suggestionsContainer,
              keyboardVisible && styles.suggestionsContainerWithKeyboard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: suggestionAnim,
                transform: [{
                  translateY: suggestionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0]
                  })
                }]
              }
            ]}>
              <View style={[styles.suggestionsHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.suggestionsHeaderText, { color: colors.subText }]}>
                  {t('suggestionsFor')} "<Text style={{ color: colors.primary }}>{searchQuery}</Text>"
                </Text>
              </View>
              <ScrollView
                style={styles.suggestionsScrollView}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {searchSuggestions.map((item, index) => (
                  <TouchableOpacity
                    key={`${item._id}-${index}`}
                    style={[
                      styles.suggestionItem,
                      { borderBottomColor: colors.border },
                      index === searchSuggestions.length - 1 && styles.suggestionItemLast
                    ]}
                    onPress={() => handleSearchItemSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Animated.View
                      style={[
                        styles.suggestionItemImageContainer,
                        {
                          opacity: fadeAnim,
                          transform: [{ translateX: slideAnim }]
                        }
                      ]}
                    >
                      <Image
                        source={{
                          uri: item.image && item.image.startsWith("http")
                            ? item.image
                            : "https://via.placeholder.com/150"
                        }}
                        style={styles.suggestionImage}
                      />
                    </Animated.View>
                    <View style={styles.suggestionItemDetails}>
                      <HighlightText
                        text={item.name}
                        searchTerm={searchQuery}
                        style={[styles.suggestionItemName, { color: colors.text }]}
                        colors={colors}
                      />
                      <HighlightText
                        text={item.category}
                        searchTerm={searchQuery}
                        style={[styles.suggestionItemCategory, { color: colors.subText }]}
                        colors={colors}
                      />
                      <View style={styles.suggestionItemRating}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={[styles.suggestionItemRatingText, { color: colors.text }]}>
                          {(item.rating || 4).toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.suggestionItemPriceContainer, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.suggestionItemPrice, { color: colors.primary }]}>₹{item.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}
        </View>

        {/* ===== FILTERS BAR ===== */}
        <View style={[styles.filtersBar, {
          backgroundColor: colors.card,
          borderBottomColor: colors.border
        }]}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: mode === 'dark' ? colors.background : '#F8F8F8' },
              compactView && [styles.filterButtonActive, { borderColor: colors.primary }]
            ]}
            onPress={() => setShowFiltersModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="filter" size={16} color={compactView ? colors.primary : colors.subText} />
            <Text style={[
              styles.filterButtonText,
              { color: colors.subText },
              compactView && [styles.filterButtonTextActive, { color: colors.primary }]
            ]}>
              {t('filters')} {compactView && `• ${t('filtersApplied').split('•')[1]}`}
            </Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickFiltersContainer}
            contentContainerStyle={styles.quickFiltersContent}
          >
            <TouchableOpacity
              style={[
                styles.quickFilter,
                { backgroundColor: mode === 'dark' ? colors.background : '#F8F8F8' },
                ratingFilter === '4.5+' && [styles.quickFilterActive, { borderColor: colors.primary }]
              ]}
              onPress={() => {
                setRatingFilter(ratingFilter === '4.5+' ? 'all' : '4.5+');
              }}
              activeOpacity={0.6}
            >
              <Ionicons name="star" size={14} color={ratingFilter === '4.5+' ? colors.primary : colors.subText} />
              <Text style={[
                styles.quickFilterText,
                { color: colors.subText },
                ratingFilter === '4.5+' && [styles.quickFilterTextActive, { color: colors.primary }]
              ]}>
                4.5+
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickFilter,
                { backgroundColor: mode === 'dark' ? colors.background : '#F8F8F8' },
                priceFilter === 'under-100' && [styles.quickFilterActive, { borderColor: colors.primary }]
              ]}
              onPress={() => {
                setPriceFilter(priceFilter === 'under-100' ? 'all' : 'under-100');
              }}
              activeOpacity={0.6}
            >
              <Text style={[
                styles.quickFilterText,
                { color: colors.subText },
                priceFilter === 'under-100' && [styles.quickFilterTextActive, { color: colors.primary }]
              ]}>
                {t('under100')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickFilter,
                { backgroundColor: mode === 'dark' ? colors.background : '#F8F8F8' },
                sortBy === 'price-low' && [styles.quickFilterActive, { borderColor: colors.primary }]
              ]}
              onPress={() => {
                setSortBy(sortBy === 'price-low' ? 'relevance' : 'price-low');
              }}
              activeOpacity={0.6}
            >
              <Text style={[
                styles.quickFilterText,
                { color: colors.subText },
                sortBy === 'price-low' && [styles.quickFilterTextActive, { color: colors.primary }]
              ]}>
                {t('quickFilters.lowToHigh')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickFilter,
                { backgroundColor: mode === 'dark' ? colors.background : '#F8F8F8' },
                sortBy === 'rating' && [styles.quickFilterActive, { borderColor: colors.primary }]
              ]}
              onPress={() => {
                setSortBy(sortBy === 'rating' ? 'relevance' : 'rating');
              }}
              activeOpacity={0.6}
            >
              <Ionicons name="trending-up" size={14} color={sortBy === 'rating' ? colors.primary : colors.subText} />
              <Text style={[
                styles.quickFilterText,
                { color: colors.subText },
                sortBy === 'rating' && [styles.quickFilterTextActive, { color: colors.primary }]
              ]}>
                {t('quickFilters.topRated')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ===== MAIN CONTENT ===== */}
        {itemsToDisplay.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fast-food-outline" size={80} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.subText }]}>{t('noItemsFound')}</Text>
            <TouchableOpacity
              style={[styles.resetAllButton, { backgroundColor: colors.primary }]}
              onPress={resetFilters}
            >
              <Text style={styles.resetAllButtonText}>{t('resetAllFilters')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={itemsToDisplay}
            key={compactView ? "compact" : "full"}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => renderCard(item)}
            numColumns={compactView ? 2 : 1}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              compactView ? styles.compactMenuList : styles.fullMenuList
            }
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={10}
            removeClippedSubviews={true}
          />
        )}

        {/* ===== FILTERS MODAL ===== */}
        <Modal
          transparent
          visible={showFiltersModal}
          animationType="fade"
          onRequestClose={() => setShowFiltersModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowFiltersModal(false)}
            />

            <Animated.View
              style={[
                styles.filtersModalContent,
                {
                  backgroundColor: colors.card,
                  transform: [{ translateY: filterSlideAnim }]
                }
              ]}
            >
              <View style={[styles.filtersModalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.filtersModalTitle, { color: colors.text }]}>{t('filters')}</Text>
                <TouchableOpacity
                  onPress={() => setShowFiltersModal(false)}
                  style={styles.filtersModalCloseButton}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.filtersModalBody}
                showsVerticalScrollIndicator={false}
              >
                {/* Sort By Section */}
                <View style={styles.filterSection}>
                  <Text style={[styles.filterSectionTitle, { color: colors.text }]}>{t('sortBy')}</Text>
                  <View style={styles.filterOptions}>
                    {(['relevance', 'price-low', 'price-high', 'rating', 'name'] as SortOption[]).map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.filterOption,
                          {
                            backgroundColor: mode === 'dark' ? colors.background : '#F8F8F8',
                            borderColor: colors.border
                          },
                          sortBy === option && [styles.filterOptionActive, { borderColor: colors.primary }]
                        ]}
                        onPress={() => setSortBy(option)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          { color: colors.subText },
                          sortBy === option && [styles.filterOptionTextActive, { color: colors.primary }]
                        ]}>
                          {option === 'relevance' && t('relevance')}
                          {option === 'price-low' && t('priceLowHigh')}
                          {option === 'price-high' && t('priceHighLow')}
                          {option === 'rating' && t('rating')}
                          {option === 'name' && t('name')}
                        </Text>
                        {sortBy === option && (
                          <Ionicons name="checkmark" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Rating Filter Section */}
                <View style={styles.filterSection}>
                  <Text style={[styles.filterSectionTitle, { color: colors.text }]}>{t('minimumRating')}</Text>
                  <View style={styles.filterOptions}>
                    {(['all', '3.5+', '4.0+', '4.5+'] as RatingFilter[]).map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.filterOption,
                          {
                            backgroundColor: mode === 'dark' ? colors.background : '#F8F8F8',
                            borderColor: colors.border
                          },
                          ratingFilter === option && [styles.filterOptionActive, { borderColor: colors.primary }]
                        ]}
                        onPress={() => setRatingFilter(option)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          { color: colors.subText },
                          ratingFilter === option && [styles.filterOptionTextActive, { color: colors.primary }]
                        ]}>
                          {option === 'all' && t('allRatings')}
                          {option === '3.5+' && t('stars35')}
                          {option === '4.0+' && t('stars40')}
                          {option === '4.5+' && t('stars45')}
                        </Text>
                        {ratingFilter === option && (
                          <Ionicons name="checkmark" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Price Filter Section */}
                <View style={styles.filterSection}>
                  <Text style={[styles.filterSectionTitle, { color: colors.text }]}>{t('priceRange')}</Text>
                  <View style={styles.filterOptions}>
                    {(['all', 'under-100', '100-200', '200+'] as PriceFilter[]).map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.filterOption,
                          {
                            backgroundColor: mode === 'dark' ? colors.background : '#F8F8F8',
                            borderColor: colors.border
                          },
                          priceFilter === option && [styles.filterOptionActive, { borderColor: colors.primary }]
                        ]}
                        onPress={() => setPriceFilter(option)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          { color: colors.subText },
                          priceFilter === option && [styles.filterOptionTextActive, { color: colors.primary }]
                        ]}>
                          {option === 'all' && t('allPrices')}
                          {option === 'under-100' && t('under100')}
                          {option === '100-200' && t('between100200')}
                          {option === '200+' && t('above200')}
                        </Text>
                        {priceFilter === option && (
                          <Ionicons name="checkmark" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={[styles.filtersModalFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  style={[
                    styles.resetFiltersButton,
                    {
                      backgroundColor: mode === 'dark' ? colors.background : '#F8F8F8',
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => {
                    resetFilters();
                    setShowFiltersModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resetFiltersButtonText, { color: colors.subText }]}>{t('resetAll')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.applyFiltersButton, { backgroundColor: colors.primary }]}
                  onPress={() => setShowFiltersModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.applyFiltersButtonText}>{t('applyFilters')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* ===== ITEM MODAL WITH GUEST SUPPORT ===== */}
        {selectedItem && (
          <Modal
            transparent
            visible={showItemModal}
            animationType="slide"
            onRequestClose={() => {
              setShowItemModal(false);
              setSelectedItem(null);
              setQuantity(1);
            }}
          >
            <View style={styles.modalOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => {
                  setShowItemModal(false);
                  setSelectedItem(null);
                  setQuantity(1);
                }}
              />

              <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                {/* Item Name */}
                <Text style={[styles.modalItemName, { color: colors.text }]}>
                  {selectedItem.name}
                </Text>

                {/* Description */}
                <Text style={[styles.modalItemDescription, { color: colors.subText }]}>
                  {selectedItem.description}
                </Text>

                {/* Rating */}
                <View style={styles.modalRatingContainer}>
                  <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= (selectedItem.rating || 4) ? "star" : "star-outline"}
                        size={16}
                        color={star <= (selectedItem.rating || 4) ? "#FFD700" : colors.border}
                      />
                    ))}
                  </View>
                  <Text style={[styles.modalRatingText, { color: colors.text }]}>
                    {(selectedItem.rating || 4).toFixed(1)}
                  </Text>
                </View>

                {/* Category */}
                <View style={styles.modalCategoryContainer}>
                  <Text style={[styles.modalCategoryLabel, { color: colors.subText }]}>
                    {t('category')}:{" "}
                  </Text>
                  <Text style={[styles.modalCategoryValue, { color: colors.primary }]}>
                    {selectedItem.category}
                  </Text>
                </View>

                {/* Quantity Selector - Image Style */}
                <View style={styles.imageStyleQuantityContainer}>
                  <TouchableOpacity
                    style={[styles.imageStyleQuantityBtn, { borderColor: colors.border }]}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Text style={[styles.imageStyleQuantityBtnText, { color: colors.text }]}>-</Text>
                  </TouchableOpacity>

                  <Text style={[styles.imageStyleQuantityText, { color: colors.text }]}>
                    {quantity}
                  </Text>

                  <TouchableOpacity
                    style={[styles.imageStyleQuantityBtn, { borderColor: colors.border }]}
                    onPress={() => setQuantity(quantity + 1)}
                  >
                    <Text style={[styles.imageStyleQuantityBtnText, { color: colors.text }]}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Action Buttons - Image Style */}
                <View style={styles.imageStyleActionContainer}>
                  <TouchableOpacity
                    style={[styles.imageStyleAddBtn, { borderColor: colors.border }]}
                    onPress={() => addOrder(selectedItem)}
                  >
                    <Text style={[styles.imageStyleAddBtnText, { color: colors.text }]}>
                      {t('add')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.imageStyleAddToCartBtn, { backgroundColor: colors.primary }]}
                    onPress={() => addToCart(selectedItem)}
                  >
                    <Text style={styles.imageStyleAddToCartBtnText}>
                      {t('addToCart')} • ₹{selectedItem.price * quantity}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
        {/* Success Popup */}
        <SuccessPopup 
          visible={showSuccessPopup} 
          itemName={addedItemName} 
          onClose={() => setShowSuccessPopup(false)} 
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Success Message
  successMessage: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 2000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successMessageText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Search Section
  searchSection: {
    position: 'relative',
    zIndex: 1000,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },

  // Search Box
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },

  // Search Suggestions
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
  suggestionsContainerWithKeyboard: {
    maxHeight: 250,
  },
  suggestionsHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    backgroundColor: '#FAFAFA',
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
    backgroundColor: '#FFF',
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
    backgroundColor: '#F5F5F5',
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

  // Filters Bar
  filtersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 100,
  },
  filterButtonActive: {
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  filterButtonTextActive: {
    fontWeight: '600',
  },
  quickFiltersContainer: {
    flex: 1,
  },
  quickFiltersContent: {
    alignItems: 'center',
    gap: 8,
  },
  quickFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  quickFilterActive: {
    borderWidth: 1,
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  quickFilterTextActive: {
    fontWeight: '600',
  },

  // Menu List
  fullMenuList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  compactMenuList: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 100,
  },

  // FULL CARD STYLES
  fullCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    marginBottom: 12,
  },
  fullImageContainer: {
    position: 'relative',
  },
  fullImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  fullContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  fullHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  fullName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  fullCategoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fullCategoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fullDescription: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  fullFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  fullAddButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  fullAddButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },

  // COMPACT CARD STYLES
  compactCard: {
    flex: 1,
    margin: 6,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    height: 250,
  },
  compactImageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  compactImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  compactContent: {
    flex: 1,
    marginTop: 8,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  compactCategoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  compactCategoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  compactDescription: {
    fontSize: 11,
    marginBottom: 6,
    lineHeight: 14,
    height: 28,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  compactPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  compactAddButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  compactAddButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },

  // Veg Indicator
  vegIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  favoriteBadgeCompact: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteBadgeFull: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  resetAllButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetAllButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },

  // Filters Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filtersModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
  },
  filtersModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  filtersModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  filtersModalCloseButton: {
    padding: 4,
  },
  filtersModalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterOptionActive: {
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    fontWeight: '600',
  },
  filtersModalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  resetFiltersButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  resetFiltersButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyFiltersButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyFiltersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // New Item Modal Styles
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalItemName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalItemDescription: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  modalRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalRatingText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  modalCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalCategoryLabel: {
    fontSize: 16,
  },
  modalCategoryValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Image Style Buttons (Exactly as shown in the image)
  imageStyleQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },

  imageStyleQuantityBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  imageStyleQuantityBtnText: {
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 28,
  },

  imageStyleQuantityText: {
    fontSize: 20,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },

  imageStyleActionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  imageStyleAddBtn: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  imageStyleAddBtnText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  imageStyleAddToCartBtn: {
    flex: 2,
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageStyleAddToCartBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  modalAddToCartButton: {
    flex: 2,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAddToCartButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});