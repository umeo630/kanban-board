import React, { useEffect } from 'react'
import styled from 'styled-components'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { Overlay as _Overlay } from './Overlay'
import { DeleteDialog } from './DeleteDialog'
import { get, put, post } from './api'
import { randomID, reOrderCards } from './util'
import { useDispatch, useSelector } from 'react-redux'

export function App() {
  const dispatch = useDispatch()

  const draggingCardId = useSelector(state => state.draggingCardId)
  const isDeletingCard = useSelector(state => Boolean(state.deletingCardId))

  const cancelDelete = () => {
    dispatch({
      type: 'Dialog.CancelDeleteCard',
    })
  }

  const columns = useSelector(state => state.columns)
  const cardsOrder = useSelector(state => state.cardsOrder)

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
  }, [dispatch])

  const setText = (columnId: string, value: string) => {
    dispatch({
      type: 'InputForm.SetText',
      payload: {
        columnId: columnId,
        text: value,
      },
    })
  }

  const addCard = async (columnId: string) => {
    const column = columns?.find(col => col.id === columnId)
    if (!column) return
    const text = column.text
    const cardId = randomID()
    const newCardsOrder = reOrderCards(cardsOrder, cardId, cardsOrder[columnId])

    dispatch({
      type: 'InputForm.ConfirmInput',
      payload: {
        columnId: columnId,
        cardId: cardId,
      },
    })

    await post('/cards', { id: cardId, text: text })
    await put('/cardsOrder', newCardsOrder)
  }

  const dropCardTo = (toId: string) => {
    const fromId = draggingCardId
    if (!fromId) return
    if (fromId === toId) return

    const newCardsOrder = reOrderCards(cardsOrder, fromId, toId)

    dispatch({
      type: 'Card.Drop',
      payload: {
        toId,
      },
    })

    put('/cardsOrder', newCardsOrder)
  }

  return (
    <Container>
      <Header />

      <MainArea>
        <HorizontalScroll>
          {!columns ? (
            <Loading />
          ) : (
            columns.map(({ id: columId, title, cards, text }) => (
              <Column
                key={columId}
                title={title}
                cards={cards}
                onCardDrop={entered => dropCardTo(entered ?? columId)}
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
