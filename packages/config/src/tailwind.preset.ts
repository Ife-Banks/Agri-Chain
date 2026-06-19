/** @type {import('tailwindcss').Config} */
export const tailwindPreset = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E8F5EC',
          100: '#C6E6CE',
          200: '#8ECFA0',
          400: '#2D8A50',
          600: '#1A6B3A',
          800: '#0F4A28',
          900: '#062D18',
        },
        success: '#1A6B3A',
        invest: '#2D8A50',
        bg: {
          page: '#F7F9FB',
          surface: '#FFFFFF',
          subtle: '#F0F4F8',
        },
        border: {
          default: '#CBD5E0',
          strong: '#A0AEC0',
        },
        text: {
          primary: '#2D3748',
          secondary: '#718096',
          disabled: '#CBD5E0',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      fontSize: {
        display: '32px',
        h1: '24px',
        h2: '18px',
        h3: '15px',
        body: '14px',
        sm: '13px',
        caption: '12px',
        overline: '11px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        full: '9999px',
      },
    },
  },
};
