import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { DemoDossier, DossierSection, RegulatoryAuthority } from '../types';
import { REGULATORY_BODIES } from '../data';
import { AlertOctagon, HelpCircle, ShieldAlert, Sparkles, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface RiskHeatmapProps {
  dossier: DemoDossier;
  selectedSectionId: string;
  onSelectSection: (sectionId: string) => void;
  targetAuthority: RegulatoryAuthority;
}

type ViewMode = 'authorities' | 'dimensions';

interface HeatmapDataPoint {
  sectionId: string;
  sectionCode: string;
  sectionTitle: string;
  axisValue: string; // regulatory authority name OR risk dimension category
  score: number;     // calculated risk score (0 to 100)
  pendingGaps: {
    critical: number;
    warning: number;
    info: number;
  };
  status: string;
}

export default function RiskHeatmap({
  dossier,
  selectedSectionId,
  onSelectSection,
  targetAuthority
}: RiskHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('authorities');
  const [hoveredCell, setHoveredCell] = useState<HeatmapDataPoint | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  // Handle container resizing reactively using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        // Keep a minimum width of 400px and a beautiful proportional height
        setDimensions({
          width: Math.max(width, 400),
          height: 380
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Compute the 2D grid dataset based on the current dossier and view mode
  const dataset: HeatmapDataPoint[] = React.useMemo(() => {
    const list: HeatmapDataPoint[] = [];
    const sections = dossier.sections;

    // Dimensions list
    const riskDimensions = [
      'Terminology',
      'Formatting',
      'Specification',
      'Data Representation',
      'Administrative'
    ];

    // Authorities list
    const authorities: RegulatoryAuthority[] = ['FDA', 'EMA', 'PMDA', 'CDSCO', 'Swissmedic'];

    sections.forEach((sec) => {
      // Basic complexity modifier based on hierarchy level or module
      let baseComplexity = 10;
      if (sec.id.includes('.S.')) baseComplexity = 35; // Drug substance is high risk
      if (sec.id.includes('.P.')) baseComplexity = 40; // Drug product is very high risk
      if (sec.module === 1) baseComplexity = 15;        // Module 1 is low risk

      if (viewMode === 'authorities') {
        authorities.forEach((auth) => {
          // Check section compliance status for this authority
          const currentStatus = sec.targetStatus?.[auth] || sec.status;
          const isTarget = dossier.targetAuthorities.includes(auth) || auth === targetAuthority;

          let score = baseComplexity;

          // Gap assessment
          const pendingGapsForSec = sec.gaps.filter(g => g.status === 'pending');
          let critCount = 0;
          let warnCount = 0;
          let infoCount = 0;

          pendingGapsForSec.forEach(gap => {
            if (gap.severity === 'critical') critCount++;
            else if (gap.severity === 'warning') warnCount++;
            else infoCount++;
          });

          // Compute risk score components
          const gapRisk = (critCount * 35) + (warnCount * 18) + (infoCount * 8);
          score += gapRisk;

          // Status penalty
          if (currentStatus === 'error') score += 25;
          if (currentStatus === 'warning') score += 15;
          if (currentStatus === 'compliant') score = Math.max(5, score - 20); // healthy buffer

          // Target market multiplier (non-aligned target markets represent higher pending liability)
          if (isTarget && currentStatus !== 'compliant') {
            score *= 1.25;
          }

          // Bound score between 0 and 100
          score = Math.min(100, Math.max(0, Math.round(score)));

          list.push({
            sectionId: sec.id,
            sectionCode: sec.sectionCode,
            sectionTitle: sec.title,
            axisValue: auth,
            score,
            pendingGaps: {
              critical: critCount,
              warning: warnCount,
              info: infoCount
            },
            status: currentStatus
          });
        });
      } else {
        // Risk Dimensions mode
        riskDimensions.forEach((dim) => {
          let score = baseComplexity;

          // Filter gaps belonging to this specific category
          const pendingGapsInDim = sec.gaps.filter(
            (g) => g.status === 'pending' && g.category.toLowerCase() === dim.toLowerCase()
          );

          let critCount = 0;
          let warnCount = 0;
          let infoCount = 0;

          pendingGapsInDim.forEach(gap => {
            if (gap.severity === 'critical') critCount++;
            else if (gap.severity === 'warning') warnCount++;
            else infoCount++;
          });

          // Score base on category specific gaps
          const gapRisk = (critCount * 45) + (warnCount * 22) + (infoCount * 10);
          score += gapRisk;

          if (pendingGapsInDim.length === 0 && sec.status === 'compliant') {
            score = Math.max(5, score - 15);
          }

          score = Math.min(100, Math.max(0, Math.round(score)));

          list.push({
            sectionId: sec.id,
            sectionCode: sec.sectionCode,
            sectionTitle: sec.title,
            axisValue: dim,
            score,
            pendingGaps: {
              critical: critCount,
              warning: warnCount,
              info: infoCount
            },
            status: sec.status
          });
        });
      }
    });

    return list;
  }, [dossier, viewMode, targetAuthority]);

  // Main D3 Rendering Hook
  useEffect(() => {
    if (!svgRef.current || dataset.length === 0) return;

    // 1. Setup layout configurations
    const margin = { top: 35, right: 20, bottom: 40, left: 95 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Select and clear SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create container group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 2. Setup Axes Scales
    // Y-axis: Unique Section codes
    const uniqueSections = Array.from(new Set(dataset.map(d => d.sectionCode)));
    // X-axis: Either authorities or dimensions
    const uniqueAxes = Array.from(new Set(dataset.map(d => d.axisValue)));

    const xScale = d3.scaleBand()
      .range([0, width])
      .domain(uniqueAxes)
      .padding(0.06);

    const yScale = d3.scaleBand()
      .range([0, height])
      .domain(uniqueSections)
      .padding(0.06);

    // 3. Color Scale
    // Beautiful gradient ranging from tranquil slate, through warm amber warning, to high risk crimson/rose
    const colorScale = d3.scaleSequential<string>()
      .interpolator(d3.interpolateRgbBasis([
        '#1e293b', // slate-800: Very Low Risk
        '#0f172a', // slate-900: Mid transition
        '#ca8a04', // amber-600: Moderate Risk/Warning
        '#dc2626', // red-600: High Risk
        '#be123c'  // rose-700: Critical Risk
      ]))
      .domain([0, 100]);

    // 4. Render Axes
    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .attr('class', 'axis-x')
      .style('font-family', 'var(--font-mono, monospace)')
      .style('font-size', '10px')
      .style('color', '#94a3b8')
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('dy', '12px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .attr('class', 'axis-y')
      .style('font-family', 'var(--font-mono, monospace)')
      .style('font-size', '10px')
      .style('color', '#94a3b8')
      .selectAll('text')
      .attr('dx', '-6px');

    // Remove domains lines for sleek minimalistic styling
    g.selectAll('.domain').remove();

    // 5. Render Cells
    const cells = g.selectAll('.heatmap-cell')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', d => xScale(d.axisValue) || 0)
      .attr('y', d => yScale(d.sectionCode) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 6) // Beautiful rounded grid squares
      .attr('ry', 6)
      .style('fill', d => colorScale(d.score))
      .style('stroke', d => d.sectionId === selectedSectionId ? '#10b981' : '#0f172a')
      .style('stroke-width', d => d.sectionId === selectedSectionId ? '2.5px' : '1px')
      .style('cursor', 'pointer')
      .style('transition', 'all 0.15s ease-in-out');

    // Add interactivity / Tooltip handlers
    cells
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .style('stroke', '#f8fafc')
          .style('stroke-width', '2px')
          .style('filter', 'brightness(1.25)');
        setHoveredCell(d);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .style('stroke', d.sectionId === selectedSectionId ? '#10b981' : '#0f172a')
          .style('stroke-width', d.sectionId === selectedSectionId ? '2.5px' : '1px')
          .style('filter', 'none');
        setHoveredCell(null);
      })
      .on('click', (event, d) => {
        onSelectSection(d.sectionId);
      });

    // 6. Draw grid text indicators inside large cells for better readability
    if (xScale.bandwidth() > 55 && yScale.bandwidth() > 25) {
      g.selectAll('.cell-label')
        .data(dataset)
        .enter()
        .append('text')
        .attr('class', 'cell-label')
        .attr('x', d => (xScale(d.axisValue) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => (yScale(d.sectionCode) || 0) + yScale.bandwidth() / 2 + 4)
        .attr('text-anchor', 'middle')
        .style('fill', d => d.score > 40 ? '#ffffff' : '#94a3b8')
        .style('font-family', 'var(--font-mono, monospace)')
        .style('font-size', '9px')
        .style('font-weight', '700')
        .style('pointer-events', 'none')
        .text(d => `${d.score}%`);
    }

  }, [dataset, dimensions, selectedSectionId, onSelectSection]);

  // Color mapping helper for risk badges
  const getRiskColorClass = (score: number) => {
    if (score >= 70) return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (score >= 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'Critical Liability';
    if (score >= 40) return 'Moderate Exposure';
    return 'Compliant / Low Risk';
  };

  return (
    <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-4 flex flex-col h-full overflow-hidden select-none" id="risk-heatmap-component">
      
      {/* Visual Header with Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              Regulatory Risk Heatmap
              <span className="inline-flex items-center px-1.5 py-0.25 rounded-full text-[9px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/10 animate-pulse">
                D3 Engine
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 leading-none mt-1">Cross-mapping dossier sections to compliance liability coefficients</p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] self-start sm:self-auto shrink-0 font-bold">
          <button
            onClick={() => setViewMode('authorities')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'authorities' ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>By Authority</span>
          </button>
          <button
            onClick={() => setViewMode('dimensions')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'dimensions' ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertOctagon className="w-3 h-3" />
            <span>By Risk Dimension</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start flex-1 min-h-[350px]">
        
        {/* Heatmap Area */}
        <div ref={containerRef} className="lg:col-span-8 flex justify-center items-center h-full relative">
          <svg
            ref={svgRef}
            width="100%"
            height={dimensions.height}
            className="overflow-visible"
            style={{ maxHeight: `${dimensions.height}px` }}
          />

          {/* Interactive Legend block */}
          <div className="absolute bottom-1 right-2 flex items-center gap-2 bg-slate-950/60 backdrop-blur-sm border border-slate-900 px-2 py-1 rounded-md text-[9px] text-slate-500 font-mono">
            <span>Low Risk</span>
            <div className="w-20 h-2 rounded bg-gradient-to-r from-slate-800 via-yellow-600 to-rose-700"></div>
            <span>High Risk</span>
          </div>
        </div>

        {/* Dynamic Context Tooltip Sidebar */}
        <div className="lg:col-span-4 h-full flex flex-col justify-between">
          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 min-h-[260px] flex flex-col justify-between relative overflow-hidden">
            
            {/* Ambient visual background glow for premium feel */}
            <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />

            {hoveredCell ? (
              <motion.div
                key={hoveredCell.sectionId + hoveredCell.axisValue}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded font-bold">
                    Section {hoveredCell.sectionCode}
                  </span>
                  <h5 className="text-xs font-black text-slate-200 mt-1.5 line-clamp-1">{hoveredCell.sectionTitle}</h5>
                </div>

                <div className="border-t border-slate-900 pt-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">
                      {viewMode === 'authorities' ? 'Regulatory Agency:' : 'Risk Category:'}
                    </span>
                    <span className="font-mono text-slate-200 flex items-center gap-1 font-bold">
                      {viewMode === 'authorities' && REGULATORY_BODIES[hoveredCell.axisValue as RegulatoryAuthority]?.icon}
                      {hoveredCell.axisValue}
                    </span>
                  </div>

                  {/* Calculated Score */}
                  <div className="flex items-center justify-between text-[11px] border-b border-slate-900/60 pb-2">
                    <span className="text-slate-400 font-bold">Liability Score:</span>
                    <span className={`font-mono text-xs font-extrabold px-1.5 py-0.5 rounded border ${getRiskColorClass(hoveredCell.score)}`}>
                      {hoveredCell.score}% • {getRiskLabel(hoveredCell.score)}
                    </span>
                  </div>

                  {/* Gap details breakdown */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Unresolved Gaps breakdown</span>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-1">
                        <span className="block text-xs font-black text-rose-500">{hoveredCell.pendingGaps.critical}</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Critical</span>
                      </div>
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-1">
                        <span className="block text-xs font-black text-amber-500">{hoveredCell.pendingGaps.warning}</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Warning</span>
                      </div>
                      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-1">
                        <span className="block text-xs font-black text-indigo-400">{hoveredCell.pendingGaps.info}</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Info</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[9px] text-slate-500 leading-relaxed italic bg-slate-900/30 p-2 rounded-lg border border-slate-900/50 mt-1">
                  💡 Click this square to immediately focus and load this section's comparative editor in the main workspace.
                </p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8 space-y-3 h-full my-auto">
                <div className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                  <HelpCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-300">Liability Segment Analyzer</h5>
                  <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto mt-1 leading-relaxed">
                    Hover over any cell in the 2D grid matrix to inspect active risks, regulatory gaps, and compile liability details.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Prompt action guidelines */}
          <div className="mt-3 text-[10px] text-slate-500 font-sans leading-relaxed border-t border-slate-900 pt-3 flex gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>D3 Alignment Integration:</strong> Risk coefficients automatically decrease as you resolve audited gaps or commit harmonized text adjustments.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
