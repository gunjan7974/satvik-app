/* ================= ORDER TYPES ================= */

export type OrderStatus =
  | "Order Placed"
  | "Preparing"
  | "On the way"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  name: string;
  quantity: number; // ✅ FIXED
  price: number;
}

export interface Order {
  id: string;
  date: string;
  time: string;

  items: OrderItem[];

  totalAmount: number; // ✅ FIXED
  status: OrderStatus;

  reason?: string;     // ✅ optional
  canCancel?: boolean; // ✅ optional
  canReorder?: boolean;
}

/* ================= DUMMY DATA ================= */

export const ORDERS: Order[] = [
  {
    id: "SAT1235",
    date: "21 Jan 2026",
    time: "12:45 PM",
    items: [
      { name: "Rajma Chawal (Satvik)", quantity: 2, price: 280 },
    ],
    totalAmount: 560,
    status: "Order Placed",
    canCancel: true,
  },
  {
    id: "SAT1234",
    date: "20 Jan 2026",
    time: "7:30 PM",
    items: [
      { name: "Satvik Thali", quantity: 1, price: 420 },
    ],
    totalAmount: 420,
    status: "Delivered",
    canReorder: true,
  },
  {
    id: "SAT1237",
    date: "22 Jan 2026",
    time: "1:30 PM",
    items: [
      { name: "Chole Bhature", quantity: 2, price: 180 },
    ],
    totalAmount: 360,
    status: "On the way",
  },
  {
    id: "SAT1246",
    date: "25 Jan 2026",
    time: "7:15 PM",
    items: [
      { name: "Veg Biryani", quantity: 2, price: 240 },
    ],
    totalAmount: 480,
    status: "Cancelled",
    reason: "Cancelled by customer",
    canReorder: true,
  },
];