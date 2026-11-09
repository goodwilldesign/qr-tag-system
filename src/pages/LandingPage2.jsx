import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Link as LinkIcon, User, Phone, AlignJustify, AlignLeft, LayoutGrid, MessageSquare, Mail, Download, UploadCloud, ChevronDown, ChevronUp, Lock, Dog, CarFront, Stethoscope, Briefcase, Bell, Key, Link2, Sparkles, ArrowRight, Image as ImageIcon, X, Share2 } from 'lucide-react';
import SEO from '../components/SEO';

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

export default function LandingPage2() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [inputValue, setInputValue] = useState(TABS[0].placeholder || '');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
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
        title="GetURQR — Free Custom QR Code Generator & Smart Tags"
        description="Generate custom QR codes instantly with logos, colors, and frames. Create smart tags for pets, luggage, keys, and parking with direct WhatsApp connection."
        keywords="QR code generator, custom QR code, free QR generator, QR code with logo, smart pet tag, WhatsApp QR code"
        canonical="https://geturqr.com"
      />
      
      {/* ── Background Atmosphere & Crisp Vector Accents ── */}
      {/* Soft atmospheric top vignette for transparent navbar depth */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-white/30 via-white/5 to-transparent pointer-events-none z-0" />

      {/* 1. Subtle high-tech dot matrix pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* 2. Soft atmospheric ambient lighting (diffused blur-3xl mesh - no fuzzy 1px/2px raster artifacts) */}
      <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-gradient-to-bl from-sky-400/20 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-500/15 via-blue-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] bg-gradient-to-l from-[#38b6ff]/15 via-indigo-200/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* 3. Razor-sharp vector geometric accents (vector SVG, 100% crisp on any DPI, zero blur) */}
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
      {/* min-h-[100dvh] guarantees the hero occupies the entire screen fold on desktop, eliminating any bottom white strip peeking through */}
      <section className="relative z-10 w-full min-h-[100dvh] flex flex-col justify-between items-center pt-20 sm:pt-24 pb-4 px-3 sm:px-6 lg:px-8">
        
        {/* Top spacer for clean vertical balance */}
        <div className="h-1 sm:h-2" aria-hidden="true" />

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

        {/* ── Desktop Scroll Cue (Clean, intentional indicator that eliminates the awkward bottom white strip) ── */}
        <div className="pt-3 pb-1 flex flex-col items-center justify-center shrink-0">
          <button 
            onClick={() => document.getElementById('smart-tags-showcase')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-[#002b80] transition-colors py-1 cursor-pointer focus:outline-none"
            aria-label="Scroll to Smart Tags"
          >
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 group-hover:text-[#002b80] transition-colors">
              Explore Smart Tags
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
              <div key={tag.id} onClick={() => navigate('/signup')} className="group relative bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_-15px_rgba(0,43,128,0.15)] hover:border-[#38b6ff]/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
                <div className={`w-14 h-14 rounded-2xl ${tag.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <tag.icon className={`w-7 h-7 ${tag.color}`} />
                </div>
                <h3 className="text-lg font-bold text-[#002b80] mb-2">{tag.label}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">Click to preview and build your custom tag.</p>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="w-8 h-8 rounded-full bg-[#f8fbff] flex items-center justify-center shadow-sm text-[#002b80]">
                     <ArrowRight className="w-4 h-4" />
                   </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
             <button onClick={() => navigate('/signup')} className="bg-[#002b80] hover:bg-[#001f5c] text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-[#002b80]/20 transition-transform hover:-translate-y-0.5 text-lg inline-flex items-center gap-2">
                Create a Free Account <ArrowRight size={20} />
             </button>
          </div>
        </div>
      </section>

    </div>
  );
}
