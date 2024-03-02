import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { produce } from 'immer'
import { Overlay as _Overlay } from './Overlay'
import { DeleteDialog } from './DeleteDialog'
import { get, put, post } from './api'
import { randomID, reOrderCards, sortBy } from './util'
import { useDispatch, useSelector } from 'react-redux'

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
  const dispatch = useDispatch()
  const filterValue = useSelector(state => state.filterValue)
  const setFilterValue = (value: string) =>
    dispatch({
      type: 'Filter.SetFilter',
      payload: { value },
    })

  const [draggingCardId, setDraggingCardId] = useState<string | undefined>(
    undefined,
  )
  const isDeletingCard = useSelector(state => Boolean(state.deletingCardId))

  const setDeletingCardId = (cardId: string) => {
    dispatch({
      type: 'App.SetDeletingCardId',
      payload: {
        cardId,
      },
    })
  }

  const cancelDelete = () => {
    dispatch({
      type: 'Dialog.CancelDeleteCard',
    })
  }

  const columns = useSelector(state => state.columns)
  const cardsOrder = useSelector(state => state.cardsOrder)
  const setData = fn => fn({ cardsOrder: {} })

  useEffect(() => {
    ;(async () => {
      const columns = await get('/columns')

      dispatch({
        type: 'App.SetColumns',
        payload: {
          columns,
        },
      })

      const cards = await get('/cards')
      const cardsOrder = await get('/cardsOrder')
      dispatch({
        type: 'App.SetCards',
        payload: {
          cards: cards,
          cardsOrder: cardsOrder,
        },
      })
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
      {isDeletingCard && (
        <Overlay onClick={cancelDelete}>
          <DeleteDialog />
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
