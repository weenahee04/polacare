import React, { useEffect, useState, useRef } from 'react';
import { KnowledgeGraphData, NodeType, GraphNode } from '../types';
import { Activity, Pill, MapPin, AlertCircle, Circle, Share2, Network, Loader2, Sparkles, Brain } from 'lucide-react';

interface KnowledgeGraphProps {
  data: KnowledgeGraphData;
  isLoading: boolean;
  onTrain?: () => void;
}

// Extend GraphNode for physics simulation
interface SimulationNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NodeIcon: React.FC<{ type: NodeType, className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'symptom': return <Activity className={className} />;
    case 'disease': return <AlertCircle className={className} />;
    case 'medicine': return <Pill className={className} />;
    case 'location': return <MapPin className={className} />;
    default: return <Circle className={className} />;
  }
};

const getNodeColor = (type: NodeType) => {
  switch (type) {
    case 'symptom': return 'bg-orange-100 text-orange-600 border-orange-200';
    case 'disease': return 'bg-red-100 text-red-600 border-red-200';
    case 'medicine': return 'bg-green-100 text-green-600 border-green-200';
    case 'location': return 'bg-blue-100 text-blue-600 border-blue-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data, isLoading, onTrain }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [nodes, setNodes] = useState<SimulationNode[]>([]);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // 1. Measure Container Size (Responsive)
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateSize(); // Initial call
    
    const resizeObserver = new ResizeObserver(() => {
        // Wrap in animation frame to avoid resize loop limits
        requestAnimationFrame(updateSize);
    });
    
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [isLoading]); // Also check when loading state changes as content might shift

  // 2. Physics Simulation Engine
  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;
    
    // Clear nodes if data is empty
    if (data.nodes.length === 0) {
      if (nodes.length > 0) setNodes([]);
      return;
    }

    // Initialize or merge nodes
    const initialNodes: SimulationNode[] = data.nodes.map(n => {
      const existing = nodes.find(en => en.id === n.id);
      return {
        ...n,
        // If it exists, keep pos, otherwise spawn near center
        x: existing ? existing.x : dimensions.width / 2 + (Math.random() - 0.5) * 50,
        y: existing ? existing.y : dimensions.height / 2 + (Math.random() - 0.5) * 50,
        vx: existing ? existing.vx : 0,
        vy: existing ? existing.vy : 0,
      };
    });

    let currentNodes = initialNodes;
    let animationFrameId: number;
    let iterations = 0;
    const maxIterations = 600; 

    const simulate = () => {
      // Physics Constants - Tuned for Responsive Mobile
      // Ideal distance based on density
      const k = Math.sqrt((dimensions.width * dimensions.height) / (currentNodes.length + 1)) * 0.9; 
      const repulsion = 1200;
      const damping = 0.85;
      const centerStrength = 0.04;

      // 1. Repulsion
      for (let i = 0; i < currentNodes.length; i++) {
        for (let j = i + 1; j < currentNodes.length; j++) {
          const n1 = currentNodes[i];
          const n2 = currentNodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          let distSq = dx * dx + dy * dy;
          if (distSq === 0) distSq = 0.1;
          const dist = Math.sqrt(distSq);
          const force = repulsion / dist;
          
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (n1.id !== draggedNodeId) { n1.vx += fx * 0.05; n1.vy += fy * 0.05; }
          if (n2.id !== draggedNodeId) { n2.vx -= fx * 0.05; n2.vy -= fy * 0.05; }
        }
      }

      // 2. Attraction (Edges)
      data.edges.forEach(edge => {
        const source = currentNodes.find(n => n.id === edge.source);
        const target = currentNodes.find(n => n.id === edge.target);
        if (source && target) {
          const dx = source.x - target.x;
          const dy = source.y - target.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = (dist * dist) / k;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (source.id !== draggedNodeId) { source.vx -= fx * 0.05; source.vy -= fy * 0.05; }
          if (target.id !== draggedNodeId) { target.vx += fx * 0.05; target.vy += fy * 0.05; }
        }
      });

      // 3. Center Gravity & Bounds
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;
      const padding = 50;

      currentNodes.forEach(n => {
        if (n.id === draggedNodeId) {
          n.vx = 0; 
          n.vy = 0;
          return;
        }

        // Pull to center
        n.vx += (cx - n.x) * centerStrength;
        n.vy += (cy - n.y) * centerStrength;

        // Apply velocity
        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;

        // Keep inside box (Soft walls)
        if (n.x < padding) n.x += (padding - n.x) * 0.1;
        if (n.x > dimensions.width - padding) n.x += (dimensions.width - padding - n.x) * 0.1;
        if (n.y < padding) n.y += (padding - n.y) * 0.1;
        if (n.y > dimensions.height - padding) n.y += (dimensions.height - padding - n.y) * 0.1;
      });

      setNodes([...currentNodes]);
      
      iterations++;
      if (iterations < maxIterations) {
        animationFrameId = requestAnimationFrame(simulate);
      }
    };

    simulate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [data, dimensions.width, dimensions.height, draggedNodeId]);


  // --- Loading State UI ---
  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-6 bg-slate-50/90 backdrop-blur-sm p-8 text-center animate-fade-in relative z-50">
        <Loader2 className="h-12 w-12 text-[#0056b3] animate-spin" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-700 font-kanit">กำลังวิเคราะห์ (Analyzing)</h3>
          <p className="text-sm text-slate-500 font-kanit max-w-[240px] mx-auto leading-relaxed">
             กำลังเชื่อมโยง node...
          </p>
        </div>
      </div>
    );
  }

  // --- Empty State UI ---
  if (data.nodes.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-slate-50 z-40">
        <div className="mb-6 relative">
           <div className="absolute -inset-4 rounded-full bg-blue-50 opacity-50 blur-lg"></div>
           <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-100 transform rotate-3">
              <Share2 className="h-10 w-10 text-slate-300" />
           </div>
        </div>
        <h3 className="text-lg font-bold text-slate-700 font-kanit">ยังไม่มีข้อมูล (No Data)</h3>
        <div className="mt-3 space-y-1">
          <p className="text-sm text-slate-500 font-kanit">
             1. พิมพ์อาการหรือปัญหาสุขภาพในแชท
          </p>
          <p className="text-sm text-slate-500 font-kanit">
             2. กดปุ่มส่งข้อความ
          </p>
          <p className="text-sm text-slate-500 font-kanit">
             3. AI จะสร้างแผนภาพให้อัตโนมัติ
          </p>
        </div>
      </div>
    );
  }

  // --- Graph Visualization ---
  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-slate-50 cursor-move z-10 touch-none">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.05]" 
           style={{ 
             backgroundImage: 'radial-gradient(#0056b3 1.5px, transparent 1.5px)', 
             backgroundSize: '24px 24px' 
           }}>
      </div>

      <svg className="absolute inset-0 h-full w-full pointer-events-none z-0">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="24" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>
        
        {/* 1. Render All Lines First */}
        {data.edges.map((edge, i) => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return null;

          return (
            <line
              key={`line-${i}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* 2. Render All Labels Second (On top of lines) */}
        {data.edges.map((edge, i) => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return null;

          // Calculate center point for label
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;

          return (
            <foreignObject
              key={`label-${i}`}
              x={midX - 60}
              y={midY - 10}
              width="120"
              height="20"
              className="overflow-visible pointer-events-none"
            >
              <div className="flex h-full w-full items-center justify-center">
                 <div className="relative z-10 px-2.5 py-0.5 bg-white rounded-full border border-slate-200 shadow-md transition-all">
                    <span className="block text-[9px] font-bold text-slate-600 font-kanit uppercase tracking-wider text-center whitespace-nowrap">
                      {edge.relation}
                    </span>
                 </div>
              </div>
            </foreignObject>
          );
        })}
      </svg>

      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute flex flex-col items-center z-20 touch-none"
          style={{
            left: node.x,
            top: node.y,
            transform: 'translate(-50%, -50%)',
          }}
          onPointerDown={(e) => {
             e.currentTarget.setPointerCapture(e.pointerId);
             setDraggedNodeId(node.id);
          }}
          onPointerMove={(e) => {
             if (draggedNodeId === node.id && containerRef.current) {
                 const rect = containerRef.current.getBoundingClientRect();
                 node.x = e.clientX - rect.left;
                 node.y = e.clientY - rect.top;
                 // Reset velocity to prevent flinging
                 node.vx = 0;
                 node.vy = 0;
             }
          }}
          onPointerUp={(e) => {
             setDraggedNodeId(null);
             e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        >
          {/* Node Bubble */}
          <div className={`
             relative flex h-14 w-14 items-center justify-center rounded-full border-[3px] shadow-sm transition-transform active:scale-95 duration-200
             ${getNodeColor(node.type)} bg-white hover:scale-105
          `}>
             <NodeIcon type={node.type} className="h-6 w-6" />
             {/* Type Badge */}
             <div className="absolute -bottom-2.5 rounded-full bg-slate-800 px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider border-2 border-white shadow-sm">
               {node.type}
             </div>
          </div>
          
          {/* Label */}
          <div className="mt-3 flex flex-col items-center">
             <span className="rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md backdrop-blur-sm font-kanit whitespace-nowrap border border-slate-100 text-center max-w-[140px] leading-tight">
               {node.label}
             </span>
          </div>
        </div>
      ))}

      {/* Prominent Train AI Button */}
      {data.nodes.length > 0 && onTrain && !isLoading && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onTrain();
              }}
              className="group flex items-center gap-3 rounded-full bg-slate-900 px-8 py-4 text-white shadow-2xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all ring-4 ring-white/20 hover:ring-white/40"
            >
              <div className="relative">
                 <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400 opacity-75"></div>
                 <Brain className="relative h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
              <div className="flex flex-col items-start">
                 <span className="text-sm font-bold font-kanit leading-none">Train AI with Data</span>
                 <span className="text-[10px] font-medium text-slate-400 leading-none mt-1">Add {data.nodes.length} nodes to brain</span>
              </div>
            </button>
        </div>
      )}
    </div>
  );
};