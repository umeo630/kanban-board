import React, { useState } from 'react'
import styled from 'styled-components'
import * as color from './color'
import { Card } from './Card'
import { PlusIcon } from './icon'
import { InputForm as _InputForm } from './InputForm'
import { useSelector } from 'react-redux'

export function Column({ columnId }: { columnId: string }) {
  const { column, cards, filtered, totalCount } = useSelector(state => {
    const filterValue = state.filterValue.trim()
    const filtered = Boolean(filterValue)
    const keywords = filterValue.toLowerCase().split(/\s+/g)

    const column = state.columns?.find(c => c.id === columnId)
    const cards = column?.cards?.filter(({ text }) =>
      keywords.every(w => text?.toLowerCase().includes(w)),
    )
    const totalCount = column?.cards?.length ?? -1

    return { column, cards, filtered, totalCount }
  })
  const draggingCardId = useSelector(state => state.draggingCardId)

  const [inputMode, setInputMode] = useState(false)
  const toggleInput = () => setInputMode(v => !v)
  const cancelInput = () => setInputMode(false)

  if (!column) return null
  const { title } = column

  return (
    <Container>
      <Header>
        {totalCount >= 0 && <CountBadge>{totalCount}</CountBadge>}
        <ColumnName>{title}</ColumnName>

        <AddButton onClick={toggleInput} />
      </Header>

      {inputMode && <InputForm columnId={columnId} onCancel={cancelInput} />}

      {!cards ? (
        <Loading />
      ) : (
        <>
          {filtered && <ResultCount>{cards.length} results</ResultCount>}

          <VerticalScroll>
            {cards.map(({ id, text }, i) => (
              <Card.DropArea
                targetId={id}
                key={id}
                disabled={
                  draggingCardId !== undefined &&
                  (draggingCardId === id || cards[i - 1]?.id === draggingCardId)
                }
              >
                <Card id={id} text={text} />
              </Card.DropArea>
            ))}
            <Card.DropArea
              targetId={columnId}
              style={{ height: '100%' }}
              disabled={
                draggingCardId !== undefined &&
                cards[cards.length - 1]?.id === draggingCardId
              }
            />
          </VerticalScroll>
        </>
      )}
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

const Loading = styled.div.attrs({
  children: 'Loading...',
})`
  padding: 8px;
  font-size: 14px;
`
