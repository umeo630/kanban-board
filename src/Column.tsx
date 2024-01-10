import React, { useState } from 'react'
import styled from 'styled-components'
import * as color from './color'
import { Card } from './Card'
import { PlusIcon } from './icon'
import { InputForm as _InputForm } from './InputForm'

export function Column({
  title,
  filterValue: rawFileterValue,
  cards: rawCards,
}: {
  title?: string
  filterValue?: string
  cards: {
    id: string
    text?: string
  }[]
}) {
  const filterValue = rawFileterValue?.trim()
  const keywords = filterValue?.toLowerCase().split(/\s+/g) ?? []
  const cards = rawCards.filter(
    ({ text }) =>
      keywords?.every(keyword => text?.toLowerCase().includes(keyword)),
  )
  const totalCount = rawCards.length

  const [text, setText] = useState('')
  const [inputMode, setInputMode] = useState(false)
  const toggleInput = () => setInputMode(v => !v)
  const confirmInput = () => {
    console.log(text)
    setText('')
  }
  const cancelInput = () => {
    setText('')
    setInputMode(false)
  }

  const [draggingCardId, setDraggingCardId] = useState<string | undefined>(
    undefined,
  )

  return (
    <Container>
      <Header>
        <CountBadge>{totalCount}</CountBadge>
        <ColumnName>{title}</ColumnName>

        <AddButton onClick={toggleInput} />
      </Header>

      {inputMode && (
        <InputForm
          value={text}
          onChange={setText}
          onConfirm={confirmInput}
          onCancel={cancelInput}
        />
      )}

      {filterValue && <ResultCount>{cards.length} results</ResultCount>}

      <VerticalScroll>
        {cards.map(({ id, text }, i) => (
          <Card.DropArea
            key={id}
            disabled={
              draggingCardId !== undefined &&
              (draggingCardId === id || cards[i - 1]?.id === draggingCardId)
            }
          >
            <Card
              text={text}
              onDragStart={() => setDraggingCardId(id)}
              onDragEnd={() => setDraggingCardId(undefined)}
            />
          </Card.DropArea>
        ))}
        <Card.DropArea
          style={{ height: '100%' }}
          disabled={
            draggingCardId !== undefined &&
            cards[cards.length - 1].id === draggingCardId
          }
        />
      </VerticalScroll>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-flow: column;
  width: 340px;
  height: 100%;
  border: solid 1px ${color.Silver};
  border-radius: 6px;
  background-color: ${color.LightSilver};

  > :not(:last-child) {
    flex-shrink: 0;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 8px;
`

const CountBadge = styled.div`
  margin-right: 8px;
  border-radius: 20px;
  padding: 2px 6px;
  color: ${color.Black};
  background-color: ${color.Silver};
  font-size: 12px;
  line-height: 1;
`

const ColumnName = styled.div`
  color: ${color.Black};
  font-size: 14px;
  font-weight: bold;
`

const AddButton = styled.button.attrs({
  type: 'button',
  children: <PlusIcon />,
})`
  margin-left: auto;
  color: ${color.Black};

  :hover {
    color: ${color.Blue};
  }
`

const InputForm = styled(_InputForm)`
  padding: 8px;
`
const ResultCount = styled.div`
  color: ${color.Black};
  font-size: 12px;
  text-align: center;
`

const VerticalScroll = styled.div`
  height: 100%;
  padding: 8px;
  overflow-y: auto;
  flex: 1 1 auto;

  > :not(:first-child) {
    margin-top: 8px;
  }
`
