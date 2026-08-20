import { createServer } from 'node:http'

const port = Number(process.env.PORT || 8787)
const incidents = []
const demoHospitals = [
  { name: 'City Emergency Hospital', distance: '2.8 km', eta: '7 min', suitability: 94, availability: 'Demo / simulated' },
  { name: 'District Trauma Centre', distance: '3.4 km', eta: '9 min', suitability: 88, availability: 'Demo / simulated' },
  { name: 'Central Medical Institute', distance: '4.1 km', eta: '11 min', suitability: 79, availability: 'Demo / simulated' },
]

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  response.end(JSON.stringify(body))
}

const server = createServer((request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' })
    response.end()
    return
  }
  if (request.url === '/api/health' && request.method === 'GET') {
    sendJson(response, 200, { ok: true, service: 'pranasetu-coordination', incidents: incidents.length })
    return
  }
  if (request.url === '/api/incidents' && request.method === 'GET') {
    sendJson(response, 200, { incidents })
    return
  }
  if ((request.url === '/api/incidents' || request.url === '/api/emergencies') && request.method === 'POST') {
    let payload = ''
    request.on('data', (chunk) => { payload += chunk })
    request.on('end', () => {
      const incident = { id: `PS-${Date.now()}`, status: 'REPORTED', events: [], createdAt: new Date().toISOString(), ...JSON.parse(payload || '{}') }
      incidents.unshift(incident)
      sendJson(response, 201, incident)
    })
    return
  }
  const incidentMatch = request.url?.match(/^\/api\/emergencies\/([^/]+)(?:\/(events|status|location))?$/)
  if (incidentMatch) {
    const incident = incidents.find((item) => item.id === incidentMatch[1])
    if (!incident) { sendJson(response, 404, { error: 'Emergency not found' }); return }
    if (incidentMatch[2] === 'events') { sendJson(response, 200, { events: incident.events || [] }); return }
    if (incidentMatch[2] === 'location' && request.method === 'PATCH') {
      let payload = ''
      request.on('data', (chunk) => { payload += chunk })
      request.on('end', () => { incident.location = JSON.parse(payload || '{}'); incident.events = [...(incident.events || []), { type: 'LOCATION_UPDATE', location: incident.location, at: new Date().toISOString() }]; sendJson(response, 200, incident) })
      return
    }
    if (incidentMatch[2] === 'status' && request.method === 'PATCH') {
      let payload = ''
      request.on('data', (chunk) => { payload += chunk })
      request.on('end', () => { const update = JSON.parse(payload || '{}'); incident.status = update.status || incident.status; incident.events = [...(incident.events || []), { status: incident.status, at: new Date().toISOString() }]; sendJson(response, 200, incident) })
      return
    }
    sendJson(response, 200, incident)
    return
  }
  if (request.url === '/api/hospitals/nearby' && request.method === 'GET') { sendJson(response, 200, { demoData: true, hospitals: demoHospitals }); return }
  if (request.url === '/api/hospitals/recommend' && request.method === 'POST') { sendJson(response, 200, { demoData: true, recommendation: demoHospitals[0], alternatives: demoHospitals.slice(1) }); return }
  if (request.url === '/api/analytics' && request.method === 'GET') { sendJson(response, 200, { demoData: true, totalIncidents: 127, criticalIncidents: 31, averageResponseMinutes: 8.4, mostCommonEmergency: 'Medical' }); return }
  if (request.url === '/api/notifications/create' && request.method === 'POST') {
    let payload = ''
    request.on('data', (chunk) => { payload += chunk })
    request.on('end', () => {
      const requestData = JSON.parse(payload || '{}')
      const channels = Array.isArray(requestData.channels) ? requestData.channels : []
      sendJson(response, 201, { demo: true, status: 'prepared', channels, location: requestData.location || null, message: 'Demo notification prepared; no message was sent.' })
    })
    return
  }
  sendJson(response, 404, { error: 'Route not found' })
})

server.listen(port, () => {
  console.log(`PranaSetu coordination server listening on http://localhost:${port}`)
})
