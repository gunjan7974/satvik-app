import React, { useRef, useState, useEffect } from "react";
import { BASE_URL } from "../../config/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
} from "react-native";
import type { ListRenderItem } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Tabs } from "expo-router";
import { useTheme } from "../data/ThemeContext";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const SPACING = 20;

// ---------------- TYPES ----------------
type EventType = {
  _id: string;
  name: string;
  basePrice: number;
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

type Testimonial = {
  id: string;
  name: string;
  event: string;
  review: string;
  rating: number;
  date: string;
};

type BookingForm = {
  eventType: string;
  date: string;
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

export default function EventsBookingScreen() {
  const router = useRouter();
  const servicesAnim = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;
  const { colors, mode } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    eventType: "",
    date: "",
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const testimonialRef = useRef<FlatList>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);


  useEffect(() => {
    if (eventTypes.length === 0) return;

    const autoScroll = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex =
          prevIndex + 1 >= eventTypes.length ? 0 : prevIndex + 1;

        flatListRef.current?.scrollToOffset({
          offset: nextIndex * CARD_WIDTH,
          animated: true,
        });

        return nextIndex;
      });
    }, 2500); // speed

    return () => clearInterval(autoScroll);
  }, [eventTypes]);

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startAutoScroll = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next =
          prev + 1 >= eventTypes.length ? 0 : prev + 1;

        flatListRef.current?.scrollToOffset({
          offset: next * CARD_WIDTH,
          animated: true,
        });

        return next;
      });
    }, 2500);
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  // ---------------- DATA ----------------
  const [eventTypes, setEventTypes] = useState<any[]>([]);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/events/types`);
      const data = await response.json();
      setEventTypes(data);
    } catch (error) {
      console.log("Error fetching event types:", error);
    }
  };

  const [partyHalls, setPartyHalls] = useState<any[]>([]);

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/events/halls`);
      const data = await response.json();
      setPartyHalls(data);
    } catch (error) {
      console.log("Error fetching halls:", error);
    }
  };

  const [allServices, setAllServices] = useState<any[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const animations = servicesAnim.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 150,
        useNativeDriver: true,
      })
    );

    Animated.stagger(150, animations).start();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/events/services`);
      const data = await response.json();

      const formatted = data.map((item: any) => ({
        ...item,
        selected: false,
      }));

      setAllServices(formatted);
    } catch (error) {
      console.log("Error fetching services:", error);
    }
  };

  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Amit Sharma",
      event: "Birthday Party",
      review: "Excellent service! The decorations were amazing and food was delicious.",
      rating: 5,
      date: "15 Dec 2024",
    },
    {
      id: "2",
      name: "Priya Verma",
      event: "Corporate Event",
      review: "Professional team, great food quality, perfect for our annual meet.",
      rating: 5,
      date: "10 Dec 2024",
    },
    {
      id: "3",
      name: "Rahul Jain",
      event: "Anniversary",
      review: "Made our 25th anniversary truly special. Highly recommended!",
      rating: 5,
      date: "5 Dec 2024",
    },
  ];

  useEffect(() => {
    if (testimonials.length === 0) return;

    const interval = setInterval(() => {
      setTestimonialIndex((prev) => {
        const next =
          prev + 1 >= testimonials.length ? 0 : prev + 1;

        testimonialRef.current?.scrollToIndex({
          index: next,
          animated: true,
        });

        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // ---------------- HANDLERS ----------------
  const handleEventSelect = (event: EventType) => {
    setSelectedEventType(event);
    setBookingForm((prev) => ({ ...prev, eventType: event._id }));
    setShowBookingForm(true);
  };

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
      date: "",
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
        Alert.alert("Error", "Please login first");
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
      console.log("Booking Response:", data);

      if (!response.ok) {
        Alert.alert("Error", data.message || "Booking failed");
        return;
      }

      Alert.alert("Success", "Booking Created Successfully!");
      setShowBookingForm(false);
      resetForm();

    } catch (error) {
      console.log("Booking Error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const goNext = () => {
    if (activeStep === 1) {
      if (!bookingForm.eventType) {
        Alert.alert("Error", "Please select an event type");
        return;
      }
    }
    if (activeStep === 2) {
      if (!bookingForm.selectedHall) {
        Alert.alert("Error", "Please select a party hall");
        return;
      }
    }
    if (activeStep === 4) {
      if (!bookingForm.name || !bookingForm.email || !bookingForm.phone) {
        Alert.alert("Error", "Please fill all required contact information");
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
        {/* ✅ Event Name */}
        <Text style={[styles.eventTypeTitle, { color: colors.text }]}>
          {item.name}
        </Text>

        {/* ✅ Base Price */}
        <Text style={[styles.eventTypeDescription, { color: colors.subText }]}>
          Starting from ₹{item.basePrice}
        </Text>

        {/* ✅ Select Button */}
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: colors.primary }]}
          onPress={() => handleEventSelect(item)}
        >
          <Text style={styles.selectButtonText}>
            Select This Event
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
            <Text style={[styles.hallCapacity, { color: colors.subText }]}>Capacity: {item.capacity} people</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceText, { color: colors.primary }]}>₹{item.price.toLocaleString()}</Text>
            <Text style={[styles.priceLabel, { color: colors.subText }]}>per day</Text>
          </View>
        </View>

        <Text style={[styles.hallDescription, { color: colors.subText }]}>{item.description}</Text>

        <View style={styles.hallFeatures}>
          {item.features?.map((feature, idx) => (
            <View key={`${item.id}-f-${idx}`} style={[
              styles.hallFeatureTag,
              { backgroundColor: mode === 'dark' ? '#2D2D2D' : '#F8F8F8' }
            ]}>
              <Ionicons name="checkmark" size={12} color={colors.success} />
              <Text style={[styles.hallFeatureText, { color: colors.text }]}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.hallFooter}>
          <Ionicons
            name={isSelected ? "radio-button-on" : "radio-button-off"}
            size={20}
            color={isSelected ? colors.primary : colors.subText}
          />
          <Text style={[
            styles.selectHallText,
            { color: isSelected ? colors.primary : colors.subText }
          ]}>
            {isSelected ? "Selected" : "Select Hall"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTestimonialCard: ListRenderItem<Testimonial> = ({ item }) => (
    <View style={[
      styles.testimonialCard,
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
      }
    ]}>
      <View style={styles.testimonialHeader}>
        <View>
          <Text style={[styles.testimonialName, { color: colors.text }]}>{item.name}</Text>
          <Text style={styles.testimonialEvent}>{item.event}</Text>
        </View>

        <View style={styles.ratingContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={`${item.id}-star-${i}`}
              name="star"
              size={14}
              color={i < item.rating ? "#FFD700" : colors.border}
            />
          ))}
        </View>
      </View>

      <Text style={[styles.testimonialText, { color: colors.subText }]}>"{item.review}"</Text>
      <Text style={[styles.testimonialDate, { color: colors.subText }]}>{item.date}</Text>
    </View>
  );
  const renderServiceCard = ({ item, index }) => {
    return (
      <ServiceCard
        item={item}
        colors={colors}
        entryAnim={servicesAnim[index]}
      />
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
          {
            useNativeDriver: false,
            listener: handleScroll,
          }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: (width - CARD_WIDTH) / 2-10,
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
                stopAutoScroll();
                setTimeout(() => {
                  startAutoScroll();
                }, 5000);
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

      <View style={styles.autoScrollIndicator}>


      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: 0,   // 👈 YE ADD KARO
        },
      ]}
    >




      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[
          styles.heroSection,
          { backgroundColor: colors.card }
        ]}>
          <Text style={[styles.heroTitle, { color: colors.primary }]}>Book Your Event</Text>
          <Text style={[styles.heroSubtitle, { color: colors.subText }]}>
            Ready to plan your special celebration? Let us make it memorable!
          </Text>
        </View>

        {/* Event Types Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Event Type</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.subText }]}>Select from our curated event categories</Text>
          </View>

          {renderEventTypesCarousel()}
        </View>

        {/* Services Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>What We Offer</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.subText }]}>Complete event planning services</Text>
          </View>

          <FlatList
            data={[
              { id: "1", title: "Customized Menu Planning", description: "Tailored food and beverage options", icon: "🍽️" },
              { id: "2", title: "Professional Decorations", description: "Theme-based decoration and setup", icon: "🎨" },
              { id: "3", title: "Dedicated Event Manager", description: "Personal coordinator for seamless execution", icon: "👨‍💼" },
              { id: "4", title: "Photography Services", description: "Professional photography and videography", icon: "📸" },
              { id: "5", title: "Special Group Pricing", description: "Exclusive discounts for group bookings", icon: "💰" },
              { id: "6", title: "Entertainment Setup", description: "Music, DJ, and entertainment arrangements", icon: "🎵" },
            ]}
            renderItem={renderServiceCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.servicesGrid}
            contentContainerStyle={styles.servicesContainer}
          />
        </View>


        {/* CTA */}
        <View style={[
          styles.ctaSection,
          { backgroundColor: colors.card }
        ]}>
          <Text style={[styles.ctaTitle, { color: colors.primary }]}>Ready to Book Your Event?</Text>
          <Text style={[styles.ctaText, { color: colors.subText }]}>
            Have questions or ready to get started? Contact our event specialists today!
          </Text>

          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowBookingForm(true)}
          >
            <Ionicons name="calendar" size={22} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>Book Event Now</Text>
          </TouchableOpacity>
        </View>

        {/* Footer spacing for bottom tab */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingForm}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBookingForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            { backgroundColor: colors.modalBackground }
          ]}>
            <View style={[
              styles.modalHeader,
              { borderBottomColor: colors.border }
            ]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedEventType ? `Book ${selectedEventType.name}` : "Event Booking Form"}
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
                          isActive ?
                            { backgroundColor: colors.primary } :
                            {
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
                        {step === 1 ? "Event" :
                          step === 2 ? "Hall" :
                            step === 3 ? "Contact" :
                              "Review"}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Step 1: Event Details */}
              {activeStep === 1 && (
                <View style={styles.formSection}>
                  <Text style={[styles.formSectionTitle, { color: colors.text }]}>Event Details</Text>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Event Type *</Text>
                    <View style={styles.eventTypeSelector}>
                      {eventTypes.map((event) => (
                        <TouchableOpacity
                          key={`etype-${event._id}`}
                          style={[
                            styles.eventTypeOption,
                            {
                              borderColor: event.color,
                              backgroundColor: mode === 'dark' ? '#2D2D2D' : '#F8F8F8'
                            },
                            bookingForm.eventType === event.id && [
                              styles.selectedEventType,
                              { backgroundColor: mode === 'dark' ? '#3D2D2D' : '#FFF8E1' }
                            ],
                          ]}
                          onPress={() => {
                            setBookingForm((prev) => ({ ...prev, eventType: event._id }));
                            setSelectedEventType(event);
                          }}
                        >
                          <Text style={styles.eventTypeOptionIcon}>{event.icon}</Text>
                          <Text style={[
                            styles.eventTypeOptionText,
                            { color: colors.text }
                          ]}>{event.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.label, { color: colors.text }]}>Date *</Text>
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
                        <Text style={{ color: bookingForm.date ? colors.text : colors.subText }}>
                          {bookingForm.date ? bookingForm.date : "Select date"}
                        </Text>
                      </TouchableOpacity>

                      {showDatePicker && (
                        <DateTimePicker
                          value={bookingForm.date ? new Date(bookingForm.date) : new Date()}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(false);

                            if (selectedDate) {
                              const isoDate = selectedDate.toISOString().split("T")[0];

                              setBookingForm((prev) => ({
                                ...prev,
                                date: isoDate,
                              }));
                            }
                          }}
                        />
                      )}
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.label, { color: colors.text }]}>Guests *</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.inputBackground,
                            color: colors.text,
                            borderColor: colors.border
                          }
                        ]}
                        placeholder="e.g., 50"
                        placeholderTextColor={colors.subText}
                        keyboardType="numeric"
                        value={bookingForm.guests}
                        onChangeText={(text) =>
                          setBookingForm((prev) => ({ ...prev, guests: text }))
                        }
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Step 2: Hall Selection */}
              {activeStep === 2 && (
                <View style={styles.formSection}>
                  <Text style={[styles.formSectionTitle, { color: colors.text }]}>Select Party Hall</Text>
                  <Text style={[styles.sectionDescription, { color: colors.subText }]}>
                    Choose the perfect venue for your event
                  </Text>

                  <FlatList
                    data={partyHalls}
                    renderItem={renderHallCard}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.hallsContainer}
                  />

                  <Text style={[styles.formSectionTitle, { marginTop: 30, color: colors.text }]}>Additional Services</Text>
                  <Text style={[styles.sectionDescription, { color: colors.subText }]}>
                    Customize your event with our premium services
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
                          <Text style={styles.serviceOptionIcon}>{service.icon}</Text>
                          <Ionicons
                            name={service.selected ? "checkbox" : "square-outline"}
                            size={20}
                            color={service.selected ? colors.primary : colors.subText}
                          />
                        </View>

                        <Text style={[styles.serviceOptionTitle, { color: colors.text }]}>{service.title}</Text>
                        <Text style={[styles.serviceOptionDescription, { color: colors.subText }]}>{service.description}</Text>

                        <View style={[
                          styles.servicePriceContainer,
                          { backgroundColor: mode === 'dark' ? '#3D2D2D' : `${colors.primary}20` }
                        ]}>
                          <Text style={[styles.servicePriceText, { color: colors.primary }]}>
                            + ₹{service.price.toLocaleString()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={[
                    styles.totalCostContainer,
                    { backgroundColor: mode === 'dark' ? '#2D2D2D' : '#FFF8E1' }
                  ]}>
                    <Text style={[styles.totalCostLabel, { color: colors.text }]}>Total Estimated Cost:</Text>
                    <Text style={[styles.totalCostAmount, { color: colors.primary }]}>
                      ₹{bookingForm.totalCost.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Step 3: Contact Information */}
              {activeStep === 3 && (
                <View style={styles.formSection}>
                  <Text style={[styles.formSectionTitle, { color: colors.text }]}>Contact Information</Text>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.inputBackground,
                          color: colors.text,
                          borderColor: colors.border
                        }
                      ]}
                      placeholder="Enter your name"
                      placeholderTextColor={colors.subText}
                      value={bookingForm.name}
                      onChangeText={(text) => setBookingForm((prev) => ({ ...prev, name: text }))}
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.inputBackground,
                            color: colors.text,
                            borderColor: colors.border
                          }
                        ]}
                        placeholder="email@example.com"
                        placeholderTextColor={colors.subText}
                        keyboardType="email-address"
                        value={bookingForm.email}
                        onChangeText={(text) =>
                          setBookingForm((prev) => ({ ...prev, email: text }))
                        }
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.label, { color: colors.text }]}>Phone *</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.inputBackground,
                            color: colors.text,
                            borderColor: colors.border
                          }
                        ]}
                        placeholder="9876543210"
                        placeholderTextColor={colors.subText}
                        keyboardType="phone-pad"
                        value={bookingForm.phone}
                        onChangeText={(text) =>
                          setBookingForm((prev) => ({ ...prev, phone: text }))
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Special Requirements</Text>
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
                      placeholder="Any special requests or requirements..."
                      placeholderTextColor={colors.subText}
                      multiline
                      numberOfLines={4}
                      value={bookingForm.specialRequirements}
                      onChangeText={(text) =>
                        setBookingForm((prev) => ({ ...prev, specialRequirements: text }))
                      }
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Budget (Optional)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.inputBackground,
                          color: colors.text,
                          borderColor: colors.border
                        }
                      ]}
                      placeholder="e.g., ₹50,000"
                      placeholderTextColor={colors.subText}
                      value={bookingForm.budget}
                      onChangeText={(text) =>
                        setBookingForm((prev) => ({ ...prev, budget: text }))
                      }
                    />
                  </View>
                </View>
              )}

              {/* Step 4: Review */}
              {activeStep === 4 && (
                <View style={styles.formSection}>
                  <Text style={[styles.formSectionTitle, { color: colors.text }]}>Review Your Booking</Text>

                  <View style={[
                    styles.summaryCard,
                    { backgroundColor: mode === 'dark' ? '#2D2D2D' : '#F8F8F8' }
                  ]}>
                    <Text style={[styles.summaryTitle, { color: colors.text }]}>Event Summary</Text>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>Event Type:</Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>{bookingForm.eventType || "-"}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>Date:</Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>{bookingForm.date || "To be decided"}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>Guests:</Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {bookingForm.guests || "Not specified"}
                      </Text>
                    </View>

                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>Selected Hall:</Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {partyHalls.find(h => h._id === bookingForm.selectedHall)?.name || "Not selected"}
                      </Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>Services:</Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {bookingForm.selectedServices.length > 0
                          ? bookingForm.selectedServices.map(s => s.title).join(", ")
                          : "None"}
                      </Text>
                    </View>

                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

                    <View style={[styles.summaryRow, styles.totalCostRow]}>
                      <Text style={[styles.totalLabel, { color: colors.text }]}>Total Cost:</Text>
                      <Text style={[styles.totalAmount, { color: colors.primary }]}>
                        ₹{bookingForm.totalCost.toLocaleString()}
                      </Text>
                    </View>

                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>Contact:</Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>{bookingForm.name || "-"}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>Email:</Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>{bookingForm.email || "-"}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.subText }]}>Phone:</Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>{bookingForm.phone || "-"}</Text>
                    </View>
                  </View>

                  <View style={[
                    styles.noteContainer,
                    { backgroundColor: mode === 'dark' ? '#2D2D2D' : '#FFF8E1' }
                  ]}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={[styles.noteText, { color: colors.subText }]}>
                      Our team will contact you within 24 hours to confirm details.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={[
              styles.modalActions,
              { borderTopColor: colors.border }
            ]}>
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
                  <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  { backgroundColor: colors.primary }
                ]}
                onPress={goNext}
              >
                <Text style={styles.nextButtonText}>
                  {activeStep === 4 ? "Submit" : "Next"}
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

const ServiceCard = ({ item, colors, entryAnim }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.88,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "2deg"],
  });

  const translateY = entryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <Animated.View
      style={[
        styles.serviceCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: entryAnim,
          transform: [{ translateY }, { scale: scaleAnim }, { rotate }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  menuButton: {
    marginLeft: 0,
  },
  menuButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  cartButton: {
    marginRight: 0,
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
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,

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
  carouselContent: {
    paddingRight: 20,
  },
  eventTypeCard: {
    width: CARD_WIDTH, // 85% screen width
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    alignItems: "center",
  }
  ,
  eventIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  eventIcon: {
    fontSize: 40,
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
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 25,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 5,
  },
  featureText: {
    fontSize: 11,
    fontWeight: "600",
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
  autoScrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  autoScrollText: {
    fontSize: 12,
    fontStyle: 'italic',
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
  testimonialsContainer: {
    paddingRight: 20,
  },
  testimonialCard: {
    width: CARD_WIDTH,
    borderRadius: 15,
    padding: 20,
    marginRight: 0,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
  },
  testimonialHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: "700",
  },
  testimonialEvent: {
    fontSize: 12,
    color: "#FF8A00",
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  testimonialText: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: 10,
  },
  testimonialDate: {
    fontSize: 12,
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
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "90%",
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
});