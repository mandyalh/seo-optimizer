import nlp from 'compromise';

export interface AIAnalysisResult {
  structure: {
    paragraphs: number;
    sections: number;
    readability: 'easy' | 'moderate' | 'complex';
  };
  content: {
    mainTheme: string;
    subThemes: string[];
    keyPoints: string[];
  };
  style: {
    tone: string;
    voice: string;
    formality: 'formal' | 'neutral' | 'casual';
  };
  topics: Array<{ topic: string; relevance: number; context: string }>;
  suggestions: string[];
}

export function analyzeWithAI(text: string): AIAnalysisResult {
  if (!text?.trim()) {
    throw new Error('Invalid input: Text is required');
  }

  try {
    const doc = nlp(text);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    const sentences = doc.sentences().out('array');
    
    // Analyze document structure
    const sections = paragraphs.filter(p => 
      p.trim().split('\n')[0].match(/^[A-Z][\w\s]+:?$/m)
    ).length;

    // Calculate readability (simplified Flesch-Kincaid)
    const words = text.split(/\s+/).filter(w => w.trim());
    const syllables = words.join('').match(/[aeiou]+/gi)?.length || 0;
    const readabilityScore = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
    const readability = readabilityScore > 70 ? 'easy' : readabilityScore > 50 ? 'moderate' : 'complex';

    // Extract main theme and subthemes
    const nouns = doc.nouns().out('frequency') as Array<{ normal: string; count: number }>;
    const mainTheme = nouns[0]?.normal || 'General Content';
    const subThemes = nouns.slice(1, 4).map(n => n.normal);

    // Analyze key points
    const keyPoints = sentences
      .filter(s => s.includes('important') || s.includes('key') || s.includes('main') || s.includes('essential'))
      .slice(0, 3);

    // Extract topics with context
    const topics = nouns.slice(0, 5).map(({ normal, count }) => {
      const topicSentences = sentences.filter(s => s.toLowerCase().includes(normal.toLowerCase()));
      return {
        topic: normal,
        relevance: count / nouns.length,
        context: topicSentences[0] || ''
      };
    });

    // Analyze style
    const formalWords = doc.match('#Honorific|#Pronoun|#Conjunction').length;
    const casualWords = doc.match('#Slang|#Expression').length;
    const tone = formalWords > casualWords ? 'professional' : 'conversational';
    const voice = doc.match('#Passive').length > doc.match('#Active').length ? 'passive' : 'active';
    const formality = formalWords > words.length * 0.2 ? 'formal' 
      : casualWords > words.length * 0.1 ? 'casual' 
      : 'neutral';

    // Generate content-specific suggestions
    const suggestions = [];
    if (sections < 2 && paragraphs.length > 3) {
      suggestions.push('Consider adding clear section headers to improve structure');
    }
    if (keyPoints.length < 2) {
      suggestions.push('Consider highlighting key points more explicitly');
    }
    if (voice === 'passive' && formality !== 'formal') {
      suggestions.push('Consider using more active voice for better engagement');
    }
    if (readability === 'complex' && formality === 'casual') {
      suggestions.push('Content complexity might not match the casual tone');
    }

    return {
      structure: {
        paragraphs: paragraphs.length,
        sections,
        readability
      },
      content: {
        mainTheme,
        subThemes,
        keyPoints: keyPoints.length ? keyPoints : ['No explicit key points found']
      },
      style: {
        tone,
        voice,
        formality
      },
      topics,
      suggestions: suggestions.length ? suggestions : ['Content structure appears well-organized']
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze text');
  }
}