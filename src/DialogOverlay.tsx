import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Overlay as _Overlay } from './Overlay'
import { DeleteDialog } from './DeleteDialog'
import styled from 'styled-components'

export function DialogOverlay() {
  const dispatch = useDispatch()
  const isDeletingCard = useSelector(state => Boolean(state.deletingCardId))
  const cancelDelete = () => {
    dispatch({
      type: 'Dialog.CancelDeleteCard',
    })
  }
  if (!isDeletingCard) return null

  return (
    <Overlay onClick={cancelDelete}>
      <DeleteDialog />
    </Overlay>
  )
}

const Overlay = styled(_Overlay)`
  display: flex;
  justify-content: center;
  align-items: center;
`
