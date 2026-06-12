import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MeetingType } from '../types';
import { Phone, MessageCircle, Video, Mail, Smartphone, AtSign } from 'lucide-react';

interface MeetingTypeSelectorProps {
  selectedType: MeetingType;
  onTypeSelect: (type: MeetingType) => void;
  contactValue: string;
  onContactValueChange: (val: string) => void;
  validationError?: string;
}

type TabCategory = 'call' | 'text';

interface ChannelOption {
  id: MeetingType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  inputLabel?: string;
  inputPlaceholder?: string;
  infoMessage?: string;
}

export default function MeetingTypeSelector({
  selectedType,
  onTypeSelect,
  contactValue,
  onContactValueChange,
  validationError
}: MeetingTypeSelectorProps) {
  // Determine starting category based on selectedType
  const initialCategory: TabCategory = 
    ['ig_call', 'phone_call', 'zoom'].includes(selectedType) ? 'call' : 'text';
  
  const [activeCategory, setActiveCategory] = useState<TabCategory>(initialCategory);

  const callOptions: ChannelOption[] = [
    {
      id: 'ig_call',
      label: 'Instagram hovor',
      description: 'Zavoláme si priamo cez Instagram hovory',
      icon: AtSign,
      inputLabel: 'Tvoje Instagram meno (@...)',
      inputPlaceholder: '@tvoj_instagram'
    },
    {
      id: 'phone_call',
      label: 'Klasický telefonát',
      description: 'Zavolám ti na tvoje telefónne číslo',
      icon: Phone,
      inputLabel: 'Tvoje telefónne číslo',
      inputPlaceholder: '+421 900 123 456'
    },
    {
      id: 'zoom',
      label: 'Zoom stretnutie',
      description: 'Preberieme to tvárou v tvár na videohovore',
      icon: Video,
      infoMessage: 'Odkaz (link) na Zoom ti pošlem na tvoj email pred stretnutím.'
    }
  ];

  const textOptions: ChannelOption[] = [
    {
      id: 'ig_chat',
      label: 'Instagram správy',
      description: 'Pokecáme pohodlne v direct message (DM)',
      icon: MessageCircle,
      inputLabel: 'Tvoje Instagram meno (@...)',
      inputPlaceholder: '@tvoj_instagram'
    },
    {
      id: 'email',
      label: 'E-mail',
      description: 'Všetko podstatné vyriešime e-mailom',
      icon: Mail,
      infoMessage: 'Budeme si písať na tvoj e-mail, ktorý zadáš v nasledujúcom kroku.'
    },
    {
      id: 'sms',
      label: 'SMS správy',
      description: 'Zašlem ti informácie v klasických textovkách',
      icon: Smartphone,
      inputLabel: 'Tvoje telefónne číslo',
      inputPlaceholder: '+421 900 123 456'
    }
  ];

  // Active list based on categorical tab
  const activeOptions = activeCategory === 'call' ? callOptions : textOptions;

  const handleCategorySwitch = (cat: TabCategory) => {
    setActiveCategory(cat);
    // Auto select first option of the switched category
    const defaultOption = cat === 'call' ? 'ig_call' : 'ig_chat';
    onTypeSelect(defaultOption);
    onContactValueChange('');
  };

  // Get current active option details
  const currentOption = [...callOptions, ...textOptions].find(o => o.id === selectedType);

  // Auto add '@' to Instagram username if not typed
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if ((selectedType === 'ig_call' || selectedType === 'ig_chat') && val.length > 0) {
      if (!val.startsWith('@')) {
        val = '@' + val;
      }
    }
    onContactValueChange(val);
  };

  return (
    <div className="space-y-8">
      {/* Category selector tabs */}
      <div className="flex p-1.5 bg-[#0a0f1c] rounded-xl border border-slate-800/80 max-w-md mx-auto relative overflow-hidden">
        <button
          type="button"
          onClick={() => handleCategorySwitch('call')}
          className={`
            flex-1 py-3 px-4 rounded-lg font-display font-semibold text-sm transition-all flex items-center justify-center gap-2 relative z-10
            ${activeCategory === 'call' ? 'text-black' : 'text-slate-400 hover:text-white'}
          `}
        >
          {activeCategory === 'call' && (
            <motion.div
              layoutId="activeCategoryBg"
              className="absolute inset-0 bg-[#4ecdc4] rounded-lg -z-10 shadow-[0_0_15px_rgba(78,205,196,0.5)]"
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            />
          )}
          <Phone className="w-4 h-4" />
          HOVOR
        </button>

        <button
          type="button"
          onClick={() => handleCategorySwitch('text')}
          className={`
            flex-1 py-3 px-4 rounded-lg font-display font-semibold text-sm transition-all flex items-center justify-center gap-2 relative z-10
            ${activeCategory === 'text' ? 'text-black' : 'text-slate-400 hover:text-white'}
          `}
        >
          {activeCategory === 'text' && (
            <motion.div
              layoutId="activeCategoryBg"
              className="absolute inset-0 bg-[#4ecdc4] rounded-lg -z-10 shadow-[0_0_15px_rgba(78,205,196,0.5)]"
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            />
          )}
          <MessageCircle className="w-4 h-4" />
          PÍSANIE
        </button>
      </div>

      {/* Grid of channels under active category */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeOptions.map((opt) => {
          const IconComponent = opt.icon;
          const isSelected = selectedType === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onTypeSelect(opt.id);
                onContactValueChange('');
              }}
              className={`
                p-5 rounded-2xl border text-left flex flex-col justify-between h-44 relative overflow-hidden transition-all group cursor-pointer
                ${isSelected 
                  ? 'bg-[#131a2e] border-[#4ecdc4] shadow-[0_0_20px_rgba(78,205,196,0.15)]' 
                  : 'bg-[#131a2e]/60 border-slate-800/80 hover:border-slate-700 hover:bg-[#131a2e]'
                }
              `}
            >
              {/* Backglow element */}
              <div className={`
                absolute -right-6 -bottom-6 w-24 h-24 rounded-full filter blur-2xl transition-opacity duration-500
                ${isSelected ? 'bg-[#4ecdc4]/15 opacity-100' : 'bg-transparent opacity-0 group-hover:opacity-100 group-hover:bg-[#4ecdc4]/5'}
              `} />

              <div className="relative">
                <span className={`
                  p-3 rounded-xl inline-flex items-center justify-center transition-colors
                  ${isSelected ? 'bg-[#4ecdc4]/20 text-[#4ecdc4]' : 'bg-[#0a0f1c] text-slate-400 group-hover:text-white group-hover:bg-slate-800'}
                `}>
                  <IconComponent className="w-5 h-5" />
                </span>
              </div>

              <div>
                <h4 className={`font-display font-bold text-base mb-1 transition-colors ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {opt.label}
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed font-light">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic details sliding block */}
      <AnimatePresence mode="wait">
        {currentOption && (currentOption.inputLabel || currentOption.infoMessage) && (
          <motion.div
            key={currentOption.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="bg-[#131a2e] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              {currentOption.inputLabel ? (
                <div className="space-y-2">
                  <label htmlFor="dynamic_contact" className="block text-sm font-semibold tracking-wide text-slate-300">
                    {currentOption.inputLabel} <span className="text-[#4ecdc4]">*</span>
                  </label>
                  
                  <div className="relative max-w-lg">
                    <input
                      id="dynamic_contact"
                      type="text"
                      value={contactValue}
                      onChange={handleContactChange}
                      placeholder={currentOption.inputPlaceholder}
                      className={`
                        w-full bg-[#0a0f1c] text-white rounded-xl py-3.5 px-4 font-normal border shadow-inner transition-all focus:outline-none placeholder-slate-600
                        ${validationError 
                          ? 'border-red-500/80 focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                          : 'border-slate-800 focus:border-[#4ecdc4] focus:shadow-[0_0_10px_rgba(78,205,196,0.2)]'
                        }
                      `}
                    />
                  </div>
                  
                  {validationError ? (
                    <p className="text-red-400 text-xs mt-1">{validationError}</p>
                  ) : (
                    <p className="text-slate-500 text-xs">
                      Prosím uveď overiteľné a presné údaje, aby sme s tebou nadviazali bezproblémové spojenie.
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-[#0a0f1c]/80 p-4 rounded-xl border border-slate-800/60">
                  <span className="p-1 bg-[#4ecdc4]/15 rounded-lg text-[#4ecdc4] mt-0.5">
                    <Mail className="w-4 h-4" />
                  </span>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {currentOption.infoMessage}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
