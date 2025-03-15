import { experimental_extendTheme as extendTheme } from '@mui/material/styles';
import { cyan, deepOrange, orange, teal } from '@mui/material/colors';

// Create a theme instance.
const theme = extendTheme({
  trello: {
    appBarHeight: '70px',
    boardBarHeight: '70px',
  },
  colorSchemes: {
    // light: {
    //   palette: {
    //     primary: teal,
    //     secondary: deepOrange,
    //   },
    // },
    // dark: {
    //   palette: {
    //     primary: cyan,
    //     secondary: orange,
    //   },
    // },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderWidth: '0.5px',
          '&:hover': {
            borderWidth: '0.5px',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875 rem',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          '& fieldSet': {
            borderWidth: '0.5px !important',
          },
          '&:hover fieldSet': {
            borderWidth: '1px !important',
          },
          '&.Mui-focused fieldSet': {
            borderWidth: '1px !important',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '*::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: '#dcdde1',
            borderRadius: '6px',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#white',
          },
        },
      },
    },
  },
});

export default theme;
