import Container from '@mui/material/Container';
import AppBar from '~/components/AppBar/AppBar';
import BoardBar from './BoardBar/BoardBar';
import BoardContent from './BoardContent/BoardContent';
import { useEffect, useState } from 'react';
import { fetchBoardDetailsAPI } from '~/apis';

function Board() {
  const [board, setBoard] = useState(null);

  useEffect(() => {
    const boardId = '67f28de9d34984f4b659bd63';

    // Call API
    fetchBoardDetailsAPI(boardId).then((board) => {
      setBoard(board);
    });
  }, []);

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent board={board} />
    </Container>
  );
}

export default Board;
