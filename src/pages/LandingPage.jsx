import { Link } from 'react-router-dom';
import { QrCode, Shield, Smartphone, Zap, CheckCircle2, Package, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      title: 'Digital Tags are Free',
      description: 'Create unlimited QR tags for your pets, bags, or home. Print them yourself at zero cost.',
      icon: <QrCode className="h-6 w-6 text-violet-600" />,
      bg: 'bg-violet-50 border-violet-100',
    },
    {
      title: 'WhatsApp Connection',
      description: 'When someone scans your tag, they can instantly chat or call you via WhatsApp.',
      icon: <Smartphone className="h-6 w-6 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Privacy First',
      description: 'You control exactly what information is displayed when your tag is scanned.',
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-100',
    },
    {
      title: 'Instant Updates',
      description: 'Change your contact number anytime without ever re-printing the QR code.',
      icon: <Zap className="h-6 w-6 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100',
    }
  ];

  const pricing = [
    {
      title: 'Digital Tag',
      price: 'Free',
      description: 'Perfect for DIY printing and immediate use.',
      features: ['Unlimited digital Tags', 'WhatsApp Integration', 'Instant Updates', 'Print at home PDF'],
      buttonText: 'Get Started Free',
      highlight: false
    },
    {
      title: 'Physical Tag',
      price: '$9.99',
      sub: '/tag',
      description: 'Premium metal or weatherproof sticker tags shipped to you.',
      features: ['Everything in Free', 'Laser-engraved metal tag', 'Weatherproof stickers', 'Free worldwide shipping'],
      buttonText: 'Order a Physical Tag',
      highlight: true
    }
  ];

  const useCases = [
    { emoji: '🐶', label: 'Pet Tags' },
    { emoji: '👶', label: 'Kids Tags' },
    { emoji: '🚗', label: 'Car Parking' },
    { emoji: '🏨', label: 'Hotel Rooms' },
    { emoji: '🔔', label: 'Doorbells' },
    { emoji: '🚲', label: 'Bike Locks' },
    { emoji: '🔑', label: 'Rentals' },
    { emoji: '💼', label: 'Luggage' },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-slate-50">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative pt-24 md:pt-36 pb-20 md:pb-28 w-full overflow-hidden bg-white">
        {/* subtle gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-60 animate-float"></div>
          <div className="absolute -bottom-12 -right-24 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 text-center w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          {/* badge */}
          <div className="mx-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 mb-6 md:mb-8 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-xs sm:text-sm font-semibold text-violet-700 tracking-wide">TagLink · Now Live</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-extrabold tracking-tight mb-6 leading-tight text-slate-900 max-w-5xl mx-auto">
            One QR Code.{' '}
            <span className="text-gradient">Endless Connections.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create smart QR tags for your pets, bags, home, or business. When scanned, anyone can instantly reach you on WhatsApp — completely free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
            <Link to="/login" className="btn btn-primary px-7 py-3.5 text-base w-full sm:w-auto shadow-violet-200 shadow-lg hover:shadow-violet-300">
              Create Your Free Tag →
            </Link>
            <a href="#pricing" className="btn btn-secondary px-7 py-3.5 text-base w-full sm:w-auto">
              See Pricing
            </a>
          </div>
        </div>
      </section>

      {/* ── Use Cases chips ───────────────────────────── */}
      <section className="py-10 bg-slate-50 border-y border-slate-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Works for every use case</p>
          <div className="flex flex-wrap justify-center gap-3">
            {useCases.map((u) => (
              <span key={u.label} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700 transition-colors">
                <span>{u.emoji}</span> {u.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-900">Everything you need</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg">All the tools to manage your tags digitally so you never lose what matters most.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feat, i) => (
              <div key={i} className="glass-card p-6 lg:p-8 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className={`inline-flex p-3 rounded-xl border mb-5 ${feat.bg}`}>
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">{feat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-28 bg-slate-50 border-t border-slate-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-900">Simple, transparent pricing</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg">Digital is free forever. Only pay for premium physical tags.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, i) => (
              <div key={i} className={`glass-card p-8 lg:p-10 flex flex-col relative ${plan.highlight ? 'ring-2 ring-violet-500 shadow-xl shadow-violet-100' : ''}`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-8">
                    <span className="bg-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-1 text-slate-900">{plan.title}</h3>
                <div className="mb-3 flex items-end gap-1">
                  <span className="text-5xl font-extrabold text-slate-900">{plan.price}</span>
                  {plan.sub && <span className="text-slate-400 text-base mb-1">{plan.sub}</span>}
                </div>
                <p className="text-slate-500 mb-8 text-sm">{plan.description}</p>
                <ul className="space-y-3 mb-10 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${plan.highlight ? 'text-violet-600' : 'text-slate-400'}`} />
                      <span className="text-slate-700 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/login" className={`btn w-full py-3.5 text-base justify-center ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                  {plan.highlight && <Package size={18} className="shrink-0" />}
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
