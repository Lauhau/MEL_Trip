import React, { useState, useMemo } from 'react';
import { Expense, USERS } from '../types';
import { TrashIcon } from './Icons';

interface ExpensesViewProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, setExpenses }) => {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [payer, setPayer] = useState(USERS[0]);
  const [involved, setInvolved] = useState<string[]>(USERS);
  
  // Exchange Rate State
  const [exchangeRate, setExchangeRate] = useState<number>(21.5); // Default AUD to TWD
  const [calcAud, setCalcAud] = useState<string>('');

  const addExpense = () => {
    if (!amount || !title) return;
    const newExpense: Expense = {
      id: Date.now().toString(),
      title,
      amount: parseFloat(amount),
      currency: 'AUD',
      payer,
      involved
    };
    setExpenses([newExpense, ...expenses]);
    setAmount('');
    setTitle('');
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

  // Calculate Debts (Converted to TWD approximately for summary, but keep base math)
  const balances = useMemo(() => {
    const bals: Record<string, number> = {};
    USERS.forEach(u => bals[u] = 0);

    expenses.forEach(exp => {
      const paidBy = exp.payer;
      const amount = exp.amount; // In AUD
      const splitCount = exp.involved.length;
      const splitAmount = amount / splitCount;

      bals[paidBy] += amount;
      exp.involved.forEach(person => {
        bals[person] -= splitAmount;
      });
    });
    return bals;
  }, [expenses]);

  return (
    <div className="p-4 pb-28 h-full overflow-y-auto bg-surface dark:bg-darkSurface transition-colors">
      
      {/* Exchange Rate Calculator */}
      <div className="bg-primary text-white rounded-2xl shadow-lg p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">匯率換算 (AUD → TWD)</h2>
              <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">匯率:</span>
                  <input 
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                    className="w-16 bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20 text-center"
                  />
              </div>
          </div>
          <div className="flex items-center gap-4">
              <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-1">澳幣 (AUD)</label>
                  <input 
                     type="number"
                     placeholder="0"
                     value={calcAud}
                     onChange={(e) => setCalcAud(e.target.value)}
                     className="w-full bg-transparent text-2xl font-bold border-b border-white/30 focus:border-accent outline-none py-1 placeholder-gray-600"
                  />
              </div>
              <div className="text-2xl text-gray-500">→</div>
              <div className="flex-1 text-right">
                  <label className="text-xs text-gray-400 block mb-1">台幣 (TWD)</label>
                  <div className="text-2xl font-bold text-accent">
                      {calcAud ? Math.round(parseFloat(calcAud) * exchangeRate).toLocaleString() : '0'}
                  </div>
              </div>
          </div>
      </div>

      {/* Balance Summary Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5 mb-6 border border-gray-100 dark:border-none">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">目前結算 (AUD)</h2>
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

      {/* Add New Expense */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5 mb-6 border border-gray-100 dark:border-none">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">新增消費</h2>
        <div className="space-y-3">
          <input 
            className="w-full bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary border-none"
            placeholder="項目名稱 (例如：晚餐)"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
                <span className="absolute left-3 top-3 text-gray-400 font-bold">$</span>
                <input 
                    type="number" 
                    className="w-full bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white p-3 pl-7 rounded-xl outline-none focus:ring-2 focus:ring-primary border-none"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />
            </div>
            <select 
                className="bg-gray-50 text-gray-900 dark:bg-slate-700 dark:text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary border-none text-sm"
                value={payer}
                onChange={e => setPayer(e.target.value)}
            >
                {USERS.map(u => <option key={u} value={u}>{u} 先付</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 my-2 overflow-x-auto">
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
            disabled={!amount || !title}
            className="w-full bg-accent text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-200 dark:shadow-none disabled:opacity-50 hover:bg-amber-600 transition-colors"
          >
            記帳
          </button>
        </div>
      </div>

      {/* History */}
      <h3 className="text-gray-400 font-semibold mb-3 px-1 uppercase text-[10px] tracking-widest">消費紀錄</h3>
      <div className="space-y-3">
        {expenses.map(exp => (
            <div key={exp.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-50 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <div className="font-bold text-gray-800 dark:text-white text-sm">{exp.title}</div>
                    <div className="text-[10px] text-gray-400 mt-1">
                        <span className="text-primary dark:text-blue-400 font-medium">{exp.payer}</span> 支付 • {exp.involved.join(', ')} 分攤
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="font-bold text-gray-800 dark:text-white block">${exp.amount.toFixed(2)}</span>
                        <span className="text-[10px] text-gray-400">≈ NT${(exp.amount * exchangeRate).toFixed(0)}</span>
                    </div>
                    <button onClick={() => removeExpense(exp.id)} className="text-gray-300 hover:text-rose-400 p-1"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
        ))}
        {expenses.length === 0 && <div className="text-center text-gray-400 text-xs italic py-4">尚無紀錄。</div>}
      </div>
    </div>
  );
};

export default ExpensesView;