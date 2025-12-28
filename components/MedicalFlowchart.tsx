import React, { useEffect, useState, useRef } from 'react';
import { FlowchartData, FlowchartNode, FlowchartNodeType } from '../types';
import { Loader2, GitMerge, CheckCircle, HelpCircle, ZoomIn, ZoomOut, RotateCcw, MousePointerClick, Brain, Save } from 'lucide-react';

interface MedicalFlowchartProps {
  data: FlowchartData;
  isLoading: boolean;
  onTrain?: () => void;
}

interface SimulationNode extends FlowchartNode {
  x: number;
  y: number;
  level: number;
}

export const MedicalFlowchart: React.FC<MedicalFlowchartProps> = ({ data, isLoading, onTrain }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<SimulationNode[]>([]);
  const [containerSize, setContainerSize] = useState({ width: window.innerWidth || 360, height: 0 });
  
  // Interactive States
  const [zoom, setZoom] = useState(1);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // 1. Measure Container Size
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 500
        });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateSize));
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // 2. Calculate Layout (Level-based tree layout)
  useEffect(() => {
    // Only calculate if we have data and nodes haven't been initialized or data changed significantly
    if (data.nodes.length === 0 || containerSize.width === 0) return;
    
    // Check if we already have these nodes to preserve positions during re-renders
    const currentIds = new Set(nodes.map(n => n.id));
    const newIds = new Set(data.nodes.map(n => n.id));
    const isSameData = nodes.length === data.nodes.length && [...newIds].every(id => currentIds.has(id));

    if (isSameData && nodes.length > 0) return;

    // Simple BFS for leveling
    const adjacency: Record<string, string[]> = {};
    const reverseAdjacency: Record<string, string[]> = {};
    
    data.edges.forEach(e => {
      if (!adjacency[e.source]) adjacency[e.source] = [];
      adjacency[e.source].push(e.target);
      
      if (!reverseAdjacency[e.target]) reverseAdjacency[e.target] = [];
      reverseAdjacency[e.target].push(e.source);
    });

    const levels: Record<string, number> = {};
    const visited = new Set<string>();
    
    // Find roots (nodes with no incoming edges)
    const roots = data.nodes.filter(n => !reverseAdjacency[n.id]);
    const startNodes = roots.length > 0 ? roots : [data.nodes[0]]; // Fallback

    const queue: {id: string, lvl: number}[] = startNodes.map(n => ({ id: n.id, lvl: 0 }));

    while(queue.length > 0) {
        const { id, lvl } = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);
        levels[id] = lvl;
        
        const neighbors = adjacency[id] || [];
        neighbors.forEach(nid => queue.push({ id: nid, lvl: lvl + 1 }));
    }

    // Group by level
    const levelGroups: Record<number, FlowchartNode[]> = {};
    let maxLevel = 0;
    data.nodes.forEach(n => {
        const lvl = levels[n.id] || 0;
        maxLevel = Math.max(maxLevel, lvl);
        if(!levelGroups[lvl]) levelGroups[lvl] = [];
        levelGroups[lvl].push(n);
    });

    // Assign X, Y
    const newNodes: SimulationNode[] = [];
    const levelHeight = 140;
    const paddingY = 80;
    
    Object.entries(levelGroups).forEach(([lvlStr, groupNodes]) => {
        const lvl = parseInt(lvlStr);
        const count = groupNodes.length;
        const availableWidth = containerSize.width;
        const spacingX = availableWidth / (count + 1);

        groupNodes.forEach((node, index) => {
            newNodes.push({
                ...node,
                level: lvl,
                x: spacingX * (index + 1),
                y: paddingY + (lvl * levelHeight)
            });
        });
    });

    setNodes(newNodes);
  }, [data, containerSize.width]);

  // Node Icon Helper
  const getNodeIcon = (type: FlowchartNodeType) => {
    switch (type) {
      case 'start': return <Brain className="h-5 w-5 text-white" />;
      case 'decision': return <HelpCircle className="h-5 w-5 text-white" />;
      case 'end': return <CheckCircle className="h-5 w-5 text-white" />;
      default: return <GitMerge className="h-5 w-5 text-slate-500" />;
    }
  };

  const getNodeStyle = (type: FlowchartNodeType) => {
    switch (type) {
      case 'start': return 'bg-blue-600 border-blue-700 shadow-blue-500/30';
      case 'decision': return 'bg-orange-500 border-orange-600 shadow-orange-500/30';
      case 'end': return 'bg-green-600 border-green-700 shadow-green-500/30';
      default: return 'bg-white border-slate-200 text-slate-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4 bg-slate-50 p-8 text-center animate-fade-in">
        <Loader2 className="h-10 w-10 text-[#0056b3] animate-spin" />
        <p className="text-sm text-slate-500 font-kanit">กำลังสร้างแผนผัง (Generating Flowchart)...</p>
      </div>
    );
  }

  if (data.nodes.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-slate-50">
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-4 border border-slate-100">
             <GitMerge className="h-10 w-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 font-kanit">ไม่มีข้อมูล Flowchart</h3>
        <p className="text-sm text-slate-500 font-kanit mt-2">อัปโหลดรูปภาพหรือสนทนาเพื่อสร้างแผนผังการวินิจฉัย</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-slate-50 touch-none">
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: 'linear-gradient(#0056b3 1px, transparent 1px), linear-gradient(90deg, #0056b3 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }}>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
          <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50">
              <ZoomIn className="h-5 w-5" />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50">
              <ZoomOut className="h-5 w-5" />
          </button>
      </div>

      {/* Canvas Layer */}
      <div 
        className="w-full h-full origin-top-left transition-transform duration-75"
        style={{ transform: `scale(${zoom})` }}
      >
        <svg className="absolute inset-0 h-full w-full pointer-events-none z-10 overflow-visible">
            <defs>
                <marker id="arrowhead-flow" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                </marker>
            </defs>
            {data.edges.map((edge, idx) => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (!source || !target) return null;

                // Bezier Curve
                const path = `M${source.x},${source.y} C${source.x},${source.y + 60} ${target.x},${target.y - 60} ${target.x},${target.y}`;

                return (
                    <g key={idx}>
                        <path 
                            d={path} 
                            fill="none" 
                            stroke="#cbd5e1" 
                            strokeWidth="2" 
                            markerEnd="url(#arrowhead-flow)"
                        />
                        {edge.label && (
                            <foreignObject x={(source.x + target.x)/2 - 30} y={(source.y + target.y)/2 - 15} width="60" height="30">
                                <div className="flex items-center justify-center">
                                    <span className="bg-white text-[10px] font-bold text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">
                                        {edge.label}
                                    </span>
                                </div>
                            </foreignObject>
                        )}
                    </g>
                );
            })}
        </svg>

        {nodes.map(node => (
            <div
                key={node.id}
                className="absolute flex flex-col items-center justify-center z-20 cursor-move"
                style={{
                    left: node.x,
                    top: node.y,
                    transform: 'translate(-50%, -50%)'
                }}
                onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDraggedNodeId(node.id);
                }}
                onPointerMove={(e) => {
                    if (draggedNodeId === node.id && containerRef.current) {
                        const rect = containerRef.current.getBoundingClientRect();
                        // Adjust for zoom when calculating position
                        const rawX = e.clientX - rect.left;
                        const rawY = e.clientY - rect.top;
                        
                        // Update node position directly in state for responsiveness
                        setNodes(prev => prev.map(n => {
                            if (n.id === node.id) {
                                return { ...n, x: rawX / zoom, y: rawY / zoom };
                            }
                            return n;
                        }));
                    }
                }}
                onPointerUp={(e) => {
                    setDraggedNodeId(null);
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }}
            >
                <div className={`
                    relative flex items-center justify-center h-12 w-12 rounded-xl border-2 shadow-lg transition-transform active:scale-95 hover:scale-105
                    ${getNodeStyle(node.type)}
                `}>
                    {getNodeIcon(node.type)}
                </div>
                <div className="mt-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-center min-w-[120px] max-w-[180px]">
                    <p className="text-xs font-bold text-slate-700 font-kanit leading-tight">{node.label}</p>
                </div>
            </div>
        ))}
      </div>

      {/* Train AI Button */}
      {data.nodes.length > 0 && onTrain && (
         <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40">
             <button 
               onClick={onTrain}
               className="flex items-center gap-2 px-6 py-3 bg-[#222222] text-white rounded-full shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition-all font-bold font-kanit"
             >
                <Save className="h-5 w-5 text-yellow-400" />
                <span>Save Logic to AI</span>
             </button>
         </div>
      )}
      
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur p-2 rounded-lg border border-slate-100 text-[10px] text-slate-400 font-kanit pointer-events-none">
          Drag nodes to rearrange • Pinch to zoom
      </div>

    </div>
  );
};