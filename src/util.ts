/**
 * リストをリストの順序情報に従ってソートした新しいリストを返す
 *
 * @param list リスト
 * @param order リストの順序情報
 * @param head リストの先頭のキー
 */
export function sortBy<
  E extends { id: Exclude<V, null> },
  V extends string | null,
>(list: E[], order: Record<string, V>, head: Exclude<V, null>) {
  const map = list.reduce((m, e) => m.set(e.id, e), new Map<V, E>())

  const sorted: typeof list = []

  let id = order[head]
  for (let i = 0; i < list.length; i++) {
    if (!id || id === head) break

    const e = map.get(id)
    if (e) sorted.push(e)

    id = order[id as Exclude<V, null>]
  }
  return sorted
}

/**
 * ランダムな ID `[0-9A-Za-z_-]{12}` を作成する
 */
export function randomID() {
  const alphabet =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-'

  let id = ''
  for (let i = 12; i > 0; i--) {
    id += alphabet[(Math.random() * 64) | 0]
  }

  return id
}
/**
 * リストの並べ替え
 * @param order 順序情報
 * @param id 対象ID
 * @param toId 移動先のID
 * @return 並べ替え後のリスト
 */
export function reOrderCards<V extends string | null>(
  order: Record<string, V>,
  id: Exclude<V, null>,
  toId: V = null as V,
) {
  const diff: Record<string, V> = {}
  if (id === toId || order[id] === toId) {
    return diff
  }

  const [deleteKey] = Object.entries(order).find(([, v]) => v && v === id) || []

  if (deleteKey) {
    diff[deleteKey] = order[id]
  }

  const [insertKey] =
    Object.entries(order).find(([, v]) => v && v === toId) || []

  if (insertKey) {
    diff[insertKey] = id as V
  }

  diff[id] = toId as V

  return { ...order, ...diff }
}
