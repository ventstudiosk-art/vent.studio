import React, { useState } from 'react';
import { Booking } from '../types';
import { Calendar, Clock, Phone, AtSign, Video, MessageCircle, Mail, Smartphone, User, FileText, Check, AlertCircle } from 'lucide-react';

interface ReviewStepProps {
  bookingData: Booking;
  isSubmitting: boolean;
  onSubmit: () => void;
  submitError: string | null;
}

export default function ReviewStep({
  bookingData,
  isSubmitting,
  onSubmit,
  submitError
}: ReviewStepProps) {
  
  // Format meeting type label for review list
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

  // Select matching icon for review details
  const getMeetingIcon = () => {
    switch (bookingData.meeting_type) {
      case 'ig_call': return AtSign;
      case 'phone_call': return Phone;
      case 'zoom': return Video;
      case 'ig_chat': return MessageCircle;
      case 'email': return Mail;
      case 'sms': return Smartphone;
      default: return Mail;
    }
  };

  const IconComponent = getMeetingIcon();

  // Helper to format slovak date
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

  return (
    <div className="space-y-6">
      <div className="bg-[#131a2e] rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/20 via-[#4ecdc4]/60 to-teal-500/20" />
        
        <h3 className="font-display text-lg font-bold text-white mb-6 tracking-wide">
          Rekapitulácia tvojej rezervácie
        </h3>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Chosen Date & Time */}
          <div className="bg-[#0a0f1c] rounded-xl p-4 border border-slate-800/80 flex items-start gap-3.5">
            <span className="p-3 bg-[#4ecdc4]/15 rounded-xl text-[#4ecdc4]">
              <Calendar className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Termín konzultácie</p>
              <p className="text-white text-sm font-semibold leading-relaxed">
                {getFormattedDate(bookingData.date)}
              </p>
              <p className="text-[#4ecdc4] font-mono font-bold text-lg mt-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {bookingData.time}
              </p>
            </div>
          </div>

          {/* Chosen Connection Method */}
          <div className="bg-[#0a0f1c] rounded-xl p-4 border border-slate-800/80 flex items-start gap-3.5">
            <span className="p-3 bg-[#4ecdc4]/15 rounded-xl text-[#4ecdc4]">
              <IconComponent className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Forma spojenia</p>
              <p className="text-white text-sm font-semibold leading-relaxed">
                {getMeetingLabel()}
              </p>
              {bookingData.contact_value ? (
                <p className="text-[#4ecdc4] font-mono text-sm mt-1 bg-[#4ecdc4]/10 py-0.5 px-2 rounded-md inline-block">
                  {bookingData.contact_value}
                </p>
              ) : (
                <p className="text-slate-400 text-xs mt-1 italic">
                  Kontakt ti zašleme na e-mail: <span className="font-medium text-slate-300">{bookingData.email}</span>
                </p>
              )}
            </div>
          </div>

          {/* User basic info */}
          <div className="bg-[#0a0f1c] rounded-xl p-4 border border-slate-800/80 flex items-start gap-3.5 md:col-span-2">
            <span className="p-3 bg-[#4ecdc4]/15 rounded-xl text-[#4ecdc4]">
              <User className="w-5 h-5" />
            </span>
            <div className="w-full">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Objednávateľ</p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6">
                <div>
                  <span className="text-white font-bold text-base">{bookingData.name}</span>
                  <span className="text-slate-400 text-sm block sm:inline sm:ml-3">({bookingData.email})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Substantial description content if filled */}
          {(bookingData.about_business || bookingData.topic) && (
            <div className="bg-[#0a0f1c] rounded-xl p-4 border border-slate-800/80 md:col-span-2 space-y-3.5">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
                <FileText className="w-3.5 h-3.5 text-[#4ecdc4]" /> Popis stretnutia
              </p>

              {bookingData.about_business && (
                <div>
                  <h4 className="text-xs text-slate-400 font-semibold mb-1">Čomu sa venuješ:</h4>
                  <p className="text-slate-300 text-sm leading-relaxed italic bg-slate-900/40 p-3 rounded-lg border border-slate-800/30">
                    "{bookingData.about_business}"
                  </p>
                </div>
              )}

              {bookingData.topic && (
                <div>
                  <h4 className="text-xs text-slate-400 font-semibold mb-1">Čo by si chcel prebrať:</h4>
                  <p className="text-slate-300 text-sm leading-relaxed italic bg-slate-900/40 p-3 rounded-lg border border-slate-800/30">
                    "{bookingData.topic}"
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Database validation errors or connection failures */}
        {submitError && (
          <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-300 rounded-xl flex items-start gap-2.5 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-200">Rezervačná chyba:</p>
              <p className="text-xs">{submitError}</p>
            </div>
          </div>
        )}

        {/* Actions info info boxes */}
        <div className="text-xs text-slate-400 leading-relaxed max-w-2xl bg-slate-900/40 p-4 rounded-xl border border-slate-800/40 list-disc list-inside mb-4">
          <p className="font-semibold text-white mb-1">📌 Čo sa stane po kliknutí na "Záväzne rezervovať"?</p>
          <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
            <li>Termín sa okamžite a natrvalo zablokuje v databáze VENT.STUDIO.</li>
            <li>Na zadaný e-mail ti zašleme automatické potvrdenie o rezervácii stretnutia.</li>
            <li>Ozveme sa ti cez zvolenú formu spojenia najneskôr do 24 hodín s bližšími pokynmi.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
