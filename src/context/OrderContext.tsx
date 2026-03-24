"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  setDoc,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Order {
  id: string;
  customerName: string;
  whatsapp: string;
  fileName: string;
  fileSize: number;
  pageCount: {
    bw: number;
    color: number;
  };
  options: {
    binding: string;
    cover: string;
    laminating: boolean;
  };
  totalPrice: number;
  status: "pending" | "processing" | "completed";
  paymentStatus: "unpaid" | "paid";
  materials: {
    paperCost: number;
    inkCost: number;
  };
  vendor?: {
    name: string;
    cost: number;
    status: "pending" | "sent" | "ready";
  };
  fileUrl?: string; // Pointing to Firebase Storage
  createdAt: string;
}

interface Inventory {
  paperStock: number;
  inkStock: number;
  paperCostPerSheet: number;
  inkCostPerPage: number;
  // Dynamic Pricing
  priceBw: number;
  priceColor: number;
  bulkThreshold: number;
  bulkPriceBw: number;
  bulkPriceColor: number;
}

interface OrderContextType {
  orders: Order[];
  inventory: Inventory;
  loading: boolean;
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status" | "paymentStatus" | "materials">) => Promise<string>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
  updatePaymentStatus: (id: string, status: Order["paymentStatus"]) => Promise<void>;
  updateInventory: (inventory: Partial<Inventory>) => Promise<void>;
  assignVendor: (id: string, vendor: Order["vendor"]) => Promise<void>;
  clearOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Inventory>({
    paperStock: 5000,
    inkStock: 100,
    paperCostPerSheet: 200,
    inkCostPerPage: 100,
    priceBw: 500,
    priceColor: 1000,
    bulkThreshold: 150,
    bulkPriceBw: 350,
    bulkPriceColor: 800,
  });
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  // Load orders and inventory from Firestore
  useEffect(() => {
    let unsubscribeOrders: () => void = () => {};

    // 1. Listen to Orders only if authenticated (Admin)
    if (user) {
      const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Order[];
        setOrders(ordersData);
        setLoading(false);
      }, (error) => {
        console.error("Orders listener error:", error);
      });
    } else {
      setOrders([]); // Clear orders if logged out
      setLoading(false);
    }

    // 2. Listen to Inventory
    const inventoryDoc = doc(db, "config", "inventory");
    const unsubscribeInventory = onSnapshot(inventoryDoc, (snapshot) => {
      if (snapshot.exists()) {
        setInventory(snapshot.data() as Inventory);
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeInventory();
    };
  }, [user]);

  const addOrder = async (orderData: Omit<Order, "id" | "createdAt" | "status" | "paymentStatus" | "materials">) => {
    const totalPages = orderData.pageCount.bw + orderData.pageCount.color;
    const materials = {
      paperCost: totalPages * inventory.paperCostPerSheet,
      inkCost: totalPages * inventory.inkCostPerPage,
    };

    const newOrder = {
      ...orderData,
      status: "pending",
      paymentStatus: "unpaid" as const,
      materials,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "orders"), newOrder);

    // Update stock
    const inventoryDoc = doc(db, "config", "inventory");
    await updateDoc(inventoryDoc, {
      paperStock: inventory.paperStock - totalPages,
      inkStock: inventory.inkStock - (totalPages * 0.01), // Assumed usage
    });

    return docRef.id;
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    const orderDoc = doc(db, "orders", id);
    await updateDoc(orderDoc, { status });
  };

  const updatePaymentStatus = async (id: string, paymentStatus: Order["paymentStatus"]) => {
    const orderDoc = doc(db, "orders", id);
    await updateDoc(orderDoc, { paymentStatus });
  };

  const updateInventory = async (newInventory: Partial<Inventory>) => {
    const inventoryDoc = doc(db, "config", "inventory");
    await updateDoc(inventoryDoc, newInventory);
  };

  const assignVendor = async (id: string, vendor: Order["vendor"]) => {
    const orderDoc = doc(db, "orders", id);
    await updateDoc(orderDoc, { vendor });
  };

  // Clear all orders using a write batch
  const clearOrders = async () => {
    try {
      const { writeBatch, getDocs } = await import("firebase/firestore");
      const batch = writeBatch(db);
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      
      ordersSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log("Successfully cleared all orders from Firestore.");
    } catch (error) {
      console.error("Failed to clear orders:", error);
      alert("Failed to clear orders. Check console for details.");
    }
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      inventory, 
      loading,
      addOrder, 
      updateOrderStatus, 
      updatePaymentStatus,
      updateInventory,
      assignVendor,
      clearOrders 
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};

