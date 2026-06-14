import { Link, useNavigate } from 'react-router-dom';
import { QrCode, Link as LinkIcon, User, Phone, AlignJustify, AlignLeft, LayoutGrid, MessageSquare, Mail, Download, Copy, Shield, Package, Sparkles } from 'lucide-react';

export default function LandingPage2() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-slate-50">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative min-h-[90vh] md:min-h-screen w-full flex flex-col justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#e6f4e6] to-white">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            GetURQR
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            All-in-one tool to create free QR Codes, edit them, and track campaign performance.
          </p>
        </div>

        {/* Mock QR Generator Interface */}
        <div className="bg-[#242424] rounded-2xl w-full max-w-[1000px] mx-auto p-6 md:p-10 shadow-2xl flex flex-col md:flex-row gap-10">
           {/* Left Side */}
           <div className="flex-1 text-white">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-8 border-b border-white/10 pb-4">
                {[
                  { label: 'URL', icon: LinkIcon },
                  { label: 'PDF', icon: AlignLeft },
                  { label: 'Multi-URL', icon: AlignJustify },
                  { label: 'Contact', icon: User },
                  { label: 'Plain Text', icon: AlignLeft },
                  { label: 'App', icon: LayoutGrid },
                  { label: 'SMS', icon: MessageSquare },
                  { label: 'Email', icon: Mail },
                  { label: 'Phone', icon: Phone }
                ].map((tab, i) => (
                  <div key={i} className={`flex flex-col items-center gap-1.5 cursor-pointer p-3 rounded-xl transition-colors ${i === 0 ? 'bg-white/10 text-green-400' : 'hover:bg-white/5 text-slate-300 hover:text-white'}`}>
                     <tab.icon className="w-5 h-5" />
                     <span className="text-[11px] font-bold tracking-wide uppercase">{tab.label}</span>
                  </div>
                ))}
              </div>
              
              <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">Redirect to an existing web URL</h3>
              <div className="bg-white rounded-xl flex items-center px-4 py-4 mb-3">
                 <input type="text" placeholder="Enter URL" className="w-full text-black outline-none bg-transparent font-medium" />
              </div>
              <p className="text-sm text-slate-400 mb-8 font-medium">Try something like https://example.com/</p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-slate-200">
                   <input type="checkbox" className="form-checkbox text-amber-500 rounded bg-white/10 border-white/20 focus:ring-0 w-5 h-5" />
                   Track your scans ✨
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-slate-200">
                   <input type="checkbox" className="form-checkbox text-amber-500 rounded bg-white/10 border-white/20 focus:ring-0 w-5 h-5" />
                   Remove watermark ✨
                </label>
              </div>
           </div>
           
           {/* Right Side */}
           <div className="w-full md:w-80 flex flex-col gap-4">
              <div className="text-right text-sm text-white mb-2 font-medium">
                 To enable tracking, <Link to="/signup" className="underline hover:text-green-400 decoration-green-400/30 underline-offset-4">create a Dynamic QR Code</Link>
              </div>
              <div className="bg-white rounded-2xl p-6 flex items-center justify-center shadow-inner relative group cursor-pointer overflow-hidden aspect-square">
                 <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                   <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Preview</span>
                 </div>
                 <QrCode className="w-full h-full text-slate-900 stroke-1" />
              </div>
              <div className="flex gap-2">
                 <button onClick={() => navigate('/signup')} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3.5 rounded-xl font-bold transition-colors">Save</button>
                 <button onClick={() => navigate('/signup')} className="bg-white/10 hover:bg-white/20 text-white p-3.5 rounded-xl transition-colors"><Download size={20} /></button>
                 <button onClick={() => navigate('/signup')} className="bg-white/10 hover:bg-white/20 text-white p-3.5 rounded-xl transition-colors"><Copy size={20} /></button>
              </div>
           </div>
        </div>

        <div className="max-w-[1000px] mx-auto w-full mt-8 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="flex items-center text-blue-600 font-bold text-xl gap-1">
                <span className="text-blue-500">G</span>
                <span className="text-red-500">o</span>
                <span className="text-yellow-500">o</span>
                <span className="text-blue-500">g</span>
                <span className="text-green-500">l</span>
                <span className="text-red-500">e</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">4.8</span>
                <div className="flex text-amber-400">
                  {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                </div>
              </div>
              <span className="text-sm font-medium text-slate-500 hidden sm:block border-l pl-4 ml-2">Trusted by 4M+ users</span>
           </div>
           <div className="flex items-center gap-6 w-full sm:w-auto">
              <button onClick={() => navigate('/signup')} className="bg-[#6db54a] hover:bg-[#5da03f] text-white font-bold py-2.5 px-6 rounded-lg w-full sm:w-auto transition-colors">
                Sign up free
              </button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 font-medium whitespace-nowrap">
                <Shield size={16} className="text-slate-400"/> No credit card required
              </div>
           </div>
        </div>
      </section>

      {/* ── Steps Timeline ──────────────────────────────── */}
      <section className="py-20 md:py-32 bg-white w-full border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-24 text-slate-800">How to create a free QR Code in 3 simple steps</h2>
          
          <div className="relative border-l-2 border-dashed border-slate-200 ml-4 md:mx-auto md:ml-0 flex flex-col gap-24 md:w-full">
             
             {/* Step 1 */}
             <div className="relative flex flex-col md:flex-row items-center gap-10">
                <div className="absolute left-[-17px] md:left-1/2 md:-translate-x-1/2 bg-[#3c786a] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white z-10">1</div>
                
                <div className="md:w-1/2 md:text-right md:pr-16 pl-10 md:pl-0 w-full">
                   <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-sm border border-emerald-100 flex items-center justify-center aspect-[4/3] w-full max-w-[320px] ml-auto relative">
                      <div className="absolute -top-4 -left-4 bg-white rounded-xl p-3 shadow-lg border border-slate-100 flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                           <LinkIcon size={16} />
                         </div>
                         <span className="font-bold text-slate-700">URL</span>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 w-32 h-32 flex items-center justify-center">
                        <QrCode className="w-full h-full text-slate-800 stroke-1"/>
                      </div>
                   </div>
                </div>
                
                <div className="md:w-1/2 md:pl-16 pl-10 w-full">
                   <h3 className="text-2xl font-bold mb-4 text-slate-800">Choose your QR Code type</h3>
                   <p className="text-slate-600 leading-relaxed text-lg">Choose your QR Code type (static or dynamic) based on what you want it to do: open a URL, share a PDF, display a menu, share contact details, and more.</p>
                </div>
             </div>

             {/* Step 2 */}
             <div className="relative flex flex-col md:flex-row-reverse items-center gap-10">
                <div className="absolute left-[-17px] md:left-1/2 md:-translate-x-1/2 bg-[#3c786a] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white z-10">2</div>
                
                <div className="md:w-1/2 md:text-left md:pl-16 pl-10 w-full">
                   <div className="bg-gradient-to-bl from-green-50 to-emerald-50 rounded-3xl p-8 shadow-sm border border-emerald-100 flex flex-col items-center justify-center aspect-[4/3] w-full max-w-[320px] mr-auto relative">
                      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 w-32 h-32 flex items-center justify-center mb-6">
                        <QrCode className="w-full h-full text-violet-600 stroke-1"/>
                      </div>
                      <div className="absolute bottom-6 right-6 bg-white rounded-xl shadow-lg border border-slate-100 p-2 flex gap-2">
                         <div className="w-8 h-8 bg-black rounded-lg cursor-pointer hover:scale-110 transition-transform"></div>
                         <div className="w-8 h-8 bg-violet-500 rounded-lg cursor-pointer hover:scale-110 transition-transform ring-2 ring-violet-200 ring-offset-2"></div>
                         <div className="w-8 h-8 bg-amber-500 rounded-lg cursor-pointer hover:scale-110 transition-transform"></div>
                      </div>
                   </div>
                </div>
                
                <div className="md:w-1/2 md:text-right md:pr-16 pl-10 w-full">
                   <h3 className="text-2xl font-bold mb-4 text-slate-800">Customize it your way</h3>
                   <p className="text-slate-600 leading-relaxed text-lg">Add your details, change the color, style your QR Code, add a logo, and test it in real time before downloading.</p>
                </div>
             </div>

             {/* Step 3 */}
             <div className="relative flex flex-col md:flex-row items-center gap-10">
                <div className="absolute left-[-17px] md:left-1/2 md:-translate-x-1/2 bg-[#3c786a] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white z-10">3</div>
                
                <div className="md:w-1/2 md:text-right md:pr-16 pl-10 md:pl-0 w-full">
                   <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-sm border border-emerald-100 flex items-center justify-center aspect-[4/3] w-full max-w-[320px] ml-auto">
                      <div className="bg-white rounded-xl p-5 shadow-md border border-slate-100 w-full">
                         <div className="text-left mb-4">
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">File Name</div>
                           <div className="h-10 bg-slate-50 rounded-lg border border-slate-200 w-full px-3 flex items-center text-sm font-medium text-slate-700">my-qr-code</div>
                         </div>
                         <div className="flex gap-3 mt-6">
                            <button className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> PNG
                            </button>
                            <button className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-slate-100">
                              <div className="w-2 h-2 rounded-full bg-slate-300"></div> SVG
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
                
                <div className="md:w-1/2 md:pl-16 pl-10 w-full">
                   <h3 className="text-2xl font-bold mb-4 text-slate-800">Download & share</h3>
                   <p className="text-slate-600 leading-relaxed text-lg">Pick PNG, or SVG format, hit download, and you're all set to share it anywhere!</p>
                </div>
             </div>
          </div>

          <div className="text-center mt-24">
             <button onClick={() => navigate('/signup')} className="bg-[#6db54a] hover:bg-[#5da03f] text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 text-lg">
                Create a free QR Code
             </button>
          </div>
        </div>
      </section>
    </div>
  );
}
