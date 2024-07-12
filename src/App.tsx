import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";
import { Main } from "views/Main/Main";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Main />
    </ThemeProvider>
  );
};

export { App };
