import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary Rose Colors
                rose: {
                    primary: '#E11D48',
                    light: '#FDA4AF',
                    dark: '#9F1239',
                },
                // Neutral Backdrop
                cream: '#FFF1F2',
                blush: '#FFE4E6',
                // Card Accent Colors
                card: {
                    rose: '#FFF1F2',
                    lavender: '#F5F3FF',
                    peach: '#FFF7ED',
                    mint: '#F0FDF4',
                    sky: '#F0F9FF',
                },
                // Text Colors
                text: {
                    primary: '#1F2937',
                    secondary: '#6B7280',
                },
            },
            fontFamily: {
                heading: ['Playfair Display', 'serif'],
                body: ['Inter', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
                'heart-beat': 'heart-beat 0.6s ease-in-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                'heart-beat': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '25%': { transform: 'scale(1.2)' },
                    '50%': { transform: 'scale(1)' },
                    '75%': { transform: 'scale(1.1)' },
                },
            },
            boxShadow: {
                'rose': '0 4px 14px 0 rgba(225, 29, 72, 0.15)',
                'rose-lg': '0 10px 30px 0 rgba(225, 29, 72, 0.2)',
            },
        },
    },
    plugins: [],
};

export default config;
