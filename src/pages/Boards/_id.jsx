import Container from '@mui/material/Container';
import AppBar from '~/components/AppBar/AppBar';
import BoardBar from './BoardBar/BoardBar';
import BoardContent from './BoardContent/BoardContent';
import { useEffect, useState } from 'react';
import {
  fetchBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI,
} from '~/apis';

import { generatePlaceholderCard } from '~/utils/formatters';
import { isEmpty } from 'lodash';
// import { mockData } from '~/apis/mock-data';

function Board() {
  const [board, setBoard] = useState(null);

  useEffect(() => {
    const boardId = '67f2ac4d48a2d9c07445f498';

    // Call API
    fetchBoardDetailsAPI(boardId).then((board) => {
      // Xu ly van de keo tha khi column rong
      board.columns.forEach((column) => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)];
          column.cardOrderIds = [generatePlaceholderCard(column)._id];
        }
      });
      setBoard(board);
    });
  }, []);

  // Function goi API tao moi column va lam moi du lieu trong state
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id,
    });

    // Xu ly van de khi tao column moi thi khong keo tha duoc
    createdColumn.cards = [generatePlaceholderCard(createdColumn)];
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id];

    // Cap nhat lai state board
    const newBoard = { ...board };
    newBoard.columns.push(createdColumn);
    newBoard.columnOrderIds.push(createdColumn._id);
    setBoard(newBoard);
  };

  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id,
    });

    // Cap nhat lai state board
    const newBoard = { ...board };
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === createdCard.columnId
    );
    if (columnToUpdate) {
      columnToUpdate.cards.push(createdCard);
      columnToUpdate.cardOrderIds.push(createdCard._id);
    }

    setBoard(newBoard);
  };

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
      />
    </Container>
  );
}

export default Board;
