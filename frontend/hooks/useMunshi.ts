// hooks/useMunshi.ts

import { useContext } from 'react';
import { MunshiContext } from '../contexts/MunshiContext';

export const useMunshi = () => {
    const context = useContext(MunshiContext);

    if (context === undefined) {
        throw new Error('useMunshi must be used within a MunshiProvider');
    }

    return context;
};
