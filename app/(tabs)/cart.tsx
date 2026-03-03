import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";
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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
  description?: string;
};


// Orange-Cream Theme Colors
const COLORS = {
  primary: "#FF6B35",
  background: "#FFFCF5",
  surface: "#FFFFFF",
  text: "#3E2723",
  subText: "#8D6E63",
  border: "#F5E6D3",
  inputBackground: "#FFFBF7",
  chipBackground: "#FFF1DC",
  success: "#4CAF50",
  warning: "#FF9800",
  danger: "#F44336",
  star: "#FFC107",
  successBg: "#E8F5E9",
  warningBg: "#FFF3E0",
  dangerBg: "#FFEBEE",
};

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");

  const { width } = Dimensions.get("window");
  useEffect(() => {
  fetchCart();
}, []);

useFocusEffect(
  useCallback(() => {
    fetchCart();
  }, [])
);

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

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = subtotal > 300 ? 0 : 40;
  const discount = appliedCoupon ? subtotal * 0.1 : 0;
  const tax = subtotal * 0.05;
  const totalAmount = subtotal + deliveryFee + tax - discount;
const updateQuantity = async (foodId: string, change: number) => {
  try {
    const token = await AsyncStorage.getItem("token");

    await axios.post(
      `${BASE_URL}/api/cart`,
      {
        foodId,
        quantity: change,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchCart(); // refresh cart
  } catch (error) {
    console.log("UPDATE ERROR:", error);
  }
};

const placeOrder = async () => {
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

    setOrderId(data._id);
    setOrderStatus("success");
    setShowOrderModal(true);
    await fetchCart();

  } catch (error) {
    console.log("ORDER ERROR:", error);
    Alert.alert("Error", "Order failed");
  } finally {
    setIsProcessingOrder(false);
  }
};

const removeItem = async (foodId: string) => {
  try {
    const token = await AsyncStorage.getItem("token");

    await axios.post(
      `${BASE_URL}/api/cart`,
      {
        foodId,
        quantity: -1,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchCart();
  } catch (error) {
    console.log(error);
  }
};

  

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "SATTVIK10") {
      setAppliedCoupon("SATTVIK10");
      Alert.alert("Success!", "10% discount applied! 🎉");
      setCouponCode("");
    } else {
      Alert.alert("Invalid Coupon", "Please enter a valid coupon code");
    }
  };

  const generateOrderId = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let id = "SAT";
    
    // Add 3 random letters
    for (let i = 0; i < 3; i++) {
      id += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Add 4 random numbers
    for (let i = 0; i < 4; i++) {
      id += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return id;
  };

 

  const cancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: () => {
            setIsProcessingOrder(true);
            
            // Simulate cancellation process
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

  const renderCartItem = (item: CartItem, index: number) => (
    <View key={item.id + index} style={styles.itemCard}>
      <View style={styles.itemLeft}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={COLORS.star} />
            <Text style={styles.ratingText}>4.5</Text>
          </View>
        </View>
        
        {item.description && (
          <Text style={styles.itemDescription}>{item.description}</Text>
        )}
        
        <View style={styles.itemMeta}>
          <View style={styles.categoryChip}>
            <Ionicons name="leaf-outline" size={12} color={COLORS.primary} />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        <View style={styles.quantityBox}>
          <TouchableOpacity 
            style={styles.qtyButton}
            onPress={() => updateQuantity(item.id, -1)}
          >
            <Ionicons name="remove" size={16} color={COLORS.text} />
          </TouchableOpacity>
          
          <Text style={styles.qtyText}>{item.qty}</Text>
          
          <TouchableOpacity 
            style={styles.qtyButton}
            onPress={() => updateQuantity(item.id, 1)}
          >
            <Ionicons name="add" size={16} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.itemTotal}>₹{item.price * item.qty}</Text>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
     
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => Alert.alert("Favorites", "View your favorite items")}
        >
          <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Order Status Modal */}
      <Modal
        transparent
        visible={showOrderModal}
        animationType="fade"
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {orderStatus === 'success' ? (
              <>
                <View style={[styles.statusIconContainer, { backgroundColor: COLORS.successBg }]}>
                  <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
                </View>
                <Text style={styles.modalTitle}>Order Successful! 🎉</Text>
                <Text style={styles.modalOrderId}>Order ID: {orderId}</Text>
                <Text style={styles.modalText}>
                  Your order has been placed successfully and will be delivered soon.
                </Text>
                <Text style={styles.modalAmount}>Total: ₹{totalAmount.toFixed(2)}</Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.primaryButton]}
                    onPress={() => {
                      setShowOrderModal(false);
                      router.push('/order');
                    }}
                  >
                    <Text style={styles.primaryButtonText}>View Orders</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.secondaryButton]}
                    onPress={() => {
                      setShowOrderModal(false);
                      router.push('/');
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : orderStatus === 'cancelled' ? (
              <>
                <View style={[styles.statusIconContainer, { backgroundColor: COLORS.dangerBg }]}>
                  <Ionicons name="close-circle" size={80} color={COLORS.danger} />
                </View>
                <Text style={styles.modalTitle}>Order Cancelled</Text>
                <Text style={styles.modalOrderId}>Order ID: {orderId}</Text>
                <Text style={styles.modalText}>
                  Your order has been cancelled successfully.
                </Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.primaryButton]}
                    onPress={() => {
                      setShowOrderModal(false);
                      router.push('/order');
                    }}
                  >
                    <Text style={styles.primaryButtonText}>View Orders</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.secondaryButton]}
                    onPress={() => {
                      setShowOrderModal(false);
                      fetchCart();// Restore cart items
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Back to Cart</Text>
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
          <View style={styles.modalContent}>
            <View style={styles.loadingContainer}>
              <MaterialCommunityIcons 
                name="food" 
                size={60} 
                color={COLORS.primary} 
              />
              <Text style={styles.loadingText}>Processing your order...</Text>
              <Text style={styles.loadingSubtext}>Please wait</Text>
            </View>
          </View>
        </View>
      </Modal>

      {cartItems.length === 0 ? (
        <View style={styles.emptyState}>
          {orderStatus === 'success' ? (
            <>
              <Ionicons name="checkmark-circle" size={100} color={COLORS.success} />
              <Text style={styles.emptyStateTitle}>Order Placed Successfully!</Text>
              <Text style={styles.emptyStateText}>
                Your order #{orderId} has been confirmed and will be delivered soon.
              </Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons 
                name="cart-off" 
                size={100} 
                color={COLORS.subText} 
              />
              <Text style={styles.emptyStateTitle}>Your cart is empty</Text>
              <Text style={styles.emptyStateText}>
                Add delicious items to get started!
              </Text>
            </>
          )}
          
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.browseButtonText}>Browse Menu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.viewOrdersButton}
            onPress={() => router.push('/order')}
          >
            <Text style={styles.viewOrdersText}>View My Orders</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView 
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{
     paddingHorizontal: 20,
    paddingBottom: 200,   // 👈 IMPORTANT
  }}
>

          
            {/* Cart Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {cartItems.map((item, index) => renderCartItem(item, index))}
            </View>

            {/* Special Instructions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Special Instructions</Text>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="document-text-outline" 
                  size={20} 
                  color={COLORS.subText}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.instructionsInput}
                  placeholder="Any special requests or dietary restrictions..."
                  placeholderTextColor={COLORS.subText}
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Coupon Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Apply Coupon</Text>
              <View style={styles.couponContainer}>
                <View style={styles.couponInputContainer}>
                  <Ionicons 
                    name="ticket-outline" 
                    size={20} 
                    color={COLORS.subText}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Enter coupon code"
                    placeholderTextColor={COLORS.subText}
                    value={couponCode}
                    onChangeText={setCouponCode}
                  />
                </View>
                <TouchableOpacity 
                  style={[
                    styles.applyButton,
                    appliedCoupon && styles.appliedButton
                  ]}
                  onPress={applyCoupon}
                  disabled={appliedCoupon !== null}
                >
                  <Text style={styles.applyButtonText}>
                    {appliedCoupon ? "Applied" : "Apply"}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {appliedCoupon && (
                <View style={styles.couponApplied}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.couponAppliedText}>
                    Coupon "{appliedCoupon}" applied! 10% discount
                  </Text>
                </View>
              )}
            </View>

            {/* Bill Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bill Summary</Text>
              
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Subtotal</Text>
                <Text style={styles.billValue}>₹{subtotal}</Text>
              </View>
              
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={styles.billValue}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </Text>
              </View>
              
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Tax (5%)</Text>
                <Text style={styles.billValue}>₹{tax.toFixed(2)}</Text>
              </View>
              
              {appliedCoupon && (
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, styles.discountLabel]}>
                    Discount (10%)
                  </Text>
                  <Text style={[styles.billValue, styles.discountValue]}>
                    -₹{discount.toFixed(2)}
                  </Text>
                </View>
              )}
              
              <View style={styles.divider} />
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
              </View>
              
              {subtotal < 300 && (
                <View style={styles.freeDeliveryNote}>
                  <Ionicons name="information-circle" size={16} color={COLORS.warning} />
                  <Text style={styles.freeDeliveryText}>
                    Add ₹{300 - subtotal} more for FREE delivery!
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={cancelOrder}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.danger} />
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.placeOrderButton]}
                onPress={placeOrder}
                disabled={isProcessingOrder}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.placeOrderText}>Place Order • ₹{totalAmount.toFixed(2)}</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.continueText}>Continue Shopping</Text>
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
    backgroundColor: COLORS.background,
  },
  
  // HEADER
 header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",

  // ✅ SAME AS TAB HEADER
  height: 110,
  paddingTop: 60,
  paddingBottom: 20,
  paddingHorizontal: 20,

  borderBottomWidth: 1,
},

  backButton: {
    padding: 8,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.subText,
    marginTop: 4,
  },
  favoriteButton: {
    padding: 8,
    backgroundColor: COLORS.inputBackground,
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
    backgroundColor: COLORS.surface,
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
    color: COLORS.text,
    marginBottom: 10,
    textAlign: "center",
  },
  modalOrderId: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 15,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.subText,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: COLORS.text,
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
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.subText,
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
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.subText,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  browseButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewOrdersText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  
  // SCROLL CONTENT
  scrollContent: {
    paddingBottom: 180,
  },
  
  // SECTIONS
  section: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 15,
  },
  
  // CART ITEM CARD
  itemCard: {
    width: "100%", 
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: COLORS.subText,
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
    backgroundColor: COLORS.chipBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  itemRight: {
    alignItems: "center",
    marginLeft: 15,
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
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
    color: COLORS.text,
    marginHorizontal: 10,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
  },
  removeButton: {
    padding: 6,
    borderRadius: 6,
  },
  
  // INPUTS
  inputContainer: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.text,
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
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 12,
    marginLeft: 8,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  appliedButton: {
    backgroundColor: COLORS.success,
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
    backgroundColor: COLORS.successBg,
  },
  couponAppliedText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.success,
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
    color: COLORS.subText,
  },
  billValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  discountLabel: {
    color: COLORS.success,
  },
  discountValue: {
    color: COLORS.success,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
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
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
  },
  freeDeliveryNote: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    backgroundColor: COLORS.warningBg,
  },
  freeDeliveryText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.warning,
    marginLeft: 8,
  },
  
  // FOOTER WITH ACTION BUTTONS
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.danger,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  continueButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  continueText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
});