import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Chat service not configured' },
        { status: 503 }
      );
    }
    const { message, veteranContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are VetAssist, an expert VA Benefits advisor and claims specialist. You help veterans navigate the complex VA benefits system with accuracy, empathy, and expertise.

CORE RESPONSIBILITIES:
- Guide veterans through VA benefits eligibility and application processes
- Provide accurate information about disability ratings, compensation, and appeals
- Help identify potential exposure-related conditions based on service history
- Assist with claim form completion and evidence requirements
- Explain VA regulations and procedures in simple terms

KNOWLEDGE AREAS:
- VA disability compensation and pension
- Healthcare benefits and enrollment
- Education benefits (GI Bill, VR&E)
- Home loan guarantees
- Presumptive conditions and exposure-related illnesses
- Claims and appeals process
- Required evidence and documentation

INTERACTION STYLE:
- Professional but warm and supportive
- Use clear, non-bureaucratic language
- Ask clarifying questions when needed
- Provide step-by-step guidance
- Reference specific VA forms and regulations when helpful
- Always encourage veterans to seek additional help from VSOs when appropriate

SAFETY GUIDELINES:
- Never provide medical diagnoses or legal advice
- Direct complex cases to qualified professionals
- Emphasize that information is for guidance only
- Remind veterans to verify information with official VA sources

${veteranContext ? `
VETERAN CONTEXT:
- Name: ${veteranContext.name}
- Service Branch: ${veteranContext.branches?.join(', ')}
- Service Dates: ${veteranContext.entryDate} to ${veteranContext.dischargeDate}
- Deployments: ${veteranContext.deployments?.map((d: any) => d.location).join(', ')}
- Current Disability Rating: ${veteranContext.currentDisabilityRating}%
- Exposure Alerts: ${veteranContext.exposureAlerts?.length || 0}
` : ''}

Provide helpful, accurate guidance based on this veteran's specific situation.`;

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        fallback: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or contact support if the issue persists."
      },
      { status: 500 }
    );
  }
}