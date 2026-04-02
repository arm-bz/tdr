import { create, all } from 'mathjs';
import regression from 'regression';

const math = create(all);

// Graph colors
export const GRAPH_COLORS = [
  '#FF2A00', // Red
  '#002FA7', // Blue
  '#007A33', // Green
  '#FF9500', // Orange
  '#E5005A', // Pink
];

// Parse and evaluate mathematical expression
export function evaluateExpression(expression, x) {
  try {
    const scope = { x };
    const result = math.evaluate(expression, scope);
    if (typeof result === 'number' && isFinite(result)) {
      return result;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Validate if expression is valid
export function isValidExpression(expression) {
  if (!expression || expression.trim() === '') return false;
  try {
    const scope = { x: 1 };
    const result = math.evaluate(expression, scope);
    return typeof result === 'number';
  } catch (e) {
    return false;
  }
}

// Generate points for plotting an equation
export function generatePlotPoints(expression, xMin, xMax, numPoints = 500) {
  const points = [];
  const step = (xMax - xMin) / numPoints;
  
  for (let i = 0; i <= numPoints; i++) {
    const x = xMin + i * step;
    const y = evaluateExpression(expression, x);
    if (y !== null && Math.abs(y) < 1e10) {
      points.push({ x, y });
    }
  }
  
  return points;
}

// Fit types for curve fitting
export const FIT_TYPES = {
  LINEAR: 'linear',
  POLYNOMIAL_2: 'polynomial_2',
  POLYNOMIAL_3: 'polynomial_3',
  POLYNOMIAL_4: 'polynomial_4',
  EXPONENTIAL: 'exponential',
  LOGARITHMIC: 'logarithmic',
  POWER: 'power',
};

export const FIT_TYPE_LABELS = {
  [FIT_TYPES.LINEAR]: 'Linear',
  [FIT_TYPES.POLYNOMIAL_2]: 'Quadratic',
  [FIT_TYPES.POLYNOMIAL_3]: 'Cubic',
  [FIT_TYPES.POLYNOMIAL_4]: 'Quartic',
  [FIT_TYPES.EXPONENTIAL]: 'Exponential',
  [FIT_TYPES.LOGARITHMIC]: 'Logarithmic',
  [FIT_TYPES.POWER]: 'Power',
};

// Perform curve fitting on points
export function fitCurve(points, fitType) {
  if (points.length < 2) {
    return { equation: '', coefficients: [], r2: 0, valid: false };
  }

  const data = points.map(p => [p.x, p.y]);

  try {
    let result;
    let equation = '';

    switch (fitType) {
      case FIT_TYPES.LINEAR:
        result = regression.linear(data);
        equation = formatLinearEquation(result.equation);
        break;

      case FIT_TYPES.POLYNOMIAL_2:
        result = regression.polynomial(data, { order: 2 });
        equation = formatPolynomialEquation(result.equation);
        break;

      case FIT_TYPES.POLYNOMIAL_3:
        result = regression.polynomial(data, { order: 3 });
        equation = formatPolynomialEquation(result.equation);
        break;

      case FIT_TYPES.POLYNOMIAL_4:
        result = regression.polynomial(data, { order: 4 });
        equation = formatPolynomialEquation(result.equation);
        break;

      case FIT_TYPES.EXPONENTIAL:
        // Filter out non-positive y values for exponential
        const expData = data.filter(([_, y]) => y > 0);
        if (expData.length < 2) {
          return { equation: 'Cannot fit (requires positive y values)', coefficients: [], r2: 0, valid: false };
        }
        result = regression.exponential(expData);
        equation = formatExponentialEquation(result.equation);
        break;

      case FIT_TYPES.LOGARITHMIC:
        // Filter out non-positive x values for logarithmic
        const logData = data.filter(([x, _]) => x > 0);
        if (logData.length < 2) {
          return { equation: 'Cannot fit (requires positive x values)', coefficients: [], r2: 0, valid: false };
        }
        result = regression.logarithmic(logData);
        equation = formatLogarithmicEquation(result.equation);
        break;

      case FIT_TYPES.POWER:
        // Filter out non-positive values for power
        const powerData = data.filter(([x, y]) => x > 0 && y > 0);
        if (powerData.length < 2) {
          return { equation: 'Cannot fit (requires positive values)', coefficients: [], r2: 0, valid: false };
        }
        result = regression.power(powerData);
        equation = formatPowerEquation(result.equation);
        break;

      default:
        result = regression.linear(data);
        equation = formatLinearEquation(result.equation);
    }

    return {
      equation,
      coefficients: result.equation,
      r2: result.r2,
      valid: true,
      predict: result.predict,
    };
  } catch (e) {
    console.error('Curve fitting error:', e);
    return { equation: 'Error fitting curve', coefficients: [], r2: 0, valid: false };
  }
}

// Format equations for display
function formatLinearEquation(coeffs) {
  const [m, b] = coeffs;
  const mStr = formatCoeff(m);
  const bStr = formatConstant(b);
  return `y = ${mStr}x ${bStr}`;
}

function formatPolynomialEquation(coeffs) {
  const terms = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const coeff = coeffs[i];
    if (Math.abs(coeff) < 1e-10) continue;
    
    let term = '';
    if (i === coeffs.length - 1) {
      term = formatCoeff(coeff);
    } else {
      term = coeff >= 0 ? `+ ${formatCoeff(Math.abs(coeff))}` : `- ${formatCoeff(Math.abs(coeff))}`;
    }
    
    if (i > 1) {
      term += `x^${i}`;
    } else if (i === 1) {
      term += 'x';
    }
    
    terms.push(term);
  }
  return `y = ${terms.join(' ')}`;
}

function formatExponentialEquation(coeffs) {
  const [a, b] = coeffs;
  return `y = ${formatCoeff(a)} * e^(${formatCoeff(b)}x)`;
}

function formatLogarithmicEquation(coeffs) {
  const [a, b] = coeffs;
  const bStr = formatConstant(b);
  return `y = ${formatCoeff(a)} * ln(x) ${bStr}`;
}

function formatPowerEquation(coeffs) {
  const [a, b] = coeffs;
  return `y = ${formatCoeff(a)} * x^${formatCoeff(b)}`;
}

function formatCoeff(num) {
  if (Math.abs(num - Math.round(num)) < 0.0001) {
    return Math.round(num).toString();
  }
  return num.toFixed(4).replace(/\.?0+$/, '');
}

function formatConstant(num) {
  if (Math.abs(num) < 1e-10) return '';
  const formatted = formatCoeff(Math.abs(num));
  return num >= 0 ? `+ ${formatted}` : `- ${formatted}`;
}

// Generate evaluable expression from fit result
export function fitResultToExpression(fitResult, fitType) {
  if (!fitResult.valid || !fitResult.coefficients.length) return null;

  const coeffs = fitResult.coefficients;

  switch (fitType) {
    case FIT_TYPES.LINEAR:
      return `${coeffs[0]} * x + ${coeffs[1]}`;

    case FIT_TYPES.POLYNOMIAL_2:
    case FIT_TYPES.POLYNOMIAL_3:
    case FIT_TYPES.POLYNOMIAL_4:
      return coeffs.map((c, i) => `${c} * x^${i}`).join(' + ');

    case FIT_TYPES.EXPONENTIAL:
      return `${coeffs[0]} * exp(${coeffs[1]} * x)`;

    case FIT_TYPES.LOGARITHMIC:
      return `${coeffs[0]} * log(x) + ${coeffs[1]}`;

    case FIT_TYPES.POWER:
      return `${coeffs[0]} * x^${coeffs[1]}`;

    default:
      return null;
  }
}
