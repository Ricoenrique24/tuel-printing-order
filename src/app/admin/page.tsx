"use client";

import React, { useState } from "react";
import { useOrders, Order } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import PDFViewer from "@/components/PDFViewer";

export default function AdminDashboard() {
  const { user, loading: authLoading, loginWithGoogle, logout: firebaseLogout } = useAuth();
  const { orders, inventory, loading: ordersLoading, updateOrderStatus, updatePaymentStatus, updateInventory, assignVendor, clearOrders } = useOrders();
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "vendors" | "pricing">("orders");
  const [selectedOrderForPreview, setSelectedOrderForPreview] = useState<Order | null>(null);
  const [vendorForm, setVendorForm] = useState<{ orderId: string; name: string; cost: number } | null>(null);

  if (authLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Syncing with Firestore...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full space-y-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center font-black text-3xl shadow-xl shadow-primary/20">T</div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight">Admin Access</h1>
            <p className="text-muted-foreground font-medium">Please sign in to manage the store queue and orders.</p>
          </div>
          <button 
            onClick={loginWithGoogle}
            className="w-full bg-foreground text-background py-4 rounded-xl font-black text-lg hover:bg-foreground/90 transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-foreground/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
            <span>Sign in with Google</span>
          </button>
          <div className="pt-4">
            <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors underline decoration-2 underline-offset-4">
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(o => o.status === filter);

  const stats = {
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    completed: orders.filter(o => o.status === "completed").length,
    totalRevenue: orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0),
    totalCost: orders.reduce((acc, o) => acc + (o.materials?.paperCost || 0) + (o.materials?.inkCost || 0) + (o.vendor?.cost || 0), 0),
  };

  const netProfit = stats.totalRevenue - stats.totalCost;

  const handleAssignVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm) return;
    assignVendor(vendorForm.orderId, {
      name: vendorForm.name,
      cost: vendorForm.cost,
      status: "sent"
    });
    setVendorForm(null);
  };

  return (
    <div className="min-h-screen bg-secondary/30 p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center font-black text-2xl shadow-lg">T</div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Admin Portal</h1>
              <p className="text-muted-foreground text-sm font-medium">ERP & Document Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">Authorized Session</p>
              <p className="text-sm font-bold truncate max-w-[200px]">{user?.email}</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={firebaseLogout}
                className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-secondary rounded-lg transition-colors border border-border"
              >
                Logout
              </button>
              <Link href="/" className="btn-primary py-2 text-sm">
                Back to Store
              </Link>
            </div>
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
            Inventory
          </button>
          <button 
            onClick={() => setActiveTab("vendors")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "vendors" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            Vendors
          </button>
          <button 
            onClick={() => setActiveTab("pricing")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "pricing" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            Pricing
          </button>
        </div>

        {activeTab === "orders" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="premium-card p-6 border-b-4 border-b-primary text-center md:text-left">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Gross Revenue</p>
                <p className="text-2xl font-black italic">Rp {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="premium-card p-6 border-b-4 border-b-green-500 text-center md:text-left">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Net Profit</p>
                <p className="text-2xl font-black text-green-600 italic">Rp {netProfit.toLocaleString()}</p>
              </div>
              <div className="premium-card p-6 border-b-4 border-b-yellow-400 text-center md:text-left">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Queue</p>
                <p className="text-2xl font-black italic">{stats.pending}</p>
              </div>
              <div className="premium-card p-6 border-b-4 border-b-blue-400 text-center md:text-left">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Finished</p>
                <p className="text-2xl font-black italic">{stats.completed}</p>
              </div>
            </div>

            <div className="premium-card overflow-hidden">
              <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-background">
                <h2 className="text-xl font-bold">Active Store Queue</h2>
                <div className="flex items-center space-x-4">
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
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to clear ALL orders? This cannot be undone.")) {
                        clearOrders();
                      }
                    }}
                    className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-tight border border-red-100 hover:bg-red-100 transition-colors"
                  >
                    Clear Queue
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary/50 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      <th className="px-6 py-5">Customer</th>
                      <th className="px-6 py-5">Specs</th>
                      <th className="px-6 py-5">Financials</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium">
                          The queue is currently empty.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-secondary/10 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-black text-[10px] text-primary mb-1">{order.id.slice(0, 8)}</p>
                            <p className="font-bold text-sm">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.whatsapp}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-xs truncate max-w-[150px] mb-1">{order.fileName}</p>
                            <div className="flex flex-wrap gap-1">
                              <span className="bg-secondary px-2 py-0.5 rounded text-[9px] font-bold">
                                {order.pageCount.bw + order.pageCount.color} pgs
                              </span>
                              {order.vendor && (
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                  {order.vendor.name}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-black text-xs italic">
                            Rp {order.totalPrice.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                order.status === "pending" ? "bg-yellow-400" :
                                order.status === "processing" ? "bg-blue-400" :
                                "bg-green-400"
                              }`} />
                              <span className="text-[10px] font-black uppercase">{order.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center space-x-3">
                              <button 
                                onClick={() => setSelectedOrderForPreview(order)}
                                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors group/btn"
                                title="Preview Document"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => setVendorForm({ orderId: order.id, name: "", cost: 0 })}
                                className="p-2 hover:bg-purple-50 text-purple-500 rounded-lg transition-colors"
                                title="Send to Vendor"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m4-4l-4-4" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => updateOrderStatus(order.id, order.status === "pending" ? "processing" : "completed")}
                                className="p-2 hover:bg-green-50 text-green-500 rounded-lg transition-colors"
                                title="Update Status"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
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
        )}

        {activeTab === "inventory" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="premium-card p-8">
              <h3 className="text-xl font-bold mb-6">Stock Monitoring</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Paper Supply (A4)</label>
                    <span className="text-lg font-black">{inventory.paperStock.toLocaleString()} / 5000</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(inventory.paperStock / 5000) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ink Reservoir</label>
                    <span className="text-lg font-black">{inventory.inkStock.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${inventory.inkStock < 20 ? "bg-red-500" : "bg-primary"}`} style={{ width: `${inventory.inkStock}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="premium-card p-8">
              <h3 className="text-xl font-bold mb-6">Global Unit Costs</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Price per Sheet (Rp)</label>
                  <input 
                    type="number" value={inventory.paperCostPerSheet}
                    onChange={(e) => updateInventory({ paperCostPerSheet: Number(e.target.value) })}
                    className="w-full bg-secondary border-none p-4 rounded-xl font-black text-lg focus:ring-2 ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Ink Cost per Page (Rp)</label>
                  <input 
                    type="number" value={inventory.inkCostPerPage}
                    onChange={(e) => updateInventory({ inkCostPerPage: Number(e.target.value) })}
                    className="w-full bg-secondary border-none p-4 rounded-xl font-black text-lg focus:ring-2 ring-primary transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "vendors" && (
          <div className="premium-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-border bg-background">
              <h2 className="text-xl font-bold">External Vendor Tracking</h2>
              <p className="text-xs text-muted-foreground font-medium mt-1">Manage orders outsourced to printing partners</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/50 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    <th className="px-6 py-5">Order ID</th>
                    <th className="px-6 py-5">Vendor Name</th>
                    <th className="px-6 py-5">Service Cost</th>
                    <th className="px-6 py-5">Partner Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.filter(o => o.vendor).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-medium">
                        No orders currently assigned to vendors.
                      </td>
                    </tr>
                  ) : (
                    orders.filter(o => o.vendor).map((order) => (
                      <tr key={order.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-6 py-4 font-black text-[10px] text-primary">{order.id.slice(0, 8)}</td>
                        <td className="px-6 py-4 font-bold text-sm">{order.vendor?.name}</td>
                        <td className="px-6 py-4 font-black text-sm italic">Rp {order.vendor?.cost.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                            {order.vendor?.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Standard Pricing */}
            <div className="premium-card p-8">
              <h3 className="text-xl font-bold mb-6">Standard Pricing (Page)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Color Rate (Rp)</label>
                  <input 
                    type="number" value={inventory.priceColor}
                    onChange={(e) => updateInventory({ priceColor: Number(e.target.value) })}
                    className="w-full bg-secondary border-none p-4 rounded-xl font-black text-lg focus:ring-2 ring-primary transition-all"
                  />
                  <p className="text-[10px] mt-2 text-muted-foreground italic">Target: Rp 1,000</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">B&W Rate (Rp)</label>
                  <input 
                    type="number" value={inventory.priceBw}
                    onChange={(e) => updateInventory({ priceBw: Number(e.target.value) })}
                    className="w-full bg-secondary border-none p-4 rounded-xl font-black text-lg focus:ring-2 ring-primary transition-all"
                  />
                  <p className="text-[10px] mt-2 text-muted-foreground italic">Target: Rp 500</p>
                </div>
              </div>
            </div>

            {/* Bulk Discount Rules */}
            <div className="premium-card p-8 border-l-4 border-l-primary">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold">Bulk Discount System</h3>
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Automatic</span>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Threshold (Total Pages)</label>
                  <input 
                    type="number" value={inventory.bulkThreshold}
                    onChange={(e) => updateInventory({ bulkThreshold: Number(e.target.value) })}
                    className="w-full bg-secondary border-none p-4 rounded-xl font-black text-lg focus:ring-2 ring-primary transition-all"
                  />
                  <p className="text-[10px] mt-2 text-muted-foreground">Apply discount if total pages ≥ this value</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Bulk Color (Rp)</label>
                    <input 
                      type="number" value={inventory.bulkPriceColor}
                      onChange={(e) => updateInventory({ bulkPriceColor: Number(e.target.value) })}
                      className="w-full bg-secondary border-none p-4 rounded-xl font-black text-lg focus:ring-2 ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Bulk B&W (Rp)</label>
                    <input 
                      type="number" value={inventory.bulkPriceBw}
                      onChange={(e) => updateInventory({ bulkPriceBw: Number(e.target.value) })}
                      className="w-full bg-secondary border-none p-4 rounded-xl font-black text-lg focus:ring-2 ring-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Production Costs */}
            <div className="premium-card p-8 col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold mb-6">Internal Unit Costs (Margin Calculation)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Paper Cost per Sheet (Rp)</label>
                  <input 
                    type="number" value={inventory.paperCostPerSheet}
                    onChange={(e) => updateInventory({ paperCostPerSheet: Number(e.target.value) })}
                    className="w-full bg-secondary border-none p-4 rounded-xl font-bold text-sm focus:ring-2 ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Ink Cost per Page (Rp)</label>
                  <input 
                    type="number" value={inventory.inkCostPerPage}
                    onChange={(e) => updateInventory({ inkCostPerPage: Number(e.target.value) })}
                    className="w-full bg-secondary border-none p-4 rounded-xl font-bold text-sm focus:ring-2 ring-primary transition-all"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic font-medium">These values are used to calculate the "Net Profit" in your dashboard and are never shown to customers.</p>
            </div>
          </div>
        )}
      </div>

      {/* Vendor Assignment Modal */}
      {vendorForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-background w-full max-w-md rounded-2xl shadow-2xl p-8 border border-border">
            <h3 className="text-xl font-black mb-6 italic underline decoration-primary decoration-4">Assign to Vendor</h3>
            <form onSubmit={handleAssignVendor} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Vendor Name</label>
                <input 
                  type="text" required
                  className="w-full bg-secondary border-none p-4 rounded-xl font-bold text-sm focus:ring-2 ring-primary transition-all"
                  placeholder="e.g. Master Printing Indo"
                  value={vendorForm.name}
                  onChange={e => setVendorForm({...vendorForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Vendor Cost (Rp)</label>
                <input 
                  type="number" required
                  className="w-full bg-secondary border-none p-4 rounded-xl font-black text-lg focus:ring-2 ring-primary transition-all"
                  value={vendorForm.cost}
                  onChange={e => setVendorForm({...vendorForm, cost: Number(e.target.value)})}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setVendorForm(null)} className="flex-1 px-4 py-3 font-bold text-sm text-muted-foreground bg-secondary rounded-xl hover:bg-border transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Assign & Sent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      <PDFViewer 
        url={selectedOrderForPreview?.fileUrl || null}
        fileName={selectedOrderForPreview?.fileName}
        isOpen={!!selectedOrderForPreview}
        onClose={() => setSelectedOrderForPreview(null)}
      />
    </div>
  );
}


