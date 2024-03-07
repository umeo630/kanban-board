import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import * as color from './color'
import { Button, ConfirmButton } from './Button'
import { useDispatch, useSelector } from 'react-redux'
import { randomID, reOrderCards } from './util'
import { post, put } from './api'

export function InputForm({
  columnId,
  onCancel,
  className,
}: {
  columnId: string
  onCancel?(): void
  className?: string
}) {
  const dispatch = useDispatch()
  const value = useSelector(
    state => state.columns?.find(col => col.id === columnId)?.text,
  )
  const disabled = !value?.trim()
  const cardsOrder = useSelector(state => state.cardsOrder)
  const handleConfirm = async () => {
    if (disabled) return
    const text = value
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
  const ref = useAutoFitToContentHeight(value)

  return (
    <Container className={className}>
      <Input
        ref={ref}
        autoFocus
        placeholder="Enter a note"
        value={value}
        onChange={ev =>
          dispatch({
            type: 'InputForm.SetText',
            payload: {
              columnId: columnId,
              text: ev.target.value,
            },
          })
        }
        onKeyDown={ev => {
          if (!((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter')) return
          handleConfirm()
        }}
      />

      <ButtonRow>
        <AddButton disabled={disabled} onClick={handleConfirm} />
        <CancelButton onClick={onCancel} />
      </ButtonRow>
    </Container>
  )
}

/**
 * テキストエリアの高さを内容に合わせて調整する
 * @param content
 */
const useAutoFitToContentHeight = (content: string | undefined) => {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const { borderTopWidth, borderBottomWidth } = getComputedStyle(el)
    el.style.height = 'auto' // 高さをリセット
    el.style.height = `calc(${borderTopWidth} + ${el.scrollHeight}px + ${borderBottomWidth})`
    // 内容が変わるたびに高さを再計算する
  }, [content])

  return ref
}

const Container = styled.div``

const Input = styled.textarea`
  display: block;
  width: 100%;
  margin-bottom: 8px;
  border: solid 1px ${color.Silver};
  border-radius: 3px;
  padding: 6px 8px;
  background-color: ${color.White};
  font-size: 14px;
  line-height: 1.7;

  :focus {
    outline: none;
    border-color: ${color.Blue};
  }
`

const ButtonRow = styled.div`
  display: flex;

  > :not(:first-child) {
    margin-left: 8px;
  }
`

const AddButton = styled(ConfirmButton).attrs({
  children: 'Add',
})``

const CancelButton = styled(Button).attrs({
  children: 'Cancel',
})``
