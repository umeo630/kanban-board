import baretest from 'baretest'
import assert from 'assert'
import { randomID } from '../src/util'

const test = baretest('util')
setImmediate(() => test.run())

test('randomID: 重複しない', async () => {
  const size = 10000
  const unique = new Set<string>()

  for (let i = 0; i < size; i++) {
    const id = randomID()
    unique.add(id)
  }

  assert.equal(size, unique.size)
})
