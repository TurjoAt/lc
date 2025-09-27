/**
 * Stub adapter for downstream AI service.
 * Replace this implementation with real API integration when available.
 */
export async function fetchAIResponse(message) {
  // In production, this function would call the real AI service.
  // For now, we return a canned message so that the server can respond.
  return {
    id: Date.now().toString(),
    message: `AI response to: ${message}`,
    createdAt: new Date().toISOString(),
  };
}
