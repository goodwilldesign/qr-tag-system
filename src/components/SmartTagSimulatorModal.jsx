import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Dog, CarFront, Bell, Briefcase, Stethoscope, Key, 
  MessageSquare, Phone, Shield, AlertCircle, CheckCircle2, 
  Volume2, ArrowRight, Sparkles, MapPin, Camera, ExternalLink, Zap
} from 'lucide-react';
import { playDoorbellChime } from '../lib/chimeSound';

/* ── Sample Demo Profiles for each Smart Tag ────────────────── */
const SIMULATOR_TAGS = {
  pet: {
    id: 'pet',
    label: 'Pet Tag',
    badge: 'Smart Pet ID',
    icon: Dog,
    accentColor: '#f59e0b',
    headerBg: 'bg-amber-500',
    title: 'Buddy',
    subtitle: 'Golden Retriever • 3 yrs old',
    avatar: '🐕',
    highlights: [
      'No phone number exposed to strangers',
      'Finder connects via direct WhatsApp message',
      'One-tap Lost Mode with reward notice',
      'Update vet details anytime without reprinting'
    ],
    demoData: {
      ownerName: 'Sarah Jenkins',
      microchip: '985141002348911',
      vaccines: 'Rabies (Valid 2027) • DHPP',
      allergies: 'Chicken & Poultry',
      vetName: 'Downtown Animal Hospital',
      vetPhone: '+1 (555) 234-5678',
      reward: '$150 Reward upon safe return'
    }
  },
  vehicle: {
    id: 'vehicle',
    label: 'Vehicle Parking',
    badge: 'Parking Contact Tag',
    icon: CarFront,
    accentColor: '#2563eb',
    headerBg: 'bg-blue-600',
    title: 'Toyota Camry',
    subtitle: 'License Plate: MH-02-AB-1234',
    avatar: '🚗',
    highlights: [
      'Windshield sticker with zero phone number exposure',
      'Polite canned alerts for blocking & headlights',
      'Avoids aggressive towing & parking tickets',
      'Instant WhatsApp chat with vehicle owner'
    ],
    demoData: {
      plate: 'MH-02-AB-1234',
      vehicle: '2023 Toyota Camry • Metallic Gray',
      notes: 'Frequently parked in Resident Bay #14'
    }
  },
  doorbell: {
    id: 'doorbell',
    label: 'QR Doorbell',
    badge: 'Smart Digital Intercom',
    icon: Bell,
    accentColor: '#7c3aed',
    headerBg: 'bg-violet-600',
    title: 'Apartment 4B',
    subtitle: 'The Oakwood Residences',
    avatar: '🔔',
    highlights: [
      'Zero hardware wiring or battery replacements',
      'Plays real two-tone doorbell chime on visitor phone',
      'Photo proof of package delivery at door',
      'Resident alerted instantly without phone number exposure'
    ],
    demoData: {
      resident: 'Marcus & Elena Vance',
      status: 'At home (Accepting visitors)',
      unit: 'Unit 4B • 4th Floor',
      delivery: 'Leave parcels behind potted plant if no answer'
    }
  },
  luggage: {
    id: 'luggage',
    label: 'Smart Luggage',
    badge: 'Traveler Protection Tag',
    icon: Briefcase,
    accentColor: '#059669',
    headerBg: 'bg-emerald-600',
    title: 'Navy Travel Bag',
    subtitle: 'Flight: BA-142 (LHR → JFK)',
    avatar: '✈️',
    highlights: [
      'Airline-ready lost luggage contact tag',
      'Finder shares GPS location with 1 tap',
      'Keep home address private from baggage handlers',
      'Direct WhatsApp chat across international borders'
    ],
    demoData: {
      owner: 'David K. Miller',
      flight: 'BA-142 (London to New York)',
      reward: '$100 Reward for safe baggage return'
    }
  },
  medical: {
    id: 'medical',
    label: 'Medical Alert',
    badge: 'Emergency Health ID',
    icon: Stethoscope,
    accentColor: '#e11d48',
    headerBg: 'bg-rose-600',
    title: 'Emergency Health Profile',
    subtitle: 'Patient: Liam Cooper',
    avatar: '🩺',
    highlights: [
      'Instant medical vital signs for first responders',
      'Critical allergies & medications prominent',
      'One-tap ICE (In Case of Emergency) contact dialing',
      'Wearable as bracelet or wallet QR card'
    ],
    demoData: {
      patient: 'Liam Cooper',
      bloodType: 'O Positive (O+)',
      allergies: 'Severe Penicillin & Peanut Allergy',
      conditions: 'Type 1 Diabetes (Insulin Dependent)',
      iceContact: 'Rachel Cooper (Mother) • +1 (555) 987-6543'
    }
  },
  keychain: {
    id: 'keychain',
    label: 'Secure Keychain',
    badge: 'Lost Key Recovery',
    icon: Key,
    accentColor: '#475569',
    headerBg: 'bg-slate-700',
    title: 'Key Set #3',
    subtitle: 'Home & Office Keychain',
    avatar: '🔑',
    highlights: [
      'Never print your home address on your keys',
      'Finder contacts you securely via WhatsApp',
      'Drop-off location instructions (e.g. concierge desk)',
      'High recovery rate with guaranteed return reward'
    ],
    demoData: {
      dropoff: 'Please drop at front desk of 244 Madison Ave',
      reward: '$50 Reward for returned key set'
    }
  }
};

export default function SmartTagSimulatorModal({ initialTag = 'pet', onClose }) {
  const navigate = useNavigate();
  const [activeTagId, setActiveTagId] = useState(initialTag in SIMULATOR_TAGS ? initialTag : 'pet');
  const [isLostMode, setIsLostMode] = useState(false);
  const [doorbellChimed, setDoorbellChimed] = useState(false);
  const [activeSimMessage, setActiveSimMessage] = useState(null);

  const activeTag = SIMULATOR_TAGS[activeTagId] || SIMULATOR_TAGS.pet;

  const handleRingDoorbell = () => {
    playDoorbellChime();
    setDoorbellChimed(true);
    setTimeout(() => setDoorbellChimed(false), 3500);
  };

  const handleSimulateWhatsApp = (msg) => {
    setActiveSimMessage(msg);
    setTimeout(() => setActiveSimMessage(null), 4000);
  };

  const handleCreateThisTag = () => {
    onClose();
    window.scrollTo(0, 0);
    navigate(`/signup?type=${activeTag.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl md:rounded-[2.5rem] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden z-10 flex flex-col lg:flex-row my-auto max-h-[96vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shadow-sm"
          title="Close Simulator"
        >
          <X size={20} />
        </button>

        {/* ── Left Pane: The Interactive Smartphone Simulator Frame ──────────────── */}
        <div className="w-full lg:w-[460px] bg-gradient-to-b from-slate-100 to-slate-200 p-4 sm:p-6 flex flex-col items-center justify-center shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/80">
          
          {/* Tag Category Quick Strip for Mobile / Desktop */}
          <div className="flex gap-1.5 p-1 bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm mb-4 w-full max-w-[340px] overflow-x-auto hide-scrollbar no-scrollbar">
            {Object.values(SIMULATOR_TAGS).map((t) => {
              const isSelected = activeTagId === t.id;
              const IconComponent = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTagId(t.id);
                    setIsLostMode(false);
                    setActiveSimMessage(null);
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                    isSelected 
                      ? 'bg-[#002b80] text-white shadow-sm scale-100' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <IconComponent size={14} />
                  <span>{t.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Smartphone Hardware Chassis */}
          <div className="w-[300px] sm:w-[320px] h-[580px] bg-slate-900 rounded-[3rem] p-3 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] border-4 border-slate-700/80 relative flex flex-col">
            
            {/* Dynamic Island / Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            </div>

            {/* Smartphone Inner Screen Viewport */}
            <div className="w-full h-full bg-[#f8fbff] rounded-[2.3rem] overflow-y-auto overflow-x-hidden relative flex flex-col hide-scrollbar font-sans text-slate-800">
              
              {/* Phone Status Bar */}
              <div className="w-full pt-2 pb-1 px-6 flex justify-between items-center text-[11px] font-semibold text-slate-600 bg-transparent z-20">
                <span>9:41</span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-slate-600 rounded-sm flex items-center p-0.5">
                    <div className="w-full h-full bg-slate-700 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Simulated Tag Header */}
              <div className={`${activeTag.headerBg} text-white px-5 pt-7 pb-6 relative transition-colors duration-300`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {activeTag.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-full">
                      {activeTag.badge}
                    </span>
                    <h3 className="font-extrabold text-lg leading-tight mt-1 truncate">{activeTag.title}</h3>
                    <p className="text-xs text-white/80 truncate">{activeTag.subtitle}</p>
                  </div>
                </div>

                {/* Simulated Emergency Lost Mode Banner */}
                {isLostMode && (
                  <div className="mt-3 bg-red-600 text-white p-2.5 rounded-xl border border-white/30 text-xs font-bold flex items-center gap-2 animate-pulse shadow-md">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>LOST ALERT! Please call owner or share location.</span>
                  </div>
                )}
              </div>

              {/* Simulated Tag Body Content */}
              <div className="p-4 space-y-3 flex-1">
                
                {/* 1. PET TAG VIEW */}
                {activeTag.id === 'pet' && (
                  <>
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Microchip:</span>
                        <span className="font-semibold text-slate-700">{activeTag.demoData.microchip}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Vaccines:</span>
                        <span className="font-semibold text-emerald-600">{activeTag.demoData.vaccines}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Allergies:</span>
                        <span className="font-semibold text-rose-500">{activeTag.demoData.allergies}</span>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-xs flex items-center gap-2 text-amber-800">
                      <Sparkles size={16} className="text-amber-600 shrink-0" />
                      <span className="font-medium">{activeTag.demoData.reward}</span>
                    </div>

                    {/* Interactive Actions */}
                    <div className="space-y-2 pt-1">
                      <button 
                        onClick={() => handleSimulateWhatsApp('Hi Sarah! I just found Buddy near the park. He is safe with me!')}
                        className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                      >
                        <MessageSquare size={15} /> Chat on WhatsApp
                      </button>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleSimulateWhatsApp('Calling Downtown Vet Clinic at +1 (555) 234-5678')}
                          className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 py-2 px-2 rounded-xl font-semibold text-[11px] text-slate-700 flex items-center justify-center gap-1.5"
                        >
                          <Phone size={13} className="text-slate-400" /> Call Vet
                        </button>
                        <button 
                          onClick={() => setIsLostMode(!isLostMode)}
                          className={`flex-1 py-2 px-2 rounded-xl font-semibold text-[11px] border flex items-center justify-center gap-1 transition-all ${
                            isLostMode 
                              ? 'bg-red-50 border-red-300 text-red-600' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <AlertCircle size={13} className={isLostMode ? 'text-red-500' : 'text-slate-400'} />
                          {isLostMode ? 'Lost Mode (ON)' : 'Test Lost Mode'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. VEHICLE PARKING VIEW */}
                {activeTag.id === 'vehicle' && (
                  <>
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-xs">
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Polite Quick Notifications</p>
                      <p className="text-slate-600 text-[11px] mb-2.5">Select a message to alert the driver via WhatsApp without seeing their phone number:</p>
                      
                      <div className="space-y-1.5">
                        {[
                          '⚠️ Car is blocking my driveway',
                          '💡 Headlights were left on',
                          '⏰ Parking limit expiring',
                          '🚨 Vehicle alarm is sounding'
                        ].map((msg, i) => (
                          <button
                            key={i}
                            onClick={() => handleSimulateWhatsApp(`[Vehicle Alert] ${msg}`)}
                            className="w-full text-left py-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/60 text-[11px] font-medium transition-colors"
                          >
                            {msg}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSimulateWhatsApp('Hi, contacting vehicle owner regarding Toyota Camry.')}
                      className="w-full bg-[#25D366] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                    >
                      <MessageSquare size={15} /> Message Driver (Private)
                    </button>
                  </>
                )}

                {/* 3. QR DOORBELL VIEW */}
                {activeTag.id === 'doorbell' && (
                  <>
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-xs text-center space-y-2">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        Residents Available
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Press the chime button to ring the resident inside:
                      </p>

                      <button 
                        onClick={handleRingDoorbell}
                        className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                          doorbellChimed 
                            ? 'bg-emerald-600 text-white animate-bounce' 
                            : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'
                        }`}
                      >
                        <Volume2 size={16} /> 
                        {doorbellChimed ? '🔔 DING DONG! Ringing...' : '🔔 Press to Ring Chime'}
                      </button>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs space-y-1.5">
                      <p className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
                        <Camera size={14} className="text-violet-600" /> Package Proof Drop
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        Delivery courier? Take a quick drop snapshot for the resident.
                      </p>
                      <button 
                        onClick={() => handleSimulateWhatsApp('📸 Delivery drop photo sent to resident mailbox!')}
                        className="w-full bg-white hover:bg-slate-100 border border-slate-300 py-1.5 px-2 rounded-lg text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1.5"
                      >
                        <Camera size={13} /> Snap Delivery Photo
                      </button>
                    </div>
                  </>
                )}

                {/* 4. LUGGAGE TAG VIEW */}
                {activeTag.id === 'luggage' && (
                  <>
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-xs space-y-2">
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-400">Flight:</span>
                        <span className="font-bold text-slate-800">{activeTag.demoData.flight}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-400">Reward:</span>
                        <span className="font-bold text-emerald-600">{activeTag.demoData.reward}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSimulateWhatsApp('📍 GPS location pinged to owner: John F. Kennedy Airport Terminal 4')}
                      className="w-full bg-[#002b80] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                    >
                      <MapPin size={15} /> 1-Tap Share Found Location
                    </button>

                    <button 
                      onClick={() => handleSimulateWhatsApp('Hi David, I have located your Samsonite luggage at baggage carousel.')}
                      className="w-full bg-[#25D366] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      <MessageSquare size={15} /> WhatsApp Bag Owner
                    </button>
                  </>
                )}

                {/* 5. MEDICAL ALERT VIEW */}
                {activeTag.id === 'medical' && (
                  <>
                    <div className="bg-red-50 rounded-2xl p-3 border border-red-200 text-xs space-y-1.5">
                      <div className="flex justify-between border-b border-red-100 pb-1">
                        <span className="text-red-700 font-medium">Blood Group:</span>
                        <span className="font-extrabold text-red-900">{activeTag.demoData.bloodType}</span>
                      </div>
                      <div className="flex flex-col border-b border-red-100 pb-1">
                        <span className="text-red-700 font-medium">Allergies:</span>
                        <span className="font-bold text-red-800">{activeTag.demoData.allergies}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-red-700 font-medium">Condition:</span>
                        <span className="font-semibold text-red-800">{activeTag.demoData.conditions}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSimulateWhatsApp('Calling Emergency Contact: Rachel Cooper (+1 555-987-6543)')}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                    >
                      <Phone size={15} /> Call Emergency ICE Contact
                    </button>
                  </>
                )}

                {/* 6. KEYCHAIN VIEW */}
                {activeTag.id === 'keychain' && (
                  <>
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-xs space-y-2">
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Return Instructions</p>
                      <p className="text-slate-700 text-xs font-medium">{activeTag.demoData.dropoff}</p>
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 text-[11px] font-bold border border-emerald-200">
                        ✨ {activeTag.demoData.reward}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSimulateWhatsApp('Hi, I found your keychain set near the lobby.')}
                      className="w-full bg-[#25D366] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                    >
                      <MessageSquare size={15} /> Notify Key Owner (Private)
                    </button>
                  </>
                )}

              </div>

              {/* Simulated Interactive Toast Notification */}
              {activeSimMessage && (
                <div className="absolute bottom-4 left-3 right-3 bg-slate-900/95 text-white p-2.5 rounded-xl text-[11px] font-medium shadow-xl border border-white/20 animate-slideUp flex items-center gap-2 z-40">
                  <CheckCircle2 size={16} className="text-[#38b6ff] shrink-0" />
                  <span className="truncate">{activeSimMessage}</span>
                </div>
              )}

              {/* Phone Bottom Home Bar */}
              <div className="w-full py-1.5 flex justify-center bg-transparent mt-auto">
                <div className="w-28 h-1 bg-slate-300 rounded-full" />
              </div>

            </div>
          </div>
        </div>

        {/* ── Right Pane: Explanatory Highlights & Conversion Engine ──────────────── */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#002b80] text-xs font-bold border border-blue-100 mb-4">
              <Sparkles size={14} className="text-[#38b6ff]" />
              <span>Interactive Live Demo</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b80] tracking-tight mb-2">
              See How Your {activeTag.label} Works
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Unlike generic static QR codes that expose your private phone number or require re-printing when details change, GetURQR Smart Tags give you total privacy and dynamic control.
            </p>

            {/* Feature Checklist */}
            <div className="space-y-3 mb-8">
              {activeTag.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={13} className="stroke-[2.5]" />
                  </div>
                  <span className="font-medium">{h}</span>
                </div>
              ))}
            </div>

            {/* Category Selector Tabs */}
            <div className="border-t border-slate-100 pt-6 mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Switch Demo Category:
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.values(SIMULATOR_TAGS).map((t) => {
                  const isSelected = activeTagId === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTagId(t.id);
                        setIsLostMode(false);
                        setActiveSimMessage(null);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                        isSelected 
                          ? 'border-[#002b80] bg-[#002b80]/5 text-[#002b80] shadow-sm font-bold' 
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-[10px] leading-tight">{t.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Conversion Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCreateThisTag}
              className="w-full sm:flex-1 bg-[#002b80] hover:bg-[#001f5c] text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-[#002b80]/20 flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 text-sm"
            >
              <span>Build Your {activeTag.label} Free</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-5 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors"
            >
              Close Demo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
