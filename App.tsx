import React, { useState, useEffect } from 'react';
import { ViewState, DayItinerary, Expense, BookingLink, TodoItem, TodoCategory, ExpenseCategory } from './types';
import ItineraryView from './components/ItineraryView';
import ExpensesView from './components/ExpensesView';
import LinksHub from './components/LinksHub';
import TodoView from './components/TodoView';
import { CalendarIcon, DollarIcon, LinkIcon, ChecklistIcon } from './components/Icons';

// Firebase Imports
import { db } from './firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

// Detailed Itinerary Data
const INITIAL_DAYS: DayItinerary[] = [
  {
    day: 1,
    date: '2026-01-21',
    weekday: '週三',
    weather: 'sunny',
    temp: 24,
    tips: '轉機時間約 4 小時，樟宜機場 T1 有許多免稅店可逛。',
    events: [
      { 
        id: '1-0', 
        time: '01:45', 
        title: '台北(TPE) 飛往 新加坡(SIN)', 
        location: 'Taoyuan Intl Airport (TPE)', 
        type: 'flight', 
        notes: 'Scoot TR 897\nBooking: M87K4P', 
        bookingUrl: 'https://www.flyscoot.com/',
        flightDetails: {
          flightNumber: 'TR 897',
          airline: 'Scoot B787-9',
          departCode: 'TPE',
          arriveCode: 'SIN',
          departTerminal: '1',
          arriveTerminal: '1',
          duration: '4h 40m'
        }
      },
      { 
        id: '1-1', 
        time: '10:20', 
        title: '新加坡(SIN) 飛往 墨爾本(MEL)', 
        location: 'Changi Airport (SIN)', 
        type: 'flight', 
        notes: 'Scoot TR 24\nLayover: 3h 55m', 
        bookingUrl: 'https://www.flyscoot.com/',
        flightDetails: {
          flightNumber: 'TR 24',
          airline: 'Scoot B787-9',
          departCode: 'SIN',
          arriveCode: 'MEL',
          departTerminal: '1',
          arriveTerminal: '2',
          duration: '7h 30m'
        }
      },
      { id: '1-2', time: '20:50', title: '抵達墨爾本機場', location: 'Melbourne Airport', lat: -37.6690, lng: 144.8410, type: 'transport', notes: '準備入境檢查' },
      { id: '1-3', time: '21:40', title: '搭乘 SkyBus 前往市區', location: 'Southern Cross Station', lat: -37.8183, lng: 144.9525, type: 'transport', notes: '直達南十字星車站' },
      { id: '1-4', time: '22:30', title: '入住: Inner CBD Apartment', location: 'Melbourne CBD (Near Southern Cross)', lat: -37.8150, lng: 144.9550, type: 'hotel', notes: 'HDSS07/InnerCBD/1Min->Station' },
    ]
  },
  {
    day: 2,
    date: '2026-01-22',
    weekday: '週四',
    weather: 'sunny',
    temp: 28,
    tips: '澳網人潮眾多，請務必做好防曬與補水。',
    events: [
      { id: '2-1', time: '10:00', title: '澳網: 外場通行證入場', location: 'Melbourne Park', lat: -37.8216, lng: 144.9785, type: 'activity', notes: '探索外圍球場氣氛' },
      { id: '2-2', time: '12:00', title: '觀賞外場賽事', location: 'Melbourne Park Outdoor Courts', lat: -37.8220, lng: 144.9790, type: 'activity', notes: '防曬乳要勤補' },
      { id: '2-3', time: '15:00', title: 'John Cain / KIA Arena', location: 'John Cain Arena', lat: -37.8230, lng: 144.9800, type: 'activity', notes: 'Ground Pass 可進入' },
      { id: '2-4', time: '18:00', title: 'Garden Square 晚餐', location: 'Garden Square', lat: -37.8210, lng: 144.9780, type: 'food', notes: '享受現場音樂與餐車' },
    ]
  },
  {
    day: 3,
    date: '2026-01-23',
    weekday: '週五',
    weather: 'partly-cloudy',
    temp: 26,
    tips: '今日換飯店，請確認退房時間與行李寄放。',
    events: [
      { id: '3-1', time: '10:00', title: '退房 & 澳網 Day 2', location: 'Melbourne Park', lat: -37.8216, lng: 144.9785, type: 'activity', notes: '查看頂尖選手練習' },
      { id: '3-2', time: '13:00', title: 'Grand Slam Oval 午餐', location: 'Grand Slam Oval', lat: -37.8225, lng: 144.9795, type: 'food', notes: '各國美食匯聚' },
      { id: '3-3', time: '16:00', title: '更多網球賽事', location: 'Melbourne Park', lat: -37.8216, lng: 144.9785, type: 'activity', notes: '持票免費搭乘 70 號電車' },
      { 
        id: '3-4', 
        time: '20:00', 
        title: '入住: 亞特蘭蒂斯飯店', 
        location: '300 Spencer St, Melbourne', 
        lat: -37.8119, 
        lng: 144.9536, 
        type: 'hotel', 
        notes: 'Atlantis Hotel Melbourne',
        bookingUrl: 'https://www.agoda.com/zh-tw/account/editbooking.html?bookingId=Z8C4Kfulw2iR33s2tqaz9g%3D%3D&landFrom=TripDetail&sort=BookingStartDate&state=Upcoming&page=1&ds=xCyHKy4CaORlQkTX'
      },
    ]
  },
  {
    day: 4,
    date: '2026-01-24',
    weekday: '週六',
    weather: 'sunny',
    temp: 25,
    tips: '大洋路彎道多，請小心駕駛；記得右駕靠左。',
    events: [
      { id: '4-0', time: '10:15', title: '前往 Footscray 取車', location: '300 Spencer St to Footscray', lat: -37.8119, lng: 144.9536, type: 'transport', notes: '建議搭乘 Uber/Didi (約15分鐘) 攜帶行李較方便。' },
      { 
        id: '4-1', 
        time: '11:00', 
        title: 'SIXT 取車: Toyota Yaris', 
        location: 'SIXT Car Rental Footscray', 
        lat: -37.8030, 
        lng: 144.9020, 
        type: 'transport', 
        notes: 'Booking: 9729138629. 記得攜帶駕照/譯本。',
        bookingUrl: 'https://mail.google.com/mail/u/0/?ogbl#search/sixt/FMfcgzQdzwHKBFvZVxCLZzsKMsMqBlbV'
      },
      { id: '4-2', time: '12:30', title: '托爾坎衝浪海灘', location: 'Torquay Surf Beach', lat: -38.3324, lng: 144.3159, type: 'activity', notes: '大洋路起點' },
      { id: '4-3', time: '13:30', title: '洛恩小鎮午餐', location: 'Lorne', lat: -38.5415, lng: 143.9754, type: 'food', notes: '美麗的海濱小鎮' },
      { id: '4-4', time: '16:00', title: '阿波羅灣', location: 'Apollo Bay', lat: -38.7558, lng: 143.6558, type: 'activity', notes: '中途休息點' },
      { 
        id: '4-5', 
        time: '18:00', 
        title: '入住: Apollo Stay', 
        location: '38 Thomson Street, Apollo Bay', 
        lat: -38.7560, 
        lng: 143.6560, 
        type: 'hotel', 
        notes: 'Check-in: 15:00~20:00',
        bookingUrl: 'https://secure.booking.com/confirmation.zh-tw.html?label=mkt123sc-d7a379ea-aab6-4237-b9c5-b29721aadb1f&sid=e6ffd707b4250120589a18d560ea263f&aid=1536461&auth_key=sk2PHyKEv8wF0rTa&source=mytrips'
      },
    ]
  },
  {
    day: 5,
    date: '2026-01-25',
    weekday: '週日',
    weather: 'partly-cloudy',
    temp: 23,
    tips: '清晨前往十二使徒岩可避開人潮。',
    events: [
      { id: '5-1', time: '09:00', title: '十二使徒岩', location: 'Twelve Apostles', lat: -38.6621, lng: 143.1051, type: 'activity', notes: '經典地標' },
      { id: '5-2', time: '10:30', title: '倫敦拱橋 & 石窟', location: 'London Bridge', lat: -38.6235, lng: 142.9304, type: 'activity', notes: '大自然的鬼斧神工' },
      { id: '5-3', time: '13:00', title: '驅車前往格蘭屏', location: 'Grampians Road', lat: -37.5, lng: 142.5, type: 'transport', notes: '往內陸前進' },
      { 
        id: '5-4', 
        time: '16:30', 
        title: '入住: Mountain View Motor Inn', 
        location: '4236 Ararat-Halls Gap Road, Halls Gap', 
        lat: -37.1550, 
        lng: 142.5350, 
        type: 'hotel', 
        notes: '山景汽車旅館和度假小屋',
        bookingUrl: 'https://secure.booking.com/confirmation.zh-tw.html?label=mkt123sc-d7a379ea-aab6-4237-b9c5-b29721aadb1f&sid=e6ffd707b4250120589a18d560ea263f&aid=1536461&auth_key=SqXbY6BoFNUqmawu&source=mytrips'
      },
    ]
  },
  {
    day: 6,
    date: '2026-01-26',
    weekday: '週一',
    weather: 'cloudy',
    temp: 22,
    tips: '黃昏時段開車請務必小心袋鼠衝出。',
    events: [
      { id: '6-1', time: '09:00', title: 'Boroka 觀景台', location: 'Boroka Lookout', lat: -37.1235, lng: 142.5028, type: 'activity', notes: '俯瞰壯麗山谷' },
      { id: '6-2', time: '11:00', title: 'Brambuk 文化中心', location: 'Brambuk Cultural Centre', lat: -37.1472, lng: 142.5273, type: 'activity', notes: '原住民歷史' },
      { id: '6-3', time: '15:00', title: '返回墨爾本', location: 'Western Highway', lat: -37.5, lng: 143.5, type: 'transport', notes: '約 3.5 小時車程' },
      { 
        id: '6-4', 
        time: '18:00', 
        title: '入住: City Apartment (Bozhu)', 
        location: '371 Little Lonsdale Street', 
        lat: -37.8115, 
        lng: 144.9590, 
        type: 'hotel', 
        notes: '位於墨爾本的房源' 
      },
    ]
  },
  {
    day: 7,
    date: '2026-01-27',
    weekday: '週二',
    weather: 'sunny',
    temp: 27,
    tips: '八強賽事精彩，上午還車後直接前往球場。',
    events: [
      { id: '7-0', time: '10:00', title: '前往還車', location: 'Footscray', lat: -37.8030, lng: 144.9020, type: 'transport', notes: '預留時間加油與檢查' },
      { 
        id: '7-1', 
        time: '11:00', 
        title: 'SIXT 還車', 
        location: 'SIXT Car Rental Footscray', 
        lat: -37.8030, 
        lng: 144.9020, 
        type: 'transport', 
        notes: '還車截止時間 11:00 AM' 
      },
      { id: '7-2', time: '11:30', title: '前往澳網球場', location: 'Rod Laver Arena', lat: -37.8216, lng: 144.9785, type: 'transport', notes: '搭乘火車或 Uber' },
      { id: '7-3', time: '12:00', title: '澳網: 八強賽 Day 1', location: 'Rod Laver Arena', lat: -37.8216, lng: 144.9785, type: 'activity', notes: '見證頂尖對決' },
      { id: '7-4', time: '19:00', title: '市區晚餐', location: 'Melbourne CBD', lat: -37.8136, lng: 144.9631, type: 'food', notes: '' },
    ]
  },
  {
    day: 8,
    date: '2026-01-28',
    weekday: '週三',
    weather: 'sunny',
    temp: 29,
    tips: '皇家拱廊地板磁磚很美，記得拍照。',
    events: [
      { id: '8-1', time: '11:00', title: '澳網: 八強賽 Day 2', location: 'Rod Laver Arena', lat: -37.8216, lng: 144.9785, type: 'activity', notes: '熱血賽事' },
      { id: '8-2', time: '16:00', title: '皇家拱廊購物', location: 'Royal Arcade', lat: -37.8143, lng: 144.9644, type: 'activity', notes: '墨爾本最古老拱廊' },
      { id: '8-3', time: '19:00', title: 'Yarra River 散步', location: 'Southbank', lat: -37.8200, lng: 144.9650, type: 'activity', notes: '欣賞夜景' },
    ]
  },
  {
    day: 9,
    date: '2026-01-29',
    weekday: '週四',
    weather: 'partly-cloudy',
    temp: 24,
    tips: '因已還車，建議參加菲利普島一日遊。',
    events: [
      { id: '9-1', time: '12:30', title: '菲利普島一日遊接駁', location: 'Federation Square', lat: -37.8179, lng: 144.9691, type: 'transport', notes: '集合出發 (需預訂)' },
      { id: '9-2', time: '15:00', title: 'Moonlit Sanctuary', location: 'Moonlit Sanctuary', lat: -38.2173, lng: 145.2530, type: 'activity', notes: '近距離接觸無尾熊' },
      { id: '9-3', time: '19:30', title: '企鵝歸巢', location: 'Penguin Parade', lat: -38.5089, lng: 145.1485, type: 'activity', notes: '可愛小企鵝上岸' },
      { id: '9-4', time: '22:30', title: '返回市區', location: 'Melbourne CBD', lat: -37.8136, lng: 144.9631, type: 'transport', notes: '結束一日遊' },
    ]
  },
  {
    day: 10,
    date: '2026-01-30',
    weekday: '週五',
    weather: 'cloudy',
    temp: 21,
    tips: '維多利亞市場週五下午3點就打烊，請早點去！',
    events: [
      { id: '10-1', time: '09:00', title: '咖啡巷弄巡禮', location: 'Degraves Street', lat: -37.8166, lng: 144.9660, type: 'food', notes: '品嚐世界級咖啡' },
      { id: '10-2', time: '10:30', title: '維多利亞女王市場', location: 'Queen Victoria Market', lat: -37.8076, lng: 144.9568, type: 'activity', notes: '購買紀念品' },
      { id: '10-3', time: '13:00', title: 'Bratwurst 德國香腸堡', location: 'QVM Deli Hall', lat: -37.8076, lng: 144.9568, type: 'food', notes: '市場必吃美食' },
      { id: '10-4', time: '15:00', title: '市區自由活動', location: 'CBD', lat: -37.8136, lng: 144.9631, type: 'activity', notes: '' },
    ]
  },
  {
    day: 11,
    date: '2026-01-31',
    weekday: '週六',
    weather: 'sunny',
    temp: 23,
    tips: '前往機場前，請預留充裕時間遇上交通尖峰。',
    events: [
      { id: '11-1', time: '10:00', title: '最後採購', location: 'Spencer Outlet Centre', lat: -37.8155, lng: 144.9530, type: 'activity', notes: '南十字星車站樓上' },
      { id: '11-2', time: '13:00', title: '河畔漫步', location: 'Southbank Promenade', lat: -37.8205, lng: 144.9654, type: 'activity', notes: '告別墨爾本' },
      { id: '11-3', time: '19:00', title: '搭乘 SkyBus 往機場', location: 'Southern Cross Station', lat: -37.8183, lng: 144.9525, type: 'transport', notes: '前往 T2 航廈' },
      { 
        id: '11-4', 
        time: '22:35', 
        title: '墨爾本(MEL) 飛往 新加坡(SIN)', 
        location: 'Tullamarine Airport (MEL)', 
        type: 'flight', 
        notes: 'Scoot TR 25\nBooking: M87K4P', 
        bookingUrl: 'https://www.flyscoot.com/',
        flightDetails: {
          flightNumber: 'TR 25',
          airline: 'Scoot B787-9',
          departCode: 'MEL',
          arriveCode: 'SIN',
          departTerminal: '2',
          arriveTerminal: '1',
          duration: '7h 45m'
        }
      },
    ]
  },
  {
    day: 12,
    date: '2026-02-01',
    weekday: '週日',
    weather: 'partly-cloudy',
    temp: 20,
    tips: '歡迎回家！記得調整時差。',
    events: [
      { 
        id: '12-1', 
        time: '03:20', 
        title: '抵達新加坡 (轉機)', 
        location: 'Changi Airport (SIN)', 
        type: 'transport', 
        notes: 'Layover: 4h 50m'
      },
      { 
        id: '12-2', 
        time: '08:10', 
        title: '新加坡(SIN) 飛往 台北(TPE)', 
        location: 'Changi Airport (SIN)', 
        type: 'flight', 
        notes: 'Scoot TR 874', 
        bookingUrl: 'https://www.flyscoot.com/',
        flightDetails: {
          flightNumber: 'TR 874',
          airline: 'Scoot B787-9',
          departCode: 'SIN',
          arriveCode: 'TPE',
          departTerminal: '1',
          arriveTerminal: '1',
          duration: '4h 35m'
        }
      },
      { id: '12-3', time: '12:45', title: '抵達桃園機場', location: 'Taoyuan Intl Airport', type: 'transport', notes: '旅程圓滿結束' }
    ]
  }
];

const INITIAL_LINKS: BookingLink[] = [
    { id: '1', title: 'SkyBus 車票', type: 'transport', url: 'https://www.skybus.com.au/', details: '機場快線電子票' },
    { id: '2', title: '澳網 2026 門票', type: 'ticket', url: 'https://www.ticketmaster.com.au/australian-open-tickets/artist/1154563', details: 'Ground Pass / RLA' },
    { id: '4', title: '菲利普島企鵝歸巢', type: 'ticket', url: 'https://www.penguins.org.au/', details: '入場憑證 QR Code' },
];

const INITIAL_CATEGORIES: TodoCategory[] = [
  { id: 'todo', label: '一般待辦', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300', isDefault: true },
  { id: 'packing', label: '行李準備', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', isDefault: true },
  { id: 'shopping', label: '購物清單', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', isDefault: true },
  { id: 'gift', label: '伴手禮', color: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300', isDefault: true },
  { id: 'docs', label: '證件文件', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', isDefault: true },
];

const INITIAL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'food', label: '美食', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', isDefault: true },
  { id: 'transport', label: '交通', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', isDefault: true },
  { id: 'shopping', label: '購物', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300', isDefault: true },
  { id: 'ticket', label: '票券', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', isDefault: true },
  { id: 'hotel', label: '住宿', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', isDefault: true },
  { id: 'other', label: '其他', color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300', isDefault: true },
];

const INITIAL_TODOS: TodoItem[] = [
  { id: '1', text: '確認護照效期', isCompleted: false, category: 'docs' },
  { id: '2', text: '申請澳洲 ETA 電子簽證', isCompleted: false, category: 'docs' },
  { id: '3', text: '買轉接頭 (八字型)', isCompleted: false, category: 'packing' },
];

const TRIP_ID = 'melbourne-trip-2026';

// Helper to remove undefined values before sending to Firestore
const sanitizeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('itinerary');
  const [days, setDays] = useState<DayItinerary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [links, setLinks] = useState<BookingLink[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [todoCategories, setTodoCategories] = useState<TodoCategory[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'offline'>('offline');

  // Firebase Realtime Listener
  useEffect(() => {
    const docRef = doc(db, "trips", TRIP_ID);
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      setConnectionStatus('connected');
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.days) setDays(data.days);
        if (data.expenses) setExpenses(data.expenses);
        if (data.links) setLinks(data.links);
        
        if (data.todoCategories) {
            setTodoCategories(data.todoCategories);
        } else {
            setTodoCategories(INITIAL_CATEGORIES);
        }

        if (data.expenseCategories) {
            setExpenseCategories(data.expenseCategories);
        } else {
            setExpenseCategories(INITIAL_EXPENSE_CATEGORIES);
        }

        if (data.todos) {
           setTodos(data.todos);
        } else {
           setTodos(INITIAL_TODOS);
        }
      } else {
        // First time initialization: populate DB with our default data
        await setDoc(docRef, {
          days: sanitizeData(INITIAL_DAYS),
          expenses: [],
          links: sanitizeData(INITIAL_LINKS),
          todos: sanitizeData(INITIAL_TODOS),
          todoCategories: sanitizeData(INITIAL_CATEGORIES),
          expenseCategories: sanitizeData(INITIAL_EXPENSE_CATEGORIES)
        });
        setDays(INITIAL_DAYS);
        setLinks(INITIAL_LINKS);
        setTodos(INITIAL_TODOS);
        setTodoCategories(INITIAL_CATEGORIES);
        setExpenseCategories(INITIAL_EXPENSE_CATEGORIES);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase sync error:", error);
      setConnectionStatus('offline');
      // Fallback to initial data if offline/error on first load and no state
      if (days.length === 0) {
          setDays(INITIAL_DAYS);
          setLinks(INITIAL_LINKS);
          setTodos(INITIAL_TODOS);
          setTodoCategories(INITIAL_CATEGORIES);
          setExpenseCategories(INITIAL_EXPENSE_CATEGORIES);
          setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []); // Run once on mount

  // Sync Wrappers - Passed to children components
  // These wrap the state setters to also push to Firebase
  const handleSetDays = (action: React.SetStateAction<DayItinerary[]>) => {
    let newDays: DayItinerary[];
    if (typeof action === 'function') {
        newDays = action(days);
    } else {
        newDays = action;
    }
    setDays(newDays);
    const docRef = doc(db, "trips", TRIP_ID);
    updateDoc(docRef, { days: sanitizeData(newDays) }).catch(e => console.error("Update failed", e));
  };

  const handleSetExpenses = (action: React.SetStateAction<Expense[]>) => {
    let newExpenses: Expense[];
    if (typeof action === 'function') {
        newExpenses = action(expenses);
    } else {
        newExpenses = action;
    }
    setExpenses(newExpenses);
    const docRef = doc(db, "trips", TRIP_ID);
    updateDoc(docRef, { expenses: sanitizeData(newExpenses) }).catch(e => console.error("Update failed", e));
  };

  const handleSetLinks = (action: React.SetStateAction<BookingLink[]>) => {
    let newLinks: BookingLink[];
    if (typeof action === 'function') {
        newLinks = action(links);
    } else {
        newLinks = action;
    }
    setLinks(newLinks);
    const docRef = doc(db, "trips", TRIP_ID);
    updateDoc(docRef, { links: sanitizeData(newLinks) }).catch(e => console.error("Update failed", e));
  }

  const handleSetTodos = (action: React.SetStateAction<TodoItem[]>) => {
    let newTodos: TodoItem[];
    if (typeof action === 'function') {
        newTodos = action(todos);
    } else {
        newTodos = action;
    }
    setTodos(newTodos);
    const docRef = doc(db, "trips", TRIP_ID);
    updateDoc(docRef, { todos: sanitizeData(newTodos) }).catch(e => console.error("Update failed", e));
  }

  const handleSetTodoCategories = (action: React.SetStateAction<TodoCategory[]>) => {
    let newCats: TodoCategory[];
    if (typeof action === 'function') {
        newCats = action(todoCategories);
    } else {
        newCats = action;
    }
    setTodoCategories(newCats);
    const docRef = doc(db, "trips", TRIP_ID);
    updateDoc(docRef, { todoCategories: sanitizeData(newCats) }).catch(e => console.error("Update failed", e));
  }

  const handleSetExpenseCategories = (action: React.SetStateAction<ExpenseCategory[]>) => {
    let newCats: ExpenseCategory[];
    if (typeof action === 'function') {
        newCats = action(expenseCategories);
    } else {
        newCats = action;
    }
    setExpenseCategories(newCats);
    const docRef = doc(db, "trips", TRIP_ID);
    updateDoc(docRef, { expenseCategories: sanitizeData(newCats) }).catch(e => console.error("Update failed", e));
  }

  // Remove the map click handler since MapView is gone
  const handleItineraryMapClick = () => {
      // Optional: Maybe open Google Maps? 
      // For now, we just don't switch view.
      alert("地圖功能已移除，請使用個別行程的導航按鈕。");
  };

  if (loading) {
      return (
          <div className="bg-slate-900 min-h-screen flex items-center justify-center text-white">
              <div className="text-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm font-medium">正在同步行程...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex justify-center font-sans bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-500">
      {/* Mobile Container */}
      <div className="w-full max-w-md bg-surface dark:bg-darkSurface h-screen flex flex-col shadow-2xl overflow-hidden relative transition-colors duration-500">
        
        {/* Header */}
        <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm pt-12 pb-3 px-6 flex justify-between items-center z-20 border-b border-gray-100 dark:border-slate-800 transition-colors">
            <div>
                <h1 className="text-2xl font-black text-primary dark:text-white tracking-tight">
                    {view === 'itinerary' && 'MelbGo 🇦🇺'}
                    {view === 'expenses' && '分帳記帳 💸'}
                    {view === 'links' && '我的預訂 🎫'}
                    {view === 'todo' && '待辦清單 ✅'}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-widest uppercase">
                        {view === 'itinerary' ? 'Melbourne Trip' : view === 'expenses' ? 'Split Bills' : view === 'links' ? 'Bookings' : 'Checklist'}
                    </p>
                    {connectionStatus === 'connected' ? (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" title="已連線同步"></span>
                    ) : (
                        <span className="w-2 h-2 rounded-full bg-red-400" title="離線"></span>
                    )}
                </div>
            </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative">
            {view === 'itinerary' && <ItineraryView days={days} setDays={handleSetDays} onMapClick={handleItineraryMapClick} />}
            {view === 'expenses' && <ExpensesView expenses={expenses} setExpenses={handleSetExpenses} categories={expenseCategories} setCategories={handleSetExpenseCategories} />}
            {view === 'links' && <LinksHub links={links} setLinks={handleSetLinks} days={days} setDays={handleSetDays} />}
            {view === 'todo' && <TodoView todos={todos} setTodos={handleSetTodos} categories={todoCategories} setCategories={handleSetTodoCategories} />}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-gray-100 dark:border-slate-800 px-6 py-2 pb-6 flex justify-between items-center z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
            <button 
                onClick={() => setView('itinerary')}
                className={`flex flex-col items-center space-y-1 w-12 transition-all duration-300 ${view === 'itinerary' ? 'text-primary dark:text-blue-400 scale-110' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'}`}
            >
                <CalendarIcon className="w-6 h-6" />
                <span className="text-[9px] font-bold uppercase tracking-widest">行程</span>
            </button>

            <button 
                onClick={() => setView('todo')}
                className={`flex flex-col items-center space-y-1 w-12 transition-all duration-300 ${view === 'todo' ? 'text-primary dark:text-blue-400 scale-110' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'}`}
            >
                <ChecklistIcon className="w-6 h-6" />
                <span className="text-[9px] font-bold uppercase tracking-widest">待辦</span>
            </button>

            <button 
                onClick={() => setView('expenses')}
                className={`flex flex-col items-center space-y-1 w-12 transition-all duration-300 ${view === 'expenses' ? 'text-primary dark:text-blue-400 scale-110' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'}`}
            >
                <DollarIcon className="w-6 h-6" />
                <span className="text-[9px] font-bold uppercase tracking-widest">分帳</span>
            </button>

            <button 
                onClick={() => setView('links')}
                className={`flex flex-col items-center space-y-1 w-12 transition-all duration-300 ${view === 'links' ? 'text-primary dark:text-blue-400 scale-110' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'}`}
            >
                <LinkIcon className="w-6 h-6" />
                <span className="text-[9px] font-bold uppercase tracking-widest">票券</span>
            </button>
        </nav>

      </div>
    </div>
  );
};

export default App;
