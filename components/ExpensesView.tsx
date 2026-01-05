import React, { useState, useMemo } from 'react';
import { Expense, USERS, ExpenseCategory } from '../types';
import { TrashIcon, FoodIcon, TransportIcon, HotelIcon, ShoppingIcon, ActivityIcon, ExchangeIcon, PlusIcon, EditIcon } from './Icons';

interface ExpensesViewProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  categories: ExpenseCategory[];
  setCategories: React.Dispatch<React.SetStateAction<ExpenseCategory[]>>;
}

const COLOR_PRESETS = [
    'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
    'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
];

const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, setExpenses, categories, setCategories }) => {
  // Expense Form State
  const [title, setTitle] = useState('');
  const [payer, setPayer] = useState(USERS[0]);
  const [involved, setInvolved] = useState<string[]>(USERS);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || 'other');
  
  // Dual Currency Input State
  const [inputAud, setInputAud] = useState('');
  const [inputTwd, setInputTwd] = useState('');
  const [recordCurrency, setRecordCurrency] = useState<'AUD' | 'TWD'>('AUD');

  // Exchange Rate State (Global for this view)
  const [exchangeRate, setExchangeRate] = useState<number>(21.5); // Default AUD to TWD
  
  // Top Calculator State (Independent)
  const [calcAud, setCalcAud] = useState<string>('');
  const [calcTwd, setCalcTwd] = useState<string>('');

  // Category Management State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // --- Top Calculator Logic (Bidirectional) ---
  const handleCalcAudChange = (val: string) => {
      setCalcAud(val);
      if (val && !isNaN(parseFloat(val))) {
          setCalcTwd((parseFloat(val) * exchangeRate).toFixed(0));
      } else {
          setCalcTwd('');
      }
  };

  const handleCalcTwdChange = (val: string) => {
      setCalcTwd(val);
      if (val && !isNaN(parseFloat(val))) {
          setCalcAud((parseFloat(val) / exchangeRate).toFixed(2));
      } else {
          setCalcAud('');
      }
  };

  // --- Expense Entry Input Logic (Bidirectional) ---
  const handleInputAudChange = (val: string) => {
      setInputAud(val);
      if (val && !isNaN(parseFloat(val))) {
          setInputTwd((parseFloat(val) * exchangeRate).toFixed(0));
      } else {
          setInputTwd('');
      }
      setRecordCurrency('AUD'); // Auto-switch to AUD if typing in AUD
  };

  const handleInputTwdChange = (val: string) => {
      setInputTwd(val);
      if (val && !isNaN(parseFloat(val))) {
          setInputAud((parseFloat(val) / exchangeRate).toFixed(2));
      } else {
          setInputAud('');
      }
      setRecordCurrency('TWD'); // Auto-switch to TWD if typing in TWD
  };

  const addExpense = () => {
    if (!title || (!inputAud && !inputTwd)) return;

    const amount = recordCurrency === 'AUD' ? parseFloat(inputAud) : parseFloat(inputTwd);

    const newExpense: Expense = {
      id: Date.now().toString(),
      title,
      amount: amount,
      currency: recordCurrency, // Store user's selected currency
      payer,
      involved,
      category: selectedCategory
    };
    setExpenses([newExpense, ...expenses]);
    
    // Reset inputs
    setTitle('');
    setInputAud('');
    setInputTwd('');
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const toggleInvolved = (user: string) => {
    if (involved.includes(user)) {
      if (involved.length > 1) setInvolved(involved.filter(u => u !== user));
    } else {
      setInvolved([...involved, user]);
    }
  };

  // Manage Categories Logic
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    
    const newId = `cat_${Date.now()}`;
    const randomColor = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)];

    const newCat: ExpenseCategory = {
        id: newId,
        label: newCatName.trim(),
        color: randomColor,
        isDefault: false
    };

    setCategories([...categories, newCat]);
    setNewCatName('');
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('確定要刪除此分類嗎？')) {
        setCategories(categories.filter(c => c.id !== id));
        if (selectedCategory === id) {
             setSelectedCategory(categories.find(c => c.id !== id)?.id || 'other');
        }
    }
  };

  const getIconForCategory = (id: string) => {
      if (id.includes('food') || id.includes('eat')) return <FoodIcon className="w-4 h-4"/>;
      if (id.includes('trans') || id.includes('bus') || id.includes('car')) return <TransportIcon className="w-4 h-4"/>;
      if (id.includes('hotel') || id.includes('stay')) return <HotelIcon className="w-4 h-4"/>;
      if (id.includes('shop') || id.includes('buy')) return <ShoppingIcon className="w-4 h-4"/>;
      if (id.includes('ticket') || id.includes('play')) return <ActivityIcon className="w-4 h-4"/>;
      return <ExchangeIcon className="w-4 h-4"/>; 
  };

  // Calculate Debts (Base is AUD)
  const balances = useMemo(() => {
    const bals: Record<string, number> = {};
    USERS.forEach(u => bals[u] = 0);

    expenses.forEach(exp => {
      // Normalize amount to AUD for calculation
      let amountInAud = exp.amount;
      
      // Handle TWD currency or legacy data
      if (exp.currency === 'TWD') {
          amountInAud = exp.amount / exchangeRate;
      }

      const paidBy = exp.payer;
      const splitCount = exp.involved.length;
      const splitAmount = amountInAud / splitCount;

      bals[paidBy] += amountInAud;
      exp.involved.forEach(person => {
        bals[person] -= splitAmount;
      });
    });
    return bals;
  }, [expenses, exchangeRate]);

  return (
    <div className="p-4 pb-28 h-full overflow-y-auto bg-surface dark:bg-darkSurface transition-colors no-scrollbar">
      
      {/* Top: Instant Calculator (Not connected to form) */}
      <div className="bg-primary text-white rounded-2xl shadow-lg p-5 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <ExchangeIcon className="w-24 h-24" />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">即時匯率換算</h2>
                <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-lg border border-white/20">
                    <span className="text-xs text-gray-400">匯率:</span>
                    <input 
                        type="number"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                        className="w-12 bg-transparent text-white text-xs text-center outline-none font-mono"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex flex-col">
                    <label className="text-xs text-gray-400 mb-1">澳幣 (AUD)</label>
                    <input 
                        type="number"
                        placeholder="0"
                        value={calcAud}
                        onChange={(e) => handleCalcAudChange(e.target.value)}
                        className="w-full bg-white/10 text-xl font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-accent/50 border border-white/10 placeholder-gray-500 font-mono"
                    />
                </div>
                <div className="pt-5 text-gray-400">
                    <ExchangeIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 flex flex-col text-right">
                    <label className="text-xs text-gray-400 mb-1">台幣 (TWD)</label>
                    <input 
                        type="number"
                        placeholder="0"
                        value={calcTwd}
                        onChange={(e) => handleCalcTwdChange(e.target.value)}
                        className="w-full bg-white/10 text-xl font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-accent/50 border border-white/10 placeholder-gray-500 text-right font-mono"
                    />
                </div>
            </div>
          </div>
      </div>

      {/* Balance Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5 mb-6 border border-gray-100 dark:border-none">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">目前結算 (基準: AUD)</h2>
        <div className="space-y-3">
          {USERS.map(user => {
            const bal = balances[user];
            return (
              <div key={user} className="flex justify-between items-center border-b border-gray-50 dark:border-slate-700 last:border-0 pb-2 last:pb-0">
                <span className="font-medium text-gray-600 dark:text-gray-300">{user}</span>
                <span className={`font-bold ${bal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                  {bal >= 0 ? `應收 $${bal.toFixed(2)}` : `應付 $${Math.abs(bal).toFixed(2)}`}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-slate-700 text-xs text-gray-400 text-center">
            {balances[USERS[0]] > 0 
                ? `${USERS[1]} 需支付 ${USERS[0]} $${balances[USERS[0]].toFixed(2)} AUD` 
                : `${USERS[0]} 需支付 ${USERS[1]} $${balances[USERS[1]].toFixed(2)} AUD`}
            <div className="text-accent mt-1">
                (約合台幣 ${Math.abs(balances[USERS[0]] * exchangeRate).toFixed(0)})
            </div>
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5 mb-6 border border-gray-100 dark:border-none">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">新增消費</h2>
        <div className="space-y-4">
          
          {/* Title */}
          <input 
            className="w-full bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary border-none"
            placeholder="項目名稱 (例如：晚餐)"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          {/* Dual Amount Input */}
          <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-700">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">輸入金額 (自動換算)</label>
              
              {/* AUD Row */}
              <div className="flex items-center gap-3" onClick={() => setRecordCurrency('AUD')}>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer ${recordCurrency === 'AUD' ? 'border-accent bg-accent' : 'border-gray-300'}`}>
                      {recordCurrency === 'AUD' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <span className={`text-sm font-bold w-8 ${recordCurrency === 'AUD' ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>AUD</span>
                  <input 
                    type="number" 
                    className={`flex-1 p-2 rounded-lg outline-none font-mono ${recordCurrency === 'AUD' ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white ring-2 ring-accent/20' : 'bg-transparent text-gray-500'}`}
                    placeholder="0.00"
                    value={inputAud}
                    onChange={(e) => handleInputAudChange(e.target.value)}
                  />
              </div>

              {/* TWD Row */}
              <div className="flex items-center gap-3" onClick={() => setRecordCurrency('TWD')}>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer ${recordCurrency === 'TWD' ? 'border-accent bg-accent' : 'border-gray-300'}`}>
                      {recordCurrency === 'TWD' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <span className={`text-sm font-bold w-8 ${recordCurrency === 'TWD' ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>TWD</span>
                  <input 
                    type="number" 
                    className={`flex-1 p-2 rounded-lg outline-none font-mono ${recordCurrency === 'TWD' ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white ring-2 ring-accent/20' : 'bg-transparent text-gray-500'}`}
                    placeholder="0"
                    value={inputTwd}
                    onChange={(e) => handleInputTwdChange(e.target.value)}
                  />
              </div>
          </div>

          {/* Payer */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 rounded-xl p-2 px-3">
             <span className="text-sm text-gray-500 dark:text-gray-400">先代墊的人:</span>
             <select 
                className="bg-transparent text-gray-900 dark:text-white font-bold outline-none text-right"
                value={payer}
                onChange={e => setPayer(e.target.value)}
            >
                {USERS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* Category Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all
                        ${selectedCategory === cat.id
                            ? 'bg-primary border-primary text-white dark:bg-blue-600 dark:border-blue-600' 
                            : 'bg-white border-gray-200 text-gray-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-400'}`}
                  >
                      {getIconForCategory(cat.id)}
                      {cat.label}
                  </button>
              ))}
              <button 
                type="button"
                onClick={() => setIsManageModalOpen(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-400 hover:text-primary dark:hover:text-blue-400 border border-transparent hover:border-gray-300 transition-all shrink-0"
              >
                  <EditIcon className="w-3 h-3" />
              </button>
          </div>
          
          {/* Involved Users */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 my-2 overflow-x-auto no-scrollbar">
            <span className="whitespace-nowrap">分攤者:</span>
            {USERS.map(u => (
                <button 
                    key={u}
                    onClick={() => toggleInvolved(u)}
                    className={`px-3 py-1 rounded-full border transition-colors whitespace-nowrap ${involved.includes(u) ? 'bg-primary text-white border-primary dark:bg-blue-600 dark:border-blue-600' : 'bg-white text-gray-400 border-gray-200 dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600'}`}
                >
                    {u}
                </button>
            ))}
          </div>

          <button 
            onClick={addExpense}
            disabled={!inputAud && !inputTwd}
            className="w-full bg-accent text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-200 dark:shadow-none disabled:opacity-50 hover:bg-amber-600 transition-colors"
          >
            記帳 (以 {recordCurrency} 紀錄)
          </button>
        </div>
      </div>

      {/* History */}
      <h3 className="text-gray-400 font-semibold mb-3 px-1 uppercase text-[10px] tracking-widest">消費紀錄</h3>
      <div className="space-y-3">
        {expenses.map(exp => {
            const category = categories.find(c => c.id === exp.category) || categories[0] || { color: 'bg-gray-100', id: 'other' };
            
            // Calculate display values
            // Default to AUD if currency is undefined (legacy data)
            const isAud = exp.currency === 'AUD' || exp.currency === undefined;
            const mainAmount = exp.amount;
            const subAmount = isAud ? (exp.amount * exchangeRate) : (exp.amount / exchangeRate);
            
            return (
            <div key={exp.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-50 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                        {getIconForCategory(category.id)}
                    </div>
                    <div>
                        <div className="font-bold text-gray-800 dark:text-white text-sm">{exp.title}</div>
                        <div className="text-[10px] text-gray-400 mt-1">
                            <span className="text-primary dark:text-blue-400 font-medium">{exp.payer}</span> 支付 • {exp.involved.join(', ')} 分攤
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="font-bold text-gray-800 dark:text-white block">
                            {isAud ? '$' : 'NT$'}{mainAmount.toFixed(isAud ? 2 : 0)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            ≈ {isAud ? 'NT$' : '$'}{subAmount.toFixed(isAud ? 0 : 2)}
                        </span>
                    </div>
                    <button onClick={() => removeExpense(exp.id)} className="text-gray-300 hover:text-rose-400 p-1"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
            );
        })}
        {expenses.length === 0 && <div className="text-center text-gray-400 text-xs italic py-4">尚無紀錄。</div>}
      </div>

      {/* Manage Categories Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 bg-primary/20 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
             <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                 <EditIcon className="w-5 h-5"/> 管理消費分類
             </h3>
             
             <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
                 {categories.map(cat => (
                     <div key={cat.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                         <div className="flex items-center gap-2">
                             <div className={`w-6 h-6 rounded-md flex items-center justify-center ${cat.color}`}>
                                {getIconForCategory(cat.id)}
                             </div>
                             <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{cat.label}</span>
                         </div>
                         {!cat.isDefault && (
                             <button 
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                             >
                                 <TrashIcon className="w-4 h-4"/>
                             </button>
                         )}
                         {cat.isDefault && <span className="text-[10px] text-gray-400 px-2">預設</span>}
                     </div>
                 ))}
             </div>

             <div className="flex gap-2 mb-6">
                 <input 
                    type="text" 
                    placeholder="新分類名稱"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 p-2 bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white rounded-lg border-none outline-none focus:ring-2 focus:ring-primary text-sm"
                 />
                 <button 
                    onClick={handleAddCategory}
                    disabled={!newCatName.trim()}
                    className="bg-primary dark:bg-blue-600 text-white px-3 rounded-lg disabled:opacity-50 text-sm font-bold"
                 >
                     新增
                 </button>
             </div>

             <button 
               onClick={() => setIsManageModalOpen(false)}
               className="w-full py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
             >
               完成
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;