import { produce } from 'immer'
import { Reducer } from 'redux'

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

export const reducer: Reducer<State, Action> = produce(
  (draft: State, action: Action) => {
    switch (action.type) {
      case 'Filter.SetFilter': {
        const { value } = action.payload
        draft.filterValue = value
        return
      }
      case 'App.SetColumns': {
        return
      }
    }
  },
  initialState,
)
