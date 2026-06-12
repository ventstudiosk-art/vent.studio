import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { Booking, MeetingType } from './types';

// Importing custom child components
import CalendarElement from './components/CalendarElement';
import MeetingTypeSelector from './components/MeetingTypeSelector';
import AboutUserForm from './components/AboutUserForm';
import ReviewStep from './components/ReviewStep';
import SuccessView from './components/SuccessView';

// Lucide Icons
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  User as UserIcon, 
  Phone as PhoneIcon, 
  ArrowRight,
  Sparkles,
  Award,
  Video,
  Layers,
  HeartHandshake
} from 'lucide-react';

export default function App() {
  // Step indicator state (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Setting default date to tomorrow in local time format YYYY-MM-DD
  const getTomorrowDateString = () => {
    const today = new Date(2026, 5, 12); // local system day
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    const d = tomorrow.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // State fields
  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowDateString());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedType, setSelectedType] = useState<MeetingType>('ig_call');
  const [contactValue, setContactValue] = useState<string>('');
  
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [aboutBusiness, setAboutBusiness] = useState<string>('');
  const [topic, setTopic] = useState<string>('');

  // Active validation flags
  const [contactError, setContactError] = useState<string>('');
  const [userErrors, setUserErrors] = useState<{ name?: string; email?: string }>({});

  // Submission operations
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSucceeded, setHasSucceeded] = useState<boolean>(false);

  // Auto clean-up contact value errors upon change
  useEffect(() => {
    if (contactValue) setContactError('');
  }, [contactValue, selectedType]);

  // Clean-up user field errors
  useEffect(() => {
    if (name) setUserErrors(prev => ({ ...prev, name: undefined }));
  }, [name]);

  useEffect(() => {
    if (email) setUserErrors(prev => ({ ...prev, email: undefined }));
  }, [email]);

  // Dynamic validators
  const validateStep2 = (): boolean => {
    // If zoom or email, no extra fields are vital at this step.
    if (selectedType === 'zoom' || selectedType === 'email') {
      return true;
    }

    if (!contactValue.trim()) {
      setContactError('Tento údaj je povinný.');
      return false;
    }

    // IG Username must match standard handle starting with '@'.
    if (selectedType === 'ig_call' || selectedType === 'ig_chat') {
      if (!contactValue.startsWith('@')) {
        setContactError('Instagram handle musí začínať znakom @.');
        return false;
      }
      if (contactValue.length < 3) {
        setContactError('Zadaj prosím platné Instagram meno.');
        return false;
      }
    }

    // Phone calls and SMS requires number format.
    if (selectedType === 'phone_call' || selectedType === 'sms') {
      const phoneRegex = /^(\+?\d[\s-]?){9,15}$/;
      if (!phoneRegex.test(contactValue.trim())) {
        setContactError('Zadaj platný formát telefónneho čísla (napr. +421 900 123 456).');
        return false;
      }
    }

    setContactError('');
    return true;
  };

  const validateStep3 = (): boolean => {
    const errors: { name?: string; email?: string } = {};
    let isValid = true;

    if (!name.trim()) {
      errors.name = 'Meno je povinné.';
      isValid = false;
    }

    if (!email.trim()) {
      errors.email = 'E-mail je povinný.';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Zadaj platnú e-mailovú adresu.';
        isValid = false;
      }
    }

    setUserErrors(errors);
    return isValid;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedDate || !selectedTime) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setCurrentStep(4);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setSubmitError(null);
    }
  };

  // Perform Insert into Datastore bookings_v2
  const handleBookingSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // 1. Double check concurrently if this slot is already taken in database.
      const { data: existing, error: checkError } = await supabase
        .from('bookings_v2')
        .select('id')
        .eq('date', selectedDate)
        .eq('time', selectedTime);

      if (checkError) {
        throw new Error('Chyba pri kontrole obsadenosti termínu. Skús znova.');
      }

      if (existing && existing.length > 0) {
        setSubmitError('Zvolený termín už bol rezervovaný iným záujemcom. Prosím, vráť sa k prvému kroku a vyber si iný voľný čas.');
        setIsSubmitting(false);
        return;
      }

      // 2. Insert records to supabase
      const { error: insertError } = await supabase
        .from('bookings_v2')
        .insert([{
          date: selectedDate,
          time: selectedTime,
          name: name.trim(),
          email: email.trim(),
          meeting_type: selectedType,
          contact_value: contactValue.trim() || null,
          about_business: aboutBusiness.trim() || null,
          topic: topic.trim() || null
        }]);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(insertError.message || 'Nepodarilo sa vytvoriť rezerváciu.');
      }

      // Successfully saved booking
      setHasSucceeded(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Nastala neočakávaná chyba. Skontrolujte prosím pripojenie a skúste znova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedTime('');
    setContactValue('');
    setName('');
    setEmail('');
    setAboutBusiness('');
    setTopic('');
    setSubmitError(null);
    setHasSucceeded(false);
    setCurrentStep(1);
    
    // Smooth scroll back to the top where they started
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step names translation for UI Progress Bar
  const stepsList = [
    { num: 1, label: 'Termín & Čas' },
    { num: 2, label: 'Forma spojenia' },
    { num: 3, label: 'Údaje o tebe' },
    { num: 4, label: 'Potvrdenie' }
  ];

  return (
    <div className="min-h-screen bg-[#030612] text-white flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-300">
      
      {/* 1. Luxurious Glowing Midnight Frame Container */}
      <div className="glowing-panel-backdrop relative pb-20 pt-4 px-4 overflow-hidden">
        
        {/* Subtle decorative grid background layer */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40 mix-blend-overlay" />

        {/* Floating Abstract Light Spheres */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />

        {/* Modern Premium Navigation Header */}
        <header className="relative z-50 max-w-7xl mx-auto mb-12">
          <div className="flex items-center justify-between bg-slate-950/40 backdrop-blur-md px-6 py-3.5 rounded-full border border-white/5">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2b6bf3] flex items-center justify-center p-0.5 shadow-[0_0_15px_rgba(43,107,243,0.5)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-white flex items-center">
                VENT<span className="text-[#2b6bf3]">.</span>STUDIO
              </span>
            </div>

            {/* Navigation links inspired by AirLume */}
            <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-slate-300">
              <a href="#domov" className="hover:text-white transition-colors duration-200">Domov</a>
              <a href="#booking" className="hover:text-white transition-colors duration-200">Konzultácie</a>
              <a href="#bento-features" className="hover:text-white transition-colors duration-200">Nástroje</a>
              <a href="#bento-features" className="hover:text-white transition-colors duration-200">Ako to funguje</a>
            </nav>

            {/* Call to action */}
            <div className="flex items-center gap-4">
              <a href="#booking" className="px-5 py-2 bg-[#2b6bf3] hover:bg-blue-600 text-[13px] font-bold rounded-full transition-all duration-300 text-white shadow-lg shadow-blue-500/20 flex items-center gap-1.5">
                Vybrať termín ➔
              </a>
            </div>
          </div>
        </header>

        {/* Floating Badges from Mockup Image */}
        <div className="absolute top-1/3 left-[5%] hidden xl:block pointer-events-none select-none">
          <div className="px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-md text-pink-300 text-xs font-bold tracking-widest rounded-full shadow-2xl -rotate-12 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" />
            WEBSITE
          </div>
        </div>

        <div className="absolute top-1/2 left-[3%] hidden xl:block pointer-events-none select-none">
          <div className="px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-md text-cyan-300 text-xs font-bold tracking-widest rounded-full shadow-2xl rotate-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            UI / UX
          </div>
        </div>

        <div className="absolute bottom-1/4 right-[4%] hidden xl:block pointer-events-none select-none">
          <div className="px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-md text-[#2b6bf3] text-xs font-bold tracking-widest rounded-full shadow-2xl rotate-12 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            BOOKING
          </div>
        </div>

        {/* Hamida User Layout Badge */}
        <div className="absolute top-[28%] right-[6%] hidden xl:block pointer-events-none select-none">
          <div className="bg-slate-900/45 border border-white/10 backdrop-blur-lg rounded-full pr-5 pl-2 py-1.5 flex items-center gap-3 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120" 
              alt="Design avatar" 
              className="w-10 h-10 rounded-full border border-blue-500 object-cover" 
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-white font-bold text-xs">@ventstudio_sk</p>
              <p className="text-slate-400 text-[10px]">Osobný rast &amp; Brand Dizajn</p>
            </div>
          </div>
        </div>

        {/* Hero Headline Panel */}
        {!hasSucceeded && (
          <section className="relative z-10 text-center max-w-4xl mx-auto space-y-6 pt-4 mb-16">
            
            {/* Pill Accent */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-950/60 border border-white/10 rounded-full text-slate-300 text-xs font-medium tracking-wide shadow-xl">
              <span className="px-1.5 py-0.5 rounded-full bg-[#2b6bf3]/20 text-[#2b6bf3] font-bold text-[10px]">NOVÉ</span>
              Štartuj Svoj Biznis S VENT.STUDIO
            </div>

            {/* Massive modern typography with high line height */}
            <h1 className="font-display text-4xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-3xl mx-auto">
              Ušetri Čas &amp; Peniaze <br />
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-200">
                Na Každom Kroku
              </span>
            </h1>

            {/* Underline Subtext */}
            <p className="text-slate-400 font-light text-base md:text-[17px] max-w-2xl mx-auto leading-relaxed">
              Objavte najrýchlejšie spôsoby ako zarezervovať a naplánovať bezplatnú konzultáciu, získajte personalizované odporúčania pre rast a budujte silnejšie podnikanie s modernými nástrojmi.
            </p>

            {/* Quick Action Button with circular trailing arrow icon */}
            <div className="pt-2 flex justify-center">
              <a 
                href="#booking" 
                className="group px-6 py-3.5 bg-[#2b6bf3] hover:bg-blue-600 text-sm font-bold rounded-full transition-all duration-300 text-white flex items-center gap-3.5 shadow-[0_15px_30px_rgba(43,107,243,0.35)]"
              >
                <span>Skočiť Na Rezerváciu Času</span>
                <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center p-0.5 transition-transform group-hover:translate-x-1.5 duration-300 text-black">
                  ➔
                </span>
              </a>
            </div>
          </section>
        )}

        {/* Dynamic Interactive Booking Section */}
        <section id="booking" className="max-w-5xl mx-auto">
          {hasSucceeded ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <SuccessView 
                bookingData={{
                  date: selectedDate,
                  time: selectedTime,
                  name,
                  email,
                  meeting_type: selectedType,
                  contact_value: contactValue,
                  about_business: aboutBusiness,
                  topic
                }}
                onReset={handleReset}
              />
            </motion.div>
          ) : (
            <div className="space-y-8">
              
              {/* Stepper progress indicator with glows */}
              <div className="bg-[#131a2e]/40 border border-slate-800 p-4 rounded-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  {/* Step status labels */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#2b6bf3] text-xs font-mono font-bold tracking-widest uppercase">REZERVÁCIA</span>
                    <span className="text-slate-700 font-bold">/</span>
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">KROK {currentStep} z 4</span>
                  </div>

                  {/* Visual Timeline Nodes */}
                  <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-1">
                    {stepsList.map((step, idx) => {
                      const isCompleted = currentStep > step.num;
                      const isActive = currentStep === step.num;
                      return (
                        <React.Fragment key={step.num}>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`
                              w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all
                              ${isCompleted ? 'bg-gradient-to-br from-[#2b6bf3] to-blue-500 text-white font-extrabold shadow-[0_0_10px_rgba(43,107,243,0.3)]' : ''}
                              ${isActive ? 'bg-[#131a2e] border-2 border-[#2b6bf3] text-[#2b6bf3] font-bold shadow-[0_0_10px_rgba(43,107,243,0.25)] scale-110' : ''}
                              ${!isCompleted && !isActive ? 'bg-[#0a0f1c] text-slate-500 border border-slate-800' : ''}
                            `}>
                              {isCompleted ? '✓' : step.num}
                            </span>
                            <span className={`text-xs font-medium ${isActive ? 'text-[#2b6bf3] font-semibold' : 'text-slate-500'}`}>
                              {step.label}
                            </span>
                          </div>
                          {idx < stepsList.length - 1 && (
                            <span className={`w-6 h-px shrink-0 transition-colors ${currentStep > step.num ? 'bg-[#2b6bf3]' : 'bg-slate-800'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Steps Card Frame with AnimatePresence */}
              <div className="min-h-[380px]">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CalendarElement
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        selectedTime={selectedTime}
                        onTimeSelect={setSelectedTime}
                      />
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-4 mb-6">
                        <span className="text-xs font-bold text-[#2b6bf3] uppercase tracking-wide">02. KROK : PREFEROVANÝ SPÔSOB</span>
                        <h2 className="font-display text-2xl font-bold tracking-tight text-white">Ako ti to vyhovuje?</h2>
                        <p className="text-slate-400 text-sm font-light">Vyber si kategóriu spojenia a preferovanú platformu.</p>
                      </div>
                      <MeetingTypeSelector
                        selectedType={selectedType}
                        onTypeSelect={setSelectedType}
                        contactValue={contactValue}
                        onContactValueChange={setContactValue}
                        validationError={contactError}
                      />
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-4 mb-6">
                        <span className="text-xs font-bold text-[#2b6bf3] uppercase tracking-wide">03. KROK : PREDSTAVENIE PROJEKTU</span>
                        <h2 className="font-display text-2xl font-bold tracking-tight text-white">Napíš nám o sebe</h2>
                        <p className="text-slate-400 text-sm font-light">Zadaj svoje základné údaje a priblíž nám ciele stretnutia.</p>
                      </div>
                      <AboutUserForm
                        name={name}
                        onNameChange={setName}
                        email={email}
                        onEmailChange={setEmail}
                        aboutBusiness={aboutBusiness}
                        onAboutBusinessChange={setAboutBusiness}
                        topic={topic}
                        onTopicChange={setTopic}
                        errors={userErrors}
                      />
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ReviewStep
                        bookingData={{
                          date: selectedDate,
                          time: selectedTime,
                          name,
                          email,
                          meeting_type: selectedType,
                          contact_value: contactValue,
                          about_business: aboutBusiness,
                          topic
                        }}
                        isSubmitting={isSubmitting}
                        onSubmit={handleBookingSubmit}
                        submitError={submitError}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Action Buttons footer inside Step block */}
              <div className="pt-6 border-t border-slate-900 flex justify-between items-center">
                {/* Back button */}
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSubmitting}
                  className={`
                    px-5 py-3 rounded-xl border font-semibold flex items-center gap-2 text-sm transition-all
                    ${currentStep === 1 
                      ? 'border-transparent text-slate-700 cursor-not-allowed opacity-0' 
                      : 'border-slate-800 text-slate-300 hover:text-white hover:border-[#2b6bf3]/40 hover:bg-[#131a2e] cursor-pointer'
                    }
                  `}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Naspäť
                </button>

                {/* Primary confirmation or next button */}
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentStep === 1 && !selectedTime}
                    className={`
                      px-6 py-3.5 rounded-xl font-display font-bold text-sm tracking-wide transition-all duration-300 flex items-center gap-2
                      ${(currentStep === 1 && !selectedTime)
                        ? 'bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#2b6bf3] to-blue-500 text-white cursor-pointer hover:shadow-[0_0_20px_rgba(43,107,243,0.4)] active:scale-95 font-extrabold shadow-lg'
                      }
                    `}
                  >
                    Pokračovať
                    <ChevronRight className="w-4 h-4 text-white stroke-[3]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBookingSubmit}
                    disabled={isSubmitting}
                    className="relative overflow-hidden group px-8 py-4 bg-gradient-to-r from-[#2b6bf3] via-blue-400 to-indigo-500 text-white font-display font-extrabold text-sm tracking-widest uppercase rounded-xl cursor-pointer hover:shadow-[0_0_25px_rgba(43,107,243,0.5)] active:scale-95 transition-all shadow-xl flex items-center gap-2.5 shrink-0"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-950/40 border-t-white rounded-full animate-spin" />
                        <span>Spracúvam...</span>
                      </div>
                    ) : (
                      <>
                        <span>Záväzne rezervovať</span>
                        <ArrowRight className="w-4 h-4 text-white stroke-[3]" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          )}
        </section>

      </div>

      {/* 3. High-Contrast Premium Bento-Grid Section (White/Soft Grey background like lower half of AirLume mock up) */}
      <section id="bento-features" className="bg-[#f8fafc] text-indigo-950 py-24 px-6 relative transition-all">
        
        {/* Soft elegant top radial fade mask */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#030612] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="px-3 py-1 bg-blue-100 text-[#2b6bf3] rounded-full text-xs font-bold tracking-wider uppercase">
              Rastový Plán &amp; Nástroje
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Strategické Funkcie,<br />Bezstarostná Spolupráca
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-light">
              Užívajte si bleskurýchly a transparentný priebeh rezervácie konzultácie s naším overeným systémom. Nechajte starosti o logistiku na nás.
            </p>
          </div>

          {/* Bento Grid: 8 unique cards modeled directly off the design layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Deep Blue Accent Card */}
            <div className="bg-[#0e173b] text-white p-6 rounded-3xl col-span-1 md:col-span-2 flex flex-col justify-between relative overflow-hidden group shadow-lg min-h-[220px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/35 pointer-events-none" />
              <div className="space-y-4">
                <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white p-2">
                  <Sparkles className="w-5 h-5 text-blue-300" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold mb-2">Bezplatný Strategický Náhľad</h3>
                  <p className="text-blue-100 text-xs font-light leading-relaxed">
                    Spustite analýzu svojho súčasného podnikania rovno počas 30-minútového hovoru. Navrhneme detailnú mapu vylepšení bez akýchkoľvek skrytých poplatkov.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs text-blue-300 font-semibold group-hover:text-white transition-colors">
                <span>Rezervovať terajší voľný slot</span> ➔
              </div>
            </div>

            {/* 2. Card: Smart Route -> Budovanie Brandu */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col justify-between group min-h-[220px]">
              <div className="space-y-4">
                <span className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 p-2">
                  <Award className="w-5 h-5 text-slate-700" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 mb-1">Osobná Značka</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Ujasnite si správny tón komunikácie a vybudujte si dôveryhodnosť, vďaka ktorej sa stanete jednotkou vo svojej špecifickej oblasti podnikania.
                  </p>
                </div>
              </div>
              <div className="pt-2 text-xs font-bold text-[#2b6bf3] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                <span>Dozvedieť sa viac</span> ➔
              </div>
            </div>

            {/* 3. Card: Loyalty Points Tracker -> Digitalizácia Služieb */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col justify-between group min-h-[220px]">
              <div className="space-y-4">
                <span className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 p-2">
                  <Layers className="w-5 h-5 text-slate-700" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 mb-1">Ciele a Štruktúra</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Pomôžeme vám zdigitalizovať vaše služby a navrhúť optimálnu cenotvorbu s cieľom zvýšiť predaje podnikového riešenia.
                  </p>
                </div>
              </div>
              <div className="pt-2 text-xs font-bold text-[#2b6bf3] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                <span>Dozvedieť sa viac</span> ➔
              </div>
            </div>

            {/* 4. Card: Personalized flight Alerts -> Automatické Upozornenia */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col justify-between group min-h-[220px]">
              <div className="space-y-4">
                <span className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 p-2">
                  <PhoneIcon className="w-5 h-5 text-slate-700" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 mb-1">Okamžitá SMS a E-mail</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Náš systém vám po úspešnej rezervácii okamžite odošle potvrdzujúcu notifikáciu. Žiadne zmeškané termíny či zábudlivosť.
                  </p>
                </div>
              </div>
              <div className="pt-2 text-xs font-bold text-[#2b6bf3] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                <span>Dozvedieť sa viac</span> ➔
              </div>
            </div>

            {/* 5. Card: Rewards redemption -> Sila Spolupráce */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col justify-between group min-h-[220px]">
              <div className="space-y-4">
                <span className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 p-2">
                  <HeartHandshake className="w-5 h-5 text-slate-700" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 mb-1">Human-Led Prístup</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Sustreďujeme sa čisto na reálne a fungujúce riešenia šité na mieru pre váš konkrétny trh a rozpočet, bez korporátnych formalít.
                  </p>
                </div>
              </div>
              <div className="pt-2 text-xs font-bold text-[#2b6bf3] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                <span>Dozvedieť sa viac</span> ➔
              </div>
            </div>

            {/* 6. Card: Live Comparison Engine -> Skvelá Rýchlosť */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col justify-between group min-h-[220px]">
              <div className="space-y-4">
                <span className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 p-2">
                  <Video className="w-5 h-5 text-slate-700" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 mb-1">Interaktívne Rozhranie</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Prekonajte priemerných konkurentov vďaka rýchlemu a modernému rozhraniu, ktoré eliminuje odpor vašich budúcich klientov.
                  </p>
                </div>
              </div>
              <div className="pt-2 text-xs font-bold text-[#2b6bf3] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                <span>Dozvedieť sa viac</span> ➔
              </div>
            </div>

            {/* 7. Card: Secure One-click checkout -> Integrácia databázy */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm col-span-1 md:col-span-2 flex flex-col justify-between group min-h-[220px]">
              <div className="space-y-4">
                <span className="w-10 h-10 rounded-2xl bg-[#2b6bf3]/10 text-[#2b6bf3] flex items-center justify-center p-2">
                  <CalendarIcon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-1">Zabezpečená Rezervácia s Reálnou Databázou</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Dáta ukladáme na bezpečné cloudové úložisko Supabase v reálnom čase. Keď je termín raz obsadený, okamžite sa uzamkne pre všetkých ostatných návštevcnikov, čím predchádzame duplicite.
                  </p>
                </div>
              </div>
              <div className="pt-2 text-xs font-bold text-[#2b6bf3] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                <span>Dozvedieť sa viac o našom tech-stacku</span> ➔
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Clean elegant humanist page footer */}
      <footer className="border-t border-slate-950 bg-[#030612] py-16 px-6 text-center text-slate-600 text-xs tracking-wider space-y-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-display font-medium text-[#2b6bf3] text-sm">
            © {new Date().getFullYear()} VENT.STUDIO. Všetky práva vyhradené. Rezervačné Podmienky
          </p>
          <p className="text-[10px] uppercase font-light max-w-sm text-slate-500 md:text-right">
            Navrhnuté pre moderný rast, digitálny rozvoj a neobmedzenú škálovateľnosť nápadov.
          </p>
        </div>
      </footer>

    </div>
  );
}
