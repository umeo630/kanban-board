import { produce } from 'immer'
import { Reducer } from 'redux'
import { sortBy } from './util'

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
  deletingCardId: string | undefined
}

const initialState: State = {
  filterValue: '',
  cardsOrder: {},
  deletingCardId: '',
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
      type: 'App.SetDeletingCardId'
      payload: {
        cardId: string
      }
    }
  | {
      type: 'Dialog.CancelDeleteCard'
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
      case 'App.SetDeletingCardId': {
        const { cardId } = action.payload
        draft.deletingCardId = cardId
        return
      }
      case 'Dialog.CancelDeleteCard': {
        draft.deletingCardId = undefined
        return
      }

      default: {
        const _: never = action
      }
    }
  },
  initialState,
)
