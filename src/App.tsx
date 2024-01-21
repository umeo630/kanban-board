import React, { useState } from 'react'
import styled from 'styled-components'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { produce } from 'immer'
import { Overlay as _Overlay } from './Overlay'
import { DeleteDialog } from './DeleteDialog'

export function App() {
  const [filterValue, setFilterValue] = useState('')
  const [draggingCardId, setDraggingCardId] = useState<string | undefined>(
    undefined,
  )
  const [deletingCardId, setDeletingCardId] = useState<string | undefined>(
    undefined,
  )
  const handleCardDelete = (id: string): void => {
    console.log('削除対象カードID:', id)
    setDeletingCardId(undefined)
  }
  const [columns, setColumns] = useState([
    {
      id: 'A',
      title: 'TODO',
      cards: [
        { id: 'a', text: '朝食をとる🍞' },
        { id: 'b', text: 'SNSをチェックする🐦' },
        { id: 'c', text: '布団に入る (:3[___]' },
      ],
    },
    {
      id: 'B',
      title: 'Doing',
      cards: [
        { id: 'd', text: '顔を洗う👐' },
        { id: 'e', text: '歯を磨く🦷' },
      ],
    },
    {
      id: 'C',
      title: 'Waiting',
      cards: [],
    },
    {
      id: 'D',
      title: 'Done',
      cards: [{ id: 'f', text: '布団から出る (:3っ)っ -=三[＿＿]' }],
    },
  ])

  const dropCardTo = (toId: string | null) => {
    const fromId = draggingCardId
    if (!fromId) return
    setDraggingCardId(undefined)
    if (fromId === toId) return
    type Columns = typeof columns
    setColumns(
      produce((columns: Columns) => {
        const card = columns
          .flatMap(col => col.cards)
          .find(c => c.id === fromId)

        if (!card) return

        const fromColumn = columns.find(col =>
          col.cards.some(c => c.id === fromId),
        )

        if (!fromColumn) return
        fromColumn.cards = fromColumn.cards.filter(c => c.id !== fromId)

        const toColumn = columns.find(
          col => col.id === toId || col.cards.find(c => c.id === toId),
        )
        if (!toColumn) return

        let index = toColumn.cards.findIndex(c => c.id === toId)
        if (index < 0) {
          index = toColumn.cards.length
        }

        toColumn.cards.splice(index, 0, card)
      }),
    )
  }

  return (
    <Container>
      <Header filterValue={filterValue} onFilterChange={setFilterValue} />

      <MainArea>
        <HorizontalScroll>
          {columns.map(({ id: columId, title, cards }) => (
            <Column
              key={columId}
              title={title}
              filterValue={filterValue}
              cards={cards}
              onCardDragStart={cardId => setDraggingCardId(cardId)}
              onCardDrop={entered => dropCardTo(entered ?? columId)}
              onDeleteClick={cardId => setDeletingCardId(cardId)}
            />
          ))}
        </HorizontalScroll>
      </MainArea>
      {deletingCardId && (
        <Overlay onClick={() => setDeletingCardId(undefined)}>
          <DeleteDialog
            onCancel={() => setDeletingCardId(undefined)}
            onConfirm={() => handleCardDelete(deletingCardId)}
          />
        </Overlay>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
`

const Header = styled(_Header)`
  flex-shrink: 0;
`

const MainArea = styled.div`
  height: 100%;
  padding: 16px 0;
  overflow-y: auto;
`

const HorizontalScroll = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;

  > * {
    margin-left: 16px;
    flex-shrink: 0;
  }

  ::after {
    display: block;
    flex: 0 0 16px;
    content: '';
  }
`

const Overlay = styled(_Overlay)`
  display: flex;
  justify-content: center;
  align-items: center;
`
