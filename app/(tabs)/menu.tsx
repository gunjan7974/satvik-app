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
} from "react-native";
import { ActivityIndicator } from "react-native";
import axios from "axios";
import { BASE_URL } from "@/config/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import Colors from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

/* ================= ALL MENU ITEMS IN ONE ARRAY ================= */
// const ALL_MENU_ITEMS = [
//   // South Indian
//   { id: "1", name: "Masala Dosa", price: "₹120", description: "Crispy crepe with potato filling", rating: 4.5, isVeg: true, image: AVAILABLE_IMAGES.si, category: "South Indian" },
//   { id: "2", name: "Idli Sambhar", price: "₹80", description: "Soft rice cakes with lentil soup", rating: 4.3, isVeg: true, image: AVAILABLE_IMAGES.si, category: "South Indian" },
//   { id: "3", name: "Vada Sambhar", price: "₹90", description: "Fried lentil donuts with soup", rating: 4.2, isVeg: true, image: AVAILABLE_IMAGES.si, category: "South Indian" },
//   { id: "4", name: "Uttapam", price: "₹100", description: "Thick pancake with toppings", rating: 4.4, isVeg: true, image: AVAILABLE_IMAGES.si, category: "South Indian" },
//   { id: "5", name: "Pongal", price: "₹110", description: "Rice and lentil porridge", rating: 4.6, isVeg: true, image: AVAILABLE_IMAGES.si, category: "South Indian" },

//   // Breakfast/Nasta corner
//   { id: "6", name: "Poha", price: "₹60", description: "Flattened rice with vegetables", rating: 4.2, isVeg: true, image: AVAILABLE_IMAGES.bn, category: "Breakfast/Nasta corner" },
//   { id: "7", name: "Upma", price: "₹65", description: "Semolina savory porridge", rating: 4.0, isVeg: true, image: AVAILABLE_IMAGES.bn, category: "Breakfast/Nasta corner" },
//   { id: "8", name: "Sandwich", price: "₹90", description: "Grilled vegetable sandwich", rating: 4.3, isVeg: true, image: AVAILABLE_IMAGES.bn, category: "Breakfast/Nasta corner" },
//   { id: "9", name: "Paratha", price: "₹70", description: "Layered flatbread with curd", rating: 4.1, isVeg: true, image: AVAILABLE_IMAGES.r, category: "Breakfast/Nasta corner" },

//   // Morning Beverages
//   { id: "10", name: "Masala Chai", price: "₹30", description: "Spiced Indian tea", rating: 4.7, isVeg: true, image: AVAILABLE_IMAGES.mb, category: "Morning Beverages" },
//   { id: "11", name: "Coffee", price: "₹40", description: "Filter coffee", rating: 4.5, isVeg: true, image: AVAILABLE_IMAGES.mb, category: "Morning Beverages" },
//   { id: "12", name: "Badam Milk", price: "₹60", description: "Almond milk", rating: 4.4, isVeg: true, image: AVAILABLE_IMAGES.mb, category: "Morning Beverages" },
//   { id: "13", name: "Fresh Juice", price: "₹80", description: "Seasonal fruit juice", rating: 4.6, isVeg: true, image: AVAILABLE_IMAGES.mb, category: "Morning Beverages" },

//   // Soup
//   { id: "14", name: "Tomato Soup", price: "₹90", description: "Creamy tomato soup", rating: 4.3, isVeg: true, image: AVAILABLE_IMAGES.soup, category: "Soup" },
//   { id: "15", name: "Sweet Corn Soup", price: "₹100", description: "Vegetable corn soup", rating: 4.4, isVeg: true, image: AVAILABLE_IMAGES.soup, category: "Soup" },
//   { id: "16", name: "Hot & Sour Soup", price: "₹110", description: "Spicy sour soup", rating: 4.5, isVeg: true, image: AVAILABLE_IMAGES.soup, category: "Soup" },
//   { id: "17", name: "Manchow Soup", price: "₹120", description: "Noodle vegetable soup", rating: 4.6, isVeg: true, image: AVAILABLE_IMAGES.soup, category: "Soup" },

//   // Evening Snacks
//   { id: "18", name: "Samosa", price: "₹40", description: "Fried pastry with potato filling", rating: 4.5, isVeg: true, image: AVAILABLE_IMAGES.ev, category: "Evening Snacks" },
//   { id: "19", name: "Kachori", price: "₹45", description: "Stuffed fried snack", rating: 4.3, isVeg: true, image: AVAILABLE_IMAGES.ev, category: "Evening Snacks" },
//   { id: "20", name: "Pakora", price: "₹50", description: "Vegetable fritters", rating: 4.4, isVeg: true, image: AVAILABLE_IMAGES.ev, category: "Evening Snacks" },
//   { id: "21", name: "Bread Pakoda", price: "₹60", description: "Bread slices fried in batter", rating: 4.2, isVeg: true, image: AVAILABLE_IMAGES.ev, category: "Evening Snacks" },

//   // Fresh & Eat
//   { id: "22", name: "Fruit Salad", price: "₹100", description: "Fresh seasonal fruits", rating: 4.6, isVeg: true, image: AVAILABLE_IMAGES.fe, category: "Fresh & Eat" },
//   { id: "23", name: "Sprouts Salad", price: "₹80", description: "Healthy sprouted beans", rating: 4.4, isVeg: true, image: AVAILABLE_IMAGES.fe, category: "Fresh & Eat" },
//   { id: "24", name: "Green Salad", price: "₹70", description: "Fresh vegetables", rating: 4.3, isVeg: true, image: AVAILABLE_IMAGES.fe, category: "Fresh & Eat" },

//   // Main Course
//   { id: "25", name: "Thali", price: "₹180", description: "Complete meal with variety", rating: 4.7, isVeg: true, image: AVAILABLE_IMAGES.mc, category: "Main Course" },
//   { id: "26", name: "Rice Plate", price: "₹120", description: "Rice with vegetables", rating: 4.4, isVeg: true, image: AVAILABLE_IMAGES.mc, category: "Main Course" },
//   { id: "27", name: "Roti Sabji", price: "₹110", description: "Indian bread with curry", rating: 4.5, isVeg: true, image: AVAILABLE_IMAGES.r, category: "Main Course" },

//   // Mini Snacks
//   { id: "28", name: "Chips", price: "₹20", description: "Potato chips", rating: 4.0, isVeg: true, image: AVAILABLE_IMAGES.ms, category: "Mini Snacks" },
//   { id: "29", name: "Biscuits", price: "₹25", description: "Assorted cookies", rating: 4.1, isVeg: true, image: AVAILABLE_IMAGES.ms, category: "Mini Snacks" },
//   { id: "30", name: "Namkeen", price: "₹30", description: "Indian savory mix", rating: 4.3, isVeg: true, image: AVAILABLE_IMAGES.ms, category: "Mini Snacks" },

//   // Organic Food
//   { id: "31", name: "Organic Salad", price: "₹150", description: "Fresh organic vegetables", rating: 4.8, isVeg: true, image: AVAILABLE_IMAGES.of, category: "Organic Food" },
//   { id: "32", name: "Herbal Tea", price: "₹50", description: "Organic herbal infusion", rating: 4.6, isVeg: true, image: AVAILABLE_IMAGES.of, category: "Organic Food" },

//   // Traditional Sweets
//   { id: "33", name: "Gulab Jamun", price: "₹60", description: "Sweet milk dumplings", rating: 4.7, isVeg: true, image: AVAILABLE_IMAGES.ts, category: "Traditional Sweets" },
//   { id: "34", name: "Rasgulla", price: "₹55", description: "Sweet cheese balls", rating: 4.6, isVeg: true, image: AVAILABLE_IMAGES.ts, category: "Traditional Sweets" },
//   { id: "35", name: "Jalebi", price: "₹50", description: "Sweet spiral dessert", rating: 4.5, isVeg: true, image: AVAILABLE_IMAGES.ts, category: "Traditional Sweets" },
// ];

// Filter types
type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'name';
type RatingFilter = 'all' | '3.5+' | '4.0+' | '4.5+';
type PriceFilter = 'all' | 'under-100' | '100-200' | '200+';

// Helper function to highlight search term in text
const HighlightText = ({ text, searchTerm, style }: { text: string; searchTerm: string; style: any }) => {
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
      <Text style={[style, { color: Colors.primary, fontWeight: '800' }]}>
        {matched}
      </Text>
      {after}
    </Text>
  );
};

export default function MenuScreen() {

  const router = useRouter();
  const { categoryId } = useLocalSearchParams();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  // Filter states
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [compactView, setCompactView] = useState(false); // New state for compact view

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const filterSlideAnim = useRef(new Animated.Value(300)).current;
  const itemAnim = useRef(new Animated.Value(50)).current;

  // Check if any filter is active
  const isFilterActive = () => {
    return sortBy !== 'relevance' || ratingFilter !== 'all' || priceFilter !== 'all' || searchQuery !== "";
  };

  // Update compactView based on filters
  useEffect(() => {
    // Set compactView to true if any filter is active
    if (isFilterActive()) {
      setCompactView(true);
    }
  }, [sortBy, ratingFilter, priceFilter, searchQuery]);

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

  const fetchMenuItems = async () => {
    try {
      setLoading(true);

      let url = `${BASE_URL}/api/foods`;

      // Only add category filter if categoryId exists
      if (categoryId) {
        url = `${BASE_URL}/api/foods?category=${categoryId}`;
      }

      const response = await axios.get(url);

      console.log("FOODS DATA:", response.data); // 🔥 DEBUGconsole.log("CART API CALLED");

      setMenuItems(response.data);

    } catch (error) {
      console.log("Menu Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };  // Keyboard listeners
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

  // Helper function to extract numeric price from string like "₹120"
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

  // Update search suggestions when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const suggestions = getSearchSuggestions(searchQuery);
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const itemsToDisplay = getFilteredItems();

  const handleSearchItemSelect = (item: any) => {
    setSearchQuery(item.name);
    setSelectedItem(item);
    setShowSuggestions(false);
    setShowItemModal(true);
  };
const addToCart = async (item: any) => {
  try {

    const token = await AsyncStorage.getItem("token");

    console.log("FOOD ID:", item._id);
    console.log("QUANTITY:", quantity);

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

    console.log("ITEM ADDED TO CART");

    setShowItemModal(false);
    setQuantity(1);

    router.push("/cart");

  } catch (error:any) {
    console.log("CART ERROR:", error.response?.data || error.message);
  }
};


const updateQuantity = (_id: string, delta: number) => {
  setCart(prev =>
    prev.map(item =>
      item._id === _id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    )
  );
};

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  // Reset all filters
  const resetFilters = () => {
    setSortBy('relevance');
    setRatingFilter('all');
    setPriceFilter('all');
    setSearchQuery("");
    setCompactView(false);
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
            color={star <= safeRating ? "#FFD700" : "#CCCCCC"}
          />
        ))}
        <Text style={styles.ratingText}>
          {safeRating.toFixed(1)}
        </Text>
      </View>
    );
  };
  // Render compact cards when filters are active
  const renderCompactCard = (item: any) => (
    <View
  style={styles.compactCard}
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
        <View style={styles.vegIndicator}>
          <View style={styles.vegDot} />
        </View>
      </View>

      <View style={styles.compactContent}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.compactCategoryTag}>
            <Text style={styles.compactCategoryText}>{item.category}</Text>
          </View>
        </View>

        <Text style={styles.compactDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {renderStars(item.rating || 4)}

        <View style={styles.compactFooter}>
          <Text style={styles.compactPrice}>₹{item.price}</Text>
          <TouchableOpacity
            style={styles.compactAddButton}
            onPress={() => {
              setSelectedItem(item);
              setQuantity(1);
              addToCart(item);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.compactAddButtonText}>ADD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render full card when no filters are active
 const renderFullCard = (item: any) => (
  <View style={styles.fullCard}>

    <View style={styles.fullImageContainer}>
      <Image
        source={{
          uri: item.image && item.image.startsWith("http")
            ? item.image
            : "https://via.placeholder.com/150"
        }}
        style={styles.fullImage}
      />
      <View style={styles.vegIndicator}>
        <View style={styles.vegDot} />
      </View>
    </View>

    <View style={styles.fullContent}>
      <View style={styles.fullHeader}>
        <Text style={styles.fullName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.fullCategoryTag}>
          <Text style={styles.fullCategoryText}>
            {item.category}
          </Text>
        </View>
      </View>

      <Text style={styles.fullDescription} numberOfLines={2}>
        {item.description}
      </Text>

      {renderStars(item.rating || 4)}

      <View style={styles.fullFooter}>
        <Text style={styles.fullPrice}>₹{item.price}</Text>

        {/* ✅ ONLY BUTTON CLICKABLE */}
        <TouchableOpacity
          style={styles.fullAddButton}
          onPress={() => {
            setSelectedItem(item);
            setQuantity(1);
            setShowItemModal(true);   // ✅ Modal open karega
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.fullAddButtonText}>ADD</Text>
        </TouchableOpacity>

      </View>
    </View>

  </View>
);
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
          }
        ]}
      >


        {/* ===== SEARCH BAR ===== */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              placeholder="Search food items..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.trim()) {
                  setShowSuggestions(true);
                }
              }}
              style={styles.searchInput}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* ===== SEARCH SUGGESTIONS ===== */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <Animated.View style={[
              styles.suggestionsContainer,
              keyboardVisible && styles.suggestionsContainerWithKeyboard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}>
              <View style={styles.suggestionsHeader}>
                <Text style={styles.suggestionsHeaderText}>
                  Suggestions for "<Text style={styles.searchTermHighlight}>{searchQuery}</Text>"
                </Text>
              </View>
              <ScrollView
                style={styles.suggestionsScrollView}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {searchSuggestions.map((item, index) => (
                  <TouchableOpacity
                    key={`${item._id}-${index}`}
                    style={[
                      styles.suggestionItem,
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
                        style={styles.suggestionItemName}
                      />
                      <HighlightText
                        text={item.category}
                        searchTerm={searchQuery}
                        style={styles.suggestionItemCategory}
                      />
                      <View style={styles.suggestionItemRating}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.suggestionItemRatingText}>
                          {(item.rating || 4).toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.suggestionItemPriceContainer}>
                      <Text style={styles.suggestionItemPrice}>₹{item.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}
        </View>

        {/* ===== FILTERS BAR ===== */}
        <View style={styles.filtersBar}>
          <TouchableOpacity
            style={[styles.filterButton, compactView && styles.filterButtonActive]}
            onPress={() => setShowFiltersModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="filter" size={16} color={compactView ? Colors.primary : Colors.textBody} />
            <Text style={[styles.filterButtonText, compactView && styles.filterButtonTextActive]}>
              Filters {compactView && `• Applied`}
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
                ratingFilter === '4.5+' && styles.quickFilterActive
              ]}
              onPress={() => {
                setRatingFilter(ratingFilter === '4.5+' ? 'all' : '4.5+');
              }}
              activeOpacity={0.6}
            >
              <Ionicons name="star" size={14} color={ratingFilter === '4.5+' ? Colors.primary : Colors.textBody} />
              <Text style={[
                styles.quickFilterText,
                ratingFilter === '4.5+' && styles.quickFilterTextActive
              ]}>
                4.5+
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickFilter,
                priceFilter === 'under-100' && styles.quickFilterActive
              ]}
              onPress={() => {
                setPriceFilter(priceFilter === 'under-100' ? 'all' : 'under-100');
              }}
              activeOpacity={0.6}
            >
              <Text style={[
                styles.quickFilterText,
                priceFilter === 'under-100' && styles.quickFilterTextActive
              ]}>
                Under ₹100
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickFilter,
                sortBy === 'price-low' && styles.quickFilterActive
              ]}
              onPress={() => {
                setSortBy(sortBy === 'price-low' ? 'relevance' : 'price-low');
              }}
              activeOpacity={0.6}
            >
              <Text style={[
                styles.quickFilterText,
                sortBy === 'price-low' && styles.quickFilterTextActive
              ]}>
                ₹ Low to High
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickFilter,
                sortBy === 'rating' && styles.quickFilterActive
              ]}
              onPress={() => {
                setSortBy(sortBy === 'rating' ? 'relevance' : 'rating');
              }}
              activeOpacity={0.6}
            >
              <Ionicons name="trending-up" size={14} color={sortBy === 'rating' ? Colors.primary : Colors.textBody} />
              <Text style={[
                styles.quickFilterText,
                sortBy === 'rating' && styles.quickFilterTextActive
              ]}>
                Top Rated
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ===== MAIN CONTENT ===== */}

        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ marginTop: 10 }}>Loading menu...</Text>
          </View>

        ) : itemsToDisplay.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fast-food-outline" size={80} color="#DDD" />
            <Text style={styles.emptyText}>No items found</Text>
            <TouchableOpacity
              style={styles.resetAllButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetAllButtonText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          compactView ? (
            <FlatList
              key="compact-list"
              data={itemsToDisplay}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.compactMenuList}
              numColumns={2}
              renderItem={({ item }) => renderCompactCard(item)}
            />
          ) : (
            <FlatList
              key="full-list"
              data={itemsToDisplay}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.fullMenuList}
              numColumns={1}
              renderItem={({ item }) => renderFullCard(item)}
            />
          )
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
                  transform: [{ translateY: filterSlideAnim }]
                }
              ]}
            >
              <View style={styles.filtersModalHeader}>
                <Text style={styles.filtersModalTitle}>Filters</Text>
                <TouchableOpacity
                  onPress={() => setShowFiltersModal(false)}
                  style={styles.filtersModalCloseButton}
                >
                  <Ionicons name="close" size={24} color={Colors.textDark} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.filtersModalBody}
                showsVerticalScrollIndicator={false}
              >
                {/* Sort By Section */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Sort By</Text>
                  <View style={styles.filterOptions}>
                    {(['relevance', 'price-low', 'price-high', 'rating', 'name'] as SortOption[]).map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.filterOption,
                          sortBy === option && styles.filterOptionActive
                        ]}
                        onPress={() => setSortBy(option)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          sortBy === option && styles.filterOptionTextActive
                        ]}>
                          {option === 'relevance' && 'Relevance'}
                          {option === 'price-low' && 'Price: Low to High'}
                          {option === 'price-high' && 'Price: High to Low'}
                          {option === 'rating' && 'Rating'}
                          {option === 'name' && 'Name'}
                        </Text>
                        {sortBy === option && (
                          <Ionicons name="checkmark" size={20} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Rating Filter Section */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
                  <View style={styles.filterOptions}>
                    {(['all', '3.5+', '4.0+', '4.5+'] as RatingFilter[]).map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.filterOption,
                          ratingFilter === option && styles.filterOptionActive
                        ]}
                        onPress={() => setRatingFilter(option)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          ratingFilter === option && styles.filterOptionTextActive
                        ]}>
                          {option === 'all' && 'All Ratings'}
                          {option === '3.5+' && '3.5+ Stars'}
                          {option === '4.0+' && '4.0+ Stars'}
                          {option === '4.5+' && '4.5+ Stars'}
                        </Text>
                        {ratingFilter === option && (
                          <Ionicons name="checkmark" size={20} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Price Filter Section */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Price Range</Text>
                  <View style={styles.filterOptions}>
                    {(['all', 'under-100', '100-200', '200+'] as PriceFilter[]).map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.filterOption,
                          priceFilter === option && styles.filterOptionActive
                        ]}
                        onPress={() => setPriceFilter(option)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          priceFilter === option && styles.filterOptionTextActive
                        ]}>
                          {option === 'all' && 'All Prices'}
                          {option === 'under-100' && 'Under ₹100'}
                          {option === '100-200' && '₹100 - ₹200'}
                          {option === '200+' && 'Above ₹200'}
                        </Text>
                        {priceFilter === option && (
                          <Ionicons name="checkmark" size={20} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.filtersModalFooter}>
                <TouchableOpacity
                  style={styles.resetFiltersButton}
                  onPress={() => {
                    resetFilters();
                    setShowFiltersModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetFiltersButtonText}>Reset All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyFiltersButton}
                  onPress={() => setShowFiltersModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* ===== ITEM MODAL ===== */}
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
            <Animated.View
              style={[
                styles.modalOverlay,
                { opacity: fadeAnim }
              ]}
            >
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <Image
                  source={{
                    uri:
                      selectedItem?.image &&
                        selectedItem.image.startsWith("http")
                        ? selectedItem.image
                        : "https://via.placeholder.com/150",
                  }}
                  style={styles.modalImage}
                />

                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalItemName}>{selectedItem.name}</Text>
                    <Text style={styles.modalItemDescription}>{selectedItem.description}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => {
                      setShowItemModal(false);
                      setSelectedItem(null);
                    }}
                  >
                    <Ionicons name="close" size={24} color={Colors.textDark} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalInfo}>
                  <View style={styles.modalRating}>
                    {renderStars(selectedItem.rating)}
                    <Text style={styles.modalRatingText}>
                      {(selectedItem.rating || 4).toFixed(1)}
                    </Text>
                  </View>

                  <Text style={styles.modalCategory}>
                    Category: <Text style={styles.modalCategoryText}>{selectedItem.category}</Text>
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Ionicons name="remove" size={20} color={Colors.textDark} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setQuantity(quantity + 1)}
                    >
                      <Ionicons name="add" size={20} color={Colors.textDark} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => addToCart(selectedItem)}
                  >
                    <Ionicons name="cart" size={20} color="#FFFFFF" />
                    <Text style={styles.addToCartButtonText}>
                      Add to Cart • {selectedItem.price}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </Animated.View>
          </Modal>
        )}
        
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

/* ================= UPDATED STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalItemsText: {
    fontSize: 14,
    color: Colors.textBody,
    fontWeight: '500',
  },
  clearFiltersHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  clearFiltersHeaderText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
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
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textDark,
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
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
    borderWidth: 1,
    borderColor: '#F0F0F0',
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
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  suggestionsHeaderText: {
    fontSize: 14,
    color: Colors.textBody,
    fontWeight: '500',
  },
  searchTermHighlight: {
    color: Colors.primary,
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
    borderBottomColor: '#F0F0F0',
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
    color: Colors.textDark,
    marginBottom: 2,
  },
  suggestionItemCategory: {
    fontSize: 12,
    color: Colors.textBody,
    marginBottom: 4,
  },
  suggestionItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionItemRatingText: {
    fontSize: 11,
    color: Colors.textDark,
    marginLeft: 4,
    fontWeight: '600',
  },
  suggestionItemPriceContainer: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  suggestionItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Filters Bar
  filtersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 100,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textBody,
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: Colors.primary,
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
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  quickFilterActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  quickFilterText: {
    fontSize: 13,
    color: Colors.textBody,
    fontWeight: '500',
  },
  quickFilterTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: '#FFF',
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

  // Item Containers
  fullItemContainer: {
    marginBottom: 12,
  },
  compactItemContainer: {
    flex: 1,
    margin: 6,
  },

  // FULL CARD STYLES (No filters active)
  fullCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F5F5F5',
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
    color: Colors.textDark,
    flex: 1,
    marginRight: 8,
  },
  fullCategoryTag: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fullCategoryText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  fullDescription: {
    fontSize: 13,
    color: Colors.textBody,
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
    color: Colors.textDark,
  },
  fullFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  fullAddButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  fullAddButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },

  // COMPACT CARD STYLES (When filters are active)
  compactCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F5F5F5',
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
    color: Colors.textDark,
    flex: 1,
    marginRight: 6,
  },
  compactCategoryTag: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  compactCategoryText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  compactDescription: {
    fontSize: 11,
    color: Colors.textBody,
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
    color: Colors.primary,
  },
  compactAddButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  compactAddButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },

  // Veg Indicator (Common for both)
  vegIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
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
    color: Colors.textBody,
    marginTop: 16,
    marginBottom: 24,
  },
  resetAllButton: {
    backgroundColor: Colors.primary,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filtersModalContent: {
    backgroundColor: '#FFF',
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
    borderBottomColor: '#F0F0F0',
  },
  filtersModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
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
    color: Colors.textDark,
    marginBottom: 12,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  filterOptionActive: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.textBody,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  filtersModalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  resetFiltersButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  resetFiltersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textBody,
  },
  applyFiltersButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyFiltersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // Item Modal Styles
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalItemName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  modalItemDescription: {
    fontSize: 15,
    color: Colors.textBody,
    lineHeight: 20,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalInfo: {
    marginBottom: 20,
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalRatingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginLeft: 8,
  },
  modalCategory: {
    fontSize: 14,
    color: Colors.textBody,
  },
  modalCategoryText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 8,
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    paddingHorizontal: 16,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    marginLeft: 12,
    gap: 8,
  },
  addToCartButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});