import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AIAnalysisResult } from '../utils/aiAnalysis';

interface ContentVisualizerProps {
  analysis: AIAnalysisResult;
  style: string;
  chartType: 'bar' | 'pie' | 'line';
}

export default function ContentVisualizer({ analysis, style, chartType }: ContentVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const data = analysis.topics;

    switch (chartType) {
      case 'pie': {
        const radius = Math.min(width, height) / 2;
        const arc = d3.arc()
          .innerRadius(radius * 0.6)
          .outerRadius(radius);

        const pie = d3.pie<any>()
          .value(d => d.relevance)
          .sort(null);

        const g = svg.append('g')
          .attr('transform', `translate(${width/2},${height/2})`);

        // Add topic labels
        const labelArc = d3.arc()
          .innerRadius(radius * 0.9)
          .outerRadius(radius * 0.9);

        const arcs = g.selectAll('.arc')
          .data(pie(data))
          .enter()
          .append('g')
          .attr('class', 'arc');

        arcs.append('path')
          .attr('d', arc as any)
          .attr('fill', (_, i) => d3.interpolateRainbow(i / data.length))
          .attr('opacity', 0.8);

        arcs.append('text')
          .attr('transform', d => `translate(${labelArc.centroid(d as any)})`)
          .attr('dy', '.35em')
          .style('text-anchor', 'middle')
          .style('font-size', '12px')
          .attr('fill', style === 'minimal' ? '#2d3748' : '#fff')
          .text(d => (d.data as any).topic);

        break;
      }
      case 'line': {
        const x = d3.scaleLinear()
          .domain([0, data.length - 1])
          .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.relevance) || 1])
          .range([height - margin.bottom, margin.top]);

        // Add gradient
        const gradient = svg.append('defs')
          .append('linearGradient')
          .attr('id', 'line-gradient')
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', 0)
          .attr('y1', y(0))
          .attr('x2', 0)
          .attr('y2', y(1));

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', style === 'minimal' ? '#4299e1' : '#fff')
          .attr('stop-opacity', 0.2);

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', style === 'minimal' ? '#4299e1' : '#fff')
          .attr('stop-opacity', 0.8);

        const line = d3.line<any>()
          .x((_, i) => x(i))
          .y(d => y(d.relevance))
          .curve(d3.curveMonotoneX);

        // Add area under the line
        const area = d3.area<any>()
          .x((_, i) => x(i))
          .y0(height - margin.bottom)
          .y1(d => y(d.relevance))
          .curve(d3.curveMonotoneX);

        svg.append('path')
          .datum(data)
          .attr('class', 'area')
          .attr('d', area)
          .attr('fill', 'url(#line-gradient)');

        svg.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', style === 'minimal' ? '#4299e1' : '#fff')
          .attr('stroke-width', 2)
          .attr('d', line);

        // Add topic labels
        svg.selectAll('.topic-label')
          .data(data)
          .enter()
          .append('text')
          .attr('class', 'topic-label')
          .attr('x', (_, i) => x(i))
          .attr('y', d => y(d.relevance) - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', style === 'minimal' ? '#2d3748' : '#fff')
          .style('font-size', '12px')
          .text(d => d.topic);

        break;
      }
      default: {
        const x = d3.scaleBand()
          .range([margin.left, width - margin.right])
          .domain(data.map(d => d.topic))
          .padding(0.1);

        const y = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.relevance) || 1])
          .range([height - margin.bottom, margin.top]);

        // Add gradient for bars
        const gradient = svg.append('defs')
          .append('linearGradient')
          .attr('id', 'bar-gradient')
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', 0)
          .attr('y1', height)
          .attr('x2', 0)
          .attr('y2', 0);

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', style === 'minimal' ? '#4299e1' : '#fff')
          .attr('stop-opacity', 0.4);

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', style === 'minimal' ? '#4299e1' : '#fff')
          .attr('stop-opacity', 0.8);

        // Add bars with gradient
        svg.selectAll('rect')
          .data(data)
          .enter()
          .append('rect')
          .attr('x', d => x(d.topic) || 0)
          .attr('y', d => y(d.relevance))
          .attr('width', x.bandwidth())
          .attr('height', d => height - margin.bottom - y(d.relevance))
          .attr('fill', 'url(#bar-gradient)')
          .attr('rx', 4)
          .attr('ry', 4);

        // Add context tooltips
        const tooltip = d3.select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('visibility', 'hidden')
          .style('background-color', 'rgba(0, 0, 0, 0.8)')
          .style('color', '#fff')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('max-width', '200px');

        svg.selectAll('rect')
          .on('mouseover', (event, d: any) => {
            tooltip
              .style('visibility', 'visible')
              .html(`${d.topic}<br/><small>${d.context}</small>`);
          })
          .on('mousemove', (event) => {
            tooltip
              .style('top', (event.pageY - 10) + 'px')
              .style('left', (event.pageX + 10) + 'px');
          })
          .on('mouseout', () => {
            tooltip.style('visibility', 'hidden');
          });

        // Add axes
        svg.append('g')
          .attr('transform', `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(x))
          .selectAll('text')
          .attr('transform', 'rotate(-45)')
          .style('text-anchor', 'end')
          .attr('fill', style === 'minimal' ? '#2d3748' : '#fff');

        svg.append('g')
          .attr('transform', `translate(${margin.left},0)`)
          .call(d3.axisLeft(y))
          .selectAll('text')
          .attr('fill', style === 'minimal' ? '#2d3748' : '#fff');
      }
    }
  }, [analysis, style, chartType]);

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Content Structure</h3>
      <svg
        ref={svgRef}
        width="100%"
        height="300"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}