/**
 * Mock utility to simulate document color analysis.
 * In a real scenario, this would call the Python backend on Google Cloud Run.
 */

export interface AnalysisResult {
  bwCount: number;
  colorCount: number;
  totalCount: number;
  processingTimeMs: number;
}

export const analyzeDocumentMock = async (file: File): Promise<AnalysisResult> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Pseudo-random results based on file size/name for deterministic demo feel
  const nameHash = file.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const totalPages = Math.floor((file.size / 1024 / 50) + (nameHash % 20)) + 5; // Simulating 5-50 pages
  
  // Randomly distribute between BW and Color (favoring BW for realism)
  const colorCount = Math.floor(Math.random() * (totalPages * 0.4));
  const bwCount = totalPages - colorCount;

  return {
    bwCount,
    colorCount,
    totalCount: totalPages,
    processingTimeMs: 1500 + Math.random() * 1000,
  };
};
