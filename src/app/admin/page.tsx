"use client";

import React, { useState } from "react";
import { useOrders, Order } from "@/context/OrderContext";
import Link from "next/link";
import PDFViewer from "@/components/PDFViewer";

export default function AdminDashboard() {
  const { orders, inventory, updateOrderStatus, updatePaymentStatus, updateInventory, assignVendor, clearOrders } = useOrders();
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "vendors">("orders");
  const [selectedOrderForPreview, setSelectedOrderForPreview] = useState<Order | null>(null);
  const [vendorForm, setVendorForm] = useState<{ orderId: string; name: string; cost: number } | null>(null);

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
            Inventory
          </button>
          <button 
            onClick={() => setActiveTab("vendors")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "vendors" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            Vendors
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
                            <p className="font-black text-[10px] text-primary mb-1">{order.id}</p>
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
                        <td className="px-6 py-4 font-black text-[10px] text-primary">{order.id}</td>
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

      {/* PDF Viewer Modal - Requires manual file handling as we can't store actual Files in LocalStorage */}
      {selectedOrderForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background w-full max-w-lg rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-black">Local Development Notice</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              In this local environment, actual document binary data is not persisted to LocalStorage for performance. 
              Real PDF previews will be enabled once we integrate with **Firebase Storage** in Phase 4.
            </p>
            <button 
              onClick={() => setSelectedOrderForPreview(null)}
              className="btn-primary w-full"
            >
              Continue Development
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

