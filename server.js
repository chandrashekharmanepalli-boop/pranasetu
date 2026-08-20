import express from 'express'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT || 8787)
const AI_API_KEY = process.env.AI_API_KEY
const DEMO_MODE = !AI_API_KEY || AI_API_KEY === 'your_key_here'

app.use(express.json({ limit: '1mb' }))
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (request.method === 'OPTIONS') return response.status(204).end()
  next()
})

const facilities = [
  { name: 'City Emergency Hospital', address: 'Market Road, Pune', distance: 2.4, eta: 8, phone: '+91 20 2555 0012', lat: 18.5204, lng: 73.8567, type: 'Hospital' },
  { name: 'Trauma Care Centre', address: 'Shivaji Nagar, Pune', distance: 3.1, eta: 11, phone: '+91 20 2667 1020', lat: 18.5324, lng: 73.8463, type: 'Trauma' },
  { name: 'Critical Care Clinic', address: 'Kalyani Nagar, Pune', distance: 4.8, eta: 16, phone: '+91 20 2408 1802', lat: 18.5514, lng: 73.9035, type: 'Clinic' },
]

const languageMap = {
  en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil', kn: 'Kannada', ml: 'Malayalam', mr: 'Marathi', bn: 'Bengali', gu: 'Gujarati', pa: 'Punjabi', or: 'Odia', ur: 'Urdu',
}

function detectLanguage(text = '') {
  const value = String(text)
  if (/[\u0C00-\u0C7F]/.test(value)) return 'te'
  if (/[\u0B80-\u0BFF]/.test(value)) return 'ta'
  if (/[\u0C80-\u0CFF]/.test(value)) return 'kn'
  if (/[\u0D00-\u0D7F]/.test(value)) return 'ml'
  if (/[\u0900-\u097F]/.test(value)) return 'hi'
  if (/[\u0980-\u09FF]/.test(value)) return 'bn'
  if (/[\u0A80-\u0AFF]/.test(value)) return 'gu'
  if (/[\u0A00-\u0A7F]/.test(value)) return 'pa'
  if (/[\u0B00-\u0B7F]/.test(value)) return 'or'
  if (/[\u0600-\u06FF]/.test(value)) return 'ur'
  return 'en'
}

function detectEmergencyType(text = '') {
  const value = String(text).toLowerCase()
  if (/(fire|smoke|flames|burning|आग|తేనె|మంట|അഗ്നി|ইগনিশন|আগুন|தீ)/.test(value)) return 'Fire'
  if (/(chest pain|heart attack|heart|cardiac|గుండె|ഹൃദയം|ഇടത്|হৃদয়|இதயம்|இதய|இருதயம்)/.test(value)) return 'Heart emergency'
  if (/(stroke|weakness|face droop|sudden confusion|brain|స్ట్రోక్|మూడు|അസ്ഥിരം|স্ট্রোক|মাথা)/.test(value)) return 'Stroke symptoms'
  if (/(breath|shortness of breath|asthma|not breathing|శ్వాస|സ്വാസം|சுவாச|শ্বাস|स्वास)/.test(value)) return 'Breathing problem'
  if (/(accident|collision|crash|hit by car|road accident|vehicle|రోడ్డు|പൊട്ടിക്കിടക്കുന്നു|दुर्घटना|দুর্ঘটনা|ಅಪಘಾತ)/.test(value)) return 'Road accident'
  if (/(bleeding|blood|heavy bleeding|unconscious|fainted|నరాలు|రక్తం|രക്തপাত|இரத்தம்|রক্তপাত|ব্লিডিং|রক্ত)/.test(value)) return 'Severe bleeding'
  if (/(poison|toxic|chemical|overdose|విషం|నిమ్మి|ವಿಷ|நச்சு|বিষ)/.test(value)) return 'Poisoning'
  if (/(child|baby|infant|kid|పిల్ల|குழந்தை|ಮಗು|শিশু)/.test(value)) return 'Child emergency'
  if (/(woman|women|female|pregnant|harassment|స్త్రీ|మహిళ|பெண்|ಮಹಿಳೆ|নারী)/.test(value)) return 'Women\'s emergency'
  if (/(flood|earthquake|storm|cyclone|tsunami|natural disaster|বন্যা|ভূমিকম্প|ঝড়)/.test(value)) return 'Natural disaster'
  if (/(unconscious|fainted|not responsive|passed out|బెహోష్|మూక|അചেতন|অচেতন|ബോധം)/.test(value)) return 'Unconscious person'
  return 'Medical emergency'
}

function detectUrgency(type) {
  if (['Fire', 'Road accident', 'Unconscious person', 'Severe bleeding', 'Breathing problem', 'Heart emergency', 'Stroke symptoms'].includes(type)) return 'CRITICAL'
  if (['Child emergency', 'Women\'s emergency', 'Poisoning', 'Natural disaster'].includes(type)) return 'HIGH'
  return 'MODERATE'
}

function buildDemoResponse(text, language = 'en') {
  const emergencyType = detectEmergencyType(text)
  const urgency = detectUrgency(emergencyType)
  const responses = {
    en: 'This may be a serious emergency. Please contact local emergency services immediately and share your location.',
    hi: 'यह गंभीर आपातकाल हो सकता है। कृपया तुरंत स्थानीय आपातकाल सेवा से संपर्क करें और अपना स्थान साझा करें।',
    te: 'ఇది తీవ్రమైన అత్యవసర పరిస్థితి కావచ్చు. వెంటనే స్థానిక అత్యవసర సేవలను సంప్రదించి మీ స్థానం షేర్ చేయండి.',
    ta: 'இது கடுமையான அவசரநிலை ஆகலாம். உடனடியாக உள்ளூர் அவசர சேவைகளை தொடர்பு கொண்டு உங்கள் இருப்பிடத்தை பகிரவும்.',
    kn: 'ಇದು ಗಂಭೀರ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಾಗಿರಬಹುದು. ದಯವಿಟ್ಟು ತಕ್ಷಣ ಸ್ಥಳೀಯ ತುರ್ತು ಸೇವೆಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಿ.',
    ml: 'ഇത് ഗുരുതരമായ അടിയന്തരാവസ്ഥയാകാം. ഉടൻ പ്രദേശിക അടിയന്തര സേവനങ്ങളുമായി ബന്ധപ്പെടുകയും സ്ഥല പങ്കിടുകയും ചെയ്യുക.',
    mr: 'ही गंभीर आपत्कालाची स्थिती असू शकते. कृपया त्वरित स्थानिक आपत्काल सेवा संपर्क करा आणि तुमचे स्थान शेअर करा.',
    bn: 'এটি গুরুতর জরুরি অবস্থা হতে পারে। দয়া করে অবিলম্বে স্থানীয় জরুরি পরিষেবার সাথে যোগাযোগ করুন এবং আপনার অবস্থান শেয়ার করুন।',
    gu: 'આ ગંભીર ઇમરજન્સી હોઈ શકે છે. કૃપા કરીને તુરંત સ્થાનિક ઇમરજન્સી સેવાઓનો સંપર્ક કરો અને તમારું સ્થાન શેર કરો.',
    pa: 'ਇਹ ਗੰਭੀਰ ਇਮਰਜੈਂਸੀ ਹੋ ਸਕਦੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਸਥਾਨਕ ਇਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਨਾਲ ਸੰਪਰਕ ਕਰੋ ਅਤੇ ਆਪਣਾ ਸਥਾਨ ਸਾਂਝਾ ਕਰੋ।',
    or: 'ଏହା ଗୁରୁତର ଜରୁରୀ ଅବସ୍ଥା ହୋଇପାରେ। ଦୟାକରି ତତ୍ତକାଳେ ସ୍ଥାନୀୟ ଜରୁରୀ ସେବାଙ୍କୁ କଲ୍ କରନ୍ତୁ ଏବଂ ଆପଣଙ୍କ ଲୋକେସନ୍ ସେୟାର୍ କରନ୍ତୁ।',
    ur: 'یہ شدید ایمرجینسی ہو سکتی ہے۔ براہ کرم فوری طور پر مقامی ایمرجینسی خدمات سے رابطہ کریں اور اپنا مقام شیئر کریں۔',
  }

  return {
    emergencyType: emergencyType,
    urgency,
    incidentDetails: text.trim() || 'Emergency report received.',
    detectedLanguage: language,
    recommendedAction: urgency === 'CRITICAL' ? 'Contact local emergency services immediately and share your location.' : 'Seek urgent care and share location for the nearest facility.',
    response: responses[language] || responses.en,
  }
}

async function callAiProvider(text, language) {
  if (DEMO_MODE) {
    return buildDemoResponse(text, language)
  }

  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are PranaSetu, a multilingual emergency assistant. Return valid JSON with keys: emergencyType, urgency, incidentDetails, detectedLanguage, recommendedAction, response. Keep language consistent with the user input.' },
      { role: 'user', content: `User text: ${text}\nLanguage: ${language}\nReturn JSON only.` },
    ],
    temperature: 0.2,
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    return buildDemoResponse(text, language)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || '{}'
  try {
    const parsed = JSON.parse(content)
    return {
      ...parsed,
      detectedLanguage: parsed.detectedLanguage || language,
      response: parsed.response || buildDemoResponse(text, language).response,
    }
  } catch {
    return buildDemoResponse(text, language)
  }
}

app.get('/api/health', (request, response) => {
  response.json({ ok: true, demoMode: DEMO_MODE, service: 'pranasetu' })
})

app.post('/api/ai/analyze', async (request, response) => {
  const text = String(request.body?.text || request.body?.message || '').trim()
  if (!text) {
    return response.status(400).json({ error: 'Text is required' })
  }

  const language = request.body?.language || detectLanguage(text)
  const result = await callAiProvider(text, language)
  response.json(result)
})

app.post('/api/ai/respond', async (request, response) => {
  const text = String(request.body?.text || request.body?.message || '').trim()
  if (!text) {
    return response.status(400).json({ error: 'Text is required' })
  }

  const language = request.body?.language || detectLanguage(text)
  const result = await callAiProvider(text, language)
  response.json({ response: result.response, language, demoMode: DEMO_MODE })
})

app.post('/api/emergency', (request, response) => {
  const payload = request.body || {}
  response.status(201).json({
    ok: true,
    id: `PS-${Date.now()}`,
    status: 'received',
    summary: payload.summary || 'Emergency received',
    language: payload.language || 'en',
    demoMode: DEMO_MODE,
  })
})

app.get('/api/hospitals/nearby', (request, response) => {
  response.json({ source: DEMO_MODE ? 'demo' : 'provider', facilities })
})

app.post('/api/location', (request, response) => {
  const payload = request.body || {}
  response.json({ ok: true, location: payload, source: DEMO_MODE ? 'demo' : 'provider' })
})

app.listen(PORT, () => {
  console.log(`PranaSetu backend listening on ${PORT} (demoMode=${DEMO_MODE})`)
})
