import Box from '@mui/material/Box';

function BoardContent() {
  return (
    <Box
      sx={{
        backgroundColor: 'primary.light',
        width: '100%',
        height: (theme) =>
          `calc( 100vh - ${theme.trello.boardBarHeight} - ${theme.trello.boardBarHeight} )`,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      Board content
    </Box>
  );
}

export default BoardContent;
