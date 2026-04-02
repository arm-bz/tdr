import React, { useRef, useEffect, useState, useCallback } from 'react';
import { generatePlotPoints, GRAPH_COLORS, fitCurve, FIT_TYPES } from '../utils/graphMath';

const GraphCanvas = ({ 
  equations, 
  points, 
  fitType,
  onAddPoint, 
  onRemovePoint,
  mode,
  showGrid = true,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [viewport, setViewport] = useState({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showCoords, setShowCoords] = useState(false);

  // Calculate fit result for points
  const fitResult = points.length >= 2 ? fitCurve(points, fitType) : null;

  // Convert screen coordinates to graph coordinates
  const screenToGraph = useCallback((screenX, screenY) => {
    const { xMin, xMax, yMin, yMax } = viewport;
    const x = xMin + (screenX / dimensions.width) * (xMax - xMin);
    const y = yMax - (screenY / dimensions.height) * (yMax - yMin);
    return { x, y };
  }, [viewport, dimensions]);

  // Convert graph coordinates to screen coordinates
  const graphToScreen = useCallback((graphX, graphY) => {
    const { xMin, xMax, yMin, yMax } = viewport;
    const x = ((graphX - xMin) / (xMax - xMin)) * dimensions.width;
    const y = ((yMax - graphY) / (yMax - yMin)) * dimensions.height;
    return { x, y };
  }, [viewport, dimensions]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    const { xMin, xMax, yMin, yMax } = viewport;

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, width, height, xMin, xMax, yMin, yMax);
    }

    // Draw axes
    drawAxes(ctx, width, height, xMin, xMax, yMin, yMax);

    // Draw equations
    equations.forEach((eq, index) => {
      if (eq.expression && eq.expression.trim()) {
        const plotPoints = generatePlotPoints(eq.expression, xMin, xMax);
        if (plotPoints.length > 0) {
          drawCurve(ctx, plotPoints, GRAPH_COLORS[index % GRAPH_COLORS.length]);
        }
      }
    });

    // Draw fitted curve from points
    if (fitResult && fitResult.valid && points.length >= 2) {
      drawFittedCurve(ctx, points, fitResult, fitType);
    }

    // Draw points
    points.forEach((point, index) => {
      const screen = graphToScreen(point.x, point.y);
      drawPoint(ctx, screen.x, screen.y, '#111111', index);
    });

  }, [equations, points, fitResult, fitType, dimensions, viewport, showGrid, graphToScreen]);

  const drawGrid = (ctx, width, height, xMin, xMax, yMin, yMax) => {
    ctx.strokeStyle = '#E5E5E5';
    ctx.lineWidth = 1;

    // Calculate grid step
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const xStep = Math.pow(10, Math.floor(Math.log10(xRange / 5)));
    const yStep = Math.pow(10, Math.floor(Math.log10(yRange / 5)));

    // Vertical lines
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const screenX = ((x - xMin) / xRange) * width;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const screenY = ((yMax - y) / yRange) * height;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
      ctx.stroke();
    }
  };

  const drawAxes = (ctx, width, height, xMin, xMax, yMin, yMax) => {
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1.5;

    const originScreen = graphToScreen(0, 0);

    // X axis
    if (yMin <= 0 && yMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(0, originScreen.y);
      ctx.lineTo(width, originScreen.y);
      ctx.stroke();
    }

    // Y axis
    if (xMin <= 0 && xMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(originScreen.x, 0);
      ctx.lineTo(originScreen.x, height);
      ctx.stroke();
    }

    // Draw axis labels
    ctx.fillStyle = '#666666';
    ctx.font = '11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const xStep = Math.pow(10, Math.floor(Math.log10(xRange / 5)));
    const yStep = Math.pow(10, Math.floor(Math.log10(yRange / 5)));

    // X axis labels
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      if (Math.abs(x) < 0.0001) continue;
      const screenX = ((x - xMin) / xRange) * width;
      const labelY = yMin <= 0 && yMax >= 0 ? originScreen.y + 5 : height - 15;
      ctx.fillText(formatNumber(x), screenX, labelY);
    }

    // Y axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      if (Math.abs(y) < 0.0001) continue;
      const screenY = ((yMax - y) / yRange) * height;
      const labelX = xMin <= 0 && xMax >= 0 ? originScreen.x - 5 : 35;
      ctx.fillText(formatNumber(y), labelX, screenY);
    }
  };

  const formatNumber = (num) => {
    if (Math.abs(num) >= 1000 || (Math.abs(num) < 0.01 && num !== 0)) {
      return num.toExponential(1);
    }
    return Number(num.toFixed(2)).toString();
  };

  const drawCurve = (ctx, plotPoints, color) => {
    if (plotPoints.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let started = false;
    let prevScreen = null;

    for (const point of plotPoints) {
      const screen = graphToScreen(point.x, point.y);
      
      // Check for discontinuities
      if (prevScreen && Math.abs(screen.y - prevScreen.y) > dimensions.height * 0.5) {
        ctx.stroke();
        ctx.beginPath();
        started = false;
      }

      if (!started) {
        ctx.moveTo(screen.x, screen.y);
        started = true;
      } else {
        ctx.lineTo(screen.x, screen.y);
      }
      prevScreen = screen;
    }
    ctx.stroke();
  };

  const drawFittedCurve = (ctx, userPoints, fit, type) => {
    const { xMin, xMax } = viewport;
    const numPoints = 500;
    const step = (xMax - xMin) / numPoints;
    
    ctx.strokeStyle = '#E5005A';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();

    let started = false;

    for (let i = 0; i <= numPoints; i++) {
      const x = xMin + i * step;
      let y = null;

      // Calculate y based on fit type
      const coeffs = fit.coefficients;
      switch (type) {
        case FIT_TYPES.LINEAR:
          y = coeffs[0] * x + coeffs[1];
          break;
        case FIT_TYPES.POLYNOMIAL_2:
        case FIT_TYPES.POLYNOMIAL_3:
        case FIT_TYPES.POLYNOMIAL_4:
          y = coeffs.reduce((sum, c, i) => sum + c * Math.pow(x, i), 0);
          break;
        case FIT_TYPES.EXPONENTIAL:
          y = coeffs[0] * Math.exp(coeffs[1] * x);
          break;
        case FIT_TYPES.LOGARITHMIC:
          if (x > 0) y = coeffs[0] * Math.log(x) + coeffs[1];
          break;
        case FIT_TYPES.POWER:
          if (x > 0) y = coeffs[0] * Math.pow(x, coeffs[1]);
          break;
        default:
          y = coeffs[0] * x + coeffs[1];
      }

      if (y !== null && isFinite(y) && Math.abs(y) < 1e10) {
        const screen = graphToScreen(x, y);
        if (!started) {
          ctx.moveTo(screen.x, screen.y);
          started = true;
        } else {
          ctx.lineTo(screen.x, screen.y);
        }
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawPoint = (ctx, x, y, color, index) => {
    // Outer circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Inner circle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Label
    ctx.fillStyle = '#666666';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`P${index + 1}`, x + 12, y - 4);
  };

  // Event handlers
  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const graphCoords = screenToGraph(screenX, screenY);
    setMousePos(graphCoords);
    setShowCoords(true);

    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      
      const { xMin, xMax, yMin, yMax } = viewport;
      const xRange = xMax - xMin;
      const yRange = yMax - yMin;
      
      const xShift = (dx / dimensions.width) * xRange;
      const yShift = (dy / dimensions.height) * yRange;
      
      setViewport({
        xMin: xMin - xShift,
        xMax: xMax - xShift,
        yMin: yMin + yShift,
        yMax: yMax + yShift,
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle click or Alt+click for panning
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
    }
  };

  const handleClick = (e) => {
    if (mode === 'point' && !isPanning) {
      const rect = canvasRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const graphCoords = screenToGraph(screenX, screenY);
      
      // Round to reasonable precision
      const x = Math.round(graphCoords.x * 100) / 100;
      const y = Math.round(graphCoords.y * 100) / 100;
      
      onAddPoint({ x, y });
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (mode === 'point') {
      const rect = canvasRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      
      // Check if clicking near a point
      for (let i = 0; i < points.length; i++) {
        const pointScreen = graphToScreen(points[i].x, points[i].y);
        const dist = Math.sqrt(
          Math.pow(screenX - pointScreen.x, 2) + 
          Math.pow(screenY - pointScreen.y, 2)
        );
        if (dist < 15) {
          onRemovePoint(i);
          return;
        }
      }
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const graphCoords = screenToGraph(screenX, screenY);
    
    const { xMin, xMax, yMin, yMax } = viewport;
    
    setViewport({
      xMin: graphCoords.x - (graphCoords.x - xMin) * zoomFactor,
      xMax: graphCoords.x + (xMax - graphCoords.x) * zoomFactor,
      yMin: graphCoords.y - (graphCoords.y - yMin) * zoomFactor,
      yMax: graphCoords.y + (yMax - graphCoords.y) * zoomFactor,
    });
  };

  const handleMouseLeave = () => {
    setShowCoords(false);
    setIsPanning(false);
  };

  // Zoom controls
  const zoomIn = () => {
    const { xMin, xMax, yMin, yMax } = viewport;
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const xRange = (xMax - xMin) * 0.8;
    const yRange = (yMax - yMin) * 0.8;
    setViewport({
      xMin: xCenter - xRange / 2,
      xMax: xCenter + xRange / 2,
      yMin: yCenter - yRange / 2,
      yMax: yCenter + yRange / 2,
    });
  };

  const zoomOut = () => {
    const { xMin, xMax, yMin, yMax } = viewport;
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const xRange = (xMax - xMin) * 1.25;
    const yRange = (yMax - yMin) * 1.25;
    setViewport({
      xMin: xCenter - xRange / 2,
      xMax: xCenter + xRange / 2,
      yMin: yCenter - yRange / 2,
      yMax: yCenter + yRange / 2,
    });
  };

  const resetView = () => {
    setViewport({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
  };

  return (
    <div ref={containerRef} className="graph-area" data-testid="graph-area">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="graph-canvas"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        data-testid="graph-canvas"
      />
      
      {mode === 'point' && (
        <div className="mode-indicator" data-testid="mode-indicator">
          Point Mode: Click to add points
        </div>
      )}

      {showCoords && (
        <div className="coordinates-display" data-testid="coordinates-display">
          x: {mousePos.x.toFixed(2)}, y: {mousePos.y.toFixed(2)}
        </div>
      )}

      <div className="zoom-controls">
        <button
          onClick={zoomIn}
          className="btn-brutalist p-2 bg-white border border-black/20 hover:bg-black hover:text-white"
          data-testid="zoom-in-btn"
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 6v12M6 12h12" />
          </svg>
        </button>
        <button
          onClick={zoomOut}
          className="btn-brutalist p-2 bg-white border border-black/20 hover:bg-black hover:text-white"
          data-testid="zoom-out-btn"
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 12h12" />
          </svg>
        </button>
        <button
          onClick={resetView}
          className="btn-brutalist p-2 bg-white border border-black/20 hover:bg-black hover:text-white"
          data-testid="reset-view-btn"
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GraphCanvas;
