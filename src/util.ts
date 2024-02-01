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
