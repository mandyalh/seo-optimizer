import React from 'react';

interface AnalysisCardProps {
  icon: React.ReactNode;
  title: string;
  mainText: string;
  subText?: string;
}

export default function AnalysisCard({ icon, title, mainText, subText }: AnalysisCardProps) {
  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p>{mainText}</p>
      {subText && <p className="text-sm opacity-75 mt-1">{subText}</p>}
    </div>
  );
}