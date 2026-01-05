import React, { useState, useMemo } from 'react';
import { TodoItem, TodoCategory } from '../types';
import { ChecklistIcon, TrashIcon, ShoppingIcon, LuggageIcon, DocumentIcon, GiftIcon, PlusIcon, EditIcon } from './Icons';

interface TodoViewProps {
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
  categories: TodoCategory[];
  setCategories: React.Dispatch<React.SetStateAction<TodoCategory[]>>;
  isReadOnly?: boolean;
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

const TodoView: React.FC<TodoViewProps> = ({ todos, setTodos, categories, setCategories, isReadOnly = false }) => {
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todo');
  
  // Category Management State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const handleAddTodo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isReadOnly) return;

    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isCompleted: false,
      category: selectedCategory
    };

    setTodos([newItem, ...todos]);
    setInputText('');
  };

  const toggleComplete = (id: string) => {
    if (isReadOnly) return;
    setTodos(todos.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const deleteTodo = (id: string) => {
    if (isReadOnly) return;
    setTodos(todos.filter(t => t.id !== id));
  };

  const groupedTodos = useMemo(() => {
    const groups: Record<string, TodoItem[]> = {};
    categories.forEach(c => groups[c.id] = []);
    
    // Add fallback bucket for orphaned items
    groups['uncategorized'] = [];

    todos.forEach(t => {
      if (groups[t.category]) {
          groups[t.category].push(t);
      } else {
          // If category was deleted or invalid, move to first available (usually 'todo') or fallback
          const defaultCat = categories.find(c => c.id === 'todo')?.id || categories[0]?.id;
          if (defaultCat) {
              groups[defaultCat].push(t);
              // Optimistically fix the data? Maybe not during render.
          } else {
              groups['uncategorized'].push(t);
          }
      }
    });
    
    return groups;
  }, [todos, categories]);

  // Manage Categories Logic
  const handleAddCategory = () => {
      if (!newCatName.trim() || isReadOnly) return;
      
      const newId = `cat_${Date.now()}`;
      // Pick random color
      const randomColor = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)];

      const newCat: TodoCategory = {
          id: newId,
          label: newCatName.trim(),
          color: randomColor,
          isDefault: false
      };

      setCategories([...categories, newCat]);
      setNewCatName('');
  };

  const handleDeleteCategory = (id: string) => {
      if (isReadOnly) return;
      if (window.confirm('確定要刪除此分類嗎？該分類下的任務將會移至預設分類。')) {
          setCategories(categories.filter(c => c.id !== id));
          
          // Move items to 'todo' or first available
          const targetId = 'todo'; 
          setTodos(prev => prev.map(t => t.category === id ? { ...t, category: targetId } : t));
          
          if (selectedCategory === id) setSelectedCategory(targetId);
      }
  };

  const getIconForCategory = (id: string) => {
      // Simple mapping based on ID keywords or default
      if (id.includes('shop') || id.includes('buy')) return <ShoppingIcon className="w-4 h-4"/>;
      if (id.includes('pack') || id.includes('luggage')) return <LuggageIcon className="w-4 h-4"/>;
      if (id.includes('doc') || id.includes('pass')) return <DocumentIcon className="w-4 h-4"/>;
      if (id.includes('gift')) return <GiftIcon className="w-4 h-4"/>;
      return <ChecklistIcon className="w-4 h-4"/>;
  };

  // Calculate progress
  const total = todos.length;
  const completed = todos.filter(t => t.isCompleted).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col h-full bg-surface dark:bg-darkSurface transition-colors">
      {/* Progress Bar Header */}
      <div className="bg-white dark:bg-slate-900 p-6 pb-4 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-10">
         <div className="flex justify-between items-end mb-2">
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">待辦事項</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">完成度 {progress}% ({completed}/{total})</p>
            </div>
            {total > 0 && progress === 100 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full animate-bounce">
                    🎉 全部完成！
                </span>
            )}
         </div>
         <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
             <div 
                className="h-full bg-primary dark:bg-blue-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
             ></div>
         </div>
      </div>

      {/* Input Area (Hide if Read Only) */}
      {!isReadOnly && (
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm z-10">
            <form onSubmit={handleAddTodo} className="space-y-3">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="新增待辦事項..."
                    className="w-full p-3 bg-gray-50 text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-none outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all
                                ${selectedCategory === cat.id
                                    ? 'bg-primary border-primary text-white dark:bg-blue-600 dark:border-blue-600' 
                                    : 'bg-white border-gray-200 text-gray-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400'}`}
                        >
                            {getIconForCategory(cat.id)}
                            {cat.label}
                        </button>
                    ))}
                    <button 
                        type="button"
                        onClick={() => setIsManageModalOpen(true)}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-primary dark:hover:text-blue-400 border border-transparent hover:border-gray-300 transition-all shrink-0"
                    >
                        <EditIcon className="w-3 h-3" />
                    </button>
                </div>
                <button 
                    type="submit" 
                    disabled={!inputText}
                    className="w-full bg-primary dark:bg-blue-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                >
                    新增
                </button>
            </form>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-6 no-scrollbar">
          {categories.map(cat => {
              const items = groupedTodos[cat.id] || [];
              if (items.length === 0) return null;

              return (
                  <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-2 mb-3">
                          <span className={`p-1.5 rounded-lg ${cat.color}`}>
                              {getIconForCategory(cat.id)}
                          </span>
                          <h3 className="font-bold text-gray-700 dark:text-gray-200">{cat.label}</h3>
                          <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 px-2 py-0.5 rounded-full">{items.length}</span>
                      </div>
                      <div className="space-y-2">
                          {items.map(item => (
                              <div 
                                key={item.id} 
                                className={`flex items-center p-3 rounded-xl border transition-all ${
                                    item.isCompleted 
                                        ? 'bg-gray-50 border-gray-100 dark:bg-slate-800/50 dark:border-slate-800' 
                                        : 'bg-white border-gray-100 shadow-sm dark:bg-slate-800 dark:border-slate-700'
                                }`}
                              >
                                  <button 
                                    onClick={() => toggleComplete(item.id)}
                                    disabled={isReadOnly}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
                                        item.isCompleted 
                                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                                            : `border-gray-300 dark:border-gray-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`
                                    }`}
                                  >
                                      {item.isCompleted && <ChecklistIcon className="w-4 h-4" />}
                                  </button>
                                  
                                  <span className={`flex-1 text-sm ${item.isCompleted ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                                      {item.text}
                                  </span>

                                  {!isReadOnly && (
                                    <button onClick={() => deleteTodo(item.id)} className="p-2 text-gray-300 hover:text-red-400 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              )
          })}

          {total === 0 && (
              <div className="text-center py-10 opacity-50">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <ChecklistIcon className="w-8 h-8" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">尚無待辦事項<br/>開始規劃你的行李與購物清單吧！</p>
              </div>
          )}
      </div>

      {/* Manage Categories Modal */}
      {isManageModalOpen && !isReadOnly && (
        <div className="fixed inset-0 bg-primary/20 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
             <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                 <EditIcon className="w-5 h-5"/> 管理分類
             </h3>
             
             <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
                 {categories.map(cat => (
                     <div key={cat.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                         <div className="flex items-center gap-2">
                             <div className={`w-3 h-3 rounded-full ${cat.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
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

export default TodoView;