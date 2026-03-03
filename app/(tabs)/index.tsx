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
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import Colors from "../../constants/colors";
import * as Haptics from 'expo-haptics';

const BASE_URL = "http://192.168.29.43:5000"

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

interface SuggestionItem {
  id: string;
  name: string;
  subname?: string;
  image: any;
  color: string;
  items: string;
}

/* ================= SLIDER IMAGES ================= */
const SLIDER_IMAGES = [
  require("../../assets/images/ev.png"),
  require("../../assets/images/fe.png"),
  require("../../assets/images/bs.png"),
  require("../../assets/images/of.png"),
];


/* ================= FOOD DATA ================= */
// const FOOD_DATA: FoodItem[] = [
//   {
//     id: "1",
//     name: "South Indian",
//     image: require("../../assets/images/si.png"),
//     color: "#FF6B35",
//     items: "12 dishes",
//   },
//   {
//     id: "2",
//     name: "Breakfast",
//     subname: "Nasta Corner",
//     image: require("../../assets/images/bn.png"),
//     color: "#4ECDC4",
//     items: "8 dishes",
//   },
//   {
//     id: "3",
//     name: "Morning Beverages",
//     subname: "",
//     image: require("../../assets/images/mb.png"),
//     color: "#45B7D1",
//     items: "6 drinks",
//   },
//   {
//     id: "4",
//     name: "Soup",
//     subname: "",
//     image: require("../../assets/images/soup.png"),
//     color: "#96CEB4",
//     items: "5 varieties",
//   },
//   {
//     id: "5",
//     name: "Chinese",
//     subname: "Starter",
//     image: require("../../assets/images/cs.png"),
//     color: "#FFEAA7",
//     items: "10 dishes",
//   },
//   {
//     id: "6",
//     name: "Tandoor",
//     subname: "Starter",
//     image: require("../../assets/images/ts.png"),
//     color: "#DDA0DD",
//     items: "8 dishes",
//   },
//   {
//     id: "7",
//     name: "Mashroom",
//     subname: "Special",
//     image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84",
//     color: "#98D8AA",
//     items: "6 dishes",
//   },
//   {
//     id: "8",
//     name: "Main",
//     subname: "Course",
//     image: "https://images.unsplash.com/photo-1619096252214-ef06c45683e3",
//     color: "#F7DC6F",
//     items: "15 dishes",
//   },
//   {
//     id: "9",
//     name: "Rice",
//     subname: "",
//     image: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
//     color: "#E59866",
//     items: "7 varieties",
//   },
//   {
//     id: "10",
//     name: "Roti",
//     subname: "Breads",
//     image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b",
//     color: "#85C1E9",
//     items: "10 types",
//   },
// ];

/* ================= EVENTS DATA ================= */
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

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {

const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activePUA, setActivePUA] = useState(false);
  const [showPUAModal, setShowPUAModal] = useState(false);
  const [securityLevel, setSecurityLevel] = useState("standard");
  
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

  // NEW: Enhanced Animations Only
  const fadeInUp = useRef(new Animated.Value(50)).current;
  const staggerValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleHeader = useRef(new Animated.Value(0.95)).current;
  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const puaGlowAnim = useRef(new Animated.Value(0)).current;
  const parallaxScroll = useRef(new Animated.Value(0)).current;

  /* ===== ENHANCED ANIMATIONS ONLY ===== */


useEffect(() => {
  fetchFoods();
}, []);

const fetchFoods = async () => {
  try {
    setLoading(true);

    const response = await axios.get(`${BASE_URL}/api/foods`);

    const formattedData = response.data.map((item: any) => ({
      id: item._id,
      name: item.name,
      subname: item.category || "",
      image: item.image,
      color: "#FF6B35",
      items: `₹${item.price}`,
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
      // Header animation
      Animated.spring(scaleHeader, {
        toValue: 1,
        tension: 20,
        friction: 8,
        useNativeDriver: true,
      }),
      
      // Search bar animation
      Animated.timing(fadeInUp, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      
      // Original animations (unchanged)
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

    /* ===== AUTO SLIDE FOR PROMO ===== */
  let promoIndex = 0;

const promoInterval = setInterval(() => {
  promoIndex = promoIndex === SLIDER_IMAGES.length - 1 ? 0 : promoIndex + 1;

  promoSliderRef.current?.scrollToIndex({
    index: promoIndex,
    animated: true,
  });

  setCurrentPromoIndex(promoIndex);
}, 3500);

    /* ===== AUTO SLIDE FOR EVENTS ===== */
    const eventsInterval = setInterval(() => {
      const next = currentEventIndex === EVENTS_DATA.length - 1 ? 0 : currentEventIndex + 1;
      eventsSliderRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });
      setCurrentEventIndex(next);
    }, 3500);

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
      clearInterval(promoInterval);
      clearInterval(eventsInterval);
    };
  }, []);

  /* ===== PUA ACTIVATION FUNCTION ===== */
  const activatePUAMode = () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  // Get search suggestions (UNCHANGED)
  const getSearchSuggestions = () => {
    if (search.trim() === "") return [];
    
    const searchTerm = search.toLowerCase();
    return foods.filter(item =>
  item.name.toLowerCase().includes(searchTerm)
).slice(0,5);
  };

  const suggestions = getSearchSuggestions();

  // Filter data based on search (UNCHANGED)
  const filteredData = foods.filter((item) =>
  item.name.toLowerCase().includes(search.toLowerCase())
);
  // Show only first 6 items initially, or all when showAllCategories is true (UNCHANGED)
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

    // NEW: Staggered animation for cards
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
            opacity: cardOpacity,
            transform: [{ scale: cardScale }, { translateY: Animated.add(translateY, cardStagger) }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            // Add press animation
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
            
            router.push({
              pathname: "/menu",
              params: { 
                name: item.subname ? `${item.name} ${item.subname}` : item.name, 
                image: item.image,
                color: item.color 
              },
            });
          }}
          style={styles.cardTouchable}
        >
          <ImageBackground
            source={typeof item.image === 'string' ? { uri: item.image } : item.image}
            style={styles.cardImage}
            imageStyle={styles.cardImageStyle}
          >
            {/* Gradient Overlay with animation */}
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
            
            {/* NEW: Floating particle effect for PUA mode */}
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
            
            {/* Category Content */}
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
                <Text style={styles.itemCountText}>{item.items}</Text>
              </Animated.View>
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

    // NEW: Parallax effect
    const translateX = scrollXP.interpolate({
      inputRange,
      outputRange: [-width * 0.2, 0, width * 0.2],
      extrapolate: 'clamp',
    });

    // NEW: Scale effect
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
          <Text style={styles.slideSubtitle}>Order any 2 items & get discount</Text>
        </Animated.View>
      </Animated.View>
    );
  };

  /* ===== ENHANCED EVENT CARD ===== */
  const renderEventCard = ({ item, index }: { item: EventItem; index: number }) => {
    const getEventIcon = (type: string) => {
      switch(type) {
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
            {/* Status Badge with pulse animation */}
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
            
            {/* Gradient Overlay */}
            <View style={styles.eventOverlay} />
            
            {/* Event Content */}
            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Animated.View 
                  style={[
                    styles.eventType,
                    {
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
                <View style={styles.eventPrice}>
                  <Text style={styles.eventPriceText}>{item.price}</Text>
                </View>
              </View>
              
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
              
              <View style={styles.eventFooter}>
                <View style={styles.eventInfo}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.eventInfoText}>{item.date}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.eventInfoText}>{item.venue}</Text>
                </View>
              </View>
              
              {item.discount && (
                <Animated.View 
                  style={[
                    styles.discountTag,
                    {
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
                  <Text style={styles.discountText}>{item.discount}</Text>
                </Animated.View>
              )}
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  // Function to toggle show all categories (UNCHANGED)
  const toggleShowAllCategories = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowAllCategories(!showAllCategories);
  };

  // Handle search suggestion selection (UNCHANGED)
  const handleSuggestionSelect = (item: FoodItem) => {
    const categoryName = item.subname ? `${item.name} ${item.subname}` : item.name;
    setSearch(categoryName);
    setShowSuggestions(false);
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    router.push({
      pathname: "/menu",
      params: { 
        name: categoryName, 
        image: item.image,
        color: item.color 
      },
    });
  };

  return (
    <Animated.ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
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
            <Text style={styles.puaModalTitle}>PUA Mode Activated</Text>
            <Text style={styles.puaModalText}>Professional animations enabled</Text>
            <Text style={styles.puaSecurityLevel}>Security: {securityLevel.toUpperCase()}</Text>
          </Animated.View>
        </View>
      </Modal>

      {/* ===== ENHANCED HEADER ===== */}
      <Animated.View 
        style={[
          styles.header, 
          { 
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
           Discover flavors you’ll love
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.subText,
              {
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
            Discover delicious food
          </Animated.Text>
        </View>
        
        {/* NEW: PUA Activation Button */}
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
              color={activePUA ? "#4CD964" : Colors.primary} 
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

      {/* ===== ENHANCED SEARCH BAR (Menu Screen Style) ===== */}
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
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            placeholder="Search food items..."
            placeholderTextColor="#999"
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
            style={styles.searchInput}
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
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Enhanced Search Suggestions (Menu Screen Style) */}
        {showSuggestions && suggestions.length > 0 && (
          <Animated.View 
            style={[
              styles.suggestionsContainer,
              {
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
            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsHeaderText}>
                Suggestions for "<Text style={styles.searchTermHighlight}>{search}</Text>"
              </Text>
            </View>
            <ScrollView
              style={styles.suggestionsScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.suggestionItem,
                    index === suggestions.length - 1 && styles.suggestionItemLast
                  ]}
                  onPress={() => handleSuggestionSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.suggestionItemImageContainer}>
                    <Image 
                      source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
                      style={styles.suggestionImage} 
                    />
                  </View>
                  <View style={styles.suggestionItemDetails}>
                    <Text style={styles.suggestionItemName}>{item.name}</Text>
                    {item.subname && (
                      <Text style={styles.suggestionItemCategory}>{item.subname}</Text>
                    )}
                    <View style={styles.suggestionItemRating}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.suggestionItemRatingText}>4.5</Text>
                    </View>
                  </View>
                  <View style={styles.suggestionItemPriceContainer}>
                    <Text style={styles.suggestionItemPrice}>{item.items}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </Animated.View>

      {/* ===== PROMO SLIDER (WITH ENHANCED DOTS) ===== */}
      <View style={styles.sliderSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Today's Specials</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
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
                      outputRange: ['#CCCCCC', Colors.primary, '#CCCCCC'],
                      extrapolate: 'clamp',
                    }),
                  }
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* ===== FOOD CATEGORIES GRID (WITH ENHANCED BUTTONS) ===== */}
      <View style={styles.categoriesSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          <View style={styles.headerRight}>
            <Text style={styles.categoryCount}>
              {showAllCategories ? filteredData.length : '6'}/{filteredData.length} categories
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
                  {showAllCategories ? 'Show Less' : 'View All'}
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
            <Ionicons name="fast-food-outline" size={80} color={Colors.textBody} />
            <Text style={styles.emptyText}>No categories found</Text>
            <Text style={styles.emptySubText}>
              Try searching with different keywords
            </Text>
          </View>
        )}

        {/* Show More Button with animation */}
        {!showAllCategories && filteredData.length > 6 && search.length === 0 && (
          <TouchableOpacity 
            style={styles.showMoreButton}
            onPress={toggleShowAllCategories}
          >
            <Animated.Text 
              style={[
                styles.showMoreText,
                {
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
              + {filteredData.length - 6} More Categories
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
              <Ionicons name="chevron-down" size={20} color={Colors.primary} />
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* Show Less Button with animation */}
        {showAllCategories && filteredData.length > 6 && (
          <TouchableOpacity 
            style={styles.showLessButton}
            onPress={toggleShowAllCategories}
          >
            <Text style={styles.showLessText}>
              Show Less
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
              <Ionicons name="chevron-up" size={20} color={Colors.primary} />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      {/* ===== UPCOMING EVENTS SLIDER ===== */}
      <View style={styles.eventsSection}>
        <View style={styles.sectionTitleRow}>
          <View>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <Text style={styles.eventsSubtitle}>Don't miss out on these experiences</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {/* Horizontal Events Slider */}
        <View style={styles.eventsSliderWrapper}>
          <FlatList
          snapToInterval={width * 0.85}
snapToAlignment="center"
decelerationRate="fast"

            ref={eventsSliderRef}
            data={EVENTS_DATA}
            horizontal
            showsHorizontalScrollIndicator={false}
            
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
                        outputRange: ['#CCCCCC', Colors.primary, '#CCCCCC'],
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
      
      {/* NEW: PUA Footer Indicator */}
      {activePUA && (
        <Animated.View 
          style={[
            styles.puaFooter,
            {
              opacity: puaGlowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              })
            }
          ]}
        >
          <Ionicons name="shield" size={16} color="#4CD964" />
          <Text style={styles.puaFooterText}>PRO MODE ACTIVE</Text>
        </Animated.View>
      )}
    </Animated.ScrollView>
  );
}

/* ================= ENHANCED STYLES (WITH NEW ANIMATION STYLES ONLY) ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgMain,
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
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heyText: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: Colors.textBody,
    opacity: 0.8,
  },
  // NEW: PUA Button Styles
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
  // NEW: PUA Modal Styles
  puaModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  puaModal: {
    backgroundColor: '#fff',
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
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  puaModalText: {
    fontSize: 14,
    color: Colors.textBody,
    marginBottom: 12,
  },
  puaSecurityLevel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CD964',
    letterSpacing: 1,
  },
  // ===== SEARCH BAR STYLES (Menu Screen Style) =====
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
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    zIndex: 10,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textDark,
    padding: 0,
    marginLeft: 0,
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
  // Slider Section
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
    color: Colors.textDark,
  },
  eventsSubtitle: {
    fontSize: 13,
    color: Colors.textBody,
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
    color: Colors.primary,
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
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  slideContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  offerTag: {
    backgroundColor: Colors.primary,
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
    color: "#fff",
    marginBottom: 4,
  },
  slideSubtitle: {
    fontSize: 14,
    color: "#fff",
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
    color: Colors.textBody,
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
    backgroundColor: "#fff",
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
  // NEW: Floating particle style
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
    color: Colors.textDark,
    lineHeight: 20,
  },
  itemCount: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  itemCountText: {
    fontSize: 11,
    color: Colors.textBody,
    fontWeight: '500',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FF',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  showMoreText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  showLessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FF',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  showLessText: {
    fontSize: 15,
    color: Colors.primary,
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
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textBody,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  eventBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FF4757',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  eventPriceText: {
    color: Colors.textDark,
    fontSize: 12,
    fontWeight: '700',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 24,
  },
  eventDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
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
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  discountTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  discountText: {
    color: '#fff',
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
  // NEW: PUA Footer
  puaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 217, 100, 0.2)',
  },
  puaFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CD964',
    marginLeft: 8,
    letterSpacing: 1,
  },
});