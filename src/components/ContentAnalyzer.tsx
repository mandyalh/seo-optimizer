import React, { useState } from 'react';
import { Brain, Download } from 'lucide-react';
import { analyzeSemantics, type SemanticAnalysis } from '../utils/semanticAnalysis';
import ConceptMap from './ConceptMap';
import InsightPanel from './InsightPanel';

export default function ContentAnalyzer() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<SemanticAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleAnalyze = () => {
    try {
      if (!text.trim()) {
        setError('Please enter some text to analyze');
        return;
      }
      const result = analyzeSemantics(text);
      setAnalysis(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze text');
      console.error('Analysis error:', err);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const element = document.getElementById('analysis-content');
      if (!element) throw new Error('Content element not found');
      
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = `content-analysis-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      setError('Failed to download analysis');
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Semantic Content Analysis
          </h1>
          <p className="text-lg text-white/80">
            Understand your content's structure, relationships, and insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <textarea
              className="w-full h-64 p-4 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste your content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={handleAnalyze}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Analyze Content
              </button>
            </div>
          </div>

          <div 
            id="analysis-content"
            className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 text-white"
          >
            {analysis ? (
              <div className="space-y-8">
                <ConceptMap analysis={analysis} theme="dark" />
                <InsightPanel analysis={analysis} />

                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  {isDownloading ? 'Generating...' : 'Download Analysis'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Brain className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg opacity-75">Enter content and click analyze to generate insights</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}