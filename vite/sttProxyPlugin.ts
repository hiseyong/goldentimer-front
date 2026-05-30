import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

async function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function handleSttRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error:
          'OPENAI_API_KEY is not set. Add it to .env for cloud STT in local dev.',
      }),
    )
    return
  }

  const contentType = req.headers['content-type']
  if (!contentType?.includes('multipart/form-data')) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Expected multipart form data' }))
    return
  }

  const body = await readBody(req)
  const openaiResponse = await fetch(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': contentType,
      },
      body,
    },
  )

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text()
    res.statusCode = openaiResponse.status
    res.setHeader('Content-Type', 'application/json')
    res.end(errorText)
    return
  }

  const payload = (await openaiResponse.json()) as { text?: string }
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ text: payload.text ?? '' }))
}

function attachSttMiddleware(
  middlewares: {
    use: (
      path: string,
      handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void,
    ) => void
  },
) {
  middlewares.use('/api/stt', (req, res, _next) => {
    void handleSttRequest(req, res).catch((error: unknown) => {
      if (res.writableEnded) return
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'STT proxy failed',
        }),
      )
    })
  })
}

export function sttProxyPlugin(): Plugin {
  return {
    name: 'goldentimer-stt-proxy',
    configureServer(server) {
      attachSttMiddleware(server.middlewares)
    },
    configurePreviewServer(server) {
      attachSttMiddleware(server.middlewares)
    },
  }
}
