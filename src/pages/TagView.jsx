import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { QrCode, MessageSquare, AlertCircle, Phone, MapPin, Home, Eye, Send, CheckCircle2 } from 'lucide-react';

/* ── Display schemas: which fields to show on the public page ─────── */
const PUBLIC_SCHEMAS = {
  dog: {
    label: 'Pet Tag', emoji: '🐶', color: 'amber',
    greeting: (d) => `Hi! I found ${d.pet_name || 'this pet'}. Contacting you via GetURQR.`,
    sections: [
      {
        title: 'About This Pet',
        rows: [
          { key: 'pet_name',    label: 'Name' },
          { key: 'breed',       label: 'Breed' },
          { key: 'age',         label: 'Age' },
          { key: 'color',       label: 'Markings' },
        ]
      },
      {
        title: 'Health & Vet',
        rows: [
          { key: 'vet_name',      label: 'Vet Clinic' },
          { key: 'vet_phone',     label: 'Vet Phone', type: 'phone' },
          { key: 'allergies',     label: '⚠️ Allergies', type: 'alert' },
          { key: 'medications',   label: '💊 Medications' },
          { key: 'medical_notes', label: 'Other Notes' },
        ]
      },
      {
        title: 'Owner',
        rows: [
          { key: 'owner_name', label: 'Owner' },
          { key: 'reward',     label: 'Reward' },
        ]
      }
    ]
  },
  kids: {
    label: 'Child Tag', emoji: '👶', color: 'pink',
    greeting: (d) => `Hi! I found ${d.child_name || 'a child'}. Please contact me via GetURQR.`,
    sections: [
      {
        title: "Child's Information",
        rows: [
          { key: 'child_name', label: 'Name' },
          { key: 'age',        label: 'Age' },
          { key: 'school',     label: 'School' },
        ]
      },
      {
        title: 'Emergency Contact',
        rows: [
          { key: 'parent_name', label: 'Parent / Guardian' },
          { key: 'phone2',      label: 'Alt. Phone', type: 'phone' },
          { key: 'notes',       label: 'Special Notes' },
        ]
      }
    ]
  },
  rental: {
    label: 'Rental Property', emoji: '🔑', color: 'blue',
    greeting: (d) => `Hi! I'm contacting you about "${d.property_name || 'your rental property'}".`,
    sections: [
      {
        title: 'Amenities & Features',
        rows: [
          { key: 'amenities', label: 'Amenities' },
        ]
      },
      {
        title: 'Rules & Notes',
        rows: [
          { key: 'house_rules', label: 'House Rules' },
          { key: 'emergency',   label: 'Emergency Info' },
        ]
      }
    ]
  },
  doorbell: {
    label: 'Doorbell', emoji: '🔔', color: 'violet',
    greeting: (_d) => `*DING DONG!* 🔔 Someone is at your door!`,
    sections: [
      {
        title: 'Location',
        rows: [
          { key: 'location_name', label: 'Location' },
          { key: 'unit_number',   label: 'Unit' },
          { key: 'floor',         label: 'Floor' },
        ]
      },
      {
        title: 'Instructions',
        rows: [
          { key: 'instructions',  label: 'Visitor Note' },
          { key: 'delivery_note', label: 'Delivery Note' },
        ]
      }
    ]
  },
  parking: {
    label: 'Parking Tag', emoji: '🚗', color: 'emerald',
    greeting: (d) => `Hi! I'm contacting you about vehicle ${d.plate_number || 'your car'}.`,
    sections: [
      {
        title: 'Notes',
        rows: [
          { key: 'notes', label: 'Other Notes' },
        ]
      }
    ]
  },
  hotel: {
    label: 'Hotel Room', emoji: '🏨', color: 'rose',
    greeting: (d) => `Hi! I'm a guest in room ${d.room_number || 'your hotel'}.`,
    sections: [
      {
        title: 'Room Info',
        rows: [
          { key: 'hotel_name',  label: 'Hotel' },
          { key: 'room_number', label: 'Room' },
          { key: 'floor',       label: 'Floor' },
        ]
      },
      {
        title: 'Stay Details',
        rows: [
          { key: 'checkin_date',   label: 'Check-In' },
          { key: 'checkout_date',  label: 'Check-Out' },
          { key: 'wifi_name',      label: 'WiFi Name' },
          { key: 'wifi_password',  label: 'WiFi Password' },
          { key: 'concierge_phone', label: 'Front Desk', type: 'phone' },
          { key: 'amenities_note', label: 'Amenities' },
        ]
      }
    ]
  },
  electronics: {
    label: 'Asset/Equipment', emoji: '💻', color: 'indigo',
    greeting: (d) => `Hi! I found your asset: ${d.model || d.category || 'equipment'}.`,
    sections: [
      {
        title: 'Asset Details',
        rows: [
          { key: 'category', label: 'Category' },
          { key: 'asset_id', label: 'Asset ID' },
          { key: 'model', label: 'Model' },
          { key: 'assigned_to', label: 'Assigned To' },
        ]
      }
    ]
  },
  business: {
    label: 'Digital Card', emoji: '📇', color: 'fuchsia',
    greeting: (d) => `Hi ${d.full_name?.split(' ')[0] || ''}, I scanned your business card!`,
    sections: [
      {
        title: 'Professional Info',
        rows: [
          { key: 'full_name',  label: 'Name' },
          { key: 'job_title',  label: 'Title' },
          { key: 'company',    label: 'Company' },
        ]
      },
      {
        title: 'Contact',
        rows: [
          { key: 'email',      label: 'Email' },
          { key: 'phone',      label: 'Phone', type: 'phone' },
          { key: 'linkedin',   label: 'LinkedIn' },
          { key: 'portfolio',  label: 'Website' },
        ]
      }
    ]
  },
  plant: {
    label: 'Plant Care', emoji: '🪴', color: 'green',
    greeting: (d) => `Plant care log for ${d.plant_name || 'this plant'}.`,
    sections: [
      {
        title: 'Plant Details',
        rows: [
          { key: 'plant_name',   label: 'Common Name' },
          { key: 'scientific',   label: 'Scientific' },
        ]
      },
      {
        title: 'Care Instructions',
        rows: [
          { key: 'watering',     label: 'Watering' },
          { key: 'sunlight',     label: 'Sunlight' },
          { key: 'notes',        label: 'Notes' },
        ]
      }
    ]
  },
  keychain: {
    label: 'Keychain', emoji: '🔑', color: 'slate',
    greeting: (d) => `Hi! I found your ${d.item_name || 'item'}.`,
    sections: [
      {
        title: 'Item Info',
        rows: [
          { key: 'item_name',  label: 'Item' },
          { key: 'owner_name', label: 'Owner' },
          { key: 'reward',     label: 'Reward' },
        ]
      }
    ]
  },
};

const COLOR_MAP = {
  amber:   { badge: 'bg-amber-100 text-amber-800 border-amber-200', header: 'bg-amber-50',   border: 'border-amber-200', label: 'text-amber-700' },
  pink:    { badge: 'bg-pink-100 text-pink-800 border-pink-200',     header: 'bg-pink-50',    border: 'border-pink-200',  label: 'text-pink-700' },
  blue:    { badge: 'bg-blue-100 text-blue-800 border-blue-200',     header: 'bg-blue-50',    border: 'border-blue-200',  label: 'text-blue-700' },
  violet:  { badge: 'bg-violet-100 text-violet-800 border-violet-200', header: 'bg-violet-50', border: 'border-violet-200', label: 'text-violet-700' },
  emerald: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', header: 'bg-emerald-50', border: 'border-emerald-200', label: 'text-emerald-700' },
  rose:    { badge: 'bg-rose-100 text-rose-800 border-rose-200',     header: 'bg-rose-50',    border: 'border-rose-200',  label: 'text-rose-700' },
  indigo:  { badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', header: 'bg-indigo-50', border: 'border-indigo-200', label: 'text-indigo-700' },
  fuchsia: { badge: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200', header: 'bg-fuchsia-50', border: 'border-fuchsia-200', label: 'text-fuchsia-700' },
  green:   { badge: 'bg-green-100 text-green-800 border-green-200', header: 'bg-green-50', border: 'border-green-200', label: 'text-green-700' },
  slate:   { badge: 'bg-slate-100 text-slate-800 border-slate-300', header: 'bg-slate-50', border: 'border-slate-300', label: 'text-slate-700' },
};

function DetailRow({ label, value, type }) {
  if (!value) return null;
  if (type === 'alert') {
    return (
      <div className="py-2.5 border-b border-slate-100 last:border-0">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">{label}</span>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <span className="text-sm font-bold text-amber-800 break-words whitespace-pre-wrap">{value}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-28 shrink-0 pt-0.5">{label}</span>
      {type === 'phone' ? (
        <a href={`tel:${value}`} className="text-sm font-medium text-blue-600 hover:underline break-all">{value}</a>
      ) : (
        <span className="text-sm text-slate-800 break-words whitespace-pre-wrap">{value}</span>
      )}
    </div>
  );
}

export default function TagView() {
  const { id } = useParams();
  const [tag, setTag] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Analytics state
  const [scanId, setScanId] = useState(null);
  const [locationShared, setLocationShared] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Message Form State
  const [msgName, setMsgName] = useState('');
  const [msgContact, setMsgContact] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgSending, setMsgSending] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const { data: tagData, error: e } = await supabase
          .from('tags').select('*').eq('id', id).single();
        if (e || !tagData) throw new Error('Tag not found.');
        if (tagData.is_active === false) throw new Error('This tag has been deactivated.');
        // Self-destruct expiry check
        if (tagData.expires_at && new Date(tagData.expires_at) < new Date()) {
          throw new Error(`expired::${tagData.expires_at}`);
        }
        setTag(tagData);
        const { data: profileData } = await supabase
          .from('profiles').select('full_name, whatsapp_number').eq('id', tagData.user_id).single();
        if (profileData) setProfile(profileData);

        // Only log scan if viewer is NOT the tag owner
        const { data: { session } } = await supabase.auth.getSession();
        const isOwner = session?.user?.id === tagData.user_id;
        if (!isOwner) {
          logScan(tagData.id);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const logScan = async (tagId) => {
      try {
        const { data, error } = await supabase
          .from('tag_scans')
          .insert([{ tag_id: tagId }])
          .select('id')
          .single();
        if (!error && data) setScanId(data.id);
      } catch (e) {
        console.error("Failed to log scan:", e);
      }
    };

    fetchTag();
  }, [id]);

  const handleShareLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation isn't supported by this browser.");
    
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (scanId) {
          await supabase.from('tag_scans').update({ latitude, longitude }).eq('id', scanId);
        }
        setLocationShared(true);
        setLocationLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your location. Please check your browser permissions.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgName.trim() || !msgContent.trim()) return;
    setMsgSending(true);
    try {
      const { error } = await supabase.from('tag_messages').insert([{
        tag_id: tag.id,
        sender_name: msgName.trim(),
        sender_contact: msgContact.trim(),
        message: msgContent.trim()
      }]);
      if (error) throw error;
      setMsgSent(true);
      setMsgContent('');
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      setMsgSending(false);
    }
  };

  const handleWhatsApp = () => {
    if (!profile?.whatsapp_number) return alert("Owner hasn't set up WhatsApp yet.");
    const num = profile.whatsapp_number.replace(/[^0-9]/g, '');
    const schema = PUBLIC_SCHEMAS[tag?.type];
    const tagData = tag?.data || {};
    const msg = schema?.greeting ? schema.greeting(tagData) : `Hi! I found your GetURQR tag: "${tag?.title}".`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-slate-400">Loading tag…</div>
    </div>
  );

  if (error) {
    const isExpired = error.startsWith('expired::');
    const expiryDate = isExpired ? error.split('::')[1] : null;
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className={`glass-card text-center max-w-sm w-full p-10 ${isExpired ? 'border-amber-200 border-2' : 'border-red-200 border-2'}`}>
          {isExpired ? (
            <>
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">This Tag Has Expired</h2>
              <p className="text-slate-500 mb-2 text-sm">This QR tag was set to automatically go offline.</p>
              {expiryDate && (
                <p className="text-xs text-amber-600 font-semibold mb-6 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  Expired on {new Date(expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </>
          ) : (
            <>
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Tag Unavailable</h2>
              <p className="text-slate-500 mb-6 text-sm">{error}</p>
            </>
          )}
          <Link to="/" className="btn btn-secondary px-6 py-2">Go to GetURQR</Link>
        </div>
      </div>
    );
  }


  const schema = PUBLIC_SCHEMAS[tag.type] || null;
  const isLost = tag.type === 'rental' ? false : !!tag.is_lost;
  
  const clr = schema ? (COLOR_MAP[schema.color] || COLOR_MAP.violet) : COLOR_MAP.violet;
  const emoji = schema?.emoji || '🏷️';
  const typeLabel = schema?.label || 'Tag';
  const tagData = tag.data || {};
  const hasDetails = Object.values(tagData).some(v => v && v.toString().trim() !== '');

  const renderRentalHeader = () => {
    const images = tagData.image_urls ? tagData.image_urls.split(',').map(u => u.trim()).filter(Boolean) : [];
    const status = tagData.rental_status || 'Available';
    const isAvailable = status === 'Available';

    return (
      <div className="glass-card overflow-hidden shadow-md mb-4 bg-white relative">
        {images.length > 0 ? (
          <div
            className="flex gap-3 overflow-x-auto pb-1 rounded-xl hide-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}
          >
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Property ${i + 1}`}
                style={{ scrollSnapAlign: 'start' }}
                className="w-full h-56 object-cover rounded-xl shrink-0 first:ml-0"
              />))}
          </div>
        ) : (
          <div className="h-40 bg-slate-100 flex flex-col items-center justify-center text-slate-400">
            <Home size={32} className="mb-2 opacity-50" />
            <p className="font-medium text-sm">No property images</p>
          </div>
        )}
        
        {/* Status Badge Overlaid */}
        <div className="absolute top-4 left-4 z-10">
           <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-lg backdrop-blur-md uppercase tracking-wide border ${isAvailable ? 'bg-emerald-500/95 text-white border-emerald-400/50' : 'bg-red-500/95 text-white border-red-400/50'}`}>
             <span className={`w-2 h-2 rounded-full bg-white ${isAvailable ? 'animate-pulse' : ''}`} />
             {isAvailable ? 'Available to Book' : 'Currently Booked'}
           </span>
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2">{tagData.property_name || 'Premium Rental'}</h1>
          <p className="text-sm text-slate-500 flex items-start gap-2 font-medium leading-relaxed mb-5">
            <MapPin size={16} className="shrink-0 mt-0.5 text-slate-400" />
            <span className="min-w-0">
              {tagData.room_size && <span className="inline-block font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md mr-2">{tagData.room_size}</span>}
              {tagData.property_address || 'Address not provided'} {tagData.apartment_unit && <span className="text-slate-400 font-bold ml-1">· {tagData.apartment_unit}</span>}
            </span>
          </p>

          {tagData.virtual_tour_url && (
            <a href={tagData.virtual_tour_url} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md">
              <Eye size={18} /> View Virtual Tour
            </a>
          )}
        </div>
      </div>
    );
  };

  const handleQuickAlert = (alertText) => {
    if (!profile?.whatsapp_number) return alert("Owner hasn't set up WhatsApp yet.");
    const num = profile.whatsapp_number.replace(/[^0-9]/g, '');
    const msg = `🚨 *Vehicle Alert (${tagData.plate_number || 'Your Car'})*\n\n${alertText}`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const renderParkingHeader = () => {
    const imageUrl = tagData.vehicle_image ? tagData.vehicle_image : null;
    return (
      <div className="glass-card overflow-hidden shadow-md mb-4 bg-white relative">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Vehicle" className="w-full h-48 sm:h-56 object-cover bg-slate-100" />
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 z-10"></div>
          </>
        ) : (
          <div className="h-1.5 w-full bg-emerald-500"></div>
        )}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{tagData.plate_number || 'VEHICLE'}</h1>
             <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">
               {tagData.vehicle_make} {tagData.vehicle_model} {tagData.color && `· ${tagData.color}`}
             </p>
           </div>
           <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl shadow-inner shrink-0">
             🚗
           </div>
        </div>

        {tagData.contact_note && (
          <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
            <p className="text-yellow-800 text-sm font-medium italic">"{tagData.contact_note}"</p>
          </div>
        )}

        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center mb-4">Quick Alerts (WhatsApp)</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleQuickAlert("Please move your car, you are blocking me!")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors shadow-sm text-center">
              <span className="text-2xl">🚗</span>
              <span className="text-xs font-bold leading-tight">Please Move</span>
            </button>
            <button onClick={() => handleQuickAlert("You left a window open on your vehicle!")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors shadow-sm text-center">
              <span className="text-2xl">🪟</span>
              <span className="text-xs font-bold leading-tight">Window Open</span>
            </button>
            <button onClick={() => handleQuickAlert("You forgot to turn your headlights off!")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors shadow-sm text-center">
              <span className="text-2xl">💡</span>
              <span className="text-xs font-bold leading-tight">Lights On</span>
            </button>
            <button onClick={() => handleQuickAlert("I accidentally bumped into your parked car.")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors shadow-sm text-center">
              <span className="text-2xl">💥</span>
              <span className="text-xs font-bold leading-tight">Car Bumped</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col items-center py-6 px-4 min-h-[100vh] ${isLost ? 'bg-red-50' : 'bg-slate-50'}`}>
      <div className="w-full max-w-md space-y-4">

        {/* LOST BANNER */}
        {isLost && (
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-lg text-center animate-pulse">
            <h2 className="text-xl font-black uppercase tracking-widest mb-1">Help Find Me!</h2>
            <p className="text-red-100 text-sm">Please contact the owner below immediately.</p>
          </div>
        )}

        {/* Doorbell DND banner */}
        {tag.type === 'doorbell' && Boolean(tagData.dnd_mode) && (
          <div className="bg-violet-600 text-white p-5 rounded-2xl shadow-lg text-center">
            <div className="text-4xl mb-2">🔕</div>
            <h2 className="text-xl font-black uppercase tracking-widest mb-1">Do Not Disturb</h2>
            <p className="text-violet-200 text-sm">The resident is currently unavailable. Please try again later or leave a message below.</p>
          </div>
        )}

        {/* GPS Prompt */}
        {(isLost || tagData.gps_enabled === true) && !locationShared && (
          <div className="glass-card p-5 border-2 border-red-200 shadow-xl bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-red-500 h-full"></div>
            <div className="flex gap-4 items-start">
              <div className="bg-red-100 p-2.5 rounded-full shrink-0">
                <MapPin className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight mb-1">Share Location?</h3>
                <p className="text-sm text-slate-500 mb-3">Help the owner locate this {tag.type === 'dog' ? 'pet' : tag.type === 'kids' ? 'child' : 'item'} by sharing where you scanned it.</p>
                <button 
                  onClick={handleShareLocation} disabled={locationLoading}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2.5 px-4 rounded-xl text-sm transition-colors border border-red-200 disabled:opacity-50">
                  {locationLoading ? 'Getting fix…' : '📍 Share My Location'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Location Success */}
        {locationShared && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-sm text-center font-medium flex items-center justify-center gap-2">
            <AlertCircle size={18} className="text-emerald-500" /> Location shared with owner. Thank you!
          </div>
        )}

        {tag.type === 'rental' && !isLost ? (
          renderRentalHeader()
        ) : tag.type === 'parking' && !isLost ? (
          renderParkingHeader()
        ) : (
          /* Header Card */
          <div className={`glass-card overflow-hidden shadow-md ${isLost ? 'border-2 border-red-200' : ''}`}>
            <div className={`h-1.5 w-full ${isLost ? 'bg-red-500' : 'bg-gradient-to-r from-violet-500 via-blue-500 to-indigo-500'}`}></div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`h-14 w-14 ${clr.header} ${clr.border} border rounded-2xl flex items-center justify-center text-3xl shrink-0`}>
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-extrabold text-slate-900 leading-tight">{tag.title}</h1>
                  <span className={`inline-flex items-center gap-1 mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${clr.badge} ${isLost ? 'uppercase tracking-wide' : ''}`}>
                    <span className={`w-1.5 h-1.5 bg-current rounded-full opacity-70 ${isLost ? 'animate-pulse' : ''}`}></span>
                    {typeLabel}
                  </span>
                </div>
              </div>

              {!hasDetails && !isLost && (
                <p className="mt-4 text-slate-500 text-sm leading-relaxed">
                  Scan this GetURQR to instantly reach the owner on WhatsApp.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Detail Sections */}
        {hasDetails && schema?.sections.map((section, si) => {
          const visibleRows = section.rows.filter(r => tagData[r.key]);
          if (!visibleRows.length) return null;
          return (
            <div key={si} className="glass-card overflow-hidden shadow-sm">
              <div className={`px-5 py-3 ${clr.header} border-b ${clr.border}`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${clr.label}`}>{section.title}</p>
              </div>
              <div className="px-5 py-1">
                {visibleRows.map(row => (
                  <DetailRow key={row.key} label={row.label} value={tagData[row.key]} type={row.type} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Contact Options */}
        {(() => {
          const pref = tag.contact_preference || 'whatsapp';
          const showWhatsApp = pref === 'whatsapp' || pref === 'both';
          const showChat = pref === 'chat' || pref === 'both';

          return (
            <div className={`glass-card p-5 shadow-sm space-y-4 ${isLost ? 'border-2 border-red-500 ring-4 ring-red-500/20' : ''}`}>
              <p className={`text-xs font-bold uppercase tracking-widest text-center mb-1 ${isLost ? 'text-red-500' : 'text-slate-400'}`}>
                {isLost ? 'Contact Owner Immediately' : 'Contact Owner'}
              </p>

              {/* WhatsApp Option */}
              {showWhatsApp && (
                <div className="space-y-3">
                  {!profile?.whatsapp_number ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-sm text-amber-700">
                      <AlertCircle className="h-5 w-5 mx-auto mb-1 text-amber-400" />
                      Owner hasn't set a contact number yet.
                    </div>
                  ) : (
                    <>
                      <button onClick={handleWhatsApp}
                        className={`w-full flex items-center justify-center gap-3 text-white font-bold py-4 px-6 rounded-xl transition-all hover:-translate-y-0.5 ${isLost ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30 shadow-lg animate-pulse hover:animate-none' : 'bg-[#25D366] hover:bg-[#1ebe5d] shadow-[0_4px_14px_rgba(37,211,102,0.3)]'}`}>
                        <MessageSquare size={20} fill="currentColor" /> Chat on WhatsApp
                      </button>
                      <a href={`tel:+${profile.whatsapp_number.replace(/[^0-9]/g, '')}`}
                        className={`btn w-full py-3 justify-center ${isLost ? 'bg-white text-red-600 border border-red-200 hover:bg-red-50' : 'btn-secondary'}`}>
                        <Phone size={16} /> Call Directly
                      </a>
                    </>
                  )}
                </div>
              )}

              {/* Internal Chat Option */}
              {showChat && (
                <div className={`${showWhatsApp ? 'pt-4 border-t border-slate-100' : ''}`}>
                  {showWhatsApp && (
                    <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Or Send a Message</p>
                  )}
                  {msgSent ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-6 rounded-2xl text-center">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <h3 className="font-bold text-lg mb-1">Message Sent!</h3>
                      <p className="text-sm opacity-90">The owner will receive an email notification shortly.</p>
                      <button type="button" onClick={() => setMsgSent(false)} className="mt-4 text-emerald-600 text-sm font-semibold hover:underline">
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="space-y-3">
                      <div>
                        <input type="text" placeholder="Your Name *" value={msgName} onChange={e => setMsgName(e.target.value)} required className="form-input bg-slate-50 border-slate-200 text-sm" />
                      </div>
                      <div>
                        <input type="text" placeholder="Your Number or Email (Optional)" value={msgContact} onChange={e => setMsgContact(e.target.value)} className="form-input bg-slate-50 border-slate-200 text-sm mb-1" />
                        <p className="text-[10px] text-slate-400 px-1">Leave this if you want the owner to reply to you.</p>
                      </div>
                      <div>
                        <textarea placeholder="Message *" value={msgContent} onChange={e => setMsgContent(e.target.value)} required className="form-input bg-slate-50 border-slate-200 text-sm min-h-[80px] resize-y" />
                      </div>
                      <button type="submit" disabled={msgSending || !msgName.trim() || !msgContent.trim()} className="w-full btn btn-primary py-3 justify-center text-sm disabled:opacity-50">
                        {msgSending ? 'Sending...' : <><Send size={16} /> Send Message Alert</>}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Footer */}
        <div className="text-center py-2">
          <Link to="/" className="text-xs text-slate-400 hover:text-violet-600 inline-flex items-center gap-1 transition-colors">
            <QrCode size={11} /> Powered by GetURQR
          </Link>
        </div>
      </div>
    </div>
  );
}
