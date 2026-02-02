import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Globe,
  Grid,
  Menu, // Use Menu as list view icon if LayoutList is unavailable, or stick to Grid/Menu logic
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
  Filter,
  LayoutGrid,
  LayoutList,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

/**
 * Media Library Page
 * Premium Album/Collection View with Upload & Crop
 */
export default function MediaPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");

  // --- Upload Modal State ---
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState("select"); // select, crop, result
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0); // Simulated processing progress
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Mock Album Data
  const [albums] = useState([
    {
      id: 1,
      title: "The Japan Cup",
      count: 34,
      date: "2024-03-15",
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
      date: "2024-02-28",
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
      date: "2024-01-10",
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
      date: "2023-12-05",
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
      setProgress(0);
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
    setProgress(10);

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
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // 2. Simulate Network Request
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      const mockId = Math.random().toString(36).substring(7);
      const mockUrl = `https://cdn.squadcart.com/media/uploads/img_${mockId}_optimized.jpg`;
      setGeneratedUrl(mockUrl);
      setUploadStep("result");
      setIsProcessing(false);
    }, 2000);
  };

  // Copy to Clipboard
  const handleCopyUrl = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      // Optional: Toast notification could be added here
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0b0f14] font-sans">
      {/* --- PREMIUM HEADER --- */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0b0f14]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800 px-6 lg:px-10 py-5 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Title & Global Scope */}
          <div className="flex items-center gap-4">
             <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
               Media Library
             </h1>
             <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
             <div className="flex items-center gap-2 group cursor-pointer bg-gray-100/50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-indigo-500/20">
               <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
               <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Global System</span>
               <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform group-hover:rotate-180" />
             </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden lg:flex items-center bg-white dark:bg-white/5 rounded-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 transition-all w-64">
              <Search className="w-4 h-4 text-gray-400 mr-2.5" />
              <input
                type="text"
                placeholder="Search collections..."
                className="bg-transparent border-none outline-none text-sm font-medium w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center p-1 bg-gray-100/80 dark:bg-white/5 rounded-full border border-gray-200/50 dark:border-gray-800">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-full transition-all duration-200 ${viewMode === "grid" ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-full transition-all duration-200 ${viewMode === "list" ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Button */}
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="bg-[#5347CE] hover:bg-[#463cb8] text-white rounded-full px-6 py-5 shadow-lg shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          </div>
        </div>
        
        {/* Sub-Header: Filters & Sort (Mobile friendly) */}
        <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" className="hidden sm:flex rounded-full border-gray-200 dark:border-gray-800 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5">
                     <Filter className="w-4 h-4 mr-2 text-gray-500" />
                     All Formats
                 </Button>
                 <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Showing <span className="text-gray-900 dark:text-white">4</span> albums
                 </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Sort by: <span className="text-indigo-600 dark:text-indigo-400">{sortBy === 'newest' ? 'Newest First' : 'Name'}</span>
                    <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    Newest First
                    {sortBy === "newest" && <Check className="w-3.5 h-3.5 ml-auto text-indigo-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                    Name (A-Z)
                    {sortBy === "name" && <Check className="w-3.5 h-3.5 ml-auto text-indigo-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("size")}>
                    Size
                    {sortBy === "size" && <Check className="w-3.5 h-3.5 ml-auto text-indigo-600" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>

      {/* --- CONTENT GRID --- */}
      <main className="p-6 lg:p-10 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {albums.map((album) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              {/* Card Container */}
              <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-2 shadow-sm border border-gray-100 dark:border-gray-800 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500">
                
                {/* Collage Thumbnail */}
                <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden bg-gray-100 dark:bg-white/5 flex gap-0.5">
                   
                    {/* Hover Overlay with Actions */}
                    <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-gray-900 p-2.5 rounded-full shadow-lg"
                        >
                            <Eye className="w-5 h-5" />
                        </motion.button>
                        <motion.button 
                             whileHover={{ scale: 1.1 }}
                             whileTap={{ scale: 0.95 }}
                             className="bg-white text-indigo-600 p-2.5 rounded-full shadow-lg"
                        >
                            <Edit2 className="w-5 h-5" />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-red-500 p-2.5 rounded-full shadow-lg"
                        >
                            <Trash2 className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Image Collage */}
                    <div className="flex flex-col gap-0.5 w-7/12 h-full">
                       <img src={album.images[0]} className="w-full h-full object-cover rounded-l-[16px]" alt="" />
                    </div>
                    <div className="flex flex-col gap-0.5 w-5/12 h-full">
                       <div className="h-1/2 w-full"><img src={album.images[1]} className="w-full h-full object-cover rounded-tr-[16px]" alt="" /></div>
                       <div className="h-1/2 w-full relative">
                           <img src={album.images[2]} className="w-full h-full object-cover rounded-br-[16px]" alt="" />
                           {/* Count Badge overlay on last image */}
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-br-[16px]">
                               <span className="text-white font-bold text-lg">+{album.count}</span>
                           </div>
                       </div>
                    </div>
                </div>

                {/* Album Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {album.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                     <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        {album.count} items
                     </p>
                     <span className="text-xs text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-800">
                        {album.date}
                     </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* --- PAGINATION --- */}
        <div className="mt-12 flex items-center justify-center gap-2">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-indigo-600">
                <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
                 {[1, 2, 3].map(page => (
                     <button
                        key={page}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                            page === 1 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                            : 'bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'
                        }`}
                     >
                         {page}
                     </button>
                 ))}
                 <span className="text-gray-400 px-1">...</span>
                 <button className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
                     12
                 </button>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-indigo-600">
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
      </main>

      {/* --- UPLOAD & CROP MODAL --- */}
      <Dialog open={isUploadOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden bg-white dark:bg-[#1a1f26] border-gray-100 dark:border-gray-800 rounded-[32px] shadow-2xl">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm">
            <div>
                 <DialogTitle className="text-xl font-bold flex items-center gap-2.5 text-gray-900 dark:text-white">
                    {uploadStep === "select" && <><Upload className="w-5 h-5 text-indigo-600" /> Upload Media</>}
                    {uploadStep === "crop" && <><Crop className="w-5 h-5 text-indigo-600" /> Edit & Crop</>}
                    {uploadStep === "result" && <><Sparkles className="w-5 h-5 text-indigo-600" /> Processed Successfully</>}
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400 mt-1">
                    {uploadStep === "select" && "Add new images to your collection"}
                    {uploadStep === "crop" && "Adjust your image before saving"}
                    {uploadStep === "result" && "Your media is ready to use"}
                </DialogDescription>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Select File */}
              {uploadStep === "select" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative"
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
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-[24px] h-64 bg-gray-50 dark:bg-black/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-md transition-all">
                            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Click or Drag to Upload
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                        Supports high-res JPG, PNG, WEBP up to 20MB
                        </p>
                    </div>
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
                  <div className="relative w-full aspect-[4/3] bg-black/5 dark:bg-black/50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-800">
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
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                     <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Zoom Level</span>
                         <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 px-2 py-0.5 rounded-md">{Math.round(zoom * 100)}%</span>
                     </div>
                     <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 mt-6">
                    <Button
                      variant="ghost"
                      onClick={() => setUploadStep("select")}
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCropAndGenerate}
                      disabled={isProcessing}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-lg shadow-indigo-500/20"
                    >
                      {isProcessing ? (
                        <>
                           <Loader2 className="w-4 h-4 animate-spin mr-2" />
                           Running AI...
                        </>
                      ) : (
                        <>
                           <Crop className="w-4 h-4 mr-2" />
                           Crop & Save
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Processing Progress Bar */}
                  {isProcessing && (
                      <div className="absolute inset-0 bg-white/90 dark:bg-[#1a1f26]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[32px]">
                          <div className="w-64 space-y-4">
                              <div className="flex justify-between text-sm font-medium">
                                  <span>Optimizing...</span>
                                  <span>{progress}%</span>
                              </div>
                              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                  <motion.div 
                                      className="h-full bg-indigo-600 rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${progress}%` }}
                                      transition={{ duration: 0.2 }}
                                  />
                              </div>
                          </div>
                      </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Result */}
              {uploadStep === "result" && generatedUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center text-center space-y-8 py-6"
                >
                  <div className="relative">
                       <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                       <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center shadow-lg relative z-10">
                            <Check className="w-12 h-12 text-white" />
                       </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                       Upload Complete
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                      Your image has been optimized, tagged, and added to the <span className="font-semibold text-gray-900 dark:text-gray-300">Global</span> collection.
                    </p>
                  </div>

                  <div className="w-full bg-gray-50 dark:bg-black/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
                        CDN ACCESS URL
                      </p>
                      <p className="text-sm font-mono font-medium text-indigo-600 dark:text-indigo-400 truncate">
                        {generatedUrl}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopyUrl}
                      className="shrink-0 h-10 w-10 rounded-xl"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    className="w-full bg-gray-900 dark:bg-white dark:text-black text-white h-12 text-base rounded-xl hover:scale-[1.02] transition-transform"
                    onClick={handleCloseModal}
                  >
                    Return to Library
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
