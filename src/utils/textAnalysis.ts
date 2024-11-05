export interface AnalysisResult {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  readingTime: number;
  topWords: Array<{ word: string; count: number }>;
}

export function analyzeText(text: string): AnalysisResult {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  const wordFreq = words.reduce((acc: Record<string, number>, word) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanWord.length > 0) {
      acc[cleanWord] = (acc[cleanWord] || 0) + 1;
    }
    return acc;
  }, {});

  const topWords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  return {
    wordCount: words.length,
    charCount: text.length,
    sentenceCount: sentences.length,
    readingTime: Math.ceil(words.length / 200),
    topWords
  };
}