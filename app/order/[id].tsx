import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/colors";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";



/* ================= COLOR ALIAS ================= */


const C = {
  bg: Colors.background.primary,
  card: Colors.card.primary,
  border: Colors.border.light,

  textPrimary: Colors.text.primary,
  textSecondary: Colors.text.secondary,
  textLight: Colors.text.light,
  textWhite: Colors.text.white,

  primary: Colors.orange.primary,
  success: Colors.status.success,
  warning: Colors.status.warning,
  error: Colors.status.error,
};

export default function OrderDetailsScreen() {

  const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);

  const router = useRouter();
 const params = useLocalSearchParams();
const id = Array.isArray(params.id) ? params.id[0] : params.id;

  // ✅ STATE TOP PE
  const [order, setOrder] = useState<any>(null);

  // ✅ FETCH FUNCTION
 const fetchOrders = async () => {
  try {
    console.log("1️⃣ FetchOrders chala");

    const token = await AsyncStorage.getItem("token");

    const { data } = await axios.get(`${BASE_URL}/api/orders/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const foundOrder = data.find((o) => o._id === id);

    setOrder(foundOrder);

  } catch (error) {
    console.log("❌ ORDER ERROR:", error);
  } finally {
    setLoading(false);
  }
};

  // ✅ useEffect
useFocusEffect(
  useCallback(() => {
    fetchOrders();
  }, [])
);

  // ✅ LOADING CHECK
 if (loading) {
  return (
    <View style={styles.center}>
      <Text>Loading...</Text>
    </View>
  );
}

if (!order) {
  return (
    <View style={styles.center}>
      <Text>Order not found</Text>
    </View>
  );
}
// 🔥 SAME ITEMS MERGE KARNE KE LIYE
const mergedItems:any = {};

(order.orderItems || []).forEach((item:any) => {

  const name = item.food?.name || "Food Item";

  if (!mergedItems[name]) {
    mergedItems[name] = {
      name: name,
      quantity: item.quantity,
      price: item.food?.price || 0
    };
  } else {
    mergedItems[name].quantity += item.quantity;
  }

});

const items = Object.values(mergedItems);
  // ✅ BACKEND DATA CONVERT KARO
const formattedOrder = {
  id: order._id,
  date: new Date(order.createdAt).toLocaleDateString(),
  time: new Date(order.createdAt).toLocaleTimeString(),
  items: items,
  totalAmount: order.totalPrice,
  status: order.status,
};

  const statusColor =
    formattedOrder.status === "Delivered"
      ? C.success
      : formattedOrder.status === "Cancelled"
      ? C.error
      : C.primary;

  const subtotal = formattedOrder.totalAmount;
  const tax = subtotal * 0.05;
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const total = subtotal + tax + deliveryFee;
  const savings = subtotal > 500 ? 40 : 0;
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={C.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      {/* ORDER STATUS CARD */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.orderId}>Order #{formattedOrder.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {formattedOrder.status}
            </Text>
          </View>
        </View>
        <Text style={styles.orderDateTime}>{formattedOrder.date} • {formattedOrder.time}</Text>
      </View>

      {/* ORDER ITEMS SECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        
        {formattedOrder.items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
            </View>
            <View style={styles.itemPriceContainer}>
              <Text style={styles.itemUnitPrice}>₹{item.price} × {item.quantity}</Text>
              <Text style={styles.itemTotalPrice}>₹{item.price * item.quantity}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* BILL SUMMARY SECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bill Summary</Text>
        
        {/* Subtotal */}
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Subtotal</Text>
          <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
        </View>
        
        {/* Tax */}
        <View style={styles.billRow}>
          <View style={styles.billLabelContainer}>
            <Text style={styles.billLabel}>Tax & Charges</Text>
            <Text style={styles.billSubLabel}>GST @5%</Text>
          </View>
          <Text style={styles.billValue}>₹{tax.toFixed(2)}</Text>
        </View>
        
        {/* Delivery Fee */}
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Delivery Fee</Text>
          <View style={styles.deliveryFeeContainer}>
            {deliveryFee === 0 ? (
              <>
                <Text style={[styles.billValue, { color: C.success }]}>FREE</Text>
                <Text style={styles.originalPrice}>₹40</Text>
              </>
            ) : (
              <Text style={styles.billValue}>₹{deliveryFee.toFixed(2)}</Text>
            )}
          </View>
        </View>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Total Amount */}
        <View style={[styles.billRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
        </View>
        
        {/* Savings Message */}
        {savings > 0 && (
          <View style={styles.savingsContainer}>
            <Ionicons name="wallet" size={14} color={C.success} />
            <Text style={styles.savingsText}>
              You saved ₹{savings} on delivery!
            </Text>
          </View>
        )}
        
        {/* Payment Method */}
        <View style={styles.paymentMethod}>
          <View style={styles.paymentMethodHeader}>
            <Ionicons name="card" size={16} color={C.textSecondary} />
            <Text style={styles.paymentMethodLabel}>Payment Method</Text>
          </View>
          <View style={styles.paymentMethodDetails}>
            <Ionicons name="checkmark-circle" size={16} color={C.success} />
            <Text style={styles.paymentMethodValue}>Paid Online</Text>
          </View>
        </View>
      </View>

      {/* ORDER INFO SECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="receipt" size={16} color={C.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Order Type</Text>
            <Text style={styles.infoValue}>Home Delivery</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color={C.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Delivery Address</Text>
            <Text style={styles.infoValue}>123, Satvik Colony, Delhi - 110001</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color={C.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Estimated Delivery</Text>
            <Text style={styles.infoValue}>30-40 minutes</Text>
          </View>
        </View>
      </View>

    
     
      {/* ACTIONS BUTTONS */}
      <View style={styles.actionsContainer}>
        {formattedOrder.status !== "Cancelled" && formattedOrder.status !== "Delivered" && (
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Ionicons name="close-circle" size={18} color={C.error} />
            <Text style={[styles.actionButtonText, { color: C.error }]}>
              Cancel Order
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.reorderButton]}
          onPress={() => router.push("/")}
        >
          <Ionicons name="refresh" size={18} color={C.primary} />
          <Text style={[styles.actionButtonText, { color: C.primary }]}>
            Reorder Items
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  notFound: {
    fontSize: 16,
    color: C.textSecondary,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: C.textPrimary,
    flex: 1,
  },

  statusCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  orderId: {
    fontSize: 18,
    fontWeight: "700",
    color: C.textPrimary,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  orderDateTime: {
    fontSize: 14,
    color: C.textSecondary,
    fontWeight: "500",
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 20,
  },

  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border + '50',
  },

  itemInfo: {
    flex: 1,
    marginRight: 12,
  },

  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: C.textPrimary,
    marginBottom: 4,
  },

  itemQuantity: {
    fontSize: 13,
    color: C.textSecondary,
  },

  itemPriceContainer: {
    alignItems: "flex-end",
  },

  itemUnitPrice: {
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 4,
  },

  itemTotalPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textPrimary,
  },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  billLabelContainer: {
    flexDirection: "column",
  },

  billLabel: {
    fontSize: 14,
    color: C.textPrimary,
    fontWeight: "500",
  },

  billSubLabel: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
  },

  billValue: {
    fontSize: 14,
    color: C.textPrimary,
    fontWeight: "500",
  },

  deliveryFeeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  originalPrice: {
    fontSize: 12,
    color: C.textSecondary,
    textDecorationLine: "line-through",
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 16,
  },

  totalRow: {
    marginTop: 8,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: C.textPrimary,
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: C.primary,
  },

  savingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.success + '15',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },

  savingsText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.success,
  },

  paymentMethod: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  paymentMethodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  paymentMethodLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: C.textPrimary,
  },

  paymentMethodDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.success + '10',
    padding: 12,
    borderRadius: 8,
  },

  paymentMethodValue: {
    fontSize: 14,
    fontWeight: "600",
    color: C.success,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: C.textPrimary,
  },

  cancelCard: {
    backgroundColor: C.error + '05',
    borderColor: C.error + '20',
  },

  cancelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  cancelTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.error,
  },

  reasonText: {
    fontSize: 14,
    color: C.error,
    lineHeight: 20,
    marginBottom: 8,
  },

  cancelTime: {
    fontSize: 12,
    color: C.textSecondary,
    fontStyle: "italic",
  },

  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },

  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },

  cancelButton: {
    backgroundColor: C.error + '05',
    borderColor: C.error + '30',
  },

  reorderButton: {
    backgroundColor: C.primary + '05',
    borderColor: C.primary + '30',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});