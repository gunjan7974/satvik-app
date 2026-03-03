import { Tabs, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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


const { width, height } = Dimensions.get("window");

// Local image import
const GUNJAN_IMAGE = require("../../assets/images/gunjan.png"); // अपना सही path दें

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState({
    name: "Satvik Kaleva",
    email: "satvik@kalewa.com",
  });

  // Animation values
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Get current active route for highlighting
  const getActiveRoute = () => {
    const currentSegment = segments[segments.length - 1];
    if (!user) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading Profile...</Text>
    </View>
  );
}
    return currentSegment || "index";
  };

  // Get header title based on current route
  const getHeaderTitle = () => {
    const currentRoute = getActiveRoute();
    switch (currentRoute) {
      case "index":
        return "Home";
      case "menu":
        return "Menu";
      case "event":
        return "Events";
      case "order":
        return "My Orders";
      case "profile":
        return "Profile";
      case "cart":
        return "Cart";
      default:
        return "Satvik Kaleva";
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

  const handleLogout = () => {
    setMenuOpen(false);
    // Add your logout logic here
    console.log("User logged out");
    router.replace("../auth/login");
  };

  // Navigation helper function
  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
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
          style={styles.overlay}
          onPress={() => setMenuOpen(false)}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            {/* Header with Profile */}
            <View style={styles.headerContainer}>
              <View style={styles.profileSection}>
                <Image
                  source={GUNJAN_IMAGE}  // Local image use करें
                  style={styles.profileImage}
                  resizeMode="cover"
                  onError={(error) => console.log("Image error:", error)}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </View>

              {/* Restaurant Info */}
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantTitle}>Satvik Kaleva</Text>
                <Text style={styles.restaurantSubtitle}>Pure Vegetarian Restaurant</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>4.8 (1.2k reviews)</Text>
                </View>
              </View>
            </View>

            {/* Menu Items with ScrollView */}
            <ScrollView
              style={styles.menuScrollView}
              showsVerticalScrollIndicator={false}
contentContainerStyle={{
  paddingHorizontal: width * 0.075,
}}


            >

              {/* 🔐 LOGIN BUTTON (TOP) */}
              <MenuItem
                icon="log-in"
                title="Login"
                onPress={handleLogin}
              />

              <View style={styles.divider} />

              {/* बाकी menu items */}
              <MenuItem
                icon="home"
                title="Home"
                onPress={() => navigateTo("/")}
                active={isActive("index")}
              />

              <MenuItem
                icon="restaurant"
                title="Menu"
                onPress={() => navigateTo("/menu")}
                active={isActive("menu")}
              />

              <MenuItem
                icon="calendar"
                title="Events"
                onPress={() => navigateTo("/event")}
                active={isActive("event")}
              />
              <MenuItem
                icon="receipt"
                title="My Orders"
                onPress={() => navigateTo("/order")}
                active={isActive("order")}
                badge={3}
              />
              <MenuItem
                icon="person"
                title="Profile"
                onPress={() => navigateTo("/profile")}
                active={isActive("profile")}
              />

              <View style={styles.divider} />

              <MenuItem
                icon="heart"
                title="Favorites"
                onPress={() => navigateTo("/favorites")}
                active={isActive("favorites")}
              />
              <MenuItem
                icon="notifications"
                title="Notifications"
                onPress={() => navigateTo("/notifications")}
                active={isActive("notifications")}
                badge={5}
              />
              <MenuItem
                icon="wallet"
                title="Wallet"
                onPress={() => navigateTo("/wallet")}
                active={isActive("wallet")}
              />
              <MenuItem
                icon="location"
                title="Addresses"
                onPress={() => navigateTo("/addresses")}
                active={isActive("addresses")}
              />

              <View style={styles.divider} />

              <MenuItem
                icon="settings"
                title="Settings"
                onPress={() => navigateTo("/settings")}
                active={isActive("settings")}
              />
              <MenuItem
                icon="help-circle"
                title="Help & Support"
                onPress={() => navigateTo("/help")}
                active={isActive("help")}
              />
              <MenuItem
                icon="information-circle"
                title="About Us"
                onPress={() => navigateTo("/about")}
                active={isActive("about")}
              />

              <View style={styles.divider} />

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <View style={styles.logoutIconContainer}>
                  <Ionicons name="log-out" size={22} color="#FF4757" />
                </View>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.versionText}>Version 2.0.1</Text>
              <Text style={styles.copyrightText}>© 2024 Satvik Kaleva</Text>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* ===== BOTTOM TABS ===== */}
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: true,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: "#8E8E93",
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E5E5EA',
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
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },

          /* ENHANCED HAMBURGER MENU */
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => setMenuOpen(true)}
              style={styles.menuButton}
            >
              <View style={styles.menuButtonInner}>
                <Ionicons name="menu" size={28} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          ),

          /* ENHANCED CART ICON */
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              style={styles.cartButton}
            >
              <View style={styles.cartIconContainer}>
                <Ionicons name="cart" size={24} color={Colors.primary} />
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>3</Text>
                </View>
              </View>
            </TouchableOpacity>
          ),

          /* DYNAMIC HEADER TITLE */
          headerTitle: () => (
            <Text style={styles.headerTitleText}>{getHeaderTitle()}</Text>
          ),

          /* HEADER STYLING */
          headerStyle: {
            backgroundColor: '#fff',
            height: 110,          // 🔥 IMPORTANT
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
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
            title: "Home",
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
            title: "Menu",
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
    title: "Events",
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
            title: "Orders",
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
            title: "Profile",
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
}

function MenuItem({ icon, title, onPress, active = false, badge }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, active && styles.activeMenuItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, active && styles.activeIconContainer]}>
        <Ionicons
          name={icon as any}
          size={22}
          color={active ? Colors.primary : "#666"}
        />
      </View>
      <Text style={[styles.menuText, active && styles.activeMenuText]}>
        {title}
      </Text>
      {badge !== undefined && badge > 0 ? (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#999"
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuContainer: {
    width: 300,
    backgroundColor: "#fff",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },

  // Header Section
  headerContainer: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
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
    backgroundColor: '#F5F5F5', // Fallback background
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
    backgroundColor: `${Colors.primary}15`,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activeIconContainer: {
    backgroundColor: `${Colors.primary}30`,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  activeMenuText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  menuBadge: {
    backgroundColor: Colors.primary,
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
    backgroundColor: '#F0F0F0',
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
    backgroundColor: '#FFF5F5',
    marginTop: 10,
    marginBottom: 20,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF475720',
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
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#666',
  },

  // Header Buttons and Title
  headerTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
  },
  menuButton: {
    marginLeft: 15,
  },
  menuButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}10`,
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
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: '#fff',
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