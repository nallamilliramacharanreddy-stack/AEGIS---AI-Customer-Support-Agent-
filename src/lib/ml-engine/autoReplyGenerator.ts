import { getAutoReply as fetchAutoReplyFromBackend } from "../api";
import { classifyTicketText } from "./intentClassifier";

export interface CandidateReply {
  id: string;
  tone: 'Professional' | 'Friendly' | 'Concise';
  matchConfidence: number;
  replyText: string;
  sourceArticles: string[];
  estimatedResolutionTime: string;
}

export function generateAutoRepliesSync(ticketText: string): CandidateReply[] {
  const classification = classifyTicketText(ticketText);

  return [
    {
      id: 'reply-1',
      tone: 'Professional',
      matchConfidence: classification.confidence,
      replyText: `Thank you for contacting Support. Regarding your query about '${ticketText.slice(0, 40)}...', we have matched your intent with our Knowledge Base and dispatched the appropriate resolution checklist.`,
      sourceArticles: ['KB-104: Payment & Order Resolution', 'KB-402: Account Security'],
      estimatedResolutionTime: '< 2 mins'
    },
    {
      id: 'reply-2',
      tone: 'Friendly',
      matchConfidence: Math.max(60, classification.confidence - 2.5),
      replyText: `Hi there! Thanks so much for writing in. We've processed your query using ML Intent Matching and configured a direct resolution for your request.`,
      sourceArticles: ['KB-201: Customer Support Portal'],
      estimatedResolutionTime: '< 3 mins'
    },
    {
      id: 'reply-3',
      tone: 'Concise',
      matchConfidence: Math.max(50, classification.confidence - 5.0),
      replyText: `Inquiry processed via ML TF-IDF Cosine Similarity engine. Solution dispatched. Contact support if further assistance is required.`,
      sourceArticles: ['KB-901: Automated Dispatch Logs'],
      estimatedResolutionTime: 'Instant'
    }
  ];
}

export async function generateAutoRepliesAsync(ticketText: string): Promise<CandidateReply[]> {
  const res = await fetchAutoReplyFromBackend(ticketText);

  if ((res as any).candidates && Array.isArray((res as any).candidates) && (res as any).candidates.length > 0) {
    return (res as any).candidates.map((c: any, idx: number) => ({
      id: `candidate-${idx + 1}`,
      tone: (c.tone || (idx === 0 ? "Professional" : idx === 1 ? "Friendly" : "Concise")) as CandidateReply["tone"],
      matchConfidence: Number(c.confidence || res.confidence),
      replyText: c.reply || c.replyText || res.auto_reply,
      sourceArticles: res.matched_query ? [`Knowledge Match: ${res.matched_query}`] : ['KB-104: Support Policy Repository'],
      estimatedResolutionTime: idx === 0 ? '< 1 min' : idx === 1 ? '< 2 mins' : 'Instant'
    }));
  }

  return [
    {
      id: 'reply-backend-1',
      tone: 'Professional',
      matchConfidence: res.confidence,
      replyText: res.auto_reply,
      sourceArticles: res.matched_query ? [`Matched Query: ${res.matched_query}`] : ['KB-104: Support Repository'],
      estimatedResolutionTime: '< 1 min'
    }
  ];
}

export const generateAutoReplies = generateAutoRepliesSync;
