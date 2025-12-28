
import { KnowledgeGraphData, FlowchartData, MedicalChecklist, RetinalAgeResult } from "../types";

// Static Service - No AI / API Calls

export const generateHealthAdvice = async (
  prompt: string, 
  onChunk: (text: string) => void
): Promise<string> => {
    const response = "Service unavailable. Please consult your doctor directly.";
    onChunk(response);
    return response;
};

export const generateArticleContent = async (title: string, category: string): Promise<string> => {
    // Static content replacement
    return `
    **${title}**

    **Introduction**
    Health is wealth. This article provides general information about ${category}. Maintaining good eye health is crucial for your overall well-being.
    
    **Key Symptoms & Facts**
    - Blurry vision
    - Eye strain
    - Dry eyes
    - Sensitivity to light
    
    **Prevention & Care**
    1. Rest your eyes every 20 minutes.
    2. Maintain proper lighting.
    3. Visit your ophthalmologist regularly.
    
    **Conclusion**
    Take care of your eyes today for a better vision tomorrow. Consult a specialist if symptoms persist.
    `;
};

export const generateRandomHealthQuestion = async (): Promise<string> => {
    return "วันนี้คุณดูแลสุขภาพดวงตาแล้วหรือยัง?";
};

export const extractKnowledgeGraph = async (conversationText: string): Promise<KnowledgeGraphData> => {
    return { nodes: [], edges: [] };
};

export const generateMedicalReport = async (checklist: MedicalChecklist): Promise<string> => {
    return "Report generation disabled.";
};

export const analyzeMedicalImage = async (base64Data: string, mimeType: string): Promise<{ 
    text: string, 
    graphData: KnowledgeGraphData, 
    flowchartData: FlowchartData,
    checklistData: MedicalChecklist
}> => {
    // Return empty/static structure
    return {
        text: "Image uploaded. Pending doctor review.",
        graphData: { nodes: [], edges: [] }, 
        flowchartData: { nodes: [], edges: [] },
        checklistData: { title: "Standard Exam", items: [] } 
    };
};

export const analyzeRetinalAge = async (base64Data: string, mimeType: string, actualAge: number): Promise<RetinalAgeResult | null> => {
    // Mock Delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate Result
    const predictedAge = actualAge + Math.floor(Math.random() * 5) - 2; // +/- 2 years
    const gap = predictedAge - actualAge;
    
    return {
        predictedAge: predictedAge,
        actualAge: actualAge,
        gap: gap,
        confidence: 0.92,
        riskFactors: gap > 3 ? ['High Blood Pressure signs', 'Arterial stiffening'] : ['None specific'],
        analysisText: gap > 3 
            ? "Based on the vessel density and tortuosity analysis, your retinal biological age appears slightly older than your chronological age. This can be an early indicator of cardiovascular strain."
            : "Great news! Your retinal vasculature structure appears healthy and consistent with your age group. No significant markers of accelerated aging were detected."
    };
}
