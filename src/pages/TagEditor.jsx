import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, Save, CheckCircle, AlertCircle,
  Tag, Baby, KeySquare, Bell, CarFront, Hotel,
  Dog, Stethoscope, Home, Wifi, Clock,
  Hash, Palette, Info, User, Building2, MapPin, X, UploadCloud,
  Smartphone, Calendar, MessageSquare, Briefcase, Leaf, Wallet, Laptop, Key,
  Plus, Trash2, Lock, Sparkles, Crown
} from 'lucide-react';
import PhoneInput from '../components/PhoneInput';


/* ─── Schema: one entry per tag type ─────────────────────────────────── */
const SCHEMAS = {
  dog: {
    label: 'Pet Tag',
    emoji: '🐶',
    color: 'amber',
    sections: [
      {
        title: 'Pet Information',
        fields: [
          { key: 'pet_name',    label: 'Pet Name',    type: 'text',   placeholder: 'Max', icon: Dog,         required: true },
          { key: 'breed',       label: 'Breed',       type: 'text',   placeholder: 'Golden Retriever', icon: Tag },
          { key: 'age',         label: 'Age',         type: 'text',   placeholder: '3 years', icon: Info },
          { key: 'color',       label: 'Color / Markings', type: 'text', placeholder: 'Golden with white chest', icon: Palette },
        ]
      },
      {
        title: 'Veterinarian & Health',
        fields: [
          { key: 'vet_name',     label: 'Vet Name',               type: 'text',     placeholder: 'Dr. Sarah Lee', icon: Stethoscope },
          { key: 'vet_phone',    label: 'Vet Phone',               type: 'phone',    placeholder: '9876543210' },
          { key: 'allergies',    label: 'Known Allergies',         type: 'textarea', placeholder: 'Allergic to chicken, pollen...', icon: AlertCircle },
          { key: 'medications',  label: 'Required Medications',   type: 'textarea', placeholder: 'Takes daily heart medication (Atenolol 25mg).', icon: Info },
          { key: 'medical_notes', label: 'Other Medical Notes',   type: 'textarea', placeholder: 'Any other health info for the finder...', icon: Info },
        ]
      },
      {
        title: 'Owner Info (shown when scanned)',
        fields: [
          { key: 'owner_name',   label: 'Owner Name',  type: 'text', placeholder: 'Jane Doe', icon: User },
          { key: 'reward',       label: 'Reward Offer', type: 'text', placeholder: 'Reward offered if found!', icon: Info },
        ]
      },
      {
        title: 'Security',
        fields: [
          { key: 'is_lost', label: 'Lost Mode (Alert Finder)', type: 'toggle', icon: AlertCircle },
        ]
      }
    ]
  },

  kids: {
    label: 'Child Tag',
    emoji: '👶',
    color: 'pink',
    sections: [
      {
        title: "Child's Information",
        fields: [
          { key: 'child_name',   label: "Child's Name",  type: 'text', placeholder: 'Aisha', icon: Baby, required: true },
          { key: 'age',          label: 'Age',           type: 'text', placeholder: '7 years old', icon: Info },
          { key: 'school',       label: 'School Name',   type: 'text', placeholder: 'Sri Aman Primary School', icon: Building2 },
        ]
      },
      {
        title: 'Emergency Contacts',
        fields: [
          { key: 'parent_name',  label: 'Parent / Guardian Name', type: 'text', placeholder: 'Ahmad bin Ali', icon: User, required: true },
          { key: 'phone2',       label: 'Second Contact Phone',  type: 'phone', placeholder: '9876543210' },
          { key: 'notes',        label: 'Special Instructions',  type: 'textarea', placeholder: 'Has nut allergy. Speaks English and Malay.', icon: Info },
        ]
      },
      {
        title: 'Security',
        fields: [
          { key: 'is_lost', label: 'Lost Mode (Alert Finder)', type: 'toggle', icon: AlertCircle },
        ]
      }
    ]
  },

  rental: {
    label: 'Rental Tag',
    emoji: '🔑',
    color: 'blue',
    sections: [
      {
        title: 'Property Details',
        fields: [
          { key: 'property_name',    label: 'Property Name',    type: 'text',     placeholder: 'Subang Jaya Homestay', icon: Home, required: true },
          { key: 'rental_status',    label: 'Current Status',   type: 'select',   options: ['Available', 'Booked'], icon: Info },
          { key: 'room_size',        label: 'Room Size / Type', type: 'text',     placeholder: 'e.g. 2BHK, Studio, 3 Bed 2 Bath', icon: Home },
          { key: 'property_address', label: 'Address',          type: 'textarea', placeholder: '12, Jalan SS15/4, Subang Jaya', icon: MapPin },
          { key: 'apartment_unit',   label: 'Unit / Room',      type: 'text',     placeholder: 'Unit 8B, Level 3', icon: Building2 },
          { key: 'amenities',        label: 'Amenities (Optional)', type: 'textarea', placeholder: 'e.g. Car parking, Swimming pool, Air conditioning...', icon: Info },
        ]
      },
      {
        title: 'Media & Gallery',
        fields: [
          { key: 'image_urls',       label: 'Property Images (Upload up to 3)', type: 'image_upload', max: 3, icon: Palette },
          { key: 'virtual_tour_url', label: 'Virtual Tour Link (Matterport/YouTube)', type: 'text', placeholder: 'https://...', icon: MapPin },
        ]
      },
      {
        title: 'House Rules & Notes',
        fields: [
          { key: 'house_rules',  label: 'House Rules',    type: 'textarea', placeholder: 'No smoking. Quiet hours after 10 PM. No outside guests.', icon: Info },
          { key: 'emergency',    label: 'Manager Contact Phone', type: 'phone', placeholder: '9876543210' },
        ]
      }
    ]
  },

  doorbell: {
    label: 'Doorbell Tag',
    emoji: '🔔',
    color: 'violet',
    sections: [
      {
        title: 'Location Info',
        fields: [
          { key: 'location_name', label: 'Location Name',    type: 'text', placeholder: 'Main Entrance', icon: MapPin, required: true },
          { key: 'unit_number',   label: 'Apartment / Unit', type: 'text', placeholder: 'Unit 12A', icon: Building2 },
          { key: 'floor',         label: 'Floor',            type: 'text', placeholder: '3rd Floor', icon: Building2 },
        ]
      },
      {
        title: 'Instructions',
        fields: [
          { key: 'instructions', label: 'Visitor Instructions', type: 'textarea', placeholder: 'Ring and wait. Please do not knock. Delivery: leave at door.', icon: Info },
          { key: 'delivery_note', label: 'Delivery Instructions', type: 'textarea', placeholder: 'Leave parcels at the door mat. Thank you!', icon: Home },
        ]
      }
    ]
  },

  parking: {
    label: 'Parking Tag',
    emoji: '🚗',
    color: 'emerald',
    sections: [
      {
        title: 'Vehicle Details',
        fields: [
          { key: 'vehicle_image',label: 'Vehicle Photo', type: 'image_upload', max: 1 },
          { key: 'plate_number', label: 'Plate Number',  type: 'text', placeholder: 'WXY 1234', icon: Hash,     required: true },
          { key: 'vehicle_make', label: 'Vehicle Make',  type: 'text', placeholder: 'Perodua', icon: CarFront },
          { key: 'vehicle_model',label: 'Model',         type: 'text', placeholder: 'Myvi 1.5', icon: CarFront },
          { key: 'color',        label: 'Vehicle Color', type: 'text', placeholder: 'White', icon: Palette },
        ]
      },
      {
        title: 'Contact & Notes',
        fields: [
          { key: 'contact_note', label: 'Message to Display', type: 'textarea', placeholder: 'I will move my car asap, please WhatsApp me!', icon: Info },
          { key: 'notes',        label: 'Other Notes',        type: 'textarea', placeholder: 'Parking Bay 4B, Level 2', icon: Info },
        ]
      }
    ]
  },

  hotel: {
    label: 'Hotel Tag',
    emoji: '🏨',
    color: 'rose',
    sections: [
      {
        title: 'Room Information',
        fields: [
          { key: 'hotel_name',    label: 'Hotel Name',   type: 'text', placeholder: 'The Grand Kuala Lumpur', icon: Hotel,     required: true },
          { key: 'room_number',   label: 'Room Number',  type: 'text', placeholder: '512', icon: Hash },
          { key: 'floor',         label: 'Floor',        type: 'text', placeholder: '5th Floor', icon: Building2 },
        ]
      },
      {
        title: 'Stay Details',
        fields: [
          { key: 'checkin_date',   label: 'Check-In Date & Time',    type: 'text', placeholder: '20 Mar 2026, 2:00 PM', icon: Clock },
          { key: 'checkout_date',  label: 'Check-Out Date & Time',   type: 'text', placeholder: '23 Mar 2026, 12:00 PM', icon: Clock },
          { key: 'wifi_name',      label: 'WiFi Network',            type: 'text', placeholder: 'HotelGuest', icon: Wifi },
          { key: 'wifi_password',  label: 'WiFi Password',           type: 'text', placeholder: 'room512guest', icon: Wifi },
        ]
      },
      {
        title: 'Hotel Info',
        fields: [
          { key: 'concierge_phone', label: 'Concierge / Front Desk', type: 'phone', placeholder: '9876543210' },
          { key: 'amenities_note',  label: 'Notes / Amenities',      type: 'textarea', placeholder: 'Pool: Level 10. Gym: Level 2. Breakfast: 7-10 AM.', icon: Info },
        ]
      }
    ]
  },
  electronics: {
    label: 'Asset/Equipment',
    emoji: '💻',
    color: 'indigo',
    sections: [
      {
        title: 'Asset Information',
        fields: [
          { key: 'category', label: 'Category', type: 'select', options: ['Laptop', 'Mobile', 'Desktop', 'Power Tool', 'Camera', 'Other'], icon: Smartphone, required: true },
          { key: 'asset_id', label: 'Asset ID / Serial', type: 'text', placeholder: 'INV-2026-001', icon: Hash },
          { key: 'model', label: 'Product Model', type: 'text', placeholder: 'MacBook Air M2, DeWalt Drill...', icon: Info, required: true },
          { key: 'assigned_to', label: 'Assigned To', type: 'text', placeholder: 'John Doe', icon: User },

          { key: 'billing_date', label: 'Billing Date', type: 'date', icon: Calendar },
        ]
      },
      {
        title: 'Security & Visibility',
        fields: [
          { key: 'is_lost', label: 'Lost Mode (Alert Finder)', type: 'toggle', icon: AlertCircle },
          { key: 'gps_enabled', label: 'Enable GPS Location Tracking', type: 'toggle', icon: MapPin },
        ]
      }
    ]
  },
  business: {
    label: 'Digital Card',
    emoji: '📇',
    color: 'fuchsia',
    sections: [
      {
        title: 'Professional Info',
        fields: [
          { key: 'full_name',  label: 'Full Name', type: 'text', placeholder: 'Alex Chen', icon: User, required: true },
          { key: 'job_title',  label: 'Job Title', type: 'text', placeholder: 'Senior Designer', icon: Briefcase },
          { key: 'company',    label: 'Company',   type: 'text', placeholder: 'Acme Corp', icon: Building2 },
        ]
      },
      {
        title: 'Contact & Links',
        fields: [
          { key: 'email',      label: 'Email Address', type: 'text', placeholder: 'alex@example.com', icon: MessageSquare },
          { key: 'phone',      label: 'Phone Number',  type: 'phone', placeholder: '9876543210' },
          { key: 'linkedin',   label: 'LinkedIn URL',  type: 'text', placeholder: 'linkedin.com/in/alexchen', icon: Info },
          { key: 'portfolio',  label: 'Portfolio/Website', type: 'text', placeholder: 'www.alexchen.design', icon: MapPin },
        ]
      }
    ]
  },
  plant: {
    label: 'Plant Care',
    emoji: '🪴',
    color: 'green',
    sections: [
      {
        title: 'Plant Details',
        fields: [
          { key: 'plant_name',   label: 'Common Name', type: 'text', placeholder: 'Monstera Deliciosa', icon: Leaf, required: true },
          { key: 'scientific',   label: 'Scientific Name', type: 'text', placeholder: 'Monstera deliciosa Lieb.', icon: Info },
        ]
      },
      {
        title: 'Care Instructions',
        fields: [
          { key: 'watering',     label: 'Watering Schedule', type: 'select', options: ['Daily', 'Every 2-3 Days', 'Weekly', 'Every 2 Weeks', 'Monthly'], icon: Clock, required: true },
          { key: 'sunlight',     label: 'Sunlight Info',     type: 'select', options: ['Direct Sun', 'Bright Indirect', 'Medium Light', 'Low Light'], icon: Info },
          { key: 'notes',        label: 'Care Notes / Soil', type: 'textarea', placeholder: 'Use well-draining soil. Toxic to cats!', icon: AlertCircle },
        ]
      }
    ]
  },
  keychain: {
    label: 'Keychain',
    emoji: '🔑',
    color: 'slate',
    sections: [
      {
        title: 'Item Details',
        fields: [
          { key: 'item_name',  label: 'Item Name', type: 'text', placeholder: 'House Keys, Car FOB, Wallet...', icon: Key, required: true },
          { key: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Jane', icon: User },
        ]
      },
      {
        title: 'Return Info',
        fields: [
          { key: 'reward',     label: 'Reward Offer', type: 'text', placeholder: 'Coffee on me!', icon: Info },
          { key: 'is_lost',    label: 'Item is currently lost', type: 'toggle', icon: AlertCircle },
        ]
      }
    ]
  }
};

const COLOR_MAP = {
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',   ring: 'ring-amber-400',  badge: 'bg-amber-100 text-amber-800' },
  pink:    { bg: 'bg-pink-50',    border: 'border-pink-200',   text: 'text-pink-700',    ring: 'ring-pink-400',   badge: 'bg-pink-100 text-pink-800' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',    ring: 'ring-blue-400',   badge: 'bg-blue-100 text-blue-800' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-700',  ring: 'ring-violet-400', badge: 'bg-violet-100 text-violet-800' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700', ring: 'ring-emerald-400',badge: 'bg-emerald-100 text-emerald-800' },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-200',   text: 'text-rose-700',    ring: 'ring-rose-400',   badge: 'bg-rose-100 text-rose-800' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200', text: 'text-indigo-700',  ring: 'ring-indigo-400', badge: 'bg-indigo-100 text-indigo-800' },
  fuchsia: { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700', ring: 'ring-fuchsia-400', badge: 'bg-fuchsia-100 text-fuchsia-800' },
  green:   { bg: 'bg-green-50',   border: 'border-green-200',  text: 'text-green-700',   ring: 'ring-green-400',  badge: 'bg-green-100 text-green-800' },
  slate:   { bg: 'bg-slate-100',  border: 'border-slate-300',  text: 'text-slate-700',   ring: 'ring-slate-400',  badge: 'bg-slate-200 text-slate-800' },
};

/* ─── Image Uploader Component ────────────────────────────────────────────── */
function ImageUploader({ urls, max, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (urls.length + files.length > max) return alert(`You can only upload up to ${max} images.`);
    
    setUploading(true);
    const newUrls = [...urls];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const ext = file.name.split('.').pop();
      const fileName = `tag-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { error } = await supabase.storage.from('product-images').upload(fileName, file);
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        newUrls.push(data.publicUrl);
      }
    }
    onChange(newUrls);
    setUploading(false);
  };

  const removeUrl = (idx) => {
    const newUrls = [...urls];
    newUrls.splice(idx, 1);
    onChange(newUrls);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {urls.map((url, i) => (
          <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group bg-slate-50">
            <img src={url} alt={`upload-${i}`} className="w-full h-full object-cover" />
            <button type="button" onClick={() => removeUrl(i)} className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-600 text-white rounded-full p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
              <X size={14} />
            </button>
          </div>
        ))}
        {urls.length < max && (
          <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 text-slate-400 hover:text-violet-500 transition-all">
            {uploading ? (
              <span className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UploadCloud size={24} className="mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
              </>
            )}
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
      <p className="text-xs text-slate-400 leading-snug">You can upload up to <span className="font-bold">{max} images</span> to showcase this space. Use clear, landscape photos for best results.</p>
    </div>
  );
}

/* ─── Field Components ────────────────────────────────────────────────── */
function FieldInput({ field, value, onChange }) {
  const Icon = field.icon;
  const base = 'form-input';

  if (field.type === 'image_upload') {
    const urls = value ? value.split(',').map(url => url.trim()).filter(Boolean) : [];
    const max = field.max || 1;
    return <ImageUploader urls={urls} max={max} onChange={(newUrls) => onChange(field.key, newUrls.join(','))} />;
  }

  if (field.type === 'phone') {
    return (
      <PhoneInput
        value={value || ''}
        onChange={(v) => onChange(field.key, v)}
        placeholder={field.placeholder}
        required={field.required}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 shrink-0" />}
        <textarea
          className={`${base} ${Icon ? 'pl-10' : ''} min-h-[90px] resize-y`}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 shrink-0 pointer-events-none" />}
        <select
          className={`${base} ${Icon ? 'pl-10' : ''} cursor-pointer appearance-none bg-no-repeat`}
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          value={value || field.options[0]}
          onChange={(e) => onChange(field.key, e.target.value)}
        >
          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    );
  }

  if (field.type === 'date') {
    return (
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 shrink-0 pointer-events-none" />}
        <input
          type="date"
          className={`${base} ${Icon ? 'pl-10' : ''}`}
          value={value || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          required={field.required}
        />
      </div>
    );
  }

  if (field.type === 'toggle') {
    const isActive = value === true;
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(field.key, !isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm font-medium text-slate-600">{field.label}</span>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 shrink-0" />}
      <input
        type={field.type || 'text'}
        className={`${base} ${Icon ? 'pl-10' : ''}`}
        placeholder={field.placeholder}
        value={value || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        required={field.required}
      />
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────── */
export default function TagEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tag, setTag] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  // Feature: Expiry
  const [expiresAt, setExpiresAt] = useState('');
  // Feature: Custom QR
  const [qrColor, setQrColor]     = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrLogoUrl, setQrLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  // Feature: Emergency Contacts
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }

      const { data, error } = await supabase
        .from('tags').select('*')
        .eq('id', id).eq('user_id', session.user.id).single();

      if (error || !data) { navigate('/dashboard'); return; }
      setTag(data);
      setFormData({ ...data.data, is_lost: data.is_lost, contact_preference: data.contact_preference || 'whatsapp' } || {});
      // Load extra fields
      setExpiresAt(data.expires_at ? data.expires_at.split('T')[0] : '');
      setQrColor(data.qr_color || '#000000');
      setQrBgColor(data.qr_bg_color || '#ffffff');
      setQrLogoUrl(data.qr_logo_url || '');
      setContacts(data.emergency_contacts || []);
      // Check premium
      const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', session.user.id).single();
      setIsPremium(profile?.is_premium || false);
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const { is_lost, contact_preference, ...dataWithoutLost } = formData;
    const { error } = await supabase
      .from('tags')
      .update({ 
        data: dataWithoutLost, 
        is_lost: !!is_lost,
        contact_preference: contact_preference || 'whatsapp',
        expires_at: expiresAt || null,
        qr_color: qrColor,
        qr_bg_color: qrBgColor,
        qr_logo_url: qrLogoUrl || null,
        emergency_contacts: contacts,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const addContact = () => {
    if (contacts.length >= 3) return;
    setContacts(prev => [...prev, { name: '', phone: '', email: '' }]);
  };

  const updateContact = (idx, field, val) => {
    setContacts(prev => prev.map((c, i) => i === idx ? { ...c, [field]: val } : c));
  };

  const removeContact = (idx) => {
    setContacts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingLogo(true);
    const ext = file.name.split('.').pop();
    const path = `qr-logos/${id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('tag-images').upload(path, file, { upsert: true });
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from('tag-images').getPublicUrl(path);
      setQrLogoUrl(publicUrl);
    }
    setUploadingLogo(false);
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading tag details…</div>;

  const schema = SCHEMAS[tag.type] || SCHEMAS.dog;
  const clr = COLOR_MAP[schema.color] || COLOR_MAP.violet;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className={`glass-card p-6 mb-6 flex items-center gap-4 ${clr.border} border-2`}>
        <div className={`h-14 w-14 ${clr.bg} ${clr.border} border rounded-2xl flex items-center justify-center text-3xl shrink-0`}>
          {schema.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-900 truncate">{tag.title}</h1>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${clr.badge}`}>
              {schema.label}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">Fill in the details below — they will appear when someone scans your QR code.</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex gap-2 items-start">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}
      {saved && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex gap-2 items-center">
          <CheckCircle size={16} /> Details saved! They will now show on the public tag page.
        </div>
      )}

      {/* Form sections */}
      <form onSubmit={handleSave} className="space-y-6">
        {schema.sections.map((section, si) => (
          <div key={si} className="glass-card p-6">
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-5 ${clr.text}`}>
              {section.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.fields.map((field) => {
                // Conditional visibility logic
                if (field.showIf && !field.showIf(formData)) return null;

                return (
                  <div key={field.key} className={`form-group ${field.type === 'textarea' || field.type === 'image_upload' ? 'sm:col-span-2' : ''}`}>
                    {field.type !== 'toggle' && (
                      <label className="form-label">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-0.5">*</span>}
                      </label>
                    )}
                    <FieldInput field={field} value={formData[field.key]} onChange={handleChange} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {/* Contact Preference */}
        <div className="glass-card p-6 border-l-4 border-violet-500">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={18} className="text-violet-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-violet-800">Contact Preference</h2>
          </div>
          <p className="text-sm text-slate-500 mb-5">How do you want finders to contact you when this tag is scanned?</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'whatsapp', label: 'WhatsApp Only', desc: 'Finders are redirected to chat on WhatsApp.', icon: '💬' },
              { id: 'chat', label: 'Message Form', desc: 'Finders leave an async message. Keeps number private.', icon: '📩' },
              { id: 'both', label: 'Allow Both', desc: 'Finders can choose to WhatsApp or leave a message.', icon: '🤝' }
            ].map(opt => (
              <label 
                key={opt.id} 
                className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all ${
                  formData.contact_preference === opt.id 
                    ? 'border-violet-500 bg-violet-50 shadow-sm' 
                    : 'border-slate-200 bg-white hover:border-violet-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="contact_preference" 
                  value={opt.id} 
                  checked={formData.contact_preference === opt.id}
                  onChange={(e) => handleChange('contact_preference', e.target.value)}
                  className="sr-only" 
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{opt.icon}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.contact_preference === opt.id ? 'border-violet-500' : 'border-slate-300'}`}>
                    {formData.contact_preference === opt.id && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                  </div>
                </div>
                <span className={`font-bold text-sm ${formData.contact_preference === opt.id ? 'text-violet-900' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
                <span className="text-xs text-slate-500 mt-1 leading-snug">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Emergency Contacts (Lost Mode Broadcast) ── */}
        {['dog', 'kids', 'keychain'].includes(tag.type) && (
          <div className="glass-card p-6 border-l-4 border-red-400">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <h2 className="text-sm font-bold uppercase tracking-widest text-red-700">Emergency Contacts</h2>
              </div>
              {contacts.length < 3 && (
                <button type="button" onClick={addContact}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                  <Plus size={12} /> Add Contact
                </button>
              )}
            </div>
            <p className="text-sm text-slate-500 mb-5">When Lost Mode is activated, these contacts will be alerted via SMS &amp; Email automatically. (Max 3)</p>
            {contacts.length === 0 ? (
              <div className="border-2 border-dashed border-red-200 rounded-xl p-6 text-center">
                <p className="text-slate-400 text-sm">No emergency contacts added yet.</p>
                <button type="button" onClick={addContact}
                  className="mt-3 text-xs font-bold px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                  + Add First Contact
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((c, idx) => (
                  <div key={idx} className="bg-red-50/60 border border-red-100 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-red-600 uppercase">Contact {idx + 1}</span>
                      <button type="button" onClick={() => removeContact(idx)}
                        className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" placeholder="Name" value={c.name}
                        onChange={e => updateContact(idx, 'name', e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400" />
                      <input type="tel" placeholder="Phone (+91...)" value={c.phone}
                        onChange={e => updateContact(idx, 'phone', e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400" />
                      <input type="email" placeholder="Email" value={c.email}
                        onChange={e => updateContact(idx, 'email', e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Expiry Date (Self-Destruct) ── */}
        <div className="glass-card p-6 border-l-4 border-amber-400">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-amber-700">Tag Expiry (Optional)</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Set a date when this tag expires and goes offline. Perfect for rentals, hotel check-outs, or events.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border border-amber-200 bg-amber-50 text-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400" />
            {expiresAt && (
              <button type="button" onClick={() => setExpiresAt('')}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors">
                <X size={13} /> Clear expiry
              </button>
            )}
            {expiresAt && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
                ⏳ Tag will expire on {new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* ── Custom QR Design (Premium) ── */}
        <div className="glass-card p-6 border-l-4 border-yellow-400">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-yellow-600" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-yellow-700">Custom QR Design</h2>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
              <Crown size={10} /> PREMIUM
            </span>
          </div>
          {!isPremium ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Lock size={32} className="text-slate-300 mb-3" />
              <p className="text-slate-600 font-semibold text-sm">Premium Feature</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs">Upgrade to Premium to customise your QR code colours and add a brand logo to the center.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="form-label">QR Code Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={qrColor} onChange={e => setQrColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer" />
                    <span className="text-sm font-mono text-slate-600">{qrColor}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">Background Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={qrBgColor} onChange={e => setQrBgColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer" />
                    <span className="text-sm font-mono text-slate-600">{qrBgColor}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="form-label">Center Logo (optional)</label>
                {qrLogoUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={qrLogoUrl} alt="QR Logo" className="w-14 h-14 rounded-xl object-contain border border-slate-200 bg-slate-50 p-1" />
                    <button type="button" onClick={() => setQrLogoUrl('')}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold">
                      Remove logo
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 w-fit cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors">
                    <UploadCloud size={14} />
                    {uploadingLogo ? 'Uploading…' : 'Upload Logo (PNG/SVG)'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>


        {/* Save Bar */}
        <div className="sticky bottom-4 z-10">
          <div className="glass-card p-4 flex items-center justify-between gap-4 shadow-lg border-slate-200">
            <p className="text-sm text-slate-500 hidden sm:block">
              {saved ? '✓ All changes saved.' : 'Changes are not saved yet.'}
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <Link to="/dashboard" className="btn btn-secondary px-5 py-2.5 flex-1 sm:flex-none justify-center">
                Cancel
              </Link>
              <button type="submit" className={`btn btn-primary px-6 py-2.5 flex-1 sm:flex-none justify-center ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`} disabled={saving}>
                {saving ? 'Saving…' : saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Details</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
