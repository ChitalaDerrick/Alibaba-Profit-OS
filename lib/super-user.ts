/**
 * Client-side check for super user (calls the API endpoint)
 * This is a client-safe utility that doesn't import server-side code
 */
export async function checkSuperUserClient(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/super-user/check?userId=${userId}`)
    if (!response.ok) {
      return false
    }
    const { isSuperUser: isSuper } = await response.json()
    return isSuper
  } catch (error) {
    console.error('[v0] Error checking super user client:', error)
    return false
  }
}
