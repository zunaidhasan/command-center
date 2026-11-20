/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#090B10',
          darker: '#06070B',
          lighter: '#0D1017',
        },
        surface: {
          DEFAULT: '#11151D',
          secondary: '#181D27',
          tertiary: '#202634',
          hover: '#242C3C',
        },
        border: {
          DEFAULT: '#262C37',
          subtle: '#1C222D',
          hover: '#374151',
          focus: '#EF233C',
        },
        primary: {
          DEFAULT: '#EF233C',
          hover: '#D90429',
          light: '#FF4D6D',
          glow: 'rgba(239, 35, 60, 0.25)',
        },
        accent: {
          engineering: '#1EA7FF',
          client: '#18D879',
          creative: '#B66BFF',
          personal: '#FFB21A',
        },
        text: {
          primary: '#F5F6F8',
          secondary: '#9DA5B4',
          muted: '#7E8799',
        }
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['"Space Grotesk Variable"', '"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
        'sm-card': '8px',
        'lg-card': '16px',
        'pill': '9999px',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'glow-primary': '0 0 24px rgba(239, 35, 60, 0.25)',
        'glow-blue': '0 0 24px rgba(30, 167, 255, 0.2)',
        'glow-green': '0 0 24px rgba(24, 216, 121, 0.2)',
        'glow-purple': '0 0 24px rgba(182, 107, 255, 0.2)',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
