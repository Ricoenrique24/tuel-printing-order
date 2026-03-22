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
          <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black shadow-lg shadow-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
            </div>
            <span className="text-2xl font-black tracking-tight">Tuel Printing</span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
            <Link href="/track" className="hover:text-primary transition-colors">Track Order</Link>
            <Link href="/admin" className="hover:text-primary transition-colors text-muted-foreground mr-4">Admin Portal</Link>
          </div>
          <button className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-bold hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-foreground/10 animate-in fade-in slide-in-from-right-4 duration-700">
            Contact Support
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest shadow-inner shadow-primary/10 animate-pulse-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            <span>AI-Powered Analysis Enabled</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1]">
            Automate your <br className="hidden md:block" />
            <span className="text-primary italic relative inline-block animate-float">
              printing workflow.
              <svg className="absolute w-full h-4 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg>
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Drag & drop your documents, get instant transparent quotes, and let our system handle the complex routing and tracking.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary py-4 px-8 text-lg flex items-center justify-center space-x-2 w-full sm:w-auto hover:scale-105 transition-transform group">
              <span>Start Printing</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <Link href="/admin" className="bg-secondary text-foreground py-4 px-8 rounded-xl font-bold flex items-center justify-center space-x-2 w-full sm:w-auto hover:bg-border transition-colors">
              <span>Open Admin Dashboard</span>
            </Link>
          </div>
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
