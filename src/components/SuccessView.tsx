import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Home, Sparkles, Send, Check } from 'lucide-react';
import { Booking } from '../types';

interface SuccessViewProps {
  bookingData: Booking;
  onReset: () => void;
}

export default function SuccessView({
  bookingData,
  onReset
}: SuccessViewProps) {
  
  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return new Intl.DateTimeFormat('sk-SK', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
      }).format(dateObj);
    } catch {
      return dateStr;
    }
  };

  const getMeetingLabel = () => {
    switch (bookingData.meeting_type) {
      case 'ig_call': return 'Hovor cez Instagram';
      case 'phone_call': return 'Telefonát';
      case 'zoom': return 'Zoom videohovor';
      case 'ig_chat': return 'Správy na Instagrame';
      case 'email': return 'E-mail';
      case 'sms': return 'SMS správy';
      default: return bookingData.meeting_type;
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-8 px-4">
      
      {/* Animated Success Checkmark Ring */}
      <div className="relative inline-flex items-center justify-center">
        {/* Glow behind circles */}
        <div className="absolute inset-0 bg-blue-500/20 rounded-full filter blur-xl animate-pulse" />
        
        {/* Outer rotating/glowing dashed border */}
        <motion.div
          initial={{ rotate: 180, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 360, scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-24 h-24 rounded-full border border-blue-500/40 border-dashed absolute"
        />

        {/* Mid solid ring with growth scale */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-[#131a2e] border-2 border-[#2b6bf3] flex items-center justify-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 12 }}
            className="w-12 h-12 bg-gradient-to-br from-[#2b6bf3] to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(43,107,243,0.6)]"
          >
            <Check className="w-6 h-6 text-white stroke-[3]" />
          </motion.div>
        </motion.div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <span>Rezervácia úspešná!</span>
          <Sparkles className="w-6 h-6 text-[#2b6bf3] animate-bounce" />
        </h2>
        <p className="text-slate-300 font-medium text-lg">
          ✓ Ozvem sa ti v najkratšom možnom čase.
        </p>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Ďakujeme za prejavenú dôveru. Tvoja nezáväzná konzultácia pre VENT.STUDIO prebehne v zarezervovanom čase.
        </p>
      </div>

      {/* Recapitulation panel */}
      <div className="bg-[#131a2e] border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden text-left max-w-lg mx-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-[#2b6bf3] to-blue-500/20" />
        
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800/60">
          <span className="text-sm font-semibold text-slate-400">Sumár stretnutia</span>
          <span className="text-xs bg-blue-500/15 text-[#2b6bf3] py-1 px-3 rounded-full font-semibold">Potvrdené</span>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="p-2 bg-[#0a0f1c] text-slate-400 rounded-lg shrink-0">
              <Calendar className="w-5 h-5 text-[#2b6bf3]" />
            </span>
            <div>
              <span className="text-xs text-slate-500 block">Dátum konania</span>
              <span className="text-white text-sm font-bold">{getFormattedDate(bookingData.date)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="p-2 bg-[#0a0f1c] text-slate-400 rounded-lg shrink-0">
              <Clock className="w-5 h-5 text-[#2b6bf3]" />
            </span>
            <div>
              <span className="text-xs text-slate-500 block">Čas konania</span>
              <span className="text-[#2b6bf3] font-mono text-sm font-bold">{bookingData.time}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="p-2 bg-[#0a0f1c] text-slate-400 rounded-lg shrink-0">
              <Send className="w-5 h-5 text-[#2b6bf3]" />
            </span>
            <div>
              <span className="text-xs text-slate-500 block">Dohodnutá komunikácia</span>
              <span className="text-white text-sm font-bold">{getMeetingLabel()}</span>
              {bookingData.contact_value && (
                <span className="text-[#2b6bf3] font-mono text-xs block mt-0.5">({bookingData.contact_value})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Button resetting/new booking -> Návrat domov */}
      <div className="pt-4">
        <button
          type="button"
          onClick={onReset}
          className="px-8 py-3.5 rounded-full bg-[#2b6bf3] hover:bg-blue-600 text-white font-bold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 cursor-pointer inline-flex items-center gap-2.5 text-sm"
        >
          <Home className="w-4 h-4" />
          Návrat domov
        </button>
      </div>

    </div>
  );
}
