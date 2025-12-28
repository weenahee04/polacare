import React from 'react';
import { Brain, Cpu, Database, GitBranch, Zap, PieChart, TrendingUp, BarChart3 } from 'lucide-react';
import { LearnedConcept, NodeType } from '../types';

interface AIBrainViewProps {
  knowledge: LearnedConcept[];
  onClose: () => void;
}

export const AIBrainView: React.FC<AIBrainViewProps> = ({ knowledge, onClose }) => {
  // Stats Calculation
  const totalConcepts = knowledge.length;
  const level = Math.floor(totalConcepts / 5) + 1;
  const nextLevelProgress = (totalConcepts % 5) / 5 * 100;
  
  // Distribution Calculation
  const typeCounts = knowledge.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<NodeType, number>);

  const types: NodeType[] = ['symptom', 'disease', 'medicine', 'location', 'other'];
  
  // Find most frequent type (Dominant Topic)
  let mostFrequentType = 'None';
  let maxCount = 0;
  Object.entries(typeCounts).forEach(([type, count]) => {
     const val = count as number;
     if (val > maxCount) {
       maxCount = val;
       mostFrequentType = type;
     }
  });

  const getPercentage = (count: number) => totalConcepts === 0 ? 0 : Math.round((count / totalConcepts) * 100);

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-slate-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white px-5 py-4 shadow-sm border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-50 p-2 text-[#0056b3]">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-kanit">สถานะการเรียนรู้ (AI Brain)</h2>
            <p className="text-xs text-slate-500 font-kanit">Development Dashboard</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-sm font-medium text-slate-400 hover:text-slate-600 font-kanit"
        >
          ปิด (Close)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
        
        {/* Level Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 text-white shadow-lg">
          <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-500/20 blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-200 uppercase tracking-wider font-kanit">Current Intelligence Level</p>
              <h1 className="text-4xl font-bold font-kanit mt-1">LV. {level}</h1>
            </div>
            <div className="h-14 w-14 rounded-full border-4 border-blue-500/30 flex items-center justify-center bg-white/5 backdrop-blur-sm">
               <Zap className="h-6 w-6 text-yellow-400 fill-current" />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-kanit text-slate-300">
              <span>XP Progress</span>
              <span>{totalConcepts} / {level * 5} Concepts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 transition-all duration-500"
                style={{ width: `${nextLevelProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Insight Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
               <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Dominant Topic</span>
               </div>
               <div>
                 <p className="text-lg font-bold text-slate-800 font-kanit capitalize truncate leading-none mb-1">
                    {mostFrequentType === 'None' ? '-' : mostFrequentType}
                 </p>
                 <p className="text-[10px] text-slate-500 font-kanit">Most frequent data type</p>
               </div>
            </div>
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
               <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Session Velocity</span>
               </div>
               <div>
                  <p className="text-lg font-bold text-slate-800 font-kanit leading-none mb-1">
                    +{knowledge.length} <span className="text-xs font-normal text-slate-400">nodes</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-kanit">Learned this session</p>
               </div>
            </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
               <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                 <PieChart className="h-4 w-4" />
               </div>
               <h3 className="font-bold text-slate-700 font-kanit text-sm">การกระจายตัวของข้อมูล (Distribution)</h3>
            </div>
            
            <div className="space-y-4">
               {types.map(type => {
                 const count = typeCounts[type] || 0;
                 const pct = getPercentage(count);
                 
                 // Show at least placeholders if empty to show structure, or hide if desired. 
                 // Here we hide if 0 to keep it clean, unless total is 0 then show empty msg below.
                 if (pct === 0 && totalConcepts > 0) return null; 
                 
                 return (
                   <div key={type}>
                      <div className="flex justify-between text-xs font-kanit mb-1.5">
                         <span className="capitalize text-slate-600 flex items-center gap-2 font-medium">
                            <span className={`w-2 h-2 rounded-full ${getTypeColorDot(type)}`}></span>
                            {type}
                         </span>
                         <span className="text-slate-400 font-medium">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                         <div 
                           className={`h-full rounded-full ${getTypeColorBar(type)} transition-all duration-1000 ease-out`} 
                           style={{ width: `${pct}%` }}
                         ></div>
                      </div>
                   </div>
                 )
               })}
               {totalConcepts === 0 && (
                 <div className="text-center py-6">
                   <p className="text-xs text-slate-400 font-kanit">รอข้อมูลจากการเรียนรู้ (Waiting for data...)</p>
                 </div>
               )}
            </div>
        </div>

        {/* Knowledge Stream */}
        <div>
           <div className="flex items-center justify-between mb-4 mt-2">
             <h3 className="font-bold text-slate-700 font-kanit flex items-center gap-2 text-sm">
               <Database className="h-4 w-4 text-[#0056b3]" />
               สิ่งที่เรียนรู้ล่าสุด (Recent Knowledge)
             </h3>
             <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
                TOTAL: {totalConcepts}
             </span>
           </div>

           <div className="space-y-3">
             {knowledge.length === 0 ? (
               <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-white/50">
                  <Cpu className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-kanit">ยังไม่มีข้อมูลการเรียนรู้ (No data learned yet)</p>
                  <p className="text-xs text-slate-400 font-kanit mt-1">กดปุ่ม "Train AI" ในหน้ากราฟเพื่อสอนระบบ</p>
               </div>
             ) : (
               knowledge.slice().reverse().map((item, idx) => (
                 <div key={`${item.id}-${idx}`} className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm border border-slate-100 animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                   <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${getTypeColorDot(item.type)}`}></div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start">
                       <h4 className="font-bold text-slate-700 text-sm font-kanit truncate">{item.label}</h4>
                       <span className="text-[10px] text-slate-400 font-inter">{new Date(item.learnedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                     <p className="text-xs text-slate-500 font-kanit mt-0.5 flex items-center gap-1">
                        <span className="opacity-70">Category:</span> 
                        <span className="capitalize font-medium">{item.type}</span>
                     </p>
                     <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 inline-flex px-2 py-0.5 rounded">
                        <GitBranch className="h-3 w-3" />
                        Source: {item.sourceInteraction}
                     </div>
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

const getTypeColorDot = (type: NodeType) => {
  switch (type) {
    case 'symptom': return 'bg-orange-500';
    case 'disease': return 'bg-red-500';
    case 'medicine': return 'bg-green-500';
    case 'location': return 'bg-blue-500';
    default: return 'bg-slate-400';
  }
};

const getTypeColorBar = (type: NodeType) => {
  switch (type) {
    case 'symptom': return 'bg-orange-500';
    case 'disease': return 'bg-red-500';
    case 'medicine': return 'bg-green-500';
    case 'location': return 'bg-blue-500';
    default: return 'bg-slate-400';
  }
};