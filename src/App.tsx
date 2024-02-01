import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { produce } from 'immer'
import { Overlay as _Overlay } from './Overlay'
import { DeleteDialog } from './DeleteDialog'
import { get } from './api'
import { sortBy } from './util'

type State = {
  columns?: {
    id: string
    title?: string
    text?: string
    cards?: {
      id: string
      text?: string
    }[]
  }[]
  cardsOrder: Record<string, string>
}

export function App() {
  const [filterValue, setFilterValue] = useState('')
  const [draggingCardId, setDraggingCardId] = useState<string | undefined>(
    undefined,
  )
  const [deletingCardId, setDeletingCardId] = useState<string | undefined>(
    undefined,
  )
  const [{ columns }, setData] = useState<State>({ cardsOrder: {} })

  useEffect(() => {
    ;(async () => {
      const columns = await get('/columns')
      setData(
        produce((draft: State) => {
          draft.columns = columns
        }),
      )

      const cards = await get('/cards')
      const cardsOrder = await get('/cardsOrder')
      setData(
        produce((draft: State) => {
          draft.columns?.forEach(
            column => (column.cards = sortBy(cards, cardsOrder, column.id)),
          )
        }),
      )
    })()
  }, [])

  const dropCardTo = (toId: string | null) => {
    const fromId = draggingCardId
    if (!fromId) return
    setDraggingCardId(undefined)
    if (fromId === toId) return
    setData(
      produce((draft: State) => {
        const card = draft.columns
          ?.flatMap(col => col.cards ?? [])
          .find(c => c?.id === fromId)

        if (!card) return

        const fromColumn = draft.columns?.find(
          col => col.cards?.some(c => c.id === fromId),
        )

        if (!fromColumn?.cards) return
        fromColumn.cards = fromColumn.cards.filter(c => c.id !== fromId)

        const toColumn = draft.columns?.find(
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

  const deleteCard = (): void => {
    const cardId = deletingCardId
    if (!cardId) return

    setDeletingCardId(undefined)

    setData(
      produce((draft: State) => {
        const column = draft.columns?.find(
          col => col.cards?.some(c => c.id === cardId),
        )
        if (!column) return

        column.cards = column.cards?.filter(c => c.id !== cardId)
      }),
    )
  }

  return (
    <Container>
      <Header filterValue={filterValue} onFilterChange={setFilterValue} />

      <MainArea>
        <HorizontalScroll>
          {!columns ? (
            <Loading />
          ) : (
            columns.map(({ id: columId, title, cards }) => (
              <Column
                key={columId}
                title={title}
                filterValue={filterValue}
                cards={cards}
                onCardDragStart={cardId => setDraggingCardId(cardId)}
                onCardDrop={entered => dropCardTo(entered ?? columId)}
                onCardDeleteClick={cardId => setDeletingCardId(cardId)}
              />
            ))
          )}
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
const Loading = styled.div.attrs({
  children: 'Loading...',
})`
  font-size: 14px;
`
