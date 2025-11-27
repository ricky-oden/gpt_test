import { useMemo, useState } from 'react';
import './App.css';

type Operator = '+' | '-' | '×' | '÷' | null;

type PendingCalculation = {
  operand: number;
  operator: Operator;
};

type KeyButton = {
  label: string;
  kind: 'digit' | 'operator' | 'utility';
};

const KEYS: KeyButton[] = [
  { label: 'C', kind: 'utility' },
  { label: '⌫', kind: 'utility' },
  { label: '÷', kind: 'operator' },
  { label: '7', kind: 'digit' },
  { label: '8', kind: 'digit' },
  { label: '9', kind: 'digit' },
  { label: '×', kind: 'operator' },
  { label: '4', kind: 'digit' },
  { label: '5', kind: 'digit' },
  { label: '6', kind: 'digit' },
  { label: '-', kind: 'operator' },
  { label: '1', kind: 'digit' },
  { label: '2', kind: 'digit' },
  { label: '3', kind: 'digit' },
  { label: '+', kind: 'operator' },
  { label: '0', kind: 'digit' },
  { label: '.', kind: 'digit' },
  { label: '=', kind: 'utility' },
];

const operatorMap: Record<Exclude<Operator, null>, (a: number, b: number) => number> = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => b === 0 ? NaN : a / b,
};

function formatNumber(value: number): string {
  if (Number.isNaN(value)) return 'Error';
  if (!Number.isFinite(value)) return '∞';
  const asString = value.toString();
  const [whole, fraction] = asString.split('.');
  const formattedWhole = Number(whole).toLocaleString('ja-JP');
  return fraction ? `${formattedWhole}.${fraction}` : formattedWhole;
}

function App() {
  const [display, setDisplay] = useState('0');
  const [pending, setPending] = useState<PendingCalculation | null>(null);
  const [overwrite, setOverwrite] = useState(false);

  const currentValue = useMemo(() => Number(display.replace(/,/g, '')), [display]);

  const handleDigit = (digit: string) => {
    setDisplay((prev) => {
      if (overwrite) {
        setOverwrite(false);
        return digit === '.' ? '0.' : digit;
      }

      if (digit === '.' && prev.includes('.')) {
        return prev;
      }

      if (prev === '0' && digit !== '.') {
        return digit;
      }

      return `${prev}${digit}`;
    });
  };

  const handleOperator = (operator: Exclude<Operator, null>) => {
    if (pending && !overwrite) {
      const result = calculate(pending, currentValue);
      setPending({ operand: result, operator });
      setDisplay(formatNumber(result));
      setOverwrite(true);
      return;
    }

    setPending({ operand: currentValue, operator });
    setOverwrite(true);
  };

  const handleEquals = () => {
    if (!pending) return;

    const result = calculate(pending, currentValue);
    setDisplay(formatNumber(result));
    setPending(null);
    setOverwrite(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPending(null);
    setOverwrite(false);
  };

  const handleBackspace = () => {
    setDisplay((prev) => {
      if (overwrite) {
        setOverwrite(false);
        return '0';
      }

      if (prev.length <= 1) return '0';
      if (prev === '-0') return '0';
      const next = prev.slice(0, -1);
      return next === '-' ? '0' : next;
    });
  };

  const calculate = (calculation: PendingCalculation, nextValue: number) => {
    const { operand, operator } = calculation;
    const operation = operatorMap[operator];
    const result = operation(operand, nextValue);
    return Number.isFinite(result) ? Number(result.toPrecision(12)) : result;
  };

  const renderDisplay = formatNumber(currentValue);

  return (
    <div className="app">
      <header>
        <p className="tag">React + TypeScript</p>
        <h1>シンプル電卓</h1>
        <p className="caption">基本的な四則演算に対応したシンプルな電卓です。</p>
      </header>

      <div className="calculator">
        <div className="display" aria-live="polite">
          <div className="pending">
            {pending ? `${formatNumber(pending.operand)} ${pending.operator ?? ''}` : ''}
          </div>
          <div className="current">{renderDisplay}</div>
        </div>

        <div className="keys" role="grid" aria-label="calculator keypad">
          {KEYS.map((key) => (
            <button
              key={key.label}
              className={`key key-${key.kind} key-${key.label === '=' ? 'equal' : key.label}`}
              onClick={() => {
                if (key.kind === 'digit') {
                  handleDigit(key.label);
                } else if (key.kind === 'operator') {
                  handleOperator(key.label as Exclude<Operator, null>);
                } else {
                  if (key.label === '=') {
                    handleEquals();
                  } else if (key.label === 'C') {
                    handleClear();
                  } else if (key.label === '⌫') {
                    handleBackspace();
                  }
                }
              }}
              aria-label={`key ${key.label}`}
            >
              {key.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
