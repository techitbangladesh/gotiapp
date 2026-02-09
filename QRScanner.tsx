
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Loader2, Scan, Image as ImageIcon, Camera, Zap, ZapOff } from 'lucide-react';
import jsQR from 'jsqr';
import { Language } from '../types';

interface QRScannerProps {
  lang: Language;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ lang, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mode, setMode] = useState<'select' | 'camera'>('select');
  const [status, setStatus] = useState<'idle' | 'requesting' | 'scanning' | 'connecting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [wifiData, setWifiData] = useState<{ ssid?: string; password?: string } | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);

  const scanningRef = useRef<boolean>(false);
  const requestRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const processQRCode = useCallback((data: string) => {
    // Detect standard WiFi QR format or Goti custom string
    // Format: WIFI:S:SSID;T:WPA;P:PASSWORD;;
    const ssidMatch = data.match(/S:([^;]+)/i);
    const passMatch = data.match(/P:([^;]+)/i);
    
    if (ssidMatch || data.toLowerCase().includes('goti')) {
      setWifiData({
        ssid: ssidMatch ? ssidMatch[1] : (data.length > 20 ? data.substring(0, 20) : data),
        password: passMatch ? passMatch[1] : undefined
      });
      setStatus('connecting');
      
      // Simulate network handshake
      setTimeout(() => {
        setStatus('success');
        // Vibrate if mobile
        if ('vibrate' in navigator) navigator.vibrate(200);
      }, 1500);
      return true;
    }
    return false;
  }, []);

  const scanFrame = useCallback(() => {
    if (!scanningRef.current || mode !== 'camera' || status !== 'scanning') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context) {
        // Match canvas to video stream resolution
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          if (processQRCode(code.data)) {
            scanningRef.current = false;
            return; // Stop the loop on success
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(scanFrame);
  }, [mode, status, processQRCode]);

  const toggleFlash = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !isFlashOn } as any]
      });
      setIsFlashOn(!isFlashOn);
    } catch (e) {
      console.warn("Flashlight not supported on this node");
    }
  };

  useEffect(() => {
    if (mode === 'camera') {
      const startCamera = async () => {
        setStatus('requesting');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment', 
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          });
          
          streamRef.current = stream;
          
          // Check for flashlight support
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities ? track.getCapabilities() : {};
          if ((capabilities as any).torch) {
            setHasFlash(true);
          }

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(() => {
                setStatus('scanning');
                scanningRef.current = true;
                requestRef.current = requestAnimationFrame(scanFrame);
              });
            };
          }
        } catch (err: any) {
          console.error(err);
          setStatus('error');
          setErrorMessage(lang === 'en' 
            ? 'Access Denied. Please enable camera permissions in your system settings.' 
            : 'ক্যামেরা ব্যবহারের অনুমতি পাওয়া যায়নি। সেটিংস থেকে পারমিশন চেক করুন।');
        }
      };
      startCamera();
    }

    return () => {
      scanningRef.current = false;
      cancelAnimationFrame(requestRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode, lang, scanFrame]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setStatus('connecting');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.width = img.width; 
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code && processQRCode(code.data)) {
          // Handled in processQRCode
        } else {
          setStatus('error');
          setErrorMessage(lang === 'en' ? 'Invalid Node. No Goti QR code detected.' : 'ভুল কিউআর কোড। সঠিক কোড ব্যবহার করুন।');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (mode === 'select') {
    return (
      <div className="fixed inset-0 z-[2000] bg-zinc-950 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-12 right-8 p-4 text-zinc-500 hover:text-white active:scale-90 transition-all">
          <X size={32} />
        </button>
        
        <div className="w-full max-w-sm space-y-12">
          <div className="text-center space-y-5">
            <div className="w-24 h-24 bg-red-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-red-600/30 animate-bounce">
              <Scan size={44} />
            </div>
            <div>
              <h2 className="text-white text-4xl font-black font-english uppercase tracking-tightest italic leading-none">Goti Scanner</h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] font-english mt-2">Initialize Local Node Connection</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button onClick={() => setMode('camera')} className="w-full p-8 bg-zinc-900 border border-zinc-800 rounded-[3rem] flex items-center gap-6 hover:border-red-600 transition-all active:scale-95 group">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-zinc-950 group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg">
                <Camera size={28} />
              </div>
              <div className="text-left">
                <h3 className="text-white font-black font-english uppercase text-lg leading-tight">{lang === 'en' ? 'Live Capture' : 'ক্যামেরা স্ক্যান'}</h3>
                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">{lang === 'en' ? 'Real-time decoding' : 'সরাসরি স্ক্যান শুরু করুন'}</p>
              </div>
            </button>
            
            <button onClick={() => fileInputRef.current?.click()} className="w-full p-8 bg-zinc-900 border border-zinc-800 rounded-[3rem] flex items-center gap-6 hover:border-red-600 transition-all active:scale-95 group">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-zinc-950 group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg">
                <ImageIcon size={28} />
              </div>
              <div className="text-left">
                <h3 className="text-white font-black font-english uppercase text-lg leading-tight">{lang === 'en' ? 'Upload Node' : 'গ্যালারি থেকে'}</h3>
                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">{lang === 'en' ? 'Select from gallery' : 'ছবি নির্বাচন করুন'}</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-zinc-950 flex flex-col animate-in fade-in duration-300">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* HUD Header */}
      <div className="absolute top-12 left-0 w-full px-8 flex items-center justify-between z-[2001]">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Scan size={20} /></div>
            <div className="text-left">
              <p className="text-white font-black font-english uppercase tracking-widest text-[10px]">Node Explorer</p>
              <p className="text-zinc-400 text-[8px] uppercase tracking-widest">Protocol v4.0.1</p>
            </div>
         </div>
         <div className="flex gap-3">
            {hasFlash && (
              <button 
                onClick={toggleFlash} 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isFlashOn ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white backdrop-blur-xl'}`}
              >
                {isFlashOn ? <Zap fill="currentColor" size={20} /> : <ZapOff size={20} />}
              </button>
            )}
            <button onClick={onClose} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white active:scale-90 transition-all">
              <X size={24} />
            </button>
         </div>
      </div>

      <div className="flex-1 relative">
        {status === 'scanning' && (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Target Area */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-72 h-72">
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-red-600 rounded-tl-[2rem]"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-red-600 rounded-tr-[2rem]"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-red-600 rounded-bl-[2rem]"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-red-600 rounded-br-[2rem]"></div>
                
                <div className="absolute inset-6 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
                   <div className="w-full h-1 bg-red-600/50 shadow-[0_0_30px_rgba(225,6,0,1)] animate-[scan_2.5s_infinite_linear]"></div>
                </div>
                
                <p className="absolute -bottom-16 left-0 w-full text-center text-[9px] font-black text-white/50 uppercase tracking-[0.4em] font-english">Align QR Code within Frame</p>
              </div>
            </div>
          </>
        )}

        {(status === 'requesting' || status === 'connecting') && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white gap-8">
              <div className="relative">
                <Loader2 className="animate-spin text-red-600" size={80} strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Activity size={24} className="text-zinc-500" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] font-english text-zinc-400">Synchronizing Nodes</p>
                <div className="flex justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
           </div>
        )}

        {status === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 px-8">
            <div className="bg-zinc-900 w-full max-w-sm p-12 rounded-[4rem] border border-green-500/30 text-center space-y-10 animate-in zoom-in-95 duration-500">
               <div className="w-28 h-28 bg-green-500/10 rounded-[3rem] flex items-center justify-center text-green-500 mx-auto shadow-2xl shadow-green-500/20">
                  <CheckCircle size={64} strokeWidth={1.5} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-white text-4xl font-black font-english uppercase tracking-tightest italic">AUTHENTICATED</h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Network Entry Authorized</p>
               </div>
               <div className="py-5 px-8 bg-zinc-950 rounded-3xl border border-white/5 shadow-inner">
                  <p className="text-green-500 font-english font-black text-sm uppercase tracking-widest">{wifiData?.ssid || 'GOTI_CORE_NODE'}</p>
               </div>
               <button onClick={onClose} className="w-full py-6 bg-white text-zinc-950 rounded-3xl font-black font-english uppercase tracking-widest text-[13px] shadow-xl active:scale-95 transition-all">Establish Link</button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 px-8">
            <div className="bg-zinc-900 w-full max-w-sm p-12 rounded-[4rem] border border-red-500/30 text-center space-y-10 animate-in zoom-in-95">
               <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-600 mx-auto">
                  <AlertCircle size={56} strokeWidth={1.5} />
               </div>
               <div className="space-y-2">
                 <h4 className="text-white font-black font-english uppercase tracking-widest">Connection Failed</h4>
                 <p className="text-zinc-500 font-english text-[10px] leading-relaxed px-4">{errorMessage}</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setMode('select')} className="py-6 bg-zinc-800 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Re-Scan</button>
                  <button onClick={onClose} className="py-6 bg-red-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Dismiss</button>
               </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-130px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(130px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Simple Activity icon replacement since it wasn't imported in QRScanner but used in HUD
const Activity = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default QRScanner;
