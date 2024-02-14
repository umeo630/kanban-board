import { produce } from 'immer'
import { Reducer } from 'redux'

export type State = {}

const initialState: State = {}

export type Action = {
  type: ''
}

export const reducer: Reducer<State, Action> = produce(
  (draft: State, action: Action) => {},
  initialState,
)
