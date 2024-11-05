import nlp from 'compromise';

export interface SemanticAnalysis {
  structure: {
    complexity: 'basic' | 'intermediate' | 'advanced';
    flow: 'linear' | 'branching' | 'circular';
    coherence: number; // 0-1
  };
  semantics: {
    mainConcepts: string[];
    relationships: Array<{
      source: string;
      target: string;
      type: 'supports' | 'contrasts' | 'elaborates';
    }>;
    hierarchy: Array<{
      concept: string;
      level: number;
      children: string[];
    }>;
  };
  insights: {
    keyTakeaways: string[];
    gaps: string[];
    strengths: string[];
  };
}

export function analyzeSemantics(text: string): SemanticAnalysis {
  const doc = nlp(text);
  
  // Analyze text structure
  const sentences = doc.sentences().out('array');
  const complexity = calculateComplexity(sentences);
  const flow = determineFlow(sentences);
  const coherence = measureCoherence(sentences);

  // Extract semantic relationships
  const concepts = extractConcepts(doc);
  const relationships = findRelationships(doc, concepts);
  const hierarchy = buildConceptHierarchy(concepts, relationships);

  // Generate insights
  const insights = generateInsights(doc, concepts, relationships);

  return {
    structure: {
      complexity,
      flow,
      coherence
    },
    semantics: {
      mainConcepts: concepts,
      relationships,
      hierarchy
    },
    insights
  };
}

function calculateComplexity(sentences: string[]): 'basic' | 'intermediate' | 'advanced' {
  const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  if (avgLength < 10) return 'basic';
  if (avgLength < 20) return 'intermediate';
  return 'advanced';
}

function determineFlow(sentences: string[]): 'linear' | 'branching' | 'circular' {
  const transitions = sentences.filter(s => 
    s.toLowerCase().includes('however') || 
    s.toLowerCase().includes('moreover') ||
    s.toLowerCase().includes('therefore')
  ).length;

  if (transitions < sentences.length * 0.1) return 'linear';
  if (transitions < sentences.length * 0.2) return 'branching';
  return 'circular';
}

function measureCoherence(sentences: string[]): number {
  let coherenceScore = 0;
  for (let i = 1; i < sentences.length; i++) {
    const prev = sentences[i - 1].toLowerCase();
    const curr = sentences[i].toLowerCase();
    const prevWords = new Set(prev.split(' '));
    const currWords = new Set(curr.split(' '));
    const overlap = [...prevWords].filter(word => currWords.has(word)).length;
    coherenceScore += overlap / Math.max(prevWords.size, currWords.size);
  }
  return coherenceScore / (sentences.length - 1);
}

function extractConcepts(doc: any): string[] {
  const nouns = doc.nouns().out('frequency');
  const verbs = doc.verbs().out('frequency');
  const concepts = [...nouns, ...verbs]
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5)
    .map((item: any) => item.normal);
  return [...new Set(concepts)];
}

function findRelationships(doc: any, concepts: string[]): Array<{
  source: string;
  target: string;
  type: 'supports' | 'contrasts' | 'elaborates';
}> {
  const relationships = [];
  const sentences = doc.sentences().out('array');

  for (const sentence of sentences) {
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        if (sentence.toLowerCase().includes(concepts[i]) && 
            sentence.toLowerCase().includes(concepts[j])) {
          const type = determineRelationType(sentence);
          relationships.push({
            source: concepts[i],
            target: concepts[j],
            type
          });
        }
      }
    }
  }

  return relationships;
}

function determineRelationType(sentence: string): 'supports' | 'contrasts' | 'elaborates' {
  const lower = sentence.toLowerCase();
  if (lower.includes('but') || lower.includes('however') || lower.includes('although')) {
    return 'contrasts';
  }
  if (lower.includes('because') || lower.includes('therefore') || lower.includes('thus')) {
    return 'supports';
  }
  return 'elaborates';
}

function buildConceptHierarchy(
  concepts: string[], 
  relationships: Array<{source: string; target: string}>
): Array<{concept: string; level: number; children: string[]}> {
  const hierarchy = [];
  const edges = new Map<string, Set<string>>();

  // Build adjacency list
  for (const rel of relationships) {
    if (!edges.has(rel.source)) edges.set(rel.source, new Set());
    edges.get(rel.source)!.add(rel.target);
  }

  // Calculate levels and children
  for (const concept of concepts) {
    const children = [...(edges.get(concept) || [])];
    const level = calculateConceptLevel(concept, edges);
    hierarchy.push({ concept, level, children });
  }

  return hierarchy.sort((a, b) => a.level - b.level);
}

function calculateConceptLevel(
  concept: string, 
  edges: Map<string, Set<string>>, 
  visited = new Set<string>()
): number {
  if (visited.has(concept)) return 0;
  visited.add(concept);

  const children = edges.get(concept);
  if (!children || children.size === 0) return 0;

  return 1 + Math.max(...[...children].map(child => 
    calculateConceptLevel(child, edges, visited)
  ));
}

function generateInsights(
  doc: any, 
  concepts: string[], 
  relationships: Array<{source: string; target: string; type: string}>
): {
  keyTakeaways: string[];
  gaps: string[];
  strengths: string[];
} {
  const takeaways = [];
  const gaps = [];
  const strengths = [];

  // Generate key takeaways
  const mainConcepts = concepts.slice(0, 3);
  for (const concept of mainConcepts) {
    const relatedSentences = doc.sentences()
      .filter(s => s.toLowerCase().includes(concept))
      .out('array');
    if (relatedSentences.length > 0) {
      takeaways.push(relatedSentences[0]);
    }
  }

  // Identify gaps
  const conceptConnections = new Map<string, number>();
  for (const rel of relationships) {
    conceptConnections.set(rel.source, (conceptConnections.get(rel.source) || 0) + 1);
    conceptConnections.set(rel.target, (conceptConnections.get(rel.target) || 0) + 1);
  }

  for (const [concept, connections] of conceptConnections) {
    if (connections < 2) {
      gaps.push(`Limited exploration of "${concept}" and its relationships`);
    }
  }

  // Identify strengths
  const wellConnectedConcepts = [...conceptConnections.entries()]
    .filter(([_, count]) => count > 2)
    .map(([concept]) => concept);

  for (const concept of wellConnectedConcepts) {
    strengths.push(`Strong development of "${concept}" throughout the content`);
  }

  return {
    keyTakeaways: takeaways.length > 0 ? takeaways : ['No clear takeaways identified'],
    gaps: gaps.length > 0 ? gaps : ['No significant gaps identified'],
    strengths: strengths.length > 0 ? strengths : ['Content structure appears balanced']
  };
}