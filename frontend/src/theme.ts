'use client';
import { createTheme } from '@mui/material/styles';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
    weight: ['300', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
});

// Original teal color scheme
const theme = createTheme({
    cssVariables: {
        colorSchemeSelector: 'class'
    },
    colorSchemes: {
        light: {
            palette: {
                primary: {
                    main: '#00897B',
                    light: '#4DB6AC',
                    dark: '#00695C',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#FF8A65',
                    light: '#FFAB91',
                    dark: '#E64A19',
                    contrastText: '#000000',
                },
                background: {
                    default: '#F8FAF9',
                    paper: '#FFFFFF',
                },
                text: {
                    primary: '#1C1B1F',
                    secondary: '#49454F',
                },
            },
        },
        dark: {
            palette: {
                primary: {
                    main: '#80CBC4',
                    light: '#B2DFDB',
                    dark: '#4DB6AC',
                    contrastText: '#003731',
                },
                secondary: {
                    main: '#FFAB91',
                    light: '#FFCCBC',
                    dark: '#FF8A65',
                    contrastText: '#000000',
                },
                background: {
                    default: '#121212',
                    paper: '#1E1E1E',
                },
                text: {
                    primary: '#E6E1E5',
                    secondary: '#CAC4D0',
                },
            },
        },
    },
    typography: {
        fontFamily: plusJakarta.style.fontFamily,
        h1: {
            fontWeight: 700,
            letterSpacing: '-0.03em',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h3: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h4: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            letterSpacing: '0.01em',
        },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 100,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '10px 24px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 137, 123, 0.25)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 20,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 100,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                    },
                },
            },
        },
    },
});

export default theme;