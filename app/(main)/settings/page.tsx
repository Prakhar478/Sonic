'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { 
  User, 
  Music2, 
  Volume2, 
  Play, 
  Moon, 
  Bell, 
  Info, 
  Save, 
  Upload,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function SettingsPage() {
  const { user, profile } = useAuthStore();
  
  // State for toggles
  const [equalizerEnabled, setEqualizerEnabled] = useState(false);
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(false);
  const [normalizeVolume, setNormalizeVolume] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [newReleases, setNewReleases] = useState(true);

  // Equalizer frequencies state
  const [eqValues, setEqValues] = useState<{ [key: string]: number }>({
    '32Hz': 0, '64Hz': 0, '125Hz': 0, '250Hz': 0, '500Hz': 0, 
    '1kHz': 0, '4kHz': 0, '8kHz': 0, '16kHz': 0
  });

  // Custom Toggle Component
  const Toggle = ({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!active)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        active ? 'bg-[#2563eb]' : 'bg-[#333333]'
      }`}
    >
      <div
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  const freqBands = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '4kHz', '8kHz', '16kHz'];
  const eqPresets = ['Flat', 'Bass Boost', 'Treble Boost', 'Vocal', 'Electronic', 'Rock', 'Jazz'];

  return (
    <div className="pb-32 pt-8 px-6 max-w-[720px] mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      {/* SECTION 1 — Account */}
      <section className="bg-white/5 rounded-2xl p-6 mb-4">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#2563eb]" /> Account
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-[#52525b]" />
              )}
            </div>
            <button className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition-colors flex items-center gap-2">
              <Upload className="w-3 h-3" /> Change Picture
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#52525b] uppercase tracking-wider">Display Name</label>
              <input 
                type="text" 
                defaultValue={profile?.full_name || ''} 
                className="w-full h-11 bg-[#141414] border border-white/5 rounded-xl px-4 text-sm text-white focus:border-[#2563eb] outline-none transition-colors"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#52525b] uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                readOnly 
                className="w-full h-11 bg-[#141414] border border-white/5 rounded-xl px-4 text-sm text-[#52525b] cursor-not-allowed outline-none"
              />
            </div>
          </div>
          <button className="mt-2 px-6 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </section>

      {/* SECTION 2 — Audio Quality */}
      <section className="bg-white/5 rounded-2xl p-6 mb-4">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Music2 className="w-5 h-5 text-[#2563eb]" /> Audio Quality
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Normal', desc: '128 kbps', premium: false },
            { label: 'High', desc: '256 kbps', premium: false },
            { label: 'Very High', desc: '320 kbps', premium: true },
            { label: 'Lossless', desc: 'Up to 1411 kbps', premium: true },
          ].map((opt, i) => (
            <div 
              key={opt.label}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                i === 1 ? 'bg-[#1a1a1a] border-[#2563eb]/30' : 'bg-[#141414] border-white/5 hover:border-white/20'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-white">{opt.label}</p>
                <p className="text-xs text-[#52525b]">{opt.desc}</p>
              </div>
              <div className="flex items-center gap-3">
                {opt.premium && (
                  <span className="px-2 py-0.5 rounded-full bg-[#2563eb]/10 border border-[#2563eb]/20 text-[#2563eb] text-[10px] font-bold uppercase tracking-wider">
                    Premium
                  </span>
                )}
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  i === 1 ? 'border-[#2563eb]' : 'border-[#333333]'
                }`}>
                  {i === 1 && <div className="w-2 h-2 rounded-full bg-[#2563eb]" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — Equalizer */}
      <section className="bg-white/5 rounded-2xl p-6 mb-4 overflow-hidden relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#2563eb]" /> Equalizer
          </h2>
          <Toggle active={equalizerEnabled} onChange={setEqualizerEnabled} />
        </div>
        
        <div className={`transition-opacity duration-300 ${equalizerEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex flex-wrap gap-2 mb-6">
            {eqPresets.map((preset, i) => (
              <button 
                key={preset}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  i === 0 ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'bg-[#1a1a1a] text-[#a1a1aa] border-white/10 hover:border-white/20'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          
          <div className="flex flex-col gap-1">
            {freqBands.map((hz) => (
              <div key={hz} className="flex items-center gap-4 py-2 hover:bg-white/[0.02] rounded-lg transition-colors px-1">
                <span className="text-[12px] text-[#a1a1aa] w-12 text-right flex-shrink-0 font-medium">
                  {hz}
                </span>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={eqValues[hz]}
                  onChange={(e) => setEqValues(prev => ({ ...prev, [hz]: parseInt(e.target.value) }))}
                  className="flex-1 accent-[#2563eb] h-1 cursor-pointer bg-[#333333] rounded-full appearance-none outline-none"
                  style={{
                    background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(eqValues[hz] + 12) * (100 / 24)}%, #333333 ${(eqValues[hz] + 12) * (100 / 24)}%, #333333 100%)`
                  }}
                />
                <span className="text-[12px] text-[#a1a1aa] w-10 text-left flex-shrink-0 font-medium font-mono">
                  {eqValues[hz] > 0 ? '+' : ''}{eqValues[hz]}dB
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — Playback */}
      <section className="bg-white/5 rounded-2xl p-6 mb-4">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Play className="w-5 h-5 text-[#2563eb]" /> Playback
        </h2>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Crossfade between songs</p>
                <p className="text-xs text-[#52525b]">Smooth transition between tracks</p>
              </div>
              <Toggle active={crossfadeEnabled} onChange={setCrossfadeEnabled} />
            </div>
            {crossfadeEnabled && (
              <div className="px-2">
                <input type="range" min="1" max="12" defaultValue="5" className="w-full accent-[#2563eb]" />
                <div className="flex justify-between mt-1">
                   <span className="text-[10px] text-[#52525b]">1s</span>
                   <span className="text-[10px] text-[#52525b]">12s</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Normalize volume</p>
              <p className="text-xs text-[#52525b]">Set the same volume level for all tracks</p>
            </div>
            <Toggle active={normalizeVolume} onChange={setNormalizeVolume} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Autoplay</p>
              <p className="text-xs text-[#52525b]">Keep the music going when an album ends</p>
            </div>
            <Toggle active={autoplay} onChange={setAutoplay} />
          </div>
        </div>
      </section>

      {/* SECTION 5 — Appearance */}
      <section className="bg-white/5 rounded-2xl p-6 mb-4">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Moon className="w-5 h-5 text-[#2563eb]" /> Appearance
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Theme</p>
              <p className="text-xs text-[#52525b]">Sonic is optimized for dark mode only</p>
            </div>
            <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-full border border-white/5">
              <div className="px-4 py-1 rounded-full bg-[#2563eb] text-white text-xs font-bold flex items-center gap-2">
                 <Moon className="w-3 h-3" /> Dark
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Accent Color</p>
              <p className="text-xs text-[#52525b]">Current brand accent</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#2563eb] border-2 border-white shadow-lg shadow-[#2563eb]/20" />
          </div>
        </div>
      </section>

      {/* SECTION 6 — Notifications */}
      <section className="bg-white/5 rounded-2xl p-6 mb-4">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#2563eb]" /> Notifications
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Now playing notifications</p>
              <p className="text-xs text-[#52525b]">Show desktop alerts when song changes</p>
            </div>
            <Toggle active={notifications} onChange={setNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">New releases</p>
              <p className="text-xs text-[#52525b]">Get notified about new music from artists you like</p>
            </div>
            <Toggle active={newReleases} onChange={setNewReleases} />
          </div>
        </div>
      </section>

      {/* SECTION 7 — About */}
      <section className="bg-white/5 rounded-2xl p-6 mb-4">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#2563eb]" /> About
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-[#a1a1aa]">Version</span>
            <span className="text-sm font-bold text-white">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-[#a1a1aa]">Technologies</span>
            <span className="text-sm text-white">Next.js, Supabase, Tailwind</span>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <a href="#" className="text-sm text-[#a1a1aa] hover:text-[#2563eb] flex items-center justify-between group">
              Privacy Policy <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
            </a>
            <a href="#" className="text-sm text-[#a1a1aa] hover:text-[#2563eb] flex items-center justify-between group">
              Terms of Service <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
            </a>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-[#2563eb]/5 border border-[#2563eb]/10 flex items-center gap-4">
             <ShieldCheck className="w-8 h-8 text-[#2563eb]" />
             <div>
               <p className="text-sm font-semibold text-white">Sonic Secure</p>
               <p className="text-xs text-[#a1a1aa]">Your data is protected by Supabase Encryption</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
