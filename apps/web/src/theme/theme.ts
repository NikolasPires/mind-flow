import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#00897b' },
    secondary: { main: '#6B7280' },
    background: { default: '#FAFAFA' },
  },
  shape: { borderRadius: 10 },
});
