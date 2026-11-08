import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Package, User, Bell, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { playDoorbellChime } from '../lib/chimeSound';

export default function DoorbellCameraWidget({ tag, profile, onMessageSent }) {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState('visitor'); // 'visitor' or 'package'
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('user'); // 'user' (front) or 'environment' (back)
  const [cameraError, setCameraError] = useState(null);
  
  const [visitorName, setVisitorName] = useState('');
  const [visitorContact, setVisitorContact] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ringingSuccess, setRingingSuccess] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Switch camera facing mode when changing mode
  useEffect(() => {
    const targetFacing = cameraMode === 'visitor' ? 'user' : 'environment';
    setCameraFacing(targetFacing);
    if (cameraActive) {
      stopCamera();
      startCamera(targetFacing);
    }
  }, [cameraMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (facing = cameraFacing) => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera preview not supported in this browser. Please use photo upload.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 720 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraError(err.message || 'Unable to access camera.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const switchFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    if (cameraActive) {
      stopCamera();
      startCamera(nextFacing);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    
    if (cameraFacing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
      setCapturedBlob(blob);
      stopCamera();
    }, 'image/jpeg', 0.85);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapturedBlob(file);
      setCapturedPhoto(URL.createObjectURL(file));
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setCapturedBlob(null);
    startCamera(cameraFacing);
  };

  const handleRingDoorbell = async (e) => {
    if (e) e.preventDefault();

    setSubmitting(true);
    try {
      // 1. Play Doorbell Chime immediately for instant sensory feedback
      playDoorbellChime();

      let photoUrl = null;

      // 2. Upload photo if one was taken
      if (capturedBlob) {
        const fileExt = 'jpg';
        const fileName = `${tag.id}/${Date.now()}_${cameraMode}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('doorbell-captures')
          .upload(fileName, capturedBlob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('doorbell-captures')
            .getPublicUrl(fileName);
          photoUrl = publicUrlData?.publicUrl || null;
        } else {
          console.warn('Could not upload doorbell snapshot:', uploadError);
        }
      }

      // 3. Save message record
      const defaultName = cameraMode === 'package' ? 'Delivery Courier' : 'Doorstep Visitor';
      const finalName = visitorName.trim() || defaultName;
      const finalMsg = deliveryNote.trim() 
        ? `${cameraMode === 'package' ? '📦 Delivery' : '🔔 Doorbell Ring'}: ${deliveryNote.trim()}`
        : `${cameraMode === 'package' ? '📦 Left parcel at the doorstep.' : '🔔 Ding Dong! Someone rang your QR doorbell.'}`;

      const { error: dbError } = await supabase.from('tag_messages').insert([{
        tag_id: tag.id,
        sender_name: finalName,
        sender_contact: visitorContact.trim() || null,
        message: finalMsg,
        photo_url: photoUrl
      }]);

      if (dbError) throw dbError;

      setRingingSuccess(true);
      if (onMessageSent) onMessageSent();

    } catch (err) {
      console.error('Error ringing doorbell:', err);
      alert('Could not ring doorbell: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (ringingSuccess) {
    return (
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-2 border-emerald-300 bg-white text-center shadow-xl animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
          <Bell size={32} className="fill-current" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-1">Ding Dong! Doorbell Rang</h2>
        <p className="text-slate-600 text-xs sm:text-sm mb-4">
          The resident was notified on their phone {capturedPhoto ? 'with your photo proof' : 'immediately'}.
        </p>
        {capturedPhoto && (
          <div className="max-w-[220px] mx-auto rounded-2xl overflow-hidden shadow-md border-2 border-emerald-200 mb-5">
            <img src={capturedPhoto} alt="Doorstep snap" className="w-full h-auto object-cover" />
          </div>
        )}
        <button
          onClick={() => {
            setRingingSuccess(false);
            setCapturedPhoto(null);
            setCapturedBlob(null);
            setDeliveryNote('');
            setShowCamera(false);
          }}
          className="btn btn-secondary py-2.5 px-6 rounded-xl text-xs font-bold"
        >
          Ring Again / Leave Note
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 rounded-3xl border-2 border-violet-200 bg-white shadow-xl relative overflow-hidden">
      {/* Doorbell Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
          <Bell size={20} className="fill-current" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-base leading-tight">Smart QR Doorbell</h3>
          <p className="text-xs text-slate-500">Ring instantly or attach a doorstep photo</p>
        </div>
      </div>

      {/* Main 1-Tap Ring Button (Zero friction) */}
      <button
        type="button"
        disabled={submitting}
        onClick={handleRingDoorbell}
        className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-violet-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 text-base flex items-center justify-center gap-3 mb-3 disabled:opacity-50"
      >
        <Bell size={22} className="fill-current animate-pulse" />
        {submitting ? 'Ringing Resident...' : '🔔 Ring Doorbell Now'}
      </button>

      {/* Optional Photo / Package Proof Toggle */}
      <div className="pt-2">
        {!showCamera && !capturedPhoto ? (
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-violet-300 hover:border-violet-400 bg-violet-50/50 hover:bg-violet-50 text-violet-700 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Camera size={15} /> 
            <span>Optional: Add Visitor Selfie or Package Photo</span>
            <ChevronDown size={14} />
          </button>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Camera size={14} className="text-violet-600" /> Doorstep Camera Snapshot
              </span>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setShowCamera(false);
                  setCapturedPhoto(null);
                  setCapturedBlob(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold flex items-center gap-1"
              >
                Hide <ChevronUp size={14} />
              </button>
            </div>

            {/* Mode Selector Tabs (Visitor Selfie vs Package Proof) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => { setCameraMode('visitor'); setCapturedPhoto(null); }}
                className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${cameraMode === 'visitor' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'}`}
              >
                <User size={13} /> Visitor Selfie
              </button>
              <button
                type="button"
                onClick={() => { setCameraMode('package'); setCapturedPhoto(null); }}
                className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${cameraMode === 'package' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
              >
                <Package size={13} /> Package Proof
              </button>
            </div>

            {/* Camera Viewfinder / Preview */}
            <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200">
              {capturedPhoto ? (
                <div className="relative w-full h-full">
                  <img src={capturedPhoto} alt="Snapshot" className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1">
                    <Check size={12} className="text-emerald-400" /> Photo Attached
                  </div>
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="absolute bottom-2.5 right-2.5 bg-white/95 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Retake
                  </button>
                </div>
              ) : cameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className={`w-full h-full object-cover ${cameraFacing === 'user' ? '-scale-x-100' : ''}`}
                  />
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 z-10">
                    <button
                      type="button"
                      onClick={switchFacing}
                      className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                      title="Flip camera"
                    >
                      <RefreshCw size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-14 h-14 rounded-full bg-white text-violet-700 flex items-center justify-center shadow-xl border-4 border-violet-400 active:scale-95 transition-transform"
                      title="Take snapshot"
                    >
                      <Camera size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                      title="Close stream"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 space-y-2">
                  <div className="w-11 h-11 rounded-xl bg-white/10 text-violet-300 flex items-center justify-center mx-auto">
                    {cameraMode === 'visitor' ? <User size={22} /> : <Package size={22} />}
                  </div>
                  <p className="text-white text-xs font-bold">
                    {cameraMode === 'visitor' ? 'Snap your face at the door' : 'Take a photo of the parcel'}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => startCamera(cameraFacing)}
                      className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold py-2 px-3.5 rounded-xl inline-flex items-center gap-1.5"
                    >
                      <Camera size={13} /> Open Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold py-2 px-3 rounded-xl inline-flex items-center gap-1"
                    >
                      Upload
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture={cameraMode === 'visitor' ? 'user' : 'environment'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {cameraError && (
                    <p className="text-rose-400 text-[10px] mt-1">{cameraError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Quick note input when photo is added */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder={cameraMode === 'package' ? 'Delivery note (e.g. Left behind planter)' : 'Your name or message...'}
                value={deliveryNote}
                onChange={e => setDeliveryNote(e.target.value)}
                className="form-input bg-slate-50 border-slate-200 text-xs py-2 rounded-xl"
              />
              <button
                type="button"
                disabled={submitting}
                onClick={handleRingDoorbell}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-600/20"
              >
                <Bell size={14} className="fill-current" />
                {submitting ? 'Sending...' : '🔔 Ring with Photo Attached'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
