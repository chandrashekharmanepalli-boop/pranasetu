import { createServer } from 'node:http'

const port = Number(process.env.PORT || 8787)
const host = '0.0.0.0'

const incidents = []
const requestWindows = new Map()
const MAX_BODY_BYTES = 256 * 1024

const demoHospitals = [
  {
    name: 'City Emergency Hospital',
    distance: '2.8 km',
    eta: '7 min',
    suitability: 94,
    availability: 'Demo / simulated',
  },
  {
    name: 'District Trauma Centre',
    distance: '3.4 km',
    eta: '9 min',
    suitability: 88,
    availability: 'Demo / simulated',
  },
  {
    name: 'Central Medical Institute',
    distance: '4.1 km',
    eta: '11 min',
    suitability: 79,
    availability: 'Demo / simulated',
  },
]

const demoReplies = {
  en: 'This may be an emergency. Stay with the person, avoid food or drink, and seek immediate professional emergency assistance.',
  hi: 'यह आपातकाल हो सकता है। व्यक्ति के साथ रहें, उन्हें खाना या पानी न दें और तुरंत पेशेवर आपातकालीन सहायता लें।',
  mr: 'ही आपत्कालीन स्थिती असू शकते. व्यक्तीजवळ रहा, त्यांना खाणे किंवा पाणी देऊ नका आणि त्वरित वैद्यकीय मदत घ्या.',
  te: 'ఇది అత్యవసర పరిస్థితి కావచ్చు. వ్యక్తి దగ్గర ఉండండి, ఆహారం లేదా పానీయం ఇవ్వకండి మరియు వెంటనే అత్యవసర వైద్య సహాయం తీసుకోండి.',
  ta: 'இது அவசரநிலையாக இருக்கலாம். அந்த நபருடன் இருங்கள், உணவு அல்லது பானம் கொடுக்காதீர்கள், உடனடி மருத்துவ உதவியைப் பெறுங்கள்.',
  bn: 'এটি জরুরি অবস্থা হতে পারে। ব্যক্তির সঙ্গে থাকুন, খাবার বা পানীয় দেবেন না এবং অবিলম্বে জরুরি চিকিৎসা সহায়তা নিন।',
  kn: 'ಇದು ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಾಗಿರಬಹುದು. ವ್ಯಕ್ತಿಯೊಂದಿಗೆ ಇರಿ, ಆಹಾರ ಅಥವಾ ಪಾನೀಯ ನೀಡಬೇಡಿ ಮತ್ತು ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪಡೆಯಿರಿ.',
  gu: 'આ કટોકટી હોઈ શકે છે. વ્યક્તિ સાથે રહો, ખોરાક અથવા પીણું આપશો નહીં અને તરત તબીબી સહાય મેળવો.',
  pa: 'ਇਹ ਐਮਰਜੈਂਸੀ ਹੋ ਸਕਦੀ ਹੈ। ਵਿਅਕਤੀ ਦੇ ਨਾਲ ਰਹੋ, ਖਾਣ-ਪੀਣ ਨਾ ਦਿਓ ਅਤੇ ਤੁਰੰਤ ਡਾਕਟਰੀ ਮਦਦ ਲਵੋ।',
  ur: 'یہ ہنگامی صورتحال ہو سکتی ہے۔ شخص کے ساتھ رہیں، کھانا یا پانی نہ دیں اور فوری طبی مدد حاصل کریں۔',
  ml: 'ഇത് അടിയന്തരാവസ്ഥയായിരിക്കാം. വ്യക്തിയുടെ കൂടെ നിൽക്കുക, ഭക്ഷണമോ പാനീയമോ നൽകരുത്, ഉടൻ വൈദ്യസഹായം തേടുക.',
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })

  response.end(JSON.stringify(body))
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let payload = ''

    request.on('data', (chunk) => {
      payload += chunk
      if (Buffer.byteLength(payload) > MAX_BODY_BYTES) {
        request.destroy(new Error('Request body too large'))
      }
    })

    request.on('end', () => {
      try {
        resolve(JSON.parse(payload || '{}'))
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })

    request.on('error', reject)
  })
}

const server = createServer(async (request, response) => {
  try {
    const clientKey = request.socket.remoteAddress || 'unknown'
    const now = Date.now()
    const windowStart = now - 60_000
    const recentRequests = (requestWindows.get(clientKey) || []).filter((timestamp) => timestamp > windowStart)
    const requestLimit = request.url === '/api/ai/chat' ? 30 : 120
    if (request.method !== 'OPTIONS' && recentRequests.length >= requestLimit) {
      sendJson(response, 429, { error: 'Too many requests. Please try again shortly.' })
      return
    }
    requestWindows.set(clientKey, [...recentRequests, now])
    if (request.method === 'OPTIONS') {
      response.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      })

      response.end()
      return
    }

    const url = request.url || '/'

    // Health check
    if (url === '/api/health' && request.method === 'GET') {
      sendJson(response, 200, {
        ok: true,
        service: 'pranasetu-coordination',
        incidents: incidents.length,
      })
      return
    }

    if (url === '/api/ai/chat' && request.method === 'POST') {
      const payload = await readJson(request)
      const language = typeof payload.language === 'string' && demoReplies[payload.language] ? payload.language : 'en'
      const message = typeof payload.message === 'string' ? payload.message.trim().slice(0, 2000) : ''
      if (!message) {
        sendJson(response, 400, { error: 'Message is required', language })
        return
      }
      sendJson(response, 200, {
        provider: 'demo',
        language,
        reply: demoReplies[language],
        conversationId: payload.conversationId || `demo-${Date.now()}`,
      })
      return
    }

    // Get all incidents
    if (url === '/api/incidents' && request.method === 'GET') {
      sendJson(response, 200, {
        incidents,
      })
      return
    }

    // Create emergency / incident
    if (
      (url === '/api/incidents' || url === '/api/emergencies') &&
      request.method === 'POST'
    ) {
      const payload = await readJson(request)

      const incident = {
        id: `PS-${Date.now()}`,
        status: 'REPORTED',
        events: [],
        createdAt: new Date().toISOString(),
        ...payload,
      }

      incidents.unshift(incident)

      sendJson(response, 201, incident)
      return
    }

    // Emergency-specific routes
    const incidentMatch = url.match(
      /^\/api\/emergencies\/([^/]+)(?:\/(events|status|location))?$/
    )

    if (incidentMatch) {
      const incidentId = incidentMatch[1]
      const action = incidentMatch[2]

      const incident = incidents.find(
        (item) => item.id === incidentId
      )

      if (!incident) {
        sendJson(response, 404, {
          error: 'Emergency not found',
        })
        return
      }

      // Get emergency events
      if (action === 'events' && request.method === 'GET') {
        sendJson(response, 200, {
          events: incident.events || [],
        })
        return
      }

      // Update emergency location
      if (action === 'location' && request.method === 'PATCH') {
        const payload = await readJson(request)

        incident.location = payload

        incident.events = [
          ...(incident.events || []),
          {
            type: 'LOCATION_UPDATE',
            location: incident.location,
            at: new Date().toISOString(),
          },
        ]

        sendJson(response, 200, incident)
        return
      }

      // Update emergency status
      if (action === 'status' && request.method === 'PATCH') {
        const update = await readJson(request)

        incident.status = update.status || incident.status

        incident.events = [
          ...(incident.events || []),
          {
            status: incident.status,
            at: new Date().toISOString(),
          },
        ]

        sendJson(response, 200, incident)
        return
      }

      // Get single emergency
      if (!action && request.method === 'GET') {
        sendJson(response, 200, incident)
        return
      }
    }

    // Nearby hospitals
    if (
      url === '/api/hospitals/nearby' &&
      request.method === 'GET'
    ) {
      sendJson(response, 200, {
        demoData: true,
        hospitals: demoHospitals,
      })
      return
    }

    // Hospital recommendation
    if (
      url === '/api/hospitals/recommend' &&
      request.method === 'POST'
    ) {
      sendJson(response, 200, {
        demoData: true,
        recommendation: demoHospitals[0],
        alternatives: demoHospitals.slice(1),
      })
      return
    }

    // Analytics
    if (
      url === '/api/analytics' &&
      request.method === 'GET'
    ) {
      sendJson(response, 200, {
        demoData: true,
        totalIncidents: 127,
        criticalIncidents: 31,
        averageResponseMinutes: 8.4,
        mostCommonEmergency: 'Medical',
      })
      return
    }

    // Notifications
    if (
      url === '/api/notifications/create' &&
      request.method === 'POST'
    ) {
      const requestData = await readJson(request)

      const channels = Array.isArray(requestData.channels)
        ? requestData.channels
        : []

      sendJson(response, 201, {
        demo: true,
        status: 'prepared',
        channels,
        location: requestData.location || null,
        message:
          'Demo notification prepared; no message was sent.',
      })

      return
    }

    // Unknown route
    sendJson(response, 404, {
      error: 'Route not found',
    })
  } catch (error) {
    console.error(error)

    sendJson(response, 500, {
      error: 'Internal server error',
      message: error.message,
    })
  }
})

server.listen(port, host, () => {
  console.log(
    `PranaSetu coordination server listening on ${host}:${port}`
  )
})