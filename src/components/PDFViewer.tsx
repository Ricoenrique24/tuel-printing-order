"use client";

import React from "react";

interface PDFViewerProps {
  url: string | null;
  fileName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, fileName, isOpen, onClose }) => {
  if (!isOpen || !url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-background w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border">
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-black text-xs">PDF</div>
            <h3 className="font-bold truncate max-w-md">{fileName || "Document Preview"}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 bg-secondary/10">
          <object
            data={url}
            type="application/pdf"
            className="w-full h-full"
          >
            <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h4 className="text-xl font-bold">Preview not available</h4>
              <p className="text-muted-foreground max-w-sm">Your browser doesn't support direct PDF viewing. You can download the file to view it.</p>
              <a 
                href={url} 
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Open PDF in New Tab
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

