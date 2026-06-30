import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface GlobeNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  color: string;
  status: 'compliant' | 'warning' | 'error' | 'unreviewed';
  agency: string;
}

interface GlobeArc {
  from: string; // Node ID
  to: string; // Node ID
  color: string;
  status: 'compliant' | 'warning' | 'error' | 'unreviewed';
}

interface InteractiveGlobeProps {
  nodes: GlobeNode[];
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
  arcs?: GlobeArc[];
}

// Pre-calculate 3D point cloud for digital grid representation
const generateFibonacciSphere = (samples: number) => {
  const points: { x: number; y: number; z: number }[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2; // y goes from 1 to -1
    const radius = Math.sqrt(1 - y * y); // radius at y

    const theta = goldenAngle * i; // golden angle increment

    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    points.push({ x, y, z });
  }
  return points;
};

export default function InteractiveGlobe({
  nodes,
  activeNodeId,
  onSelectNode,
  arcs = []
}: InteractiveGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interaction & Rotation State
  const [isRotating, setIsRotating] = useState(true);
  const [scale, setScale] = useState(1.1);
  const rotationRef = useRef({ x: 0.3, y: -0.8 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragRotationStartRef = useRef({ x: 0, y: 0 });
  const hoverNodeIdRef = useRef<string | null>(null);
  const [hoveredNodeName, setHoveredNodeName] = useState<string | null>(null);

  // Generate 3D grid points once
  const [spherePoints] = useState(() => generateFibonacciSphere(320));

  // Convert Latitude/Longitude to 3D Cartesian Coordinates
  const getCartesian = (lat: number, lon: number) => {
    const phi = (lat * Math.PI) / 180;
    const theta = (lon * Math.PI) / 180;

    // standard mapping
    return {
      x: Math.cos(phi) * Math.sin(theta),
      y: -Math.sin(phi),
      z: Math.cos(phi) * Math.cos(theta)
    };
  };

  // Convert Cartesian coordinates to rotated Cartesian coordinates
  const rotateCoordinates = (
    pos: { x: number; y: number; z: number },
    rotX: number,
    rotY: number
  ) => {
    // 1. Rotate around Y-axis (Longitude spin)
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    let x1 = pos.x * cosY - pos.z * sinY;
    let z1 = pos.x * sinY + pos.z * cosY;

    // 2. Rotate around X-axis (Latitude tilt)
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    let y2 = pos.y * cosX - z1 * sinX;
    let z2 = pos.y * sinX + z1 * cosX;

    return { x: x1, y: y2, z: z2 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let pulseTime = 0;

    // Track projected screen coordinates of nodes for hover/click detection
    let projectedNodes: { id: string; x: number; y: number; z: number; name: string }[] = [];

    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, 420);

      // Support high-DPI Retina screens
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const radius = Math.min(width, height) * 0.35 * scale;

      ctx.clearRect(0, 0, width, height);

      // 1. Update auto-rotation
      if (isRotating && !isDraggingRef.current) {
        rotationRef.current.y += 0.0035;
      }

      pulseTime += 0.04;

      // Draw atmospheric space glow under globe
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        radius * 0.8,
        width / 2,
        height / 2,
        radius * 1.3
      );
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.02)');
      grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.01)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Draw faint wireframe sphere boundaries (parallels & meridians)
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.15)';
      ctx.lineWidth = 0.5;
      
      // Draw 5 rings of longitude
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.ellipse(
          width / 2,
          height / 2,
          radius,
          radius * Math.abs(Math.sin(angle + rotationRef.current.x)),
          rotationRef.current.y,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // 2. Draw Digital Fibonacci Sphere Point Cloud
      spherePoints.forEach((pt) => {
        const rotated = rotateCoordinates(pt, rotationRef.current.x, rotationRef.current.y);

        // Standard orthogonal projection depth calculation
        // points with z > 0 are on the front hemisphere, z < 0 on the back hemisphere
        const alpha = rotated.z > 0 ? 0.35 + rotated.z * 0.55 : 0.08;
        const size = rotated.z > 0 ? 1.5 + rotated.z * 1.2 : 0.8;

        const screenX = width / 2 + rotated.x * radius;
        const screenY = height / 2 + rotated.y * radius;

        ctx.fillStyle = rotated.z > 0 
          ? `rgba(16, 185, 129, ${alpha * 0.75})` 
          : `rgba(71, 85, 105, ${alpha * 0.6})`;

        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset projected nodes tracker
      projectedNodes = [];

      // 3. Draw Connection Arcs (Render back arcs first)
      arcs.forEach((arc) => {
        const fromNode = nodes.find((n) => n.id === arc.from);
        const toNode = nodes.find((n) => n.id === arc.to);
        if (!fromNode || !toNode) return;

        const p1 = getCartesian(fromNode.lat, fromNode.lon);
        const p2 = getCartesian(toNode.lat, toNode.lon);

        const r1 = rotateCoordinates(p1, rotationRef.current.x, rotationRef.current.y);
        const r2 = rotateCoordinates(p2, rotationRef.current.x, rotationRef.current.y);

        // If either coordinate is on the back side, make the line faint
        const isBehind = r1.z < 0 || r2.z < 0;
        
        const x1 = width / 2 + r1.x * radius;
        const y1 = height / 2 + r1.y * radius;
        const x2 = width / 2 + r2.x * radius;
        const y2 = height / 2 + r2.y * radius;

        // Calculate 3D mid point and curve peak outwards
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Curve control point (pull outward perpendicular to line)
        const curveOffset = dist * 0.22;
        const nx = -dy / (dist || 1);
        const ny = dx / (dist || 1);
        const cx = midX + nx * curveOffset - (isBehind ? 5 : 15);
        const cy = midY + ny * curveOffset - (isBehind ? 5 : 15);

        // Draw Arc
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);
        
        let strokeColor = 'rgba(148, 163, 184, 0.1)';
        if (arc.status === 'compliant') strokeColor = `rgba(16, 185, 129, ${isBehind ? '0.15' : '0.45'})`;
        else if (arc.status === 'warning') strokeColor = `rgba(245, 158, 11, ${isBehind ? '0.15' : '0.45'})`;
        else if (arc.status === 'error') strokeColor = `rgba(239, 68, 68, ${isBehind ? '0.15' : '0.45'})`;

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isBehind ? 1 : 2;
        ctx.stroke();

        // Draw animated scanning particle along the arc
        if (!isBehind) {
          const t = (pulseTime * 0.15) % 1;
          // Calculate quadratic bezier point for parameter t
          const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
          const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;

          ctx.fillStyle = arc.status === 'compliant' ? '#10B981' : arc.status === 'warning' ? '#F59E0B' : '#EF4444';
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Particle outer halo
          ctx.strokeStyle = arc.status === 'compliant' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(px, py, 6 + Math.sin(pulseTime * 2) * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // 4. Draw Interactive Nodes
      nodes.forEach((node) => {
        const cartesian = getCartesian(node.lat, node.lon);
        const rotated = rotateCoordinates(cartesian, rotationRef.current.x, rotationRef.current.y);

        const screenX = width / 2 + rotated.x * radius;
        const screenY = height / 2 + rotated.y * radius;

        // Save coordinates for click handling (only on the front face)
        if (rotated.z > -0.1) {
          projectedNodes.push({
            id: node.id,
            x: screenX,
            y: screenY,
            z: rotated.z,
            name: node.name
          });
        }

        const isNodeActive = node.id === activeNodeId;
        const isHovered = node.id === hoverNodeIdRef.current;
        const isBehind = rotated.z < 0;

        // Opacity mapping based on depth
        const baseAlpha = isBehind ? 0.25 : 1;
        const pulse = Math.sin(pulseTime * 2.5) * 0.5 + 0.5;

        // Node fill color lookup
        let fillStyle = 'rgba(148, 163, 184, 0.8)';
        let strokeStyle = 'rgba(148, 163, 184, 0.4)';

        if (node.status === 'compliant') {
          fillStyle = node.color;
          strokeStyle = `rgba(16, 185, 129, ${baseAlpha})`;
        } else if (node.status === 'warning') {
          fillStyle = '#F59E0B';
          strokeStyle = `rgba(245, 158, 11, ${baseAlpha})`;
        } else if (node.status === 'error') {
          fillStyle = '#EF4444';
          strokeStyle = `rgba(239, 68, 68, ${baseAlpha})`;
        }

        // Draw pulsating halo for front nodes
        if (!isBehind) {
          ctx.strokeStyle = strokeStyle;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(screenX, screenY, 8 + pulse * 10, 0, Math.PI * 2);
          ctx.stroke();

          // Double ring for active nodes
          if (isNodeActive) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 14 + Math.cos(pulseTime * 1.5) * 4, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Draw Core Node Circle
        ctx.fillStyle = fillStyle;
        ctx.shadowBlur = !isBehind ? 10 : 0;
        ctx.shadowColor = fillStyle;
        
        ctx.beginPath();
        ctx.arc(
          screenX,
          screenY,
          isBehind ? 3.5 : isNodeActive ? 7.5 : isHovered ? 6.5 : 5.5,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Clear shadow setup
        ctx.shadowBlur = 0;

        // Draw Text Labels for front nodes
        if (!isBehind) {
          ctx.fillStyle = isNodeActive ? '#FFFFFF' : isHovered ? '#10B981' : '#94A3B8';
          ctx.font = isNodeActive ? 'bold 10px monospace' : '9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          
          // Draw region abbreviation label (e.g. FDA, EMA)
          ctx.fillText(node.id, screenX, screenY - (isNodeActive ? 12 : 10));
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Mouse Interaction Handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      dragRotationStartRef.current = { ...rotationRef.current };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isDraggingRef.current) {
        // Drag logic to adjust rotation angles
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        rotationRef.current.y = dragRotationStartRef.current.y + deltaX * 0.0065;
        rotationRef.current.x = Math.max(
          -Math.PI / 2.2,
          Math.min(Math.PI / 2.2, dragRotationStartRef.current.x + deltaY * 0.0065)
        );
      } else {
        // Hover detection
        let foundNode: typeof projectedNodes[0] | null = null;
        for (const pNode of projectedNodes) {
          const dx = x - pNode.x;
          const dy = y - pNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 15) {
            foundNode = pNode;
            break;
          }
        }

        if (foundNode) {
          hoverNodeIdRef.current = foundNode.id;
          setHoveredNodeName(foundNode.name);
          canvas.style.cursor = 'pointer';
        } else {
          hoverNodeIdRef.current = null;
          setHoveredNodeName(null);
          canvas.style.cursor = 'grab';
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        return;
      }

      // Check click detection
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let clickedNode: typeof projectedNodes[0] | null = null;
      for (const pNode of projectedNodes) {
        const dx = x - pNode.x;
        const dy = y - pNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 16) {
          clickedNode = pNode;
          break;
        }
      }

      if (clickedNode) {
        onSelectNode(clickedNode.id);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        dragRotationStartRef.current = { ...rotationRef.current };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - dragStartRef.current.x;
        const deltaY = e.touches[0].clientY - dragStartRef.current.y;

        rotationRef.current.y = dragRotationStartRef.current.y + deltaX * 0.008;
        rotationRef.current.x = Math.max(
          -Math.PI / 2.2,
          Math.min(Math.PI / 2.2, dragRotationStartRef.current.x + deltaY * 0.008)
        );
      }
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRotating, nodes, activeNodeId, arcs, scale, spherePoints]);

  return (
    <div className="flex flex-col items-center bg-slate-950 border border-slate-900 rounded-2xl p-4 relative select-none">
      
      {/* Control overlay strip */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-1.5 rounded-lg border text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer ${
            isRotating 
              ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' 
              : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
          }`}
          title={isRotating ? 'Pause rotation' : 'Resume rotation'}
        >
          {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="text-[9px] uppercase tracking-wider">{isRotating ? 'Live Orbit' : 'Paused'}</span>
        </button>

        <button
          onClick={() => {
            rotationRef.current = { x: 0.3, y: -0.8 };
          }}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200 cursor-pointer"
          title="Reset Viewport"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-slate-900/80 border border-slate-850 p-0.5 rounded-lg">
        <button
          onClick={() => setScale(prev => Math.min(1.4, prev + 0.1))}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setScale(prev => Math.max(0.7, prev - 0.1))}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dynamic Earth node tooltip */}
      <div className="absolute bottom-4 left-4 right-4 text-center z-10 pointer-events-none transition-all duration-200">
        <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg inline-block backdrop-blur-sm min-h-[36px]">
          {hoveredNodeName ? (
            <div>
              <span className="text-[10px] text-emerald-400 font-bold block">{hoveredNodeName}</span>
              <span className="text-[9px] text-slate-500 font-mono">Click node to inspect local specifications</span>
            </div>
          ) : (
            <div>
              <span className="text-[10px] text-slate-300 font-bold block">Interactive 3D Transmission Globe</span>
              <span className="text-[9px] text-slate-500 font-mono">Drag map to orbit • Click nodes to transmit</span>
            </div>
          )}
        </div>
      </div>

      {/* Actual Canvas rendering frame */}
      <div ref={containerRef} className="w-full flex items-center justify-center p-2">
        <canvas ref={canvasRef} className="outline-none" style={{ cursor: 'grab' }} />
      </div>

    </div>
  );
}
