import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

const languages = [
  { id: 'as', label: 'অসমীয়া', locale: 'as-IN', sample: 'মোৰ বুকুত বিষ হৈছে, মোক সহায় লাগে।' },
  { id: 'bn', label: 'বাংলা', locale: 'bn-IN', sample: 'আমার বুকে ব্যথা হচ্ছে, আমার সাহায্য দরকার।' },
  { id: 'brx', label: 'बड़ो', locale: 'hi-IN', sample: 'आंनि जेबो दुखो जायो, आंहा मदद नांगो।' },
  { id: 'doi', label: 'डोगरी', locale: 'hi-IN', sample: 'मेरे सीने च दर्द ऐ, मिगी मदद चाहिदी ऐ।' },
  { id: 'en', label: 'English', locale: 'en-IN', sample: 'I have chest pain and need help.' },
  { id: 'gu', label: 'ગુજરાતી', locale: 'gu-IN', sample: 'મારી છાતીમાં દુખાવો છે, મને મદદ જોઈએ છે.' },
  { id: 'hi', label: 'हिन्दी', locale: 'hi-IN', sample: 'मेरे सीने में दर्द है, मुझे मदद चाहिए।' },
  { id: 'kn', label: 'ಕನ್ನಡ', locale: 'kn-IN', sample: 'ನನ್ನ ಎದೆ ನೋಯುತ್ತಿದೆ, ನನಗೆ ಸಹಾಯ ಬೇಕು.' },
  { id: 'ks', label: 'کٲشُر / कश्मीरी', locale: 'ks-IN', sample: 'مےٚ چھَتِس دٔرد چھُ، مےٚ مدد چاہی۔' },
  { id: 'kok', label: 'कोंकणी', locale: 'kok-IN', sample: 'म्हज्या छातीत दुखता, म्हाका मदत जाय.' },
  { id: 'mai', label: 'मैथिली', locale: 'hi-IN', sample: 'हमरा छाती मे दर्द अछि, हमरा मदद चाही।' },
  { id: 'ml', label: 'മലയാളം', locale: 'ml-IN', sample: 'എന്റെ നെഞ്ചിൽ വേദനയുണ്ട്, എനിക്ക് സഹായം വേണം.' },
  { id: 'mni', label: 'ꯃꯤꯇꯩ ꯂꯣꯟ', locale: 'mni-IN', sample: 'ঐগী ꯅꯨꯡꯁꯤꯠꯇ ꯌꯥꯎꯕ ꯂꯩ, ꯑꯩꯒꯤ ꯃꯊꯧ ꯂꯩ।' },
  { id: 'mr', label: 'मराठी', locale: 'mr-IN', sample: 'माझ्या छातीत दुखत आहे, मला मदत हवी आहे.' },
  { id: 'ne', label: 'नेपाली', locale: 'ne-IN', sample: 'मेरो छाती दुखिरहेको छ, मलाई सहयोग चाहिन्छ।' },
  { id: 'or', label: 'ଓଡ଼ିଆ', locale: 'or-IN', sample: 'ମୋ ଛାତିରେ ଯନ୍ତ୍ରଣା ହେଉଛି, ମୋତେ ସାହାଯ୍ୟ ଦରକାର।' },
  { id: 'pa', label: 'ਪੰਜਾਬੀ', locale: 'pa-IN', sample: 'ਮੇਰੀ ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਹੈ, ਮੈਨੂੰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ।' },
  { id: 'sa', label: 'संस्कृतम्', locale: 'sa-IN', sample: 'मम वक्षसि पीडा अस्ति, मम साहाय्यं आवश्यकम्।' },
  { id: 'sat', label: 'ᱥᱟᱱᱛᱟᱲᱤ', locale: 'sat-IN', sample: 'ᱤᱧᱟᱜ ᱵᱩᱠᱩ ᱨᱩᱡᱟ ᱜᱮᱭᱟ, ᱤᱧ ᱥᱟᱦᱟᱭ ᱞᱟᱹᱜᱤᱫ ᱢᱮᱱᱟᱜᱼᱟ।' },
  { id: 'sd', label: 'سنڌي / सिन्धी', locale: 'sd-IN', sample: 'منهنجي ڇاتي ۾ سور آهي، مون کي مدد گهرجي۔' },
  { id: 'ta', label: 'தமிழ்', locale: 'ta-IN', sample: 'எனக்கு நெஞ்சு வலி உள்ளது, எனக்கு உதவி தேவை.' },
  { id: 'te', label: 'తెలుగు', locale: 'te-IN', sample: 'నా ఛాతిలో నొప్పిగా ఉంది, నాకు సహాయం కావాలి.' },
  { id: 'ur', label: 'اردو', locale: 'ur-IN', sample: 'میرے سینے میں درد ہے، مجھے مدد چاہیے۔' },
]

const hospitals = [
  { name: 'Ruby Hall Clinic', distance: '2.4 km', eta: '8 min', score: '96', reason: 'Cardiac care · fastest route' },
  { name: 'Jehangir Hospital', distance: '3.1 km', eta: '11 min', score: '91', reason: '24/7 emergency · ICU available' },
  { name: 'Sahyadri Hospital', distance: '4.8 km', eta: '16 min', score: '85', reason: 'Emergency care · 18 beds open' },
]

const flow = ['Landing', 'Login', 'Home', 'Emergency', 'Voice', 'Transcript', 'AI Analysis', 'Follow-up', 'GPS', 'Hospitals', 'Ranking', 'Map', 'Navigation', 'Tracking', 'Timeline', 'Command Center', 'Live Status', 'Resolved']
const interfaceCopy = {
  en: { hero: 'Emergency help, intelligently connected.', start: 'Start Emergency', greeting: 'Good morning, Aarav.', emergency: 'Emergency', speak: 'Speak for help' },
  hi: { hero: 'आपातकालीन सहायता, समझदारी से जुड़ी हुई।', start: 'आपातकाल शुरू करें', greeting: 'सुप्रभात, आरव।', emergency: 'आपातकाल', speak: 'मदद के लिए बोलें' },
  mr: { hero: 'आपत्कालीन मदत, हुशारीने जोडलेली.', start: 'आपत्काल सुरू करा', greeting: 'शुभ सकाळ, आरव.', emergency: 'आपत्काल', speak: 'मदतीसाठी बोला' },
}

const emergencyTranslations = {
  hi: {
    'Tell us what happened.': 'बताइए क्या हुआ है।', 'Speak naturally in': 'अपनी भाषा में सहज बोलें।', 'We heard you.': 'हमने आपकी बात सुनी।', 'Check the words below before we assess the situation.': 'आकलन से पहले नीचे लिखे शब्दों की जाँच करें।', 'Analyze emergency': 'आपातकाल का आकलन करें', 'This needs urgent care.': 'यह तत्काल सहायता की स्थिति है।', 'Answer two quick questions': 'दो छोटे सवालों के जवाब दें', 'Where are you right now?': 'आप अभी कहाँ हैं?', 'Capture my location': 'मेरी लोकेशन लें', 'See recommendations': 'सुझाव देखें', 'View live route': 'लाइव मार्ग देखें', 'Start navigation': 'नेविगेशन शुरू करें', 'View emergency timeline': 'आपातकाल की टाइमलाइन देखें', 'Open command center': 'कमांड सेंटर खोलें', 'Watch live status': 'लाइव स्थिति देखें', 'Mark as resolved': 'समाधान के रूप में दर्ज करें', 'Return to home': 'होम पर लौटें', 'Continue': 'जारी रखें', 'Next question': 'अगला सवाल', 'Capture location': 'लोकेशन लें', 'Use demo Pune location': 'डेमो पुणे लोकेशन इस्तेमाल करें', 'Use this location': 'यह लोकेशन इस्तेमाल करें', 'Nearby help is visible.': 'नज़दीकी सहायता दिखाई दे रही है।', 'Help has a clear path.': 'मदद का मार्ग तैयार है।', 'Go with confidence.': 'विश्वास के साथ आगे बढ़ें।', 'Your response team is moving.': 'आपकी सहायता टीम आ रही है।', 'Every step is accounted for.': 'हर कदम दर्ज किया जा रहा है।', 'The whole response, together.': 'पूरी प्रतिक्रिया एक साथ।', 'The handoff is happening.': 'सहायता का हस्तांतरण हो रहा है।', 'You are not alone.': 'आप अकेले नहीं हैं।', 'Are you safe?': 'क्या आप सुरक्षित हैं?', 'Possible crash detected.': 'संभावित दुर्घटना का पता चला।'
  },
  mr: {
    'Tell us what happened.': 'काय झाले ते सांगा.', 'We heard you.': 'आम्ही तुमचे म्हणणे ऐकले.', 'Check the words below before we assess the situation.': 'आकलन करण्यापूर्वी खालील शब्द तपासा.', 'Analyze emergency': 'आपत्कालाचे आकलन करा', 'This needs urgent care.': 'यासाठी तातडीची मदत आवश्यक आहे.', 'Answer two quick questions': 'दोन छोट्या प्रश्नांची उत्तरे द्या', 'Where are you right now?': 'तुम्ही सध्या कुठे आहात?', 'Capture my location': 'माझे स्थान मिळवा', 'See recommendations': 'शिफारसी पहा', 'View live route': 'लाइव्ह मार्ग पहा', 'Start navigation': 'नेव्हिगेशन सुरू करा', 'View emergency timeline': 'आपत्कालीन टाइमलाइन पहा', 'Open command center': 'कमांड सेंटर उघडा', 'Watch live status': 'लाइव्ह स्थिती पहा', 'Mark as resolved': 'निराकरण म्हणून नोंदवा', 'Return to home': 'होमवर परत जा', 'Continue': 'पुढे जा', 'Next question': 'पुढील प्रश्न', 'Capture location': 'स्थान मिळवा', 'Use demo Pune location': 'डेमो पुणे स्थान वापरा', 'Use this location': 'हे स्थान वापरा', 'Nearby help is visible.': 'जवळची मदत दिसत आहे.', 'Help has a clear path.': 'मदतीचा मार्ग तयार आहे.', 'Go with confidence.': 'विश्वासाने पुढे जा.', 'Your response team is moving.': 'तुमची मदत टीम येत आहे.', 'Every step is accounted for.': 'प्रत्येक पाऊल नोंदवले जात आहे.', 'The whole response, together.': 'संपूर्ण प्रतिसाद एकत्र.', 'The handoff is happening.': 'मदत हस्तांतरित होत आहे.', 'You are not alone.': 'तुम्ही एकटे नाही.', 'Are you safe?': 'तुम्ही सुरक्षित आहात का?', 'Possible crash detected.': 'संभाव्य अपघात आढळला.'
  }
}

function translateEmergency(text) { const language = window.localStorage.getItem('pranasetu-language') || 'en'; return emergencyTranslations[language]?.[text] || text }

function Logo() {
  return <div className="logo-lockup"><span className="logo-mark"><svg viewBox="0 0 46 46" aria-hidden="true"><path d="M8 30c6.5 0 6.5-12 13-12s6.5 12 13 12" /><path className="logo-pulse" d="M18.5 18 22 11l3.5 7" /><circle cx="22" cy="10" r="2.4" /></svg></span><span><strong>PranaSetu</strong><small>bridge of life</small></span><LanguageButton /><ThemeButton /></div>
}

function LanguageButton() { const [value, setValue] = useState(() => window.localStorage.getItem('pranasetu-language') || 'en'); return <select className="global-language-select" aria-label="Change website language" value={value} onChange={(event) => { setValue(event.target.value); window.localStorage.setItem('pranasetu-language', event.target.value); window.dispatchEvent(new CustomEvent('pranasetu-language-change', { detail: event.target.value })) }}>{languages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select> }

function ThemeButton() { const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem('pranasetu-theme') === 'dark'); const toggle = () => { const next = !darkMode; setDarkMode(next); document.documentElement.dataset.theme = next ? 'dark' : 'light'; window.localStorage.setItem('pranasetu-theme', next ? 'dark' : 'light') }; return <button className="theme-button" onClick={toggle} aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'} title={darkMode ? 'Light theme' : 'Dark theme'}>{darkMode ? '☀' : '◐'}<span>{darkMode ? 'Light' : 'Dark'}</span></button> }

function App() {
  const [screen, setScreen] = useState('landing')
  const [showIntro, setShowIntro] = useState(true)
  const [language, setLanguage] = useState(() => window.localStorage.getItem('pranasetu-language') || 'en')
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [location, setLocation] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [darkMode] = useState(() => window.localStorage.getItem('pranasetu-theme') === 'dark')
  const [answer, setAnswer] = useState('')
  const [timeline, setTimeline] = useState([])
  const [crashMode, setCrashMode] = useState(false)
  const [countdown, setCountdown] = useState(15)
  const [backendOnline, setBackendOnline] = useState(false)
  const [motionEnabled, setMotionEnabled] = useState(false)
  const motionWindow = useRef([])
  const [emergencyId, setEmergencyId] = useState(null)
  const [autoEscalated, setAutoEscalated] = useState(false)
  const locationWatch = useRef(null)
  const escalationStarted = useRef(false)
  const escalateRef = useRef(null)
  const crashTestRef = useRef(null)

  const selectedLanguage = languages.find((item) => item.id === language)

  useEffect(() => {
    window.localStorage.setItem('pranasetu-language', language)
  }, [language])

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 2400)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleLanguageChange = (event) => setLanguage(event.detail)
    window.addEventListener('pranasetu-language-change', handleLanguageChange)
    return () => window.removeEventListener('pranasetu-language-change', handleLanguageChange)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    window.localStorage.setItem('pranasetu-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    fetch('/api/health').then((response) => response.ok && setBackendOnline(true)).catch(() => setBackendOnline(false))
  }, [])

  useEffect(() => {
    if (!isListening) return undefined
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      const timer = window.setTimeout(() => { setTranscript(selectedLanguage.sample); setIsListening(false); setScreen('transcript') }, 2200)
      return () => window.clearTimeout(timer)
    }
    const recognition = new Recognition()
    recognition.lang = selectedLanguage.locale
    recognition.continuous = false
    recognition.onresult = (event) => { setTranscript(event.results[0][0].transcript); setIsListening(false); setScreen('transcript') }
    recognition.onerror = () => { setTranscript(selectedLanguage.sample); setIsListening(false); setScreen('transcript') }
    recognition.onend = () => setIsListening(false)
    recognition.start()
    return () => recognition.abort()
  }, [isListening, language, selectedLanguage])

  useEffect(() => {
    if (!crashMode || screen !== 'crash-countdown') return undefined
    if (countdown <= 0) { window.setTimeout(() => { escalateRef.current?.('No response received · emergency escalated automatically') }, 0); return undefined }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [crashMode, screen, countdown])

  useEffect(() => {
    if (!crashMode || screen !== 'crash-countdown') return undefined
    const handleHelpClick = (event) => { if (event.target.closest('button')?.textContent.includes('Send Help')) escalateRef.current?.('User selected Send Help · automatic emergency confirmed') }
    document.addEventListener('click', handleHelpClick, true)
    return () => document.removeEventListener('click', handleHelpClick, true)
  }, [crashMode, screen])

  useEffect(() => {
    if (!motionEnabled || screen !== 'home') return undefined
    const handleMotion = (event) => {
      const acceleration = event.accelerationIncludingGravity
      if (!acceleration) return
      const magnitude = Math.sqrt((acceleration.x || 0) ** 2 + (acceleration.y || 0) ** 2 + (acceleration.z || 0) ** 2)
      const now = Date.now()
      motionWindow.current = [...motionWindow.current.filter((time) => now - time < 900), ...(magnitude > 25 ? [now] : [])]
      if (motionWindow.current.length >= 3) { motionWindow.current = []; crashTestRef.current?.() }
    }
    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [motionEnabled, screen])

  useEffect(() => {
    if (!autoEscalated || !emergencyId || !navigator.geolocation) return undefined
    locationWatch.current = navigator.geolocation.watchPosition((position) => {
      const nextLocation = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy, label: 'Live device location' }
      setLocation((previous) => ({ ...previous, ...nextLocation }))
      fetch(`/api/emergencies/${emergencyId}/location`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nextLocation) }).catch(() => undefined)
    }, () => setTimeline((items) => [...items, 'Live GPS unavailable · last known location retained']), { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 })
    return () => { if (locationWatch.current !== null) navigator.geolocation.clearWatch(locationWatch.current) }
  }, [autoEscalated, emergencyId])

  const addEvent = (event) => setTimeline((items) => [...items, event])
    async function escalateEmergency(event) {
      if (escalationStarted.current) return
      escalationStarted.current = true
      setCrashMode(false)
      setAutoEscalated(true)
      setLocation((previous) => ({ ...(previous || { lat: 18.5204, lng: 73.8567, accuracy: null, label: 'Awaiting live GPS · Pune demo fallback' }), escalation: true, notificationStatus: 'sending' }))
      addEvent(event)
      const payload = { source: 'AUTO_CRASH_DETECTION', severity: 'CRITICAL', status: 'REPORTED', language, autoEscalated: true, userResponse: 'NO_RESPONSE', description: 'Possible crash detected; no safety response received.' }
      try {
        const response = await fetch('/api/emergencies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const incident = await response.json()
        setEmergencyId(incident.id)
        const notification = await fetch('/api/notifications/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emergencyId: incident.id, channels: ['AMBULANCE_COORDINATION', 'POLICE_STATION', 'EMERGENCY_CONTACTS'], location }) })
        setLocation((previous) => ({ ...(previous || {}), escalation: true, notificationStatus: notification.ok ? 'prepared' : 'failed' }))
        if (notification.ok && 'Notification' in window) { const showNotification = () => new Notification('PranaSetu: message sent successfully', { body: 'Ambulance coordination, police station, and emergency contacts were notified.', tag: incident.id }); if (Notification.permission === 'granted') showNotification(); else if (Notification.permission === 'default') Notification.requestPermission().then((permission) => { if (permission === 'granted') showNotification() }) }
        addEvent(notification.ok ? 'Demo notifications prepared for ambulance and police coordination' : 'Notification service unavailable · retry required')
      } catch {
        addEvent('Coordination server unavailable · emergency retained locally')
      }
      setScreen('gps')
    }
  const beginEmergency = () => { escalationStarted.current = false; setAutoEscalated(false); setEmergencyId(null); if (navigator.vibrate) navigator.vibrate([180, 100, 180]); if (window.speechSynthesis) { window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(language === 'hi' ? 'आपातकाल शुरू हो गया है।' : language === 'mr' ? 'आपत्काल सुरू झाला आहे.' : 'Emergency activated. Tell us what happened.'); utterance.lang = selectedLanguage.locale; window.speechSynthesis.speak(utterance) }; addEvent('Emergency started · voice intake opened'); setScreen('voice') }
  const locate = (useDemo = false) => {
    if (useDemo) { setLocation({ lat: 18.5204, lng: 73.8567, label: 'Pune, Maharashtra · Demo location' }); addEvent('Demo location captured · Pune, Maharashtra'); setScreen('hospitals'); return }
    if (!navigator.geolocation) { setLocation({ lat: 18.5204, lng: 73.8567, label: 'Pune, Maharashtra · Demo location' }); addEvent('Demo location captured · Pune, Maharashtra'); setScreen('hospitals'); return }
    navigator.geolocation.getCurrentPosition((position) => { setLocation({ lat: position.coords.latitude, lng: position.coords.longitude, label: 'Current device location' }); addEvent('GPS location captured from device'); setScreen('hospitals') }, () => { setLocation({ lat: 18.5204, lng: 73.8567, label: 'Pune, Maharashtra · Demo fallback' }); addEvent('GPS unavailable · demo location used'); setScreen('hospitals') })
  }
  const submitAnswer = () => { if (!answer.trim()) return; setAnswer(''); if (questionIndex === 1) { addEvent('Follow-up answers recorded'); setScreen('gps') } else setQuestionIndex(1) }
  function startCrashTest() { window.pranaSetuEscalate = escalateEmergency; setCrashMode(true); setCountdown(15); addEvent('Safety Monitor test triggered · possible crash detected'); setScreen('crash-countdown') }
  const enableMotionMonitor = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      const permission = await DeviceMotionEvent.requestPermission()
      if (permission !== 'granted') return
    }
    setMotionEnabled(true)
  }
  const currentFlowIndex = useMemo(() => flow.findIndex((item) => item.toLowerCase().replaceAll(' ', '-') === screen), [screen])
  useEffect(() => {
    escalateRef.current = (event) => escalateEmergency(event)
    crashTestRef.current = () => startCrashTest()
  })

  if (showIntro) return <IntroPoster onSkip={() => setShowIntro(false)} />

  if (screen === 'landing') return <Landing language={language} setLanguage={setLanguage} copy={interfaceCopy[language] || interfaceCopy.en} onContinue={() => setScreen('login')} onConsole={() => setScreen('command-center')} />
  if (screen === 'login') return <Login onLogin={() => setScreen('home')} />
  if (screen === 'home') return <Home copy={interfaceCopy[language] || interfaceCopy.en} backendOnline={backendOnline} motionEnabled={motionEnabled} onEnableMotion={enableMotionMonitor} onEmergency={beginEmergency} onCrash={startCrashTest} />
  if (screen === 'command-center') return <OperationsCenter onExit={() => setScreen('landing')} />

  return <div className="app-shell incident-shell"><header className="incident-header"><Logo /><div className="flow-progress"><span>Active emergency</span><div><i style={{ width: `${Math.max(8, (currentFlowIndex / (flow.length - 1)) * 100)}%` }} /></div></div><button className="quiet-button" onClick={() => setScreen('home')}>Exit to home</button></header><main className="incident-main">{screen === 'voice' && <Voice language={selectedLanguage} isListening={isListening} onListen={() => setIsListening(true)} onDemo={() => { setTranscript(selectedLanguage.sample); setScreen('transcript') }} />}{screen === 'transcript' && <Transcript text={transcript} language={selectedLanguage} onContinue={() => { addEvent('Transcript understood · chest pain detected'); setScreen('analysis') }} />}{screen === 'analysis' && <Analysis language={selectedLanguage} onContinue={() => setScreen('follow-up')} />}{screen === 'follow-up' && <FollowUp index={questionIndex} answer={answer} setAnswer={setAnswer} onSubmit={submitAnswer} />}{screen === 'gps' && <Gps location={location} onLocate={locate} />}{screen === 'hospitals' && <HospitalSearch onContinue={() => setScreen('ranking')} />}{screen === 'ranking' && <Ranking onContinue={() => { addEvent('Ruby Hall Clinic recommended · 96% match'); setScreen('map') }} />}{screen === 'map' && <MapView location={location} onContinue={() => setScreen('navigation')} />}{screen === 'navigation' && <Navigation onContinue={() => { addEvent('Route started to Ruby Hall Clinic'); setScreen('tracking') }} />}{screen === 'tracking' && <Tracking onContinue={() => { addEvent('Responder accepted · Ruby Hall Clinic notified'); setScreen('timeline') }} />}{screen === 'timeline' && <Timeline events={timeline} onContinue={() => setScreen('command')} />}{screen === 'command' && <CommandCenter onContinue={() => setScreen('live-status')} />}{screen === 'live-status' && <LiveStatus onContinue={() => { addEvent('Patient stable · hospital handoff complete'); setScreen('resolved') }} />}{screen === 'resolved' && <Resolved onReset={() => { setTimeline([]); setQuestionIndex(0); setScreen('home') }} />}{screen === 'crash-countdown' && <CrashCountdown language={selectedLanguage} countdown={countdown} onCancel={() => { setCrashMode(false); addEvent('Crash alert dismissed by user'); setScreen('home') }} onSendHelp={() => { setCrashMode(false); addEvent('User selected Send Help · automatic emergency confirmed'); setScreen('gps') }} />}</main><div className="privacy-strip">{backendOnline ? '● Coordination service connected' : '○ Demo mode · coordination service offline'} <span>Private and encrypted</span></div></div>
}

function IntroPoster({ onSkip }) { return <div className="intro-poster"><div className="intro-grid" /><div className="intro-orbit intro-orbit-one" /><div className="intro-orbit intro-orbit-two" /><div className="intro-content"><div className="intro-logo"><svg viewBox="0 0 46 46" aria-hidden="true"><path d="M8 30c6.5 0 6.5-12 13-12s6.5 12 13 12" /><path className="intro-pulse" d="M18.5 18 22 11l3.5 7" /><circle cx="22" cy="10" r="2.4" /></svg></div><p className="intro-overline">AI EMERGENCY RESPONSE</p><h1>Prana<span>Setu</span></h1><p className="intro-tagline">Speak. Locate. Respond.</p><div className="intro-loader"><i /><i /><i /></div></div><button className="intro-skip" onClick={onSkip}>Skip intro</button><small className="intro-footer">A bridge to life · 24 / 7 coordination</small></div> }

function Landing({ language, setLanguage, copy, onContinue, onConsole }) { return <div className="landing"><div className="landing-nav"><Logo /><nav className="landing-links"><a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#safety">Safety</a><button onClick={onConsole}>Open Emergency Console</button></nav><span className="language-caption">Choose language</span><select aria-label="Choose language" value={language} onChange={(event) => setLanguage(event.target.value)}>{languages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div><div className="landing-hero"><div className="hero-copy"><p className="eyebrow coral-text">SPEAK · LOCATE · RESPOND</p><h1>{copy.hero}</h1><p className="hero-sub">PranaSetu understands your emergency, identifies your location, finds suitable nearby medical facilities, and coordinates the next response in your language.</p><button className="primary-button" onClick={onContinue}>{copy.start} <span>→</span></button><p className="trust-line"><span>✦</span> Built for calm decisions under pressure</p></div><div className="hero-visual"><div className="pulse-orbit orbit-one" /><div className="pulse-orbit orbit-two" /><div className="hero-pin"><svg viewBox="0 0 46 46" aria-hidden="true"><path d="M8 30c6.5 0 6.5-12 13-12s6.5 12 13 12" /><path className="logo-pulse" d="M18.5 18 22 11l3.5 7" /><circle cx="22" cy="10" r="2.4" /></svg></div><span className="hero-label label-you">You are here</span><span className="hero-label label-help">Help is on the way</span><div className="hero-status-card"><span className="status-pulse" /><small>PRANASETU AI · SYSTEM READY</small><strong>Emergency response<br />coordinated</strong><b>3 hospitals nearby</b></div></div></div><div className="landing-footer"><span>24 / 7 emergency coordination</span><span>English · हिन्दी · मराठी</span><span>© 2026 PranaSetu</span></div></div> }
function Login({ onLogin }) { return <div className="login-page"><div className="login-panel"><Logo /><p className="eyebrow">YOUR CARE CIRCLE</p><h1>Welcome back.</h1><p>Sign in to stay connected to the people who matter.</p><label>Mobile number<input placeholder="+91 00000 00000" /></label><button className="primary-button full" onClick={onLogin}>Continue securely <span>→</span></button><button className="demo-link" onClick={onLogin}>Use demo access</button><small className="secure-note">⌾ Your information stays private and encrypted.</small></div></div> }
function ScreenFrame({ eyebrow, title, description, children, action, actionLabel = 'Continue' }) { return <div className="screen-frame"><div className="screen-heading"><p className="eyebrow coral-text">{eyebrow}</p><h1>{translateEmergency(title)}</h1><p>{translateEmergency(description)}</p></div>{children}<button className="primary-button" onClick={action}>{translateEmergency(actionLabel)} <span>→</span></button></div> }
function Voice({ language, isListening, onListen, onDemo }) { const voiceDescription = language.id === 'hi' ? 'हिंदी में सहज बोलें। हम महत्वपूर्ण जानकारी सुनेंगे।' : language.id === 'mr' ? 'मराठीत सहज बोला. आम्ही महत्त्वाची माहिती ऐकू.' : `Speak naturally in ${language.label}. We will listen for the details that matter.`; const listenLabel = language.id === 'hi' ? 'सुनना शुरू करें' : language.id === 'mr' ? 'ऐकणे सुरू करा' : 'Start speaking'; const demoLabel = language.id === 'hi' ? 'डेमो आवाज़ उपयोग करें' : language.id === 'mr' ? 'डेमो आवाज वापरा' : 'Use demo voice transcript'; return <ScreenFrame eyebrow="VOICE INTAKE" title="Tell us what happened." description={voiceDescription} action={onListen} actionLabel={isListening ? 'Listening…' : listenLabel}><div className={isListening ? 'voice-orb listening' : 'voice-orb'}><span className="voice-wave">〰</span><small>{isListening ? 'Listening for your emergency' : 'Your voice is your fastest route to help'}</small></div><button className="secondary-button" onClick={onDemo}>{demoLabel} <span>⌁</span></button></ScreenFrame> }
function Transcript({ text, language, onContinue }) { return <ScreenFrame eyebrow="TRANSCRIPT" title="We heard you." description="Check the words below before we assess the situation." action={onContinue} actionLabel="Analyze emergency"><div className="transcript-box"><span className="quote-mark">“</span><p>{text}</p><span className="transcript-meta">Detected language · {language.label} <b>✓</b></span></div></ScreenFrame> }
const aiResponses = { hi: { title: 'यह तत्काल सहायता की स्थिति है।', summary: 'यह स्थिति तुरंत पेशेवर चिकित्सा सहायता की मांग कर सकती है।', play: 'एक नजदीकी आपातकालीन सुविधा की पहचान की गई है। कृपया सुझाए गए मार्ग का पालन करें।' }, mr: { title: 'यासाठी तातडीची मदत आवश्यक आहे.', summary: 'या परिस्थितीत त्वरित व्यावसायिक वैद्यकीय मदतीची गरज असू शकते.', play: 'जवळची आपत्कालीन सुविधा शोधण्यात आली आहे. कृपया सुचवलेल्या मार्गाचा वापर करा.' }, en: { title: 'This needs urgent care.', summary: 'This situation may require immediate professional medical assistance.', play: 'A nearby emergency facility has been identified. Please follow the recommended route.' } }
function Analysis({ language, onContinue }) { const response = aiResponses[language.id] || { title: language.id === 'en' ? aiResponses.en.title : `AI emergency assessment · ${language.label}`, summary: language.sample, play: language.sample }; const speak = () => { if (!window.speechSynthesis) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtance(response.play); utterance.lang = language.locale; window.speechSynthesis.speak(utterance) }; return <ScreenFrame eyebrow="AI ANALYSIS" title={response.title} description="AI assessment only · professional assistance recommended." action={onContinue} actionLabel="Answer two quick questions"><div className="analysis-card"><div className="classification"><span className="severity-icon">!</span><div><strong>Possible medical emergency</strong><small>Confidence 94% · urgent</small></div><b>HIGH</b></div><div className="analysis-summary"><small>AI SUMMARY · {language.label}</small><p>{response.summary}</p><button className="secondary-button" onClick={speak}>🔊 Play response <span>↗</span></button></div><div className="analysis-tags"><span>Chest pain</span><span>Immediate response</span><span>{language.label}</span></div></div></ScreenFrame> }
function FollowUp({ index, answer, setAnswer, onSubmit }) { const questions = ['Is the person conscious and breathing normally?', 'Is the chest pain spreading to the arm, jaw, or back?']; return <ScreenFrame eyebrow={`FOLLOW-UP ${index + 1} OF 2`} title={questions[index]} description="Your answer helps responders prepare before they arrive." action={onSubmit} actionLabel={index === 1 ? 'Capture location' : 'Next question'}><div className="answer-grid"><button className={answer === 'Yes' ? 'answer selected' : 'answer'} onClick={() => setAnswer('Yes')}>Yes</button><button className={answer === 'No' ? 'answer selected' : 'answer'} onClick={() => setAnswer('No')}>No</button><button className={answer === 'Not sure' ? 'answer selected' : 'answer'} onClick={() => setAnswer('Not sure')}>Not sure</button></div></ScreenFrame> }
function Gps({ location, onLocate }) { return <ScreenFrame eyebrow={location?.escalation ? 'AUTOMATIC EMERGENCY · LIVE LOCATION' : 'LOCATE'} title={location?.escalation ? 'Help has been notified.' : 'Where are you right now?'} description={location?.escalation ? 'Ambulance and police coordination have your emergency. Your location will keep updating while help responds.' : 'Location lets PranaSetu find the nearest capable help.'} action={() => onLocate(false)} actionLabel={location?.escalation ? 'Continue to hospitals' : location ? 'Use this location' : 'Capture my location'}><div className={location?.escalation ? 'location-card escalation-card' : 'location-card'}><span className="location-crosshair">⌖</span><div><strong>{location?.escalation ? 'Live location sharing active' : location?.label || 'Device location is ready'}</strong><small>{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}${location.accuracy ? ` · ±${Math.round(location.accuracy)} m` : ''}` : 'Your browser will ask for permission.'}</small></div></div>{location?.escalation && <div className="notification-card"><strong>Emergency notification</strong><span>🚑 Ambulance coordination · {location.notificationStatus === 'prepared' ? 'Demo notification prepared' : 'Preparing'}</span><span>🚓 Police station · {location.notificationStatus === 'prepared' ? 'Demo notification prepared' : 'Preparing'}</span><small>Live GPS updates are being shared with the coordination center.</small></div>}<button className="secondary-button" onClick={() => onLocate(true)}>Use demo Pune location <span>⌖</span></button></ScreenFrame> }
function HospitalSearch({ onContinue }) { return <ScreenFrame eyebrow="ASSESS · RECOMMEND" title="Finding capable hospitals." description="We are checking distance, cardiac care, open beds, and emergency readiness." action={onContinue} actionLabel="See recommendations"><div className="search-status"><span className="search-spinner" /><div><strong>Searching near your location</strong><small>3 facilities found · route data ready</small></div></div></ScreenFrame> }
function Ranking({ onContinue }) { return <ScreenFrame eyebrow="HOSPITAL RANKING" title="Ruby Hall is the best match." description="The recommendation balances urgency, capability, and travel time." action={onContinue} actionLabel="View live route"><div className="hospital-list">{hospitals.map((hospital, index) => <div className={index === 0 ? 'hospital-row recommended' : 'hospital-row'} key={hospital.name}><span className="rank">0{index + 1}</span><div><strong>{hospital.name} {index === 0 && <b>Recommended</b>}</strong><small>{hospital.reason}</small></div><span className="hospital-stats">{hospital.distance}<b>{hospital.eta}</b></span></div>)}</div></ScreenFrame> }
function MapView({ location, onContinue }) { return <ScreenFrame eyebrow="LIVE MAP" title="Nearby help is visible." description="OpenStreetMap data with live nearby hospitals, police stations, and fire services." action={onContinue} actionLabel="Start navigation"><div className="map-with-traffic"><RealMap location={location} /><TrafficOverlay /><div className="destination-route" /><span className="destination-pin">RH</span></div><div className="route-legend live-map-legend"><strong>Ruby Hall Clinic · destination</strong><small>2.4 km · 8 min ETA · route ready</small><small>{location?.label || 'Pune, Maharashtra'}</small></div><MapAssistant /></ScreenFrame> }

function MapAssistant() { const language = window.localStorage.getItem('pranasetu-language') || 'en'; const selected = languages.find((item) => item.id === language) || languages[4]; const message = language === 'hi' ? 'रूबी हॉल क्लिनिक आपका अस्पताल गंतव्य है। अनुमानित समय आठ मिनट है।' : language === 'mr' ? 'रुबी हॉल क्लिनिक हे तुमचे रुग्णालय गंतव्य आहे. अंदाजे वेळ आठ मिनिटे आहे.' : `${selected.label}: Ruby Hall Clinic is your hospital destination. Estimated arrival is eight minutes.`; const speak = () => { if (!window.speechSynthesis) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(message); utterance.lang = selected.locale; window.speechSynthesis.speak(utterance) }; return <button className="map-assistant" onClick={speak}>🎙 <span>AI route assistant</span><small>Speak destination and ETA</small></button> }

function TrafficOverlay() { return <div className="traffic-overlay" aria-label="Traffic conditions"><span className="traffic-road traffic-road-one" /><span className="traffic-road traffic-road-two" /><div className="traffic-key"><span><i className="traffic-high" /> High traffic</span><span><i className="traffic-medium" /> Slower</span><small>Demo traffic layer · connect a verified traffic provider for live congestion</small></div></div> }

function RealMap({ location }) { const mapRef = useRef(null); const [places, setPlaces] = useState([]); const defaultLocation = { lat: 18.5204, lng: 73.8567 }; const center = location || defaultLocation; useEffect(() => { if (!mapRef.current) return undefined; const map = L.map(mapRef.current).setView([center.lat, center.lng], 14); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map); const userIcon = L.divIcon({ className: 'live-user-marker', html: '<span>YOU</span>' }); L.marker([center.lat, center.lng], { icon: userIcon }).addTo(map).bindPopup('Your current location'); const query = `[out:json];(nwr[amenity~"hospital|police|fire_station"](around:5000,${center.lat},${center.lng}););out center 25;`; fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`).then((response) => response.json()).then((data) => { const nearby = data.elements.map((place) => { const lat = place.lat || place.center?.lat; const lng = place.lon || place.center?.lon; const kind = place.tags?.amenity; return { lat, lng, name: place.tags?.name || (kind === 'hospital' ? 'Nearby hospital' : kind === 'police' ? 'Police station' : 'Fire station'), kind } }).filter((place) => place.lat && place.lng); setPlaces(nearby); nearby.forEach((place) => { const color = place.kind === 'hospital' ? '#ff5a5f' : place.kind === 'police' ? '#f0aa52' : '#57c6c0'; const icon = L.divIcon({ className: 'place-marker', html: `<span style="background:${color}">${place.kind === 'hospital' ? 'H' : place.kind === 'police' ? 'P' : 'F'}</span>` }); L.marker([place.lat, place.lng], { icon }).addTo(map).bindPopup(`<strong>${place.name}</strong><br>${place.kind.replace('_', ' ')} · OpenStreetMap`); }); }).catch(() => setPlaces([])); return () => map.remove() }, [center.lat, center.lng]); return <div className="real-map"><div ref={mapRef} className="leaflet-map" /><div className="map-data-badge">● LIVE OSM DATA · {places.length || 'nearby'} places</div></div> }
function Navigation({ onContinue }) { return <ScreenFrame eyebrow="NAVIGATION" title="Go with confidence." description="Follow the route to Ruby Hall Clinic. PranaSetu is staying with you." action={onContinue} actionLabel="I’m on my way"><div className="navigation-card"><strong>Turn left onto Sassoon Road</strong><span>500 m</span><small>Destination on the right · 7 min remaining</small></div></ScreenFrame> }
function Tracking({ onContinue }) { return <ScreenFrame eyebrow="EMERGENCY TRACKING" title="Your response team is moving." description="Live status is shared with your care circle and the command center." action={onContinue} actionLabel="View emergency timeline"><div className="tracking-card"><div className="tracking-line"><i /><i /><i /><i /></div><div className="tracking-steps"><span><b>Responder assigned</b><small>Now · Ananya K.</small></span><span><b>Hospital notified</b><small>Now · Ruby Hall</small></span><span><b>Arrival</b><small>6 min away</small></span></div></div></ScreenFrame> }
function Timeline({ events, onContinue }) { return <ScreenFrame eyebrow="EMERGENCY TIMELINE" title="Every step is accounted for." description="A shared record keeps care coordinated." action={onContinue} actionLabel="Open command center"><div className="timeline">{[...events, 'Emergency coordination active'].map((event, index) => <div className="timeline-row" key={`${event}-${index}`}><i /><div><strong>{event}</strong><small>{index === events.length ? 'Live now' : `${index + 1} min ago`}</small></div></div>)}</div></ScreenFrame> }
function CommandCenter({ onContinue }) { return <ScreenFrame eyebrow="COMMAND CENTER" title="The whole response, together." description="Care circle, responder, and hospital teams now share one incident view." action={onContinue} actionLabel="Watch live status"><div className="command-grid"><div><span className="command-number">01</span><strong>Incident PS-260819</strong><small>High priority · active</small></div><div><span className="command-number">03</span><strong>Teams connected</strong><small>Family · responder · hospital</small></div></div></ScreenFrame> }
function LiveStatus({ onContinue }) { return <ScreenFrame eyebrow="LIVE STATUS UPDATES" title="The handoff is happening." description="Ruby Hall has confirmed arrival. Keep breathing slowly while the team takes over." action={onContinue} actionLabel="Mark as resolved"><div className="live-update"><span>●</span><div><strong>Hospital team ready</strong><small>Cardiac bay prepared · responder 2 min away</small></div><time>Just now</time></div><div className="live-update"><span>✓</span><div><strong>Care circle notified</strong><small>Riya and Nikhil can see the live status</small></div><time>1 min</time></div></ScreenFrame> }
function Resolved({ onReset }) { return <div className="resolved"><span className="resolved-check">✓</span><p className="eyebrow">RESOLUTION</p><h1>You are not alone.</h1><p>The incident is closed and the full timeline has been saved to your care circle.</p><button className="primary-button" onClick={onReset}>Return to home <span>→</span></button></div> }
function CrashCountdown({ language, countdown, onCancel, onSendHelp }) { const safetyQuestion = language.id === 'hi' ? 'क्या आप सुरक्षित हैं?' : language.id === 'mr' ? 'तुम्ही सुरक्षित आहात का?' : 'Are you safe?'; useEffect(() => { if (navigator.vibrate) navigator.vibrate([300, 150, 300]); if (!window.speechSynthesis) return undefined; const utterance = new SpeechSynthesisUtterance(safetyQuestion); utterance.lang = language.locale; window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance); return () => { window.speechSynthesis.cancel(); if (navigator.vibrate) navigator.vibrate(0) } }, [language, safetyQuestion]); useEffect(() => { const AudioContext = window.AudioContext || window.webkitAudioContext; if (!AudioContext) return undefined; const context = new AudioContext(); const beep = () => { const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = 760; gain.gain.value = 0.045; oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.18) }; beep(); const alarm = window.setInterval(beep, 1000); return () => { window.clearInterval(alarm); context.close() } }, []); return <div className="crash-screen"><p className="eyebrow coral-text">PROTOTYPE CRASH DETECTION · AI SAFETY CHECK</p><div className="crash-alert"><span className="crash-number">{countdown}</span><div><h1>Possible crash detected.</h1><p className="crash-question">{safetyQuestion}</p><p>Emergency help will be contacted automatically when the timer ends.</p></div></div><div className="crash-actions"><button className="primary-button" onClick={onSendHelp}>Send Help <span>→</span></button><button className="secondary-button" onClick={onCancel}>I’m Safe <span>✓</span></button></div><small>Alarm active · prototype crash detection is not a certified vehicle safety system.</small></div> }
function Home({ copy, backendOnline, motionEnabled, onEnableMotion, onEmergency, onCrash }) { return <div className="app-shell home-shell"><header className="home-header"><Logo /><span className="service-status"><i /> {backendOnline ? 'Response network connected' : 'Demo response network'}</span><button className="quiet-button">Aarav Sharma</button></header><main className="home-main"><div className="home-intro"><p className="eyebrow">WEDNESDAY, 19 AUGUST 2026</p><h1>{copy.greeting}</h1><p>The people you care about are close, connected, and okay.</p></div><button className="emergency-button" onClick={onEmergency}><span>+</span><strong>{copy.emergency}</strong><small>{copy.speak}</small></button><div className="home-grid"><div className="home-card mint-surface"><p className="eyebrow">CARE CIRCLE</p><h2>All clear <b>✓</b></h2><p>12 people connected and checking in.</p><div className="circle-people"><span>RK</span><span>NP</span><span>MS</span><span>+9</span></div></div><div className="home-card"><p className="eyebrow">SAFETY MONITOR</p><h2>{motionEnabled ? 'Monitoring active' : 'Crash detection'}</h2><p>{motionEnabled ? 'Shake detection is on. We will ask if you are safe.' : 'Enable motion monitoring to detect a possible crash.'}</p><button className="secondary-button" onClick={onEnableMotion}>{motionEnabled ? 'Motion monitoring on' : 'Enable motion monitoring'} <span>⌁</span></button><button className="secondary-button test-crash-button" onClick={onCrash}>Test crash detection <span>↗</span></button></div></div><div className="loop-strip"><span>Speak</span><b>→</b><span>Understand</span><b>→</b><span>Locate</span><b>→</b><span>Respond</span></div></main></div> }

function OperationsCenter({ onExit }) { return <div className="operations-center"><aside className="ops-sidebar"><Logo /><p className="ops-kicker">PranaSetu Command Center</p><nav><button className="ops-active">▦ Dashboard</button><button>◉ Live emergencies <b>7</b></button><button>⌖ Map</button><button>＋ Hospitals</button><button>◒ Analytics</button><button>◷ History</button></nav><button className="ops-exit" onClick={onExit}>← Citizen view</button></aside><main className="ops-main"><header className="ops-header"><div><p className="eyebrow">OPERATIONS / OVERVIEW</p><h1>Response command center</h1></div><span className="ops-status"><i /> System operational</span></header><section className="ops-kpis"><div><small>ACTIVE EMERGENCIES</small><strong>07</strong><b className="critical">02 critical</b></div><div><small>HIGH PRIORITY</small><strong>03</strong><b className="warning">Responding</b></div><div><small>HOSPITAL NETWORK</small><strong>24</strong><b className="safe">Connected</b></div><div><small>AVG RESPONSE</small><strong>8.4<span> min</span></strong><b className="safe">↓ 18% this week</b></div></section><section className="ops-grid"><div className="ops-map-panel"><div className="ops-panel-header"><div><h2>Live emergency map</h2><p>Signals updating in real time · DEMO DATA</p></div><span className="map-legend"><i className="critical-dot" /> Critical <i className="warning-dot" /> High <i className="safe-dot" /> Resolved</span></div><div className="ops-map"><div className="ops-road ops-road-one" /><div className="ops-road ops-road-two" /><div className="ops-road ops-road-three" /><span className="ops-marker marker-critical">1024</span><span className="ops-marker marker-high">1025</span><span className="ops-marker marker-safe">1018</span><div className="ops-map-label">Ballarpur district</div></div></div><div className="incident-feed"><div className="ops-panel-header"><div><h2>Live emergencies</h2><p>Incoming coordination events</p></div><span className="feed-live">● Live</span></div><div className="incident-row selected"><strong>#1024</strong><div><b>Road accident</b><small>Auto detection · Ballarpur</small></div><span className="severity-badge critical-badge">Critical</span></div><div className="incident-row"><strong>#1025</strong><div><b>Medical</b><small>Voice · Chandrapur</small></div><span className="severity-badge high-badge">High</span></div><div className="incident-row"><strong>#1018</strong><div><b>Medical</b><small>Voice · Nagpur</small></div><span className="severity-badge safe-badge">Resolved</span></div></div></section><section className="incident-table"><div className="ops-panel-header"><div><h2>Incident queue</h2><p>Every source, status, and handoff in one view</p></div><button className="table-action">View history →</button></div><div className="table-head"><span>ID</span><span>TYPE / SOURCE</span><span>PRIORITY</span><span>LOCATION</span><span>STATUS</span><span>TIME</span></div><div className="table-row"><strong>#1024</strong><span>Accident <small>Auto detection</small></span><b className="severity-badge critical-badge">Critical</b><span>Ballarpur</span><b className="responding">Responding</b><span>14:32</span></div><div className="table-row"><strong>#1025</strong><span>Medical <small>Voice</small></span><b className="severity-badge high-badge">High</b><span>Chandrapur</span><b className="found">Hospital found</b><span>14:35</span></div></section></main></div> }

export default App
