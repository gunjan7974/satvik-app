import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BASE_URL } from "../../config/api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useEffect } from "react";
import React, { useState, useRef } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useTheme } from "../data/ThemeContext";

const { width } = Dimensions.get("window");

/* ================= TYPES ================= */
type Order = {
  id: string;
  date: string;
  time: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: "Order Placed" | "Preparing" | "On the way" | "Delivered" | "Cancelled";
  canReorder?: boolean;
  canCancel?: boolean;
  reason?: string;
};

type FilterType = "All" | "Active" | "Delivered" | "Cancelled";

// 🔥 TRANSLATIONS FOR 5 LANGUAGES
const translations: Record<string, any> = {

  // English
  en: {
    // Screen
    loadingOrders: "Loading your orders...",
    ordersFound: "orders found",
    orderFound: "order found",
    noOrders: "No orders yet",
    noOrdersDesc: "Start ordering delicious food!",
    browseMenu: "Browse Menu",
    
    // Filters
    all: "All",
    active: "Active",
    delivered: "Delivered",
    cancelled: "Cancelled",
    
    // Status
    orderPlaced: "Order Placed",
    preparing: "Preparing",
    onTheWay: "On the way",
    
    // Actions
    cancel: "Cancel",
    reorder: "Reorder",
    details: "Details",
    
    // Alerts
    cancelTitle: "Cancel Order",
    cancelConfirm: "Are you sure you want to cancel this order?",
    cancelSuccess: "Order cancelled successfully",
    cancelError: "Failed to cancel order",
    reorderTitle: "Reorder",
    reorderConfirm: "Add all items to cart?",
    later: "Later",
    addToCart: "Add to Cart",
    success: "Success",
    itemsAdded: "Items added to cart!",
    error: "Error",
    
    // Time
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "days ago",
  },

  // Hindi
  hi: {
    loadingOrders: "आपके ऑर्डर लोड हो रहे हैं...",
    ordersFound: "ऑर्डर मिले",
    orderFound: "ऑर्डर मिला",
    noOrders: "अभी तक कोई ऑर्डर नहीं",
    noOrdersDesc: "स्वादिष्ट भोजन ऑर्डर करना शुरू करें!",
    browseMenu: "मेनू देखें",
    
    all: "सभी",
    active: "सक्रिय",
    delivered: "डिलीवर",
    cancelled: "रद्द",
    
    orderPlaced: "ऑर्डर दिया गया",
    preparing: "तैयार हो रहा है",
    onTheWay: "रास्ते में",
    
    cancel: "रद्द करें",
    reorder: "फिर से ऑर्डर करें",
    details: "विवरण",
    
    cancelTitle: "ऑर्डर रद्द करें",
    cancelConfirm: "क्या आप वाकई यह ऑर्डर रद्द करना चाहते हैं?",
    cancelSuccess: "ऑर्डर सफलतापूर्वक रद्द कर दिया गया",
    cancelError: "ऑर्डर रद्द करने में विफल",
    reorderTitle: "फिर से ऑर्डर करें",
    reorderConfirm: "सभी आइटम कार्ट में जोड़ें?",
    later: "बाद में",
    addToCart: "कार्ट में जोड़ें",
    success: "सफलता",
    itemsAdded: "आइटम कार्ट में जोड़ दिए गए!",
    error: "त्रुटि",
    
    today: "आज",
    yesterday: "कल",
    daysAgo: "दिन पहले",
  },

  // Marathi
  mr: {
    loadingOrders: "तुमचे ऑर्डर लोड होत आहेत...",
    ordersFound: "ऑर्डर सापडले",
    orderFound: "ऑर्डर सापडला",
    noOrders: "अद्याप कोणतेही ऑर्डर नाहीत",
    noOrdersDesc: "स्वादिष्ट अन्न ऑर्डर करणे सुरू करा!",
    browseMenu: "मेनू ब्राउझ करा",
    
    all: "सर्व",
    active: "सक्रिय",
    delivered: "वितरित",
    cancelled: "रद्द",
    
    orderPlaced: "ऑर्डर दिला",
    preparing: "तयार होत आहे",
    onTheWay: "मार्गावर",
    
    cancel: "रद्द करा",
    reorder: "पुन्हा ऑर्डर करा",
    details: "तपशील",
    
    cancelTitle: "ऑर्डर रद्द करा",
    cancelConfirm: "तुम्हाला खात्री आहे की तुम्ही हा ऑर्डर रद्द करू इच्छिता?",
    cancelSuccess: "ऑर्डर यशस्वीरित्या रद्द केला",
    cancelError: "ऑर्डर रद्द करण्यात अयशस्वी",
    reorderTitle: "पुन्हा ऑर्डर करा",
    reorderConfirm: "सर्व वस्तू कार्टमध्ये जोडायच्या?",
    later: "नंतर",
    addToCart: "कार्टमध्ये जोडा",
    success: "यश",
    itemsAdded: "वस्तू कार्टमध्ये जोडल्या गेल्या!",
    error: "त्रुटी",
    
    today: "आज",
    yesterday: "काल",
    daysAgo: "दिवसांपूर्वी",
  },

  // Tamil
  ta: {
    loadingOrders: "உங்கள் ஆர்டர்கள் ஏற்றப்படுகின்றன...",
    ordersFound: "ஆர்டர்கள் கண்டறியப்பட்டன",
    orderFound: "ஆர்டர் கண்டறியப்பட்டது",
    noOrders: "இதுவரை ஆர்டர்கள் இல்லை",
    noOrdersDesc: "சுவையான உணவை ஆர்டர் செய்யத் தொடங்குங்கள்!",
    browseMenu: "மெனுவை உலாவுக",
    
    all: "அனைத்தும்",
    active: "செயலில்",
    delivered: "வழங்கப்பட்டது",
    cancelled: "ரத்து செய்யப்பட்டது",
    
    orderPlaced: "ஆர்டர் செய்யப்பட்டது",
    preparing: "தயாராகிறது",
    onTheWay: "வழியில்",
    
    cancel: "ரத்து",
    reorder: "மீண்டும் ஆர்டர்",
    details: "விவரங்கள்",
    
    cancelTitle: "ஆர்டரை ரத்து செய்",
    cancelConfirm: "இந்த ஆர்டரை ரத்து செய்ய விரும்புகிறீர்களா?",
    cancelSuccess: "ஆர்டர் வெற்றிகரமாக ரத்து செய்யப்பட்டது",
    cancelError: "ஆர்டரை ரத்து செய்ய முடியவில்லை",
    reorderTitle: "மீண்டும் ஆர்டர்",
    reorderConfirm: "அனைத்து பொருட்களையும் கார்ட்டில் சேர்க்கவா?",
    later: "பின்னர்",
    addToCart: "கார்ட்டில் சேர்",
    success: "வெற்றி",
    itemsAdded: "பொருட்கள் கார்ட்டில் சேர்க்கப்பட்டன!",
    error: "பிழை",
    
    today: "இன்று",
    yesterday: "நேற்று",
    daysAgo: "நாட்களுக்கு முன்பு",
  },

  // Gujarati
  gu: {
    loadingOrders: "તમારા ઓર્ડર લોડ થઈ રહ્યા છે...",
    ordersFound: "ઓર્ડર મળ્યા",
    orderFound: "ઓર્ડર મળ્યો",
    noOrders: "હજી સુધી કોઈ ઓર્ડર નથી",
    noOrdersDesc: "સ્વાદિષ્ટ ભોજન ઓર્ડર કરવાનું શરૂ કરો!",
    browseMenu: "મેનુ બ્રાઉઝ કરો",
    
    all: "બધા",
    active: "સક્રિય",
    delivered: "ડિલિવર થયેલ",
    cancelled: "રદ થયેલ",
    
    orderPlaced: "ઓર્ડર આપ્યો",
    preparing: "તૈયાર થઈ રહ્યું છે",
    onTheWay: "માર્ગ પર",
    
    cancel: "રદ કરો",
    reorder: "ફરીથી ઓર્ડર કરો",
    details: "વિગતો",
    
    cancelTitle: "ઓર્ડર રદ કરો",
    cancelConfirm: "શું તમે ખરેખર આ ઓર્ડર રદ કરવા માંગો છો?",
    cancelSuccess: "ઓર્ડર સફળતાપૂર્વક રદ થયો",
    cancelError: "ઓર્ડર રદ કરવામાં નિષ્ફળ",
    reorderTitle: "ફરીથી ઓર્ડર કરો",
    reorderConfirm: "બધી વસ્તુઓ કાર્ટમાં ઉમેરો?",
    later: "પછી",
    addToCart: "કાર્ટમાં ઉમેરો",
    success: "સફળતા",
    itemsAdded: "વસ્તુઓ કાર્ટમાં ઉમેરાઈ!",
    error: "ભૂલ",
    
    today: "આજે",
    yesterday: "ગઈકાલે",
    daysAgo: "દિવસ પહેલા",
  },
};

export default function OrderScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  
  // 🔥 Language state
  const [language, setLanguage] = useState("en");
  
  // 🔥 Translation function
  const t = (key: string) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  /* ================= ANIMATION VALUES ================= */
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef<Animated.Value[]>([]).current;

  /* ================= DATA ================= */
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Load saved language
  useEffect(() => {
    loadLanguage();
  }, []);

  useFocusEffect(
  useCallback(() => {
    loadLanguage();
  }, [])
);

  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang) {
        setLanguage(savedLang);
      }
    } catch (error) {
      console.log('Error loading language:', error);
    }
  };

  // 🔥 Entrance Animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
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
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(filterAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    try {
      console.log("1️⃣ FetchOrders chala");

      const token = await AsyncStorage.getItem("token");
      console.log("2️⃣ TOKEN mila:", token);

      const response = await axios.get(`${BASE_URL}/api/orders/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("3️⃣ API se data aaya:", response.data);
      setOrders(response.data);

    } catch (error) {
      console.log("❌ ORDER ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const formattedOrders = orders.map(order => ({
    id: order._id,
    createdAt: new Date(order.createdAt).getTime(),
    date: new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    }),
    time: new Date(order.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    items: (order.orderItems || []).map((item: any) => ({
      name: item.food?.name || "Food Item",
      quantity: item.quantity,
      price: item.food?.price || 0,
    })),
    totalAmount: order.totalPrice,
    status:
      order.status === "Pending"
        ? "Order Placed"
        : order.status === "Preparing"
          ? "Preparing"
          : order.status === "Delivered"
            ? "Delivered"
            : "Cancelled",
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  /* ================= STATUS STYLE ================= */
  const getStatus = (status: Order["status"]) => {
    const map = {
      "Order Placed": {
        bg: mode === 'dark' ? '#1B5E20' : '#E8F5E9',
        text: mode === 'dark' ? '#4CAF50' : colors.primary,
        icon: "receipt" as const
      },
      Preparing: {
        bg: mode === 'dark' ? '#5D4037' : '#FFF3E0',
        text: mode === 'dark' ? '#FFB74D' : colors.warning,
        icon: "restaurant" as const
      },
      "On the way": {
        bg: mode === 'dark' ? '#1B5E20' : '#E8F5E9',
        text: mode === 'dark' ? '#4CAF50' : colors.success,
        icon: "bicycle" as const
      },
      Delivered: {
        bg: mode === 'dark' ? '#1B5E20' : '#E8F5E9',
        text: mode === 'dark' ? '#4CAF50' : colors.success,
        icon: "checkmark-circle" as const
      },
      Cancelled: {
        bg: mode === 'dark' ? '#4A235A' : '#FFEBEE',
        text: mode === 'dark' ? '#EF5350' : colors.danger,
        icon: "close-circle" as const
      },
    };
    return map[status];
  };

  /* ================= FILTER ================= */
  const filteredOrders = formattedOrders.filter((order) => {
    let statusMatch = true;

    if (activeFilter === "Active") {
      statusMatch = ["Order Placed", "Preparing", "On the way"].includes(order.status);
    } else if (activeFilter !== "All") {
      statusMatch = order.status === activeFilter;
    }

    let searchMatch = true;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      searchMatch =
        order.id.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query)) ||
        order.status.toLowerCase().includes(query);
    }

    return statusMatch && searchMatch;
  });

  const sortedOrders = [...filteredOrders].sort(
    (a: any, b: any) => b.createdAt - a.createdAt
  );

  /* ================= HANDLERS ================= */
  const handleCancelOrder = async (orderId: string) => {
    try {
      console.log("Cancel Order ID:", orderId);
      const token = await AsyncStorage.getItem("token");

      const response = await axios.put(
        `${BASE_URL}/api/orders/${orderId}/status`,
        { status: "Cancelled" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Cancel Response:", response.data);
      Alert.alert(t("success"), t("cancelSuccess"));
      fetchOrders();

    } catch (error: any) {
      console.log("Cancel Error:", error.response?.data || error.message);
      Alert.alert(t("error"), t("cancelError"));
    }
  };

  const handleReorder = (orderId: string) => {
    Alert.alert(
      t("reorderTitle"),
      t("reorderConfirm"),
      [
        { text: t("later"), style: "cancel" },
        {
          text: t("addToCart"),
          onPress: () => {
            Alert.alert(t("success"), t("itemsAdded"));
            router.push("/cart");
          }
        }
      ]
    );
  };

  // 🔥 Card Press Animation
  const animateCardPress = (index: number) => {
    if (!cardAnimations[index]) {
      cardAnimations[index] = new Animated.Value(1);
    }
    
    Animated.sequence([
      Animated.timing(cardAnimations[index], {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnimations[index], {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* ================= ORDER CARD WITH ANIMATION ================= */
  const renderOrder = ({ item, index }: { item: Order; index: number }) => {
    const status = getStatus(item.status);
    const itemNames = item.items.map(i => i.name).join(", ");

    // Create animation for each card
    if (!cardAnimations[index]) {
      cardAnimations[index] = new Animated.Value(0);
      
      // Staggered entrance animation
      Animated.timing(cardAnimations[index], {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }

    const cardScale = cardAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
    });

    const cardOpacity = cardAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const cardTranslateY = cardAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    // Translate status text
    const statusText = 
      item.status === "Order Placed" ? t("orderPlaced") :
      item.status === "Preparing" ? t("preparing") :
      item.status === "On the way" ? t("onTheWay") :
      item.status === "Delivered" ? t("delivered") :
      t("cancelled");

    return (
      <Animated.View
        style={[
          styles.orderCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: cardOpacity,
            transform: [
              { scale: cardScale },
              { translateY: cardTranslateY }
            ],
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            animateCardPress(index);
            router.push(`/order/${item.id}`);
          }}
        >
          <View style={styles.orderHeader}>
            <View style={styles.topRow}>
              <Animated.View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Ionicons name={status.icon} size={14} color={status.text} />
                <Text style={[styles.statusText, { color: status.text }]}>
                  {statusText}
                </Text>
              </Animated.View>
            </View>

            <View style={styles.dishRow}>
              <Ionicons name="fast-food-outline" size={18} color={colors.primary} />
              <Text style={[styles.dishName, { color: colors.text }]} numberOfLines={2}>
                {itemNames}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.dateTimeContainer}>
                <Ionicons name="calendar-outline" size={14} color={colors.subText} />
                <Text style={[styles.detailText, { color: colors.subText }]}>
                  {item.date}
                </Text>
                <Ionicons name="time-outline" size={14} color={colors.subText} style={{ marginLeft: 8 }} />
                <Text style={[styles.detailText, { color: colors.subText }]}>
                  {item.time}
                </Text>
              </View>
              <Text style={[styles.amountText, { color: colors.primary }]}>
                ₹{item.totalAmount}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ACTION BUTTONS with animation */}
        <Animated.View style={[
          styles.actionButtons,
          {
            borderColor: colors.border,
            backgroundColor: mode === 'dark' ? colors.background : '#F8F8F8',
            opacity: cardOpacity,
          }
        ]}>
          {item.status !== "Cancelled" && item.status !== "Delivered" && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: mode === 'dark' ? '#4A235A' : '#FFEBEE',
                  borderColor: mode === 'dark' ? '#6A3480' : '#FFCDD2'
                }
              ]}
              onPress={() => handleCancelOrder(item.id)}
            >
              <Ionicons name="close-circle" size={16} color={colors.danger} />
              <Text style={[styles.cancelButtonText, { color: colors.danger }]}>
                {t("cancel")}
              </Text>
            </TouchableOpacity>
          )}

          {item.status === "Delivered" && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: mode === 'dark' ? '#1B5E20' : '#E8F5E9',
                  borderColor: mode === 'dark' ? '#2E7D32' : '#C8E6C9'
                }
              ]}
              onPress={() => handleReorder(item.id)}
            >
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text style={[styles.reorderButtonText, { color: colors.primary }]}>
                {t("reorder")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.detailsButton,
              {
                backgroundColor: mode === 'dark' ? colors.card : '#F5F5F5',
                borderColor: mode === 'dark' ? colors.border : '#E0E0E0'
              }
            ]}
            onPress={() => {
              animateCardPress(index);
              router.push(`/order/${item.id}`);
            }}
          >
            <Text style={[styles.detailsButtonText, { color: colors.primary }]}>
              {t("details")}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <Animated.View style={[styles.container, { 
        backgroundColor: colors.background, 
        justifyContent: "center", 
        alignItems: "center",
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }]}>
        <Animated.View style={{
          transform: [{
            rotate: slideAnim.interpolate({
              inputRange: [0, 30],
              outputRange: ['0deg', '360deg']
            })
          }]
        }}>
          <Ionicons name="hourglass-outline" size={60} color={colors.primary} />
        </Animated.View>
        <Animated.Text style={[styles.loadingText, { 
          color: colors.text, 
          marginTop: 20,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          {t("loadingOrders")}
        </Animated.Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { 
      backgroundColor: colors.background,
      opacity: fadeAnim,
    }]}>
      {/* FILTER TABS with animation */}
      <Animated.View style={[
        styles.filterContainer,
        { 
          borderColor: colors.border, 
          backgroundColor: colors.card,
          opacity: filterAnim,
          transform: [{
            translateY: filterAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0]
            })
          }]
        }
      ]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {(["All", "Active", "Delivered", "Cancelled"] as FilterType[]).map(
            (filter, index) => {
              const filterScale = filterAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              });

              // Translate filter text
              const filterText = 
                filter === "All" ? t("all") :
                filter === "Active" ? t("active") :
                filter === "Delivered" ? t("delivered") :
                t("cancelled");

              return (
                <Animated.View
                  key={filter}
                  style={{
                    transform: [{ scale: filterScale }],
                    opacity: filterAnim,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.filterTab,
                      activeFilter === filter && {
                        backgroundColor: mode === 'dark' ? colors.primary + '30' : colors.primary + '15'
                      }
                    ]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text style={[
                      styles.filterText,
                      { color: activeFilter === filter ? colors.primary : colors.subText },
                      activeFilter === filter && styles.activeFilterText
                    ]}>
                      {filterText}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            }
          )}
        </ScrollView>
      </Animated.View>

      {/* ORDERS LIST */}
      <FlatList
        data={sortedOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          sortedOrders.length > 0 ? (
            <Animated.View 
              style={[
                styles.statsContainer,
                {
                  opacity: headerAnim,
                  transform: [{
                    translateX: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })
                  }]
                }
              ]}
            >
              <Text style={[styles.statsText, { color: colors.subText }]}>
                {sortedOrders.length} {sortedOrders.length === 1 ? t("orderFound") : t("ordersFound")}
              </Text>
            </Animated.View>
          ) : null
        )}
        ListEmptyComponent={() => (
          <Animated.View 
            style={[
              styles.emptyState,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
              }
            ]}
          >
            <Animated.View
              style={{
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }]
              }}
            >
              <Ionicons
                name="receipt-outline"
                size={100}
                color={colors.subText}
              />
            </Animated.View>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              {t("noOrders")}
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.subText }]}>
              {t("noOrdersDesc")}
            </Text>
            <TouchableOpacity
              style={[styles.startOrderButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/")}
            >
              <Text style={styles.startOrderButtonText}>{t("browseMenu")}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </Animated.View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
  },
filterContainer: {
  borderBottomWidth: 1,
  paddingVertical: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.02,
  shadowRadius: 2,
  elevation: 1,
},
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  filterText: {
    fontSize: 15,
    fontWeight: "600",
  },
  activeFilterText: {
    fontWeight: "700",
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statsText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
orderCard: {
  borderRadius: 16,
  marginBottom: 16,
  borderWidth: 1,
  overflow: "hidden",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 2,
},
  orderHeader: {
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  dishRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  dishName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 13,
    fontWeight: "500",
  },
  amountText: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    flex: 1,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  reorderButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  detailsButton: {
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
  },
  startOrderButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});