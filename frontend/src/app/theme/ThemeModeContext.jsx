/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { getThemeConfig } from './index';

const ThemeModeContext = createContext({
    mode: 'light',
    toggleThemeMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

export const ThemeModeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode === 'dark' || savedMode === 'light' ? savedMode : 'light';
    });

    const toggleThemeMode = () => {
        setMode((prevMode) => {
            const nextMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', nextMode);
            return nextMode;
        });
    };

    const theme = useMemo(() => getThemeConfig(mode), [mode]);

    return (
        <ThemeModeContext.Provider value={{ mode, toggleThemeMode }}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
};
