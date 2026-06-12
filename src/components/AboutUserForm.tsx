import React from 'react';
import { User, Mail, Sparkles, HelpCircle } from 'lucide-react';

interface AboutUserFormProps {
  name: string;
  onNameChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  aboutBusiness: string;
  onAboutBusinessChange: (val: string) => void;
  topic: string;
  onTopicChange: (val: string) => void;
  errors: {
    name?: string;
    email?: string;
  };
}

export default function AboutUserForm({
  name,
  onNameChange,
  email,
  onEmailChange,
  aboutBusiness,
  onAboutBusinessChange,
  topic,
  onTopicChange,
  errors
}: AboutUserFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Name and Email section */}
      <div className="bg-[#131a2e] rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/20 via-[#4ecdc4]/60 to-teal-500/20" />
        
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-[#4ecdc4]" />
          <h3 className="font-display text-lg font-bold text-white tracking-wide">
            Základné údaje
          </h3>
        </div>

        {/* Name input */}
        <div className="space-y-2">
          <label htmlFor="user-name" className="block text-sm font-semibold text-slate-300">
            Tvoje meno <span className="text-[#4ecdc4]">*</span>
          </label>
          <div className="relative">
            <input
              id="user-name"
              type="text"
              required
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="napr. Peter Novák"
              className={`
                w-full bg-[#0a0f1c] text-white rounded-xl py-3.5 px-4 font-normal border shadow-inner transition-all focus:outline-none placeholder-slate-600
                ${errors.name 
                  ? 'border-red-500/80 focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                  : 'border-slate-800 focus:border-[#4ecdc4] focus:shadow-[0_0_10px_rgba(78,205,196,0.2)]'
                }
              `}
            />
          </div>
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email input */}
        <div className="space-y-2">
          <label htmlFor="user-email" className="block text-sm font-semibold text-slate-300">
            E-mailová adresa <span className="text-[#4ecdc4]">*</span>
          </label>
          <div className="relative">
            <input
              id="user-email"
              type="email"
              required
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="napr. peter@novak.sk"
              className={`
                w-full bg-[#0a0f1c] text-white rounded-xl py-3.5 px-4 font-normal border shadow-inner transition-all focus:outline-none placeholder-slate-600
                ${errors.email 
                  ? 'border-red-500/80 focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                  : 'border-slate-800 focus:border-[#4ecdc4] focus:shadow-[0_0_10px_rgba(78,205,196,0.2)]'
                }
              `}
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          <p className="text-slate-500 text-[11px] leading-relaxed">
            * Email slúži pre zaslanie potvrdenia o rezervácii a dôležitých odkazov.
          </p>
        </div>
      </div>

      {/* About Business and Topic section */}
      <div className="bg-[#131a2e] rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/20 via-[#4ecdc4]/60 to-teal-500/20" />
        
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[#4ecdc4]" />
          <h3 className="font-display text-lg font-bold text-white tracking-wide">
            Kontext stretnutia
          </h3>
        </div>

        {/* About Business textarea */}
        <div className="space-y-2">
          <label htmlFor="about-business" className="block text-sm font-semibold text-slate-300 flex items-center gap-1.5">
            Čomu sa venuješ?
            <span className="text-[11px] text-slate-500 font-normal">(osobná značka, biznis...)</span>
          </label>
          <textarea
            id="about-business"
            rows={3}
            value={aboutBusiness}
            onChange={(e) => onAboutBusinessChange(e.target.value)}
            placeholder="Napr.: Som grafik na voľnej nohe, budujem si osobnú značku a chcem pritiahnuť bonitnejších klientov."
            className="w-full bg-[#0a0f1c] text-white rounded-xl py-3 px-4 font-normal border border-slate-800 focus:border-[#4ecdc4] focus:shadow-[0_0_10px_rgba(78,205,196,0.2)] transition-all focus:outline-none placeholder-slate-600 resize-none text-sm leading-relaxed"
          />
        </div>

        {/* Topic textarea */}
        <div className="space-y-2">
          <label htmlFor="meeting-topic" className="block text-sm font-semibold text-slate-300 flex items-center gap-1.5">
            Čo by si chcel prebrať?
            <span className="text-[11px] text-slate-500 font-normal">(hlavný problém, ciele)</span>
          </label>
          <textarea
            id="meeting-topic"
            rows={2}
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="Napr.: Ako nastaviť správny pricing a odlíšiť sa od konkurencie."
            className="w-full bg-[#0a0f1c] text-white rounded-xl py-3 px-4 font-normal border border-slate-800 focus:border-[#4ecdc4] focus:shadow-[0_0_10px_rgba(78,205,196,0.2)] transition-all focus:outline-none placeholder-slate-600 resize-none text-sm leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
