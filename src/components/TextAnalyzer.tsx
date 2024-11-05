import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  LineChart,
  Brain,
  Download
} from 'lucide-react';
import AnalysisCard from './AnalysisCard';
import ContentVisualizer from './ContentVisualizer';
import { analyzeWithAI, type AIAnalysisResult } from '../utils/aiAnalysis';

export default function TextAnalyzer() {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('modern');
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleAnalyze = () => {
    try {
      if (!text.trim()) {
        setError('Please enter some text to analyze');
        return;
      }
      const result = analyzeWithAI(text);
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
      const element = document.getElementById('infographic-content');
      if (!element) throw new Error('Content element not found');
      
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = `text-analysis-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      setError('Failed to download infographic');
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Text Analysis & Infographic Generator
          </h1>
          <p className="text-lg text-gray-600">
            Transform your text into beautiful, AI-analyzed infographics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <textarea
              className="w-full h-64 p-4 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-6">
              <select
                className="px-4 py-2 border rounded-lg bg-white"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
                <option value="corporate">Corporate</option>
                <option value="creative">Creative</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-lg ${
                    chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`p-2 rounded-lg ${
                    chartType === 'pie' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  <PieChart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`p-2 rounded-lg ${
                    chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  <LineChart className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAnalyze}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Analyze Content
              </button>
            </div>
          </div>

          <div 
            id="infographic-content"
            className={`rounded-xl shadow-lg p-6 ${
              style === 'modern' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
              style === 'minimal' ? 'bg-gray-50' :
              style === 'corporate' ? 'bg-blue-600' :
              'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500'
            }`}
          >
            {analysis ? (
              <div className={`${style === 'minimal' ? 'text-gray-900' : 'text-white'}`}>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <AnalysisCard 
                    title="Content Structure" 
                    value={`${analysis.structure.paragraphs} paragraphs, ${analysis.structure.sections} sections`}
                  />
                  <AnalysisCard 
                    title="Readability" 
                    value={analysis.structure.readability} 
                  />
                </div>

                <ContentVisualizer 
                  analysis={analysis} 
                  style={style} 
                  chartType={chartType}
                />
                
                <div className="space-y-4 mb-4">
                  <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Main Theme</h3>
                    <p>{analysis.content.mainTheme}</p>
                  </div>

                  <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Key Points</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.content.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  {analysis.suggestions.length > 0 && (
                    <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-2">Suggestions</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  {isDownloading ? 'Generating...' : 'Download Infographic'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Brain className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg opacity-75">Enter text and click analyze to generate AI insights</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}