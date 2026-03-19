import { Tabs, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "@/config/api";
import { DeviceEventEmitter } from "react-native";
import { CART_UPDATED_EVENT } from "@/constants/CartEventEmitter";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Image,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import Colors from "@/constants/colors";
import { useTheme } from "../data/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../data/AuthContext";

const { width, height } = Dimensions.get("window");

// Local image import

// 🔥 TRANSLATIONS FOR 5 LANGUAGES
const translations: Record<string, any> = {

  // English
  en: {
    // Header Titles
    home: "Home",
    menu: "Menu",
    events: "Events",
    myOrders: "My Orders",
    profile: "Profile",
    cart: "Cart",
    defaultTitle: "Satvik Kaleva",

    // Restaurant Info
    restaurantName: "Satvik Kaleva",
    restaurantSubtitle: "Pure Vegetarian Restaurant",

    // Menu Items
    login: "Login",
    logout: "Logout",
    favorites: "Favorites",
    notifications: "Notifications",
    wallet: "Wallet",
    addresses: "Addresses",
    settings: "Settings",
    helpSupport: "Help & Support",
    aboutUs: "About Us",

    // Footer
    version: "Version 2.0.1",
    copyright: "© 2024 Satvik Kaleva",

    // User Info (Demo)
    userName: "Sattvik Kaleva",
    userEmail: "sattvik@kalewa.com",
  },

  // Hindi
  hi: {
    home: "होम",
    menu: "मेन्यू",
    events: "इवेंट्स",
    myOrders: "मेरे ऑर्डर",
    profile: "प्रोफाइल",
    cart: "कार्ट",
    defaultTitle: "सात्विक कालेवा",

    restaurantName: "सात्विक कालेवा",
    restaurantSubtitle: "शुद्ध शाकाहारी रेस्टोरेंट",

    login: "लॉगिन",
    logout: "लॉगआउट",
    favorites: "पसंदीदा",
    notifications: "सूचनाएं",
    wallet: "वॉलेट",
    addresses: "पते",
    settings: "सेटिंग्स",
    helpSupport: "सहायता",
    aboutUs: "हमारे बारे में",

    version: "संस्करण 2.0.1",
    copyright: "© 2024 सात्विक कालेवा",

    userName: "सात्विक कालेवा",
    userEmail: "satvik@kalewa.com",
  },

  // Marathi
  mr: {
    home: "होम",
    menu: "मेन्यू",
    events: "इव्हेंट्स",
    myOrders: "माझे ऑर्डर",
    profile: "प्रोफाइल",
    cart: "कार्ट",
    defaultTitle: "सात्विक काळेवा",

    restaurantName: "सात्विक काळेवा",
    restaurantSubtitle: "शुद्ध शाकाहारी रेस्टॉरंट",

    login: "लॉगिन",
    logout: "लॉगआउट",
    favorites: "आवडते",
    notifications: "सूचना",
    wallet: "वॉलेट",
    addresses: "पत्ते",
    settings: "सेटिंग्ज",
    helpSupport: "मदत",
    aboutUs: "आमच्याबद्दल",

    version: "आवृत्ती 2.0.1",
    copyright: "© 2024 सात्विक काळेवा",

    userName: "सात्विक काळेवा",
    userEmail: "satvik@kalewa.com",
  },

  // Tamil
  ta: {
    home: "முகப்பு",
    menu: "மெனு",
    events: "நிகழ்வுகள்",
    myOrders: "எனது ஆர்டர்கள்",
    profile: "சுயவிவரம்",
    cart: "கார்ட்",
    defaultTitle: "சாத்விக் கலேவா",

    restaurantName: "சாத்விக் கலேவா",
    restaurantSubtitle: "தூய சைவ உணவகம்",

    login: "உள்நுழைக",
    logout: "வெளியேறு",
    favorites: "விருப்பங்கள்",
    notifications: "அறிவிப்புகள்",
    wallet: "வாலட்",
    addresses: "முகவரிகள்",
    settings: "அமைப்புகள்",
    helpSupport: "உதவி",
    aboutUs: "எங்களைப் பற்றி",

    version: "பதிப்பு 2.0.1",
    copyright: "© 2024 சாத்விக் கலேவா",

    userName: "சாத்விக் கலேவா",
    userEmail: "satvik@kalewa.com",
  },

  // Gujarati
  gu: {
    home: "હોમ",
    menu: "મેનુ",
    events: "ઇવેન્ટ્સ",
    myOrders: "મારા ઓર્ડર",
    profile: "પ્રોફાઇલ",
    cart: "કાર્ટ",
    defaultTitle: "સાત્વિક કાલેવા",

    restaurantName: "સાત્વિક કાલેવા",
    restaurantSubtitle: "શુદ્ધ શાકાહારી રેસ્ટોરન્ટ",

    login: "લૉગિન",
    logout: "લૉગઆઉટ",
    favorites: "પસંદ",
    notifications: "સૂચનાઓ",
    wallet: "વૉલેટ",
    addresses: "સરનામાં",
    settings: "સેટિંગ્સ",
    helpSupport: "મદદ",
    aboutUs: "અમારા વિશે",

    version: "વર્ઝન 2.0.1",
    copyright: "© 2024 સાત્વિક કાલેવા",

    userName: "સાત્વિક કાલેવા",
    userEmail: "satvik@kalewa.com",
  },
};

export default function TabLayout() {
  const { colors, mode } = useTheme();
  const { user: authUser, isGuest } = useAuth();

  // 🔥 Language state
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState({
    name: "Satvik Kaleva",
    email: "",
  });

  const [avatar, setAvatar] = useState<string | null>(null);

  // 🔥 Translation function
  const t = (key: string) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const router = useRouter();
  const segments = useSegments();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  const loadCartCount = async () => {
    try {
      const count = await AsyncStorage.getItem("cartCount");

      if (count) {
        setCartCount(JSON.parse(count));
      } else {
        setCartCount(0);
      }

    } catch (error) {
      console.log("Cart count load error:", error);
    }
  };

  // 🔥 LIVE cart badge: subscribe to in-process updates from any screen
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      CART_UPDATED_EVENT,
      (newCount: number) => setCartCount(newCount)
    );
    return () => subscription.remove();
  }, []);

const loadOrderCount = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setOrderCount(0);
      return;
    }

    const res = await axios.get(`${BASE_URL}/api/orders/my-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setOrderCount(res.data.length);

  } catch (error) {
    console.log("Order count error:", error);
  }
};


  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("userInfo");

      if (userData) {
        const parsedUser = JSON.parse(userData);

        setUser({
          name: parsedUser.name,
          email: parsedUser.email,
        });

        setAvatar(parsedUser.avatar);
      }
    } catch (error) {
      console.log("User load error:", error);
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "?";
    const words = name.split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // 🔥 Load language and update user info
  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem("appLanguage");
      console.log("Saved Language:", savedLang); // debug

      if (savedLang && translations[savedLang]) {
        setLanguage(savedLang);
      }
    } catch (error) {
      console.log("Error loading language:", error);
    }
  };

  // 🔥 Load language on mount and when screen comes into focus
  useEffect(() => {
    loadLanguage();
  }, []);

 useFocusEffect(
  useCallback(() => {
    loadUser();
    loadCartCount();
    loadOrderCount();   // ⭐ add this
  }, [segments])
);

  useEffect(() => {
    loadLanguage();
  }, [segments]);


  // Animation values
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Get current active route for highlighting
  const getActiveRoute = () => {
    const currentSegment = segments[segments.length - 1];
    return (currentSegment || "index") as string;
  };

  // Get header title based on current route
  const getHeaderTitle = () => {
    const currentRoute = getActiveRoute();
    switch (currentRoute) {
      case "index":
        return t("home");
      case "menu":
        return t("menu");
      case "event":
        return t("events");
      case "order":
        return t("myOrders");
      case "profile":
        return t("profile");
      case "cart":
        return t("cart");
      default:
        return t("defaultTitle");
    }
  };

  // Open sidebar animation
  useEffect(() => {
    if (menuOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [menuOpen]);

  const handleLogin = () => {
    setMenuOpen(false);
    router.push("/auth/login");
  };

  const handleLogout = async () => {
    try {
      setMenuOpen(false);

      // token delete
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("cartCount");

      // ⭐ guest user create
      const guestUser = {
        _id: "guest_user",
        name: "Guest User",
        email: "",
        isGuest: true,
        avatar: null
      };

      // guest user save
      await AsyncStorage.setItem("userInfo", JSON.stringify(guestUser));

      // home page open
      router.replace("/");

    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  // Navigation helper function
  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  // Check if route is active
  const isActive = (routeName: string) => {
    const currentRoute = getActiveRoute();
    return currentRoute === routeName;
  };

  return (
    <>
      {/* ===== ENHANCED SIDEBAR MENU ===== */}
      <Modal
        transparent
        visible={menuOpen}
        animationType="none"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          onPress={() => setMenuOpen(false)}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              {
                backgroundColor: colors.card,
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            {/* Header with Profile */}
            <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
              <View style={styles.profileSection}>
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    key={avatar}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.initialsAvatar}>
                    <Text style={styles.initialsText}>{isGuest ? "G" : getInitials(user.name)}</Text>
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{isGuest ? "Guest User" : user.name}</Text>
                  <Text style={styles.userEmail}>{isGuest ? "Welcome to Satvik Kaleva" : user.email}</Text>
                </View>
              </View>

              {/* Restaurant Info */}

            </View>

            {/* Menu Items with ScrollView */}
            <ScrollView
              style={styles.menuScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: width * 0.075,
              }}
            >

              {/* Main menu items */}
              <MenuItem
                icon="home"
                title={t("home")}
                onPress={() => navigateTo("/")}
                active={isActive("index")}
                colors={colors}
                mode={mode}
              />

              <MenuItem
                icon="restaurant"
                title={t("menu")}
                onPress={() => navigateTo("/menu")}
                active={isActive("menu")}
                colors={colors}
                mode={mode}
              />

              <MenuItem
                icon="calendar"
                title={t("events")}
                onPress={() => navigateTo("/event")}
                active={isActive("event")}
                colors={colors}
                mode={mode}
              />
              <MenuItem
                icon="receipt"
                title={t("myOrders")}
                onPress={() => navigateTo("/order")}
                active={isActive("order")}
                badge={orderCount}
                colors={colors}
                mode={mode}
              />
              <MenuItem
                icon="person"
                title={t("profile")}
                onPress={() => navigateTo("/profile")}
                active={isActive("profile")}
                colors={colors}
                mode={mode}
              />



              <MenuItem
                icon="location"
                title={t("addresses")}
                onPress={() => navigateTo("/profile")}
                active={isActive("profile")}
                colors={colors}
                mode={mode}
              />

              <View style={[styles.divider, { backgroundColor: colors.border }]} />



              {/* Logout Button */}
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: '#FFF5F5' }]}
                onPress={handleLogout}
              >
                <View style={[styles.logoutIconContainer, { backgroundColor: '#FF475720' }]}>
                  <Ionicons name="log-out" size={22} color="#FF4757" />
                </View>
                <Text style={styles.logoutText}>{t("logout")}</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, {
              borderTopColor: colors.border,
              backgroundColor: mode === 'dark' ? colors.background : '#FAFAFA'
            }]}>
              <Text style={[styles.versionText, { color: colors.subText }]}>{t("version")}</Text>
              <Text style={[styles.copyrightText, { color: colors.subText }]}>{t("copyright")}</Text>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* ===== BOTTOM TABS ===== */}
      <Tabs
        key={language} // 🔥 Force re-render when language changes
        screenOptions={({ route }) => ({
          headerShown: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: mode === 'dark' ? "#8E8E93" : "#8E8E93",
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: 75,
            paddingBottom: 10,
            paddingTop: 8,
            paddingHorizontal: 5,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
            includeFontPadding: false,
            color: colors.text,
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },

          /* ENHANCED HAMBURGER MENU */
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                setMenuOpen(true);
              }}
              style={styles.menuButton}
            >
              <View style={[styles.menuButtonInner, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="menu" size={28} color={colors.primary} />
              </View>
            </TouchableOpacity>
          ),

          /* ENHANCED CART ICON */
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              style={styles.cartButton}
            >
              <View style={[styles.cartIconContainer, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="cart" size={24} color={colors.primary} />
                <View style={[styles.cartBadge, { backgroundColor: colors.primary, borderColor: colors.card }]}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ),

          /* DYNAMIC HEADER TITLE */
          headerTitle: () => (
            <Text style={[styles.headerTitleText, { color: colors.text }]}>{getHeaderTitle()}</Text>
          ),

          /* HEADER STYLING */
          headerStyle: {
            backgroundColor: colors.card,
            height: 110,
            shadowColor: mode === 'dark' ? '#000' : '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: mode === 'dark' ? 0.3 : 0.15,
            shadowRadius: 6,
            elevation: 6,
          },
          headerTitleAlign: 'center',
          headerTitleContainerStyle: {
            paddingHorizontal: 20,
          },
        })}
      >
        {/* HOME */}
        <Tabs.Screen
          name="index"
          options={{
            title: t("home"),
            tabBarIcon: ({ color, size }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons name="home" size={24} color={color} />
              </View>
            ),
          }}
        />

        {/* MENU */}
        <Tabs.Screen
          name="menu"
          options={{
            title: t("menu"),
            tabBarIcon: ({ color, size }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons name="restaurant" size={24} color={color} />
              </View>
            ),
          }}
        />

        {/* EVENT */}
        <Tabs.Screen
          name="event"
          options={{
            title: t("events"),
            headerShown: true,
            tabBarIcon: ({ color }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons name="calendar" size={24} color={color} />
              </View>
            ),
          }}
        />

        {/* ORDERS */}
        <Tabs.Screen
          name="order"
          options={{
            title: t("myOrders"),
            tabBarIcon: ({ color, size }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons name="receipt" size={24} color={color} />
              </View>
            ),
          }}
        />

        {/* PROFILE */}
        <Tabs.Screen
          name="profile"
          options={{
            title: t("profile"),
            tabBarIcon: ({ color, size }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons name="person" size={24} color={color} />
              </View>
            ),
          }}
         
        />

        {/* HIDDEN SCREENS */}
        <Tabs.Screen
          name="cart"
          options={{
            href: null,
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            href: null,
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            href: null,
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            href: null,
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="addresses"
          options={{
            href: null,
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            href: null,
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="help"
          options={{
            href: null,
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            href: null,
            headerShown: false
          }}
        />
      </Tabs>
    </>
  );
}

/* ================= ENHANCED MENU ITEM COMPONENT ================= */
interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  active?: boolean;
  badge?: number;
  colors: any;
  mode: string;
}

function MenuItem({ icon, title, onPress, active = false, badge, colors, mode }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        active && [styles.activeMenuItem, { backgroundColor: colors.primary + '15' }]
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.menuIconContainer,
        { backgroundColor: mode === 'dark' ? colors.background : '#F5F5F5' },
        active && [styles.activeIconContainer, { backgroundColor: colors.primary + '30' }]
      ]}>
        <Ionicons
          name={icon as any}
          size={22}
          color={active ? colors.primary : colors.subText}
        />
      </View>
      <Text style={[
        styles.menuText,
        { color: colors.text },
        active && [styles.activeMenuText, { color: colors.primary }]
      ]}>
        {title}
      </Text>
      {badge !== undefined && badge > 0 ? (
        <View style={[styles.menuBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.subText}
          style={styles.chevronIcon}
        />
      )}
    </TouchableOpacity>
  );
}

/* ================= PROFESSIONAL STYLES ================= */
const styles = StyleSheet.create({
  // Overlay
  overlay: {
    flex: 1,
  },
  menuContainer: {
    width: 300,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },

  // Header Section
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
    marginRight: 15,
    backgroundColor: '#F5F5F5',
  },
  initialsAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
  },
  initialsText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF8A00',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  restaurantInfo: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 12,
  },
  restaurantTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  restaurantSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },

  // Menu Scroll View
  menuScrollView: {
    flex: 1,
  },
  menuItemsContainer: {
    paddingVertical: 20,
    paddingBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  activeMenuItem: {
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activeIconContainer: {
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  activeMenuText: {
    fontWeight: '700',
  },
  menuBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  menuBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  chevronIcon: {
    marginLeft: 10,
  },
  divider: {
    height: 1,
    marginVertical: 15,
    marginHorizontal: 20,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4757',
    flex: 1,
  },

  // Footer
  footer: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
  },

  // Header Buttons and Title
  headerTitleText: {
    fontSize: 22,
    fontWeight: '800',
  },
  menuButton: {
    marginLeft: 15,
  },
  menuButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    marginRight: 15,
  },
  cartIconContainer: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    borderRadius: 10,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Tab Icons
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginTop: 3,
  },
});