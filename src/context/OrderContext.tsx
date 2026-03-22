"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  fileUrl?: string; // For previewing
  createdAt: string;
}

interface Inventory {
  paperStock: number;
  inkStock: number;
  paperCostPerSheet: number;
  inkCostPerPage: number;
}

interface OrderContextType {
  orders: Order[];
  inventory: Inventory;
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status" | "paymentStatus" | "materials">) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  updatePaymentStatus: (id: string, status: Order["paymentStatus"]) => void;
  updateInventory: (inventory: Partial<Inventory>) => void;
  assignVendor: (id: string, vendor: Order["vendor"]) => void;
  clearOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Inventory>({
    paperStock: 5000,
    inkStock: 100,
    paperCostPerSheet: 200,
    inkCostPerPage: 100,
  });

  // Load orders and inventory from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem("tuel_orders");
    const savedInventory = localStorage.getItem("tuel_inventory");
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Failed to parse orders", e);
      }
    }
    if (savedInventory) {
      try {
        setInventory(JSON.parse(savedInventory));
      } catch (e) {
        console.error("Failed to parse inventory", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("tuel_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("tuel_inventory", JSON.stringify(inventory));
  }, [inventory]);

  const addOrder = (orderData: Omit<Order, "id" | "createdAt" | "status" | "paymentStatus" | "materials">) => {
    const totalPages = orderData.pageCount.bw + orderData.pageCount.color;
    const materials = {
      paperCost: totalPages * inventory.paperCostPerSheet,
      inkCost: totalPages * inventory.inkCostPerPage,
    };

    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: "pending",
      paymentStatus: "unpaid",
      materials,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);

    // Update stock (simplified)
    setInventory(prev => ({
      ...prev,
      paperStock: prev.paperStock - totalPages,
      inkStock: prev.inkStock - (totalPages * 0.01), // Assumed usage
    }));
  };

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order))
    );
  };

  const updatePaymentStatus = (id: string, paymentStatus: Order["paymentStatus"]) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, paymentStatus } : order))
    );
  };

  const updateInventory = (newInventory: Partial<Inventory>) => {
    setInventory(prev => ({ ...prev, ...newInventory }));
  };

  const assignVendor = (id: string, vendor: Order["vendor"]) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, vendor } : order))
    );
  };

  const clearOrders = () => {
    setOrders([]);
    localStorage.removeItem("tuel_orders");
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      inventory, 
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
