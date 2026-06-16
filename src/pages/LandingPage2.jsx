import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Link as LinkIcon, User, Phone, AlignJustify, AlignLeft, LayoutGrid, MessageSquare, Mail, Download, UploadCloud, ChevronDown, ChevronUp, Lock, Dog, CarFront, Stethoscope, Briefcase, Bell, Key, Link2, Sparkles, ArrowRight, Image as ImageIcon, X, Share2 } from 'lucide-react';

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

  const [expandedPanel, setExpandedPanel] = useState('color');
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
    <div className="flex flex-col w-full overflow-x-hidden bg-[#f0f4f8] font-sans min-h-screen relative">
      
      {/* Background Geometric Shapes */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#002b80] rounded-full mix-blend-multiply opacity-90 blur-[2px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[5%] w-[15vw] h-[15vw] bg-[#38b6ff] rounded-full mix-blend-multiply opacity-90 blur-[1px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] bg-[#ff9100] rounded-full mix-blend-multiply opacity-90 blur-[2px] pointer-events-none"></div>

      {/* ── Hero Generator Section ───────────────────── */}
      <section className="relative z-10 w-full flex-1 flex flex-col items-center pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        
        {/* Main Card */}
        <div className="bg-[#f8fbff] rounded-[2.5rem] w-full max-w-[1100px] mx-auto p-4 md:p-6 shadow-[0_20px_50px_-12px_rgba(0,43,128,0.2)] border border-white/60 flex flex-col md:flex-row gap-6 relative overflow-hidden backdrop-blur-xl">
           
           {/* Left Sidebar (Nav) */}
           <div className="flex flex-row md:flex-col items-center gap-6 md:py-6 px-4 md:px-2 z-10">
              <div className="w-10 h-10 flex items-center justify-center font-black text-2xl text-[#002b80] mb-0 md:mb-6 shrink-0">
                G
              </div>
              
              <div className="flex md:flex-col gap-3 bg-white rounded-full p-2 shadow-sm border border-slate-100 overflow-x-auto md:overflow-visible flex-1 md:flex-none">
                {TABS.map((tab) => {
                  const isActive = activeTab.id === tab.id;
                  return (
                    <button 
                      key={tab.id} 
                      onClick={() => handleTabChange(tab)}
                      className={`relative w-12 h-12 flex items-center justify-center rounded-full transition-all shrink-0 ${isActive ? 'bg-[#002b80] text-white shadow-lg shadow-[#002b80]/40 scale-110 z-10' : 'text-slate-400 hover:text-[#002b80] hover:bg-slate-50'}`}
                      title={tab.id}
                    >
                       <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                    </button>
                  );
                })}
              </div>
           </div>
           
           {/* Middle Pane (Input) */}
           <div className="flex-1 flex flex-col justify-center px-4 md:px-12 py-8 z-10">
              <h2 className="text-4xl md:text-[2.75rem] font-bold text-[#002b80] mb-2 tracking-tight">{activeTab.title}</h2>
              <p className="text-sm text-slate-400 mb-12 font-medium">Your QR code will be generated automatically</p>
              
              <div className="w-full max-w-md">
                {activeTab.signupOnly ? (
                  <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center flex flex-col items-center justify-center group hover:border-[#38b6ff] transition-colors cursor-pointer" onClick={() => navigate('/signup')}>
                    <div className="w-12 h-12 bg-[#38b6ff] rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-[#38b6ff]/30 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-[#002b80]">Upload any file <span className="text-slate-400 font-normal">(jpg, .pdf, .mp3, .docx, .pptx)</span></p>
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                      <Lock size={12} /> Sign up to unlock
                    </div>
                  </div>
                ) : activeTab.isEmail ? (
                  <div className="flex flex-col gap-6">
                    <input 
                      type="email" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter email address" 
                      className="w-full border-b border-slate-200 py-3 bg-transparent text-[#002b80] font-medium placeholder-slate-300 focus:outline-none focus:border-[#002b80] transition-colors" 
                    />
                    <input 
                      type="text" 
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject" 
                      className="w-full border-b border-slate-200 py-3 bg-transparent text-[#002b80] font-medium placeholder-slate-300 focus:outline-none focus:border-[#002b80] transition-colors" 
                    />
                    <textarea 
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Enter your message" 
                      className="w-full border-b border-slate-200 py-3 bg-transparent text-[#002b80] font-medium placeholder-slate-300 focus:outline-none focus:border-[#002b80] transition-colors resize-none h-24"
                    />
                    <button className="bg-[#002b80] hover:bg-[#001f5c] text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-[#002b80]/20 self-start mt-4 flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                      <QrCode size={18} /> GENERATE QR CODE
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {activeTab.id === 'Text' ? (
                      <textarea 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={activeTab.placeholder} 
                        className="w-full border-b border-slate-200 py-3 bg-transparent text-[#002b80] font-medium placeholder-slate-300 focus:outline-none focus:border-[#002b80] transition-colors resize-none h-32"
                      />
                    ) : (
                      <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={activeTab.placeholder} 
                        className="w-full border-b border-slate-200 py-3 bg-transparent text-[#002b80] font-medium placeholder-slate-300 focus:outline-none focus:border-[#002b80] transition-colors" 
                      />
                    )}
                  </div>
                )}
              </div>
           </div>
           
           {/* Right Pane (Preview) */}
           <div className="w-full md:w-[380px] bg-[#002b80] rounded-[2rem] p-8 flex flex-col z-10 shrink-0">
              <div className="bg-white rounded-2xl p-6 flex items-center justify-center aspect-square mb-8 relative group overflow-hidden shadow-xl shadow-black/10">
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
              
              <div className="flex flex-col gap-3 mb-8">
                 {/* Frame Panel */}
                 <div className="flex flex-col bg-white/5 rounded-xl border border-white/5 overflow-hidden transition-all">
                   <button onClick={() => setExpandedPanel(expandedPanel === 'frame' ? null : 'frame')} className="w-full text-white py-3.5 px-4 text-xs font-bold tracking-wide flex justify-between items-center hover:bg-white/5 transition-colors">
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
                   <button onClick={() => setExpandedPanel(expandedPanel === 'color' ? null : 'color')} className="w-full text-white py-3.5 px-4 text-xs font-bold tracking-wide flex justify-between items-center hover:bg-white/5 transition-colors">
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
                   <button onClick={() => setExpandedPanel(expandedPanel === 'logo' ? null : 'logo')} className="w-full text-white py-3.5 px-4 text-xs font-bold tracking-wide flex justify-between items-center hover:bg-white/5 transition-colors">
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

              <div className="flex gap-3 mt-auto">
                 <button onClick={() => handleDownload('jpg')} className="flex-1 bg-[#38b6ff] hover:bg-[#2fa0e6] text-white py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#38b6ff]/30 transition-transform hover:-translate-y-0.5">
                   <Download size={16} /> JPG
                 </button>
                 <button onClick={() => handleDownload('png')} className="flex-1 bg-[#ff9100] hover:bg-[#e68200] text-white py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff9100]/30 transition-transform hover:-translate-y-0.5">
                   <Download size={16} /> SVG/PNG
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
                 }} className="w-[52px] h-[52px] bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full flex items-center justify-center shrink-0 transition-transform hover:-translate-y-0.5" title="Share">
                   <Share2 size={20} />
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* ── Smart Tags Showcase Section ───────────────────── */}
      <section className="py-24 w-full bg-white relative z-10 border-t border-slate-100">
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
