"use client";

import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme"; // Ensure correct path

export default function SnackbarWrapper({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Ensures global styles are applied */}
      <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>
    </ThemeProvider>
  );
}
