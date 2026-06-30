import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DossierSection, RegulatoryAuthority } from '../types';
import { Folder, FolderOpen, FileText, CheckCircle2, AlertTriangle, PlayCircle, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';

interface GapBadgeProps {
  count: number;
  hasChildren: boolean;
}

function GapBadge({ count, hasChildren }: GapBadgeProps) {
  const [animateTrigger, setAnimateTrigger] = useState(0);

  useEffect(() => {
    if (count > 0) {
      setAnimateTrigger(prev => prev + 1);
    }
  }, [count]);

  if (count <= 0) return null;

  return (
    <div className="relative flex items-center shrink-0 ml-1.5" id={`gap-badge-${count}`}>
      {/* Soft pulse ripple ring */}
      <motion.span
        key={`ripple-${animateTrigger}`}
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`absolute inset-0 rounded-full ${hasChildren ? 'bg-amber-500' : 'bg-rose-500'}`}
      />
      
      {/* The main badge body */}
      <motion.span
        key={`badge-${count}`}
        initial={{ scale: 0.85 }}
        animate={{ scale: [0.85, 1.15, 0.95, 1] }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`relative z-10 text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-sm flex items-center gap-1 leading-none select-none ${
          hasChildren 
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' 
            : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
        }`}
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasChildren ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${hasChildren ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
        </span>
        {count} {hasChildren ? 'gaps' : 'pending'}
      </motion.span>
    </div>
  );
}

interface DossierExplorerProps {
  sections: DossierSection[];
  selectedSectionId: string;
  onSelectSection: (sectionId: string) => void;
  targetAuthority: RegulatoryAuthority;
  onReorderSections?: (newSections: DossierSection[]) => void;
  searchQuery?: string;
}

export default function DossierExplorer({
  sections,
  selectedSectionId,
  onSelectSection,
  targetAuthority,
  onReorderSections,
  searchQuery = '',
}: DossierExplorerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'M1': true,
    'M3': true,
  });

  // Check if a section or any of its descendants matches the search query
  const sectionMatchesOrHasMatchingDescendant = (sec: DossierSection, query: string): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    const matchesSelf = sec.title.toLowerCase().includes(q) || 
                        sec.sectionCode.toLowerCase().includes(q) || 
                        sec.id.toLowerCase().includes(q);
    if (matchesSelf) return true;
    
    const children = sections.filter(s => s.parentId === sec.id);
    return children.some(child => sectionMatchesOrHasMatchingDescendant(child, query));
  };

  // Auto-expand nodes that have matching descendants when search query is active
  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const newExpanded: Record<string, boolean> = {};
      
      sections.forEach(sec => {
        const matchesSelf = sec.title.toLowerCase().includes(q) || 
                            sec.sectionCode.toLowerCase().includes(q) || 
                            sec.id.toLowerCase().includes(q);
        if (matchesSelf) {
          let parentId = sec.parentId;
          while (parentId) {
            newExpanded[parentId] = true;
            const parent = sections.find(s => s.id === parentId);
            parentId = parent ? parent.parentId : undefined;
          }
        }
      });
      
      setExpandedNodes(prev => ({ ...prev, ...newExpanded }));
    }
  }, [searchQuery, sections]);

  // Text highlighting utility
  const highlightText = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-500/20 text-amber-300 px-0.5 rounded font-bold border-b border-amber-500">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  // Helper to recursively count pending gaps of a section and its descendants
  const countPendingGaps = (sec: DossierSection): number => {
    let count = 0;
    if (sec.gaps) {
      count += sec.gaps.filter(g => g.status === 'pending').length;
    }
    const children = sections.filter(s => s.parentId === sec.id);
    for (const child of children) {
      count += countPendingGaps(child);
    }
    return count;
  };

  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (draggedId === id) return; // Prevent dropping on itself
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const isTopHalf = relativeY < rect.height / 2;
    
    setDragOverId(id);
    setDropPosition(isTopHalf ? 'before' : 'after');
  };

  const handleDragLeave = () => {
    setDragOverId(null);
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedId;
    
    if (!sourceId || sourceId === targetId) {
      handleDragEnd();
      return;
    }

    if (onReorderSections) {
      const sourceIndex = sections.findIndex(s => s.id === sourceId);
      const targetIndex = sections.findIndex(s => s.id === targetId);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const sourceSection = sections[sourceIndex];
        const targetSection = sections[targetIndex];
        
        const newSections = [...sections];
        newSections.splice(sourceIndex, 1);
        
        const newTargetIndex = newSections.findIndex(s => s.id === targetId);
        
        // Update parentId to match the target sibling/parent environment
        const updatedSourceSection = {
          ...sourceSection,
          parentId: targetSection.parentId
        };
        
        const insertIndex = dropPosition === 'before' ? newTargetIndex : newTargetIndex + 1;
        newSections.splice(insertIndex, 0, updatedSourceSection);
        
        onReorderSections(newSections);
      }
    }
    
    handleDragEnd();
  };

  const renderSectionNode = (section: DossierSection, depth: number = 0) => {
    const children = sections.filter(s => s.parentId === section.id && sectionMatchesOrHasMatchingDescendant(s, searchQuery));
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedNodes[section.id];
    const isSelected = selectedSectionId === section.id;
    
    // Determine the status of this section for the target authority
    const targetStatus = section.targetStatus?.[targetAuthority] || section.status;

    const isDragging = draggedId === section.id;
    const isOver = dragOverId === section.id;
    
    let dropHighlightClass = 'border-l-4 border-transparent';
    if (isOver) {
      if (dropPosition === 'before') {
        dropHighlightClass = 'border-t-2 border-t-emerald-500 bg-emerald-500/10';
      } else if (dropPosition === 'after') {
        dropHighlightClass = 'border-b-2 border-b-emerald-500 bg-emerald-500/10';
      }
    }

    return (
      <div 
        key={section.id} 
        className={`select-none transition-all duration-150 ${isDragging ? 'opacity-30 scale-[0.97]' : ''}`}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, section.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, section.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, section.id)}
      >
        <div
          onClick={() => onSelectSection(section.id)}
          className={`group flex items-center justify-between py-2 px-3 my-0.5 rounded-lg text-sm cursor-grab active:cursor-grabbing transition-all duration-150 ${
            isSelected
              ? 'bg-emerald-500/10 text-emerald-100 font-bold border-l-4 border-emerald-500 shadow-md shadow-emerald-500/5'
              : `text-slate-300 hover:bg-slate-900/60 hover:text-white ${dropHighlightClass}`
          }`}
          style={{ paddingLeft: `${depth * 14 + 12}px` }}
          id={`explorer-item-${section.id}`}
        >
          <div className="flex items-center gap-2.5 min-w-0 w-full">
            {/* Grab Handle */}
            <GripVertical className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 cursor-grab shrink-0 transition-colors" />

            {hasChildren ? (
              <button
                onClick={(e) => toggleExpand(section.id, e)}
                onDragStart={(e) => e.stopPropagation()}
                className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-4.5" />
            )}

            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
              ) : (
                <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
              )
            ) : (
              getStatusIcon(targetStatus)
            )}

            <div className="flex items-baseline gap-1.5 truncate">
              <span className={`font-mono text-xs ${isSelected ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                [{highlightText(section.sectionCode, searchQuery)}]
              </span>
              <span className="truncate">{highlightText(section.title, searchQuery)}</span>
            </div>
          </div>

          <GapBadge count={countPendingGaps(section)} hasChildren={hasChildren} />
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-slate-900 ml-3.5 pl-0.5 my-0.5">
            {children.map(child => renderSectionNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render root items (items without parents)
  const rootSections = sections.filter(s => !s.parentId && sectionMatchesOrHasMatchingDescendant(s, searchQuery));

  return (
    <div className="bg-slate-950/60 border border-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col h-full backdrop-blur-md" id="ectd-explorer">
      {/* Search & Statistics */}
      <div className="p-4 border-b border-slate-900/60 bg-slate-950/40">
        <h3 className="text-sm font-black text-slate-100 tracking-wider uppercase flex items-center gap-2">
          <Folder className="w-4.5 h-4.5 text-slate-400" />
          eCTD Dossier Navigator
        </h3>
        <p className="text-[10px] text-slate-500 mt-0.5 font-mono uppercase font-bold">Drag items to reorder & prioritize sections</p>
      </div>

      <div className="p-3 overflow-y-auto flex-1 scrollbar-thin min-h-0">
        <div className="space-y-1">
          {rootSections.map(rootSection => renderSectionNode(rootSection))}
        </div>
      </div>

      {/* Footer Details */}
      <div className="p-4 border-t border-slate-900/60 bg-slate-950/40 text-[11px] text-slate-400 font-sans space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <span>eCTD Format Legend:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Aligned / Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Remediation Gaps</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Critical Errors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span>Draft Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
