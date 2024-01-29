export async function get(path: string) {
  const endPoint = process.env.API_ENDPOINT
  const response = await fetch(endPoint + path)
  return await response.json()
}
