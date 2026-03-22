"use client";

import React, { useState, useCallback } from "react";
import { analyzeDocumentMock, AnalysisResult } from "@/lib/mock/analysis";

interface FileUploadProps {
  onAnalysisComplete: (result: AnalysisResult, file: File) => void;
}

const UploadSection: React.FC<FileUploadProps> = ({ onAnalysisComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeDocumentMock(selectedFile);
      onAnalysisComplete(result, selectedFile);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative premium-card border-2 border-dashed border-primary/30 p-12 text-center transition-all duration-500 hover:border-primary/60 hover:shadow-primary/10 ${
          isDragging ? "bg-primary/10 border-primary scale-[1.02] shadow-2xl shadow-primary/20" : ""
        }`}
      >
        <div className="space-y-4 pointer-events-none relative z-10">
          <div className="flex justify-center">
            <div className={`w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary transition-transform duration-500 ${isDragging ? 'scale-110 animate-pulse-glow' : 'animate-float'}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight">
              {isAnalyzing ? "Analyzing Document..." : selectedFile ? selectedFile.name : "Upload Your Document"}
            </h3>
            <div className="flex flex-col items-center">
              <p className="text-muted-foreground font-medium">
                {isAnalyzing 
                  ? "Checking colors and page counts..."
                  : selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : "Drag and drop your PDF/Docx here"}
              </p>
              {!selectedFile && !isAnalyzing && (
                <p className="text-primary text-xs font-black mt-3 uppercase tracking-widest px-4 py-1.5 rounded-full bg-primary/10 inline-block">or click to browse</p>
              )}
            </div>
          </div>
        </div>

        {/* Input Layer */}
        {!selectedFile && !isAnalyzing && (
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            onChange={handleFileChange}
            accept=".pdf,.docx"
          />
        )}

        {/* Action Layer */}
        {selectedFile && !isAnalyzing && (
          <div className="mt-6 flex flex-col items-center space-y-3 relative z-30">
            <button 
              onClick={handleAnalyze}
              className="btn-primary w-full md:w-auto"
            >
              Analyze Document
            </button>
            <button 
              onClick={() => setSelectedFile(null)}
              className="text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors"
            >
              Remove file
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="mt-6 flex justify-center relative z-30">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 glass rounded-lg">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Max Size</p>
          <p className="font-semibold text-primary">50 MB</p>
        </div>
        <div className="p-4 glass rounded-lg">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Formats</p>
          <p className="font-semibold text-primary">PDF, DOCX</p>
        </div>
        <div className="p-4 glass rounded-lg">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Analysis</p>
          <p className="font-semibold text-primary">Instant</p>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
