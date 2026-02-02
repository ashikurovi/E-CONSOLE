import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Globe,
  Grid,
  Menu,
  ChevronDown,
  Search,
  Upload,
  Image as ImageIcon,
  Crop,
  Check,
  Copy,
  Plus,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";

/**
 * Media Library Page
 * Premium Album/Collection View with Upload & Crop
 */
export default function MediaPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState("grid");

  // --- Upload Modal State ---
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState("select"); // select, crop, result
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Mock Album Data
  const [albums] = useState([
    {
      id: 1,
      title: "The Japan Cup",
      count: 34,
      images: [
        "https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?w=800&q=80",
        "https://images.unsplash.com/photo-1552880816-c146d6251249?w=800&q=80",
        "https://images.unsplash.com/photo-1629814234771-419b4c02222a?w=800&q=80",
      ],
    },
    {
      id: 2,
      title: "Galactic Gallop Classic",
      count: 14,
      images: [
        "https://images.unsplash.com/photo-1534068590799-09895a701e3e?w=800&q=80",
        "https://images.unsplash.com/photo-1566897587198-d703b0c952b9?w=800&q=80",
        "https://images.unsplash.com/photo-1537206140889-705b45281577?w=800&q=80",
      ],
    },
    {
      id: 3,
      title: "Enchanted Equine Extravaganza",
      count: 56,
      images: [
        "https://images.unsplash.com/photo-1547035970-d2932152a553?w=800&q=80",
        "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800&q=80",
        "https://images.unsplash.com/photo-1588056233519-5d259e836104?w=800&q=80",
      ],
    },
    {
      id: 4,
      title: "Celestial Sprint Showcase",
      count: 53,
      images: [
        "https://images.unsplash.com/photo-1535585102741-1e66953a1f1e?w=800&q=80",
        "https://images.unsplash.com/photo-1605218427368-35b0185e3362?w=800&q=80",
        "https://images.unsplash.com/photo-1553285991-4c74211f269c?w=800&q=80",
      ],
    },
  ]);

  // Reset state when modal closes
  const handleCloseModal = () => {
    setIsUploadOpen(false);
    setTimeout(() => {
      setUploadStep("select");
      setSelectedFile(null);
      setPreviewUrl(null);
      setGeneratedUrl(null);
      setZoom(1);
      setIsProcessing(false);
    }, 300);
  };

  // Handle File Selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUploadStep("crop");
    }
  };

  // Handle Crop & Generate (Simulated)
  const handleCropAndGenerate = async () => {
    setIsProcessing(true);

    // 1. Simulate Cropping (Draw to Canvas)
    if (imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      // Set canvas size (e.g., square crop)
      const size = 600;
      canvas.width = size;
      canvas.height = size;

      // Draw image centered and zoomed
      // Basic implementation: Source Center -> Destination Center
      const sWidth = img.naturalWidth;
      const sHeight = img.naturalHeight;
      const sMin = Math.min(sWidth, sHeight);

      // Calculate source crop area based on zoom
      // Zoom 1 = Full shortest side visible
      // Zoom 2 = Half of shortest side visible
      const cropSize = sMin / zoom;
      const sx = (sWidth - cropSize) / 2;
      const sy = (sHeight - cropSize) / 2;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // Draw
      ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);
    }

    // 2. Simulate Network Request
    setTimeout(() => {
      const mockId = Math.random().toString(36).substring(7);
      const mockUrl = `https://cdn.squadcart.com/media/uploads/img_${mockId}_optimized.jpg`;
      setGeneratedUrl(mockUrl);
      setUploadStep("result");
      setIsProcessing(false);
    }, 1500);
  };

  // Copy to Clipboard
  const handleCopyUrl = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      // Optional: Toast notification could be added here
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0b0f14] font-sans">
      {/* --- PREMIUM HEADER --- */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0b0f14]/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 lg:px-10 py-4 transition-all duration-300">
        <div className="flex items-center justify-between">
          {/* Left: Global Dropdown */}
          <div className="flex items-center gap-1 group cursor-pointer">
            <Globe className="w-5 h-5 text-[#5347CE]" />
            <span className="text-base font-bold text-[#5347CE]">Global</span>
            <ChevronDown className="w-4 h-4 text-[#5347CE] transition-transform group-hover:rotate-180" />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Upload Button */}
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="hidden sm:flex bg-gradient-to-r from-[#5347CE] to-[#16C8C7] hover:opacity-90 text-white rounded-full px-6 shadow-lg shadow-[#5347CE]/20 transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Media
            </Button>

            <div className="hidden md:flex items-center bg-gray-100 dark:bg-white/5 rounded-full px-4 py-2 border border-transparent focus-within:border-[#5347CE]/20 transition-all">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search albums..."
                className="bg-transparent border-none outline-none text-sm font-medium w-32 lg:w-48 text-gray-700 dark:text-gray-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-[#5347CE] border border-[#5347CE]/20 bg-[#5347CE]/5 transition-colors">
                <Grid className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-gray-500 transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- CONTENT GRID --- */}
      <main className="p-6 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {albums.map((album) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
            >
              {/* Collage Thumbnail */}
              <div className="aspect-[4/3] rounded-[24px] overflow-hidden bg-white dark:bg-white/5 p-1 flex gap-1 shadow-sm group-hover:shadow-2xl shadow-[#5347CE]/10 transition-all duration-500 border border-gray-100 dark:border-white/5">
                {/* Left Column (2 Stacked) */}
                <div className="flex flex-col gap-1 w-1/2">
                  <div className="h-1/2 w-full rounded-[16px] overflow-hidden">
                    <img
                      src={album.images[0]}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="h-1/2 w-full rounded-[16px] overflow-hidden relative">
                    <img
                      src={album.images[1]}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* Right Column (1 Large) */}
                <div className="w-1/2 rounded-[16px] overflow-hidden">
                  <img
                    src={album.images[2]}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Album Details */}
              <div className="mt-4 px-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#5347CE] transition-colors">
                      {album.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-400 mt-0.5">
                      {album.count} Photos
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* --- UPLOAD & CROP MODAL --- */}
      <Dialog open={isUploadOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white dark:bg-[#1a1f26] border-gray-100 dark:border-gray-800 rounded-3xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {uploadStep === "select" && (
                <>
                  <Upload className="w-5 h-5 text-[#5347CE]" /> Upload Media
                </>
              )}
              {uploadStep === "crop" && (
                <>
                  <Crop className="w-5 h-5 text-[#5347CE]" /> Edit & Crop
                </>
              )}
              {uploadStep === "result" && (
                <>
                  <Sparkles className="w-5 h-5 text-[#5347CE]" /> Ready to Use
                </>
              )}
            </DialogTitle>
          </div>

          {/* Body */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Select File */}
              {uploadStep === "select" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-10 bg-gray-50 dark:bg-black/20 hover:bg-[#5347CE]/5 dark:hover:bg-[#5347CE]/10 hover:border-[#5347CE]/30 transition-all cursor-pointer group"
                >
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center cursor-pointer w-full h-full"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#5347CE]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-8 h-8 text-[#5347CE]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      Drag & Drop or Click to Upload
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Support for JPG, PNG, WEBP
                    </p>
                  </label>
                </motion.div>
              )}

              {/* Step 2: Crop & Edit */}
              {uploadStep === "crop" && previewUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Crop Area */}
                  <div className="relative w-full aspect-square bg-black/5 dark:bg-black/50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-800">
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3 opacity-30">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-white/50"></div>
                      ))}
                    </div>

                    {/* Image */}
                    <img
                      ref={imageRef}
                      src={previewUrl}
                      alt="Crop Preview"
                      className="max-w-none transition-transform duration-200"
                      style={{
                        transform: `scale(${zoom})`,
                        maxHeight: "100%",
                        maxWidth: "100%",
                      }}
                    />

                    {/* Hidden Canvas for Processing */}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {/* Controls */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                      <span>Zoom</span>
                      <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#5347CE]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setUploadStep("select")}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCropAndGenerate}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-[#5347CE] to-[#16C8C7] hover:opacity-90 text-white min-w-[120px]"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Crop className="w-4 h-4 mr-2" />
                      )}
                      {isProcessing ? "Processing..." : "Crop & Save"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Result */}
              {uploadStep === "result" && generatedUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center text-center space-y-6 py-4"
                >
                  <div className="w-20 h-20 rounded-full bg-[#16C8C7]/10 flex items-center justify-center">
                    <Check className="w-10 h-10 text-[#16C8C7]" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Image Generated Successfully!
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                      Your image has been cropped, optimized, and is ready to
                      use.
                    </p>
                  </div>

                  <div className="w-full bg-gray-50 dark:bg-black/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                        Generated URL
                      </p>
                      <p className="text-sm font-medium text-[#16C8C7] truncate">
                        {generatedUrl}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={handleCopyUrl}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    className="w-full bg-gray-900 dark:bg-white dark:text-black text-white"
                    onClick={handleCloseModal}
                  >
                    Done
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
