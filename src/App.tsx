import React, { useEffect } from 'react'
import styled from 'styled-components'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { get } from './api'
import { useDispatch, useSelector } from 'react-redux'
import { DialogOverlay } from './DialogOverlay'

export function App() {
  const dispatch = useDispatch()
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
            columns.map(({ id: columId }) => (
              <Column key={columId} columnId={columId} />
            ))
          )}
        </HorizontalScroll>
      </MainArea>
      <DialogOverlay />
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

const Loading = styled.div.attrs({
  children: 'Loading...',
})`
  font-size: 14px;
`
