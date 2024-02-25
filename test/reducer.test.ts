import baretest from 'baretest'
import assert from 'assert'
import { reducer, State } from '../src/reducer'
import { produce } from 'immer'

const test = baretest('reducer')
setImmediate(() => test.run())

const initialState: State = {
  filterValue: '',
  cardsOrder: {},
  deletingCardId: '',
}

test('Filter.SetFilter', async () => {
  const prev = produce(initialState, draft => {
    draft.filterValue = 'hello'
  })

  const next = reducer(prev, {
    type: 'Filter.SetFilter',
    payload: {
      value: 'welcome',
    },
  })

  const expected = produce(prev, draft => {
    draft.filterValue = 'welcome'
  })

  assert.deepStrictEqual(next, expected)
})

test('App.SetCards', async () => {
  const prev = produce(initialState, draft => {
    draft.columns = [
      {
        id: 'A',
      },
      {
        id: 'B',
      },
    ]
  })

  const next = reducer(prev, {
    type: 'App.SetCards',
    payload: {
      cards: [
        {
          id: '3',
        },
        {
          id: '2',
        },
        {
          id: '1',
        },
      ],
      cardsOrder: {
        A: '1',
        '1': '2',
        '2': 'A',
        B: '3',
        '3': 'B',
      },
    },
  })

  const expected = produce(prev, draft => {
    draft.columns = [
      {
        id: 'A',
        cards: [
          {
            id: '1',
          },
          {
            id: '2',
          },
        ],
      },
      {
        id: 'B',
        cards: [
          {
            id: '3',
          },
        ],
      },
    ]
    draft.cardsOrder = {
      A: '1',
      '1': '2',
      '2': 'A',
      B: '3',
      '3': 'B',
    }
  })

  assert.deepStrictEqual(next, expected)
})

test('App.SetDeletingCardId', () => {
  const prev = produce(initialState, draft => {
    draft.deletingCardId = undefined
  })
  const next = reducer(prev, {
    type: 'App.SetDeletingCardId',
    payload: { cardId: 'A' },
  })
  const expected = produce(initialState, prev => {
    prev.deletingCardId = 'A'
  })

  assert.deepEqual(next, expected)
})

test('Dialog.CancelDeleteCard', () => {
  const prev = produce(initialState, draft => {
    draft.deletingCardId = 'A'
  })
  const next = reducer(prev, {
    type: 'Dialog.CancelDeleteCard',
  })
  const expected = produce(prev, draft => {
    draft.deletingCardId = undefined
  })

  assert.deepEqual(next, expected)
})
