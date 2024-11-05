import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SemanticAnalysis } from '../utils/semanticAnalysis';

interface ConceptMapProps {
  analysis: SemanticAnalysis;
  theme: 'light' | 'dark';
}

export default function ConceptMap({ analysis, theme }: ConceptMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;
    
    // Create force simulation
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Prepare data
    const nodes = analysis.semantics.hierarchy.map(h => ({
      id: h.concept,
      level: h.level
    }));

    const links = analysis.semantics.relationships.map(r => ({
      source: r.source,
      target: r.target,
      type: r.type
    }));

    // Create SVG elements
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', theme === 'light' ? '#cbd5e0' : '#4a5568')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => d.type === 'elaborates' ? '5,5' : null);

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g');

    node.append('circle')
      .attr('r', d => 30 - d.level * 5)
      .attr('fill', theme === 'light' ? '#ebf8ff' : '#2c5282')
      .attr('stroke', theme === 'light' ? '#4299e1' : '#90cdf4')
      .attr('stroke-width', 2);

    node.append('text')
      .text(d => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', theme === 'light' ? '#2d3748' : '#fff')
      .style('font-size', '12px');

    // Update positions
    simulation
      .nodes(nodes as any)
      .on('tick', () => {
        link
          .attr('x1', d => (d.source as any).x)
          .attr('y1', d => (d.source as any).y)
          .attr('x2', d => (d.target as any).x)
          .attr('y2', d => (d.target as any).y);

        node
          .attr('transform', d => `translate(${(d as any).x},${(d as any).y})`);
      });

    (simulation.force('link') as d3.ForceLink<any, any>)
      .links(links);

  }, [analysis, theme]);

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Concept Relationships</h3>
      <svg
        ref={svgRef}
        width="100%"
        height="400"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}