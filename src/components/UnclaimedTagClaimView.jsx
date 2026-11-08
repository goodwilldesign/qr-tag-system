import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { playDoorbellChime } from '../lib/chimeSound';
import { 
  Sparkles, Tag, CarFront, Bell, Baby, KeySquare, 
  Smartphone, Briefcase, Leaf, Wallet, Link2, ShieldCheck, 
  ArrowRight, CheckCircle2, Lock, KeyRound, AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  { id: 'dog', label: 'Pet Tag', desc: 'Pet collar, medical info, owner WhatsApp', icon: Tag, emoji: '🐶', color: 'amber' },
  { id: 'parking', label: 'Vehicle Sticker', desc: 'Windshield decal, move-car alerts, 100% privacy', icon: CarFront, emoji: '🚗', color: 'emerald' },
  { id: 'doorbell', label: 'Smart Doorbell', desc: 'Visitor chime, doorstep selfie & package proof', icon: Bell, emoji: '🔔', color: 'violet' },
  { id: 'kids', label: 'Child Safety ID', desc: 'Emergency guardian contacts & school info', icon: Baby, emoji: '👶', color: 'pink' },
  { id: 'rental', label: 'Rental / Homestay', desc: 'Airbnb check-in, WiFi credentials & rules', icon: KeySquare, emoji: '🔑', color: 'blue' },
  { id: 'electronics', label: 'Asset / Equipment', desc: 'Laptop, camera, tools & office assets', icon: Smartphone, emoji: '💻', color: 'indigo' },
  { id: 'business', label: 'Digital Card', desc: 'vCard download, social links & portfolio', icon: Briefcase, emoji: '📇', color: 'fuchsia' },
  { id: 'plant', label: 'Plant Care', desc: 'Watering reminders & plant care guide', icon: Leaf, emoji: '🪴', color: 'green' },
  { id: 'keychain', label: 'Keychain', desc: 'Keys, wallet & everyday carry items', icon: Wallet, emoji: '🗝️', color: 'slate' },
  { id: 'link', label: 'URL Redirect', desc: 'Directly redirect scanners to any website', icon: Link2, emoji: '🔗', color: 'cyan' },
];

export default function UnclaimedTagClaimView({ tag, session, onClaimSuccess }) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(tag?.type || 'dog');
  const [title, setTitle] = useState('');
  const [claimCode, setClaimCode] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const shortId = tag?.id ? tag.id.substring(0, 8).toUpperCase() : 'UNKNOWN';
  const hasPinRequirement = Boolean(tag?.claim_code);

  const selectedCategory = CATEGORIES.find(c => c.id === selectedType) || CATEGORIES[0];

  const handleClaim = async (e) => {
    e.preventDefault();
    setError('');

    if (!session) {
      navigate(`/login?returnUrl=/tag/${tag.id}`);
      return;
    }

    if (hasPinRequirement && !claimCode.trim()) {
      setError('Please enter the 6-character activation PIN from your packaging.');
      return;
    }

    setClaiming(true);
    try {
      const finalTitle = title.trim() || `My ${selectedCategory.label}`;

      const { data, error: rpcError } = await supabase.rpc('claim_tag', {
        p_tag_id: tag.id,
        p_title: finalTitle,
        p_type: selectedType,
        p_claim_code: claimCode.trim() || null
      });

      if (rpcError) throw rpcError;

      // Play joyful chime on successful activation
      playDoorbellChime();
      setSuccess(true);

      setTimeout(() => {
        if (onClaimSuccess) {
          onClaimSuccess({ id: tag.id, title: finalTitle, type: selectedType });
        } else {
          navigate(`/tag/edit/${tag.id}`);
        }
      }, 1200);

    } catch (err) {
      console.error('Error claiming tag:', err);
      setError(err.message || 'Failed to claim tag. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Hero Badge */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-2 border-violet-200 bg-gradient-to-b from-white via-violet-50/30 to-white text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-violet-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-black uppercase tracking-wider mb-3">
          <Sparkles size={14} className="text-violet-600 animate-spin" /> Ready to Activate
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          Activate Your New QR Tag
        </h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          This physical tag has been pre-generated and is waiting to be linked to your account.
        </p>

        {/* Tag Serial Pill */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>TAG ID: <strong className="text-slate-900">#{shortId}</strong></span>
          {tag?.batch_id && <span className="text-slate-400 border-l border-slate-300 pl-2">{tag.batch_id}</span>}
        </div>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="glass-card p-6 rounded-3xl border-2 border-emerald-400 bg-emerald-50 text-emerald-800 text-center shadow-lg animate-in zoom-in-95 duration-300">
          <CheckCircle2 size={40} className="text-emerald-600 mx-auto mb-2 animate-bounce" />
          <h2 className="text-xl font-black mb-1">Tag Activated Successfully!</h2>
          <p className="text-sm text-emerald-700">Redirecting you to the editor to complete your profile...</p>
        </div>
      )}

      {/* Case 1: Unauthenticated User Prompt */}
      {!session ? (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-lg space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-lg font-bold text-slate-900">Sign in to claim this tag</h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Create a free account or log in to link this tag permanently to your dashboard. You can customize, update phone numbers, and view scan locations anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              to={`/login?returnUrl=/tag/${tag.id}`}
              className="btn btn-primary py-3.5 px-6 rounded-2xl justify-center font-bold text-sm shadow-md shadow-violet-500/20"
            >
              Log In to Claim
            </Link>
            <Link
              to={`/signup?returnUrl=/tag/${tag.id}`}
              className="btn btn-secondary py-3.5 px-6 rounded-2xl justify-center font-bold text-sm"
            >
              Create Free Account
            </Link>
          </div>

          {/* Benefits Grid */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span> Free Lifetime Hosting
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span> 100% Phone Privacy
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span> GPS Scan Tracking
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span> Edit Details Anytime
            </div>
          </div>
        </div>
      ) : (
        /* Case 2: Authenticated User Setup Form */
        <form onSubmit={handleClaim} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-lg space-y-6">
          {/* User Pill */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="text-xs">
              <span className="text-slate-400">Claiming as: </span>
              <strong className="text-slate-800">{session.user.email}</strong>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Verified Account
            </span>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Tag Category Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 1: Choose What This Tag Is For
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {CATEGORIES.map(cat => {
                const isSelected = selectedType === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedType(cat.id)}
                    className={`flex flex-col items-start p-3 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-violet-600 bg-violet-50/60 shadow-sm'
                        : 'border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xl">{cat.emoji}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center">
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-violet-950' : 'text-slate-800'}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Tag Name / Label */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 2: Give Your Tag a Name
            </label>
            <input
              type="text"
              placeholder={`e.g. ${selectedType === 'dog' ? "Max's Collar" : selectedType === 'parking' ? 'Toyota Windshield' : selectedType === 'doorbell' ? 'Front Entrance' : 'My Smart Tag'}`}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="form-input text-sm py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            />
            <p className="text-[11px] text-slate-400">You can change this name anytime in your dashboard.</p>
          </div>

          {/* Step 3: Activation PIN (Only if required by the tag) */}
          {hasPinRequirement && (
            <div className="space-y-1.5 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <KeyRound size={14} className="text-amber-600" />
                Step 3: Enter Activation PIN
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit PIN"
                value={claimCode}
                onChange={e => setClaimCode(e.target.value.toUpperCase())}
                className="form-input text-sm py-2 rounded-xl border-amber-300 bg-white font-mono tracking-widest uppercase text-center font-bold"
                required
              />
              <p className="text-[11px] text-amber-700">
                Check the scratch-off code or interior backing on your retail packaging.
              </p>
            </div>
          )}

          {/* Action Submit */}
          <button
            type="submit"
            disabled={claiming || success}
            className="w-full btn btn-primary py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 disabled:opacity-50"
          >
            {claiming ? (
              'Linking to Account...'
            ) : (
              <>
                <span>🚀 Activate & Link to My Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
