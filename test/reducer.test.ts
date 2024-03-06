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

test('Card.SetDeletingCardId', () => {
  const prev = produce(initialState, draft => {
    draft.deletingCardId = undefined
  })
  const next = reducer(prev, {
    type: 'Card.SetDeletingCardId',
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

test('Dialog.ConfirmDelete', async () => {
  const prev = produce(initialState, draft => {
    draft.deletingCardId = '3'

    draft.cardsOrder = {
      A: '1',
      '1': '2',
      '2': 'A',
      B: '3',
      '3': 'B',
    }
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
  })

  const next = reducer(prev, {
    type: 'Dialog.ConfirmDelete',
  })

  const expected = produce(prev, draft => {
    draft.deletingCardId = undefined

    draft.cardsOrder = {
      ...draft.cardsOrder,
      B: 'B',
      '3': null,
    }

    const column = draft.columns![1]!
    column.cards = []
  })

  assert.deepStrictEqual(next, expected)
})

test('Card.Drop', async () => {
  const prev = produce(initialState, draft => {
    draft.draggingCardId = '1'

    draft.cardsOrder = {
      A: '1',
      '1': '2',
      '2': 'A',
      B: '3',
      '3': 'B',
    }
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
  })

  const next = reducer(prev, {
    type: 'Card.Drop',
    payload: {
      toId: '3',
    },
  })

  const expected = produce(prev, draft => {
    draft.draggingCardId = undefined

    draft.cardsOrder = {
      ...draft.cardsOrder,
      A: '2',
      B: '1',
      '1': '3',
    }

    const [card] = draft.columns![0].cards!.splice(0, 1)
    draft.columns![1].cards!.unshift(card)
  })

  assert.deepStrictEqual(next, expected)
})

test('InputForm.ConfirmInput', async () => {
  const prev = produce(initialState, draft => {
    draft.cardsOrder = {
      A: '1',
      '1': '2',
      '2': 'A',
      B: '3',
      '3': 'B',
    }
    draft.columns = [
      {
        id: 'A',
        text: 'hello',
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
  })

  const next = reducer(prev, {
    type: 'InputForm.ConfirmInput',
    payload: {
      columnId: 'A',
      cardId: 'new',
    },
  })

  const expected = produce(prev, draft => {
    draft.cardsOrder = {
      ...draft.cardsOrder,
      A: 'new',
      new: '1',
    }

    const column = draft.columns![0]!
    column.text = ''
    column.cards!.unshift({
      id: 'new',
      text: 'hello',
    })
  })

  assert.deepStrictEqual(next, expected)
})
