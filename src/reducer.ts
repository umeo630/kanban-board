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

      default: {
        const _: never = action
      }
    }
  },
  initialState,
)
