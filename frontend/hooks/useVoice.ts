// hooks/useVoice.ts

import { useContext } from 'react';
import { VoiceContext } from '../contexts/VoiceContext';

export const useVoice = () => {
    const context = useContext(VoiceContext);

    if (context === undefined) {
        throw new Error('useVoice must be used within a VoiceProvider');
    }

    return context;
};
