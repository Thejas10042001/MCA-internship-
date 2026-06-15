import React, { useRef, useState } from 'react';
import { Upload, FileType, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { SalesData } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DataUploadProps {
  onDataLoaded: (data: SalesData[]) => void;
}

export function DataUpload({ onDataLoaded }: DataUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const validatedData: SalesData[] = results.data.map((row: any) => ({
            orderId: row['Order ID'] || row.orderId || String(Math.random()),
            orderDate: row['Order Date'] || row.orderDate || new Date().toISOString(),
            shipDate: row['Ship Date'] || row.shipDate || '',
            shipMode: row['Ship Mode'] || row.shipMode || '',
            customerId: row['Customer ID'] || row.customerId || '',
            customerName: row['Customer Name'] || row.customerName || '',
            segment: row['Segment'] || row.segment || '',
            country: row['Country'] || row.country || '',
            city: row['City'] || row.city || '',
            state: row['State'] || row.state || '',
            postalCode: String(row['Postal Code'] || row.postalCode || ''),
            region: row['Region'] || row.region || '',
            productId: row['Product ID'] || row.productId || '',
            category: row['Category'] || row.category || '',
            subCategory: row['Sub-Category'] || row.subCategory || '',
            productName: row['Product Name'] || row.productName || '',
            sales: parseFloat(row['Sales'] || row.sales || 0),
            quantity: parseInt(row['Quantity'] || row.quantity || 0),
            discount: parseFloat(row['Discount'] || row.discount || 0),
            profit: parseFloat(row['Profit'] || row.profit || 0),
          }));

          if (validatedData.length === 0) throw new Error('No valid data found in CSV');
          
          setTimeout(() => {
            onDataLoaded(validatedData);
            setIsProcessing(false);
          }, 1500); // Simulate processing time for UX
        } catch (err: any) {
          setError('Failed to process data: ' + err.message);
          setIsProcessing(false);
        }
      },
      error: (err) => {
        setError('CSV Parsing error: ' + err.message);
        setIsProcessing(false);
      }
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-display italic font-bold mb-4">Ingest Enterprise Data</h2>
        <p className="text-white/40 max-w-lg mx-auto">
          Upload your retail transaction logs. NeuroForecast AI will automatically clean, 
          segment, and analyze your business performance using ensemble ML.
        </p>
      </div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "w-full max-w-2xl aspect-[16/9] glass-card flex flex-col items-center justify-center relative cursor-pointer group overflow-hidden transition-all duration-500",
          isDragging ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_40px_rgba(99,102,241,0.1)]" : "hover:border-white/20",
          isProcessing ? "pointer-events-none opacity-80" : ""
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <div className="text-center">
              <p className="font-medium text-lg mb-1">Building Feature Pipeline...</p>
              <p className="text-white/40 text-sm">Encoding categorical variables & handling outliers</p>
            </div>
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mt-2">
              <motion.div 
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-500">
              <Upload className="w-8 h-8 text-white/40 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="text-center px-8">
              <p className="text-xl font-medium mb-2">Drop your CSV dataset here</p>
              <p className="text-white/40 text-sm">or click to browse your file system</p>
            </div>
            
            {/* Background elements */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]"></div>
            </div>
          </>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        />
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl"
        >
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </motion.div>
      )}

      {/* Sample Data Integration Link */}
      <button 
        onClick={() => {
            const regionsList = ['East', 'West', 'Central', 'South'];
            const segmentsList = ['Consumer', 'Corporate', 'Home Office'];
            const categoryList = ['Technology', 'Office Supplies', 'Furniture'];
            const subCategoryMap: Record<string, string[]> = {
              'Technology': ['Phones', 'Copiers', 'Machines', 'Accessories'],
              'Office Supplies': ['Paper', 'Binders', 'Art', 'Appliances', 'Fasteners'],
              'Furniture': ['Chairs', 'Tables', 'Bookcases', 'Furnishings']
            };

            const sample = Array.from({ length: 180 }).map((_, i) => {
              const year = 2023 + Math.floor(i / 60); // 2023, 2024, 2025
              const month = Math.floor((i % 60) / 5); // 0 to 11
              const day = (i % 28) + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              const cat = categoryList[i % 3];
              const subCats = subCategoryMap[cat];
              const subCat = subCats[i % subCats.length];
              
              const reg = regionsList[i % 4];
              const seg = segmentsList[i % 3];
              
              const salesVal = 120 + Math.random() * 880 + (cat === 'Technology' ? 400 : 0);
              const discVal = Math.random() > 0.7 ? Math.random() * 0.15 : 0;
              const profitVal = salesVal * (0.25 + Math.random() * 0.1) - (discVal * salesVal * 0.5);

              return {
                orderId: `CA-${year}-${1000 + i}`,
                orderDate: dateStr,
                shipDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(Math.min(day + 3, 28)).padStart(2, '0')}`,
                shipMode: i % 2 === 0 ? 'Standard Class' : 'Second Class',
                customerId: `US-${10000 + i}`,
                customerName: `Acme Corp Unit ${i}`,
                segment: seg,
                country: 'United States',
                city: 'New York',
                state: 'New York',
                postalCode: '10001',
                region: reg,
                productId: `OFF-LA-${10000000 + i}`,
                category: cat,
                subCategory: subCat,
                productName: `${cat} Solution Pack ${i}`,
                sales: salesVal,
                quantity: Math.floor(Math.random() * 8) + 1,
                discount: discVal,
                profit: profitVal,
              };
            });
            onDataLoaded(sample as any);
        }}
        className="mt-8 text-indigo-400/60 hover:text-indigo-400 text-sm font-medium transition-colors"
      >
        Don't have a dataset? Use our sample retail data.
      </button>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-center">
        <div className="space-y-2">
            <div className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-2">Automated</div>
            <h4 className="font-semibold">Type Checking</h4>
            <p className="text-white/20 text-xs px-4">Instant validation of date formats and numerical consistency.</p>
        </div>
        <div className="space-y-2">
            <div className="text-purple-400 font-mono text-xs uppercase tracking-widest mb-2">Advanced</div>
            <h4 className="font-semibold">Feature Imputation</h4>
            <p className="text-white/20 text-xs px-4">Self-correcting algorithms for missing or outlier data segments.</p>
        </div>
        <div className="space-y-2">
            <div className="text-pink-400 font-mono text-xs uppercase tracking-widest mb-2">Secure</div>
            <h4 className="font-semibold">Bespoke Privacy</h4>
            <p className="text-white/20 text-xs px-4">Local-first parsing ensuring your enterprise leads remain internal.</p>
        </div>
      </div>
    </div>
  );
}
