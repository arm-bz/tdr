import React, { useState, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import GraphCanvas from './components/GraphCanvas';
import Sidebar from './components/Sidebar';
import { FIT_TYPES } from './utils/graphMath';
import './App.css';

function App() {
  // State for equations
  const [equations, setEquations] = useState([
    { id: 1, expression: '' }
  ]);
  const [nextEquationId, setNextEquationId] = useState(2);

  // State for points
  const [points, setPoints] = useState([]);

  // State for curve fitting type
  const [fitType, setFitType] = useState(FIT_TYPES.LINEAR);

  // State for mode (equation or point)
  const [mode, setMode] = useState('equation');

  // Ref for export
  const graphAreaRef = useRef(null);

  // Equation handlers
  const handleAddEquation = useCallback(() => {
    if (equations.length >= 5) {
      toast.error('Maximum 5 functions allowed');
      return;
    }
    setEquations(prev => [...prev, { id: nextEquationId, expression: '' }]);
    setNextEquationId(prev => prev + 1);
  }, [equations.length, nextEquationId]);

  const handleUpdateEquation = useCallback((id, expression) => {
    setEquations(prev => 
      prev.map(eq => eq.id === id ? { ...eq, expression } : eq)
    );
  }, []);

  const handleRemoveEquation = useCallback((id) => {
    setEquations(prev => prev.filter(eq => eq.id !== id));
  }, []);

  // Point handlers
  const handleAddPoint = useCallback((point) => {
    setPoints(prev => [...prev, point]);
    toast.success(`Point added: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`);
  }, []);

  const handleRemovePoint = useCallback((index) => {
    setPoints(prev => prev.filter((_, i) => i !== index));
    toast.info('Point removed');
  }, []);

  const handleClearPoints = useCallback(() => {
    setPoints([]);
    toast.info('All points cleared');
  }, []);

  // Mode handler
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    if (newMode === 'point') {
      toast.info('Click on the graph to add points. Right-click to remove.');
    }
  }, []);

  // Export handler
  const handleExport = useCallback(async () => {
    const graphArea = document.querySelector('[data-testid="graph-area"]');
    if (!graphArea) {
      toast.error('Could not find graph to export');
      return;
    }

    try {
      const dataUrl = await toPng(graphArea, {
        quality: 1,
        backgroundColor: '#FFFFFF',
      });

      const link = document.createElement('a');
      link.download = `graph-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Graph exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export graph');
    }
  }, []);

  return (
    <div className="app-container" data-testid="app-container">
      <Sidebar
        equations={equations}
        onAddEquation={handleAddEquation}
        onUpdateEquation={handleUpdateEquation}
        onRemoveEquation={handleRemoveEquation}
        points={points}
        onClearPoints={handleClearPoints}
        onRemovePoint={handleRemovePoint}
        fitType={fitType}
        onFitTypeChange={setFitType}
        mode={mode}
        onModeChange={handleModeChange}
        onExport={handleExport}
      />
      <GraphCanvas
        ref={graphAreaRef}
        equations={equations}
        points={points}
        fitType={fitType}
        onAddPoint={handleAddPoint}
        onRemovePoint={handleRemovePoint}
        mode={mode}
      />
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
