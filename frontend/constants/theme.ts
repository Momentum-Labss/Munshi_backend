// constants/theme.ts

// Brand Colors (used across both themes)
export const BrandColors = {
    primary: '#1a223d',        // Your brand dark blue
    primaryLight: '#242d4a',
    primaryDark: '#151b30',
};

// Base spacing, typography, etc (theme-independent)
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

export const BorderRadius = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
};

export const Typography = {
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
        huge: 40,
    },
    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const Shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

export const Animation = {
    duration: {
        fast: 200,
        normal: 300,
        slow: 500,
    },
};

// LIGHT MODE COLORS
export const LightColors = {
    // Brand color for accents, buttons, etc
    primary: '#1a223d',
    primaryDark: '#151b30',
    primaryLight: '#242d4a',

    // Light mode backgrounds
    background: {
        primary: '#FFFFFF',      // White background
        secondary: '#F9FAFB',    // Light gray
        card: '#FFFFFF',
        input: '#F3F4F6',
        elevated: '#FFFFFF',
    },

    // Light mode text
    text: {
        primary: '#111827',      // Almost black
        secondary: '#6B7280',    // Gray
        tertiary: '#9CA3AF',
        disabled: '#D1D5DB',
        placeholder: '#9CA3AF',
        link: '#1a223d',         // Brand color for links
    },

    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    otp: {
        box: '#F3F4F6',
        boxActive: '#E5E7EB',
        boxFilled: '#1a223d',    // Brand color
        text: '#111827',
    },

    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    divider: '#E5E7EB',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
};

// DARK MODE COLORS
export const DarkColors = {
    // Brand color for accents, buttons, etc
    primary: '#4F8EF7',        // Brighter blue for dark mode visibility
    primaryDark: '#3B82F6',
    primaryLight: '#60A5FA',

    // Dark mode backgrounds
    background: {
        primary: '#0F172A',      // Very dark blue-gray
        secondary: '#1E293B',    // Lighter dark
        card: '#1E293B',
        input: '#334155',
        elevated: '#334155',
    },

    // Dark mode text
    text: {
        primary: '#F8FAFC',      // Almost white
        secondary: '#CBD5E1',    // Light gray
        tertiary: '#94A3B8',
        disabled: '#64748B',
        placeholder: '#64748B',
        link: '#60A5FA',         // Bright blue for links
    },

    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    otp: {
        box: '#334155',
        boxActive: '#475569',
        boxFilled: '#4F8EF7',    // Bright blue
        text: '#F8FAFC',
    },

    border: '#334155',
    borderLight: '#1E293B',
    divider: '#334155',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.5)',
};

export type ColorScheme = typeof LightColors;

// Complete theme structure
export const createTheme = (colors: ColorScheme) => ({
    colors,
    brand: BrandColors,  // Always accessible for splash/branding
    spacing: Spacing,
    borderRadius: BorderRadius,
    typography: Typography,
    shadows: Shadows,
    animation: Animation,
});

export type Theme = ReturnType<typeof createTheme>;