import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

const languages = [
  { id: 'en', label: 'English', locale: 'en-US' },
  { id: 'hi', label: 'हिन्दी', locale: 'hi-IN' },
  { id: 'te', label: 'తెలుగు', locale: 'te-IN' },
  { id: 'ta', label: 'தமிழ்', locale: 'ta-IN' },
  { id: 'kn', label: 'ಕನ್ನಡ', locale: 'kn-IN' },
  { id: 'ml', label: 'മലയാളം', locale: 'ml-IN' },
  { id: 'mr', label: 'मराठी', locale: 'mr-IN' },
  { id: 'bn', label: 'বাংলা', locale: 'bn-BD' },
  { id: 'gu', label: 'ગુજરાતી', locale: 'gu-IN' },
  { id: 'pa', label: 'ਪੰਜਾਬੀ', locale: 'pa-IN' },
  { id: 'or', label: 'ଓଡ଼ିଆ', locale: 'or-IN' },
  { id: 'ur', label: 'اردو', locale: 'ur-PK' },
]

const defaultFacilities = [
  { name: 'City Emergency Hospital', address: 'Market Road, Pune', distance: 2.4, eta: 8, phone: '+91 20 2555 0012', lat: 18.5204, lng: 73.8567, type: 'Hospital' },
  { name: 'Trauma Care Centre', address: 'Shivaji Nagar, Pune', distance: 3.1, eta: 11, phone: '+91 20 2667 1020', lat: 18.5324, lng: 73.8463, type: 'Trauma' },
  { name: 'Critical Care Clinic', address: 'Kalyani Nagar, Pune', distance: 4.8, eta: 16, phone: '+91 20 2408 1802', lat: 18.5514, lng: 73.9035, type: 'Clinic' },
]

const uiText = {
  en: {
    brand: 'PranaSetu',
    title: 'How can I help you?',
    online: 'PRANASETU AI ONLINE',
    talk: '🎙️ TALK TO PRANASETU',
    idle: 'Tap microphone to speak',
    listening: 'Listening...',
    processing: 'Understanding your emergency...',
    responding: 'PranaSetu is responding...',
    speaking: 'Speaking...',
    input: 'Describe your emergency...',
    send: 'Send',
    voice: 'Voice',
    replay: 'Replay',
    mute: 'Mute',
    unmute: 'Unmute',
    stop: 'Stop listening',
    clear: 'Clear',
    shareLocation: '📍 SHARE MY LOCATION',
    locationDenied: 'Location access was denied. Enter your location manually.',
    locationManual: 'Enter your location manually',
    emergencyAnalysis: 'EMERGENCY ANALYSIS',
    emergency: 'Emergency',
    urgency: 'Urgency',
    language: 'Language',
    incident: 'Incident',
    action: 'Recommended Action',
    nearby: 'Nearby Emergency Facilities',
    bestMatch: 'BEST MATCH',
    directions: 'Get Directions',
    call: 'Call',
    demo: 'DEMO MODE',
    critical: 'CRITICAL EMERGENCY DETECTED',
    services: 'Available services',
    facility: 'Best Emergency Facility',
    voiceUnavailable: 'Voice playback is unavailable for this language on your browser.',
    notAvailable: 'No location available yet.',
    speakFallback: 'Speech recognition is not supported on this browser. Please type your emergency.',
    emergencyButton: '🚨 EMERGENCY',
    findHospital: '🏥 FIND HOSPITAL',
    shareBtn: '📍 SHARE LOCATION',
  },
  hi: {
    brand: 'प्राणसेतु',
    title: 'मैं आपकी कैसे मदद कर सकता हूँ?',
    online: 'प्राणसेतु एआई ऑनलाइन',
    talk: '🎙️ प्राणसेतु से बात करें',
    idle: 'माइक पर टैप करके बोलें',
    listening: 'सुन रहा हूँ...',
    processing: 'आपातकाल समझा जा रहा है...',
    responding: 'प्राणसेतु जवाब दे रहा है...',
    speaking: 'बोल रहा है...',
    input: 'अपना आपातकाल लिखें...',
    send: 'भेजें',
    voice: 'आवाज़',
    replay: 'फिर से सुनें',
    mute: 'म्यूट',
    unmute: 'अनम्यूट',
    stop: 'सुनना बंद करें',
    clear: 'साफ करें',
    shareLocation: '📍 मेरा स्थान साझा करें',
    locationDenied: 'स्थान की अनुमति नहीं मिली। कृपया अपना स्थान मैन्युअल रूप से लिखें।',
    locationManual: 'स्थान मैन्युअल रूप से लिखें',
    emergencyAnalysis: 'आपातकाल विश्लेषण',
    emergency: 'आपातकाल',
    urgency: 'तात्कालिकता',
    language: 'भाषा',
    incident: 'घटना',
    action: 'सुझावित कार्रवाई',
    nearby: 'निकट आपातकालीन सुविधाएँ',
    bestMatch: 'सर्वोत्तम मिलान',
    directions: 'दिशाएँ देखें',
    call: 'कॉल',
    demo: 'डेमो मोड',
    critical: 'गंभीर आपातकाल का पता चला',
    services: 'उपलब्ध सेवाएँ',
    facility: 'सर्वश्रेष्ठ आपातकालीन सुविधा',
    voiceUnavailable: 'इस भाषा के लिए आवाज़ प्लेबैक आपके ब्राउज़र में उपलब्ध नहीं है।',
    notAvailable: 'अभी कोई स्थान उपलब्ध नहीं है।',
    speakFallback: 'यह ब्राउज़र ध्वनि पहचान का समर्थन नहीं करता है। कृपया अपना आपातकाल टाइप करें।',
    emergencyButton: '🚨 आपातकाल',
    findHospital: '🏥 अस्पताल खोजें',
    shareBtn: '📍 स्थान साझा करें',
  },
  te: {
    brand: 'ప్రాణసేతు',
    title: 'నేను మీకు ఎలా సహాయం చేయగలను?',
    online: 'ప్రాణసేతు AI ఆన్లైన్',
    talk: '🎙️ ప్రాణసేతుతో మాట్లాడండి',
    idle: 'మైక్రోఫోన్పై నొక్కి మాట్లాడండి',
    listening: 'వినుగోంటున్నాం...',
    processing: 'అత్యవసర పరిస్థితిని అర్థం చేసుకుంటున్నాం...',
    responding: 'ప్రాణసేతు ప్రతిస్పందిస్తోంది...',
    speaking: 'మాట్లాడుతోంది...',
    input: 'మీ అత్యవసరాన్ని వివరించండి...',
    send: 'పంపించు',
    voice: 'వాయిస్',
    replay: 'మళ్లీ వినిపించు',
    mute: 'మ్యూట్',
    unmute: 'అన్‌మ్యూట్',
    stop: 'వినే దాన్ని ఆపండి',
    clear: 'స్పష్టంచేయి',
    shareLocation: '📍 నా స్థానం పంపు',
    locationDenied: 'స్థాన అనుమతి నిరాకరించబడింది. దయచేసి మాన్యువల్గా నమోదు చేయండి.',
    locationManual: 'స్థానాన్ని మాన్యువల్‌గా నమోదు చేయండి',
    emergencyAnalysis: 'అత్యవసర విశ్లేషణ',
    emergency: 'అత్యవసరం',
    urgency: 'తడబాటు',
    language: 'భాష',
    incident: 'సంఘటన',
    action: 'సిఫార్సు చేయబడిన చర్య',
    nearby: 'సమీప అత్యవసర سہాయాలు',
    bestMatch: 'ఉత్తమ ఎంపిక',
    directions: 'దిశలు చూడండి',
    call: 'కాల్',
    demo: 'డెమో మోడ్',
    critical: 'గుర్తించిన క్రమంగా అత్యవసర పరిస్థితి',
    services: 'లభ్యమయ్యే సేవలు',
    facility: 'ఉత్తమ అత్యవసర సౌకర్యం',
    voiceUnavailable: 'ఈ భాష కోసం వాయిస్ ప్లేబ్యాక్ మీ బ్రౌజర్‌లో అందుబాటులో లేదు.',
    notAvailable: 'ఇప్పటికీ స్థానం అందుబాటులో లేదు.',
    speakFallback: 'ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు లేదు. దయచేసి మీ అత్యవసరాన్ని టైప్ చేయండి.',
    emergencyButton: '🚨 అత్యవసరం',
    findHospital: '🏥 ఆసుపత్రి కనుగొనండి',
    shareBtn: '📍 స్థానం షేర్ చేయండి',
  },
  ta: {
    brand: 'பிரணசேது',
    title: 'நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    online: 'பிரணசேது AI ஆன்லைன்',
    talk: '🎙️ பிரணசேதுவுடன் பேசுங்கள்',
    idle: 'மைக் மீது தட்டி பேசுங்கள்',
    listening: 'கேட்கிறேன்...',
    processing: 'அவசர நிலையை புரிந்துகொள்கிறோம்...',
    responding: 'பிரணசேது பதில் தருகிறது...',
    speaking: 'பேசுகிறது...',
    input: 'உங்கள் அவசரத்தை விவரிக்கவும்...',
    send: 'அனுப்பு',
    voice: 'குரல்',
    replay: 'மீண்டும் கேளுங்கள்',
    mute: 'மியூட்',
    unmute: 'அன்மியூட்',
    stop: 'கேட்பதை நிறுத்து',
    clear: 'சுத்தம்',
    shareLocation: '📍 என் இருப்பிடத்தை பகிர்',
    locationDenied: 'இருப்பிட அனுமதி மறுக்கப்பட்டது. கைமுறையாக உள்ளிடவும்.',
    locationManual: 'இருப்பிடத்தை கைமுறையாக உள்ளிடவும்',
    emergencyAnalysis: 'அவசர பகுப்பாய்வு',
    emergency: 'அவசரம்',
    urgency: 'அவசரம்',
    language: 'மொழி',
    incident: 'நிகழ்வு',
    action: 'பரிந்துரைக்கப்பட்ட நடவடிக்கை',
    nearby: 'அருகிலுள்ள அவசர வசதிகள்',
    bestMatch: 'சிறந்த தேர்வு',
    directions: 'வழியைப் பார்க்க',
    call: 'அழை',
    demo: 'டெமோ பயன்முறை',
    critical: 'மிக அவசர நிலை கண்டறியப்பட்டது',
    services: 'கிடைக்கும் சேவைகள்',
    facility: 'சிறந்த அவசர வசதி',
    voiceUnavailable: 'இந்த மொழிக்கு குரல் ப்ளேபேக் உங்கள் பிரவுசரில் கிடைக்கவில்லை.',
    notAvailable: 'இன்னும் இருப்பிடம் கிடைக்கவில்லை.',
    speakFallback: 'இந்த பிரவுசரில் ஸ்பீச் ரெக்னிஷன் இல்லை. அவசரத்தை டைப் செய்யுங்கள்.',
    emergencyButton: '🚨 அவசரம்',
    findHospital: '🏥 மருத்துவமனை கண்டறியுங்கள்',
    shareBtn: '📍 இருப்பிடத்தை பகிர்',
  },
  kn: {
    brand: 'ಪ್ರಾಣಸೇತು',
    title: 'ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    online: 'ಪ್ರಾಣಸೇತು AI ಆನ್ಲೈನ್',
    talk: '🎙️ ಪ್ರಾಣಸೇತಿನಿಂದ ಮಾತನಾಡಿ',
    idle: 'ಮೈಕ್ರೋಫೋನ್ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ ಮಾತನಾಡಿ',
    listening: 'ಆಲಿಸುತ್ತಿದ್ದೇನೆ...',
    processing: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ...',
    responding: 'ಪ್ರಾಣಸೇತು ಉತ್ತರಿಸುತ್ತಿದೆ...',
    speaking: 'ಮಾತನಾಡುತ್ತಿದೆ...',
    input: 'ನಿಮ್ಮ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ವಿವರಿಸಿ...',
    send: 'ಕಳುಹಿಸಿ',
    voice: 'ಧ್ವನಿ',
    replay: 'ಮತ್ತೆ ಆಡಿಸಿ',
    mute: 'ಮ್ಯೂಟ್',
    unmute: 'ಅನ್‌ಮ್ಯೂಟ್',
    stop: 'ಆಲಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ',
    clear: 'ಸ್ಪಷ್ಟ',
    shareLocation: '📍 ನನ್ನ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ',
    locationDenied: 'ಸ್ಥಳ ನೀಡುವ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಕೈಯಾರೆ ನಮೂದಿಸಿ.',
    locationManual: 'ಸ್ಥಳವನ್ನು ಕೈಯಾರೆ ನಮೂದಿಸಿ',
    emergencyAnalysis: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ ವಿಶ್ಲೇಷಣೆ',
    emergency: 'ತುರ್ತು',
    urgency: 'ತುರ್ತು ಮಟ್ಟ',
    language: 'ಭಾಷೆ',
    incident: 'ಸಂಭವನೆ',
    action: 'ಶಿಫಾರಸು ಮಾಡಿದ ಕಾರ್ಯ',
    nearby: 'ಒಳಗಿನ ತುರ್ತು ಸೇವೆಗಳು',
    bestMatch: 'ಉತ್ತಮ ಆಯ್ಕೆ',
    directions: 'ಮಾರ್ಗವನ್ನು ನೋಡಿ',
    call: 'ಕಾಲ್',
    demo: 'ಡೆಮೋ ಮೋಡ್',
    critical: 'ತೀವ್ರ ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಪತ್ತೆಯಾಗಿದೆ',
    services: 'ಲಭ್ಯವಿರುವ ಸೇವೆಗಳು',
    facility: 'ಉತ್ತಮ ತುರ್ತು ಸೌಲಭ್ಯ',
    voiceUnavailable: 'ಈ ಭಾಷೆಗೆ ಧ್ವನಿ ಪ್ಲೇಬ್ಯಾಕ್ ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ.',
    notAvailable: 'ಇನ್ನೂ ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ.',
    speakFallback: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಪೀಚ್ ರಿಕಗ್ನಿಷನ್ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ಟೈಪ್ ಮಾಡಿ.',
    emergencyButton: '🚨 ತುರ್ತು',
    findHospital: '🏥 ಆಸ್ಪತ್ರೆ ಹುಡುಕಿ',
    shareBtn: '📍 ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಿ',
  },
  ml: {
    brand: 'പ്രാണസേതു',
    title: 'എനിക്ക് നിങ്ങളുടെ 어떻게 സഹായിക്കാനാകും?',
    online: 'പ്രാണസേതു AI ഓൺലൈനാണ്',
    talk: '🎙️ പ്രാണസേതുവിനോട് സംസാരിക്കുക',
    idle: 'മൈക്രോയ്ക്ക് സ്പർശിച്ച് സംസാരിക്കുക',
    listening: 'കേട്ടുകൊണ്ടിരിക്കുന്നു...',
    processing: 'അടിയന്തരാവസ്ഥ മനസ്സിലാക്കുന്നു...',
    responding: 'പ്രാണസേതു പ്രതികരിക്കുന്നു...',
    speaking: 'സംസാരം നടത്തുന്നു...',
    input: 'നിങ്ങളുടെ അടിയന്തരാവസ്ഥ വിവരിക്കുക...',
    send: 'അയയ്ക്കുക',
    voice: 'വോയ്‌സ്',
    replay: 'വീണ്ടും കേൾക്കുക',
    mute: 'മ്യൂട്ട്',
    unmute: 'അൺമ്യൂട്ട്',
    stop: 'കേൾക്കുന്നത് നിർത്തുക',
    clear: 'സൂക്ഷിക്കുക',
    shareLocation: '📍 എന്റെ സ്ഥാനം പങ്കിടുക',
    locationDenied: 'സ്ഥലം അനുവദിക്കൽ നിഷേധിച്ചു. കൈമാറിയിലേയ്ക്ക് നൽകുക.',
    locationManual: 'സ്ഥലം കൈയിലേയ്ക്ക് നൽകുക',
    emergencyAnalysis: 'അടിയന്തര വിശകലനം',
    emergency: 'അടിയന്തരം',
    urgency: 'തൽപ്പരത',
    language: 'ഭാഷ',
    incident: 'സംഭവം',
    action: 'ശുപാർശ ചെയ്ത പ്രവർത്തനം',
    nearby: 'അടുത്ത അടിയന്തര സഹായങ്ങൾ',
    bestMatch: 'മികച്ച പൊരുത്തം',
    directions: 'വഴി കാണുക',
    call: 'കാൾ',
    demo: 'ഡെമോ മോഡ്',
    critical: 'ഗുരുതര അടിയന്തരാവസ്ഥ കണ്ടെത്തി',
    services: 'ലഭ്യമായ സേവനങ്ങൾ',
    facility: 'മികച്ച അടിയന്തര സೌಲഭ്യം',
    voiceUnavailable: 'ഈ ഭാഷയ്ക്കുള്ള വോയ്സ് പ്ലേബാക്ക് നിങ്ങളുടെ ബ്രൗസറിൽ ലഭ്യമല്ല.',
    notAvailable: 'ഇതുവരെ സ്ഥലം ലഭ്യമല്ല.',
    speakFallback: 'ഈ ബ്രൗസറിൽ സ്പീച്ച റിക്കഗ്നിഷൻ ഇല്ല. നിങ്ങളുടെ അടിയന്തരാവസ്ഥ ടൈപ്പ് ചെയ്യുക.',
    emergencyButton: '🚨 അടിയന്തരം',
    findHospital: '🏥 ആശുപത്രി കണ്ടെത്തുക',
    shareBtn: '📍 സ്ഥലം പങ്കിടുക',
  },
  mr: {
    brand: 'प्राणसेतु',
    title: 'मी तुम्हाला कशी मदत करू?',
    online: 'प्राणसेतु AI ऑनलाइन',
    talk: '🎙️ प्राणसेतूसोबत बोला',
    idle: 'माइकवर टॅप करून बोला',
    listening: 'ऐकले जात आहे...',
    processing: 'आपत्काल समजण्याचा प्रयत्न...',
    responding: 'प्राणसेतु प्रतिसाद देत आहे...',
    speaking: 'बोलत आहे...',
    input: 'आपत्काल सांगा...',
    send: 'पाठवा',
    voice: 'आवाज',
    replay: 'पुन्हा ऐका',
    mute: 'म्यूट',
    unmute: 'अनम्यूट',
    stop: 'ऐकणे थांबवा',
    clear: 'साफ करा',
    shareLocation: '📍 माझे स्थान शेअर करा',
    locationDenied: 'स्थान परवानगी नाकारली गेली. कृपया मॅन्युअली भरा.',
    locationManual: 'स्थान मॅन्युअली भरा',
    emergencyAnalysis: 'आपत्काल विश्लेषण',
    emergency: 'आपत्काल',
    urgency: 'तातडी',
    language: 'भाषा',
    incident: 'घटना',
    action: 'शिफारस केलेले काम',
    nearby: 'जवळची आपत्कालीन सुविधा',
    bestMatch: 'सर्वोत्तम निवड',
    directions: 'मार्ग पाहा',
    call: 'कॉल',
    demo: 'डेमो मोड',
    critical: 'गंभीर आपत्काल आढळला',
    services: 'उपलब्ध सेवा',
    facility: 'सर्वोत्कृष्ट आपत्कालीन सुविधा',
    voiceUnavailable: 'या भाषेसाठी आवाज प्लेबॅक हे ब्राउझरमध्ये उपलब्ध नाही.',
    notAvailable: 'अद्याप स्थान उपलब्ध नाही.',
    speakFallback: 'या ब्राउझरमध्ये स्पीच रेकग्निशन उपलब्ध नाही. कृपया आपत्काल मजकूरात टाइप करा.',
    emergencyButton: '🚨 आपत्काल',
    findHospital: '🏥 रुग्णालय शोधा',
    shareBtn: '📍 स्थान शेअर करा',
  },
  bn: {
    brand: 'প্রাণসেতু',
    title: 'আমি কীভাবে সাহায্য করতে পারি?',
    online: 'প্রাণসেতু AI অনলাইন',
    talk: '🎙️ প্রাণসেতুর সাথে কথা বলুন',
    idle: 'মাইক্রোফোনে ট্যাপ করে বলুন',
    listening: 'শোনা হচ্ছে...',
    processing: 'জরুরি অবস্থা বুঝতে চেষ্টা করছি...',
    responding: 'প্রাণসেতু প্রতিক্রিয়া দিচ্ছে...',
    speaking: 'কথা বলছে...',
    input: 'আপনার জরুরি অবস্থা লিখুন...',
    send: 'পাঠান',
    voice: 'ভয়েস',
    replay: 'আবার বাজান',
    mute: 'মিউট',
    unmute: 'আনমিউট',
    stop: 'শোনা বন্ধ করুন',
    clear: 'ক্লিয়ার',
    shareLocation: '📍 আমার অবস্থান শেয়ার করুন',
    locationDenied: 'অবস্থান অনুমতি অস্বীকার করা হয়েছে। ম্যানুয়ালি লিখুন।',
    locationManual: 'ম্যানুয়ালি অবস্থান লিখুন',
    emergencyAnalysis: 'জরুরি বিশ্লেষণ',
    emergency: 'জরুরি',
    urgency: 'জরুরিতা',
    language: 'ভাষা',
    incident: 'ঘটনা',
    action: 'প্রস্তাবিত পদক্ষেপ',
    nearby: 'কাছের জরুরি সুবিধা',
    bestMatch: 'সেরা মিল',
    directions: 'দিকনির্দেশ দেখুন',
    call: 'কল',
    demo: 'ডেমো মোড',
    critical: 'গুরুতর জরুরি অবস্থা শনাক্ত হয়েছে',
    services: 'উপলব্ধ সেবা',
    facility: 'সেরা জরুরি সুবিধা',
    voiceUnavailable: 'এই ভাষার জন্য ভয়েস প্লেব্যাক এই ব্রাউজারে নেই।',
    notAvailable: 'এখনও অবস্থান নেই।',
    speakFallback: 'এই ব্রাউজারে স্পিচ রিকগনিশন নেই। দয়া করে জরুরি তথ্য টাইপ করুন।',
    emergencyButton: '🚨 জরুরি',
    findHospital: '🏥 হাসপাতাল খুঁজুন',
    shareBtn: '📍 অবস্থান শেয়ার করুন',
  },
  gu: {
    brand: 'પ્રાણસેતુ',
    title: 'હું તમારી કેવી રીતે મદદ કરી શકું?',
    online: 'પ્રાણસેતુ AI オનલાઇન',
    talk: '🎙️ પ્રાણસેતુ સાથે બોલો',
    idle: 'માઇક પર ટેપ કરીને બોલો',
    listening: 'સાંભળી રહી છે...',
    processing: 'ઇમરજન્સી સમજવાનો પ્રયાસ...',
    responding: 'પ્રાણસેતુ પ્રતિસાદ આપે છે...',
    speaking: 'બોલી રહ્યું છે...',
    input: 'તમારી ઇમરજન્સી વર્ણવો...',
    send: 'મોકલો',
    voice: 'વૉઈસ',
    replay: 'ફરીથી સાંભળો',
    mute: 'મ્યુટ',
    unmute: 'અનમ્યુટ',
    stop: 'સાંભળવાનું બંધ કરો',
    clear: 'સાફ કરો',
    shareLocation: '📍 મારો સ્થાન શેર કરો',
    locationDenied: 'સ્થાન પરવાનગી નકારવામાં આવી. કૃપા કરીને હાથથી લખો.',
    locationManual: 'સ્થાન دستی રીતે દાખલ કરો',
    emergencyAnalysis: 'ઇમરજન્સી વિશ્લેષણ',
    emergency: 'ઇમરજન્સી',
    urgency: 'જરૂરિયાત',
    language: 'ભાષા',
    incident: 'ઘટના',
    action: 'સુચિત પગલું',
    nearby: 'નજીકની ઇમરજન્સી સુવિધાઓ',
    bestMatch: 'સૌથી સારી પસંદગી',
    directions: 'દિશાસૂચિ જુઓ',
    call: 'કોલ',
    demo: 'ડેમો મોડ',
    critical: 'ગંભીર ઇમરજન્સી ઓળખાઇ',
    services: 'ઉપલબ્ધ સેવાઓ',
    facility: 'સૌથી સારી ઇમરજન્સી સુવિધા',
    voiceUnavailable: 'આ ભાષા માટે વૉઈસ પ્લેબેક તમારા બ્રાઉઝરમાં ઉપલબ્ધ નથી.',
    notAvailable: 'હજુ સુધી સ્થાન ઉપલબ્ધ નથી.',
    speakFallback: 'આ બ્રાઉઝર સ્પીચ રિકગ્નિશન સપોર્ટ કરતું નથી. કૃપા કરીને ઇમરજન્સી ટેક્સ્ટમાં લખો.',
    emergencyButton: '🚨 ઇમરજન્સી',
    findHospital: '🏥 હૉસ્પિટલ શોધો',
    shareBtn: '📍 સ્થાન શેર કરો',
  },
  pa: {
    brand: 'ਪ੍ਰਾਣਸੇਤੁ',
    title: 'ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
    online: 'ਪ੍ਰਾਣਸੇਤੁ AI ਆਨਲਾਈਨ',
    talk: '🎙️ ਪ੍ਰਾਣਸੇਤੁ ਨਾਲ ਬੋਲੋ',
    idle: 'ਮਾਈਕ ਤੇ ਟੈਪ ਕਰਕੇ ਬੋਲੋ',
    listening: 'ਸੁਣਿਆ ਜਾ ਰਿਹਾ ਹੈ...',
    processing: 'ਇਮਰਜੈਂਸੀ ਸਮਝਣ ਦੀ ਕੋਸ਼ਿਸ਼...',
    responding: 'ਪ੍ਰਾਣਸੇਤੁ ਜਵਾਬ ਦੇ ਰਿਹਾ ਹੈ...',
    speaking: 'ਬੋਲ ਰਿਹਾ ਹੈ...',
    input: 'ਆਪਣੀ ਇਮਰਜੈਂਸੀ ਦੱਸੋ...',
    send: 'ਭੇਜੋ',
    voice: 'ਆਵਾਜ਼',
    replay: 'ਦੁਬਾਰਾ ਸੁਣੋ',
    mute: 'ਮਿਊਟ',
    unmute: 'ਅਨਮਿਊਟ',
    stop: 'ਸੁਣਨਾ ਬੰਦ ਕਰੋ',
    clear: 'ਸਾਫ ਕਰੋ',
    shareLocation: '📍 ਮੇਰਾ ਸਥਾਨ ਸਾਂਝਾ ਕਰੋ',
    locationDenied: 'ਸਥਾਨ ਦੀ ਆਗਿਆ ਨਾਪਸੰਦ ਕੀਤੀ ਗਈ। ਕਿਰਪਾ ਕਰਕੇ ਮੈਨੁਅਲ ਵਿੱਚ ਭਰੋ।',
    locationManual: 'ਸਥਾਨ ਮੈਨੁਅਲ ਵਿੱਚ ਭਰੋ',
    emergencyAnalysis: 'ਇਮਰਜੈਂਸੀ ਵਿਸ਼ਲੇਸ਼ਣ',
    emergency: 'ਇਮਰਜੈਂਸੀ',
    urgency: 'ਤੁਰੰਤ',
    language: 'ਭਾਸ਼ਾ',
    incident: 'ਘਟਨਾ',
    action: 'ਸਿਫਾਰਸ਼ ਕੀਤੀ ਗਈ ਕਾਰਵਾਈ',
    nearby: 'ਨਜ਼ਦੀਕੀ ਇਮਰਜੈਂਸੀ ਸਹੂਲਤ',
    bestMatch: 'ਸਭ ਤੋਂ ਵਧੀਆ ਮੇਲ',
    directions: 'ਦਿਸ਼ਾਵਾਂ ਵੇਖੋ',
    call: 'ਕਾਲ',
    demo: 'ਡੈਮੋ ਮੋਡ',
    critical: 'ਗੰਭੀਰ ਇਮਰਜੈਂਸੀ ਮਿਲੀ',
    services: 'ਉਪਲਬਧ ਸੇਵਾਵਾਂ',
    facility: 'ਸਭ ਤੋਂ ਵਧੀਆ ਇਮਰਜੈਂਸੀ ਸਹੂਲਤ',
    voiceUnavailable: 'ਇਸ ਭਾਸ਼ਾ ਲਈ ਵੌਇਸ ਪਲੇਬੈਕ ਤੁਹਾਡੇ ਬ੍ਰਾਉਜ਼ਰ ਵਿੱਚ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।',
    notAvailable: 'ਹਾਲੇ ਸਥਾਨ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।',
    speakFallback: 'ਇਸ ਬ੍ਰਾਉਜ਼ਰ ਵਿੱਚ ਸਪੀਚ ਰਿਕਗਨਿਟਨ ਦੀ ਸਮਰਥਾ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਇਮਰਜੈਂਸੀ ਟਾਈਪ ਕਰੋ।',
    emergencyButton: '🚨 ਇਮਰਜੈਂਸੀ',
    findHospital: '🏥 ਹਸਪਤਾਲ ਖੋਜੋ',
    shareBtn: '📍 ਸਥਾਨ ਸਾਂਝਾ ਕਰੋ',
  },
  or: {
    brand: 'ପ୍ରାଣସେତୁ',
    title: 'ମୁଁ ଆପଣଙ୍କୁ କିପରି ସହାୟତା କରିପାରି?',
    online: 'ପ୍ରାଣସେତୁ AI ଅନଲାଇନ୍',
    talk: '🎙️ ପ୍ରାଣସେତୁଙ୍କୁ କହନ୍ତୁ',
    idle: 'ମାଇକ୍ ଉପରେ ଟ୍ୟାପ କରି କହନ୍ତୁ',
    listening: 'ଶୁଣୁଛି...',
    processing: 'ଜରୁରୀ ଅବସ୍ଥା ବୁଝୁଛି...',
    responding: 'ପ୍ରାଣସେତୁ ଉତ୍ତର ଦେଉଛି...',
    speaking: 'କଥା କହୁଛି...',
    input: 'ଆପଣଙ୍କ ଅବସ୍ଥା ବର୍ଣ୍ଣନା କରନ୍ତୁ...',
    send: 'ପଠାନ୍ତୁ',
    voice: 'ଭୋଇସ୍',
    replay: 'ପୁନଃ ଶୁଣନ୍ତୁ',
    mute: 'ମ୍ୟୁଟ୍',
    unmute: 'ଅନମ୍ୟୁଟ୍',
    stop: 'ଶୁଣିବା ବନ୍ଦ କରନ୍ତୁ',
    clear: 'ସଫା',
    shareLocation: '📍 ମୋ ଲୋକେସନ୍ ସେୟାର୍ କରନ୍ତୁ',
    locationDenied: 'ସ୍ଥାନ ଅନୁମତି ପ୍ରତ୍ୟାଖ୍ୟାନ କରାଯାଇଛି। ଦୟାକରି ହସ୍ତଚଳିତ ଭାବେ ଲେଖନ୍ତୁ।',
    locationManual: 'ଲୋକେସନ୍ ହସ୍ତଚଳିତ ଭାବେ ଲେଖନ୍ତୁ',
    emergencyAnalysis: 'ଜରୁରୀ ବିଶ୍ଳେଷଣ',
    emergency: 'ଜରୁରୀ',
    urgency: 'ତତ୍ପରତା',
    language: 'ଭାଷା',
    incident: 'ଘଟଣା',
    action: 'ପ୍ରସ୍ତାବିତ କାର୍ଯ୍ୟ',
    nearby: 'ନିକଟସ୍ଥ ଜରୁରୀ ସୁବିଧା',
    bestMatch: 'ସର୍ବୋତ୍ତମ ମିଳନ',
    directions: 'ଦିଗ୍ନିର୍ଦେଶ ଦେଖନ୍ତୁ',
    call: 'କଲ୍',
    demo: 'ଡେମୋ ମୋଡ୍',
    critical: 'ଗୁରୁତର ଜରୁରୀ ଅବସ୍ଥା ଚିହ୍ନିଗଲା',
    services: 'ଉପଲବ୍ଧ ସେବା',
    facility: 'ସର୍ବୋତ୍ତମ ରକ୍ଷା ସୁବିଧା',
    voiceUnavailable: 'ଏହି ଭାଷା ପାଇଁ ଭୋଇସ୍ ପ୍ଲେବ୍ୟାକ୍ ଉପଲବ୍ଧ ନାହିଁ।',
    notAvailable: 'ଏପର୍ଯ୍ୟନ୍ତ ଲୋକେସନ୍ ଉପଲବ୍ଧ ନାହିଁ।',
    speakFallback: 'ଏହି ବ୍ରାଉଜରରେ ସ୍ପିଚ୍ ଚିହ୍ନିବା ସମର୍ଥନ ନାହିଁ। ଦୟାକରି ଅବସ୍ଥା ଟାଇପ କରନ୍ତୁ।',
    emergencyButton: '🚨 ଜରୁରୀ',
    findHospital: '🏥 ହସପତାଳ ଖୋଜନ୍ତୁ',
    shareBtn: '📍 ଲୋକେସନ୍ ସେୟାର୍ କରନ୍ତୁ',
  },
  ur: {
    brand: 'پرناسیتو',
    title: 'میں آپ کی کس طرح مدد کر سکتا ہوں؟',
    online: 'پرناسیتو AI آن لائن',
    talk: '🎙️ پرناسیتو سے بات کریں',
    idle: 'مائیک پر ٹپ کرکے بولیں',
    listening: 'سن رہا ہے...',
    processing: 'ایمرجینسی سمجھنے کی کوشش...',
    responding: 'پرناسیتو جواب دے رہا ہے...',
    speaking: 'بول رہا ہے...',
    input: 'اپنی ایمرجینسی بیان کریں...',
    send: 'بھیجیں',
    voice: 'آواز',
    replay: 'دوبارہ سنیں',
    mute: 'میوٹ',
    unmute: 'انمیوٹ',
    stop: 'سننا بند کریں',
    clear: 'صاف کریں',
    shareLocation: '📍 میرا مقام شیئر کریں',
    locationDenied: 'مقام کی اجازت رد کردی گئی۔ براہ کرم دستی طور پر درج کریں۔',
    locationManual: 'مقام دستی طور پر درج کریں',
    emergencyAnalysis: 'ایمرجینسی تجزیہ',
    emergency: 'ایمرجینسی',
    urgency: 'فوری ضرورت',
    language: 'زبان',
    incident: 'واقعہ',
    action: 'تجویز کردہ عمل',
    nearby: 'قریب کی ایمرجینسی سہولیات',
    bestMatch: 'بہترین میچ',
    directions: 'راستہ دیکھیں',
    call: 'کال',
    demo: 'ڈیمو موڈ',
    critical: 'شدید ایمرجینسی پائی گئی',
    services: 'دستیاب خدمات',
    facility: 'بہترین ایمرجینسی سہولت',
    voiceUnavailable: 'اس زبان کے لیے وائس پلے بیک آپ کے براؤزر میں دستیاب نہیں ہے۔',
    notAvailable: 'ابھی تک مقام دستیاب نہیں ہے۔',
    speakFallback: 'اس براؤزر میں اسپچ ریکگنیشن دستیاب نہیں ہے۔ براہ کرم اپنی ایمرجینسی ٹائپ کریں۔',
    emergencyButton: '🚨 ایمرجینسی',
    findHospital: '🏥 ہسپتال تلاش کریں',
    shareBtn: '📍 مقام شیئر کریں',
  },
}

const responsePhrases = {
  en: 'This may be a serious emergency. Please contact local emergency services immediately and share your location.',
  hi: 'यह गंभीर आपातकाल हो सकता है। कृपया तुरंत स्थानीय आपातकाल सेवाओं से संपर्क करें और अपने स्थान को साझा करें।',
  te: 'ఇది తీవ్రమైన అత్యవసర పరిస్థితి కావచ్చు. వెంటనే స్థానిక అత్యవసర సేవలను సంప్రదించి మీ స్థానం షేర్ చేయండి.',
  ta: 'இது கடுமையான அவசரநிலை ஆகலாம். உடனடியாக உள்ளூர் அவசர சேவைகளுடன் தொடர்பு கொண்டு உங்கள் இருப்பிடத்தை பகிரவும்.',
  kn: 'ಇದು ಗಂಭೀರ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಾಗಿರಬಹುದು. ದಯವಿಟ್ಟು ತಕ್ಷಣ ಸ್ಥಳೀಯ ತುರ್ತು ಸೇವೆಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಿ.',
  ml: 'ഇത് ഗുരുതരമായ അടിയന്തരാവസ്ഥയാകാം. ഉടൻ പ്രദേശിക അടിയന്തര സേവനങ്ങളുമായി ബന്ധപ്പെടുകയും സ്ഥലം പങ്കിടുകയും ചെയ്യുക.',
  mr: 'ही गंभीर आपत्कालाची स्थिती असू शकते. कृपया त्वरित स्थानिक आपत्काल सेवा संपर्क करा आणि तुमचे स्थान शेअर करा.',
  bn: 'এটি গুরুতর জরুরি অবস্থা হতে পারে। দয়া করে অবিলম্বে স্থানীয় জরুরি পরিষেবার সাথে যোগাযোগ করুন এবং আপনার অবস্থান শেয়ার করুন।',
  gu: 'આ ગંભીર ઇમરજન્સી હોઈ શકે છે. કૃપા કરીને તુરંત સ્થાનિક ઇમરજન્સી સેવાઓનો સંપર્ક કરો અને તમારું સ્થાન શેર કરો.',
  pa: 'ਇਹ ਗੰਭੀਰ ਇਮਰਜੈਂਸੀ ਹੋ ਸਕਦੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਸਥਾਨਕ ਇਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਨਾਲ ਸੰਪਰਕ ਕਰੋ ਅਤੇ ਆਪਣਾ ਸਥਾਨ ਸਾਂਝਾ ਕਰੋ।',
  or: 'ଏହା ଗୁରୁତର ଜରୁରୀ ଅବସ୍ଥା ହୋଇପାରେ। ଦୟାକରି ତତ୍ତକାଳେ ସ୍ଥାନୀୟ ଜରୁରୀ ସେବାଙ୍କୁ କଲ୍ କରନ୍ତୁ ଏବଂ ଆପଣଙ୍କ ସ୍ଥାନ ସେୟାର୍ କରନ୍ତୁ।',
  ur: 'یہ شدید ایمرجینسی ہو سکتی ہے۔ براہ کرم فوری طور پر مقامی ایمرجینسی خدمات سے رابطہ کریں اور اپنا مقام شیئر کریں۔',
}

function t(key, lang) {
  return uiText[lang]?.[key] || uiText.en[key] || key
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
  if (/(accident|collision|crash|road accident|vehicle|hit by car|car accident|motorcycle|bus|truck|train)/i.test(value)) return 'Road accident'
  if (/(chest pain|heart attack|heart|cardiac|pain in chest|palpitations)/i.test(value)) return 'Heart emergency'
  if (/(breath|difficulty breathing|asthma|shortness of breath|not breathing|wheezing)/i.test(value)) return 'Breathing problem'
  if (/(stroke|weakness|slurred speech|face droop|one side weak|paralysis)/i.test(value)) return 'Stroke symptoms'
  if (/(bleeding|blood|heavy bleeding|hemorrhage|severe bleeding|bleeding heavily)/i.test(value)) return 'Severe bleeding'
  if (/(unconscious|fainted|not responsive|passed out|collapse|coma)/i.test(value)) return 'Unconscious person'
  if (/(fire|smoke|burning|flames|house fire|gas leak|explosion)/i.test(value)) return 'Fire'
  if (/(poison|toxic|chemical|ingested poison|drug overdose|swallowed poison)/i.test(value)) return 'Poisoning'
  if (/(child|baby|infant|kid|children|newborn)/i.test(value)) return 'Child emergency'
  if (/(women|woman|female|pregnant|harassment|rape|sexual abuse)/i.test(value)) return 'Women\'s emergency'
  if (/(earthquake|flood|cyclone|storm|landslide|tsunami|natural disaster)/i.test(value)) return 'Natural disaster'
  return 'Medical emergency'
}

function detectUrgency(type) {
  const critical = ['Road accident', 'Heart emergency', 'Breathing problem', 'Stroke symptoms', 'Severe bleeding', 'Unconscious person', 'Fire']
  if (critical.includes(type)) return 'CRITICAL'
  if (['Poisoning', 'Child emergency', 'Women\'s emergency', 'Natural disaster'].includes(type)) return 'HIGH'
  return 'MODERATE'
}

function buildAnalysis(text, language) {
  const type = detectEmergencyType(text)
  const urgency = detectUrgency(type)
  const recommended = urgency === 'CRITICAL'
    ? 'Contact local emergency services immediately and share your location.'
    : 'Contact a local clinic or emergency service and share your location.'

  return {
    emergencyType: type,
    urgency,
    incidentDetails: text.trim() || 'Emergency report received.',
    detectedLanguage: language,
    recommendedAction: recommended,
    response: responsePhrases[language] || responsePhrases.en,
  }
}

function speakResponse(message, languageCode, muted) {
  if (muted || !message || !('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(message)
  const locale = languages.find((lang) => lang.id === languageCode)?.locale || 'en-US'
  utterance.lang = locale

  const voices = window.speechSynthesis.getVoices()
  const match = voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith(locale.slice(0, 2)))
  if (match) utterance.voice = match

  window.speechSynthesis.speak(utterance)
  return true
}

export default function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem('pranasetu-language') || 'en')
  const [inputText, setInputText] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [status, setStatus] = useState('idle')
  const [listening, setListening] = useState(false)
  const [location, setLocation] = useState(null)
  const [manualLocation, setManualLocation] = useState('')
  const [facilities, setFacilities] = useState(defaultFacilities)
  const [selectedFacility, setSelectedFacility] = useState(defaultFacilities[0])
  const [muted, setMuted] = useState(false)
  const [conversation, setConversation] = useState([{ role: 'assistant', content: 'How can I help you?' }])
  const [closing, setClosing] = useState(false)
  const [savedIncidents, setSavedIncidents] = useState([])
  const [sosActive, setSosActive] = useState(false)
  const [sosCountdown, setSosCountdown] = useState(0)
  const [dispatchNotice, setDispatchNotice] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('pranasetu-incidents') || '[]')
    setSavedIncidents(Array.isArray(saved) ? saved : [])
  }, [])

  useEffect(() => {
    localStorage.setItem('pranasetu-language', language)
  }, [language])

  useEffect(() => {
    fetch('/api/hospitals/nearby')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.facilities) && data.facilities.length) {
          setFacilities(data.facilities)
          setSelectedFacility(data.facilities[0])
        }
      })
      .catch(() => {
        setFacilities(defaultFacilities)
        setSelectedFacility(defaultFacilities[0])
      })
  }, [])

  const currentText = useMemo(() => uiText[language] || uiText.en, [language])
  const statusMessage = {
    idle: currentText.idle,
    listening: currentText.listening,
    processing: currentText.processing,
    responding: currentText.responding,
    speaking: currentText.speaking,
    fallback: currentText.speakFallback,
  }[status] || currentText.idle

  const bestFacility = useMemo(() => {
    if (!facilities.length) return defaultFacilities[0]
    return [...facilities].sort((a, b) => (a.distance || 0) - (b.distance || 0))[0]
  }, [facilities])

  const addConversation = (role, content) => {
    setConversation((previous) => [...previous, { role, content }])
  }

  const handleAnalysis = async (rawText) => {
    const text = rawText.trim()
    if (!text) return

    const detected = detectLanguage(text)
    const finalLanguage = detected || language
    setLanguage(finalLanguage)
    setStatus('processing')

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: finalLanguage }),
      })

      if (!res.ok) throw new Error('analysis failed')
      const result = await res.json()
      const normalized = { ...buildAnalysis(text, finalLanguage), ...result }
      setAnalysis(normalized)
      setResponseText(normalized.response || result.response || responsePhrases[finalLanguage])
      setStatus('responding')
      addConversation('user', text)
      addConversation('assistant', normalized.response || result.response || responsePhrases[finalLanguage])
      if (!muted) {
        const played = speakResponse(normalized.response || result.response || responsePhrases[finalLanguage], finalLanguage, muted)
        if (played) setStatus('speaking')
      }
    } catch {
      const fallback = buildAnalysis(text, finalLanguage)
      setAnalysis(fallback)
      setResponseText(fallback.response)
      setStatus('responding')
      addConversation('user', text)
      addConversation('assistant', fallback.response)
      if (!muted) {
        const played = speakResponse(fallback.response, finalLanguage, muted)
        if (played) setStatus('speaking')
      }
    }
  }

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setStatus('fallback')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = languages.find((item) => item.id === language)?.locale || 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
      setStatus('listening')
    }

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript
      setInputText(transcript)
      setListening(false)
      await handleAnalysis(transcript)
    }

    recognition.onerror = () => {
      setListening(false)
      setStatus('fallback')
    }

    recognition.onend = () => {
      setListening(false)
      if (status !== 'processing' && status !== 'responding') setStatus('idle')
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopVoiceInput = () => {
    recognitionRef.current?.stop()
    setListening(false)
    setStatus('idle')
  }

  const shareLocation = () => {
    if (!navigator.geolocation) {
      setLocation({ manual: true, label: currentText.locationDenied })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          label: 'Current device location',
        }
        setLocation(nextLocation)
        fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextLocation),
        }).catch(() => undefined)
      },
      () => {
        setLocation({ manual: true, label: currentText.locationDenied })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const selectedLanguageMeta = languages.find((item) => item.id === language) || languages[0]

  const persistIncident = (incident) => {
    const next = [incident, ...savedIncidents].slice(0, 5)
    setSavedIncidents(next)
    localStorage.setItem('pranasetu-incidents', JSON.stringify(next))
  }

  const saveEmergencyPacket = () => {
    const details = {
      time: new Date().toLocaleString(),
      urgency: analysis?.urgency || 'MODERATE',
      emergencyType: analysis?.emergencyType || detectEmergencyType(inputText),
      language: selectedLanguageMeta.id,
      incident: analysis?.incidentDetails || inputText || 'Emergency report received.',
      suggestedAction: analysis?.recommendedAction || 'Contact emergency services immediately.',
    }
    persistIncident(details)
  }

  const shareEmergencyPacket = async () => {
    const summary = [
      'PRANASETU Emergency Packet',
      `Time: ${new Date().toLocaleString()}`,
      `Urgency: ${analysis?.urgency || 'MODERATE'}`,
      `Type: ${analysis?.emergencyType || detectEmergencyType(inputText)}`,
      `Incident: ${analysis?.incidentDetails || inputText || 'Emergency report received.'}`,
      `Action: ${analysis?.recommendedAction || 'Contact emergency services immediately.'}`,
    ].join('\n')

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PRANASETU Emergency Packet',
          text: summary,
        })
        return
      } catch {
        // fall through to clipboard path
      }
    }

    await navigator.clipboard.writeText(summary)
    setStatus('responding')
  }

  const triggerAppClose = () => {
    setClosing(true)
    window.setTimeout(() => {
      try {
        window.close()
      } catch (error) {
        window.location.replace('about:blank')
      }
    }, 2200)
  }

  const triggerSos = () => {
    const locationText = location
      ? `Emergency at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
      : manualLocation
        ? `Emergency at ${manualLocation}`
        : 'Emergency assistance required. Please dispatch urgently.'

    setSosActive(true)
    setDispatchNotice('Dispatching to police with your location...')
    setSosCountdown(5)

    const intervalId = window.setInterval(() => {
      setSosCountdown((previous) => {
        if (previous <= 1) {
          window.clearInterval(intervalId)
          setSosActive(false)
          setDispatchNotice('Emergency services alerted with your location.')
          if (typeof window !== 'undefined') {
            const telLink = `tel:112,,${encodeURIComponent(locationText)}`
            window.location.href = telLink
          }
          return 0
        }
        return previous - 1
      })
    }, 1000)
  }

  return (
    <div className="pranasetu-app">
      {closing && (
        <div className="closing-overlay" aria-live="assertive">
          <div className="closing-frame">
            <div className="closing-glow" />
            <div className="closing-core">
              <div className="closing-badge">COGNIVOX</div>
              <div className="closing-logo">PRANASETU</div>
              <div className="closing-subtitle">Bridge of life</div>
            </div>
            <div className="closing-rings" />
          </div>
        </div>
      )}

      <header className="topbar">
        <div className="brand-area">
          <div className="brand-mark">P</div>
          <div>
            <strong>{currentText.brand}</strong>
            <small>Bridge of life</small>
          </div>
        </div>

        <div className="header-tools">
          <label className="language-select">
            <span>{currentText.language}</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              {languages.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          <button className="ghost-button" onClick={() => setInputText('')}>{currentText.clear}</button>
          <button className="close-button" onClick={triggerAppClose}>Close</button>
        </div>
      </header>

      <main className="layout">
        <section className="main-panel panel">
          <div className="online-tag">● {currentText.online}</div>
          <div className="assistant-title-wrap">
            <p className="eyebrow">PRANASETU AI</p>
            <h1>{currentText.title}</h1>
          </div>

          <button className={`talk-button ${listening ? 'listening' : ''}`} onClick={listening ? stopVoiceInput : startVoiceInput}>
            <span className="icon">🎙️</span>
            <span>{currentText.talk}</span>
          </button>

          <div className="status-bar">
            <span className="status-dot" />
            <span>{statusMessage}</span>
          </div>

          <div className="action-row small-actions">
            <button className="secondary" onClick={stopVoiceInput}>{currentText.stop}</button>
            <button className="secondary" onClick={() => speakResponse(responseText || inputText, language, muted)}>{currentText.replay}</button>
            <button className="secondary" onClick={() => setMuted((prev) => !prev)}>{muted ? currentText.unmute : currentText.mute}</button>
          </div>

          <label className="chat-label">
            <span>{currentText.input}</span>
            <textarea value={inputText} onChange={(event) => setInputText(event.target.value)} placeholder={currentText.input} />
          </label>

          <div className="action-row">
            <button className="primary" onClick={() => handleAnalysis(inputText)}>{currentText.send}</button>
            <button className="secondary" onClick={() => setInputText('')}>{currentText.clear}</button>
          </div>

          <div className="conversation-box">
            {conversation.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`bubble ${item.role}`}>
                {item.content}
              </div>
            ))}
          </div>
        </section>

        <aside className="side-panel panel">
          <div className="side-header">
            <p>{currentText.emergencyAnalysis}</p>
            <span>{currentText.demo}</span>
          </div>

          <div className="analysis-box">
            <div className="row"><span>{currentText.emergency}</span><strong>{analysis?.emergencyType || 'Medical emergency'}</strong></div>
            <div className="row"><span>{currentText.urgency}</span><strong className={analysis?.urgency === 'CRITICAL' ? 'urgent critical' : analysis?.urgency === 'HIGH' ? 'urgent high' : 'urgent moderate'}>{analysis?.urgency || 'MODERATE'}</strong></div>
            <div className="row"><span>{currentText.language}</span><strong>{analysis?.detectedLanguage || selectedLanguageMeta.id}</strong></div>
            <div className="row"><span>{currentText.incident}</span><strong>{analysis?.incidentDetails || inputText || 'Emergency report pending.'}</strong></div>
            <div className="row"><span>{currentText.action}</span><strong>{analysis?.recommendedAction || 'Please contact emergency services immediately.'}</strong></div>
          </div>

          <div className="button-stack">
            <button className={`danger-button ${sosActive ? 'sos-flash' : ''}`}>{currentText.emergencyButton}</button>
            <button className={`sos-button ${sosActive ? 'sos-flash' : ''}`} onClick={triggerSos}>🚨 SOS • Police {sosActive ? `(${sosCountdown}s)` : ''}</button>
            {dispatchNotice && <div className="sos-banner">{dispatchNotice}</div>}
            <a href="tel:112" className="action-button">📞 {currentText.call}</a>
            <button className="action-button" onClick={shareLocation}>{currentText.shareBtn}</button>
            <button className="action-button">🏥 {currentText.findHospital}</button>
            <a className="action-button" href={selectedFacility ? `https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.lat},${selectedFacility.lng}` : 'https://www.google.com/maps'} target="_blank" rel="noreferrer">🗺️ {currentText.directions}</a>
          </div>

          <div className="police-stations">
            <div className="mini-title">
              <span>Police stations</span>
            </div>
            <div className="police-list">
              <a href="tel:100" className="police-item"><span>National Emergency</span><strong>100</strong></a>
              <a href="tel:112" className="police-item"><span>Emergency Helpline</span><strong>112</strong></a>
              <a href="tel:1091" className="police-item"><span>Women Help Line</span><strong>1091</strong></a>
              <a href="tel:108" className="police-item"><span>Ambulance</span><strong>108</strong></a>
            </div>
          </div>

          <div className="incident-packet">
            <div className="mini-title">
              <span>Emergency packet</span>
              <button onClick={saveEmergencyPacket}>Save</button>
            </div>
            <div className="packet-actions">
              <button className="secondary" onClick={saveEmergencyPacket}>Save report</button>
              <button className="secondary" onClick={shareEmergencyPacket}>Share</button>
            </div>
            <div className="incident-list">
              {savedIncidents.length === 0 ? (
                <p>No saved incidents yet.</p>
              ) : (
                savedIncidents.map((item, index) => (
                  <div key={`${item.time}-${index}`} className="incident-item">
                    <strong>{item.emergencyType}</strong>
                    <small>{item.time}</small>
                    <span>{item.urgency}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {analysis?.urgency === 'CRITICAL' && (
            <div className="critical-banner">
              <strong>{currentText.critical}</strong>
              <p>{analysis?.response || responsePhrases[language] || responsePhrases.en}</p>
            </div>
          )}

          <div className="location-box">
            <div className="mini-title">
              <span>{currentText.language}</span>
              <button onClick={shareLocation}>{currentText.shareLocation}</button>
            </div>
            <input value={manualLocation} onChange={(event) => setManualLocation(event.target.value)} placeholder={currentText.locationManual} />
            <p>{location ? (location.manual ? currentText.locationDenied : `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`) : currentText.notAvailable}</p>
          </div>

          <div className="facility-section">
            <p className="mini-title-p">{currentText.facility}</p>
            <div className="facility-card primary-facility">
              <strong>{bestFacility.name}</strong>
              <span>{bestFacility.address}</span>
              <small>{bestFacility.distance} km · {bestFacility.eta} min</small>
              <a href={`tel:${bestFacility.phone}`}>{bestFacility.phone}</a>
            </div>
            <div className="facility-list">
              {facilities.slice(0, 3).map((facility) => (
                <button key={facility.name} className="facility-option" onClick={() => setSelectedFacility(facility)}>
                  <div>
                    <strong>{facility.name}</strong>
                    <small>{facility.type}</small>
                  </div>
                  <div>
                    <b>{facility.distance} km</b>
                    <small>{facility.eta} min</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="map-box">
            <MapPanel location={location || { lat: 18.5204, lng: 73.8567 }} facilities={facilities.slice(0, 3)} selectedFacility={selectedFacility || facilities[0]} onSelect={setSelectedFacility} />
          </div>

          <div className="services-box">
            <p>{currentText.services}</p>
            <ul>
              <li>✓ {currentText.language}</li>
              <li>✓ {currentText.voice}</li>
              <li>✓ {currentText.emergency}</li>
              <li>✓ {currentText.location}</li>
              <li>✓ {currentText.nearby}</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  )
}

function MapPanel({ location, facilities, selectedFacility, onSelect }) {
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) return undefined

    const map = L.map(mapRef.current).setView([location.lat, location.lng], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    L.circleMarker([location.lat, location.lng], {
      radius: 8,
      color: '#57c6c0',
      fillColor: '#57c6c0',
      fillOpacity: 1,
    }).addTo(map)

    facilities.forEach((facility) => {
      const marker = L.circleMarker([facility.lat, facility.lng], {
        radius: 8,
        color: facility.name === selectedFacility?.name ? '#ff5a5f' : '#ff9a5f',
        fillColor: facility.name === selectedFacility?.name ? '#ff5a5f' : '#ff9a5f',
        fillOpacity: 0.9,
      }).addTo(map)

      marker.bindPopup(`<strong>${facility.name}</strong><br>${facility.address}<br>${facility.distance} km`)
      marker.on('click', () => onSelect(facility))
    })

    return () => map.remove()
  }, [location, facilities, selectedFacility, onSelect])

  return <div ref={mapRef} className="map-view" />
}
