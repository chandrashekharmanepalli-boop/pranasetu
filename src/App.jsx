import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

const languages = [
  { id: 'en', label: 'English', locale: 'en-IN', sample: 'There has been a road accident, one person is unconscious.' },
  { id: 'hi', label: 'हिन्दी', locale: 'hi-IN', sample: 'सड़क दुर्घटना हुई है, एक व्यक्ति बेहोश है।' },
  { id: 'mr', label: 'मराठी', locale: 'mr-IN', sample: 'रस्त्यावर अपघात झाला आहे, एक व्यक्ती बेशुद्ध आहे.' },
  { id: 'te', label: 'తెలుగు', locale: 'te-IN', sample: 'రోడ్డు ప్రమాదం జరిగింది, ఒక వ్యక్తి స్పృహలో లేరు.' },
  { id: 'ta', label: 'தமிழ்', locale: 'ta-IN', sample: 'சாலை விபத்து ஏற்பட்டுள்ளது, ஒருவர் மயக்கத்தில் உள்ளார்.' },
  { id: 'bn', label: 'বাংলা', locale: 'bn-IN', sample: 'একটি সড়ক দুর্ঘটনা হয়েছে, একজন অচেতন।' },
  { id: 'kn', label: 'ಕನ್ನಡ', locale: 'kn-IN', sample: 'ರಸ್ತೆ ಅಪಘಾತ ಸಂಭವಿಸಿದೆ, ಒಬ್ಬರು ಪ್ರಜ್ಞಾಹೀನರಾಗಿದ್ದಾರೆ.' },
  { id: 'gu', label: 'ગુજરાતી', locale: 'gu-IN', sample: 'રસ્તા પર અકસ્માત થયો છે, એક વ્યક્તિ બેભાન છે.' },
  { id: 'pa', label: 'ਪੰਜਾਬੀ', locale: 'pa-IN', sample: 'ਸੜਕ ਹਾਦਸਾ ਹੋਇਆ ਹੈ, ਇੱਕ ਵਿਅਕਤੀ ਬੇਹੋਸ਼ ਹੈ।' },
  { id: 'ur', label: 'اردو', locale: 'ur-IN', sample: 'سڑک پر حادثہ ہوا ہے، ایک شخص بے ہوش ہے۔' },
  { id: 'ml', label: 'മലയാളം', locale: 'ml-IN', sample: 'റോഡ് അപകടം സംഭവിച്ചു, ഒരാൾ ബോധരഹിതനാണ്.' },
]

function detectLanguage(text, fallback = 'en') {
  const ranges = [
    ['hi', /[\u0900-\u097F]/], ['bn', /[\u0980-\u09FF]/], ['pa', /[\u0A00-\u0A7F]/], ['gu', /[\u0A80-\u0AFF]/],
    ['ta', /[\u0B80-\u0BFF]/], ['te', /[\u0C00-\u0C7F]/], ['kn', /[\u0C80-\u0CFF]/], ['ml', /[\u0D00-\u0D7F]/],
  ]
  const match = ranges.find(([, pattern]) => pattern.test(text))
  if (match) return { id: match[0], confident: true }
  if (/\p{Script=Latin}/u.test(text)) return { id: 'en', confident: true }
  return { id: fallback, confident: false }
}

const hospitals = [
  { name: 'Ruby Hall Clinic', distance: '2.4 km', eta: '8 min', score: '96', reason: 'Cardiac care · fastest route' },
  { name: 'Jehangir Hospital', distance: '3.1 km', eta: '11 min', score: '91', reason: '24/7 emergency · ICU available' },
  { name: 'Sahyadri Hospital', distance: '4.8 km', eta: '16 min', score: '85', reason: 'Emergency care · live capacity unavailable' },
]

const flow = ['Landing', 'Login', 'Home', 'Emergency', 'Voice', 'Transcript', 'AI Analysis', 'Follow-up', 'GPS', 'Hospitals', 'Ranking', 'Map', 'Navigation', 'Tracking', 'Timeline', 'Command Center', 'Live Status', 'Resolved']
const interfaceCopy = {
  en: { hero: 'Emergency help, intelligently connected.', start: 'Start Emergency', greeting: 'Good morning, Aarav.', emergency: 'Emergency', speak: 'Speak for help' },
  hi: { hero: 'आपातकालीन सहायता, समझदारी से जुड़ी हुई।', start: 'आपातकाल शुरू करें', greeting: 'सुप्रभात, आरव।', emergency: 'आपातकाल', speak: 'मदद के लिए बोलें' },
  mr: { hero: 'आपत्कालीन मदत, हुशारीने जोडलेली.', start: 'आपत्काल सुरू करा', greeting: 'शुभ सकाळ, आरव.', emergency: 'आपत्काल', speak: 'मदतीसाठी बोला' },
  te: { hero: 'అత్యవసర సహాయం, తెలివిగా అనుసంధానించబడింది.', start: 'అత్యవసర పరిస్థితిని ప్రారంభించండి', greeting: 'శుభోదయం, ఆరవ్.', emergency: 'అత్యవసరం', speak: 'సహాయం కోసం మాట్లాడండి' },
  ta: { hero: 'அவசர உதவி, புத்திசாலித்தனமாக இணைக்கப்பட்டது.', start: 'அவசரத்தைத் தொடங்கு', greeting: 'காலை வணக்கம், ஆரவ்.', emergency: 'அவசரம்', speak: 'உதவிக்காக பேசுங்கள்' },
  bn: { hero: 'জরুরি সহায়তা, বুদ্ধিমত্তার সঙ্গে সংযুক্ত।', start: 'জরুরি অবস্থা শুরু করুন', greeting: 'সুপ্রভাত, আরভ।', emergency: 'জরুরি অবস্থা', speak: 'সাহায্যের জন্য বলুন' },
  kn: { hero: 'ತುರ್ತು ಸಹಾಯ, ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ಸಂಪರ್ಕಿಸಲಾಗಿದೆ.', start: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಪ್ರಾರಂಭಿಸಿ', greeting: 'ಶುಭೋದಯ, ಆರವ್.', emergency: 'ತುರ್ತು', speak: 'ಸಹಾಯಕ್ಕಾಗಿ ಮಾತನಾಡಿ' },
  gu: { hero: 'કટોકટીની મદદ, સમજદારીથી જોડાયેલી.', start: 'કટોકટી શરૂ કરો', greeting: 'સુપ્રભાત, આરવ.', emergency: 'કટોકટી', speak: 'મદદ માટે બોલો' },
  pa: { hero: 'ਐਮਰਜੈਂਸੀ ਮਦਦ, ਸਮਝਦਾਰੀ ਨਾਲ ਜੁੜੀ ਹੋਈ।', start: 'ਐਮਰਜੈਂਸੀ ਸ਼ੁਰੂ ਕਰੋ', greeting: 'ਸ਼ੁਭ ਸਵੇਰ, ਆਰਵ।', emergency: 'ਐਮਰਜੈਂਸੀ', speak: 'ਮਦਦ ਲਈ ਬੋਲੋ' },
  ur: { hero: 'ہنگامی مدد، سمجھداری سے منسلک۔', start: 'ہنگامی حالت شروع کریں', greeting: 'صبح بخیر، آرو۔', emergency: 'ہنگامی حالت', speak: 'مدد کے لیے بولیں' },
  ml: { hero: 'അടിയന്തര സഹായം, ബുദ്ധിപൂർവ്വം ബന്ധിപ്പിച്ചിരിക്കുന്നു.', start: 'അടിയന്തരാവസ്ഥ ആരംഭിക്കുക', greeting: 'സുപ്രഭാതം, ആരവ്.', emergency: 'അടിയന്തരാവസ്ഥ', speak: 'സഹായത്തിനായി സംസാരിക്കുക' },
}

const emergencyTranslations = {
  hi: {
    'Tell us what happened.': 'बताइए क्या हुआ है।', 'Speak naturally in': 'अपनी भाषा में सहज बोलें।', 'We heard you.': 'हमने आपकी बात सुनी।', 'Check the words below before we assess the situation.': 'आकलन से पहले नीचे लिखे शब्दों की जाँच करें।', 'Analyze emergency': 'आपातकाल का आकलन करें', 'This needs urgent care.': 'यह तत्काल सहायता की स्थिति है।', 'Answer two quick questions': 'दो छोटे सवालों के जवाब दें', 'Where are you right now?': 'आप अभी कहाँ हैं?', 'Capture my location': 'मेरी लोकेशन लें', 'See recommendations': 'सुझाव देखें', 'View live route': 'लाइव मार्ग देखें', 'Start navigation': 'नेविगेशन शुरू करें', 'View emergency timeline': 'आपातकाल की टाइमलाइन देखें', 'Open command center': 'कमांड सेंटर खोलें', 'Watch live status': 'लाइव स्थिति देखें', 'Mark as resolved': 'समाधान के रूप में दर्ज करें', 'Return to home': 'होम पर लौटें', 'Continue': 'जारी रखें', 'Next question': 'अगला सवाल', 'Capture location': 'लोकेशन लें', 'Use demo Pune location': 'डेमो पुणे लोकेशन इस्तेमाल करें', 'Use this location': 'यह लोकेशन इस्तेमाल करें', 'Nearby help is visible.': 'नज़दीकी सहायता दिखाई दे रही है।', 'Help has a clear path.': 'मदद का मार्ग तैयार है।', 'Go with confidence.': 'विश्वास के साथ आगे बढ़ें।', 'Your response team is moving.': 'आपकी सहायता टीम आ रही है।', 'Every step is accounted for.': 'हर कदम दर्ज किया जा रहा है।', 'The whole response, together.': 'पूरी प्रतिक्रिया एक साथ।', 'The handoff is happening.': 'सहायता का हस्तांतरण हो रहा है।', 'You are not alone.': 'आप अकेले नहीं हैं।', 'Are you safe?': 'क्या आप सुरक्षित हैं?', 'Possible crash detected.': 'संभावित दुर्घटना का पता चला।'
  },
  mr: {
    'Tell us what happened.': 'काय झाले ते सांगा.', 'We heard you.': 'आम्ही तुमचे म्हणणे ऐकले.', 'Check the words below before we assess the situation.': 'आकलन करण्यापूर्वी खालील शब्द तपासा.', 'Analyze emergency': 'आपत्कालाचे आकलन करा', 'This needs urgent care.': 'यासाठी तातडीची मदत आवश्यक आहे.', 'Answer two quick questions': 'दोन छोट्या प्रश्नांची उत्तरे द्या', 'Where are you right now?': 'तुम्ही सध्या कुठे आहात?', 'Capture my location': 'माझे स्थान मिळवा', 'See recommendations': 'शिफारसी पहा', 'View live route': 'लाइव्ह मार्ग पहा', 'Start navigation': 'नेव्हिगेशन सुरू करा', 'View emergency timeline': 'आपत्कालीन टाइमलाइन पहा', 'Open command center': 'कमांड सेंटर उघडा', 'Watch live status': 'लाइव्ह स्थिती पहा', 'Mark as resolved': 'निराकरण म्हणून नोंदवा', 'Return to home': 'होमवर परत जा', 'Continue': 'पुढे जा', 'Next question': 'पुढील प्रश्न', 'Capture location': 'स्थान मिळवा', 'Use demo Pune location': 'डेमो पुणे स्थान वापरा', 'Use this location': 'हे स्थान वापरा', 'Nearby help is visible.': 'जवळची मदत दिसत आहे.', 'Help has a clear path.': 'मदतीचा मार्ग तयार आहे.', 'Go with confidence.': 'विश्वासाने पुढे जा.', 'Your response team is moving.': 'तुमची मदत टीम येत आहे.', 'Every step is accounted for.': 'प्रत्येक पाऊल नोंदवले जात आहे.', 'The whole response, together.': 'संपूर्ण प्रतिसाद एकत्र.', 'The handoff is happening.': 'मदत हस्तांतरित होत आहे.', 'You are not alone.': 'तुम्ही एकटे नाही.', 'Are you safe?': 'तुम्ही सुरक्षित आहात का?', 'Possible crash detected.': 'संभाव्य अपघात आढळला.'
  }
}

const sharedTranslations = {
  hi: { 'Back to home': 'होम पर लौटें', 'Return to home': 'होम पर लौटें', 'DEMO / SIMULATED': 'डेमो / सिम्युलेटेड', 'Provider-backed actions are clearly separated from this walkthrough.': 'प्रदाता-आधारित कार्रवाइयों को इस डेमो से अलग दिखाया गया है।', 'Stop speaking': 'बोलना बंद करें', 'New conversation': 'नई बातचीत' },
  mr: { 'Back to home': 'होमवर परत जा', 'Return to home': 'होमवर परत जा', 'DEMO / SIMULATED': 'डेमो / सिम्युलेटेड', 'Provider-backed actions are clearly separated from this walkthrough.': 'प्रदाता-आधारित क्रिया या डेमोपासून वेगळ्या दाखवल्या आहेत.', 'Stop speaking': 'बोलणे थांबवा', 'New conversation': 'नवीन संभाषण' },
  te: { 'Tell us what happened.': 'ఏం జరిగిందో చెప్పండి.', 'We heard you.': 'మీ మాట మాకు వినిపించింది.', 'Analyze emergency': 'అత్యవసర పరిస్థితిని విశ్లేషించండి', 'This needs urgent care.': 'దీనికి తక్షణ వైద్యం అవసరం.', 'Answer two quick questions': 'రెండు చిన్న ప్రశ్నలకు సమాధానం ఇవ్వండి', 'Where are you right now?': 'మీరు ప్రస్తుతం ఎక్కడ ఉన్నారు?', 'Capture location': 'స్థానాన్ని పొందండి', 'See recommendations': 'సిఫార్సులను చూడండి', 'View live route': 'ప్రత్యక్ష మార్గాన్ని చూడండి', 'Start navigation': 'నావిగేషన్ ప్రారంభించండి', 'Open command center': 'కమాండ్ సెంటర్ తెరవండి', 'Watch live status': 'ప్రత్యక్ష స్థితిని చూడండి', 'Mark as resolved': 'పరిష్కరించబడినదిగా గుర్తించండి', Continue: 'కొనసాగించండి' },
  ta: { 'Tell us what happened.': 'என்ன நடந்தது என்று சொல்லுங்கள்.', 'We heard you.': 'நாங்கள் உங்கள் தகவலைக் கேட்டோம்.', 'Analyze emergency': 'அவசரநிலையை ஆய்வு செய்', 'This needs urgent care.': 'இதற்கு உடனடி சிகிச்சை தேவை.', 'Answer two quick questions': 'இரண்டு கேள்விகளுக்கு பதிலளிக்கவும்', 'Where are you right now?': 'நீங்கள் இப்போது எங்கே இருக்கிறீர்கள்?', 'Capture location': 'இருப்பிடத்தைப் பெறுக', 'See recommendations': 'பரிந்துரைகளைக் காண்க', 'View live route': 'நேரடி வழியைக் காண்க', 'Start navigation': 'வழிசெலுத்தலைத் தொடங்கு', 'Open command center': 'கட்டுப்பாட்டு மையத்தைத் திற', 'Watch live status': 'நேரடி நிலையைப் பார்க்கவும்', 'Mark as resolved': 'தீர்வு எனக் குறிக்கவும்', Continue: 'தொடரவும்' },
  bn: { 'Tell us what happened.': 'কি ঘটেছে বলুন।', 'We heard you.': 'আমরা আপনার কথা শুনেছি।', 'Analyze emergency': 'জরুরি অবস্থা বিশ্লেষণ করুন', 'This needs urgent care.': 'এর জন্য জরুরি চিকিৎসা প্রয়োজন।', 'Answer two quick questions': 'দুটি প্রশ্নের উত্তর দিন', 'Where are you right now?': 'আপনি এখন কোথায় আছেন?', 'Capture location': 'অবস্থান নিন', 'See recommendations': 'সুপারিশ দেখুন', 'View live route': 'লাইভ রুট দেখুন', 'Start navigation': 'ন্যাভিগেশন শুরু করুন', 'Open command center': 'কমান্ড সেন্টার খুলুন', 'Watch live status': 'লাইভ অবস্থা দেখুন', 'Mark as resolved': 'সমাধান হিসেবে চিহ্নিত করুন', Continue: 'চালিয়ে যান' },
  kn: { 'Tell us what happened.': 'ಏನಾಯಿತು ಎಂದು ಹೇಳಿ.', 'We heard you.': 'ನಿಮ್ಮ ಮಾತು ನಮಗೆ ಕೇಳಿಸಿತು.', 'Analyze emergency': 'ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ', 'This needs urgent care.': 'ಇದಕ್ಕೆ ತಕ್ಷಣದ ಆರೈಕೆ ಅಗತ್ಯವಿದೆ.', 'Answer two quick questions': 'ಎರಡು ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ', 'Where are you right now?': 'ನೀವು ಈಗ ಎಲ್ಲಿದ್ದೀರಿ?', 'Capture location': 'ಸ್ಥಳವನ್ನು ಪಡೆಯಿರಿ', 'See recommendations': 'ಶಿಫಾರಸುಗಳನ್ನು ನೋಡಿ', 'View live route': 'ಲೈವ್ ಮಾರ್ಗವನ್ನು ನೋಡಿ', 'Start navigation': 'ನ್ಯಾವಿಗೇಶನ್ ಪ್ರಾರಂಭಿಸಿ', 'Open command center': 'ಕಮಾಂಡ್ ಸೆಂಟರ್ ತೆರೆಯಿರಿ', 'Watch live status': 'ಲೈವ್ ಸ್ಥಿತಿಯನ್ನು ನೋಡಿ', 'Mark as resolved': 'ಪರಿಹರಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ', Continue: 'ಮುಂದುವರಿಸಿ' },
  gu: { 'Tell us what happened.': 'શું થયું તે કહો.', 'We heard you.': 'અમે તમારી વાત સાંભળી.', 'Analyze emergency': 'કટોકટીનું વિશ્લેષણ કરો', 'This needs urgent care.': 'આ માટે તાત્કાલિક સારવાર જરૂરી છે.', 'Answer two quick questions': 'બે પ્રશ્નોના જવાબ આપો', 'Where are you right now?': 'તમે અત્યારે ક્યાં છો?', 'Capture location': 'સ્થાન મેળવો', 'See recommendations': 'ભલામણો જુઓ', 'View live route': 'લાઇવ માર્ગ જુઓ', 'Start navigation': 'નેવિગેશન શરૂ કરો', 'Open command center': 'કમાન્ડ સેન્ટર ખોલો', 'Watch live status': 'લાઇવ સ્થિતિ જુઓ', 'Mark as resolved': 'ઉકેલાયેલ તરીકે ચિહ્નિત કરો', Continue: 'ચાલુ રાખો' },
  pa: { 'Tell us what happened.': 'ਦੱਸੋ ਕੀ ਹੋਇਆ।', 'We heard you.': 'ਅਸੀਂ ਤੁਹਾਡੀ ਗੱਲ ਸੁਣੀ।', 'Analyze emergency': 'ਐਮਰਜੈਂਸੀ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ', 'This needs urgent care.': 'ਇਸ ਲਈ ਤੁਰੰਤ ਦੇਖਭਾਲ ਦੀ ਲੋੜ ਹੈ।', 'Answer two quick questions': 'ਦੋ ਸਵਾਲਾਂ ਦੇ ਜਵਾਬ ਦਿਓ', 'Where are you right now?': 'ਤੁਸੀਂ ਇਸ ਵੇਲੇ ਕਿੱਥੇ ਹੋ?', 'Capture location': 'ਟਿਕਾਣਾ ਲਵੋ', 'See recommendations': 'ਸਿਫ਼ਾਰਸ਼ਾਂ ਵੇਖੋ', 'View live route': 'ਲਾਈਵ ਰਸਤਾ ਵੇਖੋ', 'Start navigation': 'ਨੈਵੀਗੇਸ਼ਨ ਸ਼ੁਰੂ ਕਰੋ', 'Open command center': 'ਕਮਾਂਡ ਸੈਂਟਰ ਖੋਲ੍ਹੋ', 'Watch live status': 'ਲਾਈਵ ਸਥਿਤੀ ਵੇਖੋ', 'Mark as resolved': 'ਹੱਲ ਕੀਤਾ ਚਿੰਨ੍ਹਿਤ ਕਰੋ', Continue: 'ਜਾਰੀ ਰੱਖੋ' },
  ur: { 'Tell us what happened.': 'بتائیں کیا ہوا ہے۔', 'We heard you.': 'ہم نے آپ کی بات سن لی۔', 'Analyze emergency': 'ہنگامی حالت کا تجزیہ کریں', 'This needs urgent care.': 'اس کے لیے فوری نگہداشت ضروری ہے۔', 'Answer two quick questions': 'دو مختصر سوالوں کے جواب دیں', 'Where are you right now?': 'آپ اس وقت کہاں ہیں؟', 'Capture location': 'مقام حاصل کریں', 'See recommendations': 'سفارشات دیکھیں', 'View live route': 'لائیو راستہ دیکھیں', 'Start navigation': 'نیویگیشن شروع کریں', 'Open command center': 'کمانڈ سینٹر کھولیں', 'Watch live status': 'لائیو صورتحال دیکھیں', 'Mark as resolved': 'حل شدہ نشان زد کریں', Continue: 'جاری رکھیں' },
  ml: { 'Tell us what happened.': 'എന്താണ് സംഭവിച്ചതെന്ന് പറയൂ.', 'We heard you.': 'ഞങ്ങൾ നിങ്ങളുടെ വാക്കുകൾ കേട്ടു.', 'Analyze emergency': 'അടിയന്തരാവസ്ഥ വിശകലനം ചെയ്യുക', 'This needs urgent care.': 'ഇതിന് അടിയന്തര പരിചരണം ആവശ്യമാണ്.', 'Answer two quick questions': 'രണ്ട് ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക', 'Where are you right now?': 'നിങ്ങൾ ഇപ്പോൾ എവിടെയാണ്?', 'Capture location': 'സ്ഥാനം നേടുക', 'See recommendations': 'ശുപാർശകൾ കാണുക', 'View live route': 'തത്സമയ വഴി കാണുക', 'Start navigation': 'നാവിഗേഷൻ ആരംഭിക്കുക', 'Open command center': 'കമാൻഡ് സെന്റർ തുറക്കുക', 'Watch live status': 'തത്സമയ നില കാണുക', 'Mark as resolved': 'പരിഹരിച്ചതായി അടയാളപ്പെടുത്തുക', Continue: 'തുടരുക', 'Stop speaking': 'സംസാരം നിർത്തുക', 'New conversation': 'പുതിയ സംഭാഷണം' },
}

function translateEmergency(text) { const language = window.localStorage.getItem('pranasetu-language') || 'en'; return emergencyTranslations[language]?.[text] || sharedTranslations[language]?.[text] || text }

function Logo() {
  return <div className="logo-lockup"><span className="logo-mark"><svg viewBox="0 0 46 46" aria-hidden="true"><path d="M8 30c6.5 0 6.5-12 13-12s6.5 12 13 12" /><path className="logo-pulse" d="M18.5 18 22 11l3.5 7" /><circle cx="22" cy="10" r="2.4" /></svg></span><span><strong>PranaSetu</strong><small>bridge of life</small></span><LanguageButton /><ThemeButton /></div>
}

function LanguageButton() { const [value, setValue] = useState(() => window.localStorage.getItem('pranasetu-language') || 'en'); useEffect(() => { const handleLanguageChange = (event) => setValue(event.detail); window.addEventListener('pranasetu-language-change', handleLanguageChange); return () => window.removeEventListener('pranasetu-language-change', handleLanguageChange) }, []); const changeLanguage = (nextLanguage) => { setValue(nextLanguage); window.localStorage.setItem('pranasetu-language', nextLanguage); window.dispatchEvent(new CustomEvent('pranasetu-language-change', { detail: nextLanguage })) }; return <select className="global-language-select" aria-label="Change website language" value={value} onChange={(event) => changeLanguage(event.target.value)}>{languages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select> }
function BackButton({ onBack }) { return <button className="back-button" onClick={onBack || (() => window.pranaSetuBack?.())} aria-label="Go back" title="Go back"><span aria-hidden="true">←</span><span>Back</span></button> }

function ThemeButton() { const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem('pranasetu-theme') === 'dark'); const toggle = () => { const next = !darkMode; setDarkMode(next); document.documentElement.dataset.theme = next ? 'dark' : 'light'; window.localStorage.setItem('pranasetu-theme', next ? 'dark' : 'light') }; return <button className="theme-button" onClick={toggle} aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'} title={darkMode ? 'Light theme' : 'Dark theme'}>{darkMode ? '☀' : '◐'}<span>{darkMode ? 'Light' : 'Dark'}</span></button> }

function App() {
  const [screen, setScreen] = useState('landing')
  const [showIntro, setShowIntro] = useState(true)
  const [language, setLanguage] = useState(() => window.localStorage.getItem('pranasetu-language') || 'en')
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [location, setLocation] = useState(null)
  const conversationRef = useRef([])
  const [conversationId, setConversationId] = useState(() => window.localStorage.getItem('pranasetu-conversation-id') || '')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [darkMode] = useState(() => window.localStorage.getItem('pranasetu-theme') === 'dark')
  const [answer, setAnswer] = useState('')
  const [timeline, setTimeline] = useState([])
  const [crashMode, setCrashMode] = useState(false)
  const [countdown, setCountdown] = useState(15)
  const [backendOnline, setBackendOnline] = useState(false)
  const [motionEnabled, setMotionEnabled] = useState(() => window.localStorage.getItem('pranasetu-guardian-enabled') !== 'false')
  const [motionMode, setMotionMode] = useState(() => window.localStorage.getItem('pranasetu-guardian-mode') || 'pending')
  const motionWindow = useRef([])
  const lastOrientation = useRef(null)
  const [emergencyId, setEmergencyId] = useState(null)
  const [autoEscalated, setAutoEscalated] = useState(false)
  const locationWatch = useRef(null)
  const escalationStarted = useRef(false)
  const escalateRef = useRef(null)
  const crashTestRef = useRef(null)

  const selectedLanguage = languages.find((item) => item.id === language)
  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  const speakReply = (reply, replyLanguage) => {
    if (!window.speechSynthesis || !reply) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(reply)
    utterance.lang = replyLanguage.locale
    utterance.rate = 0.96
    window.speechSynthesis.speak(utterance)
  }

  const askPranaSetuAI = async (message, replyLanguage) => {
    conversationRef.current = [...conversationRef.current, { role: 'user', content: message }]
    try {
      const response = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, language: replyLanguage.id, conversationId }) })
      if (!response.ok) throw new Error('AI service unavailable')
      const result = await response.json()
      setConversationId(result.conversationId || conversationId)
      window.localStorage.setItem('pranasetu-conversation-id', result.conversationId || conversationId)
      conversationRef.current = [...conversationRef.current, { role: 'assistant', content: result.reply }]
      speakReply(result.reply, replyLanguage)
      return result.reply
    } catch {
      const fallback = aiResponses[replyLanguage.id] || aiResponses.en
      conversationRef.current = [...conversationRef.current, { role: 'assistant', content: fallback.play }]
      speakReply(fallback.play, replyLanguage)
      return fallback.play
    }
  }
  const acceptTranscript = (text) => {
    const detection = detectLanguage(text, language)
    const replyLanguage = languages.find((item) => item.id === detection.id) || selectedLanguage
    setTranscript(text)
    window.localStorage.setItem('pranasetu-response-language', detection.id)
    if (detection.confident && detection.id !== language) changeLanguage(detection.id)
    askPranaSetuAI(text, replyLanguage)
    setScreen('transcript')
  }

  useEffect(() => {
    window.localStorage.setItem('pranasetu-language', language)
  }, [language])

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage)
    window.localStorage.setItem('pranasetu-language', nextLanguage)
    window.dispatchEvent(new CustomEvent('pranasetu-language-change', { detail: nextLanguage }))
  }

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
    recognition.onresult = (event) => { window.pranaSetuAcceptTranscript?.(event.results[0][0].transcript); setIsListening(false) }
    recognition.onerror = () => { window.pranaSetuAcceptTranscript?.(selectedLanguage.sample); setIsListening(false) }
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
    const handleHelpClick = (event) => { if (event.target.closest('button')?.textContent.includes('Send Help')) escalateRef.current?.('User selected Send Help · demo escalation confirmed') }
    document.addEventListener('click', handleHelpClick, true)
    return () => document.removeEventListener('click', handleHelpClick, true)
  }, [crashMode, screen])

  useEffect(() => {
    if (!motionEnabled || screen !== 'home') return undefined
    const handleMotion = (event) => {
      const acceleration = event.acceleration || event.accelerationIncludingGravity
      const rotation = event.rotationRate
      if (!acceleration && !rotation) return
      const accelerationEnergy = Math.sqrt((acceleration?.x || 0) ** 2 + (acceleration?.y || 0) ** 2 + (acceleration?.z || 0) ** 2)
      const rotationEnergy = Math.sqrt((rotation?.alpha || 0) ** 2 + (rotation?.beta || 0) ** 2 + (rotation?.gamma || 0) ** 2)
      const highShake = accelerationEnergy > 18 || rotationEnergy > 160
      const now = Date.now()
      motionWindow.current = [...motionWindow.current.filter((time) => now - time < 700), ...(highShake ? [now] : [])]
      if (motionWindow.current.length >= 2) { motionWindow.current = []; crashTestRef.current?.() }
    }
    const handleOrientation = (event) => {
      const current = { alpha: event.alpha || 0, beta: event.beta || 0, gamma: event.gamma || 0 }
      if (!lastOrientation.current) { lastOrientation.current = current; return }
      const change = Math.abs(current.alpha - lastOrientation.current.alpha) + Math.abs(current.beta - lastOrientation.current.beta) + Math.abs(current.gamma - lastOrientation.current.gamma)
      lastOrientation.current = current
      if (change < 45) return
      const now = Date.now()
      motionWindow.current = [...motionWindow.current.filter((time) => now - time < 700), now]
      if (motionWindow.current.length >= 2) { motionWindow.current = []; crashTestRef.current?.() }
    }
    window.addEventListener('devicemotion', handleMotion)
    window.addEventListener('deviceorientation', handleOrientation)
    return () => { window.removeEventListener('devicemotion', handleMotion); window.removeEventListener('deviceorientation', handleOrientation); lastOrientation.current = null }
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
      const fallbackLocation = { lat: 18.5204, lng: 73.8567, accuracy: null, label: 'Pune, Maharashtra · DEMO fallback' }
      const emergencyLocation = await new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(fallbackLocation); return }
        navigator.geolocation.getCurrentPosition((position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy, label: 'Current device location' }), () => resolve(fallbackLocation), { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 })
      })
      setLocation({ ...emergencyLocation, escalation: true, notificationStatus: 'sending' })
      addEvent(event)
      const payload = { source: 'AUTO_CRASH_DETECTION', severity: 'CRITICAL', status: 'REPORTED', language, autoEscalated: true, userResponse: 'NO_RESPONSE', description: 'Possible crash detected; no safety response received.', location: emergencyLocation }
      try {
        const response = await fetch('/api/emergencies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const incident = await response.json()
        setEmergencyId(incident.id)
        const notification = await fetch('/api/notifications/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emergencyId: incident.id, channels: ['HOSPITAL_COORDINATION', 'POLICE_STATION', 'EMERGENCY_CONTACTS'], location: emergencyLocation }) })
        const notificationResult = notification.ok ? await notification.json() : null
        setLocation((previous) => ({ ...(previous || emergencyLocation), escalation: true, notificationStatus: notification.ok ? 'prepared' : 'failed', notificationChannels: notificationResult?.channels || [] }))
        if (notification.ok && 'Notification' in window) { const showNotification = () => new Notification('PranaSetu · DEMO notification prepared', { body: 'No real emergency message was sent. Contacts require a configured provider.', tag: incident.id }); if (Notification.permission === 'granted') showNotification(); else if (Notification.permission === 'default') Notification.requestPermission().then((permission) => { if (permission === 'granted') showNotification() }) }
        addEvent(notification.ok ? 'DEMO notification prepared · no real message sent' : 'Notification service unavailable · retry required')
      } catch {
        addEvent('Coordination server unavailable · emergency retained locally')
      }
      setScreen('gps')
    }
  const beginEmergency = () => { escalationStarted.current = false; setAutoEscalated(false); setEmergencyId(null); if (navigator.vibrate) navigator.vibrate([180, 100, 180]); if (window.speechSynthesis) { window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(aiResponses[language]?.prompt || aiResponses.en.prompt); utterance.lang = selectedLanguage.locale; window.speechSynthesis.speak(utterance) }; addEvent('Emergency started · voice intake opened'); setScreen('voice') }
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
      if (permission !== 'granted') { setMotionMode('demo'); setMotionEnabled(true); window.localStorage.setItem('pranasetu-guardian-enabled', 'true'); window.localStorage.setItem('pranasetu-guardian-mode', 'demo'); return }
    }
    const nextMode = typeof DeviceMotionEvent !== 'undefined' ? 'sensor' : typeof DeviceOrientationEvent !== 'undefined' ? 'orientation' : 'demo'
    setMotionMode(nextMode)
    setMotionEnabled(true)
    window.localStorage.setItem('pranasetu-guardian-enabled', 'true')
    window.localStorage.setItem('pranasetu-guardian-mode', nextMode)
  }
  const currentFlowIndex = useMemo(() => flow.findIndex((item) => item.toLowerCase().replaceAll(' ', '-') === screen), [screen])
  const goBack = () => {
    const activeEmergency = ['voice', 'transcript', 'analysis', 'follow-up', 'gps', 'hospitals', 'ranking', 'map', 'navigation', 'tracking', 'timeline', 'command', 'live-status', 'crash-countdown'].includes(screen)
    if (activeEmergency && !window.confirm('Leave the active emergency flow? Current demo progress may be lost.')) return
    if (screen === 'login' || screen === 'signup' || screen === 'home' || screen === 'command-center') { setScreen(screen === 'home' ? 'landing' : screen === 'command-center' ? 'landing' : 'landing'); return }
    if (['guardian', 'devices', 'map-home', 'hospitals-home', 'contacts', 'profile', 'incidents', 'responder', 'admin', 'settings', 'privacy'].includes(screen)) { setScreen('home'); return }
    const previous = { transcript: 'voice', analysis: 'transcript', 'follow-up': 'analysis', gps: 'follow-up', hospitals: 'gps', ranking: 'hospitals', map: 'ranking', navigation: 'map', tracking: 'navigation', timeline: 'tracking', command: 'timeline', 'live-status': 'command', 'crash-countdown': 'home' }[screen]
    setScreen(previous || 'home')
  }
  useEffect(() => {
    escalateRef.current = (event) => escalateEmergency(event)
    crashTestRef.current = () => startCrashTest()
  })
  useEffect(() => {
    window.pranaSetuBack = goBack
    window.pranaSetuAcceptTranscript = acceptTranscript
    window.pranaSetuNewConversation = () => { conversationRef.current = []; setConversationId(''); window.localStorage.removeItem('pranasetu-conversation-id') }
    window.pranaSetuAskAgain = () => { window.speechSynthesis?.cancel(); setScreen('voice') }
    return () => {
      delete window.pranaSetuBack
      delete window.pranaSetuAcceptTranscript
      delete window.pranaSetuNewConversation
      delete window.pranaSetuAskAgain
    }
  })

  if (showIntro) return <IntroPoster onSkip={() => setShowIntro(false)} />

  if (screen === 'landing') return <Landing language={language} setLanguage={changeLanguage} copy={interfaceCopy[language] || interfaceCopy.en} onContinue={() => setScreen('login')} onConsole={() => setScreen('command-center')} />
  if (screen === 'login') return <Login onLogin={() => setScreen('home')} onBack={goBack} />
  if (screen === 'home') return <Home copy={interfaceCopy[language] || interfaceCopy.en} backendOnline={backendOnline} motionEnabled={motionEnabled} motionMode={motionMode} onEnableMotion={enableMotionMonitor} onEmergency={beginEmergency} onCrash={startCrashTest} onOpen={(page) => setScreen(page)} />
  if (['guardian', 'devices', 'map-home', 'hospitals-home', 'contacts', 'profile', 'incidents', 'responder', 'admin', 'settings', 'privacy', 'signup'].includes(screen)) return <PortalPage page={screen} onBack={goBack} onEmergency={beginEmergency} onCrash={startCrashTest} />
  if (screen === 'command-center') return <OperationsCenter onExit={() => setScreen('landing')} />

  return <div className="app-shell incident-shell"><header className="incident-header"><Logo /><div className="flow-progress"><span>Active emergency</span><div><i style={{ width: `${Math.max(8, (currentFlowIndex / (flow.length - 1)) * 100)}%` }} /></div></div><button className="quiet-button" onClick={() => setScreen('home')}>Exit to home</button></header><main className="incident-main">{screen === 'voice' && <Voice language={selectedLanguage} isListening={isListening} onListen={() => setIsListening(true)} onDemo={() => { setTranscript(selectedLanguage.sample); setScreen('transcript') }} />}{screen === 'transcript' && <Transcript text={transcript} language={selectedLanguage} onContinue={() => { addEvent('Transcript understood · chest pain detected'); setScreen('analysis') }} />}{screen === 'analysis' && <Analysis language={selectedLanguage} onContinue={() => setScreen('follow-up')} />}{screen === 'follow-up' && <FollowUp index={questionIndex} answer={answer} setAnswer={setAnswer} onSubmit={submitAnswer} />}{screen === 'gps' && <Gps location={location} onLocate={locate} />}{screen === 'hospitals' && <HospitalSearch onContinue={() => setScreen('ranking')} />}{screen === 'ranking' && <Ranking onContinue={() => { addEvent('Ruby Hall Clinic recommended · 96% match'); setScreen('map') }} />}{screen === 'map' && <MapView location={location} onContinue={() => setScreen('navigation')} />}{screen === 'navigation' && <Navigation onContinue={() => { addEvent('Route started to Ruby Hall Clinic'); setScreen('tracking') }} />}{screen === 'tracking' && <Tracking onContinue={() => { addEvent('Responder accepted · Ruby Hall Clinic notified'); setScreen('timeline') }} />}{screen === 'timeline' && <Timeline events={timeline} onContinue={() => setScreen('command')} />}{screen === 'command' && <CommandCenter onContinue={() => setScreen('live-status')} />}{screen === 'live-status' && <LiveStatus onContinue={() => { addEvent('Patient stable · hospital handoff complete'); setScreen('resolved') }} />}{screen === 'resolved' && <Resolved onReset={() => { setTimeline([]); setQuestionIndex(0); setScreen('home') }} />}{screen === 'crash-countdown' && <CrashCountdown language={selectedLanguage} countdown={countdown} onCancel={() => { setCrashMode(false); addEvent('Crash alert dismissed by user'); setScreen('home') }} onSendHelp={() => { setCrashMode(false); addEvent('User selected Send Help · automatic emergency confirmed'); setScreen('gps') }} />}</main><div className="privacy-strip">{backendOnline ? '● Coordination service connected' : '○ Demo mode · coordination service offline'} <span>Private and encrypted</span></div></div>
}

function IntroPoster({ onSkip }) { return <div className="intro-poster"><div className="intro-grid" /><div className="intro-orbit intro-orbit-one" /><div className="intro-orbit intro-orbit-two" /><div className="intro-content"><div className="intro-logo"><svg viewBox="0 0 46 46" aria-hidden="true"><path d="M8 30c6.5 0 6.5-12 13-12s6.5 12 13 12" /><path className="intro-pulse" d="M18.5 18 22 11l3.5 7" /><circle cx="22" cy="10" r="2.4" /></svg></div><p className="intro-overline">AI EMERGENCY RESPONSE</p><h1>Prana<span>Setu</span></h1><p className="intro-tagline">Speak. Locate. Respond.</p><div className="intro-loader"><i /><i /><i /></div></div><button className="intro-skip" onClick={onSkip}>Skip intro</button><small className="intro-footer">A bridge to life · 24 / 7 coordination</small></div> }

function Landing({ language, setLanguage, copy, onContinue, onConsole }) { return <div className="landing"><div className="landing-nav"><Logo /><nav className="landing-links"><a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#safety">Safety</a><button onClick={onConsole}>Open Emergency Console</button></nav><span className="language-caption">Choose language</span><select aria-label="Choose language" value={language} onChange={(event) => setLanguage(event.target.value)}>{languages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div><div className="landing-hero"><div className="hero-copy"><p className="eyebrow coral-text">SPEAK · LOCATE · RESPOND</p><h1>{copy.hero}</h1><p className="hero-sub">PranaSetu understands your emergency, identifies your location, finds suitable nearby medical facilities, and coordinates the next response in your language.</p><button className="primary-button" onClick={onContinue}>{copy.start} <span>→</span></button><p className="trust-line"><span>✦</span> Built for calm decisions under pressure</p></div><div className="hero-visual"><div className="pulse-orbit orbit-one" /><div className="pulse-orbit orbit-two" /><div className="hero-pin"><svg viewBox="0 0 46 46" aria-hidden="true"><path d="M8 30c6.5 0 6.5-12 13-12s6.5 12 13 12" /><path className="logo-pulse" d="M18.5 18 22 11l3.5 7" /><circle cx="22" cy="10" r="2.4" /></svg></div><span className="hero-label label-you">You are here</span><span className="hero-label label-help">Help is on the way</span><div className="hero-status-card"><span className="status-pulse" /><small>PRANASETU AI · SYSTEM READY</small><strong>Emergency response<br />coordinated</strong><b>3 hospitals nearby</b></div></div></div><div className="landing-footer"><span>24 / 7 emergency coordination</span><span>English · हिन्दी · मराठी</span><span>© 2026 PranaSetu</span></div></div> }
function Login({ onLogin, onBack }) { return <div className="login-page"><div className="login-panel"><BackButton onBack={onBack} /><Logo /><p className="eyebrow">YOUR CARE CIRCLE</p><h1>Welcome back.</h1><p>Sign in to stay connected to the people who matter.</p><label>Mobile number<input placeholder="+91 00000 00000" /></label><button className="primary-button full" onClick={onLogin}>Continue securely <span>→</span></button><button className="demo-link" onClick={onLogin}>Use demo access</button><small className="secure-note">⌾ Your information stays private and encrypted.</small></div></div> }
function ScreenFrame({ eyebrow, title, description, children, action, actionLabel = 'Continue' }) { return <div className="screen-frame"><BackButton /><div className="screen-heading"><p className="eyebrow coral-text">{translateEmergency(eyebrow)}</p><h1>{translateEmergency(title)}</h1><p>{translateEmergency(description)}</p></div>{children}<button className="primary-button" onClick={action}>{translateEmergency(actionLabel)} <span>→</span></button></div> }
function Voice({ language, isListening, onListen, onDemo, onText }) { const voiceDescription = language.id === 'hi' ? 'हिंदी में सहज बोलें। हम महत्वपूर्ण जानकारी सुनेंगे।' : language.id === 'mr' ? 'मराठीत सहज बोला. आम्ही महत्त्वाची माहिती ऐकू.' : `Speak naturally in ${language.label}. We will listen for the details that matter.`; const listenLabel = language.id === 'hi' ? 'सुनना शुरू करें' : language.id === 'mr' ? 'ऐकणे सुरू करा' : 'Start speaking'; const demoLabel = language.id === 'hi' ? 'डेमो आवाज़ उपयोग करें' : language.id === 'mr' ? 'डेमो आवाज वापरा' : 'Use demo voice transcript'; const [text, setText] = useState(''); const submitText = () => { if (text.trim()) (onText || window.pranaSetuAcceptTranscript)?.(text.trim()) }; const submitDemo = () => { if (window.pranaSetuAcceptTranscript) window.pranaSetuAcceptTranscript(language.sample); else onDemo() }; const stopSpeech = () => window.speechSynthesis?.cancel(); const newConversation = () => window.pranaSetuNewConversation?.(); return <ScreenFrame eyebrow="VOICE INTAKE" title="Tell us what happened." description={voiceDescription} action={onListen} actionLabel={isListening ? 'Listening…' : listenLabel}><div className={isListening ? 'voice-orb listening' : 'voice-orb'}><span className="voice-wave">〰</span><small>{isListening ? 'Listening for your emergency' : 'Your voice is your fastest route to help'}</small></div><textarea className="emergency-text-input" value={text} onChange={(event) => setText(event.target.value)} placeholder="Type what happened in any supported language" aria-label="Describe the emergency" /><button className="secondary-button" onClick={submitText}>Send typed report <span>→</span></button><button className="secondary-button" onClick={submitDemo}>{demoLabel} <span>⌁</span></button><div className="assistant-controls"><button className="secondary-button" onClick={stopSpeech}>{translateEmergency('Stop speaking')}</button><button className="secondary-button" onClick={newConversation}>{translateEmergency('New conversation')}</button></div><p className="ai-demo-reply">PranaSetu AI ready · replies in {language.label}.</p></ScreenFrame> }
function Transcript({ text, language, notice, onContinue }) { const detectedId = window.localStorage.getItem('pranasetu-response-language'); const responseLanguage = languages.find((item) => item.id === detectedId) || language; const askAgain = () => window.pranaSetuAskAgain?.(); return <ScreenFrame eyebrow="TRANSCRIPT" title="We heard you." description="Check the words below before we assess the situation." action={onContinue} actionLabel="Analyze emergency"><div className="transcript-box"><span className="quote-mark">“</span><p>{text}</p><span className="transcript-meta">Detected language · {responseLanguage.label} <b>✓</b></span>{notice && <small className="language-notice">{notice}</small>}</div><button className="secondary-button assistant-ask-again" onClick={askAgain}>Ask another question</button></ScreenFrame> }
const aiResponses = {
  en: { prompt: 'Emergency activated. Tell us what happened.', title: 'This needs urgent care.', summary: 'This situation may require immediate professional medical assistance.', play: 'A nearby emergency facility has been identified. Please follow the recommended route.' },
  hi: { prompt: 'आपातकाल शुरू हो गया है। बताइए क्या हुआ।', title: 'यह तत्काल सहायता की स्थिति है।', summary: 'यह स्थिति तुरंत पेशेवर चिकित्सा सहायता की मांग कर सकती है।', play: 'एक नजदीकी आपातकालीन सुविधा की पहचान की गई है। कृपया सुझाए गए मार्ग का पालन करें।' },
  mr: { prompt: 'आपत्काल सुरू झाला आहे. काय झाले ते सांगा.', title: 'यासाठी तातडीची मदत आवश्यक आहे.', summary: 'या परिस्थितीत त्वरित व्यावसायिक वैद्यकीय मदतीची गरज असू शकते.', play: 'जवळची आपत्कालीन सुविधा शोधण्यात आली आहे. कृपया सुचवलेल्या मार्गाचा वापर करा.' },
  te: { prompt: 'అత్యవసర పరిస్థితి ప్రారంభమైంది. ఏమి జరిగిందో చెప్పండి.', title: 'దీనికి తక్షణ సహాయం అవసరం.', summary: 'ఈ పరిస్థితికి తక్షణ వైద్య సహాయం అవసరం కావచ్చు.', play: 'మీ సమీపంలో అత్యవసర వైద్య కేంద్రం గుర్తించబడింది. సూచించిన మార్గాన్ని అనుసరించండి.' },
  ta: { prompt: 'அவசரநிலை தொடங்கியது. என்ன நடந்தது என்று சொல்லுங்கள்.', title: 'இதற்கு உடனடி உதவி தேவை.', summary: 'இந்த நிலைமைக்கு உடனடி மருத்துவ உதவி தேவைப்படலாம்.', play: 'அருகிலுள்ள அவசர மருத்துவ வசதி கண்டறியப்பட்டுள்ளது. பரிந்துரைக்கப்பட்ட வழியைப் பின்பற்றுங்கள்.' },
  bn: { prompt: 'জরুরি অবস্থা শুরু হয়েছে। কী ঘটেছে বলুন।', title: 'এটির জন্য জরুরি চিকিৎসা সহায়তা প্রয়োজন।', summary: 'এই পরিস্থিতিতে অবিলম্বে পেশাদার চিকিৎসা সহায়তার প্রয়োজন হতে পারে।', play: 'আপনার কাছাকাছি একটি জরুরি চিকিৎসা কেন্দ্র পাওয়া গেছে। প্রস্তাবিত পথ অনুসরণ করুন।' },
  kn: { prompt: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಪ್ರಾರಂಭವಾಗಿದೆ. ಏನಾಯಿತು ಎಂದು ಹೇಳಿ.', title: 'ಇದಕ್ಕೆ ತಕ್ಷಣದ ಸಹಾಯ ಅಗತ್ಯವಿದೆ.', summary: 'ಈ ಪರಿಸ್ಥಿತಿಗೆ ತಕ್ಷಣದ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಬೇಕಾಗಬಹುದು.', play: 'ನಿಮ್ಮ ಸಮೀಪದ ತುರ್ತು ವೈದ್ಯಕೀಯ ಕೇಂದ್ರವನ್ನು ಗುರುತಿಸಲಾಗಿದೆ. ಸೂಚಿಸಿದ ಮಾರ್ಗವನ್ನು ಅನುಸರಿಸಿ.' },
  gu: { prompt: 'કટોકટી શરૂ થઈ છે. શું થયું તે કહો.', title: 'આ માટે તાત્કાલિક મદદ જરૂરી છે.', summary: 'આ પરિસ્થિતિમાં તાત્કાલિક વ્યાવસાયિક તબીબી સહાયની જરૂર પડી શકે છે.', play: 'તમારી નજીકની તાત્કાલિક તબીબી સુવિધા મળી છે. સૂચવેલા માર્ગને અનુસરો.' },
  pa: { prompt: 'ਐਮਰਜੈਂਸੀ ਸ਼ੁਰੂ ਹੋ ਗਈ ਹੈ। ਦੱਸੋ ਕੀ ਹੋਇਆ।', title: 'ਇਸ ਲਈ ਤੁਰੰਤ ਮਦਦ ਦੀ ਲੋੜ ਹੈ।', summary: 'ਇਸ ਸਥਿਤੀ ਵਿੱਚ ਤੁਰੰਤ ਪੇਸ਼ੇਵਰ ਡਾਕਟਰੀ ਮਦਦ ਦੀ ਲੋੜ ਹੋ ਸਕਦੀ ਹੈ।', play: 'ਤੁਹਾਡੇ ਨੇੜੇ ਇੱਕ ਐਮਰਜੈਂਸੀ ਮੈਡੀਕਲ ਸਹੂਲਤ ਮਿਲੀ ਹੈ। ਸੁਝਾਏ ਰਸਤੇ ਦੀ ਪਾਲਣਾ ਕਰੋ।' },
  ur: { prompt: 'ہنگامی حالت شروع ہو گئی ہے۔ بتائیں کیا ہوا۔', title: 'اس کے لیے فوری مدد کی ضرورت ہے۔', summary: 'اس صورت حال میں فوری طبی امداد کی ضرورت ہو سکتی ہے۔', play: 'آپ کے قریب ایک ہنگامی طبی مرکز تلاش کر لیا گیا ہے۔ تجویز کردہ راستے پر چلیں۔' },
  ml: { prompt: 'അടിയന്തരാവസ്ഥ ആരംഭിച്ചു. എന്താണ് സംഭവിച്ചതെന്ന് പറയൂ.', title: 'ഇതിന് അടിയന്തര സഹായം ആവശ്യമാണ്.', summary: 'ഈ സാഹചര്യത്തിൽ ഉടനടി പ്രൊഫഷണൽ വൈദ്യസഹായം ആവശ്യമായി വരാം.', play: 'നിങ്ങളുടെ സമീപത്ത് ഒരു അടിയന്തര ചികിത്സാ കേന്ദ്രം കണ്ടെത്തി. നിർദ്ദേശിച്ച വഴി പിന്തുടരുക.' },
}
function Analysis({ language, onContinue }) { const response = aiResponses[language.id] || { title: language.id === 'en' ? aiResponses.en.title : `AI emergency assessment · ${language.label}`, summary: language.sample, play: language.sample }; const speak = () => { if (!window.speechSynthesis) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtance(response.play); utterance.lang = language.locale; window.speechSynthesis.speak(utterance) }; return <ScreenFrame eyebrow="AI ANALYSIS" title={response.title} description="AI assessment only · professional assistance recommended." action={onContinue} actionLabel="Answer two quick questions"><div className="analysis-card"><div className="classification"><span className="severity-icon">!</span><div><strong>Possible medical emergency</strong><small>Confidence 94% · urgent</small></div><b>HIGH</b></div><div className="analysis-summary"><small>AI SUMMARY · {language.label}</small><p>{response.summary}</p><button className="secondary-button" onClick={speak}>🔊 Play response <span>↗</span></button></div><div className="analysis-tags"><span>Chest pain</span><span>Immediate response</span><span>{language.label}</span></div></div></ScreenFrame> }
function FollowUp({ index, answer, setAnswer, onSubmit }) { const questions = ['Is the person conscious and breathing normally?', 'Is the chest pain spreading to the arm, jaw, or back?']; return <ScreenFrame eyebrow={`FOLLOW-UP ${index + 1} OF 2`} title={questions[index]} description="Your answer helps responders prepare before they arrive." action={onSubmit} actionLabel={index === 1 ? 'Capture location' : 'Next question'}><div className="answer-grid"><button className={answer === 'Yes' ? 'answer selected' : 'answer'} onClick={() => setAnswer('Yes')}>Yes</button><button className={answer === 'No' ? 'answer selected' : 'answer'} onClick={() => setAnswer('No')}>No</button><button className={answer === 'Not sure' ? 'answer selected' : 'answer'} onClick={() => setAnswer('Not sure')}>Not sure</button></div></ScreenFrame> }
function Gps({ location, onLocate }) { const channels = location?.notificationChannels || []; return <ScreenFrame eyebrow={location?.escalation ? 'AUTOMATIC EMERGENCY · LIVE LOCATION' : 'LOCATE'} title={location?.escalation ? 'Demo alert is prepared.' : 'Where are you right now?'} description={location?.escalation ? 'This passive safety path captured the best available location and prepared simulated alerts. No external emergency message was sent.' : 'Location lets PranaSetu find the nearest capable help.'} action={() => onLocate(false)} actionLabel={location?.escalation ? 'Continue to hospitals' : location ? 'Use this location' : 'Capture my location'}><div className={location?.escalation ? 'location-card escalation-card' : 'location-card'}><span className="location-crosshair">⌖</span><div><strong>{location?.escalation ? 'Live location sharing active · DEMO' : location?.label || 'Device location is ready'}</strong><small>{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}${location.accuracy ? ` · ±${Math.round(location.accuracy)} m` : ''}` : 'Your browser will ask for permission.'}</small></div></div>{location?.escalation && <div className="notification-card"><strong>DEMO alerts prepared with this location</strong><span>Family contacts · {channels.includes('EMERGENCY_CONTACTS') ? 'prepared' : 'pending'}</span><span>Hospital coordination · {channels.includes('HOSPITAL_COORDINATION') ? 'prepared' : 'pending'}</span><span>Police station · {channels.includes('POLICE_STATION') ? 'prepared' : 'pending'}</span><small>All three are simulated. Real SMS, dispatch, and police integrations are not configured.</small></div>}<button className="secondary-button" onClick={() => onLocate(true)}>Use demo Pune location <span>⌖</span></button></ScreenFrame> }
function HospitalSearch({ onContinue }) { return <ScreenFrame eyebrow="ASSESS · RECOMMEND" title="Finding capable hospitals." description="Distance and route estimates come from map data. Live bed or ICU availability is unavailable." action={onContinue} actionLabel="See recommendations"><div className="search-status"><span className="search-spinner" /><div><strong>Searching near your location</strong><small>3 facilities found · DEMO route ranking</small></div></div></ScreenFrame> }
function Ranking({ onContinue }) { return <ScreenFrame eyebrow="HOSPITAL RANKING" title="Ruby Hall is the best match." description="The recommendation balances urgency, capability, and travel time." action={onContinue} actionLabel="View live route"><div className="hospital-list">{hospitals.map((hospital, index) => <div className={index === 0 ? 'hospital-row recommended' : 'hospital-row'} key={hospital.name}><span className="rank">0{index + 1}</span><div><strong>{hospital.name} {index === 0 && <b>Recommended</b>}</strong><small>{hospital.reason}</small></div><span className="hospital-stats">{hospital.distance}<b>{hospital.eta}</b></span></div>)}</div></ScreenFrame> }
function MapView({ location, onContinue }) { return <ScreenFrame eyebrow="LIVE MAP" title="Nearby help is visible." description="OpenStreetMap data with live nearby hospitals, police stations, and fire services." action={onContinue} actionLabel="Start navigation"><div className="map-with-traffic"><RealMap location={location} /><TrafficOverlay /><div className="destination-route" /><span className="destination-pin">RH</span></div><div className="route-legend live-map-legend"><strong>Ruby Hall Clinic · destination</strong><small>2.4 km · 8 min ETA · route ready</small><small>{location?.label || 'Pune, Maharashtra'}</small></div><MapAssistant /></ScreenFrame> }

function MapAssistant() { const language = window.localStorage.getItem('pranasetu-language') || 'en'; const selected = languages.find((item) => item.id === language) || languages[4]; const message = language === 'hi' ? 'रूबी हॉल क्लिनिक आपका अस्पताल गंतव्य है। अनुमानित समय आठ मिनट है।' : language === 'mr' ? 'रुबी हॉल क्लिनिक हे तुमचे रुग्णालय गंतव्य आहे. अंदाजे वेळ आठ मिनिटे आहे.' : `${selected.label}: Ruby Hall Clinic is your hospital destination. Estimated arrival is eight minutes.`; const speak = () => { if (!window.speechSynthesis) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(message); utterance.lang = selected.locale; window.speechSynthesis.speak(utterance) }; return <button className="map-assistant" onClick={speak}>🎙 <span>AI route assistant</span><small>Speak destination and ETA</small></button> }

function TrafficOverlay() { return <div className="traffic-overlay" aria-label="Traffic conditions"><span className="traffic-road traffic-road-one" /><span className="traffic-road traffic-road-two" /><div className="traffic-key"><span><i className="traffic-high" /> High traffic</span><span><i className="traffic-medium" /> Slower</span><small>Demo traffic layer · connect a verified traffic provider for live congestion</small></div></div> }

function RealMap({ location }) { const mapRef = useRef(null); const [places, setPlaces] = useState([]); const defaultLocation = { lat: 18.5204, lng: 73.8567 }; const center = location || defaultLocation; useEffect(() => { if (!mapRef.current) return undefined; const map = L.map(mapRef.current).setView([center.lat, center.lng], 14); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map); const userIcon = L.divIcon({ className: 'live-user-marker', html: '<span>YOU</span>' }); L.marker([center.lat, center.lng], { icon: userIcon }).addTo(map).bindPopup('Your current location'); const query = `[out:json];(nwr[amenity~"hospital|police|fire_station"](around:5000,${center.lat},${center.lng}););out center 25;`; fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`).then((response) => response.json()).then((data) => { const nearby = data.elements.map((place) => { const lat = place.lat || place.center?.lat; const lng = place.lon || place.center?.lon; const kind = place.tags?.amenity; return { lat, lng, name: place.tags?.name || (kind === 'hospital' ? 'Nearby hospital' : kind === 'police' ? 'Police station' : 'Fire station'), kind } }).filter((place) => place.lat && place.lng); setPlaces(nearby); nearby.forEach((place) => { const color = place.kind === 'hospital' ? '#ff5a5f' : place.kind === 'police' ? '#f0aa52' : '#57c6c0'; const icon = L.divIcon({ className: 'place-marker', html: `<span style="background:${color}">${place.kind === 'hospital' ? 'H' : place.kind === 'police' ? 'P' : 'F'}</span>` }); L.marker([place.lat, place.lng], { icon }).addTo(map).bindPopup(`<strong>${place.name}</strong><br>${place.kind.replace('_', ' ')} · OpenStreetMap`); }); }).catch(() => setPlaces([])); return () => map.remove() }, [center.lat, center.lng]); return <div className="real-map"><div ref={mapRef} className="leaflet-map" /><div className="map-data-badge">● LIVE OSM DATA · {places.length || 'nearby'} places</div></div> }
function Navigation({ onContinue }) { return <ScreenFrame eyebrow="NAVIGATION" title="Go with confidence." description="Follow the route to Ruby Hall Clinic. PranaSetu is staying with you." action={onContinue} actionLabel="I’m on my way"><div className="navigation-card"><strong>Turn left onto Sassoon Road</strong><span>500 m</span><small>Destination on the right · 7 min remaining</small></div></ScreenFrame> }
function Tracking({ onContinue }) { return <ScreenFrame eyebrow="EMERGENCY TRACKING · DEMO" title="The demo response is moving." description="This simulated timeline demonstrates responder coordination. No real responder or hospital was contacted." action={onContinue} actionLabel="View emergency timeline"><div className="tracking-card"><div className="tracking-line"><i /><i /><i /><i /></div><div className="tracking-steps"><span><b>Responder assigned · DEMO</b><small>Now · simulated</small></span><span><b>Hospital handoff · FUTURE</b><small>Not contacted</small></span><span><b>Arrival estimate</b><small>Route estimate only</small></span></div></div></ScreenFrame> }
function Timeline({ events, onContinue }) { return <ScreenFrame eyebrow="EMERGENCY TIMELINE" title="Every step is accounted for." description="A shared record keeps care coordinated." action={onContinue} actionLabel="Open command center"><div className="timeline">{[...events, 'Emergency coordination active'].map((event, index) => <div className="timeline-row" key={`${event}-${index}`}><i /><div><strong>{event}</strong><small>{index === events.length ? 'Live now' : `${index + 1} min ago`}</small></div></div>)}</div></ScreenFrame> }
function CommandCenter({ onContinue }) { return <ScreenFrame eyebrow="COMMAND CENTER" title="The whole response, together." description="Care circle, responder, and hospital teams now share one incident view." action={onContinue} actionLabel="Watch live status"><div className="command-grid"><div><span className="command-number">01</span><strong>Incident PS-260819</strong><small>High priority · active</small></div><div><span className="command-number">03</span><strong>Teams connected</strong><small>Family · responder · hospital</small></div></div></ScreenFrame> }
function LiveStatus({ onContinue }) { return <ScreenFrame eyebrow="LIVE STATUS UPDATES · DEMO" title="The demo handoff is ready." description="These updates are simulated for the walkthrough. Hospital arrival and contact notifications are not real." action={onContinue} actionLabel="Mark as resolved"><div className="live-update"><span>●</span><div><strong>Route estimate ready</strong><small>Live provider integration required for responder status</small></div><time>Just now</time></div><div className="live-update"><span>✓</span><div><strong>Care circle alert prepared · DEMO</strong><small>No SMS, push, or emergency call was sent</small></div><time>1 min</time></div></ScreenFrame> }
function Resolved({ onReset }) { return <div className="resolved"><span className="resolved-check">✓</span><p className="eyebrow">RESOLUTION</p><h1>You are not alone.</h1><p>The incident is closed and the full timeline has been saved to your care circle.</p><button className="primary-button" onClick={onReset}>Return to home <span>→</span></button></div> }
function CrashCountdown({ language, countdown, onCancel, onSendHelp }) { const safetyQuestions = { en: 'Are you safe?', hi: 'क्या आप सुरक्षित हैं?', mr: 'तुम्ही सुरक्षित आहात का?', te: 'మీరు సురక్షితంగా ఉన్నారా?', ta: 'நீங்கள் பாதுகாப்பாக இருக்கிறீர்களா?', bn: 'আপনি কি নিরাপদ?', kn: 'ನೀವು ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಾ?', gu: 'શું તમે સુરક્ષિત છો?', pa: 'ਕੀ ਤੁਸੀਂ ਸੁਰੱਖਿਅਤ ਹੋ?', ur: 'کیا آپ محفوظ ہیں؟', ml: 'നിങ്ങൾ സുരക്ഷിതരാണോ?' }; const safetyQuestion = safetyQuestions[language.id] || safetyQuestions.en; useEffect(() => { if (!window.speechSynthesis) return undefined; const utterance = new SpeechSynthesisUtterance(safetyQuestion); utterance.lang = language.locale; window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance); return () => { window.speechSynthesis.cancel() } }, [language, safetyQuestion]); useEffect(() => { const AudioContext = window.AudioContext || window.webkitAudioContext; const context = AudioContext ? new AudioContext() : null; const beep = () => { if (context) { context.resume().catch(() => undefined); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = 760; gain.gain.value = 0.06; oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.2) } if (navigator.vibrate) navigator.vibrate([500, 150, 500, 150]) }; beep(); const alarm = window.setInterval(beep, 1200); return () => { window.clearInterval(alarm); if (context) context.close(); if (navigator.vibrate) navigator.vibrate(0) } }, []); return <div className="crash-screen"><p className="eyebrow coral-text">PROTOTYPE CRASH DETECTION · AI SAFETY CHECK</p><div className="crash-alert"><span className="crash-number">{countdown}</span><div><h1>Possible crash detected.</h1><p className="crash-question">{safetyQuestion}</p><p>Emergency help will be contacted automatically when the timer ends.</p></div></div><div className="crash-actions"><button className="primary-button" onClick={onSendHelp}>Send Help <span>→</span></button><button className="secondary-button" onClick={onCancel}>I’m Safe <span>✓</span></button></div><small>Alarm active · prototype crash detection is not a certified vehicle safety system.</small></div> }
function PortalPage({ page, onBack, onEmergency, onCrash }) {
  const content = {
    guardian: ['GUARDIAN MODE', 'Your safety net is ready.', 'Passive monitoring asks for a response before any demo escalation.', 'Open verification demo', onCrash],
    devices: ['DEVICES', 'Connected signals.', 'Browser motion access is optional and never diagnoses an accident.', 'Test crash signal', onCrash],
    'map-home': ['MAP', 'See your response area.', 'OpenStreetMap tiles and browser GPS are real when available. Traffic and responders are demo data.', 'Start emergency', onEmergency],
    'hospitals-home': ['HOSPITAL FINDER', 'Nearby care, honestly presented.', 'Distance and route estimates are available. Live bed, ICU, and ambulance availability is unavailable.', 'Start emergency', onEmergency],
    contacts: ['CONTACTS', 'Your care circle.', 'Demo contact records are stored in this browser session. SMS and push require a configured provider.', 'Add demo contact', () => window.alert('DEMO contact form: no message will be sent.')],
    profile: ['EMERGENCY PROFILE', 'Important details, ready when needed.', 'Medical data is sensitive and authenticated-only in a full backend deployment.', 'Edit demo profile', () => window.alert('DEMO profile editor: no medical data was changed.')],
    incidents: ['INCIDENTS', 'Your response history.', 'PS-2026-0001 · DEMO · resolved', 'Open latest incident', onEmergency],
    responder: ['RESPONDER', 'Coordination workspace.', 'Responder assignment and arrival are FUTURE INTEGRATION unless a real dispatch service is connected.', 'Open demo console', onEmergency],
    admin: ['ADMIN', 'System oversight.', 'KPI cards and audit events are demo data. Server authorization must protect production access.', 'Open demo console', onEmergency],
    settings: ['SETTINGS', 'Make PranaSetu work for you.', 'Language is available in the header and persists locally. Location sharing and reduced motion follow browser settings.', 'Review privacy', () => window.alert('Privacy controls are available in the Privacy screen.')],
    privacy: ['PRIVACY', 'Your data, your decision.', 'Delete my data is a demo-local action until authenticated database storage is configured.', 'Delete demo data', () => { window.localStorage.clear(); window.alert('DEMO data cleared from this browser.'); }],
    signup: ['CREATE ACCOUNT', 'Join your care circle.', 'Authentication is demo access in this build. Supabase Auth is a FUTURE INTEGRATION.', 'Use demo access', onBack],
  }[page] || ['PRANASETU', 'Emergency coordination.', 'Choose an action to continue.', 'Start emergency', onEmergency]
  return <div className="app-shell portal-shell"><header className="home-header"><Logo /><button className="quiet-button" onClick={onBack}>{translateEmergency('Back to home')}</button></header><main className="portal-main"><p className="eyebrow coral-text">{translateEmergency(content[0])}</p><h1>{translateEmergency(content[1])}</h1><p className="portal-description">{translateEmergency(content[2])}</p><div className="portal-status"><span>●</span><strong>{translateEmergency('DEMO / SIMULATED')}</strong><small>{translateEmergency('Provider-backed actions are clearly separated from this walkthrough.')}</small></div><button className="primary-button" onClick={content[4]}>{translateEmergency(content[3])} <span>→</span></button><button className="secondary-button portal-back" onClick={onBack}>{translateEmergency('Return to home')}</button></main></div>
}

function Home({ copy, backendOnline, motionEnabled, motionMode, onEnableMotion, onEmergency, onCrash, onOpen }) { return <div className="app-shell home-shell"><header className="home-header"><Logo /><span className="service-status"><i /> {backendOnline ? 'Response network connected' : 'Demo response network'}</span><button className="quiet-button" onClick={() => onOpen('settings')}>Aarav Sharma</button></header><main className="home-main"><div className="home-intro"><p className="eyebrow">WEDNESDAY, 19 AUGUST 2026</p><h1>{copy.greeting}</h1><p>The people you care about are close, connected, and okay.</p></div><button className="emergency-button" onClick={onEmergency}><span>+</span><strong>{copy.emergency}</strong><small>{copy.speak}</small></button><div className="home-grid"><div className="home-card mint-surface"><p className="eyebrow">CARE CIRCLE</p><h2>All clear <b>✓</b></h2><p>12 people connected and checking in.</p><div className="circle-people"><span>RK</span><span>NP</span><span>MS</span><span>+9</span></div></div><div className="home-card"><p className="eyebrow">SAFETY MONITOR</p><h2>{motionEnabled ? 'Monitoring active' : 'Crash detection'}</h2><p>{motionEnabled ? `${motionMode === 'sensor' ? 'Accelerometer' : motionMode === 'orientation' ? 'Orientation sensor' : motionMode === 'pending' ? 'Permission pending' : 'Demo fallback'} monitoring active. We will ask if you are safe.` : 'Enable motion monitoring to detect a possible crash.'}</p><button className="secondary-button" onClick={onEnableMotion}>{motionEnabled ? 'Motion monitoring on' : 'Enable motion monitoring'} <span>⌁</span></button><button className="secondary-button test-crash-button" onClick={onCrash}>Test crash detection <span>↗</span></button></div></div><div className="quick-tools"><button onClick={() => onOpen('guardian')}>Guardian</button><button onClick={() => onOpen('hospitals-home')}>Hospitals</button><button onClick={() => onOpen('map-home')}>Map</button><button onClick={() => onOpen('contacts')}>Contacts</button><button onClick={() => onOpen('incidents')}>Incidents</button><button onClick={() => onOpen('settings')}>Settings</button></div><div className="loop-strip"><span>Speak</span><b>→</b><span>Understand</span><b>→</b><span>Locate</span><b>→</b><span>Respond</span></div></main></div> }

function OperationsCenter({ onExit }) { return <div className="operations-center"><aside className="ops-sidebar"><Logo /><p className="ops-kicker">PranaSetu Command Center</p><nav><button className="ops-active">▦ Dashboard</button><button>◉ Live emergencies <b>7</b></button><button>⌖ Map</button><button>＋ Hospitals</button><button>◒ Analytics</button><button>◷ History</button></nav><button className="ops-exit" onClick={onExit}>← Citizen view</button></aside><main className="ops-main"><header className="ops-header"><div><p className="eyebrow">OPERATIONS / OVERVIEW</p><h1>Response command center</h1></div><span className="ops-status"><i /> System operational</span></header><section className="ops-kpis"><div><small>ACTIVE EMERGENCIES</small><strong>07</strong><b className="critical">02 critical</b></div><div><small>HIGH PRIORITY</small><strong>03</strong><b className="warning">Responding</b></div><div><small>HOSPITAL NETWORK</small><strong>24</strong><b className="safe">Connected</b></div><div><small>AVG RESPONSE</small><strong>8.4<span> min</span></strong><b className="safe">↓ 18% this week</b></div></section><section className="ops-grid"><div className="ops-map-panel"><div className="ops-panel-header"><div><h2>Live emergency map</h2><p>Signals updating in real time · DEMO DATA</p></div><span className="map-legend"><i className="critical-dot" /> Critical <i className="warning-dot" /> High <i className="safe-dot" /> Resolved</span></div><div className="ops-map"><div className="ops-road ops-road-one" /><div className="ops-road ops-road-two" /><div className="ops-road ops-road-three" /><span className="ops-marker marker-critical">1024</span><span className="ops-marker marker-high">1025</span><span className="ops-marker marker-safe">1018</span><div className="ops-map-label">Ballarpur district</div></div></div><div className="incident-feed"><div className="ops-panel-header"><div><h2>Live emergencies</h2><p>Incoming coordination events</p></div><span className="feed-live">● Live</span></div><div className="incident-row selected"><strong>#1024</strong><div><b>Road accident</b><small>Auto detection · Ballarpur</small></div><span className="severity-badge critical-badge">Critical</span></div><div className="incident-row"><strong>#1025</strong><div><b>Medical</b><small>Voice · Chandrapur</small></div><span className="severity-badge high-badge">High</span></div><div className="incident-row"><strong>#1018</strong><div><b>Medical</b><small>Voice · Nagpur</small></div><span className="severity-badge safe-badge">Resolved</span></div></div></section><section className="incident-table"><div className="ops-panel-header"><div><h2>Incident queue</h2><p>Every source, status, and handoff in one view</p></div><button className="table-action">View history →</button></div><div className="table-head"><span>ID</span><span>TYPE / SOURCE</span><span>PRIORITY</span><span>LOCATION</span><span>STATUS</span><span>TIME</span></div><div className="table-row"><strong>#1024</strong><span>Accident <small>Auto detection</small></span><b className="severity-badge critical-badge">Critical</b><span>Ballarpur</span><b className="responding">Responding</b><span>14:32</span></div><div className="table-row"><strong>#1025</strong><span>Medical <small>Voice</small></span><b className="severity-badge high-badge">High</b><span>Chandrapur</span><b className="found">Hospital found</b><span>14:35</span></div></section></main></div> }

export default App
