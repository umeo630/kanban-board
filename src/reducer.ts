import { produce } from 'immer'
import { Reducer } from 'redux'
import { reOrderCards, sortBy } from './util'

export type State = {
  filterValue: string
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
  deletingCardId?: string
  draggingCardId?: string
}

const initialState: State = {
  filterValue: '',
  cardsOrder: {},
}

export type Action =
  | {
      type: 'Filter.SetFilter'
      payload: {
        value: string
      }
    }
  | {
      type: 'App.SetColumns'
      payload: {
        columns: {
          id: string
          title?: string
          text?: string
        }[]
      }
    }
  | {
      type: 'App.SetCards'
      payload: {
        cards: {
          id: string
          text?: string
        }[]
        cardsOrder: Record<string, string | null>
      }
    }
  | {
      type: 'Card.SetDeletingCardId'
      payload: {
        cardId: string
      }
    }
  | {
      type: 'Dialog.CancelDeleteCard'
    }
  | {
      type: 'Dialog.ConfirmDelete'
    }
  | {
      type: 'App.SetDraggingCardId'
      payload: {
        cardId: string
      }
    }
  | {
      type: 'Card.Drop'
      payload: {
        toId: string
      }
    }
  | {
      type: 'InputForm.SetText'
      payload: {
        columnId: string
        text: string
      }
    }
  | {
      type: 'InputForm.ConfirmInput'
      payload: {
        columnId: string
        cardId: string
      }
    }

export const reducer: Reducer<State, Action> = produce(
  (draft: State, action: Action) => {
    switch (action.type) {
      case 'Filter.SetFilter': {
        const { value } = action.payload
        draft.filterValue = value
        return
      }
      case 'App.SetColumns': {
        const { columns } = action.payload

        draft.columns = columns
        return
      }
      case 'App.SetCards': {
        const { cards: unorderedCards, cardsOrder } = action.payload

        draft.cardsOrder = cardsOrder
        draft.columns?.forEach(column => {
          column.cards = sortBy(unorderedCards, cardsOrder, column.id)
        })
        return
      }
      case 'Card.SetDeletingCardId': {
        const { cardId } = action.payload
        draft.deletingCardId = cardId
        return
      }
      case 'Dialog.CancelDeleteCard': {
        draft.deletingCardId = undefined
        return
      }
      case 'Dialog.ConfirmDelete': {
        const cardId = draft.deletingCardId
        if (!cardId) return

        draft.deletingCardId = undefined

        const column = draft.columns?.find(
          col => col.cards?.some(c => c.id === cardId),
        )
        if (!column?.cards) return

        column.cards = column.cards.filter(c => c.id !== cardId)

        const newCardsOrder = reOrderCards(draft.cardsOrder, cardId)
        draft.cardsOrder = newCardsOrder

        return
      }
      case 'App.SetDraggingCardId': {
        const { cardId } = action.payload
        draft.draggingCardId = cardId
        return
      }
      case 'Card.Drop': {
        const fromId = draft.draggingCardId
        if (!fromId) return

        draft.draggingCardId = undefined

        const { toId } = action.payload
        if (fromId === toId) return

        const newCardsOrder = reOrderCards(draft.cardsOrder, fromId, toId)
        draft.cardsOrder = newCardsOrder

        const unOrderedCards = draft.columns?.flatMap(c => c.cards ?? []) ?? []
        draft.columns?.forEach(col => {
          col.cards = sortBy(unOrderedCards, draft.cardsOrder, col.id)
        })
        return
      }
      case 'InputForm.SetText': {
        const { columnId, text } = action.payload
        const column = draft.columns?.find(col => col.id === columnId)
        if (!column) return
        column.text = text
        return
      }
      case 'InputForm.ConfirmInput': {
        const { columnId, cardId } = action.payload
        const coulumn = draft.columns?.find(col => col.id === columnId)
        const newCardsOrder = reOrderCards(
          draft.cardsOrder,
          cardId,
          draft.cardsOrder[columnId],
        )
        if (!coulumn?.cards) return
        coulumn.cards.unshift({
          id: cardId,
          text: coulumn.text,
        })
        coulumn.text = ''
        draft.cardsOrder = newCardsOrder
        return
      }

      default: {
        const _: never = action
      }
    }
  },
  initialState,
)
