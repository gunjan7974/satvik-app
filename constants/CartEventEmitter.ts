import { DeviceEventEmitter } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CART_UPDATED_EVENT = "CART_UPDATED";

/**
 * Call this after any cart operation (add / remove / clear).
 * It saves the new count to AsyncStorage AND emits a live event
 * so the header badge in _layout.tsx updates immediately.
 */
export const emitCartUpdate = async (newCount: number) => {
  try {
    await AsyncStorage.setItem("cartCount", JSON.stringify(newCount));
  } catch (_) {}
  DeviceEventEmitter.emit(CART_UPDATED_EVENT, newCount);
};
