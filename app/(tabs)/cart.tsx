import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";
import { emitCartUpdate } from "../../constants/CartEventEmitter";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Dimensions } from "react-native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  Modal,
  Image,
  FlatList,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../data/ThemeContext";

// 🔥 TRANSLATIONS FOR 5 LANGUAGES
const translations = {
  en: {
    // Header
    myCart: "My Cart",
    items: "items",
    item: "item",
    favorites: "Favorites",
    
    // Order Status
    orderSuccessful: "Order Successful! 🎉",
    orderCancelled: "Order Cancelled",
    orderId: "Order ID",
    total: "Total",
    yourOrderPlaced: "Your order has been placed successfully and will be delivered soon.",
    yourOrderCancelled: "Your order has been cancelled successfully.",
    processingOrder: "Processing your order...",
    pleaseWait: "Please wait",
    
    // Buttons
    viewOrders: "View Orders",
    continueShopping: "Continue Shopping",
    backToCart: "Back to Cart",
    browseMenu: "Browse Menu",
    viewMyOrders: "View My Orders",
    apply: "Apply",
    applied: "Applied",
    cancel: "Cancel",
    placeOrder: "Place Order",
    
    // Cart States
    cartEmpty: "Your cart is empty",
    addItems: "Add delicious items to get started!",
    
    // Sections
    orderItems: "Order Items",
    specialInstructions: "Special Instructions",
    applyCoupon: "Apply Coupon",
    billSummary: "Bill Summary",
    
    // Instructions Placeholder
    instructionsPlaceholder: "Any special requests or dietary restrictions...",
    couponPlaceholder: "Enter coupon code",
    
    // Bill Summary Labels
    subtotal: "Subtotal",
    deliveryFee: "Delivery Fee",
    free: "FREE",
    tax: "Tax (5%)",
    discount: "Discount (10%)",
    totalAmount: "Total Amount",
    
    // Coupon Messages
    couponApplied: "Coupon \"{code}\" applied! 10% discount",
    invalidCoupon: "Invalid Coupon",
    enterValidCoupon: "Please enter a valid coupon code",
    success: "Success!",
    discountApplied: "10% discount applied! 🎉",
    
    // Delivery Message
    addMoreForFreeDelivery: "Add ₹{amount} more for FREE delivery!",
    
    // Alerts
    error: "Error",
    orderFailed: "Order failed",
    cancelOrder: "Cancel Order",
    cancelConfirm: "Are you sure you want to cancel this order?",
    no: "No",
    yesCancel: "Yes, Cancel",
    
    // Rating
    rating: "Rating",
    
    // Guest Messages
    loginRequired: "Login Required",
    pleaseLoginToPlaceOrder: "Please login to place your order",
    guestCart: "Guest Cart",
    login: "Login",
  },

  hi: {
    myCart: "मेरा कार्ट",
    items: "आइटम",
    item: "आइटम",
    favorites: "पसंदीदा",
    
    orderSuccessful: "ऑर्डर सफल! 🎉",
    orderCancelled: "ऑर्डर रद्द",
    orderId: "ऑर्डर आईडी",
    total: "कुल",
    yourOrderPlaced: "आपका ऑर्डर सफलतापूर्वक रखा गया है और जल्द ही डिलीवर कर दिया जाएगा।",
    yourOrderCancelled: "आपका ऑर्डर सफलतापूर्वक रद्द कर दिया गया है।",
    processingOrder: "आपका ऑर्डर प्रोसेस हो रहा है...",
    pleaseWait: "कृपया प्रतीक्षा करें",
    
    viewOrders: "ऑर्डर देखें",
    continueShopping: "खरीदारी जारी रखें",
    backToCart: "कार्ट पर वापस जाएं",
    browseMenu: "मेनू ब्राउज़ करें",
    viewMyOrders: "मेरे ऑर्डर देखें",
    apply: "लागू करें",
    applied: "लागू",
    cancel: "रद्द करें",
    placeOrder: "ऑर्डर दें",
    
    cartEmpty: "आपका कार्ट खाली है",
    addItems: "शुरू करने के लिए स्वादिष्ट आइटम जोड़ें!",
    
    orderItems: "ऑर्डर आइटम",
    specialInstructions: "विशेष निर्देश",
    applyCoupon: "कूपन लागू करें",
    billSummary: "बिल सारांश",
    
    instructionsPlaceholder: "कोई विशेष अनुरोध या आहार प्रतिबंध...",
    couponPlaceholder: "कूपन कोड दर्ज करें",
    
    subtotal: "उप-योग",
    deliveryFee: "डिलीवरी शुल्क",
    free: "मुफ्त",
    tax: "कर (5%)",
    discount: "छूट (10%)",
    totalAmount: "कुल राशि",
    
    couponApplied: "कूपन \"{code}\" लागू! 10% छूट",
    invalidCoupon: "अमान्य कूपन",
    enterValidCoupon: "कृपया एक मान्य कूपन कोड दर्ज करें",
    success: "सफलता!",
    discountApplied: "10% छूट लागू! 🎉",
    
    addMoreForFreeDelivery: "मुफ्त डिलीवरी के लिए ₹{amount} और जोड़ें!",
    
    error: "त्रुटि",
    orderFailed: "ऑर्डर विफल",
    cancelOrder: "ऑर्डर रद्द करें",
    cancelConfirm: "क्या आप वाकई यह ऑर्डर रद्द करना चाहते हैं?",
    no: "नहीं",
    yesCancel: "हां, रद्द करें",
    
    rating: "रेटिंग",
    
    loginRequired: "लॉगिन आवश्यक",
    pleaseLoginToPlaceOrder: "कृपया ऑर्डर देने के लिए लॉगिन करें",
    guestCart: "अतिथि कार्ट",
    login: "लॉगिन",
  },

  mr: {
    myCart: "माझी कार्ट",
    items: "वस्तू",
    item: "वस्तू",
    favorites: "आवडते",
    
    orderSuccessful: "ऑर्डर यशस्वी! 🎉",
    orderCancelled: "ऑर्डर रद्द",
    orderId: "ऑर्डर आयडी",
    total: "एकूण",
    yourOrderPlaced: "तुमचा ऑर्डर यशस्वीरित्या ठेवला गेला आहे आणि लवकरच वितरित केला जाईल.",
    yourOrderCancelled: "तुमचा ऑर्डर यशस्वीरित्या रद्द करण्यात आला आहे.",
    processingOrder: "तुमचा ऑर्डर प्रोसेस होत आहे...",
    pleaseWait: "कृपया प्रतीक्षा करा",
    
    viewOrders: "ऑर्डर पहा",
    continueShopping: "खरेदी सुरू ठेवा",
    backToCart: "कार्टवर परत जा",
    browseMenu: "मेनू ब्राउझ करा",
    viewMyOrders: "माझे ऑर्डर पहा",
    apply: "लागू करा",
    applied: "लागू",
    cancel: "रद्द करा",
    placeOrder: "ऑर्डर द्या",
    
    cartEmpty: "तुमची कार्ट रिकामी आहे",
    addItems: "सुरू करण्यासाठी स्वादिष्ट वस्तू जोडा!",
    
    orderItems: "ऑर्डर वस्तू",
    specialInstructions: "विशेष सूचना",
    applyCoupon: "कूपन लागू करा",
    billSummary: "बिल सारांश",
    
    instructionsPlaceholder: "कोणत्याही विशेष विनंत्या किंवा आहार निर्बंध...",
    couponPlaceholder: "कूपन कोड प्रविष्ट करा",
    
    subtotal: "उप-एकूण",
    deliveryFee: "वितरण शुल्क",
    free: "मोफत",
    tax: "कर (5%)",
    discount: "सूट (10%)",
    totalAmount: "एकूण रक्कम",
    
    couponApplied: "कूपन \"{code}\" लागू! 10% सूट",
    invalidCoupon: "अवैध कूपन",
    enterValidCoupon: "कृपया वैध कूपन कोड प्रविष्ट करा",
    success: "यशस्वी!",
    discountApplied: "10% सूट लागू! 🎉",
    
    addMoreForFreeDelivery: "मोफत वितरणासाठी ₹{amount} अधिक जोडा!",
    
    error: "त्रुटी",
    orderFailed: "ऑर्डर अयशस्वी",
    cancelOrder: "ऑर्डर रद्द करा",
    cancelConfirm: "तुम्हाला खात्री आहे की हा ऑर्डर रद्द करायचा आहे?",
    no: "नाही",
    yesCancel: "होय, रद्द करा",
    
    rating: "रेटिंग",
    
    loginRequired: "लॉगिन आवश्यक",
    pleaseLoginToPlaceOrder: "कृपया ऑर्डर देण्यासाठी लॉगिन करा",
    guestCart: "पाहुणा कार्ट",
    login: "लॉगिन",
  },

  ta: {
    myCart: "எனது வண்டி",
    items: "பொருட்கள்",
    item: "பொருள்",
    favorites: "பிடித்தவை",
    
    orderSuccessful: "ஆர்டர் வெற்றி! 🎉",
    orderCancelled: "ஆர்டர் ரத்து",
    orderId: "ஆர்டர் ஐடி",
    total: "மொத்தம்",
    yourOrderPlaced: "உங்கள் ஆர்டர் வெற்றிகரமாக வைக்கப்பட்டு விரைவில் வழங்கப்படும்.",
    yourOrderCancelled: "உங்கள் ஆர்டர் வெற்றிகரமாக ரத்து செய்யப்பட்டது.",
    processingOrder: "உங்கள் ஆர்டர் செயலாக்கப்படுகிறது...",
    pleaseWait: "தயவுசெய்து காத்திருங்கள்",
    
    viewOrders: "ஆர்டர்களை பார்க்க",
    continueShopping: "ஷாப்பிங் தொடர",
    backToCart: "வண்டிக்கு திரும்ப",
    browseMenu: "மெனுவை உலவ",
    viewMyOrders: "எனது ஆர்டர்களை பார்க்க",
    apply: "விண்ணப்பிக்க",
    applied: "விண்ணப்பித்தது",
    cancel: "ரத்து",
    placeOrder: "ஆர்டர் செய்",
    
    cartEmpty: "உங்கள் வண்டி காலியாக உள்ளது",
    addItems: "தொடங்க சுவையான பொருட்களை சேர்க்க!",
    
    orderItems: "ஆர்டர் பொருட்கள்",
    specialInstructions: "சிறப்பு அறிவுறுத்தல்கள்",
    applyCoupon: "கூப்பனை விண்ணப்பிக்க",
    billSummary: "பில் சுருக்கம்",
    
    instructionsPlaceholder: "ஏதேனும் சிறப்பு கோரிக்கைகள் அல்லது உணவு கட்டுப்பாடுகள்...",
    couponPlaceholder: "கூப்பன் குறியீட்டை உள்ளிடவும்",
    
    subtotal: "மொத்தம்",
    deliveryFee: "விநியோக கட்டணம்",
    free: "இலவசம்",
    tax: "வரி (5%)",
    discount: "தள்ளுபடி (10%)",
    totalAmount: "மொத்த தொகை",
    
    couponApplied: "கூப்பன் \"{code}\" விண்ணப்பித்தது! 10% தள்ளுபடி",
    invalidCoupon: "தவறான கூப்பன்",
    enterValidCoupon: "தயவுசெய்து சரியான கூப்பன் குறியீட்டை உள்ளிடவும்",
    success: "வெற்றி!",
    discountApplied: "10% தள்ளுபடி விண்ணப்பித்தது! 🎉",
    
    addMoreForFreeDelivery: "இலவச விநியோகத்திற்காக ₹{amount} அதிகம் சேர்க்க!",
    
    error: "பிழை",
    orderFailed: "ஆர்டர் தோல்வி",
    cancelOrder: "ஆர்டரை ரத்து செய்",
    cancelConfirm: "நீங்கள் இந்த ஆர்டரை ரத்து செய்ய விரும்புகிறீர்களா?",
    no: "இல்லை",
    yesCancel: "ஆம், ரத்து செய்",
    
    rating: "மதிப்பீடு",
    
    loginRequired: "உள்நுழைவு தேவை",
    pleaseLoginToPlaceOrder: "ஆர்டர் செய்ய உள்நுழையவும்",
    guestCart: "விருந்தினர் வண்டி",
    login: "உள்நுழைக",
  },

  gu: {
    myCart: "મારી કાર્ટ",
    items: "વસ્તુઓ",
    item: "વસ્તુ",
    favorites: "પસંદ",
    
    orderSuccessful: "ઓર્ડર સફળ! 🎉",
    orderCancelled: "ઓર્ડર રદ",
    orderId: "ઓર્ડર ID",
    total: "કુલ",
    yourOrderPlaced: "તમારો ઓર્ડર સફળતાપૂર્વક મૂકવામાં આવ્યો છે અને ટૂંક સમયમાં પહોંચાડવામાં આવશે.",
    yourOrderCancelled: "તમારો ઓર્ડર સફળતાપૂર્વક રદ કરવામાં આવ્યો છે.",
    processingOrder: "તમારો ઓર્ડર પ્રોસેસ થઈ રહ્યો છે...",
    pleaseWait: "કૃપા કરીને રાહ જુઓ",
    
    viewOrders: "ઓર્ડર જુઓ",
    continueShopping: "ખરીદી ચાલુ રાખો",
    backToCart: "કાર્ટ પર પાછા",
    browseMenu: "મેનુ બ્રાઉઝ કરો",
    viewMyOrders: "મારા ઓર્ડર જુઓ",
    apply: "લાગુ કરો",
    applied: "લાગુ",
    cancel: "રદ કરો",
    placeOrder: "ઓર્ડર મૂકો",
    
    cartEmpty: "તમારી કાર્ટ ખાલી છે",
    addItems: "શરૂ કરવા માટે સ્વાદિષ્ટ વસ્તુઓ ઉમેરો!",
    
    orderItems: "ઓર્ડર વસ્તુઓ",
    specialInstructions: "ખાસ સૂચનાઓ",
    applyCoupon: "કૂપન લાગુ કરો",
    billSummary: "બિલ સારાંશ",
    
    instructionsPlaceholder: "કોઈપણ ખાસ વિનંતીઓ અથવા આહાર પ્રતિબંધો...",
    couponPlaceholder: "કૂપન કોડ દાખલ કરો",
    
    subtotal: "પેટા-કુલ",
    deliveryFee: "ડિલિવરી ફી",
    free: "મફત",
    tax: "કર (5%)",
    discount: "ડિસ્કાઉન્ટ (10%)",
    totalAmount: "કુલ રકમ",
    
    couponApplied: "કૂપન \"{code}\" લાગુ! 10% ડિસ્કાઉન્ટ",
    invalidCoupon: "અમાન્ય કૂપન",
    enterValidCoupon: "કૃપા કરીને માન્ય કૂપન કોડ દાખલ કરો",
    success: "સફળતા!",
    discountApplied: "10% ડિસ્કાઉન્ટ લાગુ! 🎉",
    
    addMoreForFreeDelivery: "મફત ડિલિવરી માટે ₹{amount} વધુ ઉમેરો!",
    
    error: "ભૂલ",
    orderFailed: "ઓર્ડર નિષ્ફળ",
    cancelOrder: "ઓર્ડર રદ કરો",
    cancelConfirm: "શું તમે ખરેખર આ ઓર્ડર રદ કરવા માંગો છો?",
    no: "ના",
    yesCancel: "હા, રદ કરો",
    
    rating: "રેટિંગ",
    
    loginRequired: "લૉગિન આવશ્યક છે",
    pleaseLoginToPlaceOrder: "કૃપા કરીને ઓર્ડર આપવા લૉગિન કરો",
    guestCart: "મહેમાન કાર્ટ",
    login: "લૉગિન",
  },
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
  description?: string;
  image?: any;
};

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

export default function CartScreen() {
  const { colors, mode } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Language state
  const [languageCode, setLanguageCode] = useState("en");

  // Guest cart state
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [isGuest, setIsGuest] = useState(false);

  // Load saved language from AsyncStorage
  useEffect(() => {
    loadLanguage();
    checkLoginStatus();
    loadGuestCartFromParams();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang && translations[savedLang as keyof typeof translations]) {
        setLanguageCode(savedLang);
      }
    } catch (error) {
      console.log('Error loading language:', error);
    }
  };

  // Check if user is logged in
  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      setIsGuest(!token);
    } catch (error) {
      console.log("Error checking login status:", error);
    }
  };

  // Load guest cart from params (passed from Home/Menu)
  const loadGuestCartFromParams = () => {
    try {
      if (params.guestCart) {
        const parsedCart = JSON.parse(params.guestCart as string);
        setGuestCart(parsedCart);
        setIsGuest(true);
      } else {
        // Try to load from AsyncStorage
        loadGuestCart();
      }
    } catch (error) {
      console.log("Error loading guest cart from params:", error);
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

  // 🔥 Translation function with placeholder support
  const t = (key: string, params?: Record<string, string | number>) => {
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
        value = fallback || key;
        break;
      }
    }

    if (typeof value === 'string' && params) {
      return value.replace(/{(\w+)}/g, (_, key) => String(params[key] || ''));
    }
    
    return value || key;
  };

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");

  const { width } = Dimensions.get("window");
  
  useEffect(() => {
    if (!isGuest) {
      fetchCart();
    }
  }, [isGuest]);

  useFocusEffect(
    useCallback(() => {
      if (!isGuest) {
        fetchCart();
      } else {
        loadGuestCart();
      }
      loadFavorites();
    }, [isGuest])
  );

  const loadFavorites = async () => {
    try {
      const savedFavs = await AsyncStorage.getItem('favorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch (error) {
      console.log('Error loading favorites:', error);
    }
  };

  const fetchFavoriteItems = async () => {
    try {
      setLoadingFavorites(true);
      const savedFavs = await AsyncStorage.getItem('favorites');
      if (!savedFavs) {
        setFavoriteItems([]);
        return;
      }
      
      const favIds = JSON.parse(savedFavs);
      if (favIds.length === 0) {
        setFavoriteItems([]);
        return;
      }

      // Fetch all foods and filter by favIds
      const response = await axios.get(`${BASE_URL}/api/foods`);
      const allFoods = response.data.menus || (Array.isArray(response.data) ? response.data : []);
      
      const filtered = allFoods
        .filter((f: any) => favIds.includes(f._id))
        .map((item: any) => ({
          ...item,
          image: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : null,
        }));
      setFavoriteItems(filtered);
    } catch (error) {
      console.log('Error fetching favorite items:', error);
    } finally {
      setLoadingFavorites(false);
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
      
      // Update favoriteItems list if modal is open
      setFavoriteItems(prev => prev.filter(item => newFavs.includes(item._id)));
    } catch (error) {
      console.log('Error toggling favorite:', error);
    }
  };

  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const { data } = await axios.get(`${BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data && data.items) {
        const formatted = data.items.map((item: any) => ({
          id: item.food._id,
          name: item.food.name,
          price: item.food.price,
          qty: item.quantity,
          category: item.food.category,
          description: item.food.description,
        }));

        setCartItems(formatted);
        await AsyncStorage.setItem("cartCount", JSON.stringify(
          formatted.reduce((sum, item) => sum + item.qty, 0)
        ));
      } else {
        setCartItems([]);
      }

    } catch (error) {
      console.log("CART FETCH ERROR:", error);
    }
  };

  // Order Status States
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'success' | 'cancelled' | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);

  // Favorites States
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Calculate totals (for both guest and logged-in)
  const subtotal = isGuest 
    ? guestCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  const deliveryFee = subtotal > 300 ? 0 : 40;
  const discount = appliedCoupon ? subtotal * 0.1 : 0;
  const tax = subtotal * 0.05;
  const totalAmount = subtotal + deliveryFee + tax - discount;
  
  const updateQuantity = async (foodId: string, change: number) => {
    if (isGuest) {
      // Guest cart update
      const updatedCart = guestCart.map(item => {
        if (item.foodId === foodId) {
          const newQty = change === 1 ? item.quantity + 1 : item.quantity - 1;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      }).filter(item => item.quantity > 0);

      await saveGuestCart(updatedCart);
      const updatedCount = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
      await emitCartUpdate(updatedCount);
    } else {
      // Logged-in user cart update
      try {
        const token = await AsyncStorage.getItem("token");
        const action = change === 1 ? "increase" : "decrease";

        await axios.put(
          `${BASE_URL}/api/cart/${foodId}`,
          { action },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await fetchCart();
        // fetchCart already saves cartCount — emit the updated value
        const saved = await AsyncStorage.getItem("cartCount");
        await emitCartUpdate(saved ? JSON.parse(saved) : 0);
      } catch (error) {
        console.log("UPDATE ERROR:", error);
      }
    }
  };

  const placeOrder = async () => {
    if (isGuest) {
      // Guest user - show login prompt
      Alert.alert(
        t('loginRequired'),
        t('pleaseLoginToPlaceOrder'),
        [
          { text: t('cancel'), style: "cancel" },
          { text: t('login'), onPress: () => router.push("/auth/login") }
        ]
      );
      return;
    }

    try {
      setIsProcessingOrder(true);

      const token = await AsyncStorage.getItem("token");

      const { data } = await axios.post(
        `${BASE_URL}/api/orders`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrderTotal(totalAmount);
      setOrderId(data._id);
      setOrderStatus("success");
      // 🔥 reset badge to 0 immediately
      await emitCartUpdate(0);
      setShowOrderModal(true);
      await fetchCart();

    } catch (error) {
      console.log("ORDER ERROR:", error);
      Alert.alert(t('error'), t('orderFailed'));
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const removeItem = async (foodId: string) => {
    if (isGuest) {
      // Remove from guest cart
      const updatedCart = guestCart.filter(item => item.foodId !== foodId);
      await saveGuestCart(updatedCart);
      const updatedCount = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
      await emitCartUpdate(updatedCount);
    } else {
      // Remove from server cart
      try {
        const token = await AsyncStorage.getItem("token");

        await axios.delete(`${BASE_URL}/api/cart/${foodId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        await fetchCart();
        const saved = await AsyncStorage.getItem("cartCount");
        await emitCartUpdate(saved ? JSON.parse(saved) : 0);
      } catch (error) {
        console.log("DELETE ERROR:", error);
      }
    }
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "SATTVIK10") {
      setAppliedCoupon("SATTVIK10");
      Alert.alert(t('success'), t('discountApplied'));
      setCouponCode("");
    } else {
      Alert.alert(t('invalidCoupon'), t('enterValidCoupon'));
    }
  };

  const generateOrderId = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let id = "SAT";

    for (let i = 0; i < 3; i++) {
      id += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    for (let i = 0; i < 4; i++) {
      id += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return id;
  };

  const cancelOrder = () => {
    Alert.alert(
      t('cancelOrder'),
      t('cancelConfirm'),
      [
        { text: t('no'), style: "cancel" },
        {
          text: t('yesCancel'),
          style: "destructive",
          onPress: () => {
            setIsProcessingOrder(true);

            setTimeout(() => {
              const newOrderId = generateOrderId();
              setOrderId(newOrderId);
              setOrderStatus('cancelled');
              setShowOrderModal(true);
              setIsProcessingOrder(false);
            }, 1500);
          }
        }
      ]
    );
  };

  const renderCartItem = (item: CartItem | GuestCartItem, index: number) => {
    // Handle both CartItem and GuestCartItem types
    const itemId = 'foodId' in item ? item.foodId : item.id;
    const itemName = item.name;
    const itemPrice = item.price;
    const itemQty = 'quantity' in item ? item.quantity : item.qty;
    const itemCategory = item.category || "";
    const itemDescription = item.description || "";

    return (
      <View key={itemId + index} style={[
        styles.itemCard, 
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }
      ]}>
        <View style={styles.itemLeft}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemName, { color: colors.text }]}>{itemName}</Text>
            <View style={[styles.ratingContainer, { backgroundColor: mode === 'dark' ? colors.background : '#FFFBF7' }]}>
              <Ionicons name="star" size={14} color="#FFC107" />
              <Text style={[styles.ratingText, { color: colors.text }]}>4.5</Text>
            </View>
          </View>

          {itemDescription && (
            <Text style={[styles.itemDescription, { color: colors.subText }]}>{itemDescription}</Text>
          )}

          <View style={styles.itemMeta}>
            <View style={[styles.categoryChip, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="leaf-outline" size={12} color={colors.primary} />
              <Text style={[styles.categoryText, { color: colors.primary }]}>{itemCategory}</Text>
            </View>
            <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{itemPrice}</Text>
          </View>
        </View>

        <View style={styles.itemRight}>
          <View style={[styles.quantityBox, { backgroundColor: mode === 'dark' ? colors.background : '#FFFBF7' }]}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => updateQuantity(itemId, -1)}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>

            <Text style={[styles.qtyText, { color: colors.text }]}>{itemQty}</Text>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => updateQuantity(itemId, 1)}
            >
              <Ionicons name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.itemTotal, { color: colors.text }]}>₹{itemPrice * itemQty}</Text>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(itemId)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Get display items (guest cart or server cart)
  const displayItems = isGuest 
    ? guestCart 
    : cartItems.map(item => ({
        ...item,
        quantity: item.qty,
        foodId: item.id
      }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border 
        }
      ]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: mode === 'dark' ? colors.background : '#FFFBF7' }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isGuest ? t('guestCart') : t('myCart')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
            {displayItems.length} {displayItems.length === 1 ? t('item') : t('items')}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.favoriteButton, { backgroundColor: mode === 'dark' ? colors.background : '#FFFBF7' }]}
          onPress={() => {
            fetchFavoriteItems();
            setShowFavoritesModal(true);
          }}
        >
          <Ionicons name="heart" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Favorites Modal */}
      <Modal
        visible={showFavoritesModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFavoritesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.favoritesModalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.favoritesModalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.favoritesTitleGroup}>
                <Ionicons name="heart" size={24} color={colors.primary} />
                <Text style={[styles.favoritesModalTitle, { color: colors.text }]}>
                  {t('favorites')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFavoritesModal(false)}
                style={[styles.closeButton, { backgroundColor: mode === 'dark' ? colors.background : '#F5F5F5' }]}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loadingFavorites ? (
              <View style={styles.favLoadingContainer}>
                <Ionicons name="restaurant" size={40} color={colors.primary} />
                <Text style={[styles.favLoadingText, { color: colors.subText }]}>{t('loading')}</Text>
              </View>
            ) : favoriteItems.length > 0 ? (
              <FlatList
                data={favoriteItems}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <View style={[styles.favItem, { borderBottomColor: colors.border }]}>
                    <Image
                      source={{ uri: item.image || "https://via.placeholder.com/150" }}
                      style={styles.favItemImage}
                    />
                    <View style={styles.favItemDetails}>
                      <Text style={[styles.favItemName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.favItemPrice, { color: colors.primary }]}>
                        ₹{item.price}
                      </Text>
                    </View>
                    <View style={styles.favItemActions}>
                      <TouchableOpacity
                        style={[styles.favItemAdd, { backgroundColor: colors.primary }]}
                        onPress={() => {
                          // Logic to add to cart
                          setShowFavoritesModal(false);
                          router.push({
                            pathname: '/',
                            params: { search: item.name }
                          });
                        }}
                      >
                        <Ionicons name="add" size={20} color="#FFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.favItemRemove}
                        onPress={() => toggleFavorite(item._id)}
                      >
                        <Ionicons name="heart" size={24} color="#FF4757" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.favListContent}
              />
            ) : (
              <View style={styles.favEmptyContainer}>
                <Ionicons name="heart-outline" size={60} color={colors.border} />
                <Text style={[styles.favEmptyText, { color: colors.text }]}>
                  {t('noItemsFound')}
                </Text>
                <Text style={[styles.favEmptySubText, { color: colors.subText }]}>
                  {t('addItems')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Order Status Modal */}
      <Modal
        transparent
        visible={showOrderModal}
        animationType="fade"
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {orderStatus === 'success' ? (
              <>
                <View style={[styles.statusIconContainer, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="checkmark-circle" size={80} color={colors.success} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('orderSuccessful')}</Text>
                <Text style={[styles.modalOrderId, { 
                  color: colors.primary,
                  backgroundColor: mode === 'dark' ? colors.background : '#FFFBF7'
                }]}>
                  {t('orderId')}: {orderId}
                </Text>
                <Text style={[styles.modalText, { color: colors.subText }]}>
                  {t('yourOrderPlaced')}
                </Text>
                <Text style={[styles.modalAmount, { color: colors.primary }]}>{t('total')}: ₹{orderTotal.toFixed(2)}</Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.primaryButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setShowOrderModal(false);
                      router.push('/order');
                    }}
                  >
                    <Text style={styles.primaryButtonText}>{t('viewOrders')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.secondaryButton, { 
                      backgroundColor: mode === 'dark' ? colors.background : '#FFFBF7',
                      borderColor: colors.border 
                    }]}
                    onPress={() => {
                      setShowOrderModal(false);
                      router.push('/');
                    }}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{t('continueShopping')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : orderStatus === 'cancelled' ? (
              <>
                <View style={[styles.statusIconContainer, { backgroundColor: colors.danger + '20' }]}>
                  <Ionicons name="close-circle" size={80} color={colors.danger} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('orderCancelled')}</Text>
                <Text style={[styles.modalOrderId, { 
                  color: colors.primary,
                  backgroundColor: mode === 'dark' ? colors.background : '#FFFBF7'
                }]}>
                  {t('orderId')}: {orderId}
                </Text>
                <Text style={[styles.modalText, { color: colors.subText }]}>
                  {t('yourOrderCancelled')}
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.primaryButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setShowOrderModal(false);
                      router.push('/order');
                    }}
                  >
                    <Text style={styles.primaryButtonText}>{t('viewOrders')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.secondaryButton, { 
                      backgroundColor: mode === 'dark' ? colors.background : '#FFFBF7',
                      borderColor: colors.border 
                    }]}
                    onPress={() => {
                      setShowOrderModal(false);
                      if (isGuest) {
                        loadGuestCart();
                      } else {
                        fetchCart();
                      }
                    }}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{t('backToCart')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Processing Order Modal */}
      <Modal
        transparent
        visible={isProcessingOrder}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.loadingContainer}>
              <MaterialCommunityIcons
                name="food"
                size={60}
                color={colors.primary}
              />
              <Text style={[styles.loadingText, { color: colors.text }]}>{t('processingOrder')}</Text>
              <Text style={[styles.loadingSubtext, { color: colors.subText }]}>{t('pleaseWait')}</Text>
            </View>
          </View>
        </View>
      </Modal>

      {displayItems.length === 0 ? (
        <View style={styles.emptyState}>
          {orderStatus === 'success' ? (
            <>
              <Ionicons name="checkmark-circle" size={100} color={colors.success} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>{t('orderSuccessful')}</Text>
              <Text style={[styles.emptyStateText, { color: colors.subText }]}>
                {t('yourOrderPlaced')} #{orderId}
              </Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons
                name="cart-off"
                size={100}
                color={colors.subText}
              />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>{t('cartEmpty')}</Text>
              <Text style={[styles.emptyStateText, { color: colors.subText }]}>
                {t('addItems')}
              </Text>
            </>
          )}

          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/')}
          >
            <Text style={styles.browseButtonText}>{t('browseMenu')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewOrdersButton, { 
              backgroundColor: mode === 'dark' ? colors.background : '#FFFBF7',
              borderColor: colors.border 
            }]}
            onPress={() => router.push('/order')}
          >
            <Text style={[styles.viewOrdersText, { color: colors.text }]}>{t('viewMyOrders')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 200,
            }}
          >
            {/* Cart Items */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('orderItems')}</Text>
              {displayItems.map((item, index) => renderCartItem(item, index))}
            </View>

            {/* Special Instructions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('specialInstructions')}</Text>
              <View style={[styles.inputContainer, { 
                backgroundColor: mode === 'dark' ? colors.background : '#FFFBF7',
                borderColor: colors.border 
              }]}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={colors.subText}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.instructionsInput, { color: colors.text }]}
                  placeholder={t('instructionsPlaceholder')}
                  placeholderTextColor={colors.subText}
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Coupon Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('applyCoupon')}</Text>
              <View style={styles.couponContainer}>
                <View style={[styles.couponInputContainer, { 
                  backgroundColor: mode === 'dark' ? colors.background : '#FFFBF7',
                  borderColor: colors.border 
                }]}>
                  <Ionicons
                    name="ticket-outline"
                    size={20}
                    color={colors.subText}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.couponInput, { color: colors.text }]}
                    placeholder={t('couponPlaceholder')}
                    placeholderTextColor={colors.subText}
                    value={couponCode}
                    onChangeText={setCouponCode}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    { backgroundColor: appliedCoupon ? colors.success : colors.primary },
                    appliedCoupon && styles.appliedButton
                  ]}
                  onPress={applyCoupon}
                  disabled={appliedCoupon !== null}
                >
                  <Text style={styles.applyButtonText}>
                    {appliedCoupon ? t('applied') : t('apply')}
                  </Text>
                </TouchableOpacity>
              </View>

              {appliedCoupon && (
                <View style={[styles.couponApplied, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[styles.couponAppliedText, { color: colors.success }]}>
                    {t('couponApplied', { code: appliedCoupon })}
                  </Text>
                </View>
              )}
            </View>

            {/* Bill Summary */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('billSummary')}</Text>

              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: colors.subText }]}>{t('subtotal')}</Text>
                <Text style={[styles.billValue, { color: colors.text }]}>₹{subtotal}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: colors.subText }]}>{t('deliveryFee')}</Text>
                <Text style={[styles.billValue, { color: colors.text }]}>
                  {deliveryFee === 0 ? t('free') : `₹${deliveryFee}`}
                </Text>
              </View>

              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: colors.subText }]}>{t('tax')}</Text>
                <Text style={[styles.billValue, { color: colors.text }]}>₹{tax.toFixed(2)}</Text>
              </View>

              {appliedCoupon && (
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, styles.discountLabel, { color: colors.success }]}>
                    {t('discount')}
                  </Text>
                  <Text style={[styles.billValue, styles.discountValue, { color: colors.success }]}>
                    -₹{discount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>{t('totalAmount')}</Text>
                <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{totalAmount.toFixed(2)}</Text>
              </View>

              {subtotal < 300 && (
                <View style={[styles.freeDeliveryNote, { backgroundColor: colors.warning + '20' }]}>
                  <Ionicons name="information-circle" size={16} color={colors.warning} />
                  <Text style={[styles.freeDeliveryText, { color: colors.warning }]}>
                    {t('addMoreForFreeDelivery', { amount: 300 - subtotal })}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={[styles.footer, { 
            backgroundColor: colors.card,
            borderTopColor: colors.border 
          }]}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton, { 
                  backgroundColor: mode === 'dark' ? colors.background : '#FFF5F5',
                  borderColor: mode === 'dark' ? colors.danger + '40' : '#FFCDD2'
                }]}
                onPress={cancelOrder}
                activeOpacity={0.8}
              >
                <View style={[styles.buttonIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons name="close-outline" size={22} color={colors.danger} />
                </View>
                <Text style={[styles.cancelButtonText, { color: colors.danger }]}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.placeOrderButton, { 
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                }]}
                onPress={placeOrder}
                disabled={isProcessingOrder}
                activeOpacity={0.8}
              >
                <View style={styles.buttonIconContainer}>
                  <Ionicons name="bag-check-outline" size={22} color="#FFFFFF" />
                </View>
                <View style={styles.placeOrderTextContainer}>
                  <Text style={styles.placeOrderLabel}>{t('placeOrder')}</Text>
                  <Text style={styles.placeOrderAmount}>₹{totalAmount.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => router.push('/')}
              activeOpacity={0.7}
            >
              <View style={styles.continueButtonContent}>
                <Text style={[styles.continueText, { color: colors.primary }]}>{t('continueShopping')}</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },

  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 12,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  statusIconContainer: {
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  modalOrderId: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalAmount: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 25,
  },
  modalButtons: {
    width: "100%",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#FF6B35",
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // LOADING MODAL
  loadingContainer: {
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
  },

  // EMPTY STATE
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  browseButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 15,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  viewOrdersButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  viewOrdersText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // SECTIONS
  section: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },

  // CART ITEM CARD
  itemCard: {
    width: "100%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemLeft: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  itemDescription: {
    fontSize: 13,
    marginVertical: 6,
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
  },
  itemRight: {
    alignItems: "center",
    marginLeft: 15,
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  qtyButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 10,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  removeButton: {
    padding: 6,
    borderRadius: 6,
  },

  // INPUTS
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  inputIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  instructionsInput: {
    flex: 1,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
  },

  // COUPON SECTION
  couponContainer: {
    flexDirection: "row",
    gap: 10,
  },
  couponInputContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
    marginLeft: 8,
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  appliedButton: {
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  couponApplied: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  couponAppliedText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 8,
  },

  // BILL SUMMARY
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 14,
  },
  billValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  discountLabel: {
  },
  discountValue: {
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "700",
  },
  freeDeliveryNote: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  freeDeliveryText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 8,
  },

  // FOOTER
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  buttonIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButton: {
    borderWidth: 1.5,
  },

  placeOrderButton: {
    borderWidth: 0,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  placeOrderTextContainer: {
    alignItems: "flex-start",
  },

  placeOrderLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 1,
  },

  placeOrderAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // CONTINUE BUTTON
  continueButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 14,
    marginTop: 4,
  },

  continueButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  continueText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // FAVORITES MODAL
  favoritesModalContent: {
    width: "100%",
    height: "80%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  favoritesModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  favoritesTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  favoritesModalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  favListContent: {
    paddingBottom: 20,
  },
  favItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  favItemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  favItemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  favItemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  favItemPrice: {
    fontSize: 15,
    fontWeight: "700",
  },
  favItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  favItemAdd: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  favItemRemove: {
    padding: 5,
  },
  favEmptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  favEmptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
  },
  favEmptySubText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
  favLoadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  favLoadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
  },
});