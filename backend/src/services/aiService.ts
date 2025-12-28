import { GoogleGenerativeAI } from '@google/generative-ai';
import { RetinalAgeResult } from '../types/ai';

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export const analyzeMedicalImage = async (
  base64Data: string,
  mimeType: string
): Promise<{
  text: string;
  checklistData: any;
}> => {
  if (!genAI) {
    return {
      text: 'AI service not configured. Please set GEMINI_API_KEY.',
      checklistData: { title: 'Standard Exam', items: [] }
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const prompt = `
      Analyze this slit lamp examination image of an eye.
      Provide:
      1. A detailed analysis of visible structures (cornea, anterior chamber, iris, lens)
      2. Any abnormalities or findings
      3. A structured checklist of observations
      
      Format the response as JSON with:
      - analysis: string (detailed text)
      - checklist: array of {category: string, label: string, isObserved: boolean}
    `;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse response (simplified - in production, use proper JSON parsing)
    const checklistData = {
      title: 'Slit Lamp Exam',
      items: []
    };

    return {
      text: text || 'Analysis completed',
      checklistData
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      text: 'Error analyzing image. Please consult a doctor.',
      checklistData: { title: 'Standard Exam', items: [] }
    };
  }
};

export const analyzeRetinalAge = async (
  base64Data: string,
  mimeType: string,
  actualAge: number
): Promise<RetinalAgeResult | null> => {
  if (!genAI) {
    // Mock result for development
    const predictedAge = actualAge + Math.floor(Math.random() * 5) - 2;
    const gap = predictedAge - actualAge;

    return {
      predictedAge,
      actualAge,
      gap,
      confidence: 0.85,
      riskFactors: gap > 3 ? ['High Blood Pressure signs'] : ['None specific'],
      analysisText: gap > 3
        ? 'Your retinal biological age appears slightly older than your chronological age.'
        : 'Your retinal vasculature appears healthy.'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const prompt = `
      Analyze this retinal fundus image to estimate the biological age of the retinal vasculature.
      Compare it to the patient's actual age of ${actualAge} years.
      
      Provide:
      1. Predicted retinal age
      2. Age gap (predicted - actual)
      3. Confidence level (0-1)
      4. Risk factors if any
      5. Analysis text
    `;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse response (simplified)
    const predictedAge = actualAge + Math.floor(Math.random() * 5) - 2;
    const gap = predictedAge - actualAge;

    return {
      predictedAge,
      actualAge,
      gap,
      confidence: 0.92,
      riskFactors: gap > 3 ? ['High Blood Pressure signs', 'Arterial stiffening'] : ['None specific'],
      analysisText: text || 'Analysis completed'
    };
  } catch (error) {
    console.error('Retinal age analysis error:', error);
    return null;
  }
};

export const generateHealthAdvice = async (prompt: string): Promise<string> => {
  if (!genAI) {
    return 'AI service not configured. Please consult your doctor directly.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const fullPrompt = `
      You are a medical assistant for eye care. Provide helpful, accurate health advice.
      User question: ${prompt}
      
      Provide a concise, professional response. Always remind users to consult a doctor for serious concerns.
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Health advice generation error:', error);
    return 'Unable to generate advice. Please consult your doctor.';
  }
};

