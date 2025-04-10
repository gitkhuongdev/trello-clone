import Container from '@mui/material/Container';
import AppBar from '~/components/AppBar/AppBar';
import BoardBar from './BoardBar/BoardBar';
import BoardContent from './BoardContent/BoardContent';
import { useEffect, useState } from 'react';
import { mapOrder } from '~/utils/sorts';

import {
  fetchBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI,
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
} from '~/apis';

import { generatePlaceholderCard } from '~/utils/formatters';
import { isEmpty } from 'lodash';
import { Box, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
// import { mockData } from '~/apis/mock-data';

function Board() {
  const [board, setBoard] = useState(null);

  useEffect(() => {
    const boardId = '67f2ac4d48a2d9c07445f498';

    // Call API
    fetchBoardDetailsAPI(boardId).then((board) => {
      // Sap xep thu tu column o day truoc khi dua xuong duoi cac component con
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id');
      // Xu ly van de keo tha khi column rong
      board.columns.forEach((column) => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)];
          column.cardOrderIds = [generatePlaceholderCard(column)._id];
        } else {
          // Sap xep thu tu card o day truoc khi dua xuong duoi cac component con
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id');
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
  // Func nay dung de goi API va xu ly khi keo tha Column xong xuoi
  const moveColumns = (dndOrderedColumns) => {
    //  Update du lieu chuan state board
    const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
    const newBoard = { ...board };
    newBoard.columns = dndOrderedColumns;
    newBoard.columnOrderIds = dndOrderedColumnsIds;
    setBoard(newBoard);

    // API update board
    updateBoardDetailsAPI(newBoard._id, {
      columnOrderIds: dndOrderedColumnsIds,
    });
  };
  // Di chuyen card trong cung column
  const moveCardInTheSameColum = (
    dndOrderedCards,
    dndOrderedCardIds,
    columnId
  ) => {
    // Update du lieu cho state Board
    const newBoard = { ...board };
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === columnId
    );
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards;
      columnToUpdate.cardOrderIds = dndOrderedCardIds;
    }

    setBoard(newBoard);
    // Goi API update Board
    updateColumnDetailsAPI(columnId, {
      cardOrderIds: dndOrderedCardIds,
    });
  };

  if (!board) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          width: '100vw',
          height: '100vh',
        }}
      >
        <CircularProgress />
        <Typography>Loading Board...</Typography>
      </Box>
    );
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumns={moveColumns}
        moveCardInTheSameColum={moveCardInTheSameColum}
      />
    </Container>
  );
}

export default Board;
