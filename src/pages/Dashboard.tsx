import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Clock, Plus, SortAsc, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { Modal, buttonClassName, inputClassName, labelClassName } from "../components/Modal";
import { Toast } from "../components/Toast";
import { api } from "../lib/api";
import { useSarvamTTS } from "../lib/useSarvamTTS";
import { useToast } from "../lib/useToast";
import type { Customer, DashboardStats, PaymentMethod, ScoreData, UdhaarEntry } from "../types";

type CustomerSortOption = 'name' | 'recent' | 'credit_score' | 'activity';
type LedgerSortOption = 'customer' | 'amount' | 'due_date' | 'status' | 'credit_score';

// --- REUSABLE COMPONENTS FROM REFERENCE ---

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const ScoreGauge = ({ score, maxScore = 1000, size = "md" }: { score: number, maxScore?: number, size?: "md" | "sm" }) => {
  const radius = size === "sm" ? 14 : 36;
  const stroke = size === "sm" ? 3 : 6;
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);
  const percentage = normalizedScore / maxScore;

  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - percentage * circumference;

  // Determine color based on score scale
  let colorClass: string;
  
  if (maxScore <= 100) {
    // For 0-100 scale: Green >= 65, Yellow 50-64, Red < 50
    if (score >= 65) {
      colorClass = "text-green-500";
    } else if (score >= 50) {
      colorClass = "text-yellow-500";
    } else {
      colorClass = "text-red-500";
    }
  } else {
    // For 0-1000 scale: Green >= 650, Yellow 500-649, Red < 500
    if (score >= 650) {
      colorClass = "text-green-500";
    } else if (score >= 500) {
      colorClass = "text-yellow-500";
    } else {
      colorClass = "text-red-500";
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={radius * 2 + stroke * 2} height={radius + stroke * 2} className="transform">
        <path
          d={`M ${stroke},${radius + stroke} A ${radius},${radius} 0 0,1 ${radius * 2 + stroke},${radius + stroke}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke},${radius + stroke} A ${radius},${radius} 0 0,1 ${radius * 2 + stroke},${radius + stroke}`}
          fill="none"
          className={`stroke-current ${colorClass}`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      {size !== "sm" && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center leading-tight">
          <span className="text-xl font-bold text-white">{score}</span>
        </div>
      )}
      {size === "sm" && (
        <span
          className={`absolute text-[10px] font-bold -bottom-0.5 ${colorClass.replace(
            "text-",
            "text-"
          )}`}
        >
          {score}
        </span>
      )}
    </div>
  );
};

const Sparkline = ({ data }: { data: number[] }) => {
  if (!data || data.length === 0) return null;

  const width = 80;
  const height = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" L ");

  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? "#3b82f6" : "#8b5cf6";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M 0,${height} L ${points} L ${width},${height} Z`}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
      <path
        d={`M ${points}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const StatusBadge = ({ status, dueDate }: { status: string; dueDate?: string }) => {
  const styles: Record<string, string> = {
    Due: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    Overdue: "bg-red-500/20 text-red-400 border border-red-500/30",
    Paid: "bg-green-500/20 text-green-400 border border-green-500/30",
  };

  let displayStatus = status;
  if (status === "OVERDUE") displayStatus = "Overdue";
  else if (status === "PAID") displayStatus = "Paid";
  else if (status === "PENDING" || status === "DUE") {
    // Check if due date has passed for pending/due items
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      displayStatus = due < today ? "Overdue" : "Due";
    } else {
      displayStatus = "Due";
    }
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[displayStatus] || "bg-gray-500/20 text-gray-400"
      }`}
    >
      {displayStatus}
    </span>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ledger, setLedger] = useState<UdhaarEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [scores, setScores] = useState<Record<number, ScoreData>>({});
  const [customerSort, setCustomerSort] = useState<CustomerSortOption>('name');
  const [ledgerSort, setLedgerSort] = useState<LedgerSortOption>('due_date');
  
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerConsent, setNewCustomerConsent] = useState(false);

  const [paymentCustomerId, setPaymentCustomerId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [customerSearch, setCustomerSearch] = useState("");

  const { toast, showToast } = useToast();
  const { speak } = useSarvamTTS();

  const fetchData = useCallback(async (sort: CustomerSortOption = customerSort) => {
    try {
      const [statsRes, udhaarRes, customersRes] = await Promise.all([
        api.stats(),
        api.udhaar(),
        api.customers(sort),
      ]);
      setStats(statsRes);
      setLedger(udhaarRes.ledger);
      setCustomers(customersRes.customers);

      const scorePromises = customersRes.customers.map((c) =>
        api.score(c.id).then((s) => ({ id: c.id, score: s }))
      );
      const scoreResults = await Promise.all(scorePromises);
      const scoresMap: Record<number, ScoreData> = {};
      scoreResults.forEach((r) => {
        scoresMap[r.id] = r.score;
      });
      setScores(scoresMap);
    } catch (e) {
      console.error("[Dashboard] Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [customerSort]);

  useEffect(() => {
    fetchData();
    const ledgerInterval = setInterval(() => {
      api.udhaar().then((res) => setLedger(res.ledger));
    }, 5000);
    const statsInterval = setInterval(() => {
      api.stats().then((res) => setStats(res));
    }, 10000);
    return () => {
      clearInterval(ledgerInterval);
      clearInterval(statsInterval);
    };
  }, [fetchData]);

  // Handle sort change
  const handleSortChange = (sort: CustomerSortOption) => {
    setCustomerSort(sort);
    fetchData(sort);
  };

  // Sort ledger entries
  const sortedLedger = [...ledger].sort((a, b) => {
    switch (ledgerSort) {
      case 'customer':
        return a.customer_name.localeCompare(b.customer_name);
      case 'amount':
        return b.amount - a.amount; // Highest first
      case 'due_date':
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime(); // Earliest first
      case 'status':
        const statusOrder = { 'OVERDUE': 0, 'PENDING': 1, 'PAID': 2 };
        return (statusOrder[a.status as keyof typeof statusOrder] ?? 1) - (statusOrder[b.status as keyof typeof statusOrder] ?? 1);
      case 'credit_score':
        return a.credit_score - b.credit_score; // Lowest (risky) first
      default:
        return 0;
    }
  });

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;
    try {
      await api.addCustomer(newCustomerName.trim(), newCustomerPhone.trim(), newCustomerConsent);
      showToast(`${newCustomerName} added successfully!`, "success");
      speak(`${newCustomerName} ko customer list mein add kar diya gaya.`, "hi-IN");
      setShowAddCustomer(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerConsent(false);
      fetchData();
    } catch {
      showToast("Failed to add customer", "error");
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentCustomerId || !paymentAmount || Number(paymentAmount) <= 0) return;
    const customer = customers.find((c) => c.id === paymentCustomerId);
    try {
      await api.recordPayment(paymentCustomerId, Number(paymentAmount), paymentMethod);
      setShowRecordPayment(false);
      showToast(`₹${paymentAmount} recorded for ${customer?.name}`, "success");
      speak(`₹${paymentAmount} ${customer?.name} se receive hua. Sharma Kirana mein record ho gaya.`, "hi-IN");

      setPaymentCustomerId(null);
      setPaymentAmount("");
      setPaymentMethod("upi");
      setCustomerSearch("");
      fetchData();
    } catch {
      showToast("Failed to record payment", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-white/50 border border-white/10 rounded-xl px-4 py-2">
          Loading Dashboard...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-100 font-sans relative overflow-hidden flex flex-col items-center">
      
      {/* Background Decorative Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-60 pointer-events-none"></div>
      <div className="fixed top-[20%] right-[-5%] w-80 h-80 bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[20%] w-120 h-120 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-40 pointer-events-none"></div>
      <div className="fixed top-1/2 left-[10%] w-64 h-64 bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[80px] opacity-40 pointer-events-none"></div>

      {/* Main Content Container */}
      <div className="w-full max-w-5xl p-4 md:p-8 z-10 pb-24">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <button className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md">
                <ArrowLeft size={20} />
              </button>
            </Link>
            <h1 className="text-2xl font-bold tracking-wide">Dashboard</h1>
          </div>
          <button 
            onClick={() => setShowAddCustomer(true)} 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors backdrop-blur-md"
          >
            <Plus size={16} /> Add Customer
          </button>
        </header>

        {/* TOP METRICS CARDS */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1a1c29]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <h3 className="text-gray-400 text-sm font-medium mb-1">Today's Collection</h3>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.todayCollection)}</p>
                <TrendingUp className="text-green-400 mb-1" size={24} />
              </div>
            </div>

            <div className="bg-[#1a1c29]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg">
              <h3 className="text-gray-400 text-sm font-medium mb-1">Pending Udhaar</h3>
              <p className="text-3xl font-bold text-white">{formatCurrency(stats.pendingTotal)}</p>
            </div>

            <div className="bg-[#1a1c29]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg">
              <h3 className="text-gray-400 text-sm font-medium mb-1">Overdue</h3>
              <p className="text-3xl font-bold text-white">{formatCurrency(stats.overdueTotal)}</p>
            </div>
          </div>
        )}

        {/* RECORD PAYMENT ACTION */}
        <button 
          onClick={() => setShowRecordPayment(true)}
          className="w-full py-4 rounded-xl bg-[#141625]/60 backdrop-blur-md border border-indigo-500/50 text-indigo-300 font-medium flex items-center justify-center gap-2 hover:bg-indigo-900/20 hover:border-indigo-400 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)] mb-8"
        >
          <Plus size={18} /> Record Payment
        </button>

        {/* UDHAAR LEDGER */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold ml-1">Udhaar Ledger</h2>
            {/* Ledger Sort Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setLedgerSort('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  ledgerSort === 'customer'
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                <SortAsc size={12} />
                Name
              </button>
              <button
                onClick={() => setLedgerSort('amount')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  ledgerSort === 'amount'
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                ₹ Amount
              </button>
              <button
                onClick={() => setLedgerSort('due_date')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  ledgerSort === 'due_date'
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Clock size={12} />
                Due Date
              </button>
              <button
                onClick={() => setLedgerSort('status')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  ledgerSort === 'status'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                <AlertTriangle size={12} />
                Status
              </button>
              <button
                onClick={() => setLedgerSort('credit_score')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  ledgerSort === 'credit_score'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                Risk
              </button>
            </div>
          </div>
          <div className="bg-[#1a1c29]/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-x-auto">
            <div className="min-w-150">
              <div className="grid grid-cols-5 text-xs text-gray-400 font-medium px-6 py-4 border-b border-white/5">
                <div className="col-span-1">Customer</div>
                <div className="col-span-1">Amount</div>
                <div className="col-span-1">Due Date</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right pr-4">Credit Score</div>
              </div>
              
              <div className="divide-y divide-white/5">
                {sortedLedger.map((item) => (
                  <div key={item.id} className="grid grid-cols-5 items-center px-6 py-4 hover:bg-white/2 transition-colors">
                    <div className="col-span-1 font-medium text-sm text-gray-200">{item.customer_name}</div>
                    <div className="col-span-1 text-sm">{formatCurrency(item.amount)}</div>
                    <div className="col-span-1 text-sm text-gray-400">{formatDate(item.due_date)}</div>
                    <div className="col-span-1">
                      <StatusBadge status={item.status} dueDate={item.due_date} />
                    </div>
                    <div className="col-span-1 flex justify-end">
                       {/* Calculate max score for 100/1000 scales */}
                       <ScoreGauge score={item.credit_score} maxScore={item.credit_score <= 100 ? 100 : 1000} size="sm" />
                    </div>
                  </div>
                ))}
                {sortedLedger.length === 0 && (
                  <div className="text-center py-6 text-white/50">No ledger entries</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER CREDIT SCORES */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold ml-1">Customer Credit Scores</h2>
            {/* Sort Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => handleSortChange('name')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  customerSort === 'name'
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                <SortAsc size={12} />
                Name
              </button>
              <button
                onClick={() => handleSortChange('recent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  customerSort === 'recent'
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Clock size={12} />
                Recent
              </button>
              <button
                onClick={() => handleSortChange('credit_score')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  customerSort === 'credit_score'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                <AlertTriangle size={12} />
                Risk
              </button>
              <button
                onClick={() => handleSortChange('activity')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  customerSort === 'activity'
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                <TrendingUp size={12} />
                Activity
              </button>
            </div>
          </div>
          {/* Horizontal scroll container for cards */}
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
            {customers.map((customer) => {
              const scoreData = scores[customer.id];
              const score = scoreData?.score ?? customer.credit_score;
              const rating = scoreData?.category ?? (score >= 85 ? "Good" : score >= 60 ? "Average" : "Risky");
              
              // Use mock history for now
              const history = [20, 35, 25, 50, 40, 60, Math.max(0, Math.min(100, score))];
              
              let ratingColor = "text-green-400";
              const isSmallScale = score <= 100;
              if (isSmallScale) {
                if (score < 65) ratingColor = "text-yellow-400";
                if (score < 50) ratingColor = "text-red-400";
              } else {
                if (score < 650) ratingColor = "text-yellow-400";
                if (score < 500) ratingColor = "text-red-400";
              }

              return (
                <div key={customer.id} className="min-w-70 shrink-0 bg-[#1a1c29]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col snap-start hover:bg-[#1a1c29]/80 transition-colors cursor-pointer">
                  <h3 className="text-sm font-medium text-gray-200 mb-4">{customer.name}</h3>
                  <div className="flex justify-between items-end mt-auto">
                    
                    {/* Gauge Side */}
                    <div className="flex flex-col items-center">
                       <ScoreGauge score={score} maxScore={isSmallScale ? 100 : 1000} />
                       <span className={`text-xs mt-1 font-medium ${ratingColor}`}>
                         {rating}
                       </span>
                    </div>

                    {/* History Sparkline Side */}
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 mb-2">History</span>
                      <Sparkline data={history} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      <BottomNav />

      {/* --- MODALS --- */}
      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        title="Add Customer"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className={labelClassName}>Name</label>
            <input
              type="text"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              placeholder="Customer name"
              className={`${inputClassName} bg-white/5 border-white/10`}
            />
          </div>
          <div>
            <label className={labelClassName}>Phone</label>
            <input
              type="tel"
              value={newCustomerPhone}
              onChange={(e) => setNewCustomerPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className={`${inputClassName} bg-white/5 border-white/10`}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-white/60 text-sm">Allow WhatsApp reminders</span>
            <button
              onClick={() => setNewCustomerConsent(!newCustomerConsent)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                newCustomerConsent ? "bg-indigo-500" : "bg-white/20"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${newCustomerConsent ? 'left-6' : 'left-1'}`}
              />
            </button>
          </div>
          <button
            onClick={handleAddCustomer}
            disabled={!newCustomerName.trim() || !newCustomerPhone.trim()}
            className={`${buttonClassName} bg-indigo-500 text-white`}
          >
            Add Customer
          </button>
        </div>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showRecordPayment}
        onClose={() => {
          setShowRecordPayment(false);
          setCustomerSearch("");
          setPaymentCustomerId(null);
        }}
        title="Record Payment"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className={labelClassName}>Customer</label>
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search customer..."
              className={`${inputClassName} bg-white/5 border-white/10`}
            />
            {customerSearch && (
              <div className="mt-2 rounded-xl overflow-hidden max-h-40 overflow-y-auto bg-white/5 border border-white/10">
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setPaymentCustomerId(c.id);
                      setCustomerSearch(c.name);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-white/10 flex items-center justify-between transition-colors ${
                      paymentCustomerId === c.id ? "bg-white/10" : ""
                    }`}
                  >
                    <span className="text-white text-sm">{c.name}</span>
                    <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Score {c.credit_score}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className={labelClassName}>Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">₹</span>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0"
                className={`${inputClassName} pl-10! bg-white/5 border-white/10`}
              />
            </div>
          </div>
          <div>
            <label className={labelClassName}>Method</label>
            <div className="flex gap-2">
              {(["upi", "cash", "card"] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    paymentMethod === method
                      ? "bg-indigo-500 text-white border border-indigo-400"
                      : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {method.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleRecordPayment}
            disabled={!paymentCustomerId || !paymentAmount || Number(paymentAmount) <= 0}
            className={`${buttonClassName} bg-indigo-500 text-white border-0`}
          >
            Record ₹{paymentAmount || "0"}
          </button>
        </div>
      </Modal>

      <Toast toast={toast} />

      {/* Basic CSS to hide scrollbar for the horizontal list */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
