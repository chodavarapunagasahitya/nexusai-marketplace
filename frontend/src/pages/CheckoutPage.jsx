import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Sparkles,
  Zap,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { formatPrice } = useCurrency();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardName, setCardName] = useState(user?.name || 'Sarah Chen');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [postalCode, setPostalCode] = useState('94103');
  
  // Processing & Receipt state
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [id, token]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
        if (data.project.status !== 'Payment Pending' && data.project.status !== 'Awaiting Creator') {
          // If already paid
          setReceipt({
            transactionId: data.project.transactionId || 'TXN_ESCROW_ALREADY_PAID',
            amount: data.project.budget,
            creatorName: data.project.creatorName,
            paidAt: data.project.paidAt || new Date()
          });
        }
      } else {
        setError(data.message || 'Project brief not found.');
      }
    } catch (err) {
      console.error('Error fetching project for checkout:', err);
      setError('Failed to connect to marketplace server.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillTestCard = () => {
    setCardName(user?.name || 'Sarah Chen');
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('888');
    setPostalCode('94103');
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!project) return;

    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 15) {
        alert('Please enter a valid 16-digit card number or click "Use Test Card".');
        return;
      }
      if (!cardExpiry || !cardExpiry.includes('/')) {
        alert('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (!cardCvc || cardCvc.length < 3) {
        alert('Please enter a valid 3-digit CVC code.');
        return;
      }
    }

    setProcessing(true);

    try {
      // Simulate real-time 3D Secure / Stripe processing delay
      await new Promise(r => setTimeout(r, 1200));

      const last4 = cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : '4242';
      const methodLabel = paymentMethod === 'paypal' ? 'PayPal Checkout' : `Visa / Card ending in ${last4}`;

      const res = await fetch(`/api/projects/${id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod: methodLabel,
          cardLast4: last4,
          amount: project.budget
        })
      });

      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        setReceipt(data.receipt || {
          transactionId: 'TXN_ESCROW_' + Date.now(),
          amount: project.budget,
          creatorName: project.creatorName,
          paidAt: new Date()
        });
      } else {
        alert(data.message || 'Payment processing failed. Please check details and try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Network error while communicating with payment gateway.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading secure checkout vault...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error || 'Project not found.'}
        </div>
        <Link 
          to="/marketplace" 
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all"
        >
          Explore Marketplace Creators
        </Link>
      </div>
    );
  }

  // If payment succeeded, show success receipt
  if (receipt) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-500/40 text-center space-y-6 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 inline-block">
              Payment Secured & Verified
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Funds Locked in Escrow!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              You paid <strong className="text-emerald-400">{formatPrice(receipt.amount || project.budget)}</strong>. <strong className="text-white">{receipt.creatorName || project.creatorName}</strong> has been notified and production has officially started!
            </p>
          </div>

          {/* Receipt Card */}
          <div className="p-5 rounded-2xl bg-navy-950/90 border border-slate-800 text-left space-y-3 font-mono text-xs text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="text-orange-400 font-bold">{receipt.transactionId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Project Brief:</span>
              <span className="text-white font-sans font-medium truncate max-w-[240px]">{project.title}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Creator Hired:</span>
              <span className="text-purple-300 font-sans font-bold">{receipt.creatorName || project.creatorName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Escrow Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Protected
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="text-emerald-400 text-sm font-bold">{formatPrice(receipt.amount || project.budget)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs text-left flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <p>
              <strong>Next Step:</strong> {receipt.creatorName || project.creatorName} is now producing your deliverables. You can chat, upload brand assets, and track live sprints in the Project Room.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/projects/${project.id || id}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950/60 transition-all"
            >
              Enter Project Collaboration Room <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard/client"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-navy-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Checkout Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> NexusAI Escrow Vault Protected
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Secure Escrow Checkout
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Pay the fixed project budget into escrow. Funds are securely locked until you approve final deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-mono">Step 2 of 2:</span>
          <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold">
            Fund Escrow & Start Work
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Project Summary & Escrow Protection (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Project Brief Summary Card */}
          <div className="glass-card p-6 rounded-2xl border border-purple-900/40 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Project Brief
            </span>
            <h2 className="text-base font-bold text-white leading-snug">
              {project.title}
            </h2>
            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
              {project.description}
            </p>

            <div className="p-4 rounded-xl bg-navy-950/80 border border-purple-900/30 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Creator:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {project.creatorName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-purple-300 font-medium">{project.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Deadline:</span>
                <span className="text-white font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> {project.deadline}
                </span>
              </div>
            </div>

            {/* Deliverables Checklist Preview */}
            <div className="space-y-2 pt-2 border-t border-purple-900/30">
              <span className="text-[11px] font-bold text-slate-300 block">Deliverables Included:</span>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {(project.deliverables || []).map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{typeof d === 'string' ? d : d.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Escrow Guarantee Badge */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-navy-950/90 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Escrow Protection Guarantee
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Your money is <strong>not</strong> released immediately to the creator. It remains safely locked in the NexusAI smart escrow contract. The creator only receives payout after you review and approve the completed deliverables.
            </p>
            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
              <span>🔒 256-Bit SSL Encrypted</span>
              <span>⚡ Instant Refund Guarantee</span>
            </div>
          </div>

        </div>

        {/* Right Column: Payment Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 space-y-6">
            
            {/* Payment Method Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Select Payment Method
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" /> End-to-End Encrypted
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-orange-500/10 border-orange-500 text-white shadow-sm shadow-orange-950'
                      : 'bg-navy-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-orange-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-white">Credit / Debit Card</div>
                    <div className="text-[10px] text-slate-400">Visa, Mastercard, Amex</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'paypal'
                      ? 'bg-orange-500/10 border-orange-500 text-white shadow-sm shadow-orange-950'
                      : 'bg-navy-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <DollarSign className={`w-5 h-5 ${paymentMethod === 'paypal' ? 'text-orange-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-white">PayPal / Escrow Wire</div>
                    <div className="text-[10px] text-slate-400">One-click checkout</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Test Card Quick Fill Helper */}
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-orange-300">
                <Zap className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Want to test without a real card? Use Stripe sandbox card:</span>
              </div>
              <button
                type="button"
                onClick={handleFillTestCard}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold whitespace-nowrap self-start sm:self-auto"
              >
                Auto-Fill Test Card
              </button>
            </div>

            {/* Card Form */}
            <form onSubmit={handleProcessPayment} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cardholder Full Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  className="w-full bg-navy-950/90 border border-purple-900/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Card Number</span>
                  <span className="text-[10px] text-slate-500 font-mono">Supports all major banks</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full bg-navy-950/90 border border-purple-900/50 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                  <CreditCard className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Expiry Date (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full bg-navy-950/90 border border-purple-900/50 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Security Code (CVC)
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="888"
                    className="w-full bg-navy-950/90 border border-purple-900/50 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Order Cost Breakdown */}
              <div className="p-4 rounded-2xl bg-navy-950/90 border border-purple-900/30 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Project Fixed Budget:</span>
                  <span className="text-white font-mono">{formatPrice(project.budget)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Escrow Custody Fee (0% Promo):</span>
                  <span className="text-emerald-400 font-mono">$0.00 (Free)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Authenticity Verification Engine:</span>
                  <span className="text-emerald-400 font-mono">Included</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-purple-900/40 text-sm font-bold text-white">
                  <span>Total Due Today:</span>
                  <span className="text-emerald-400 font-mono text-base">{formatPrice(project.budget)}</span>
                </div>
              </div>

              {/* Submit Payment CTA */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-orange-950/60 transition-all disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Locking Funds in Escrow Vault & Starting Work...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay {formatPrice(project.budget)} & Start Creator Work</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-500">
                By clicking pay, you authorize NexusAI to hold {formatPrice(project.budget)} in escrow. The creator is required to begin production immediately upon transaction clearance.
              </p>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
