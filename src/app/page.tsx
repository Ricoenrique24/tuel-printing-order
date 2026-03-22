"use client";

import React, { useState } from "react";
import Link from "next/link";
import UploadSection from "@/components/UploadSection";
import PriceCalculator from "@/components/PriceCalculator";

export default function Home() {
  const [showCalculator, setShowCalculator] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState({ bw: 0, color: 0 });

  const handleAnalysisComplete = (result: any, file: File) => {
    setPageCount({ bw: result.bwCount, color: result.colorCount });
    setCurrentFile(file);
    setShowCalculator(true);
  };

  const handleReset = () => {
    setShowCalculator(false);
    setCurrentFile(null);
    setPageCount({ bw: 0, color: 0 });
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Abstract Background Element */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />

      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-black text-xl">
              T
            </div>
            <span className="text-2xl font-bold tracking-tight">Tuel Printing</span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
            <Link href="/track" className="hover:text-primary transition-colors">Track Order</Link>
            <Link href="/admin" className="hover:text-primary transition-colors">Admin Login</Link>
          </div>
          <button className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-all">
            Contact Support
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>New: AI-Powered Color Analysis</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
            Printing made <span className="text-primary italic">Smarter.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Upload your documents, get instant quotes, and automate your printing workflow with our next-gen ERP system.
          </p>
        </div>
      </section>

      {/* Upload & Calculator Section */}
      <section id="upload" className="px-6 pb-24 max-w-5xl mx-auto space-y-12">
        {!showCalculator ? (
          <UploadSection onAnalysisComplete={handleAnalysisComplete} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {currentFile && (
              <PriceCalculator 
                file={currentFile} 
                pageCount={pageCount} 
                onReset={handleReset}
              />
            )}
          </div>
        )}
      </section>

      {/* Footer (Simplified) */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2026 Tuel Printing Automation. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
