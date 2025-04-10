import Box from '@mui/material/Box';
import ListColumns from './ListColumns/ListColumns';
import {
  DndContext,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  getFirstCollision,
  // rectIntersection,
  // closestCenter,
} from '@dnd-kit/core';

import { MouseSensor, TouchSensor } from '~/customLibraries/DndKitSensors';

import { useState, useEffect, useCallback, useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

import Column from './ListColumns/Column/Column';
import Card from './ListColumns/Column/ListCards/Card/Card';

import { cloneDeep, isEmpty } from 'lodash';
import { generatePlaceholderCard } from '~/utils/formatters';

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD',
};

function BoardContent({
  board,
  createNewColumn,
  createNewCard,
  moveColumns,
  moveCardInTheSameColum,
}) {
  // const pointerSensor = useSensor(PointerSensor, {
  //   activationConstraint: { distance: 10 },
  // });

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 500 },
  });

  // const sensors = useSensors(pointerSensor);
  const sensors = useSensors(mouseSensor, touchSensor);

  const [orderedColumns, setOrderedColumns] = useState([]);
  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
    useState(null);
  // Diem va cham cuoi truoc do de xw ly thuat toan phat hien va cham
  const lastOverId = useRef(null);

  useEffect(() => {
    // vd 71
    setOrderedColumns(board.columns);
  }, [board]);

  // Tim 1 column theo CardId
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) =>
      column?.cards?.map((card) => card._id)?.includes(cardId)
    );
  };

  // Function chung xu ly cap nhat lai state trong truong hop di chuyen Card giua cac Column khac nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumns((prevColumns) => {
      // Tim index cua cai overCard trong column dich (Noi ma activeCard sap duoc tha)
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card._id === overCardId
      );

      let newCardIndex;
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      const modifier = isBelowOverItem ? 1 : 0;
      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.cards?.length + 1;

      // Clone mang OrderedColumnsState cu ra mot cai moi de xu ly data roi return - cap nhat lai OrderedColumnsState moi
      const nextColumns = cloneDeep(prevColumns);
      const nextActiveColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      );
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      );

      if (nextActiveColumn) {
        // Xoa card o cai column active
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );
        // Them placeholder neu column bi keo het Card di
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)];
        }

        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        );
      }

      if (nextOverColumn) {
        // Kiem tra card dang keo cos ton tai o overColumn chua, neu cos thi can xoa no di
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );
        // Phai cap nhat lai chuan du lieu columnId trong Card sau khi keo card giua 2 column khac nhau
        // const rebuild_activeDraggingCardData = {
        //   ...activeDraggingCardData,
        //   columnId: nextOverColumn._id,
        // };
        // Tiep theo la them cai card dang keo vao overColumn theo vi tri moi
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id,
        });

        // Xoa placeholderCard neu ton tai
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => !card.FE_PlaceholderCard
        );

        // Cap nhat lai mang cardOrderIds cho chuan du lieu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        );

        // console.log(nextOverColumn);
      }

      return nextColumns;
    });
  };

  // Trigger khi bat dau keo 1 phan tu
  const handleDragStart = (event) => {
    // console.log('handleDragStart', event);
    setActiveDragItemId(event?.active?.id);
    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );
    setActiveDragItemData(event?.active?.data?.current);

    // Neu la keo card thi moi thuc hien hanh dong set gia tri oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id));
    }
  };

  // Trigger trong qua trinh keo 1 phan tu
  const handleDragOver = (event) => {
    // Ko lam gi them neu dang keo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return;

    // console.log('DragOver', event);
    const { active, over } = event;

    if (!active || !over) return;

    // activeDraggingCard: La card dang duoc keo
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData },
    } = active;
    const { id: overCardId } = over;

    // Tim 2 cai column theo card id
    const activeColumn = findColumnByCardId(activeDraggingCardId);
    const overColumn = findColumnByCardId(overCardId);

    // Neu ko ton tai 2 trong 2 column thi ko lam gi het
    if (!activeColumn || !overColumn) return;

    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      );
    }
  };

  // Trigger khi ket thuc hanh dong tha 1 phan tu
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd', event);

    const { active, over } = event;

    if (!active || !over) return;
    // Keo tha card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCard: La card dang duoc keo
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData },
      } = active;
      const { id: overCardId } = over;

      // Tim 2 cai column theo card id
      const activeColumn = findColumnByCardId(activeDraggingCardId);
      const overColumn = findColumnByCardId(overCardId);

      // Neu ko ton tai 2 trong 2 column thi ko lam gi het
      if (!activeColumn || !overColumn) return;

      // Phải dùng tới activeDragItemData (set vào state từ bước handleDragStart) chứ không phải activeData trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card đã bị cập nhật 1 lần
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        // Hanh dong keo tha giua 2 column khac nhau
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        );
      } else {
        //Hanh dong keo tha trong 1 column
        // Lấy vị trí cũ từ oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(
          (c) => c._id === activeDragItemId
        );

        // Lấy vị trí mới từ overColumn
        const newCardIndex = overColumn?.cards?.findIndex(
          (c) => c._id === overCardId
        );

        // Dung arrayMove vi keo Card trong mot cai column thi tuong tu voi logic keo column trong mot boardContent
        const dndOrderedCards = arrayMove(
          oldColumnWhenDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        );

        const dndOrderedCardIds = dndOrderedCards.map((card) => card._id);
        setOrderedColumns((prevColumns) => {
          // Clone mang OrderedColumnsState cu ra mot cai moi de xu ly data roi return - cap nhat lai OrderedColumnsState moi
          const nextColumns = cloneDeep(prevColumns);

          // Tim toi column dang tha
          const targetColumn = nextColumns.find(
            (column) => column._id === overColumn._id
          );

          // Cap nhap lai card va cardOderIds
          targetColumn.cards = dndOrderedCards;
          targetColumn.cardOrderIds = dndOrderedCardIds;

          // tra ve gia tri column chuan vi tri
          return nextColumns;
        });

        moveCardInTheSameColum(
          dndOrderedCards,
          dndOrderedCardIds,
          oldColumnWhenDraggingCard._id
        );
      }
    }

    // Xu ly keo tha column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        // Lấy vị trí cũ từ active
        const oldColumnIndex = orderedColumns.findIndex(
          (c) => c._id === active.id
        );

        // Lấy vị trí mới từ over
        const newColumnIndex = orderedColumns.findIndex(
          (c) => c._id === over.id
        );

        const dndOrderedColumns = arrayMove(
          orderedColumns,
          oldColumnIndex,
          newColumnIndex
        );

        setOrderedColumns(dndOrderedColumns);

        moveColumns(dndOrderedColumns);
      }
    }

    // Nhung du lieu sau khi keo tha luon phai dua ve gia tri null ban dau
    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnWhenDraggingCard(null);
  };

  // console.log(activeDragItemId);
  // console.log(activeDragItemType);
  // console.log(activeDragItemData);

  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } },
    }),
  };

  // agrs = cac doi so, tham so
  // Custom thuat toan va cham
  const collisionDetectionStrategy = useCallback(
    (args) => {
      // Truong hop keo column thi dung thuat toan closestCorners
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args });
      }

      // Tim cac diem giao nhau, va cham
      const pointerIntersections = pointerWithin(args);

      if (!pointerIntersections?.length) return;

      // Thuat toan phat hien va cham se tra ve mang cua cac phan tu
      // const intersections = !!pointerIntersections?.length
      //   ? pointerIntersections
      //   : rectIntersection(args);

      let overId = getFirstCollision(pointerIntersections, 'id');
      if (overId) {
        const checkColumn = orderedColumns.find(
          (column) => column._id === overId
        );

        if (checkColumn) {
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) => {
                return (
                  container.id !== overId &&
                  checkColumn?.cardOrderIds?.includes(container.id)
                );
              }
            ),
          })[0]?.id;
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // Neu overId = null tra ve mang rong
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeDragItemType, orderedColumns]
  );

  return (
    <DndContext
      sensors={sensors}
      // collisionDetection={closestCorners}

      // Custom thuat toan va cham
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#34495e' : '#1976d2',
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0',
        }}
      >
        <ListColumns
          columns={orderedColumns}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
        />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <Card card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  );
}

export default BoardContent;
