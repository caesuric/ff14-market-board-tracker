import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import Main from 'views/Main/Main';

const theme = createTheme({
    palette: {
        mode: 'dark'
    }
});

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Main />
        </ThemeProvider>
    )
}

