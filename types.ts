
import { LucideIcon } from 'lucide-react';

// Specific Data for each eye
export interface EyeExamData {
    visualAcuity: string;
    intraocularPressure: string;
    diagnosis: string;
    note?: string;
}

// User Profile Data
export interface UserProfile {
    name: string;
    hn: string;
    phoneNumber: string;
    avatarUrl?: string; // Base64 or URL
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth: string;
    weight: number;
    height: number;
    bmi: number;
}

// Core Data Model for a Clinical Case
export interface PatientCase {
  id: string;
  hn: string;
  patientName: string;
  date: Date;
  imageUrl: string;
  aiAnalysisText: string; // Used for General Notes
  checklist: MedicalChecklist;
  doctorNotes?: string;
  diagnosis: string; // Summary Diagnosis
  
  // New: Detailed Eye Data
  leftEye: EyeExamData;
  rightEye: EyeExamData;

  status: 'Draft' | 'Finalized';
}

export enum Tab {
  HOME = 'HOME',
  CARE = 'CARE',
  RECORDS = 'RECORDS',
  PROFILE = 'PROFILE'
}

// Knowledge Graph Types (Kept for AI visualization internals if needed)
export type NodeType = 'symptom' | 'disease' | 'medicine' | 'location' | 'other';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Flowchart Types
export type FlowchartNodeType = 'start' | 'process' | 'decision' | 'end';

export interface FlowchartNode {
  id: string;
  label: string;
  type: FlowchartNodeType;
}

export interface FlowchartEdge {
  source: string;
  target: string;
  label?: string; 
}

export interface FlowchartData {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

// Medical Checklist Types
export interface ChecklistItem {
  id: string;
  category: string; // e.g. "Cornea", "Lids"
  label: string; // e.g. "Keratic Precipitates"
  isObserved: boolean; // AI prediction
  isVerified: boolean; // Doctor confirmation (default false until clicked)
}

export interface MedicalChecklist {
  title: string;
  items: ChecklistItem[];
}

export interface RetinalAgeResult {
    predictedAge: number;
    actualAge: number;
    gap: number;
    confidence: number;
    riskFactors: string[];
    analysisText: string;
}

// UI Component Types

export interface QuickNavItem {
  id: number | string;
  label: string;
  icon: LucideIcon;
}

export interface RewardItem {
  id: number | string;
  title: string;
  category: string;
  imageUrl: string;
  points: number;
}

export interface LearnedConcept {
  id: string;
  label: string;
  type: NodeType;
  learnedAt: Date | string;
  sourceInteraction: string;
}

export interface EyeDropSchedule {
  id: string;
  medicineName: string;
  frequency: string;
  nextTime: string;
  taken: boolean;
  type: 'drop' | 'pill' | string;
}

export interface VisionTestResult {
  testName: string;
  date: Date;
  result: 'Normal' | 'Abnormal' | string;
  details: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  readTime: string;
  date: string;
}
