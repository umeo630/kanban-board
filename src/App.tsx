import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { produce } from 'immer'
import { Overlay as _Overlay } from './Overlay'
import { DeleteDialog } from './DeleteDialog'
import { get } from './api'

type Columns = {
  id: string
  title?: string
  text?: string
  cards?: {
    id: string
    text?: string
  }[]
}[]

export function App() {
  const [filterValue, setFilterValue] = useState('')
  const [draggingCardId, setDraggingCardId] = useState<string | undefined>(
    undefined,
  )
  const [deletingCardId, setDeletingCardId] = useState<string | undefined>(
    undefined,
  )
  const deleteCard = (): void => {
    const cardId = deletingCardId
    if (!cardId) return

    setDeletingCardId(undefined)

    setColumns(
      produce((columns: Columns) => {
        const column = columns.find(
          col => col.cards?.some(c => c.id === cardId),
        )
        if (!column) return

        column.cards = column.cards?.filter(c => c.id !== cardId)
      }),
    )
  }
  const [columns, setColumns] = useState<Columns>([])

  useEffect(() => {
    ;(async () => {
      const columns = await get('http://localhost:3000/columns')
      setColumns(columns)

      const cards = await get('http://localhost:3000/cards')
      setColumns(
        produce((columns: Columns) => {
          columns.forEach(column => (column.cards = cards))
        }),
      )
    })()
  }, [])

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
          .find(c => c?.id === fromId)

        if (!card) return

        const fromColumn = columns.find(
          col => col.cards?.some(c => c.id === fromId),
        )

        if (!fromColumn?.cards) return
        fromColumn.cards = fromColumn.cards.filter(c => c.id !== fromId)

        const toColumn = columns.find(
          col => col.id === toId || col.cards?.find(c => c.id === toId),
        )
        if (!toColumn?.cards) return

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
              onCardDeleteClick={cardId => setDeletingCardId(cardId)}
            />
          ))}
        </HorizontalScroll>
      </MainArea>
      {deletingCardId && (
        <Overlay onClick={() => setDeletingCardId(undefined)}>
          <DeleteDialog
            onCancel={() => setDeletingCardId(undefined)}
            onConfirm={deleteCard}
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
