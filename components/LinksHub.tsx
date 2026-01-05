import React, { useState, useMemo } from 'react';
import { BookingLink, DayItinerary } from '../types';
import { LinkIcon, PlusIcon, EditIcon, TrashIcon } from './Icons';

interface LinksHubProps {
  links: BookingLink[];
  setLinks: React.Dispatch<React.SetStateAction<BookingLink[]>>;
  days: DayItinerary[];
  setDays: React.Dispatch<React.SetStateAction<DayItinerary[]>>;
}

interface ExtendedLink extends BookingLink {
    isManual: boolean;
    dayIndex?: number;
    eventIndex?: number;
}

const LinksHub: React.FC<LinksHubProps> = ({ links, setLinks, days, setDays }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ExtendedLink | null>(null);
  const [newLinkData, setNewLinkData] = useState<Partial<BookingLink>>({
    title: '',
    url: '',
    details: '',
    type: 'ticket'
  });

  // Merge links from Manual store and Itinerary Events
  const allLinks = useMemo(() => {
    const combined: ExtendedLink[] = [];

    // 1. Links from Itinerary (Auto-synced)
    days.forEach((day, dIdx) => {
        day.events.forEach((ev, eIdx) => {
            if (ev.bookingUrl) {
                combined.push({
                    id: ev.id, // Use event ID
                    title: ev.title,
                    url: ev.bookingUrl,
                    type: ev.type as any, // Cast type
                    details: ev.notes || '',
                    isManual: false,
                    dayIndex: dIdx,
                    eventIndex: eIdx
                });
            }
        });
    });

    // 2. Links from Manual Store
    links.forEach(l => {
        combined.push({ ...l, isManual: true });
    });

    return combined;
  }, [links, days]);

  const handleAddLink = () => {
    setEditingLink(null);
    setNewLinkData({ title: '', url: '', details: '', type: 'ticket' });
    setIsModalOpen(true);
  };

  const handleEditLink = (link: ExtendedLink) => {
    setEditingLink(link);
    setNewLinkData({ ...link });
    setIsModalOpen(true);
  };

  const handleDeleteLink = (link: ExtendedLink, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (link.isManual) {
        if (window.confirm('確定要刪除這個連結嗎？')) {
            setLinks(links.filter(l => l.id !== link.id));
        }
    } else {
        if (window.confirm(`此連結綁定於行程「${link.title}」。確定要移除連結嗎？（行程卡片將保留，僅移除連結）`)) {
            // Update the event in days to remove bookingUrl
            const updatedDays = [...days];
            if (link.dayIndex !== undefined && link.eventIndex !== undefined) {
                const event = updatedDays[link.dayIndex].events[link.eventIndex];
                event.bookingUrl = undefined; // Remove URL
                setDays(updatedDays);
            }
        }
    }
  };

  const handleSaveLink = () => {
    if (!newLinkData.title || !newLinkData.url) return;

    if (editingLink) {
        if (editingLink.isManual) {
            // Update Manual Link
            setLinks(links.map(l => l.id === editingLink.id ? { ...editingLink, ...newLinkData } as BookingLink : l));
        } else {
            // Update Itinerary Event
            const updatedDays = [...days];
            if (editingLink.dayIndex !== undefined && editingLink.eventIndex !== undefined) {
                 const event = updatedDays[editingLink.dayIndex].events[editingLink.eventIndex];
                 event.title = newLinkData.title!;
                 event.bookingUrl = newLinkData.url!;
                 event.notes = newLinkData.details;
                 event.type = newLinkData.type as any;
                 setDays(updatedDays);
            }
        }
    } else {
        // Create new Manual Link
        const newLink: BookingLink = {
            id: Date.now().toString(),
            title: newLinkData.title!,
            url: newLinkData.url!,
            details: newLinkData.details || '',
            type: newLinkData.type as any
        };
        setLinks([newLink, ...links]);
    }
    setIsModalOpen(false);
  };

  return (
<<<<<<< HEAD
    <div className="p-4 bg-surface dark:bg-darkSurface h-full pb-20 overflow-y-auto transition-colors">
=======
    <div className="p-4 bg-surface dark:bg-darkSurface h-full pb-20 overflow-y-auto transition-colors no-scrollbar">
>>>>>>> cb5f34c (Update:hide scrollbar)
        <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">我的預訂 & 票券</h2>
            <button 
                onClick={handleAddLink}
                className="bg-primary dark:bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-slate-700 transition-colors"
            >
                <PlusIcon className="w-5 h-5" />
            </button>
        </div>
        
        <div className="grid gap-4">
            {allLinks.map((link, idx) => (
                <div key={`${link.id}-${idx}`} className="relative group">
                    <a href={link.url} target="_blank" rel="noreferrer" className="block bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-slate-700">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex gap-2 mb-2">
                                    <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-colors
                                        ${link.type === 'car' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 
                                        link.type === 'flight' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                                        link.type === 'hotel' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : 
                                        link.type === 'ticket' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 
                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {link.type === 'car' ? '租車' : link.type === 'flight' ? '航班' : link.type === 'hotel' ? '住宿' : link.type === 'ticket' ? '票券' : '交通'}
                                    </span>
                                    {!link.isManual && (
                                        <span className="inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                                            來自 Day {days[link.dayIndex!].day}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-base text-gray-800 dark:text-gray-100">{link.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 truncate max-w-[250px]">{link.details}</p>
                            </div>
                            <div className="bg-surface dark:bg-slate-700 p-2 rounded-full text-primary dark:text-blue-400">
                                <LinkIcon className="w-5 h-5" />
                            </div>
                        </div>
                    </a>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-14 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                             onClick={(e) => { e.preventDefault(); handleEditLink(link); }}
                             className="p-1.5 bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-slate-500"
                         >
                             <EditIcon className="w-3 h-3" />
                         </button>
                         <button 
                             onClick={(e) => handleDeleteLink(link, e)}
                             className="p-1.5 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 rounded-full hover:bg-rose-200 dark:hover:bg-rose-800/50"
                         >
                             <TrashIcon className="w-3 h-3" />
                         </button>
                    </div>
                </div>
            ))}
        </div>

        {allLinks.length === 0 && (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                <p>目前沒有連結。</p>
                <button onClick={handleAddLink} className="mt-2 text-primary dark:text-blue-400 font-medium">新增一個！</button>
            </div>
        )}

        <div className="mt-8 p-6 bg-gradient-to-br from-primary to-slate-900 dark:from-slate-800 dark:to-black rounded-2xl text-white shadow-lg">
            <h3 className="font-bold text-base mb-2">緊急協助</h3>
            <p className="text-gray-300 text-xs mb-4">澳洲緊急聯絡資訊</p>
            <div className="flex gap-3">
                <a href="tel:000" className="flex-1 bg-white text-primary text-center py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">撥打 000</a>
                <a href="https://www.taiwanembassy.org/au/index.html" target="_blank" rel="noreferrer" className="flex-1 bg-white/10 text-white text-center py-2 rounded-lg text-sm backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">駐澳辦事處</a>
            </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
        <div className="fixed inset-0 bg-primary/20 dark:bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                {editingLink ? (editingLink.isManual ? '編輯連結' : '編輯行程連結') : '新增連結'}
            </h3>
            
            <div className="space-y-4">
              <div>
                 <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">標題</label>
                 <input 
                   type="text" 
                   value={newLinkData.title} 
                   onChange={(e) => setNewLinkData({...newLinkData, title: e.target.value})}
                   placeholder="例如：訂房確認信"
                   className="w-full mt-1 p-3 bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white rounded-xl border border-gray-100 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                 />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">類型</label>
                <select 
                  value={newLinkData.type}
                  onChange={(e) => setNewLinkData({...newLinkData, type: e.target.value as any})}
                  className="w-full mt-1 p-3 bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white rounded-xl border border-gray-100 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="ticket">票券 🎫</option>
                  <option value="flight">航班 ✈️</option>
                  <option value="hotel">住宿 🏨</option>
                  <option value="car">租車 🚗</option>
                  <option value="transport">交通 🚌</option>
                  <option value="activity">活動 🎡</option>
                  <option value="food">美食 🍔</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">連結 URL</label>
                <input 
                  type="text" 
                  value={newLinkData.url} 
                  onChange={(e) => setNewLinkData({...newLinkData, url: e.target.value})}
                  placeholder="https://..."
                  className="w-full mt-1 p-3 bg-gray-50 text-blue-600 dark:bg-slate-700 dark:text-blue-400 rounded-xl border border-gray-100 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">備註細節</label>
                <input 
                  type="text" 
                  value={newLinkData.details || ''} 
                  onChange={(e) => setNewLinkData({...newLinkData, details: e.target.value})}
                  placeholder="例如：訂單編號 #123456"
                  className="w-full mt-1 p-3 bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white rounded-xl border border-gray-100 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              
              {!editingLink?.isManual && editingLink && (
                  <p className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                      ⚠️ 編輯此處將同步更新「行程表」中的標題與連結。
                  </p>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveLink}
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

export default LinksHub;