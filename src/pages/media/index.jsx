import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  Upload, 
  Download, 
  FolderPlus, 
  Filter, 
  LayoutGrid, 
  List, 
  Search, 
  MoreVertical,
  Scissors,
  Copy,
  Check,
  X,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

/**
 * Media Library Page
 * High-fidelity file manager for product images and assets.
 */
export default function MediaPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 });

  // Mock initial data
  const [files, setFiles] = useState([
    { id: 1, name: "Lily's Kitchen Puppy", url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop", size: "1.2 MB", type: "image/png" },
    { id: 2, name: "Edgard Cooper Lamb & Beef", url: "https://images.unsplash.com/photo-1589924691995-400dc9ecc109?w=800&auto=format&fit=crop", size: "850 KB", type: "image/jpeg" },
    { id: 3, name: "Healthy Chuu Snack", url: "https://images.unsplash.com/photo-1591768793355-74d7c80b0e9c?w=800&auto=format&fit=crop", size: "2.1 MB", type: "image/png" },
    { id: 4, name: "Purina Beneful Hugs", url: "https://images.unsplash.com/photo-1585837505235-ce2115591395?w=800&auto=format&fit=crop", size: "1.5 MB", type: "image/jpeg" },
    { id: 5, name: "Halo Purely For Pets", url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop", size: "3.4 MB", type: "image/png" },
    { id: 6, name: "Best Grain Free Dry Dog", url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&auto=format&fit=crop", size: "920 KB", type: "image/jpeg" },
    { id: 7, name: "Innovative Pet Food", url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop", size: "1.8 MB", type: "image/png" },
    { id: 8, name: "Arden Grange Adult", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop", size: "2.6 MB", type: "image/jpeg" },
  ]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newFile = {
        id: files.length + 1,
        name: file.name.split('.')[0],
        url: URL.createObjectURL(file),
        size: (file.size / 1024 / 1024).toFixed(1) + " MB",
        type: file.type
      };
      setFiles([newFile, ...files]);
      toast.success("Image uploaded successfully!");
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard!");
  };

  const openCrop = (file) => {
    setSelectedImage(file);
    setIsCropModalOpen(true);
  };

  const handleCropSave = () => {
    setIsCropModalOpen(false);
    toast.success("Image cropped and saved!");
  };

  return (
    <div className="p-6 lg:p-10 bg-white dark:bg-[#0b0f14] min-h-screen font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <h1 className="text-4xl font-extrabold text-[#0b121e] dark:text-white tracking-tight">Media Library</h1>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#0b121e]/60 dark:text-white/40">
            <span>Last Sync</span>
            <RefreshCw className="w-3.5 h-3.5 text-blue-500 cursor-pointer" />
          </div>
          <div className="bg-gray-50 dark:bg-white/5 py-3 px-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-sm font-bold text-[#0b121e] dark:text-white">
             {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="bg-gray-50/50 dark:bg-[#1a1f26]/40 p-3 rounded-[24px] border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
            <div className="bg-white dark:bg-[#0b0f14] border border-gray-200 dark:border-gray-700 h-12 px-6 rounded-2xl flex items-center gap-2 text-sm font-bold hover:shadow-lg transition-all active:scale-95">
              <Upload className="w-4 h-4 text-blue-500" />
              Upload
            </div>
          </label>
          <Button variant="ghost" className="h-12 px-6 rounded-2xl gap-2 font-bold dark:hover:bg-white/5">
            <Download className="w-4 h-4 text-gray-400 text-teal-500" />
            Download
          </Button>
          <Button variant="ghost" className="h-12 px-6 rounded-2xl gap-2 font-bold dark:hover:bg-white/5">
            <FolderPlus className="w-4 h-4 text-orange-500" />
            Create folder
          </Button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-6 pr-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0b0f14] outline-none text-sm font-medium focus:ring-2 focus:ring-blue-500/10" 
            />
          </div>
          <div className="h-12 w-px bg-gray-200 dark:bg-gray-700 hidden md:block" />
          <div className="flex items-center gap-1 bg-white dark:bg-[#0b0f14] p-1 rounded-xl border border-gray-200 dark:border-gray-700">
             <button 
               onClick={() => setViewMode("grid")}
               className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
             >
                <LayoutGrid className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setViewMode("list")}
               className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
             >
                <List className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Files</h2>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 cursor-pointer hover:text-blue-500 transition-colors">
                 Sort <Filter className="w-3 h-3" />
              </div>
           </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((file) => (
              <motion.div 
                key={file.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="group relative bg-gray-50/50 dark:bg-[#1a1f26]/20 rounded-[32px] p-4 border border-gray-100 dark:border-gray-800 transition-all cursor-pointer"
              >
                <div className="aspect-square rounded-[24px] overflow-hidden bg-white mb-4 relative shadow-sm">
                   <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openCrop(file); }}
                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0b121e] hover:scale-110 active:scale-95 transition-all shadow-xl"
                        title="Crop Image"
                      >
                         <Scissors className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); copyUrl(file.url); }}
                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0b121e] hover:scale-110 active:scale-95 transition-all shadow-xl"
                        title="Copy URL"
                      >
                         <Copy className="w-4 h-4" />
                      </button>
                   </div>
                </div>
                <div className="px-2 space-y-1">
                   <h3 className="text-xs font-black text-[#0b121e] dark:text-white truncate">{file.name}</h3>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{file.size}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a1f26]/40 rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <table className="w-full">
               <thead className="bg-gray-50/50 dark:bg-white/5">
                  <tr className="text-[10px] uppercase font-black text-gray-400 border-b border-gray-100 dark:border-gray-800">
                     <th className="px-8 py-5 text-left">Name</th>
                     <th className="px-8 py-5 text-left">Size</th>
                     <th className="px-8 py-5 text-left">Type</th>
                     <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((file) => (
                    <tr key={file.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                                <img src={file.url} className="w-full h-full object-cover" />
                             </div>
                             <span className="text-sm font-bold text-[#0b121e] dark:text-white">{file.name}</span>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-xs font-bold text-gray-400 tracking-widest">{file.size}</td>
                       <td className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{file.type.split('/')[1]}</td>
                       <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Button onClick={() => openCrop(file)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg"><Scissors className="w-4 h-4" /></Button>
                             <Button onClick={() => copyUrl(file.url)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg"><Copy className="w-4 h-4" /></Button>
                             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg"><MoreVertical className="w-4 h-4" /></Button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- CROP MODAL --- */}
      <AnimatePresence>
        {isCropModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-[#0b121e]/80 backdrop-blur-md" 
               onClick={() => setIsCropModalOpen(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-2xl bg-white dark:bg-[#1a1f26] rounded-[40px] shadow-2xl p-10 overflow-hidden"
             >
                <div className="flex justify-between items-center mb-10">
                   <div className="space-y-1">
                      <h2 className="text-2xl font-black text-[#0b121e] dark:text-white tracking-tight">Crop Your Image</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adjust the selection box to resize</p>
                   </div>
                   <button onClick={() => setIsCropModalOpen(false)} className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#0b121e] dark:hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="relative aspect-video bg-gray-100 dark:bg-[#0b0f14] rounded-3xl overflow-hidden mb-12 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                   {selectedImage && (
                     <>
                       <img src={selectedImage.url} alt="Crop preview" className="max-h-full max-w-full opacity-40 select-none" />
                       <div 
                         className="absolute border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] cursor-move"
                         style={{ 
                           left: `${cropArea.x}%`, 
                           top: `${cropArea.y}%`, 
                           width: `${cropArea.width}%`, 
                           height: `${cropArea.height}%` 
                         }}
                       >
                          {/* Resizing handles */}
                          <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                          <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 translate-x-1/2 -translate-y-1/2 rounded-full" />
                          <div className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 -translate-x-1/2 translate-y-1/2 rounded-full" />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 translate-x-1/2 translate-y-1/2 rounded-full" />
                          {/* Decorative Grid */}
                          <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-30">
                             {Array.from({ length: 9 }).map((_, i) => <div key={i} className="border-[0.5px] border-white/50" />)}
                          </div>
                          
                          <div className="absolute inset-0 overflow-hidden">
                             <img 
                               src={selectedImage.url} 
                               className="absolute max-w-none" 
                               style={{ 
                                 width: `${10000 / cropArea.width}%`,
                                 height: `${10000 / cropArea.height}%`,
                                 left: `${-cropArea.x * (100 / cropArea.width)}%`,
                                 top: `${-cropArea.y * (100 / cropArea.height)}%`,
                                 clipPath: 'content-box'
                               }} 
                             />
                          </div>
                       </div>
                     </>
                   )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                   <Button 
                     onClick={() => setIsCropModalOpen(false)}
                     variant="ghost" 
                     className="flex-1 h-14 rounded-2xl font-black text-[#0b121e] dark:text-white bg-gray-50 dark:bg-white/5 hover:bg-gray-100"
                   >
                      Cancel
                   </Button>
                   <Button 
                     onClick={handleCropSave}
                     className="flex-1 h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                   >
                      <Check className="w-5 h-5" />
                      Save Cropped Image
                   </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-20 pt-8 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
         <span>SquadCart Asset Manager v1.0</span>
         <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="text-[#0066ff]">Kanakku Engine</span>
         </div>
      </footer>
    </div>
  );
}
