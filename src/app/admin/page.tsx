"use client";

import React, { useState } from "react";
import { useOrders, Order } from "@/context/OrderContext";
import Link from "next/link";

export default function AdminDashboard() {
  const { orders, inventory, updateOrderStatus, updatePaymentStatus, updateInventory, clearOrders } = useOrders();
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [activeTab, setActiveTab] = useState<"orders" | "inventory">("orders");

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(o => o.status === filter);

  const stats = {
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    completed: orders.filter(o => o.status === "completed").length,
    totalRevenue: orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0),
    totalCost: orders.reduce((acc, o) => acc + (o.materials?.paperCost || 0) + (o.materials?.inkCost || 0), 0),
  };

  const netProfit = stats.totalRevenue - stats.totalCost;

  return (
    <div className="min-h-screen bg-secondary/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center font-black text-2xl shadow-lg">T</div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Admin Portal</h1>
              <p className="text-muted-foreground text-sm font-medium">Enterprise Resource Planning</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => { if(confirm("Clear all data?")) { clearOrders(); localStorage.clear(); window.location.reload(); }}}
              className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              Reset System
            </button>
            <Link href="/" className="btn-primary py-2 text-sm">
              Back to Store
            </Link>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-1 bg-secondary/50 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "orders" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            Order Queue
          </button>
          <button 
            onClick={() => setActiveTab("inventory")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "inventory" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            Inventory & Costs
          </button>
        </div>

        {activeTab === "orders" ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="premium-card p-6 border-b-4 border-b-primary">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Gross Revenue</p>
                <p className="text-2xl font-black italic">Rp {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="premium-card p-6 border-b-4 border-b-green-500">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Estimated Net Profit</p>
                <p className="text-2xl font-black text-green-600">Rp {netProfit.toLocaleString()}</p>
              </div>
              <div className="premium-card p-6 border-b-4 border-b-yellow-400">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Pending Orders</p>
                <p className="text-2xl font-black">{stats.pending}</p>
              </div>
              <div className="premium-card p-6 border-b-4 border-b-blue-400">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Completed Today</p>
                <p className="text-2xl font-black">{stats.completed}</p>
              </div>
            </div>

            {/* Order List */}
            <div className="premium-card overflow-hidden">
              <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-background">
                <h2 className="text-xl font-bold">Active Store Queue</h2>
                <div className="flex bg-secondary p-1 rounded-lg text-[10px] font-black uppercase tracking-tight">
                  {["all", "pending", "processing", "completed"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f as any)}
                      className={`px-4 py-2 rounded-md transition-all ${
                        filter === f ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary/50 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      <th className="px-6 py-5">Customer</th>
                      <th className="px-6 py-5">Specs</th>
                      <th className="px-6 py-5">Financials</th>
                      <th className="px-6 py-5">Payment</th>
                      <th className="px-6 py-5">Order Status</th>
                      <th className="px-6 py-5 text-right">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                          The queue is currently empty.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-secondary/10 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-black text-[10px] text-primary mb-1">{order.id}</p>
                            <p className="font-bold text-sm">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.whatsapp}</p>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <p className="font-bold truncate max-w-[150px] mb-1">{order.fileName}</p>
                            <div className="flex flex-wrap gap-1">
                              <span className="bg-secondary px-2 py-0.5 rounded text-[10px] font-bold">
                                {order.pageCount.bw + order.pageCount.color} pgs
                              </span>
                              {order.options.binding !== "none" && (
                                <span className="bg-primary/20 text-primary-foreground px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                  {order.options.binding}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-black text-sm italic">Rp {order.totalPrice.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Cost: Rp {(order.materials.paperCost + order.materials.inkCost).toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => updatePaymentStatus(order.id, order.paymentStatus === "paid" ? "unpaid" : "paid")}
                              className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all ${
                                order.paymentStatus === "paid" 
                                  ? "bg-green-500/10 text-green-600 border border-green-200" 
                                  : "bg-red-500/10 text-red-600 border border-red-200"
                              }`}
                            >
                              {order.paymentStatus}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full animate-pulse ${
                                order.status === "pending" ? "bg-yellow-400" :
                                order.status === "processing" ? "bg-blue-400" :
                                "bg-green-400"
                              }`} />
                              <span className="text-xs font-bold capitalize">{order.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              {order.status === "pending" && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, "processing")}
                                  className="text-[10px] font-black text-blue-500 hover:text-blue-700 uppercase"
                                >
                                  Process
                                </button>
                              )}
                              {order.status === "processing" && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, "completed")}
                                  className="text-[10px] font-black text-green-500 hover:text-green-700 uppercase"
                                >
                                  Finish
                                </button>
                              )}
                              <button className="text-[10px] font-black text-primary hover:underline uppercase">
                                PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="premium-card p-8">
              <h3 className="text-xl font-bold mb-6">Stock Levels</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Paper Stock (A4)</label>
                    <span className="text-lg font-black">{inventory.paperStock.toLocaleString()} sheets</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (inventory.paperStock / 5000) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ink Level (Estimate)</label>
                    <span className="text-lg font-black">{Math.max(0, inventory.inkStock).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${inventory.inkStock < 20 ? "bg-red-500" : "bg-primary"}`}
                      style={{ width: `${inventory.inkStock}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 grid grid-cols-2 gap-4">
                  <button className="bg-secondary p-3 rounded-lg text-xs font-bold hover:bg-border transition-colors">
                    Add Paper Ream (+500)
                  </button>
                  <button className="bg-secondary p-3 rounded-lg text-xs font-bold hover:bg-border transition-colors">
                    Refill Ink (+100%)
                  </button>
                </div>
              </div>
            </div>

            <div className="premium-card p-8">
              <h3 className="text-xl font-bold mb-6">Cost Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-2 block">Paper Cost per Sheet (Rp)</label>
                  <input 
                    type="number"
                    className="w-full bg-secondary border border-border p-3 rounded-lg text-sm font-bold"
                    value={inventory.paperCostPerSheet}
                    onChange={(e) => updateInventory({ paperCostPerSheet: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-2 block">Ink Cost per Page (Avg Rp)</label>
                  <input 
                    type="number"
                    className="w-full bg-secondary border border-border p-3 rounded-lg text-sm font-bold"
                    value={inventory.inkCostPerPage}
                    onChange={(e) => updateInventory({ inkCostPerPage: Number(e.target.value) })}
                  />
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mt-6">
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    *Changing these values will affect calculations for **future** orders. 
                    Current total material cost for active orders: <span className="font-bold text-foreground">Rp {stats.totalCost.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

