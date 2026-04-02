import React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { GRAPH_COLORS, FIT_TYPES, FIT_TYPE_LABELS, fitCurve } from '../utils/graphMath';
import { X, Plus, Download, Trash2 } from 'lucide-react';

const Sidebar = ({
  equations,
  onAddEquation,
  onUpdateEquation,
  onRemoveEquation,
  points,
  onClearPoints,
  onRemovePoint,
  fitType,
  onFitTypeChange,
  mode,
  onModeChange,
  onExport,
}) => {
  // Calculate fit result
  const fitResult = points.length >= 2 ? fitCurve(points, fitType) : null;

  return (
    <div className="sidebar" data-testid="sidebar">
      <ScrollArea className="flex-1">
        {/* Header */}
        <div className="sidebar-section">
          <h1 className="font-outfit text-2xl font-light tracking-tight text-black">
            Graph<span className="font-medium">Solver</span>
          </h1>
          <p className="text-xs text-black/50 mt-1 font-mono tracking-wide">
            MATHEMATICAL GRAPHING TOOL
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="sidebar-section">
          <div className="section-label">Mode</div>
          <div className="flex gap-2">
            <Button
              variant={mode === 'equation' ? 'default' : 'outline'}
              className={`flex-1 font-mono text-xs uppercase tracking-wider ${
                mode === 'equation' 
                  ? 'bg-black text-white hover:bg-black/80' 
                  : 'bg-white border-black/20 hover:bg-black hover:text-white'
              }`}
              onClick={() => onModeChange('equation')}
              data-testid="mode-equation-btn"
            >
              Equations
            </Button>
            <Button
              variant={mode === 'point' ? 'default' : 'outline'}
              className={`flex-1 font-mono text-xs uppercase tracking-wider ${
                mode === 'point' 
                  ? 'bg-black text-white hover:bg-black/80' 
                  : 'bg-white border-black/20 hover:bg-black hover:text-white'
              }`}
              onClick={() => onModeChange('point')}
              data-testid="mode-point-btn"
            >
              Points
            </Button>
          </div>
        </div>

        <Separator />

        {/* Equations Section */}
        <div className="sidebar-section">
          <div className="section-label">Functions</div>
          
          <div className="space-y-3">
            {equations.map((eq, index) => (
              <div key={eq.id} className="equation-row">
                <div 
                  className="color-indicator"
                  style={{ backgroundColor: GRAPH_COLORS[index % GRAPH_COLORS.length] }}
                />
                <Input
                  value={eq.expression}
                  onChange={(e) => onUpdateEquation(eq.id, e.target.value)}
                  placeholder="e.g., sin(x), x^2 + 2*x"
                  className="flex-1 font-mono text-sm bg-white border-black/20 focus:border-black focus:ring-1 focus:ring-black rounded-none"
                  data-testid={`equation-input-${index}`}
                />
                {equations.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveEquation(eq.id)}
                    className="h-8 w-8 hover:bg-black hover:text-white"
                    data-testid={`remove-equation-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={onAddEquation}
            className="w-full mt-3 font-mono text-xs uppercase tracking-wider bg-white border-black/20 hover:bg-black hover:text-white"
            disabled={equations.length >= 5}
            data-testid="add-equation-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Function
          </Button>

          <div className="mt-4 text-xs text-black/50 font-mono">
            <div className="font-medium mb-1 text-black/70">Supported functions:</div>
            <div>sin, cos, tan, log, exp, sqrt, abs</div>
            <div>Powers: x^2, x^3</div>
            <div>Constants: pi, e</div>
          </div>
        </div>

        <Separator />

        {/* Points Section */}
        <div className="sidebar-section">
          <div className="flex items-center justify-between mb-4">
            <div className="section-label mb-0">Points ({points.length})</div>
            {points.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearPoints}
                className="h-7 px-2 text-xs font-mono hover:bg-black hover:text-white"
                data-testid="clear-points-btn"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {points.length === 0 ? (
            <p className="text-xs text-black/50 font-mono">
              Switch to Points mode and click on the graph to add points.
            </p>
          ) : (
            <>
              <div className="points-list">
                {points.map((point, index) => (
                  <div key={index} className="point-tag">
                    <span>P{index + 1}</span>
                    <span className="text-black/50">
                      ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                    </span>
                    <button
                      onClick={() => onRemovePoint(index)}
                      className="ml-1 hover:text-red-600"
                      data-testid={`remove-point-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Fit Type Selection */}
              <div className="mt-4">
                <div className="section-label">Curve Fitting</div>
                <Select value={fitType} onValueChange={onFitTypeChange}>
                  <SelectTrigger 
                    className="w-full font-mono text-sm bg-white border-black/20 rounded-none"
                    data-testid="fit-type-select"
                  >
                    <SelectValue placeholder="Select fit type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {Object.entries(FIT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem 
                        key={key} 
                        value={key}
                        className="font-mono text-sm"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generated Equation */}
              {fitResult && fitResult.valid && (
                <div className="generated-equation" data-testid="generated-equation">
                  <div className="text-xs text-black/50 mb-1 uppercase tracking-wider">
                    Fitted Equation:
                  </div>
                  <div className="text-black font-medium">{fitResult.equation}</div>
                  <div className="text-xs text-black/50 mt-2">
                    R² = {fitResult.r2.toFixed(4)}
                  </div>
                </div>
              )}

              {fitResult && !fitResult.valid && (
                <div className="generated-equation text-red-600" data-testid="fit-error">
                  {fitResult.equation}
                </div>
              )}
            </>
          )}
        </div>

        <Separator />

        {/* Export Section */}
        <div className="sidebar-section">
          <Button
            variant="outline"
            onClick={onExport}
            className="w-full font-mono text-xs uppercase tracking-wider bg-white border-black/20 hover:bg-black hover:text-white"
            data-testid="export-graph-btn"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as PNG
          </Button>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="sidebar-section border-t border-black/10 py-3">
        <p className="text-xs text-black/40 font-mono text-center">
          Scroll: Zoom | Alt+Drag: Pan
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
