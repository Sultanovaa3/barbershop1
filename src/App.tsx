/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform } from 'motion/react';
import { 
  Scissors, 
  User, 
  Clock, 
  MapPin, 
  Phone, 
  Instagram, 
  ChevronRight, 
  Star,
  Stars,
  Camera,
  Menu,
  X
} from 'lucide-react';
import { MessageSquare, Send } from 'lucide-react';
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { GoogleGenAI } from "@google/genai";

type Language = 'ru' | 'en' | 'ky';

const TRANSLATIONS = {
  ru: {
    nav: { about: 'О нас', services: 'Услуги', team: 'Мастера', viz: 'Примерка', contact: 'Контакты', book: 'Записаться' },
    hero: { subtitle: 'Moscow Premium Grooming', title: 'MOSCOW LEGACY', description: 'Больше, чем просто стрижка. Мы создаем стиль, подчеркивающий вашу индивидуальность в самом центре столицы.', bookBtn: 'ВЫБРАТЬ УСЛУГУ', worksBtn: 'НАШИ РАБОТЫ' },
    about: { badge: 'Традиции и Качество', title: 'Искусство Классического Груминга', text: 'MOSCOW LEGACY — это пространство для мужчин, которые ценят свое время и безупречный внешний вид. Наши мастера сочетают классические техники с современными трендами, создавая образы, которые работают на ваш успех.', exp: 'Лет опыта', happy: 'Довольных гостей' },
    services: { title: 'Наши Услуги', subtitle: 'Выберите подходящий уход из нашего меню', duration: 'мин' },
    team: { title: 'Команда Мастеров', subtitle: 'Профессионалы, которые превращают каждый визит в исключительный опыт.', allBtn: 'ВСЕ МАСТЕРА', exp: 'Стаж' },
    booking: { title: 'Готовы к обновлению?', subtitle: 'Забронируйте удобное время онлайн. Мы свяжемся с вами для подтверждения визита.', name: 'ВАШЕ ИМЯ', phone: 'НОМЕР ТЕЛЕФОНА', master: 'ВЫБЕРИТЕ МАСТЕРА', any: 'Любой свободный', submit: 'ОТПРАВИТЬ ЗАЯВКУ' },
    footer: { text: 'Премиальное пространство в Москве, созданное для мужчин, которые ценят качество, комфорт и индивидуальный подход.', address: 'Адрес', street: 'Москва, ул. Арбат, 12, 2-й этаж, помещение 3', hours: 'Режим работы', weekdays: 'Пн — Пт: 10:00 - 22:00', weekends: 'Сб — Вс: 11:00 - 21:00', rights: 'ВСЕ ПРАВА ЗАЩИЩЕНЫ.' },
    chat: { welcome: 'Приветствуем в MOSCOW LEGACY. Чем я могу вам помочь сегодня?', typing: 'Печатает...', placeholder: 'Спросите нас о чем-нибудь...', error: 'Извините, произошла ошибка. Попробуйте позже.', unavailable: 'К сожалению, сервис временно недоступен. Пожалуйста, позвоните нам по телефону.' }
  },
  en: {
    nav: { about: 'About', services: 'Services', team: 'Team', viz: 'Try-on', contact: 'Contact', book: 'Book Now' },
    hero: { subtitle: 'Moscow Premium Grooming', title: 'MOSCOW LEGACY', description: 'More than just a haircut. We create a style that emphasizes your individuality in the heart of the capital.', bookBtn: 'CHOOSE SERVICE', worksBtn: 'OUR WORKS' },
    about: { badge: 'Tradition and Quality', title: 'The Art of Classical Grooming', text: 'MOSCOW LEGACY is a space for men who value their time and impeccable appearance. Our masters combine classic techniques with modern trends to create looks that work for your success.', exp: 'Years experience', happy: 'Happy clients' },
    services: { title: 'Our Services', subtitle: 'Choose the right care from our menu', duration: 'min' },
    team: { title: 'Team of Masters', subtitle: 'Professionals who turn every visit into an exceptional experience.', allBtn: 'ALL BARBERS', exp: 'Exp' },
    booking: { title: 'Ready for an update?', subtitle: 'Book a convenient time online. We will contact you to confirm the visit.', name: 'YOUR NAME', phone: 'PHONE NUMBER', master: 'CHOOSE MASTER', any: 'Any available', submit: 'SEND REQUEST' },
    footer: { text: 'Premium space in Moscow created for men who value quality, comfort, and a personalized approach.', address: 'Address', street: 'Moscow, Arbat St, 12, 2nd floor, room 3', hours: 'Working Hours', weekdays: 'Mon — Fri: 10:00 - 22:00', weekends: 'Sat — Sun: 11:00 - 21:00', rights: 'ALL RIGHTS RESERVED.' },
    chat: { welcome: 'Welcome to MOSCOW LEGACY. How can I help you today?', typing: 'Typing...', placeholder: 'Ask us anything...', error: 'Sorry, an error occurred. Please try later.', unavailable: 'Unfortunately, the service is temporarily unavailable. Please call us.' }
  },
  ky: {
    nav: { about: 'Биз жөнүндө', services: 'Кызматтар', team: 'Чеберлер', viz: 'Кийип көрүү', contact: 'Байланыш', book: 'Жазылуу' },
    hero: { subtitle: 'Москва Премиум Груминг', title: 'MOSCOW LEGACY', description: 'Жөн гана чач кыркуу эмес. Биз борбор калаанын чок ортосунда сиздин өзгөчөлүгүңүздү баса белгилеген стилди жаратабыз.', bookBtn: 'КЫЗМАТТЫ ТАНДОО', worksBtn: 'БИЗДИН ИШТЕР' },
    about: { badge: 'Салт жана Сапат', title: 'Классикалык Груминг Искусствосу', text: 'MOSCOW LEGACY — бул убактысын жана кемчиликсиз сырткы көрүнүшүн баалаган эркектер үчүн мейкиндик. Биздин чеберлер классикалык ыкмаларды заманбап тренддер менен айкалыштырып, сиздин ийгилигиңиз үчүн иштеген образдарды жаратышат.', exp: 'Жылдык тажрыйба', happy: 'Ыраазы болгон коноктор' },
    services: { title: 'Биздин Кызматтар', subtitle: 'Биздин менюдан туура кам көрүүнү тандаңыз', duration: 'мүн' },
    team: { title: 'Чеберлер Командасы', subtitle: 'Ар бир келүүнү өзгөчө тажрыйбага айландырган адистер.', allBtn: 'БАРДЫК ЧЕБЕРЛЕР', exp: 'Стажы' },
    booking: { title: 'Жаңыртууга даярсызбы?', subtitle: 'Ыңгайлуу убакытты онлайн заказ кылыңыз. Визитти ырастоо үчүн биз сиз менен байланышабыз.', name: 'СИЗДИН АТЫҢЫЗ', phone: 'ТЕЛЕФОН НОМЕРИ', master: 'ЧЕБЕРДИ ТАНДОО', any: 'Каалаган бош чебер', submit: 'ӨТҮНМӨ ЖӨНӨТҮҮ' },
    footer: { text: 'Москвадагы сапатты, ыңгайлуулукту жана жеке мамилени баалаган эркектер үчүн түзүлгөн премиум мейкиндик.', address: 'Дарек', street: 'Москва, Арбат көчөсү, 12, 2-кабат, 3-бөлмө', hours: 'Иштөө тартиби', weekdays: 'Дүй — Жума: 10:00 - 22:00', weekends: 'Иш — Жек: 11:00 - 21:00', rights: 'БАРДЫК УКУКТАР КОРГОЛГОН.' },
    chat: { welcome: 'MOSCOW LEGACY сайтына кош келиңиз. Бүгүн сизге кантип жардам бере алам?', typing: 'Жазууда...', placeholder: 'Бизден бир нерсе сураңыз...', error: 'Кечиресиз, ката кетти. Сураныч, кийинчерээк аракет кылыңыз.', unavailable: 'Тилекке каршы, кызмат убактылуу иштебейт. Сураныч, бизге телефон аркылуу чалыңыз.' }
  }
};

const VISUALIZER_TRANSLATIONS = {
  ru: {
    title: 'AI Визуализатор Стиля',
    subtitle: 'Посмотрите, как вы будете выглядеть с новой стрижкой прямо сейчас. Наш ИИ подберет идеальный образ.',
    uploadLabel: 'Загрузите ваше фото',
    processing: 'Создаем ваш новый стиль...',
    resultTitle: 'Ваш новый образ',
    retry: 'Попробовать снова',
    selectStyle: 'Выберите стиль для примерки',
    prompt: 'Измени прическу человека на фото на стиль "{style}". Сделай это максимально реалистично, как если бы это было фото после визита в премиальный барбершоп. Сохрани черты лица и фон.'
  },
  en: {
    title: 'AI Style Visualizer',
    subtitle: 'See how you will look with a new haircut right now. Our AI will select the perfect look.',
    uploadLabel: 'Upload your photo',
    processing: 'Creating your new style...',
    resultTitle: 'Your New Look',
    retry: 'Try Again',
    selectStyle: 'Select style to try on',
    prompt: 'Change the hairstyle of the person in the photo to the "{style}" style. Make it as realistic as possible, as if it were a photo after a visit to a premium barbershop. Preserve facial features and background.'
  },
  ky: {
    title: 'AI Стиль Визуализатору',
    subtitle: 'Жаңы чач жасалгасы менен кандай көрүнөрүңүздү азыр көрүңүз. Биздин жасалма интеллект идеалдуу образды тандап берет.',
    uploadLabel: 'Сүрөтүңүздү жүктөңүз',
    processing: 'Жаңы стилиңизди жаратуудабыз...',
    resultTitle: 'Сиздин жаңы образыңыз',
    retry: 'Кайра аракет кылуу',
    selectStyle: 'Кийип көрүү үчүн стилди тандаңыз',
    prompt: 'Сүрөттөгү адамдын чач жасалгасын "{style}" стилине өзгөртүңүз. Аны премиум барбершопко баргандан кийинки сүрөт сыяктуу болушунча реалдуу кылыңыз. Беттин өзгөчөлүктөрүн жана фонду сактаңыз.'
  }
};

const SERVICES_STATIC = {
  ru: [
    { id: 1, name: 'Мужская стрижка', price: '3 500 ₽', duration: '60', description: 'Индивидуальный подбор формы, мытье головы и укладка премиальными средствами.', image: 'https://images.unsplash.com/photo-1621605815841-aa8961b8b197?q=80&w=800' },
    { id: 2, name: 'Моделирование бороды', price: '2 500 ₽', duration: '45', description: 'Коррекция формы бороды и усов, четкие контуры и уход с маслом.', image: 'https://images.unsplash.com/photo-1593702295094-ada35bc18975?q=80&w=800' },
    { id: 3, name: 'Королевское бритье', price: '4 000 ₽', duration: '60', description: 'Ритуал с распариванием горячим полотенцем и бритьем опасной бритвой.', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800' },
    { id: 4, name: 'Отец и сын', price: '5 500 ₽', duration: '120', description: 'Традиционное времяпрепровождение для двоих. Две стрижки со скидкой.', image: 'https://images.unsplash.com/photo-1622286330961-415a1d06a18d?q=80&w=800' }
  ],
  en: [
    { id: 1, name: 'Mens Haircut', price: '3 500 ₽', duration: '60', description: 'Individual shape selection, hair washing and styling with premium products.', image: 'https://images.unsplash.com/photo-1621605815841-aa8961b8b197?q=80&w=800' },
    { id: 2, name: 'Beard Grooming', price: '2 500 ₽', duration: '45', description: 'Beard and mustache shape correction, sharp contours and oil care.', image: 'https://images.unsplash.com/photo-1593702295094-ada35bc18975?q=80&w=800' },
    { id: 3, name: 'Royal Shave', price: '4 000 ₽', duration: '60', description: 'Ritual with hot towel steaming and straight razor shaving.', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800' },
    { id: 4, name: 'Father and Son', price: '5 500 ₽', duration: '120', description: 'Traditional bonding time. Two haircuts at a discount.', image: 'https://images.unsplash.com/photo-1622286330961-415a1d06a18d?q=80&w=800' }
  ],
  ky: [
    { id: 1, name: 'Эркектердин чач кыркуусу', price: '3 500 ₽', duration: '60', description: 'Форманы жеке тандоо, чачты жуу жана премиум каражаттар менен жасалгалоо.', image: 'https://images.unsplash.com/photo-1621605815841-aa8961b8b197?q=80&w=800' },
    { id: 2, name: 'Сакал моделдөө', price: '2 500 ₽', duration: '45', description: 'Сакал-мурут формасын оңдоо, так контурлар жана май менен кам көрүү.', image: 'https://images.unsplash.com/photo-1593702295094-ada35bc18975?q=80&w=800' },
    { id: 3, name: 'Королдук кырынуу', price: '4 000 ₽', duration: '60', description: 'Ысык сүлгү менен буулоо жана өткүр устара менен кырынуу ритуалы.', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800' },
    { id: 4, name: 'Ата жана бала', price: '5 500 ₽', duration: '120', description: 'Эки киши үчүн салттуу убакыт өткөрүү. Арзандатуу менен эки чач кыркуу.', image: 'https://images.unsplash.com/photo-1622286330961-415a1d06a18d?q=80&w=800' }
  ]
};

const CHAT_SYSTEM_INSTRUCTION = (lang: Language) => `You are virtual assistant for "MOSCOW LEGACY" barbershop. 
You help clients with info about services, prices, masters, and booking.
Current language: ${lang}. Always respond in ${lang}.
Prices: Haircut-3500, Beard-2500, Royal Shave-4000, Father&Son-5500.
Address: Moscow, Arbat 12.
Hours: Mon-Fri 10-22, Sat-Sun 11-21.
Be professional, polite, and concise.`;

const MASTERS = [
  {
    id: 1,
    name: 'Александр Громов',
    role: 'Top Barber',
    experience: '8 лет',
    image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Дмитрий Соколов',
    role: 'Senior Barber',
    experience: '6 лет',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Артем Волков',
    role: 'Barber',
    experience: '4 года',
    image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=800&auto=format&fit=crop'
  }
];

export default function App() {
  const [lang, setLang] = useState<Language>('ru');
  const t = TRANSLATIONS[lang];
  const tv = VISUALIZER_TRANSLATIONS[lang];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [visualizerPhoto, setVisualizerPhoto] = useState<string | null>(null);
  const [visualizerResult, setVisualizerResult] = useState<string | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [selectedVisualizerStyle, setSelectedVisualizerStyle] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: TRANSLATIONS['ru'].chat.welcome }
  ]);

  // Update welcome message when language changes if chat is empty or just started
  useEffect(() => {
    if (chatMessages.length === 1) {
      setChatMessages([{ role: 'model', text: t.chat.welcome }]);
    }
  }, [lang]);

  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e?: any) => {
    e?.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const history = chatMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...history, { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: CHAT_SYSTEM_INSTRUCTION(lang),
        }
      });

      const modelText = response.text || t.chat.error;
      setChatMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: t.chat.unavailable }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVisualizerPhoto(reader.result as string);
        setVisualizerResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runVisualization = async () => {
    if (!visualizerPhoto || !selectedVisualizerStyle) return;
    setIsVisualizing(true);

    try {
      const base64Data = visualizerPhoto.split(',')[1];
      const mimeType = visualizerPhoto.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: tv.prompt.replace('{style}', selectedVisualizerStyle),
            },
          ],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setVisualizerResult(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Visualization Error:", error);
      alert("Error processing image. Please try another one.");
    } finally {
      setIsVisualizing(false);
    }
  };
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-charcoal text-white scroll-smooth">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-charcoal/80 backdrop-blur-lg py-4 border-b border-white/5' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            < Scissors className="w-8 h-8 text-gold" />
            <span className="text-2xl font-serif tracking-widest gold-gradient-text uppercase font-bold">LEGACY</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm uppercase tracking-widest font-medium">
             <a href="#about" className="hover:text-gold transition-colors">{t.nav.about}</a>
             <a href="#services" className="hover:text-gold transition-colors">{t.nav.services}</a>
             <a href="#team" className="hover:text-gold transition-colors">{t.nav.team}</a>
             <a href="#visualizer" className="hover:text-gold transition-colors">{t.nav.viz}</a>
             <a href="#contact" className="hover:text-gold transition-colors">{t.nav.contact}</a>
             
             <div className="flex gap-2 border-x border-white/10 px-4">
               {['ru', 'en', 'ky'].map((l) => (
                 <button 
                  key={l}
                  onClick={() => setLang(l as Language)}
                  className={`text-[10px] w-6 h-6 flex items-center justify-center border ${lang === l ? 'border-gold text-gold' : 'border-transparent text-white/40'} hover:text-gold transition-all`}
                 >
                   {l.toUpperCase()}
                 </button>
               ))}
             </div>

             <button className="px-6 py-2 border border-gold text-gold hover:bg-gold hover:text-charcoal transition-all duration-300">
               {t.nav.book}
             </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-40 bg-charcoal pt-24 px-6 md:hidden"
        >
          <div className="flex flex-col gap-6 text-xl uppercase tracking-widest font-serif text-center">
            <a href="#about" onClick={() => setIsMenuOpen(false)}>{t.nav.about}</a>
            <a href="#services" onClick={() => setIsMenuOpen(false)}>{t.nav.services}</a>
            <a href="#team" onClick={() => setIsMenuOpen(false)}>{t.nav.team}</a>
            <a href="#visualizer" onClick={() => setIsMenuOpen(false)}>{t.nav.viz}</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)}>{t.nav.contact}</a>
            
            <div className="flex justify-center gap-4 py-4 border-y border-white/5 mx-auto w-full max-w-[200px]">
               {['ru', 'en', 'ky'].map((l) => (
                 <button 
                  key={l}
                  onClick={() => { setLang(l as Language); setIsMenuOpen(false); }}
                  className={`text-sm w-10 h-10 flex items-center justify-center border ${lang === l ? 'border-gold text-gold' : 'border-white/10 text-white/40'}`}
                 >
                   {l.toUpperCase()}
                 </button>
               ))}
            </div>

            <button className="mt-4 px-10 py-4 bg-gold text-charcoal font-bold">
              {t.nav.book.toUpperCase()}
            </button>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop" 
            alt="Barbershop Background" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/50"></div>
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gold uppercase tracking-[0.3em] font-medium mb-4">{t.hero.subtitle}</p>
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 tracking-tight">
              {t.hero.title.split(' ')[0]} <br />
              <span className="italic gold-gradient-text">{t.hero.title.split(' ')[1]}</span>
            </h1>
            <p className="max-w-2xl mx-auto text-white/60 text-lg md:text-xl mb-12 font-light leading-relaxed">
              {t.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="min-w-[200px] px-8 py-4 bg-gold text-charcoal font-bold tracking-widest hover:bg-gold-light transition-all shadow-xl shadow-gold/10">
                {t.hero.bookBtn}
              </button>
              <button className="min-w-[200px] px-8 py-4 border border-white/20 hover:border-gold hover:text-gold transition-all tracking-widest">
                {t.hero.worksBtn}
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
        >
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent"></div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-charcoal">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold text-sm uppercase tracking-widest mb-4 block">{t.about.badge}</span>
            <h2 className="text-4xl md:text-5xl font-serif mb-8">{t.about.title}</h2>
            <p className="text-white/60 leading-loose mb-8">
              {t.about.text}
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-3xl font-serif text-gold mb-1">10+</h4>
                <p className="text-white/40 text-sm uppercase">{t.about.exp}</p>
              </div>
              <div>
                <h4 className="text-3xl font-serif text-gold mb-1">5000+</h4>
                <p className="text-white/40 text-sm uppercase">{t.about.happy}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="relative"
          >
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-gold/30"></div>
            <img 
              src="https://images.unsplash.com/photo-1536768331508-d897e9373ea3?q=80&w=2070&auto=format&fit=crop" 
              alt="Interier" 
              className="w-full h-[500px] object-cover grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-gold/30"></div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 bg-charcoal-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif mb-4">{t.services.title}</h2>
            <div className="w-20 h-1 bg-gold mx-auto mb-6"></div>
            <p className="text-white/60 max-w-xl mx-auto font-light">{t.services.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES_STATIC[lang].map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -10 }}
                className="bg-charcoal p-0 relative group overflow-hidden border border-white/5"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-serif font-bold group-hover:text-gold transition-colors">{service.name}</h3>
                    <Scissors className="w-5 h-5 text-white/20 group-hover:text-gold transition-colors" />
                  </div>
                  <p className="text-white/40 text-sm mb-6 line-clamp-2">{service.description}</p>
                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <span className="text-lg font-bold text-gold">{service.price}</span>
                    <span className="text-xs text-white/40 uppercase items-center flex gap-1">
                      <Clock className="w-3 h-3" /> {service.duration} {t.services.duration}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-serif mb-4">{t.team.title}</h2>
              <p className="text-white/60 font-light">
                {t.team.subtitle}
              </p>
            </div>
            <button className="text-gold border-b border-gold pb-1 hover:text-gold-light hover:border-gold-light transition-all flex items-center gap-2">
              {t.team.allBtn} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {MASTERS.map((master) => (
              <motion.div 
                key={master.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                  <img 
                    src={master.image} 
                    alt={master.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <div className="flex gap-2 mb-4">
                      <Instagram className="w-5 h-5 cursor-pointer hover:text-gold transition-colors" />
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                   <h4 className="text-xl font-serif mb-1 group-hover:text-gold transition-colors">{master.name}</h4>
                   <p className="text-gold text-xs uppercase tracking-widest mb-2 font-bold">{master.role}</p>
                   <p className="text-white/40 text-sm italic">{t.team.exp}: {master.experience}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Visualizer Section */}
      <section id="visualizer" className="py-24 px-6 bg-charcoal border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-serif mb-6">{tv.title}</h2>
              <div className="w-20 h-1 bg-gold mb-8"></div>
              <p className="text-white/60 text-lg mb-12 font-light leading-relaxed">
                {tv.subtitle}
              </p>

              {!visualizerResult ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {SERVICES_STATIC[lang].map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedVisualizerStyle(s.name)}
                        className={`p-4 border text-xs uppercase tracking-widest transition-all ${selectedVisualizerStyle === s.name ? 'border-gold text-gold bg-gold/5' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>

                  <label className="block">
                    <div className="w-full py-12 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 transition-all group">
                      <Camera className="w-10 h-10 text-white/20 group-hover:text-gold mb-4 transition-colors" />
                      <span className="text-white/40 uppercase text-xs tracking-widest font-bold group-hover:text-white transition-colors">{tv.uploadLabel}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </div>
                  </label>

                  {visualizerPhoto && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between bg-white/5 p-4 rounded border border-white/10">
                      <div className="flex items-center gap-4">
                        <img src={visualizerPhoto} className="w-12 h-12 object-cover rounded shadow-lg" alt="preview" referrerPolicy="no-referrer" />
                        <span className="text-xs text-white/60 uppercase tracking-widest">Photo selected</span>
                      </div>
                      <button 
                        onClick={runVisualization}
                        disabled={!selectedVisualizerStyle || isVisualizing}
                        className="px-6 py-3 bg-gold text-charcoal font-bold text-xs tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-light transition-all"
                      >
                        {isVisualizing ? tv.processing : 'VISUALIZE'}
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Original</p>
                      <img src={visualizerPhoto!} className="w-full aspect-[4/5] object-cover rounded border border-white/5 shadow-2xl" alt="original" referrerPolicy="no-referrer" />
                    </div>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">{tv.resultTitle}</p>
                      <img src={visualizerResult} className="w-full aspect-[4/5] object-cover rounded border border-gold/30 shadow-2xl shadow-gold/10" alt="result" referrerPolicy="no-referrer" />
                    </motion.div>
                  </div>
                  <button 
                    onClick={() => { setVisualizerResult(null); setVisualizerPhoto(null); setSelectedVisualizerStyle(''); }}
                    className="w-full py-5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 uppercase text-xs tracking-[0.3em] font-bold transition-all"
                  >
                    {tv.retry}
                  </button>
                </div>
              )}
            </motion.div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-10 bg-gold/5 blur-3xl rounded-full"></div>
              <div className="relative aspect-[4/5] bg-charcoal-light border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                 <img 
                  src="https://images.unsplash.com/photo-1512690196252-716447738221?q=80&w=1000" 
                  className="w-full h-full object-cover opacity-50 grayscale"
                  alt="Atmospheric"
                  referrerPolicy="no-referrer"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent"></div>
                 <div className="absolute bottom-12 left-12 right-12">
                    <Stars className="w-12 h-12 text-gold mb-6 animate-pulse" />
                    <h3 className="text-3xl font-serif mb-4">Precision Analysis</h3>
                    <p className="text-white/40 font-light leading-relaxed">
                      Our advanced vision systems analyze your facial structure to recommend styles that complement your unique features.
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Overlay / Teaser */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2070&auto=format&fit=crop" 
            alt="Booking Bg" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-charcoal/80"></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-8">{t.booking.title}</h2>
          <p className="text-white/70 mb-12 text-lg">
            {t.booking.subtitle}
          </p>
          <form className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <input 
                type="text" 
                placeholder={t.booking.name} 
                className="bg-white/5 border border-white/10 px-6 py-4 focus:border-gold outline-none transition-all placeholder:text-white/20 uppercase text-xs tracking-widest"
              />
              <input 
                type="tel" 
                placeholder={t.booking.phone} 
                className="bg-white/5 border border-white/10 px-6 py-4 focus:border-gold outline-none transition-all placeholder:text-white/20 uppercase text-xs tracking-widest"
              />
            </div>
            <select className="bg-white/5 border border-white/10 px-6 py-4 focus:border-gold outline-none transition-all text-white/20 uppercase text-xs tracking-widest">
              <option disabled selected>{t.booking.master}</option>
              <option>{t.booking.any}</option>
              <option>Александр Громов</option>
              <option>Дмитрий Соколов</option>
            </select>
            <button className="bg-gold text-charcoal font-bold py-5 tracking-[0.2em] hover:bg-gold-light transition-all">
              {t.booking.submit}
            </button>
          </form>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[400px] w-full grayscale contrast-125 opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 border-y border-white/5">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.249298453488!2d37.59600021604639!3d55.75161099901416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54a5067205555%3A0xc3ba596c56784d1a!2sArbat%20St%2C%2012%2C%20Moskva%2C%20Russia%2C%20119019!5e0!3m2!1sen!2s!4v1650000000000!5m2!1sen!2s" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={true} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Location Map"
        ></iframe>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-black pt-24 pb-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
               <div className="flex items-center gap-2 mb-8">
                <Scissors className="w-8 h-8 text-gold" />
                <span className="text-2xl font-serif tracking-widest gold-gradient-text uppercase font-bold">LEGACY</span>
              </div>
              <p className="text-white/40 max-w-sm leading-relaxed mb-8">
                {t.footer.text}
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-gold hover:text-gold transition-all cursor-pointer">
                  <Instagram />
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-gold hover:text-gold transition-all cursor-pointer">
                  <Phone size={18} />
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-lg font-serif mb-8 text-white">{t.footer.address}</h5>
              <div className="flex gap-3 text-white/40 mb-4">
                <MapPin className="w-5 h-5 text-gold shrink-0" />
                <p>{t.footer.street}</p>
              </div>
              <div className="flex gap-3 text-white/40">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <p>+7 (999) 000-00-00</p>
              </div>
            </div>

            <div>
              <h5 className="text-lg font-serif mb-8 text-white">{t.footer.hours}</h5>
              <div className="flex gap-3 text-white/40 mb-4">
                <Clock className="w-5 h-5 text-gold shrink-0" />
                <p>{t.footer.weekdays}</p>
              </div>
              <div className="flex gap-3 text-white/40">
                <div className="w-5 shrink-0" />
                <p>{t.footer.weekends}</p>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 text-center text-white/20 text-xs uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} MOSCOW LEGACY. {t.footer.rights}</p>
          </div>
        </div>
      </footer>

      {/* Chatbot Toggle Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gold rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
      >
        {isChatOpen ? <X className="text-charcoal" /> : <MessageSquare className="text-charcoal" />}
      </button>

      {/* Chatbot Window */}
      {isChatOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-24 right-6 z-50 w-[350px] max-h-[500px] bg-charcoal-light border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="bg-gold p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-charcoal" />
              <span className="text-charcoal font-serif font-bold text-sm tracking-widest">LEGACY AI</span>
            </div>
            <button onClick={() => setIsChatOpen(false)}><X className="w-4 h-4 text-charcoal" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-sm mini-scrollbar max-h-[350px]">
            {chatMessages.map((msg, i) => (
              <div 
                key={i} 
                className={`max-w-[80%] p-3 ${
                  msg.role === 'user' 
                    ? 'bg-gold/10 border border-gold/20 self-end text-white text-right' 
                    : 'bg-white/5 self-start text-white/80'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="bg-white/5 self-start p-3 text-white/40 animate-pulse">{t.chat.typing}</div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex gap-2 bg-charcoal">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t.chat.placeholder}
              className="flex-1 bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-gold transition-all text-sm"
              disabled={isTyping}
            />
            <button 
              type="submit"
              disabled={isTyping}
              className="bg-gold text-charcoal p-2 hover:bg-gold-light transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
