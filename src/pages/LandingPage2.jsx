import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  QrCode, Link as LinkIcon, User, Phone, AlignJustify, AlignLeft, LayoutGrid, 
  MessageSquare, Mail, Download, UploadCloud, ChevronDown, ChevronUp, Lock, 
  Dog, CarFront, Stethoscope, Briefcase, Bell, Key, Link2, Sparkles, ArrowRight, 
  Image as ImageIcon, X, Share2, CheckCircle2, XCircle, HelpCircle, Layers, 
  Settings2, Printer, ShieldCheck, Zap 
} from 'lucide-react';
import SEO from '../components/SEO';
import SmartTagSimulatorModal from '../components/SmartTagSimulatorModal';

const TABS = [
  { id: 'URL', icon: LinkIcon, title: 'Enter your URL', placeholder: 'https://example.com/' },
  { id: 'Text', icon: AlignLeft, title: 'Enter your text', placeholder: 'Enter your message here...' },
  { id: 'Email', icon: Mail, title: 'Enter email details', isEmail: true, prefix: 'mailto:' },
  { id: 'PDF', icon: UploadCloud, title: 'Upload a PDF', signupOnly: true },
  { id: 'Contact', icon: User, title: 'Create vCard', signupOnly: true },
  { id: 'App', icon: LayoutGrid, title: 'App Store Links', signupOnly: true },
  { id: 'SMS', icon: MessageSquare, title: 'Enter SMS details', placeholder: '+1234567890', prefix: 'smsto:' },
  { id: 'Phone', icon: Phone, title: 'Enter phone number', placeholder: '+1234567890', prefix: 'tel:' }
];

const FAQS = [
  {
    q: "What is the difference between a static QR code and a dynamic smart tag?",
    a: "Static QR codes encode fixed text or URLs permanently into the square matrix; if your destination changes, you must re-generate and re-print. Dynamic smart tags from GetURQR point to an intelligent cloud router, allowing you to update destinations, emergency contacts, or messages anytime without re-printing. Plus, GetURQR smart tags include WhatsApp privacy routing and scan notifications."
  },
  {
    q: "Are the QR codes generated on GetURQR completely free?",
    a: "Yes! You can generate, customize with logos and colors, and download unlimited static QR codes (URL, Text, SMS, Email, Phone) in high-resolution JPG or PNG/SVG 100% free with no watermark. For dynamic tags, our free tier lets you manage active smart tags with instant WhatsApp connections."
  },
  {
    q: "How does the WhatsApp smart contact feature protect my privacy?",
    a: "When someone scans your GetURQR pet, luggage, or vehicle tag, they see a clean mobile landing page with a direct 'Chat on WhatsApp' button. Your phone number is masked behind a secure server-side redirect or prefilled WhatsApp URI, preventing scammers and strangers from scraping your real phone number."
  },
  {
    q: "Can I change where my QR code points after printing it?",
    a: "Yes! With GetURQR Smart Tags, the destination is completely dynamic. You can log into your dashboard at any time to change your destination URL, pet medical notes, contact phone, or vehicle parking message instantly — the printed physical QR code continues to work seamlessly."
  },
  {
    q: "What image formats can I download my QR code in?",
    a: "GetURQR provides instant downloads in high-resolution JPG and razor-sharp PNG and vector SVG. Vector SVG is ideal for large-scale billboard printing, laser engraving, t-shirts, stickers, and business cards without any pixelation or quality loss."
  },
  {
    q: "Do I need a special app to scan GetURQR codes?",
    a: "No special app is required. Every modern iOS and Android smartphone has a built-in QR scanner in its default camera app. Anyone who points their phone camera at your code can scan and interact with it in under two seconds."
  },
  {
    q: "Can I add my business or personal logo inside the QR code?",
    a: "Yes! Our built-in customization studio lets you upload any PNG or JPG logo. GetURQR generates QR codes using Level H Reed-Solomon error correction (up to 30% redundancy), ensuring your code remains 100% readable even with a centered custom brand logo."
  },
  {
    q: "How do vehicle parking QR tags help when I am temporarily parked?",
    a: "A GetURQR Vehicle Parking Tag placed on your windshield allows other drivers or building security to tap a single button to alert you on WhatsApp (e.g., 'Please move your car' or 'Window left open') without having your personal phone number visible to pedestrians or parked neighbors."
  }
];

const SCHEMA_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "GetURQR",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1280",
        "bestRating": "5",
        "worstRating": "1"
      },
      "description": "Free high-resolution QR code generator and dynamic Smart Tag management platform with privacy-masked WhatsApp connectivity for pets, luggage, keys, and vehicles."
    },
    {
      "@type": "HowTo",
      "name": "How to Create a Custom QR Code or Dynamic Smart Tag",
      "description": "Step-by-step guide to generating free high-resolution QR codes and privacy-protected smart tags with GetURQR.",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Choose Your Tag Type or Input",
          "text": "Select from static types (URL, Text, vCard, SMS, Email) or dynamic smart tags (Pet ID, Vehicle Parking, Luggage, Medical, Doorbell).",
          "url": "https://geturqr.com/#generator"
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Customize Design, Colors, & Privacy Rules",
          "text": "Upload your brand logo, pick custom hex colors, select frame styles, and configure masked WhatsApp notifications or emergency contacts.",
          "url": "https://geturqr.com/#customization"
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Download in Vector SVG or Print Instantly",
          "text": "Export your high-resolution QR code in vector SVG, PNG, or JPG formats. Attach to your items and update destinations anytime without re-printing.",
          "url": "https://geturqr.com/#download"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": FAQS.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    }
  ]
};

const COMPARISON_FEATURES = [
  {
    feature: 'Destination Updating',
    desc: 'Change destination link or contact info after printing',
    staticQr: 'Impossible (Requires re-printing)',
    smartTag: 'Instant 1-Click Update Anytime',
    staticOk: false,
    smartOk: true
  },
  {
    feature: 'Privacy & Number Masking',
    desc: 'Protect personal phone numbers from strangers and bots',
    staticQr: 'Raw phone number exposed',
    smartTag: 'Secure WhatsApp chat routing',
    staticOk: false,
    smartOk: true
  },
  {
    feature: 'Real-Time Scan Notifications',
    desc: 'Instant alerts when someone scans your physical tag',
    staticQr: 'Zero scan awareness',
    smartTag: 'Instant alerts & device breakdown',
    staticOk: false,
    smartOk: true
  },
  {
    feature: 'Purpose-Built Mobile Flows',
    desc: 'Tailored interfaces for Pets, Vehicles, Luggage & Medical',
    staticQr: 'Generic plain text only',
    smartTag: 'Dedicated responsive web apps',
    staticOk: false,
    smartOk: true
  },
  {
    feature: 'High-Res Vector SVG Downloads',
    desc: 'Infinitely scalable output for print, stickers & engraving',
    staticQr: 'Often blurry raster only',
    smartTag: 'Razor-sharp 300+ DPI vector SVG/PNG',
    staticOk: true,
    smartOk: true
  },
  {
    feature: 'Price & Starter Tier',
    desc: 'Core generation and basic usage cost',
    staticQr: '100% Free',
    smartTag: 'Free Starter Plan Included',
    staticOk: true,
    smartOk: true
  }
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Choose Tag Type or Input',
    desc: 'Generate static codes for instant URLs, WiFi, or vCards — or create dynamic Smart Tags for pets, cars, luggage, and emergency contact.',
    icon: Layers,
    color: 'from-blue-600 to-sky-500'
  },
  {
    step: '02',
    title: 'Brand & Configure Privacy',
    desc: 'Upload your company logo, choose eye-catching custom brand colors, select scan frames, and configure safe WhatsApp contact masking.',
    icon: Settings2,
    color: 'from-indigo-600 to-blue-500'
  },
  {
    step: '03',
    title: 'Download, Print & Manage',
    desc: 'Export high-res vector SVG or print-ready PNG. Need to update your phone number or notes later? Change it in seconds without re-printing.',
    icon: Printer,
    color: 'from-sky-500 to-teal-400'
  }
];

export default function LandingPage2() {
  const navigate = useNavigate();
  const [simulatorTag, setSimulatorTag] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [inputValue, setInputValue] = useState(TABS[0].placeholder || '');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const qrRef = useRef(null);

  const [expandedPanel, setExpandedPanel] = useState(null);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrLogo, setQrLogo] = useState(null);
  const [qrFrame, setQrFrame] = useState('none');

  const COLORS = ['#000000', '#002b80', '#38b6ff', '#ff9100', '#10b981', '#8b5cf6', '#e11d48'];
  const FRAMES = [
    { id: 'none', label: 'None' },
    { id: 'outline', label: 'Outline' },
    { id: 'bottom-text', label: 'Text Bottom' },
    { id: 'top-text', label: 'Text Top' }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setInputValue(tab.placeholder || '');
    setEmailSubject('');
    setEmailBody('');
  };

  const handleDownload = async (format) => {
    if (activeTab.signupOnly) {
      navigate('/signup');
      return;
    }
    const rawCanvas = qrRef.current?.querySelector('canvas');
    if (!rawCanvas) return;
    
    const qrSize = rawCanvas.width;
    let finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    
    if (qrFrame === 'none') {
      finalCanvas.width = qrSize;
      finalCanvas.height = qrSize;
      ctx.drawImage(rawCanvas, 0, 0);
    } else {
      const pad = 40;
      finalCanvas.width = qrSize + pad * 2;
      finalCanvas.height = qrSize + pad * 2 + (qrFrame.includes('text') ? 60 : 0);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      
      ctx.strokeStyle = qrColor;
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, finalCanvas.width - 8, finalCanvas.height - 8);
      
      const qrY = qrFrame === 'top-text' ? pad + 60 : pad;
      ctx.drawImage(rawCanvas, pad, qrY, qrSize, qrSize);
      
      if (qrFrame.includes('text')) {
        ctx.fillStyle = qrColor;
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textY = qrFrame === 'top-text' ? pad + 30 : qrSize + pad + 30;
        ctx.fillText('SCAN ME', finalCanvas.width / 2, textY);
      }
    }
    
    const link = document.createElement('a');
    link.download = `QR_${activeTab.id}_${format}.${format}`;
    link.href = finalCanvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`);
    link.click();
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setQrLogo(URL.createObjectURL(file));
  };

  let qrValue = activeTab.prefix ? `${activeTab.prefix}${inputValue}` : inputValue;
  if (activeTab.id === 'Email') {
    qrValue = `mailto:${inputValue}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  }

  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-gradient-to-b from-[#f4f7fb] via-[#edf2f8] to-[#f8fbff] font-sans min-h-screen relative">
      <SEO
        title="GetURQR — Free Custom QR Code Generator & Dynamic Smart Tags"
        description="Generate custom QR codes instantly with logos, colors, and frames. Create dynamic smart tags for pets, luggage, keys, and parking with privacy-protected WhatsApp connection."
        keywords="QR code generator, custom QR code, free QR generator, QR code with logo, smart pet tag, WhatsApp QR code, dynamic QR code, vector SVG QR code"
        canonical="https://geturqr.com"
        jsonLd={SCHEMA_GRAPH}
      />
      
      {/* ── Background Atmosphere & Crisp Vector Accents ── */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-white/30 via-white/5 to-transparent pointer-events-none z-0" />

      {/* 1. Subtle high-tech dot matrix pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* 2. Soft atmospheric ambient lighting */}
      <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-gradient-to-bl from-sky-400/20 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-500/15 via-blue-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] bg-gradient-to-l from-[#38b6ff]/15 via-indigo-200/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* 3. Vector geometric accents */}
      <svg className="absolute top-[26%] -right-16 w-80 h-80 text-[#38b6ff]/20 pointer-events-none hidden md:block" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
        <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      </svg>
      <svg className="absolute bottom-[10%] -left-16 w-72 h-72 text-[#002b80]/15 pointer-events-none hidden md:block" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" />
        <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      {/* ── Hero Generator Section ───────────────────── */}
      <section id="generator" className="relative z-10 w-full min-h-[100dvh] flex flex-col justify-between items-center pt-20 sm:pt-24 pb-4 px-3 sm:px-6 lg:px-8">
        
        {/* Semantic H1 & Value Proposition */}
        <div className="text-center max-w-4xl mx-auto px-4 pt-1 sm:pt-2 pb-3 sm:pb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/60 text-[#002b80] text-xs font-semibold mb-2.5 shadow-sm">
            <Sparkles size={13} className="text-[#38b6ff]" />
            <span>Free Custom QR Code Generator & Dynamic Smart Tags</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold text-[#002b80] tracking-tight leading-[1.15]">
            Create Custom QR Codes & <span className="bg-gradient-to-r from-[#002b80] via-[#38b6ff] to-[#002b80] bg-clip-text text-transparent">Smart Dynamic Tags</span>
          </h1>
          <p className="mt-2.5 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
            Design brand-ready QR codes with logos, custom colors, and frames — or activate dynamic smart tags with privacy protection and direct WhatsApp alerts.
          </p>
        </div>

        {/* Main Generator Card */}
        <div className="bg-[#f8fbff]/95 rounded-3xl lg:rounded-[2.5rem] w-full max-w-[1140px] mx-auto p-4 sm:p-6 lg:p-8 shadow-[0_25px_60px_-15px_rgba(0,43,128,0.18)] border border-white/80 flex flex-col lg:flex-row gap-6 lg:gap-8 relative overflow-hidden backdrop-blur-2xl my-auto">
           
           {/* Left Sidebar (Category Navigation) */}
           <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center justify-start lg:py-4 px-1 z-10">
              <div className="flex lg:flex-col gap-2 sm:gap-2.5 bg-white rounded-2xl lg:rounded-full p-1.5 sm:p-2 shadow-sm border border-slate-100 overflow-x-auto lg:overflow-visible w-full lg:w-auto hide-scrollbar no-scrollbar">
                {TABS.map((tab) => {
                  const isActive = activeTab.id === tab.id;
                  return (
                    <button 
                      key={tab.id} 
                      onClick={() => handleTabChange(tab)}
                      className={`relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all shrink-0 ${isActive ? 'bg-[#002b80] text-white shadow-lg shadow-[#002b80]/40 scale-105 lg:scale-110 z-10' : 'text-slate-400 hover:text-[#002b80] hover:bg-slate-50'}`}
                      title={tab.id}
                      aria-label={`Select ${tab.id} QR Code Type`}
                    >
                       <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                    </button>
                  );
                })}
              </div>
           </div>
           
           {/* Middle Pane (Input Controls) */}
           <div className="flex-1 min-w-0 flex flex-col justify-center px-1 sm:px-4 lg:px-8 xl:px-12 py-2 lg:py-6 z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-bold text-[#002b80] mb-1 sm:mb-2 tracking-tight">{activeTab.title}</h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-6 lg:mb-8 font-medium">Your QR code will be generated automatically</p>
              
              <div className="w-full max-w-full lg:max-w-md xl:max-w-lg">
                {activeTab.signupOnly ? (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 p-6 sm:p-8 text-center flex flex-col items-center justify-center group hover:border-[#38b6ff] transition-colors cursor-pointer" onClick={() => navigate('/signup')}>
                    <div className="w-12 h-12 bg-[#38b6ff] rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-[#38b6ff]/30 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#002b80]">Upload any file <span className="text-slate-400 font-normal">(jpg, .pdf, .mp3, .docx, .pptx)</span></p>
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                      <Lock size={12} /> Sign up to unlock
                    </div>
                  </div>
                ) : activeTab.isEmail ? (
                  <div className="flex flex-col gap-3.5 sm:gap-4">
                    <input 
                      type="email" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter email address" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base text-[#002b80] font-medium placeholder-slate-300 focus:outline-none focus:border-[#002b80] focus:ring-2 focus:ring-[#002b80]/15 shadow-sm transition-all" 
                    />
                    <input 
                      type="text" 
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base text-[#002b80] font-medium placeholder-slate-300 focus:outline-none focus:border-[#002b80] focus:ring-2 focus:ring-[#002b80]/15 shadow-sm transition-all" 
                    />
                    <textarea 
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Enter your message" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base text-[#002b80] font-medium placeholder-slate-300 focus:outline-none focus:border-[#002b80] focus:ring-2 focus:ring-[#002b80]/15 shadow-sm transition-all resize-none h-24"
                    />
                    <button className="bg-[#002b80] hover:bg-[#001f5c] text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-[#002b80]/20 self-start mt-2 sm:mt-3 flex items-center gap-2 transition-transform hover:-translate-y-0.5 w-full sm:w-auto justify-center">
                      <QrCode size={18} /> GENERATE QR CODE
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5 sm:gap-4">
                    {activeTab.id === 'Text' ? (
                      <textarea 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={activeTab.placeholder} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base text-[#002b80] font-medium placeholder-slate-300 focus:outline-none focus:border-[#002b80] focus:ring-2 focus:ring-[#002b80]/15 shadow-sm transition-all resize-none h-28 sm:h-32"
                      />
                    ) : (
                      <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={activeTab.placeholder} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base text-[#002b80] font-medium placeholder-slate-300 focus:outline-none focus:border-[#002b80] focus:ring-2 focus:ring-[#002b80]/15 shadow-sm transition-all" 
                      />
                    )}
                  </div>
                )}
              </div>
           </div>
           
           {/* Right Pane (QR Preview & Customization) */}
           <div className="w-full max-w-[360px] sm:max-w-[420px] lg:max-w-none lg:w-[350px] xl:w-[380px] mx-auto bg-[#002b80] rounded-2xl sm:rounded-3xl lg:rounded-[2rem] p-4 sm:p-6 lg:p-7 flex flex-col z-10 shrink-0 shadow-xl shadow-[#002b80]/15">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center justify-center aspect-square mb-5 lg:mb-6 relative group overflow-hidden shadow-xl shadow-black/10 max-w-[260px] sm:max-w-[300px] lg:max-w-none mx-auto w-full">
                 {activeTab.signupOnly ? (
                   <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                     <Lock className="w-10 h-10 text-slate-300" />
                   </div>
                 ) : null}
                 <div ref={qrRef} className={`w-full h-full flex items-center justify-center ${activeTab.signupOnly ? 'blur-md opacity-30' : ''}`}>
                    <QRCodeCanvas
                      value={qrValue || 'https://geturqr.com'}
                      size={256}
                      level="H"
                      className="w-full h-full text-[#002b80]"
                      includeMargin={false}
                      fgColor={qrColor}
                      imageSettings={qrLogo ? { src: qrLogo, height: 64, width: 64, excavate: true } : undefined}
                    />
                 </div>
                 
                 {/* Live Frame Preview Overlay */}
                 {qrFrame !== 'none' && !activeTab.signupOnly && (
                   <div className="absolute inset-0 border-4 pointer-events-none" style={{ borderColor: qrColor }}>
                     {qrFrame.includes('text') && (
                       <div className={`absolute left-0 right-0 h-8 flex items-center justify-center font-bold text-xs tracking-widest ${qrFrame === 'top-text' ? 'top-0 border-b-4' : 'bottom-0 border-t-4'}`} style={{ borderColor: qrColor, color: qrColor, backgroundColor: '#ffffff' }}>
                         SCAN ME
                       </div>
                     )}
                   </div>
                 )}
              </div>
              
              <div className="flex flex-col gap-2.5 mb-6">
                 {/* Frame Panel */}
                 <div className="flex flex-col bg-white/5 rounded-xl border border-white/5 overflow-hidden transition-all">
                   <button onClick={() => setExpandedPanel(expandedPanel === 'frame' ? null : 'frame')} className="w-full text-white py-3 px-4 text-xs font-bold tracking-wide flex justify-between items-center hover:bg-white/5 transition-colors">
                      FRAME {expandedPanel === 'frame' ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                   </button>
                   {expandedPanel === 'frame' && (
                     <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                       {FRAMES.map(f => (
                         <button key={f.id} onClick={() => setQrFrame(f.id)} className={`text-xs font-bold py-2 rounded-lg border transition-colors ${qrFrame === f.id ? 'bg-[#38b6ff] border-[#38b6ff] text-white' : 'border-white/20 text-white hover:bg-white/10'}`}>
                           {f.label}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>

                 {/* Shape & Color Panel */}
                 <div className="flex flex-col bg-white/5 rounded-xl border border-white/5 overflow-hidden transition-all">
                   <button onClick={() => setExpandedPanel(expandedPanel === 'color' ? null : 'color')} className="w-full text-white py-3 px-4 text-xs font-bold tracking-wide flex justify-between items-center hover:bg-white/5 transition-colors">
                      SHAPE & COLOR {expandedPanel === 'color' ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                   </button>
                   {expandedPanel === 'color' && (
                     <div className="p-4 pt-0 flex flex-wrap gap-3">
                       {COLORS.map(c => (
                         <button key={c} onClick={() => setQrColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${qrColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                       ))}
                     </div>
                   )}
                 </div>

                 {/* Logo Panel */}
                 <div className="flex flex-col bg-white/5 rounded-xl border border-white/5 overflow-hidden transition-all">
                   <button onClick={() => setExpandedPanel(expandedPanel === 'logo' ? null : 'logo')} className="w-full text-white py-3 px-4 text-xs font-bold tracking-wide flex justify-between items-center hover:bg-white/5 transition-colors">
                      LOGO {expandedPanel === 'logo' ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                   </button>
                   {expandedPanel === 'logo' && (
                     <div className="p-4 pt-0 flex flex-wrap gap-2">
                       <button onClick={() => setQrLogo(null)} className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${!qrLogo ? 'bg-[#38b6ff] border-[#38b6ff] text-white' : 'border-white/20 text-white hover:bg-white/10'}`}>
                         <X size={20} />
                       </button>
                       <label className="w-12 h-12 rounded-xl border border-white/20 text-white hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors">
                         <ImageIcon size={20} />
                         <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                       </label>
                     </div>
                   )}
                 </div>
              </div>

              <div className="flex gap-2 sm:gap-3 mt-auto pt-1">
                 <button onClick={() => handleDownload('jpg')} className="flex-1 bg-[#38b6ff] hover:bg-[#2fa0e6] text-white py-3 sm:py-3.5 px-2 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-[#38b6ff]/30 transition-transform hover:-translate-y-0.5">
                   <Download size={15} /> JPG
                 </button>
                 <button onClick={() => handleDownload('png')} className="flex-1 bg-[#ff9100] hover:bg-[#e68200] text-white py-3 sm:py-3.5 px-2 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-[#ff9100]/30 transition-transform hover:-translate-y-0.5">
                   <Download size={15} /> SVG/PNG
                 </button>
                 <button onClick={async () => {
                   try {
                     if (navigator.share) {
                       await navigator.share({
                         title: 'My QR Code',
                         url: window.location.href,
                       });
                     }
                   } catch (err) {
                     console.error('Share failed:', err);
                   }
                 }} className="w-11 h-11 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl sm:rounded-full flex items-center justify-center shrink-0 transition-transform hover:-translate-y-0.5" title="Share">
                   <Share2 size={18} />
                 </button>
              </div>
           </div>
        </div>

        {/* ── Desktop Scroll Cue ── */}
        <div className="pt-3 pb-1 flex flex-col items-center justify-center shrink-0">
          <button 
            onClick={() => document.getElementById('smart-tags-showcase')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-[#002b80] transition-colors py-1 cursor-pointer focus:outline-none"
            aria-label="Scroll to Smart Tags"
          >
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 group-hover:text-[#002b80] transition-colors">
              Explore Smart Tags & Features
            </span>
            <ChevronDown size={18} className="animate-bounce text-[#38b6ff] group-hover:text-[#002b80] transition-colors" />
          </button>
        </div>
      </section>

      {/* ── Smart Tags Showcase Section ───────────────────── */}
      <section id="smart-tags-showcase" className="py-20 sm:py-24 w-full bg-gradient-to-b from-white via-slate-50/70 to-white relative z-10 border-t border-slate-200/60 shadow-inner">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#002b80] mb-4 tracking-tight">Go Beyond Generic QR Codes</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Sign up to create specialized Smart Tags with built-in privacy controls, WhatsApp integration, and dynamic updates without ever re-printing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { id: 'pet', label: 'Pet Tag', icon: Dog, color: 'text-violet-600', bg: 'bg-violet-50' },
              { id: 'vehicle', label: 'Vehicle Parking', icon: CarFront, color: 'text-blue-600', bg: 'bg-blue-50' },
              { id: 'medical', label: 'Medical Alert', icon: Stethoscope, color: 'text-rose-600', bg: 'bg-rose-50' },
              { id: 'luggage', label: 'Smart Luggage', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { id: 'doorbell', label: 'QR Doorbell', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
              { id: 'keychain', label: 'Secure Keychain', icon: Key, color: 'text-slate-600', bg: 'bg-slate-100' },
              { id: 'link', label: 'URL Redirect', icon: Link2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
              { id: 'custom', label: 'More coming soon...', icon: Sparkles, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' }
            ].map((tag) => (
              <div 
                key={tag.id} 
                onClick={() => setSimulatorTag(tag.id === 'custom' ? 'pet' : tag.id)} 
                className="group relative bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_-15px_rgba(0,43,128,0.15)] hover:border-[#38b6ff]/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className={`w-14 h-14 rounded-2xl ${tag.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <tag.icon className={`w-7 h-7 ${tag.color}`} />
                </div>
                <h3 className="text-lg font-bold text-[#002b80] mb-1.5">{tag.label}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">Click to preview and build your custom tag.</p>
                
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38b6ff] group-hover:text-[#002b80] transition-colors">
                  <Sparkles size={13} className="text-[#38b6ff]" />
                  <span>Test-drive live demo</span>
                </div>

                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="w-8 h-8 rounded-full bg-[#f8fbff] flex items-center justify-center shadow-sm text-[#002b80]">
                     <ArrowRight className="w-4 h-4" />
                   </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
             <button onClick={() => { window.scrollTo(0, 0); navigate('/signup'); }} className="bg-[#002b80] hover:bg-[#001f5c] text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-[#002b80]/20 transition-transform hover:-translate-y-0.5 text-lg inline-flex items-center gap-2">
                Create a Free Account <ArrowRight size={20} />
             </button>
          </div>
        </div>
      </section>

      {/* ── How It Works Section (SEO 3-Step Guide) ───────── */}
      <section id="how-it-works" className="py-20 sm:py-24 w-full bg-[#f8fbff] relative z-10 border-t border-slate-200/50">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#002b80] text-xs font-bold mb-3 shadow-sm">
              <Layers size={14} className="text-[#38b6ff]" />
              <span>Simple 3-Step Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002b80] tracking-tight">
              How GetURQR Works
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
              From instant browser creation to dynamic cloud updates in three effortless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {HOW_IT_WORKS_STEPS.map((s, idx) => (
              <div 
                key={s.step} 
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,43,128,0.08)] hover:shadow-[0_20px_45px_-15px_rgba(0,43,128,0.14)] hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-[#002b80]/15 group-hover:text-[#38b6ff] transition-colors font-mono">
                      {s.step}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <s.icon size={22} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#002b80] mb-2.5">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-[#002b80]">
                  <span>Step {idx + 1} of 3</span>
                  <ArrowRight size={13} className="text-[#38b6ff]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Static vs Smart Tag Comparison Section ───────── */}
      <section id="comparison" className="py-20 sm:py-24 w-full bg-white relative z-10 border-t border-slate-200/60 shadow-sm">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#002b80] text-xs font-bold mb-3 shadow-sm">
              <ShieldCheck size={14} className="text-[#38b6ff]" />
              <span>Why Smart Tags Win</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002b80] tracking-tight">
              Static QR Codes vs. GetURQR Smart Tags
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
              Understand why traditional static QR codes fail when printed on physical items, and how smart tags solve real-world lost & found and privacy problems.
            </p>
          </div>

          {/* Responsive Comparison Table Container */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 via-slate-100/60 to-slate-50 border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6 sm:px-8 w-2/5">Capability & Feature</th>
                  <th className="py-4 px-6 w-[30%] text-slate-400">Traditional Static QR</th>
                  <th className="py-4 px-6 w-[30%] bg-blue-50/70 text-[#002b80] border-l border-blue-100">GetURQR Smart Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 sm:px-8">
                      <div className="font-bold text-[#002b80] text-sm sm:text-base">{row.feature}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{row.desc}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-500 font-medium text-xs sm:text-sm">
                        {row.staticOk ? (
                          <CheckCircle2 size={16} className="text-slate-400 shrink-0" />
                        ) : (
                          <XCircle size={16} className="text-rose-500 shrink-0" />
                        )}
                        <span>{row.staticQr}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 bg-blue-50/40 border-l border-blue-100/80">
                      <div className="flex items-center gap-2 text-[#002b80] font-semibold text-xs sm:text-sm">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span>{row.smartTag}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 text-center">
            <button 
              onClick={() => { window.scrollTo(0, 0); navigate('/signup'); }} 
              className="inline-flex items-center gap-2 text-sm font-bold text-[#002b80] hover:text-[#38b6ff] transition-colors underline-offset-4 hover:underline"
            >
              <span>Explore all smart tag features in your free dashboard</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ Section (Semantic & JSON-LD Synchronized) ── */}
      <section id="faq" className="py-20 sm:py-24 w-full bg-gradient-to-b from-[#f8fbff] via-slate-50/70 to-white relative z-10 border-t border-slate-200/60">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#002b80] text-xs font-bold mb-3 shadow-sm">
              <HelpCircle size={14} className="text-[#38b6ff]" />
              <span>Common Questions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002b80] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-base text-slate-500 max-w-xl mx-auto">
              Everything you need to know about creating custom QR codes, dynamic smart tags, and WhatsApp privacy protection.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className={`border rounded-2xl sm:rounded-3xl transition-all duration-200 bg-white ${
                    isOpen 
                      ? 'border-[#38b6ff]/50 shadow-[0_10px_30px_-10px_rgba(0,43,128,0.12)] ring-1 ring-[#38b6ff]/20' 
                      : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full py-4 sm:py-5 px-5 sm:px-6 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#002b80] focus:outline-none cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="flex-1 pr-2">{faq.q}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-[#002b80] text-white rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <ChevronDown size={18} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── High-Converting CTA Banner ───────────────────── */}
      <section className="py-16 sm:py-20 w-full bg-gradient-to-tr from-[#002b80] via-[#0038a8] to-[#001d57] text-white relative z-10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(#38b6ff_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#38b6ff] text-xs font-bold mb-4 backdrop-blur-sm">
            <Zap size={13} className="text-[#38b6ff]" />
            <span>Get Started In Seconds</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Ready to Upgrade to Smart QR Tags?
          </h2>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto mb-8 font-normal">
            Join thousands of pet owners, travelers, and vehicle drivers protecting what matters most. Create your first dynamic tag completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { window.scrollTo(0, 0); navigate('/signup'); }}
              className="w-full sm:w-auto bg-[#38b6ff] hover:bg-[#2fa0e6] text-white font-bold py-4 px-8 rounded-full shadow-xl shadow-[#38b6ff]/30 transition-transform hover:-translate-y-0.5 text-base flex items-center justify-center gap-2"
            >
              <span>Create Free Smart Tag</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setSimulatorTag('pet')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 border border-white/25 text-white font-semibold py-4 px-8 rounded-full transition-colors text-base flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Sparkles size={18} className="text-[#38b6ff]" />
              <span>Try Interactive Simulator</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Interactive Smartphone Simulator Modal ───────────────────── */}
      {simulatorTag && (
        <SmartTagSimulatorModal 
          initialTag={simulatorTag} 
          onClose={() => setSimulatorTag(null)} 
        />
      )}

    </div>
  );
}
