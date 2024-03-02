import React from 'react'
import styled from 'styled-components'
import * as color from './color'
import { Button, DangerButton } from './Button'
import { del, put } from './api'
import { reOrderCards } from './util'
import { useDispatch, useSelector } from 'react-redux'

export function DeleteDialog({ className }: { className?: string }) {
  const dispatch = useDispatch()
  const deletingCardId = useSelector(state => state.deletingCardId)
  const cardsOrder = useSelector(state => state.cardsOrder)
  const onConfirm = async () => {
    const cardId = deletingCardId
    if (!cardId) return

    const newCardsOrder = reOrderCards(cardsOrder, cardId)

    dispatch({
      type: 'Dialog.ConfirmDelete',
    })

    await del(`/cards/${cardId}`)
    await put('/cardsOrder', newCardsOrder)
  }
  const onCancel = () => {
    dispatch({
      type: 'Dialog.CancelDeleteCard',
    })
  }
  return (
    <Container className={className}>
      <Message>Are you sure to delete?</Message>

      <ButtonRow>
        <DeleteButton onClick={onConfirm} />
        <CancelButton autoFocus onClick={onCancel} />
      </ButtonRow>
    </Container>
  )
}

const Container = styled.div`
  min-width: 350px;
  box-shadow: 0 8px 12px hsla(0, 0%, 0%, 0.2);
  border: solid 1px ${color.Silver};
  border-radius: 4px;
  background-color: ${color.White};
`

const Message = styled.div`
  min-height: 100px;
  padding: 16px;
  color: ${color.Black};
  font-size: 14px;
  line-height: 1.7;
`

const ButtonRow = styled.div`
  display: flex;
  padding: 0 16px 16px;

  > :not(:first-child) {
    margin-left: 8px;
  }
`

const DeleteButton = styled(DangerButton).attrs({
  children: 'Delete',
})``

const CancelButton = styled(Button).attrs({
  children: 'Cancel',
})``
