import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import type { SemanticAnalysis } from '../utils/semanticAnalysis';

interface InsightPanelProps {
  analysis: SemanticAnalysis;
}

export default function InsightPanel({ analysis }: InsightPanelProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Key Takeaways</h3>
        </div>
        <ul className="space-y-2">
          {analysis.insights.keyTakeaways.map((takeaway, index) => (
            <li key={index} className="text-sm">{takeaway}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Areas for Improvement</h3>
        </div>
        <ul className="space-y-2">
          {analysis.insights.gaps.map((gap, index) => (
            <li key={index} className="text-sm">{gap}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Content Strengths</h3>
        </div>
        <ul className="space-y-2">
          {analysis.insights.strengths.map((strength, index) => (
            <li key={index} className="text-sm">{strength}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}