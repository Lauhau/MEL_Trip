import React, { useState, useEffect, useRef } from 'react';
import { DayItinerary, TripEvent } from '../types';
import { PlusIcon, TrashIcon, SunIcon, EditIcon, CloudRainIcon, MapIcon, LinkIcon, FoodIcon, TransportIcon, HotelIcon, ActivityIcon, PlaneIcon } from './Icons';
import { getSuggestionForLocation } from '../services/geminiService';

interface ItineraryViewProps {
  days: DayItinerary[];
  setDays: React.Dispatch<React.SetStateAction<DayItinerary[]>>;
  onMapClick: (dayIndex: number) => void;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({ days, setDays, onMapClick }) => {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TripEvent | null>(null);
  const [newEventData, setNewEventData] = useState<Partial<TripEvent>>({
    time: '09:00',
    title: '',
    location: '',
    type: 'activity',
    bookingUrl: '',
    navLink: ''
  });
  const [aiTip, setAiTip] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentDay = days[selectedDay];

  // Auto-select day based on current date
  useEffect(() => {
    if (days.length === 0 || hasAutoSelected) return;

    const now = new Date();
    // Format YYYY-MM-DD based on local time
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const todayIndex = days.findIndex(d => d.date === todayStr);

    if (todayIndex !== -1) {
        // Case 1: During the trip
        setSelectedDay(todayIndex);
    } else {
        // Case 2: Check boundaries
        const lastDayStr = days[days.length - 1].date;
        if (todayStr > lastDayStr) {
            // After trip -> Show last day
            setSelectedDay(days.length - 1);
        } 
        // Before trip -> Default is 0 (set in useState), so no action needed
    }
    setHasAutoSelected(true);
  }, [days, hasAutoSelected]);

  // Scroll active day button into view
  useEffect(() => {
      if (scrollContainerRef.current) {
          const buttons = scrollContainerRef.current.children;
          if (buttons[selectedDay]) {
              buttons[selectedDay].scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'nearest', 
                  inline: 'center' 
              });
          }
      }
  }, [selectedDay]);

  // Memo Handlers - Optimized for performance
  
  // Internal state for Memo to prevent lag
  const [localMemo, setLocalMemo] = useState(currentDay?.tips || '');
  
  // Sync local memo when day changes
  useEffect(() => {
      setLocalMemo(currentDay?.tips || '');
  }, [currentDay]);

  const handleMemoBlur = () => {
      if (localMemo !== currentDay.tips) {
          const updatedDays = [...days];
          updatedDays[selectedDay].tips = localMemo;
          setDays(updatedDays); // Trigger DB save
      }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setNewEventData({ time: '09:00', title: '', location: '', type: 'activity', bookingUrl: '', navLink: '' });
    setAiTip('');
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: TripEvent) => {
    setEditingEvent(event);
    setNewEventData({ ...event });
    setAiTip('');
    setIsModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (!newEventData.title || !newEventData.time) return;

    const updatedDays = [...days];
    const dayEvents = updatedDays[selectedDay].events;

    if (editingEvent) {
      // Edit mode
      const index = dayEvents.findIndex(e => e.id === editingEvent.id);
      if (index !== -1) {
        dayEvents[index] = { ...editingEvent, ...newEventData } as TripEvent;
      }
    } else {
      // Create mode
      const newEvent: TripEvent = {
        id: Date.now().toString(),
        time: newEventData.time!,
        title: newEventData.title!,
        location: newEventData.location || '',
        type: newEventData.type as any,
        notes: newEventData.notes,
        bookingUrl: newEventData.bookingUrl,
        navLink: newEventData.navLink,
        flightDetails: newEventData.flightDetails
      };
      dayEvents.push(newEvent);
    }
    
    // Sort events by time
    dayEvents.sort((a, b) => a.time.localeCompare(b.time));
    
    setDays(updatedDays);
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedDays = [...days];
    updatedDays[selectedDay].events = updatedDays[selectedDay].events.filter(e => e.id !== eventId);
    setDays(updatedDays);
  };

  const getAiSuggestion = async () => {
    if (!newEventData.location) return;
    setLoadingAi(true);
    const tip = await getSuggestionForLocation(newEventData.location, newEventData.time || 'daytime');
    setAiTip(tip);
    setLoadingAi(false);
  }

  const handleNavigate = (event: TripEvent) => {
    if (event.navLink) {
        window.open(event.navLink, '_blank');
    } else if (event.location) {
        const query = encodeURIComponent(event.location);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'food': return 'bg-orange-50 text-orange-800 border-orange-100'; // Amber/Food
      case 'transport': return 'bg-slate-100 text-slate-700 border-slate-200'; // Transport/Neutral
      case 'hotel': return 'bg-blue-50 text-blue-800 border-blue-100'; // Sleep/Blue
      case 'flight': return 'bg-white border-yellow-400 border-l-4'; // Flight Special
      default: return 'bg-emerald-50 text-emerald-800 border-emerald-100'; // Activity/Tram Green
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food': return <FoodIcon className="w-4 h-4" />;
      case 'transport': return <TransportIcon className="w-4 h-4" />;
      case 'hotel': return <HotelIcon className="w-4 h-4" />;
      case 'flight': return <PlaneIcon className="w-4 h-4" />;
      default: return <ActivityIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface dark:bg-darkSurface transition-colors">
      {/* Day Selector - Horizontal Scroll */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-10 transition-colors">
        <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto py-3 px-2 space-x-2 snap-x"
        >
          {days.map((day, idx) => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(idx)}
              className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-xl transition-all border snap-center ${
                selectedDay === idx 
                  ? 'bg-primary dark:bg-blue-600 text-white border-primary dark:border-blue-600 shadow-lg scale-105' 
                  : 'bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider">Day</span>
              <span className="text-xl font-bold">{day.day}</span>
            </button>
          ))}
        </div>
        
        {/* Day Header & Weather & Memo */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentDay.date}</h2>
                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-gray-500 dark:text-gray-400">{currentDay.weekday}</span>
            </div>
            <div className="flex flex-col items-end shrink-0">
               <div className="flex items-center gap-1">
                   {currentDay.weather === 'rain' ? <CloudRainIcon className="w-5 h-5 text-blue-400" /> : <SunIcon className="w-5 h-5" />}
                   <span className="text-lg font-bold text-gray-800 dark:text-white">{currentDay.temp}°</span>
               </div>
            </div>
          </div>
          
          {/* Editable Memo Field - Full Width */}
          <textarea
              value={localMemo}
              onChange={(e) => setLocalMemo(e.target.value)}
              onBlur={handleMemoBlur}
              placeholder="當日備忘錄 (例如：今晚需換飯店、記得買早餐...)"
              className="w-full h-16 text-xs text-gray-600 dark:text-gray-300 bg-yellow-50/50 dark:bg-slate-800/50 border border-yellow-100 dark:border-slate-700 rounded-lg p-2 resize-none focus:ring-1 focus:ring-accent outline-none leading-relaxed transition-all placeholder-gray-400 dark:placeholder-gray-600"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        {currentDay.events.length === 0 ? (
           <div className="text-center py-10 text-gray-400 dark:text-gray-500">
             <p>今日尚無行程。</p>
             <button onClick={handleAddEvent} className="mt-4 text-primary dark:text-blue-400 font-medium">新增第一站</button>
           </div>
        ) : (
          currentDay.events.map((event) => (
            <div key={event.id} className="relative flex group">
              {/* Time Column */}
              <div className="flex flex-col items-center mr-4 w-12 pt-1">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 font-mono">{event.time}</span>
                <div className="h-full w-px bg-gray-200 dark:bg-slate-700 mt-2 mb-2 dashed"></div>
              </div>

              {/* Card Rendering Logic */}
              {event.type === 'flight' && event.flightDetails ? (
                // Special Flight Card
                <div className="flex-1 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-none mb-1 relative transition-transform active:scale-[0.99] bg-white dark:bg-slate-800">
                   {/* Scoot Header */}
                   <div className="bg-yellow-400 h-2 w-full"></div>
                   <div className="p-4">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                             <div className="bg-yellow-400 p-1.5 rounded-full text-black">
                                 <PlaneIcon className="w-4 h-4" />
                             </div>
                             <div>
                                 <span className="text-xs font-bold text-gray-500 uppercase block">{event.flightDetails.airline}</span>
                                 <span className="text-lg font-black text-gray-900 dark:text-white leading-none">{event.flightDetails.flightNumber}</span>
                             </div>
                          </div>
                          {event.bookingUrl && (
                             <a href={event.bookingUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-md">
                                 REF: {event.notes?.split('\n')[0]}
                             </a>
                          )}
                      </div>

                      <div className="flex justify-between items-center mb-4">
                          <div className="text-center">
                              <span className="text-3xl font-black text-gray-800 dark:text-white block">{event.flightDetails.departCode}</span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                {event.flightDetails.departTerminal ? `T${event.flightDetails.departTerminal}` : 'T-'}
                              </span>
                              <span className="block text-xs font-bold mt-1 text-gray-800 dark:text-gray-200">{event.time}</span>
                          </div>
                          
                          <div className="flex-1 px-4 flex flex-col items-center">
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">{event.flightDetails.duration}</span>
                              <div className="w-full h-0.5 bg-gray-200 dark:bg-slate-600 relative">
                                  <div className="absolute -top-1 right-0 w-2 h-2 bg-gray-300 dark:bg-slate-500 rounded-full"></div>
                                  <PlaneIcon className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-500 rotate-90" />
                              </div>
                          </div>

                          <div className="text-center">
                              <span className="text-3xl font-black text-gray-800 dark:text-white block">{event.flightDetails.arriveCode}</span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                {event.flightDetails.arriveTerminal ? `T${event.flightDetails.arriveTerminal}` : 'T-'}
                              </span>
                              {/* Calculate arrival time logic not implemented in pure UI, assuming title holds info or just show code */}
                          </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200 dark:border-slate-700">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{event.title}</span>
                          <div className="flex space-x-2">
                             <button onClick={() => handleEditEvent(event)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><EditIcon className="w-4 h-4"/></button>
                             <button onClick={() => handleDeleteEvent(event.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                          </div>
                      </div>
                   </div>
                </div>
              ) : (
                // Standard Card
                <div className={`flex-1 rounded-2xl p-4 border shadow-sm mb-1 ${getTypeColor(event.type)} dark:border-none relative transition-transform active:scale-[0.99] dark:bg-slate-800 dark:text-gray-100`}>
                   <div className="flex justify-between items-start gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 shadow-sm ${event.type === 'food' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' : event.type === 'transport' ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : event.type === 'hotel' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300'}`}>
                              {getTypeIcon(event.type)}
                          </div>
                          <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight pt-0.5 break-words">{event.title}</h3>
                      </div>

                      <div className="flex space-x-1 shrink-0 ml-1">
                        <button onClick={() => handleEditEvent(event)} className="p-1 opacity-50 hover:opacity-100"><EditIcon className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="p-1 opacity-50 hover:opacity-100"><TrashIcon className="w-4 h-4"/></button>
                      </div>
                   </div>
                   
                   {event.location && (
                     <div className="mt-3 flex items-center justify-between">
                         <p className="text-xs opacity-80 flex items-center truncate max-w-[65%]">
                           <span className="mr-1">📍</span> {event.location}
                         </p>
                         <div className="flex gap-2 shrink-0">
                             {event.bookingUrl && (
                                 <a 
                                   href={event.bookingUrl} 
                                   target="_blank" 
                                   rel="noreferrer"
                                   className="text-[10px] font-bold bg-white/50 hover:bg-white dark:bg-slate-700 dark:hover:bg-slate-600 text-primary dark:text-blue-300 px-2 py-1 rounded-md transition-colors"
                                 >
                                    <LinkIcon className="w-3 h-3 inline mr-1"/>
                                    預訂
                                 </a>
                             )}
                             <button onClick={() => handleNavigate(event)} className="text-[10px] font-bold bg-white/50 hover:bg-white dark:bg-slate-700 dark:hover:bg-slate-600 text-primary dark:text-blue-300 px-2 py-1 rounded-md transition-colors">
                                <MapIcon className="w-3 h-3 inline mr-1"/>
                                導航
                             </button>
                         </div>
                     </div>
                   )}

                   {event.notes && (
                       <div className="mt-2 text-xs bg-white/50 dark:bg-black/20 p-2 rounded-lg text-gray-600 dark:text-gray-300 whitespace-pre-line">
                           {event.notes}
                       </div>
                   )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={handleAddEvent}
        className="fixed bottom-20 right-6 w-14 h-14 bg-primary dark:bg-blue-600 text-white rounded-full shadow-lg shadow-primary/40 dark:shadow-blue-900/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/20 dark:bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{editingEvent ? '編輯行程' : '新增行程'}</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                  <div className="w-1/3">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">時間</label>
                      <input 
                        type="time" 
                        value={newEventData.time} 
                        onChange={(e) => setNewEventData({...newEventData, time: e.target.value})}
                        className="w-full mt-1 p-3 bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white rounded-xl border border-gray-100 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none text-center font-mono"
                      />
                  </div>
                  <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">類型</label>
                      <select 
                        value={newEventData.type} 
                        onChange={(e) => setNewEventData({...newEventData, type: e.target.value as any})}
                        className="w-full mt-1 p-3 bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white rounded-xl border border-gray-100 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none appearance-none"
                      >
                          <option value="activity">🎡 景點活動</option>
                          <option value="food">🍔 美食餐廳</option>
                          <option value="transport">🚌 交通移動</option>
                          <option value="hotel">🏨 住宿飯店</option>
                          <option value="flight">✈️ 航班飛行</option>
                      </select>
                  </div>
              </div>

              <div>
                 <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">標題</label>
                 <input 
                   type="text" 
                   value={newEventData.title} 
                   onChange={(e) => setNewEventData({...newEventData, title: e.target.value})}
                   placeholder="例如：參觀博物館"
                   className="w-full mt-1 p-3 bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white rounded-xl border border-gray-100 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                 />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex justify-between">
                    <span>地點 / 位置</span>
                    <button onClick={getAiSuggestion} disabled={!newEventData.location || loadingAi} className="text-primary dark:text-blue-400 hover:underline disabled:opacity-50">
                        {loadingAi ? 'AI 思考中...' : '✨ AI 建議'}
                    </button>
                </label>
                <input 
                  type="text" 
                  value={newEventData.location} 
                  onChange={(e) => setNewEventData({...newEventData, location: e.target.value})}
                  placeholder="輸入地點..."
                  className="w-full mt-1 p-3 bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white rounded-xl border border-gray-100 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                />
                {aiTip && (
                    <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg text-xs text-yellow-800 dark:text-yellow-200 animate-in fade-in">
                        🤖 {aiTip}
                    </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">備註 / 訂單號 / 航班資訊</label>
                <textarea 
                  value={newEventData.notes || ''} 
                  onChange={(e) => setNewEventData({...newEventData, notes: e.target.value})}
                  placeholder="相關細節..."
                  className="w-full mt-1 p-3 bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white rounded-xl border border-gray-100 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none h-20 resize-none"
                />
              </div>
              
              <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">預訂連結 (Booking URL)</label>
                  <input 
                    type="text" 
                    value={newEventData.bookingUrl || ''} 
                    onChange={(e) => setNewEventData({...newEventData, bookingUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full mt-1 p-3 bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white rounded-xl border border-gray-100 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none text-xs font-mono"
                  />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveEvent}
                  className="flex-1 py-3 bg-primary dark:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-primary/30 dark:shadow-blue-900/30 hover:bg-slate-700 dark:hover:bg-blue-500 transition-colors"
                >
                  儲存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;