import React, { useState } from 'react'
import styled from 'styled-components'
import { Header as _Header } from './Header'
import { Column } from './Column'

export function App() {
  const [filterValue, setFilterValue] = useState('')
  const [draggingCardId, setDraggingCardId] = useState<string | undefined>(
    undefined,
  )
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
    setColumns(columns => {
      // 現在のカード情報を保持
      const card = columns.flatMap(col => col.cards).find(c => c.id === fromId)
      if (!card) return columns

      return columns.map(column => {
        let newColumn = column

        // 移動するカードを含むカラムの場合
        // 移動するカード以外を保持
        if (newColumn.cards.some(c => c.id === fromId)) {
          newColumn = {
            ...newColumn,
            cards: newColumn.cards.filter(c => c.id !== fromId),
          }
        }

        // カラムの末尾に移動する場合
        if (newColumn.id === toId) {
          newColumn = {
            ...newColumn,
            cards: [...newColumn.cards, card],
          }
        }
        // カラムの末尾以外に移動
        else if (newColumn.cards.some(c => c.id === toId)) {
          newColumn = {
            ...newColumn,
            cards: newColumn.cards.flatMap(c =>
              c.id === toId ? [card, c] : [c],
            ),
          }
        }

        return newColumn
      })
    })
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
            />
          ))}
        </HorizontalScroll>
      </MainArea>
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
