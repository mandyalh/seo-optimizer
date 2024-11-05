import React from 'react';

interface TopWordsProps {
  words: Array<{ word: string; count: number }>;
}

export default function TopWords({ words }: TopWordsProps) {
  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Top Words</h3>
      <div className="space-y-2">
        {words.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span>{item.word}</span>
            <span className="font-semibold">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}