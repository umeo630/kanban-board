import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { produce } from 'immer'
import { Overlay as _Overlay } from './Overlay'
import { DeleteDialog } from './DeleteDialog'
import { get, put, post, del } from './api'
import { randomID, reOrderCards, sortBy } from './util'

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
  cardsOrder: Record<string, string | null>
}

export function App() {
  const [filterValue, setFilterValue] = useState('')
  const [draggingCardId, setDraggingCardId] = useState<string | undefined>(
    undefined,
  )
  const [deletingCardId, setDeletingCardId] = useState<string | undefined>(
    undefined,
  )
  const [{ columns, cardsOrder }, setData] = useState<State>({ cardsOrder: {} })

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
          draft.cardsOrder = cardsOrder
          draft.columns?.forEach(
            column => (column.cards = sortBy(cards, cardsOrder, column.id)),
          )
        }),
      )
    })()
  }, [])

  const setText = (columnId: string, value: string) => {
    setData(
      produce((draft: State) => {
        const column = draft.columns?.find(col => col.id === columnId)
        if (!column) return
        column.text = value
      }),
    )
  }

  const addCard = async (columnId: string) => {
    const column = columns?.find(col => col.id === columnId)
    if (!column) return
    const text = column.text
    const cardId = randomID()
    const newCardsOrder = reOrderCards(cardsOrder, cardId, cardsOrder[columnId])

    setData(
      produce((draft: State) => {
        const coulumn = draft.columns?.find(col => col.id === columnId)
        if (!coulumn?.cards) return
        coulumn.cards.unshift({
          id: cardId,
          text: coulumn.text,
        })
        draft.cardsOrder = newCardsOrder
      }),
    )
    await post('/cards', { id: cardId, text: text })
    await put('/cardsOrder', newCardsOrder)
    setText(columnId, '')
  }

  const dropCardTo = (toId: string | null) => {
    const fromId = draggingCardId
    if (!fromId) return
    setDraggingCardId(undefined)
    if (fromId === toId) return

    const newCardsOrder = reOrderCards(cardsOrder, fromId, toId)

    setData(
      produce((draft: State) => {
        draft.cardsOrder = newCardsOrder
        const unOrderedCards = draft.columns?.flatMap(c => c.cards ?? []) ?? []
        draft.columns?.forEach(col => {
          col.cards = sortBy(unOrderedCards, draft.cardsOrder, col.id)
        })
      }),
    )

    put('/cardsOrder', newCardsOrder)
  }

  const deleteCard = async () => {
    const cardId = deletingCardId
    if (!cardId) return

    setDeletingCardId(undefined)
    const newCardsOrder = reOrderCards(cardsOrder, cardId)

    setData(
      produce((draft: State) => {
        const column = draft.columns?.find(
          col => col.cards?.some(c => c.id === cardId),
        )
        if (!column) return

        column.cards = column.cards?.filter(c => c.id !== cardId)
      }),
    )

    const res = await del(`/cards/${cardId}`)
    console.log(res)

    await put('/cardsOrder', newCardsOrder)
  }

  return (
    <Container>
      <Header filterValue={filterValue} onFilterChange={setFilterValue} />

      <MainArea>
        <HorizontalScroll>
          {!columns ? (
            <Loading />
          ) : (
            columns.map(({ id: columId, title, cards, text }) => (
              <Column
                key={columId}
                title={title}
                filterValue={filterValue}
                cards={cards}
                onCardDragStart={cardId => setDraggingCardId(cardId)}
                onCardDrop={entered => dropCardTo(entered ?? columId)}
                onCardDeleteClick={cardId => setDeletingCardId(cardId)}
                text={text}
                onTextChange={value => setText(columId, value)}
                onTextConfirm={() => addCard(columId)}
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
