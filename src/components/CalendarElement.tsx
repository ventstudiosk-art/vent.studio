import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';

interface CalendarElementProps {
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  selectedTime: string; // HH:MM
  onTimeSelect: (time: string) => void;
}

const SLOT_TIMES = [
  '16:00', '16:30', '17:00', '17:30', 
  '18:00', '18:30', '19:00', '19:30'
];

const MONTH_NAMES_SK = [
  'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
  'Júl', 'August', 'September', 'Október', 'November', 'December'
];

const WEEKDAYS_SK = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

export default function CalendarElement({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect
}: CalendarElementProps) {
  // Use today's system date based on the system meta (2026-06-12)
  const today = new Date(2026, 5, 12); // June is 5 (0-indexed)
  
  // Tomorrow is 2026-06-13
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);

  // Max date is tomorrow + 60 days
  const maxDate = new Date(minDate);
  maxDate.setDate(minDate.getDate() + 60);

  // State to track current visible year and month in the calendar
  const [currentYear, setCurrentYear] = useState(minDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(minDate.getMonth()); // 0-indexed

  // Bookings that are currently occupied for the selected date
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Fetch occupied slots for selectedDate from Supabase
  const fetchOccupiedSlots = async (dateStr: string) => {
    if (!dateStr) return;
    setIsLoadingSlots(true);
    try {
      const { data, error } = await supabase
        .from('bookings_v2')
        .select('time')
        .eq('date', dateStr);

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        const times = (data || []).map((row: { time: string }) => {
          // Normalize DB time to HH:MM (e.g. from 16:30:00 or similar)
          if (row.time && row.time.includes(':')) {
            const parts = row.time.split(':');
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
          }
          return row.time;
        });
        setOccupiedSlots(times);
      }
    } catch (err) {
      console.error('Failed to load slots', err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Re-fetch when selectedDate changes or upon real-time events
  useEffect(() => {
    fetchOccupiedSlots(selectedDate);
  }, [selectedDate]);

  // Set up Supabase Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings_v2' },
        () => {
          // Re-fetch whenever bookings table changes anywhere
          fetchOccupiedSlots(selectedDate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  // Build calendar matrix
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonthIndex = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, etc.
    const day = new Date(year, month, 1).getDay();
    // Re-index to: 0 = Monday, 1 = Tuesday ... 6 = Sunday
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIdx = getFirstDayOfMonthIndex(currentYear, currentMonth);

  const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIdx);

  const prevDays = Array.from({ length: firstDayIdx }, (_, i) => {
    const dateNum = daysInPrevMonth - firstDayIdx + 1 + i;
    return {
      day: dateNum,
      month: prevMonthIdx,
      year: prevMonthYear,
      isCurrentMonth: false,
    };
  });

  const currentDays = Array.from({ length: daysInMonth }, (_, i) => {
    return {
      day: i + 1,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
    };
  });

  // Combine calendar items, filling the grid with next month's days if needed
  const totalDays = [...prevDays, ...currentDays];
  const remainingSlots = 42 - totalDays.length; // standard 6-row grid
  const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  
  const nextDays = Array.from({ length: remainingSlots }, (_, i) => {
    return {
      day: i + 1,
      month: nextMonthIdx,
      year: nextMonthYear,
      isCurrentMonth: false,
    };
  });

  const totalGrid = [...totalDays, ...nextDays];

  // Utility to format date to string YYYY-MM-DD
  const formatDateString = (y: number, m: number, d: number) => {
    const yearStr = y.toString();
    const monthStr = (m + 1).toString().padStart(2, '0');
    const dayStr = d.toString().padStart(2, '0');
    return `${yearStr}-${monthStr}-${dayStr}`;
  };

  // Check if a cell's date is within allowable booking bounds [minDate, maxDate]
  const isDateSelectable = (y: number, m: number, d: number) => {
    const cellDate = new Date(y, m, d);
    // Reset times for strict day comparison
    const compareCell = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
    const compareMin = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    const compareMax = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    return compareCell >= compareMin && compareCell <= compareMax;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Helper to get formatted day title in Slovak
  const getSelectedDateDisplay = () => {
    if (!selectedDate) return 'Vyber dátum z kalendára';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formatted = new Intl.DateTimeFormat('sk-SK', options).format(dateObj);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Calendar Grid card */}
      <div className="lg:col-span-7 bg-[#131a2e] rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/20 via-[#4ecdc4]/60 to-teal-500/20" />
        
        {/* Month selector header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#4ecdc4]" />
            <h3 className="font-display text-lg font-bold text-white tracking-wide">
              {MONTH_NAMES_SK[currentMonth]} {currentYear}
            </h3>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              type="button"
              className="p-2 rounded-lg bg-[#0e1324] border border-slate-800 hover:border-[#4ecdc4] hover:text-[#4ecdc4] transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              type="button"
              className="p-2 rounded-lg bg-[#0e1324] border border-slate-800 hover:border-[#4ecdc4] hover:text-[#4ecdc4] transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {WEEKDAYS_SK.map((wd) => (
            <div key={wd} className="text-slate-500 font-display text-xs font-semibold py-1">
              {wd}
            </div>
          ))}
        </div>

        {/* Grid content */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {totalGrid.map((cell, idx) => {
            const dateStr = formatDateString(cell.year, cell.month, cell.day);
            const isSelectable = isDateSelectable(cell.year, cell.month, cell.day);
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => isSelectable && onDateSelect(dateStr)}
                disabled={!isSelectable}
                className={`
                  relative py-3 rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all group
                  ${!cell.isCurrentMonth ? 'text-slate-600' : 'text-slate-300'}
                  ${isSelected ? 'bg-gradient-to-br from-[#4ecdc4]/20 to-[#4ecdc4]/10 text-[#4ecdc4] border-2 border-[#4ecdc4] font-bold shadow-[0_0_15px_rgba(78,205,196,0.3)]' : 'border border-transparent'}
                  ${isSelectable && !isSelected ? 'hover:border-slate-700 hover:text-white cursor-pointer hover:bg-slate-800/40 bg-[#0c101f]/60' : ''}
                  ${!isSelectable ? 'text-slate-700 bg-transparent opacity-20 cursor-not-allowed' : ''}
                `}
              >
                <span>{cell.day}</span>
                {isSelectable && !isSelected && (
                  <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#4ecdc4]/40 group-hover:bg-[#4ecdc4] transition-colors" />
                )}
                {isSelected && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#4ecdc4] shadow-[0_0_8px_#4ecdc4]" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Footer info legend */}
        <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4ecdc4]" />
            <span>Voľné dni pre rezervácie</span>
          </div>
          <div>
            <span>Max 60 dní vopred</span>
          </div>
        </div>
      </div>

      {/* Time Slots card */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div className="bg-[#131a2e] rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden backdrop-blur-md flex-1 flex flex-col h-full">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/20 via-[#4ecdc4]/60 to-teal-500/20" />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-[#4ecdc4]" />
              <h3 className="font-display text-lg font-bold text-white tracking-wide">
                Časové sloty
              </h3>
            </div>
            
            {/* Show formatted Slovak date name */}
            <p className="text-[#4ecdc4] font-medium text-sm mb-6 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {getSelectedDateDisplay()}
            </p>
          </div>

          {isLoadingSlots ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-[#4ecdc4]/20 border-t-[#4ecdc4] animate-spin mb-3" />
              <span className="text-slate-400 text-sm">Načítavam voľné časy...</span>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-2 gap-3 mb-6">
              {SLOT_TIMES.map((time) => {
                const isOccupied = occupiedSlots.includes(time);
                const isSelected = selectedTime === time;

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={isOccupied}
                    onClick={() => onTimeSelect(time)}
                    className={`
                      py-4 px-3 rounded-xl font-mono text-sm tracking-widest font-bold flex flex-col items-center justify-center transition-all
                      ${isOccupied 
                        ? 'bg-slate-900 border border-slate-800/40 text-slate-600 line-through cursor-not-allowed opacity-40' 
                        : isSelected 
                          ? 'bg-gradient-to-r from-[#4ecdc4]/20 to-[#4ecdc4]/10 text-[#4ecdc4] border-2 border-[#4ecdc4] shadow-[0_0_15px_rgba(78,205,196,0.25)]' 
                          : 'bg-[#0a0f1c]/80 text-[#4ecdc4] border border-[#4ecdc4]/30 hover:border-[#4ecdc4] hover:bg-[#131a2e] hover:shadow-[0_0_10px_rgba(78,205,196,0.15)] cursor-pointer'
                      }
                    `}
                  >
                    <span>{time}</span>
                    <span className="text-[10px] uppercase tracking-normal font-sans font-medium mt-1">
                      {isOccupied ? 'Obsadený' : isSelected ? 'Vybraný' : 'Voľný'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="text-xs text-slate-400 leading-relaxed bg-[#0a0f1c]/60 p-3 rounded-xl border border-slate-800/40">
            💡 <span className="font-semibold text-white">Real-Time update:</span> Keď si niekto zarezervuje termín, slot sa ihneď uzamkne bez potreby obnovenia stránky.
          </div>
        </div>
      </div>
    </div>
  );
}
