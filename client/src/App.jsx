import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, Search, X, Receipt, TrendingUp, Wallet,
  ArrowUpRight, ArrowDownRight, Sparkles, AlertCircle, Pencil,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { expensesAPI, budgetAPI } from './api.js';

/* ----------------------------------------------------------------
   CATEGORIES
   ---------------------------------------------------------------- */
const CATEGORIES = [
  { id: 'food',          name: 'Food & Dining',  emoji: '🍽️', color: '#C2410C' },
  { id: 'transport',     name: 'Transport',      emoji: '🚗', color: '#0F766E' },
  { id: 'shopping',      name: 'Shopping',       emoji: '🛍️', color: '#7C3AED' },
  { id: 'entertainment', name: 'Entertainment',  emoji: '🎬', color: '#CA8A04' },
  { id: 'bills',         name: 'Bills',          emoji: '💡', color: '#1E40AF' },
  { id: 'health',        name: 'Health',         emoji: '⚕️', color: '#BE123C' },
  { id: 'education',     name: 'Education',      emoji: '📚', color: '#15803D' },
  { id: 'other',         name: 'Other',          emoji: '📦', color: '#525252' },
];
const catById = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

/* ----------------------------------------------------------------
   ROOT COMPONENT
   ---------------------------------------------------------------- */
export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget]     = useState(2000);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [showForm, setShowForm]     = useState(false);   // unified add/edit modal
  const [editingId, setEditingId]   = useState(null);    // null = adding, id = editing
  const [showBudget, setShowBudget] = useState(false);
  const [filterCat, setFilterCat]   = useState('all');
  const [search, setSearch]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* form state */
  const today = new Date().toISOString().split('T')[0];
  const [fDesc, setFDesc] = useState('');
  const [fAmt,  setFAmt]  = useState('');
  const [fCat,  setFCat]  = useState('food');
  const [fDate, setFDate] = useState(today);
  const [budgetDraft, setBudgetDraft] = useState('');

  const resetForm = () => {
    setFDesc(''); setFAmt(''); setFCat('food'); setFDate(today);
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (expense) => {
    setEditingId(expense._id);
    setFDesc(expense.description);
    setFAmt(String(expense.amount));
    setFCat(expense.category);
    setFDate(expense.date);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  /* initial fetch */
  useEffect(() => {
    (async () => {
      try {
        const [exp, bud] = await Promise.all([expensesAPI.getAll(), budgetAPI.get()]);
        setExpenses(exp);
        setBudget(bud.amount);
      } catch (err) {
        setError('Cannot reach the backend. Make sure the server is running on port 5000 and MongoDB is connected.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* mutations */
  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!fDesc.trim() || !fAmt || parseFloat(fAmt) <= 0) return;
    setSubmitting(true);
    const payload = {
      description: fDesc.trim(),
      amount: parseFloat(fAmt),
      category: fCat,
      date: fDate,
    };
    try {
      if (editingId) {
        // EDIT
        const updated = await expensesAPI.update(editingId, payload);
        setExpenses(expenses.map(x => x._id === editingId ? updated : x));
      } else {
        // ADD
        const created = await expensesAPI.create(payload);
        setExpenses([created, ...expenses]);
      }
      closeForm();
    } catch (err) {
      alert('Failed to save expense: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const removeExpense = async (id) => {
    try {
      await expensesAPI.remove(id);
      setExpenses(expenses.filter(x => x._id !== id));
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  const saveBudgetEdit = async () => {
    const v = parseFloat(budgetDraft);
    if (isNaN(v) || v < 0) { setShowBudget(false); return; }
    try {
      const updated = await budgetAPI.update(v);
      setBudget(updated.amount);
    } catch (err) {
      alert('Failed to update budget');
    }
    setShowBudget(false);
  };

  /* derived values */
  const filtered = useMemo(() => expenses.filter(e =>
    (filterCat === 'all' || e.category === filterCat) &&
    (!search || e.description.toLowerCase().includes(search.toLowerCase()))
  ), [expenses, filterCat, search]);

  const stats = useMemo(() => {
    const now = new Date();
    const m = now.getMonth(), y = now.getFullYear();
    const inMonth = (d) => { const x = new Date(d); return x.getMonth() === m && x.getFullYear() === y; };

    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const thisMonth = expenses.filter(e => inMonth(e.date)).reduce((s, e) => s + e.amount, 0);

    const byCat = CATEGORIES.map(c => ({
      ...c,
      total: expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0)
    })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const k = d.toISOString().split('T')[0];
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: expenses.filter(e => e.date === k).reduce((s, e) => s + e.amount, 0),
      };
    });

    const dayOfMonth = now.getDate();
    const dailyAvg   = dayOfMonth > 0 ? thisMonth / dayOfMonth : 0;

    return { total, thisMonth, byCat, last7, dailyAvg, count: expenses.length };
  }, [expenses]);

  const budgetPct = budget > 0 ? Math.min((stats.thisMonth / budget) * 100, 100) : 0;
  const overBudget = stats.thisMonth > budget && budget > 0;

  /* loading / error states */
  if (loading) {
    return (
      <div style={{ background: '#FAF8F3', minHeight: '100vh' }}
           className="flex items-center justify-center text-stone-700 font-serif">
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ background: '#FAF8F3', minHeight: '100vh' }}
           className="flex items-center justify-center p-6">
        <div className="max-w-md bg-white border border-rose-200 rounded-2xl p-6">
          <AlertCircle className="text-rose-700 mb-3" size={28} />
          <h2 className="font-serif text-xl mb-2">Connection error</h2>
          <p className="text-sm text-stone-600 mb-4">{error}</p>
          <pre className="bg-stone-50 text-xs p-3 rounded font-mono overflow-x-auto">
{`# Open the server folder, then run:
npm install
npm run dev`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FAF8F3', minHeight: '100vh', fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
         className="text-stone-900">

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
        .font-mono-tab { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
        .grain { background-image: radial-gradient(rgba(0,0,0,0.025) 1px, transparent 1px); background-size: 3px 3px; }
        @keyframes fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .anim-in { animation: fadein 0.5s ease-out both; }
        .anim-d1 { animation-delay: 0.05s; }
        .anim-d2 { animation-delay: 0.10s; }
        .anim-d3 { animation-delay: 0.15s; }
        .anim-d4 { animation-delay: 0.20s; }
      `}</style>

      <div className="grain absolute inset-0 pointer-events-none opacity-60" />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14">

        {/* HEADER */}
        <header className="flex items-end justify-between mb-12 anim-in">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
              <span className="inline-block w-6 h-px bg-stone-400" />
              Personal Ledger · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-medium tracking-tight leading-none">
              Expense<br/>
              <span style={{ color: '#C2410C' }} className="italic">Tracker</span>
            </h1>
          </div>
          <button
            onClick={openAddForm}
            className="hidden md:flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-50 px-5 py-3 rounded-full text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Expense
          </button>
        </header>

        {/* HERO BUDGET */}
        <section className="bg-white border border-stone-200 rounded-3xl p-8 md:p-10 mb-6 anim-in anim-d1 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.07] blur-3xl"
            style={{ background: overBudget ? '#BE123C' : '#C2410C' }}
          />
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">Spent this month</div>
              <div className="font-display font-mono-tab text-6xl md:text-7xl font-medium tracking-tight leading-none">
                ${stats.thisMonth.toFixed(2)}
              </div>
              <div className="mt-4 text-stone-600 text-sm">
                of <span className="font-mono-tab">${budget.toFixed(2)}</span> monthly budget
                <button
                  onClick={() => { setBudgetDraft(String(budget)); setShowBudget(true); }}
                  className="ml-2 text-stone-900 underline underline-offset-2 hover:no-underline"
                >
                  edit
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs uppercase tracking-[0.2em] text-stone-500">Budget progress</span>
                <span className={`font-mono-tab text-sm ${overBudget ? 'text-rose-700' : 'text-stone-700'}`}>
                  {budgetPct.toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${budgetPct}%`,
                    background: overBudget
                      ? 'linear-gradient(90deg, #BE123C, #E11D48)'
                      : 'linear-gradient(90deg, #C2410C, #EA580C)'
                  }}
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                {overBudget ? (
                  <>
                    <ArrowUpRight size={14} className="text-rose-700" />
                    <span className="text-rose-700">Over budget by ${(stats.thisMonth - budget).toFixed(2)}</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight size={14} className="text-emerald-700" />
                    <span className="text-stone-700">${(budget - stats.thisMonth).toFixed(2)} remaining</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* STATS GRID */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 anim-in anim-d2">
          <StatCard label="All-time spent"    value={`$${stats.total.toFixed(2)}`} icon={<Wallet size={16} />} />
          <StatCard label="Transactions"      value={stats.count.toString()}        icon={<Receipt size={16} />} />
          <StatCard label="Daily avg (month)" value={`$${stats.dailyAvg.toFixed(2)}`} icon={<TrendingUp size={16} />} />
          <StatCard
            label="Top category"
            value={stats.byCat[0] ? `${stats.byCat[0].emoji} ${stats.byCat[0].name.split(' ')[0]}` : '—'}
            icon={<Sparkles size={16} />}
          />
        </section>

        {/* CHARTS */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 mb-6 anim-in anim-d3">
          {/* Last 7 Days */}
          <div className="lg:col-span-3 bg-white border border-stone-200 rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-baseline mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-1">Last 7 days</div>
                <div className="font-display text-2xl">Spending velocity</div>
              </div>
              <div className="font-mono-tab text-sm text-stone-600">
                ${stats.last7.reduce((s, d) => s + d.amount, 0).toFixed(2)}
              </div>
            </div>
            {stats.last7.some(d => d.amount > 0) ? (
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <AreaChart data={stats.last7} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"  stopColor="#C2410C" stopOpacity={0.35}/>
                        <stop offset="100%" stopColor="#C2410C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#E8E4DA" vertical={false} />
                    <XAxis dataKey="day" stroke="#78716C" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#78716C" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: '#1C1917', border: 'none', borderRadius: 8, color: '#FAFAF9' }}
                      labelStyle={{ color: '#A8A29E', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Spent']}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#C2410C" strokeWidth={2.5} fill="url(#velocityGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyMini text="No spending in the last 7 days" />
            )}
          </div>

          {/* By Category */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-3xl p-6 md:p-8">
            <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-1">Breakdown</div>
            <div className="font-display text-2xl mb-6">By category</div>
            {stats.byCat.length > 0 ? (
              <>
                <div style={{ width: '100%', height: 160 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={stats.byCat}
                        dataKey="total"
                        nameKey="name"
                        cx="50%" cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {stats.byCat.map((c) => <Cell key={c.id} fill={c.color} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1C1917', border: 'none', borderRadius: 8, color: '#FAFAF9' }}
                        formatter={(v) => [`$${Number(v).toFixed(2)}`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {stats.byCat.slice(0, 4).map(c => (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                        <span className="text-stone-700">{c.emoji} {c.name}</span>
                      </div>
                      <span className="font-mono-tab text-stone-900">${c.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyMini text="No expenses yet" />
            )}
          </div>
        </section>

        {/* TRANSACTIONS */}
        <section className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 anim-in anim-d4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-1">The ledger</div>
              <div className="font-display text-2xl">All transactions</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search descriptions…"
                  className="pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm w-full sm:w-56 focus:outline-none focus:border-stone-400 focus:bg-white"
                />
              </div>
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 focus:bg-white"
              >
                <option value="all">All categories</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Receipt size={32} className="mx-auto mb-3 text-stone-300" strokeWidth={1.5} />
              <div className="text-stone-500 text-sm">
                {expenses.length === 0
                  ? "No expenses yet — tap 'New Expense' to start tracking."
                  : "No matches. Try clearing your filters."}
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {filtered.map(e => {
                const c = catById(e.category);
                return (
                  <li key={e._id} className="flex items-center justify-between gap-3 py-4 group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: c.color + '15', border: `1px solid ${c.color}30` }}
                      >
                        <span>{c.emoji}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{e.description}</div>
                        <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                          <span>{c.name}</span>
                          <span className="text-stone-300">·</span>
                          <span className="font-mono-tab">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="font-mono-tab font-medium text-right mr-1">
                        −${e.amount.toFixed(2)}
                      </div>
                      <button
                        onClick={() => openEditForm(e)}
                        className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-md md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        aria-label="Edit expense"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => removeExpense(e._id)}
                        className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-md md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        aria-label="Delete expense"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="text-center text-xs text-stone-400 mt-10">
          MERN Stack · React · Express · MongoDB · Node
        </p>

        {/* Mobile FAB */}
        <button
          onClick={openAddForm}
          className="md:hidden fixed bottom-6 right-6 bg-stone-900 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Add expense"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* ADD / EDIT EXPENSE MODAL */}
      {showForm && (
        <Modal onClose={closeForm} title={editingId ? 'Edit expense' : 'New expense'}>
          <form onSubmit={handleSubmitExpense} className="space-y-4">
            <Field label="Description">
              <input
                type="text"
                value={fDesc}
                onChange={(e) => setFDesc(e.target.value)}
                placeholder="e.g. Groceries at Trader Joe's"
                autoFocus
                className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono-tab">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={fAmt}
                    onChange={(e) => setFAmt(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 border border-stone-200 rounded-lg font-mono-tab focus:outline-none focus:border-stone-900"
                  />
                </div>
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  value={fDate}
                  onChange={(e) => setFDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </Field>
            </div>

            <Field label="Category">
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFCat(c.id)}
                    className={`p-2.5 rounded-lg text-xs flex flex-col items-center gap-1 transition-all ${
                      fCat === c.id
                        ? 'border-2 text-stone-900 font-medium'
                        : 'border border-stone-200 text-stone-600 hover:border-stone-400'
                    }`}
                    style={fCat === c.id ? { borderColor: c.color, background: c.color + '10' } : {}}
                  >
                    <span className="text-xl">{c.emoji}</span>
                    <span>{c.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </Field>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 py-2.5 border border-stone-200 rounded-lg text-sm hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 disabled:opacity-50"
              >
                {submitting ? 'Saving…' : (editingId ? 'Save changes' : 'Add expense')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* BUDGET MODAL */}
      {showBudget && (
        <Modal onClose={() => setShowBudget(false)} title="Monthly budget">
          <div className="space-y-4">
            <Field label="Budget amount">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono-tab">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={budgetDraft}
                  onChange={(e) => setBudgetDraft(e.target.value)}
                  autoFocus
                  className="w-full pl-7 pr-3 py-2.5 border border-stone-200 rounded-lg font-mono-tab focus:outline-none focus:border-stone-900"
                />
              </div>
            </Field>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBudget(false)}
                className="flex-1 py-2.5 border border-stone-200 rounded-lg text-sm hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={saveBudgetEdit}
                className="flex-1 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
   PRESENTATIONAL HELPERS
   ---------------------------------------------------------------- */
function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 md:p-5">
      <div className="flex items-center gap-1.5 text-stone-500 text-[11px] uppercase tracking-[0.15em] mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-display font-mono-tab text-xl md:text-2xl font-medium tracking-tight truncate">
        {value}
      </div>
    </div>
  );
}

function EmptyMini({ text }) {
  return <div className="py-12 text-center text-sm text-stone-400">{text}</div>;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: 'rgba(28, 25, 23, 0.4)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 md:p-8 shadow-2xl"
        style={{ animation: 'fadein 0.25s ease-out both' }}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="font-display text-2xl">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 -m-1 text-stone-400 hover:text-stone-900"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
