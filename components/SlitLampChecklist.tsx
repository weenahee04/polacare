
import React, { useState, useEffect } from 'react';
import { MedicalChecklist, ChecklistItem } from '../types';
import { ClipboardCheck, Check, Save, ShieldCheck, Filter, AlertCircle, FileText } from 'lucide-react';

interface SlitLampChecklistProps {
  data: MedicalChecklist;
  isLoading: boolean;
  onSave?: (verifiedChecklist: MedicalChecklist) => void;
  readOnly?: boolean;
}

export const SlitLampChecklist: React.FC<SlitLampChecklistProps> = ({ data, isLoading, onSave, readOnly = false }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [showOnlyAbnormal, setShowOnlyAbnormal] = useState(false);

  useEffect(() => {
    if (data.items.length > 0) {
      setItems(data.items);
    }
  }, [data]);

  const toggleVerify = (id: string) => {
    if (readOnly) return;
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, isVerified: !item.isVerified };
      }
      return item;
    }));
  };

  const handleSaveInternal = () => {
    if (onSave) {
        onSave({ ...data, items });
    }
  };

  // Stats
  const verifiedCount = items.filter(i => i.isVerified).length;
  // 'isObserved' from legacy data can be treated as 'Findings Detected' if needed, or ignored for manual mode.
  const findingsCount = items.filter(i => i.isObserved || i.isVerified).length;

  // Filter Items
  const displayedItems = showOnlyAbnormal 
    ? items.filter(i => i.isObserved || i.isVerified) 
    : items;

  const groupedItems: Record<string, ChecklistItem[]> = displayedItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  if (items.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 min-h-[300px] border-2 border-dashed border-slate-200 rounded-xl">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
             <ClipboardCheck className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 font-kanit">Checklist Empty</h3>
        <p className="text-sm text-slate-500 font-kanit mt-1">No exam items to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
         <div>
             <h3 className="font-bold text-slate-800 font-kanit flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#0056b3]" />
                Clinical Findings
             </h3>
             <p className="text-xs text-slate-500 font-kanit">Examination Checklist</p>
         </div>
         <div className="flex gap-2">
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                <Check className="h-3 w-3" /> {verifiedCount} Checked
            </span>
         </div>
      </div>

      {/* Toolbar */}
      <div className="p-2 border-b border-slate-100 flex justify-end gap-2">
          <button 
             onClick={() => setShowOnlyAbnormal(!showOnlyAbnormal)}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-kanit transition-all ${showOnlyAbnormal ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:bg-slate-100'}`}
           >
              <Filter className="h-3 w-3" />
              {showOnlyAbnormal ? 'Findings Only' : 'Show All'}
           </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
        {Object.entries(groupedItems).map(([category, groupItems]) => (
          <div key={category} className="border border-slate-100 rounded-lg overflow-hidden">
            <div className="bg-slate-100/50 px-3 py-1.5 text-xs font-bold text-slate-600 font-kanit uppercase">
                {category}
            </div>
            <div className="divide-y divide-slate-50">
              {groupItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleVerify(item.id)}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                      item.isVerified ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                         h-5 w-5 rounded border flex items-center justify-center transition-all
                         ${item.isVerified ? 'bg-[#0056b3] border-[#0056b3] text-white' : 'border-slate-300 bg-white'}
                      `}>
                         <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium font-kanit ${item.isVerified ? 'text-[#0056b3]' : 'text-slate-700'}`}>
                          {item.label}
                        </span>
                        {/* Only show 'Abnormal' tag if explicitly marked as an observation in data (legacy) AND verified */}
                        {(item.isObserved && item.isVerified) && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 mt-0.5">
                            <AlertCircle className="h-3 w-3" /> Finding Detected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      {!readOnly && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
              <button 
                  onClick={handleSaveInternal}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0056b3] text-white rounded-lg font-bold font-kanit shadow-md hover:bg-blue-700 transition-colors text-sm"
              >
                  <Save className="h-4 w-4" />
                  Save Record
              </button>
          </div>
      )}
    </div>
  );
};
