import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Define response types
export interface TaskSuggestion {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  isUrgent?: boolean;
  isImportant?: boolean;
  dueDate?: string;
}

export interface GeminiResponse {
  suggestions: TaskSuggestion[];
  explanation?: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private apiKey: string;

  constructor(apiKey: string = import.meta.env.VITE_GEMINI_API_KEY) {
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateTaskSuggestions(
    prompt: string,
    existingTasks: any[] = [],
    count: number = 3
  ): Promise<GeminiResponse> {
    try {
      const generationConfig = {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const formattedPrompt = this.formatPrompt(prompt, existingTasks, count);

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: formattedPrompt }] }],
        generationConfig,
        safetySettings,
      });

      const response = result.response;
      const text = response.text();
      
      // Parse the JSON response
      try {
        // Find JSON content between triple backticks if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) ||
                        [null, text];
                        
        const jsonText = jsonMatch[1];
        return JSON.parse(jsonText) as GeminiResponse;
      } catch (error) {
        console.error('Failed to parse Gemini response:', error);
        // Return a default response if parsing fails
        return {
          suggestions: [{
            title: 'Error parsing suggestions',
            description: 'Try a different prompt or contact support if this persists.',
            priority: 'medium',
            category: 'other'
          }],
          explanation: 'Could not parse AI response properly.'
        };
      }
    } catch (error) {
      console.error('Error generating task suggestions:', error);
      throw error;
    }
  }

  private formatPrompt(prompt: string, existingTasks: any[], count: number): string {
    // Construct a context-aware prompt
    return `
You are an AI assistant integrated into a todo app. The user is asking for help with task suggestions.

USER PROMPT: "${prompt}"

${existingTasks.length > 0 ? `
EXISTING TASKS (for context):
${JSON.stringify(existingTasks.slice(0, 10), null, 2)}
` : ''}

Based on the user's request${existingTasks.length > 0 ? ' and their existing tasks' : ''}, generate ${count} task suggestions.

Your response must be valid JSON that follows this structure exactly:
{
  "suggestions": [
    {
      "title": "Task title",
      "description": "Task description (optional)",
      "priority": "high|medium|low",
      "category": "work|personal|shopping|health|other",
      "isUrgent": true|false,
      "isImportant": true|false,
      "dueDate": "YYYY-MM-DD" (optional)
    }
  ],
  "explanation": "Brief explanation of your suggestions (optional)"
}

Ensure each suggestion is practical, specific, and actionable. Do not include any explanatory text outside of the JSON response.
`;
  }
}

export default new GeminiService(); 