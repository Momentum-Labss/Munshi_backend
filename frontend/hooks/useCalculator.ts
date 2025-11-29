import { useCallback, useState } from 'react';

export interface UseCalculatorReturn {
    display: string;
    result: number;
    addDigit: (digit: string) => void;
    addOperation: (op: '+' | '-' | '/' | '×') => void;
    calculate: () => void;
    clear: () => void;
    setDisplay: (value: string) => void;
}

export const useCalculator = (): UseCalculatorReturn => {
    const [display, setDisplay] = useState<string>('');
    const [result, setResult] = useState<number>(0);

    const addDigit = useCallback((digit: string) => {
        setDisplay((prev) => {
            // Prevent multiple decimal points in the same number
            const parts = prev.split(/[\+\-\×\/]/);
            const lastPart = parts[parts.length - 1];
            if (digit === '.' && lastPart.includes('.')) {
                return prev;
            }
            return prev + digit;
        });
    }, []);

    const addOperation = useCallback((op: '+' | '-' | '/' | '×') => {
        setDisplay((prev) => {
            // Don't add operation if display is empty
            if (!prev) return prev;

            // Replace last character if it's already an operation
            const lastChar = prev[prev.length - 1];
            if (['+', '-', '×', '/'].includes(lastChar)) {
                return prev.slice(0, -1) + op;
            }

            return prev + op;
        });
    }, []);

    const calculate = useCallback(() => {
        if (!display) return;

        try {
            // Replace × with * and convert to standard math expression
            const expression = display.replace(/×/g, '*').replace(/÷/g, '/');

            // Evaluate the expression
            // eslint-disable-next-line no-eval
            const calculatedResult = eval(expression);

            setResult(calculatedResult);
            setDisplay(calculatedResult.toString());
        } catch (error) {
            console.error('Calculation error:', error);
            setResult(0);
        }
    }, [display]);

    const clear = useCallback(() => {
        setDisplay('');
        setResult(0);
    }, []);

    return {
        display,
        result,
        addDigit,
        addOperation,
        calculate,
        clear,
        setDisplay,
    };
};
