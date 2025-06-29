import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface DocumentAnalysisContext {
  fileName: string;
  fileType: string;
  analysisResult?: any;
  riskScore?: number;
}

export async function generateDocumentResponse(
  userQuestion: string,
  documentContext: DocumentAnalysisContext
): Promise<string> {
  try {
    const systemPrompt = `You are an expert real estate document analyst specializing in HOA (Homeowners Association) documents. 
    
You help real estate professionals and homeowners understand complex HOA documents by providing clear, actionable insights.

DOCUMENT CONTEXT:
- File: ${documentContext.fileName}
- Type: ${documentContext.fileType}
- Risk Score: ${documentContext.riskScore || 'Not assessed'}/100
- Previous Analysis: ${JSON.stringify(documentContext.analysisResult || {})}

RESPONSE GUIDELINES:
1. Focus specifically on HOA-related topics: fees, violations, compliance, restrictions, insurance, maintenance
2. Provide practical, actionable advice
3. Highlight potential risks or concerns
4. Use simple language that non-lawyers can understand
5. If the question is outside HOA scope, redirect to relevant HOA aspects
6. Always reference the specific document when possible

RESPONSE FORMAT:
- Keep responses concise but comprehensive
- Use bullet points for multiple items
- Include specific recommendations when relevant
- Mention if additional documentation might be needed`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuestion }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I couldn't process your question. Please try asking about specific aspects of your HOA document.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate response. Please try again.");
  }
}

export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Create a short, descriptive title (max 6 words) for this HOA document question. Focus on the main topic."
        },
        { role: "user", content: firstMessage }
      ],
      max_tokens: 20,
      temperature: 0.5,
    });

    return response.choices[0].message.content?.trim() || "HOA Document Question";
  } catch (error) {
    console.error("Failed to generate chat title:", error);
    return "HOA Document Question";
  }
}