import { NextRequest } from 'next/server'

// This route proxies audio playback through the same-origin Next.js API route
// to ensure the browser can fetch audio files with credentials (token) without
// CORS issues.

// Route: /api/studio/audio/play/:accountId/:audioId
export async function GET(req: NextRequest, context: { params: { accountId: string; audioId: string } }) {
  const { accountId, audioId } = context.params
  const account = Number(accountId) || 0
  const id = Number(audioId) || 0

  // Read bearer token from the request (sent by the client)
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  // If we can't determine IDs, fail gracefully
  if (!account || !id) {
    return new Response('Invalid accountId or audioId', { status: 400 })
  }

  try {
    // Step 1: fetch audio detail to learn the actual src URL
    const cookieHeader = req.headers.get('cookie') ?? ''
    const detailHeaders: Record<string, string> = {}
    if (token) detailHeaders['Authorization'] = `Bearer ${token}`
    if (cookieHeader) detailHeaders['Cookie'] = cookieHeader
    const detailRes = await fetch(`https://radio.backend.ecocloud.tn/audio/detail/${account}/${id}/`, {
      headers: detailHeaders
    })

    if (!detailRes.ok) {
      return new Response(`Failed to fetch audio detail: ${detailRes.status}`, { status: detailRes.status })
    }

    const detail: { src?: string } = await detailRes.json()
    const audioSrc = detail?.src
    if (!audioSrc) {
      return new Response('Audio source not found', { status: 500 })
    }

    // Step 2: fetch the actual audio content from the source, forwarding range and auth
    const range = req.headers.get('range') ?? undefined
    const forwardHeaders: Record<string, string> = {}
    if (token) forwardHeaders['Authorization'] = `Bearer ${token}`
    if (cookieHeader) forwardHeaders['Cookie'] = cookieHeader
    if (range) forwardHeaders['Range'] = range

    const audioRes = await fetch(audioSrc, {
      headers: forwardHeaders
    })

    if (!audioRes.ok && audioRes.status !== 206) {
      return new Response(`Failed to fetch audio: ${audioRes.status}`, { status: audioRes.status })
    }

    // Forward content type and status, and stream the body to the client
    const contentType = audioRes.headers.get('Content-Type') ?? 'audio/mpeg'
    const body = audioRes.body
    if (!body) {
      // No body stream available, fallback to redirecting to the original src
      return Response.redirect(audioSrc, 307)
    }
    return new Response(body, {
      status: audioRes.status,
      headers: {
        'Content-Type': contentType
      }
    })
  } catch (err) {
    return new Response(`Proxy error: ${String(err)}`, { status: 500 })
  }
}
