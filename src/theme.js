import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

const APP_BAR_HEIGHT = '58px';
const BOARD_BAR_HEIGHT = '58px';
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`;

// Create a theme instance.
const theme = extendTheme({
  trello: {
    appBarHeight: APP_BAR_HEIGHT,
    boardBarHeight: BOARD_BAR_HEIGHT,
    boardContentHeight: BOARD_CONTENT_HEIGHT,
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
          '&.MuiTypography-body1': { fontSize: '0.875rem' },
        },
      },
    },
    MuiTypography: {
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
            backgroundColor: 'white',
          },
        },
      },
    },
  },
});

export default theme;
