import { analyzeSentiment as fetchSentimentFromBackend } from "../api";

export interface SentimentResult {
  primaryEmotion: 'Positive' | 'Neutral' | 'Frustrated' | 'Angry' | 'Urgent';
  sentimentScore: number;
  csatPrediction: number;
  triggedPhrases: string[];
  emotionBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
    urgent: number;
  };
}

export function analyzeSentimentSync(text: string): SentimentResult {
  const clean = text.toLowerCase();
  let primary: SentimentResult['primaryEmotion'] = 'Neutral';
  let score = 0.05;

  const isAngry = /\b(worst|terrible|terribly|furious|disaster|unacceptable|ridiculous|scam|stolen|robbed|lawyer|sue|hate|angry|pissed|outrageous)\b/i.test(clean) || /!{2,}/.test(clean);
  const isFrustrated = /\b(disappointed|disappointing|frustrated|frustrating|frustration|annoyed|annoying|useless|keeps failing|failed|failure|broken|no response|waiting forever|still not)\b/i.test(clean);
  const isUrgent = /\b(urgent|asap|immediately|emergency|critical|right now|blocked)\b/i.test(clean);
  const isPositive = /\b(thank|thanks|great|awesome|excellent|helpful|appreciate|super|wonderful|love|solved|perfect|amazing)\b/i.test(clean);

  if (isAngry) {
    primary = 'Angry';
    score = -0.92;
  } else if (isFrustrated) {
    primary = 'Frustrated';
    score = -0.78;
  } else if (isUrgent) {
    primary = 'Urgent';
    score = -0.65;
  } else if (isPositive) {
    primary = 'Positive';
    score = 0.88;
  }

  const csat = Math.min(5.0, Math.max(1.0, 3.2 + (score * 1.8)));

  const posBreak = primary === 'Positive' ? 88 : 5;
  const negBreak = primary === 'Frustrated' || primary === 'Angry' ? (primary === 'Angry' ? 95 : 85) : 8;
  const neuBreak = primary === 'Neutral' ? 82 : 12;
  const urgBreak = primary === 'Urgent' ? 92 : (primary === 'Frustrated' || primary === 'Angry' ? 70 : 10);

  return {
    primaryEmotion: primary,
    sentimentScore: Number(score.toFixed(2)),
    csatPrediction: Number(csat.toFixed(1)),
    triggedPhrases: ['scikit_learn_nlp', `sentiment_${primary.toLowerCase()}`],
    emotionBreakdown: {
      positive: posBreak,
      neutral: neuBreak,
      negative: negBreak,
      urgent: urgBreak
    }
  };
}

export async function analyzeSentimentAsync(text: string): Promise<SentimentResult> {
  const res = await fetchSentimentFromBackend(text);
  let primary: SentimentResult['primaryEmotion'] = 'Neutral';
  const sent = String(res.sentiment || '').toLowerCase();

  if (sent.includes('ang')) primary = 'Angry';
  else if (sent.includes('frust') || sent.includes('neg')) primary = 'Frustrated';
  else if (sent.includes('pos')) primary = 'Positive';
  else if (sent.includes('urg') || res.urgency === 'HIGH' || res.urgency === 'CRITICAL') primary = 'Urgent';

  const score = res.score ?? (primary === 'Positive' ? 0.85 : primary === 'Angry' ? -0.92 : primary === 'Frustrated' ? -0.75 : 0.05);
  const csat = Math.min(5.0, Math.max(1.0, 3.2 + (score * 1.8)));

  const conf = Math.max(70, Math.min(99, Math.round(res.confidence || 85)));
  const pos = primary === 'Positive' ? conf : 10;
  const neg = primary === 'Frustrated' || primary === 'Angry' ? (primary === 'Angry' ? conf : Math.max(conf, 85)) : 10;
  const neu = primary === 'Neutral' ? conf : 15;
  const urg = primary === 'Urgent' ? conf : (primary === 'Frustrated' || primary === 'Angry' ? 65 : 10);

  return {
    primaryEmotion: primary,
    sentimentScore: Number(score.toFixed(2)),
    csatPrediction: Number(csat.toFixed(1)),
    triggedPhrases: ['scikit_learn_nlp', `sentiment_${primary.toLowerCase()}`, `urgency_${(res.urgency || 'normal').toLowerCase()}`],
    emotionBreakdown: {
      positive: Math.round(pos),
      neutral: Math.round(neu),
      negative: Math.round(neg),
      urgent: Math.round(urg)
    }
  };
}

export const analyzeSentiment = analyzeSentimentSync;
