const endPoint = process.env.API_ENDPOINT

export async function get(path: string) {
  const response = await fetch(endPoint + path)
  return await response.json()
}

export async function post(path: string, params?: any) {
  const response = await fetch(endPoint + path, {
    method: 'POST',
    body: JSON.stringify(params),
  })

  return await response.json()
}
