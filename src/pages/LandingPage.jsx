import { Link, useNavigate } from 'react-router-dom';
import { QrCode, Shield, Smartphone, Zap, CheckCircle2, Package, Sparkles, ArrowRight, ChevronDown, BookOpen } from 'lucide-react';
import { useState } from 'react';
import ParticleCanvas from '../components/ParticleCanvas';
import { BLOG_POSTS } from './Blog';

export default function LandingPage() {
  const navigate = useNavigate();
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

  // Removed tagShowcase to replace with recent blog posts

  const steps = [
    {
      step: '01',
      title: 'Create Your Tag',
      description: 'Sign up free and choose your tag type — Pet, Vehicle, Doorbell, Rental, Kid, or Hotel.',
      icon: <QrCode className="h-7 w-7" />,
      color: 'bg-violet-500'
    },
    {
      step: '02',
      title: 'Add Your Details',
      description: "Fill in the details you want displayed when someone scans your tag. You control what's visible.",
      icon: <Shield className="h-7 w-7" />,
      color: 'bg-blue-500'
    },
    {
      step: '03',
      title: 'Print or Order',
      description: 'Print the QR at home for free, or order a premium laser-engraved steel tag shipped to your door.',
      icon: <Package className="h-7 w-7" />,
      color: 'bg-emerald-500'
    }
  ];

  const faqs = [
    {
      q: 'Is TagLink really free?',
      a: 'Yes! Digital QR tags are 100% free forever. You can create unlimited tags, customize them, and print them at home. We only charge for premium physical tags (laser-engraved metal or weatherproof stickers) if you choose to order one.'
    },
    {
      q: 'How does the WhatsApp connection work?',
      a: 'When someone scans your QR tag, they see your tag details along with a "Chat on WhatsApp" button. Tapping it opens a direct WhatsApp conversation with you — no phone number is publicly visible unless you choose to display it.'
    },
    {
      q: 'Can I update my tag details after printing?',
      a: 'Absolutely. Since the QR code links to your digital profile, you can change your phone number, address, emergency contacts, or any other details at any time. The printed QR code stays the same — it just shows the updated info.'
    },
    {
      q: 'What types of tags can I create?',
      a: 'TagLink supports 6 tag types: Pet Tags (for dogs, cats, etc.), Child Safety Tags, Vehicle/Parking Tags, Doorbell Tags, House Rental Tags (Airbnb-style), and Hotel Tags. Each type has custom fields designed for that specific use case.'
    },
    {
      q: 'How do physical tags work?',
      a: 'Physical tags are premium, laser-engraved metal or weatherproof sticker tags that we ship worldwide for free. Each physical tag has a unique QR code pre-linked to your TagLink account. Just scan, set up, and attach it.'
    },
    {
      q: 'Is my personal information safe?',
      a: 'Privacy is our top priority. You control exactly what information is displayed when someone scans your tag. Sensitive data like your full address or phone number can be hidden — scanners communicate through WhatsApp without ever seeing your number directly.'
    },
    {
      q: 'Do I need an app to use TagLink?',
      a: 'No app needed! TagLink is entirely web-based. You manage your tags from any browser, and people who scan your QR code see a mobile-friendly web page — no downloads required for either party.'
    },
    {
      q: 'Can I use TagLink internationally?',
      a: 'Yes, TagLink works worldwide. Our digital tags have no geographic restrictions, and we offer free international shipping on all physical tag orders.'
    }
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-slate-50">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative min-h-[90vh] md:min-h-screen w-full flex flex-col justify-center overflow-hidden bg-white">
        {/* Interactive Particle Background */}
        <ParticleCanvas />

        <div className="relative z-10 text-center w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="mx-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 mb-6 md:mb-8 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-xs sm:text-sm font-semibold text-violet-700 tracking-wide">TagLink · Now Live</span>
          </div>

          <h1 className="hero-title text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-extrabold tracking-tight mb-6 leading-tight text-slate-900 max-w-5xl mx-auto">
            One QR Code.{' '}
            <span className="text-gradient">Endless Connections.</span>
          </h1>

          <p className="hero-subtitle text-base sm:text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
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
      <section className="py-10 bg-slate-50 border-b border-slate-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Works for every use case</p>
          <div className="flex flex-wrap justify-center gap-3">
            {useCases.map((u) => (
              <span key={u.label} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700 transition-colors cursor-default">
                <span>{u.emoji}</span> {u.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg">Three simple steps to protect what matters most.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <div key={i} className="text-center group relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 bg-slate-200"></div>
                )}
                <div className={`w-20 h-20 ${s.color} rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  {s.icon}
                </div>
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Step {s.step}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-2 mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Blog Posts ─────────────────────────── */}
      <section id="products" className="py-20 md:py-28 bg-slate-50 border-y border-slate-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-3">Latest Insights</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">From the TagLink Blog</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg">Discover modern ways to use QR tech to secure what matters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.slice(0, 3).map((post) => (
              <article 
                key={post.id} 
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate('/blog');
                }}
                className="flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group"
              >
                {/* Image Banner */}
                <div className="w-full h-56 relative overflow-hidden bg-slate-100">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-sm bg-white/95 backdrop-blur-sm ${post.color}`}>
                    {post.icon}
                    {post.readTime.toUpperCase()}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                    <BookOpen size={14} />
                    {post.date}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight group-hover:text-violet-600 transition-colors line-clamp-3 mb-4">
                    {post.title}
                  </h2>

                  <p className="text-slate-500 text-base leading-relaxed mix-blend-multiply line-clamp-3 mb-6 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto flex items-center gap-2 font-bold text-violet-600 group-hover:translate-x-1 transition-transform">
                    Read Article &rarr;
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link to="/blog" className="btn btn-secondary px-8 py-3.5 text-slate-700 hover:text-violet-700 font-semibold rounded-xl inline-flex items-center gap-2 transition-all shadow-sm">
              View All Posts <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-3">Why TagLink</p>
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

      {/* ── Big CTA Banner ────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 w-full relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 max-w-3xl mx-auto leading-tight">
            Ready to protect what matters most?
          </h2>
          <p className="text-violet-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of pet owners, hosts, and families who trust TagLink to keep their world connected and safe.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="btn bg-white text-violet-700 hover:bg-violet-50 px-8 py-4 text-base font-bold shadow-xl shadow-violet-900/30 w-full sm:w-auto">
              Create Your Free Tag →
            </Link>
            <Link to="/login" className="btn border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-base font-bold w-full sm:w-auto">
              Browse Store
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-28 bg-slate-50 border-t border-slate-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-3">Pricing</p>
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

      {/* ── FAQ Section ───────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white border-t border-slate-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg">Everything you need to know about TagLink and how it works.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-violet-200 shadow-lg shadow-violet-100/50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-slate-900 text-base">{faq.q}</span>
                    <ChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-violet-500' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="px-6 pb-5 text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
