import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BASE_URL } from "../../config/api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useEffect } from "react";
import React, { useState } from "react";
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
} from "react-native";
import { useTheme } from "../data/ThemeContext";
// path adjust karo agar folder alag ho
// Import theme context

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

export default function OrderScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme(); // Get theme colors

  /* ================= DATA ================= */
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // 🔥 SORTING KE LIYE
  createdAt: new Date(order.createdAt).getTime(),

  // UI DISPLAY KE LIYE
  date: new Date(order.createdAt).toLocaleDateString(),
  time: new Date(order.createdAt).toLocaleTimeString(),

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
        text: colors.primary,
        icon: "receipt" as const
      },
      Preparing: {
        bg: mode === 'dark' ? '#5D4037' : '#FFF3E0',
        text: colors.warning,
        icon: "restaurant" as const
      },
      "On the way": {
        bg: mode === 'dark' ? '#1B5E20' : '#E8F5E9',
        text: colors.success,
        icon: "bicycle" as const
      },
      Delivered: {
        bg: mode === 'dark' ? '#1B5E20' : '#E8F5E9',
        text: colors.success,
        icon: "checkmark-circle" as const
      },
      Cancelled: {
        bg: mode === 'dark' ? '#4A235A' : '#FFEBEE',
        text: colors.danger,
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

    Alert.alert("Success", "Order cancelled successfully");

    fetchOrders(); // refresh list

  } catch (error: any) {
    console.log("Cancel Error:", error.response?.data || error.message);
  }
};

const handleReorder = (orderId: string) => {
    Alert.alert(
      "Reorder",
      "Add all items to cart?",
      [
        { text: "Later", style: "cancel" },
        {
          text: "Add to Cart",
          onPress: () => {
            Alert.alert("Added", "Items added to cart!");
           

            router.push("/order");
          }
        }
      ]
    );
  };

  /* ================= ORDER CARD ================= */
  const renderOrder = ({ item }: { item: Order }) => {
    const status = getStatus(item.status);
    const isCancelled = item.status === "Cancelled";

    return (
      <View style={[
        styles.orderCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        isCancelled && {
          backgroundColor: mode === 'dark' ? '#2D1B2E' : '#FFEBEE',
          borderColor: mode === 'dark' ? '#4A235A' : '#FFCDD2',
        }
      ]}>
        <View style={styles.orderHeader}>
          <View style={styles.topRow}>
            <Text style={[
              styles.orderId,
              { color: colors.text },
              isCancelled && styles.cancelledText
            ]}>
              #{item.id}
            </Text>

            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon} size={12} color={status.text} />
              <Text style={[styles.statusText, { color: status.text }]}>
                {item.status}
              </Text>
            </View>
          </View>

          <View style={styles.dishRow}>
            <Ionicons
              name="fast-food-outline"
              size={18}
              color={isCancelled ? colors.subText : colors.primary}
            />
            <Text
              style={[
                styles.dishName,
                { color: isCancelled ? colors.subText : colors.text },
              ]}
              numberOfLines={1}
            >
              {item.items.map((i) => i.name).join(", ")}
            </Text>
          </View>


          <View style={styles.detailRow}>
            <Text style={[
              styles.detailText,
              { color: isCancelled ? colors.subText : colors.subText }
            ]}>
              {item.date} • {item.time}
            </Text>
            <Text style={[
              styles.detailText,
              { color: isCancelled ? colors.subText : colors.text }
            ]}>
              ₹{item.totalAmount}
            </Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={[
          styles.actionButtons,
          {
            borderColor: colors.border,
            backgroundColor: mode === 'dark' ? '#252525' : '#F8F8F8'
          }
        ]}>
          {item.status !== "Cancelled" && item.status !== "Delivered" && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.cancelButton,
                {
                  backgroundColor: mode === 'dark' ? '#4A235A' : '#FFEBEE',
                  borderColor: mode === 'dark' ? '#6A3480' : '#FFCDD2'
                }
              ]}
              onPress={() => handleCancelOrder(item.id)}
            >
              <Ionicons name="close-circle" size={14} color={colors.danger} />
              <Text style={[styles.cancelButtonText, { color: colors.danger }]}>Cancel</Text>
            </TouchableOpacity>
          )}

          {item.status === "Delivered" && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.reorderButton,
                {
                  backgroundColor: mode === 'dark' ? '#1B5E20' : '#E8F5E9',
                  borderColor: mode === 'dark' ? '#2E7D32' : '#C8E6C9'
                }
              ]}
              onPress={() => handleReorder(item.id)}
            >
              <Ionicons name="refresh" size={14} color={colors.primary} />
              <Text style={[styles.reorderButtonText, { color: colors.primary }]}>Reorder</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.detailsButton,
              {
                backgroundColor: mode === 'dark' ? '#2D2D2D' : '#F5F5F5',
                borderColor: mode === 'dark' ? '#3D3D3D' : '#E0E0E0'
              }
            ]}
            onPress={() => router.push(`/order/${item.id}`)}
          >
            <Text style={[styles.detailsButtonText, { color: colors.primary }]}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ================= UI ================= */
  if (loading) {
  return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
      <Text>Loading Orders...</Text>
    </View>
  );
}
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>


      {/* SEARCH */}
      {showSearch && (
        <View style={[
          styles.searchBox,
          { borderColor: colors.border }
        ]}>
          <View style={[
            styles.searchInputContainer,
            {
              backgroundColor: mode === 'dark' ? '#2D2D2D' : '#F5F5F5',
            }
          ]}>
            <Ionicons name="search" size={18} color={colors.subText} />
            <TextInput
              placeholder="Search orders..."
              placeholderTextColor={colors.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color={colors.subText} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* FILTER TABS */}
      <View style={[
        styles.filterContainer,
        { borderColor: colors.border }
      ]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {(["All", "Active", "Delivered", "Cancelled"] as FilterType[]).map(
            (filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  activeFilter === filter && [
                    styles.activeFilterTab,
                    { backgroundColor: mode === 'dark' ? '#1B5E20' : '#E8F5E9' }
                  ]
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  { color: colors.subText },
                  activeFilter === filter && [
                    styles.activeFilterText,
                    { color: colors.primary }
                  ]
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

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
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons
              name={searchQuery ? "search" : "receipt-outline"}
              size={60}
              color={colors.subText}
            />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              {searchQuery ? "No orders found" : "No orders yet"}
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.subText }]}>
              {searchQuery
                ? `Try a different search`
                : "Start ordering delicious food!"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  headerActions: {
    flexDirection: "row",
    gap: 12,
  },

  iconButton: {
    position: "relative",
    padding: 8,
  },

  cartBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  searchBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  filterContainer: {
    borderBottomWidth: 1,
  },

  filterScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
  },

  activeFilterTab: {
  },

  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },

  activeFilterText: {
    fontWeight: "600",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },

  orderCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
  },

  cancelledText: {
    textDecorationLine: "line-through",
  },

  orderHeader: {
    padding: 16
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  orderId: {
    fontSize: 15,
    fontWeight: "600",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },

  dishRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  dishName: {
    fontSize: 15,
    flex: 1
  },

  reasonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    padding: 8,
    borderRadius: 6,
  },

  reasonText: {
    fontSize: 11,
    flex: 1,
    fontStyle: "italic",
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailText: {
    fontSize: 12,
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
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    flex: 1,
    borderWidth: 1,
  },

  cancelButton: {
  },

  cancelButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },

  reorderButton: {
  },

  reorderButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },

  detailsButton: {
  },

  detailsButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },

  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
  },
});