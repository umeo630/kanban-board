import React, { useEffect } from 'react'
import styled from 'styled-components'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { Overlay as _Overlay } from './Overlay'
import { DeleteDialog } from './DeleteDialog'
import { get } from './api'
import { useDispatch, useSelector } from 'react-redux'

export function App() {
  const dispatch = useDispatch()

  const isDeletingCard = useSelector(state => Boolean(state.deletingCardId))

  const cancelDelete = () => {
    dispatch({
      type: 'Dialog.CancelDeleteCard',
    })
  }

  const columns = useSelector(state => state.columns)

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

  return (
    <Container>
      <Header />

      <MainArea>
        <HorizontalScroll>
          {!columns ? (
            <Loading />
          ) : (
            columns.map(({ id: columId, title, cards }) => (
              <Column
                columnId={columId}
                key={columId}
                title={title}
                cards={cards}
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
