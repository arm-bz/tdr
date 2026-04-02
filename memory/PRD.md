# GraphSolver - Mathematical Graphing Tool

## Original Problem Statement
Create a graphing tool for mathematical functions with:
- Left sidebar for equation input with immediate plotting
- Add points to coordinate plane, connect them, auto-generate equations
- Variable connection types (curve, straight line, etc.)
- Show equation for auto-generated graphics

## User Choices
- All function types (linear, quadratic, polynomial, trigonometric, exponential, logarithmic)
- Both linear regression and polynomial interpolation + more curve fitting options
- Zoom/pan, multiple functions with colors, export as PNG
- No authentication needed

## Architecture
- **Frontend**: React with Canvas-based graphing
- **Libraries**: mathjs (expression evaluation), regression (curve fitting), html-to-image (export)
- **UI**: Shadcn components with Swiss Brutalist design aesthetic
- **Fonts**: Outfit, IBM Plex Sans, JetBrains Mono

## What's Been Implemented (Jan 2026)
- [x] Real-time equation plotting with multiple function support (up to 5)
- [x] Support for all function types: sin, cos, tan, log, exp, sqrt, abs, powers
- [x] Interactive Points mode - click canvas to add points
- [x] 7 curve fitting types: Linear, Quadratic, Cubic, Quartic, Exponential, Logarithmic, Power
- [x] Auto-generated equation display with R² coefficient
- [x] Zoom/Pan controls (scroll wheel, Alt+drag)
- [x] Color-coded functions (red, blue, green, orange, pink)
- [x] Export graph as PNG
- [x] Toast notifications for user feedback
- [x] Coordinate display on hover
- [x] Clear points functionality

## Core Requirements (Static)
1. Equation input → immediate graph plotting
2. Point placement → curve fitting → equation generation
3. Multiple curve fitting algorithms
4. User-friendly interface

## Prioritized Backlog
### P0 (Critical) - DONE
- Real-time plotting ✓
- Points mode ✓
- Curve fitting ✓

### P1 (Important) - Future
- Save/load graph configurations
- More advanced functions (derivatives, integrals)
- Intersection point detection

### P2 (Nice to have) - Future
- Dark mode theme
- Graph animation
- Share graph via link
- Mobile responsive improvements

## Next Tasks
1. Add derivative/integral visualization
2. Implement intersection point calculation
3. Add graph history/undo functionality
