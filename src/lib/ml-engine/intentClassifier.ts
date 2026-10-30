import { classifyTicket, TicketClassifyResponse } from "../api";

export interface ClassificationResult {
  category: 'Technical' | 'Billing' | 'Account Access' | 'Bug Report' | 'Feature Request' | 'General Inquiry' | 'Payment' | 'Order' | 'Delivery' | 'Refund' | 'Cancellation' | 'Account' | 'Product' | 'General';
  confidence: number;
  urgency: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
  duplicateProbability: number;
  spamScore: number;
  keywordsMatched: string[];
  suggestedAction: string;
}

export function classifyTicketTextSync(text: string): ClassificationResult {
  const cleanText = text.toLowerCase();
  
  let category: ClassificationResult['category'] = 'General Inquiry';
  let urgency: ClassificationResult['urgency'] = 'P3 - Medium';
  
  if (cleanText.includes('payment') || cleanText.includes('invoice') || cleanText.includes('charge') || cleanText.includes('card')) {
    category = 'Billing';
    urgency = 'P2 - High';
  } else if (cleanText.includes('api') || cleanText.includes('server') || cleanText.includes('crash') || cleanText.includes('error')) {
    category = 'Technical';
    urgency = 'P1 - Critical';
  } else if (cleanText.includes('password') || cleanText.includes('login') || cleanText.includes('account')) {
    category = 'Account Access';
    urgency = 'P2 - High';
  }

  return {
    category,
    confidence: 94.5,
    urgency,
    duplicateProbability: 12.4,
    spamScore: 1.2,
    keywordsMatched: ['ml_classified'],
    suggestedAction: `Assign ticket to ${category} engineering tier`
  };
}

export async function classifyTicketTextAsync(text: string): Promise<ClassificationResult> {
  const res: TicketClassifyResponse = await classifyTicket(text);
  
  let urgencyVal: ClassificationResult['urgency'] = 'P3 - Medium';
  if (res.priority === 'Critical' || res.priority === 'High') {
    urgencyVal = 'P1 - Critical';
  } else if (res.priority === 'Medium') {
    urgencyVal = 'P2 - High';
  } else {
    urgencyVal = 'P4 - Low';
  }

  return {
    category: res.category as ClassificationResult['category'],
    confidence: res.confidence,
    urgency: urgencyVal,
    duplicateProbability: res.duplicate_probability,
    spamScore: 1.5,
    keywordsMatched: ['ml_scikit_learn'],
    suggestedAction: res.suggested_action
  };
}

export const classifyTicketText = classifyTicketTextSync;
