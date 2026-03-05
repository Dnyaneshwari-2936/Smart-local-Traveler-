import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Wallet, 
  Sparkles, 
  Clock,
  Globe,
  ArrowRight,
  Loader2,
  Coffee,
  History,
  Trees,
  Music,
  Utensils,
  Camera,
  Heart,
  Navigation2,
  Search
} from 'lucide-react';

interface Activity {
  time: string;
  description: string;
  cost: string;
}

interface NearbyPlace {
  name: string;
  description: string;
  image_keyword: string;
}

interface Day {
  day_number: number;
  theme: string;
  activities: Activity[];
  nearby_places: NearbyPlace[];
}

interface Itinerary {
  title: string;
  summary: string;
  days: Day[];
}

const MOODS = [
  { id: 'Cafes', icon: Coffee, label: 'Cafes', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { id: 'Historic', icon: History, label: 'Historic', color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { id: 'Gardens', icon: Trees, label: 'Gardens', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  { id: 'Nightlife', icon: Music, label: 'Nightlife', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
  { id: 'Foodie', icon: Utensils, label: 'Foodie', color: 'bg-rose-100 text-rose-600 border-rose-200' },
  { id: 'Sightseeing', icon: Camera, label: 'Sightseeing', color: 'bg-sky-100 text-sky-600 border-sky-200' },
];

const QUICK_PICKS: Record<string, any[]> = {
  'Cafes': [
    { name: 'Vohuman Cafe', area: 'Camp', desc: 'Famous for Bun Maska and Irani Chai.', img: 'iranian-cafe' },
    { name: 'Cafe Goodluck', area: 'Deccan', desc: 'Iconic spot for Bun Omelette.', img: 'bun-maska' },
    { name: 'Pagdandi', area: 'Baner', desc: 'A cozy book cafe for readers.', img: 'book-cafe' },
  ],
  'Historic': [
    { name: 'Shaniwar Wada', area: 'Shaniwar Peth', desc: 'The seat of the Peshwas.', img: 'fort-pune' },
    { name: 'Aga Khan Palace', area: 'Yerwada', desc: 'A memorial to Mahatma Gandhi.', img: 'palace-pune' },
    { name: 'Pataleshwar Caves', area: 'JM Road', desc: '8th-century rock-cut temple.', img: 'cave-temple' },
  ],
  'Gardens': [
    { name: 'Pu La Deshpande', area: 'Sinhagad Rd', desc: 'Beautiful Japanese garden.', img: 'japanese-garden' },
    { name: 'Empress Garden', area: 'Camp', desc: 'Historic botanical garden.', img: 'botanical-garden' },
    { name: 'Saras Baug', area: 'Swargate', desc: 'Famous Ganpati temple in a lake.', img: 'temple-garden' },
  ],
  'Nightlife': [
    { name: 'High Spirits', area: 'Koregaon Park', desc: 'Iconic gig and party venue.', img: 'nightclub' },
    { name: 'The Daily All Day', area: 'KP', desc: 'Trendy bar with great music.', img: 'bar-pune' },
    { name: 'Effingut', area: 'Baner', desc: 'Local craft brewery and pub.', img: 'brewery' },
  ],
  'Foodie': [
    { name: 'Blue Nile', area: 'Camp', desc: 'Legendary for Mutton Biryani.', img: 'biryani' },
    { name: 'Kayani Bakery', area: 'Camp', desc: 'Famous for Shrewsbury biscuits.', img: 'bakery' },
    { name: 'Bedekar Misal', area: 'Narayan Peth', desc: 'Authentic Puneri Misal.', img: 'misal-pav' },
  ],
  'Sightseeing': [
    { name: 'Sinhagad Fort', area: 'Donje', desc: 'Historic hill fortress.', img: 'hill-fort' },
    { name: 'Parvati Hill', area: 'Parvati', desc: 'Panoramic views of Pune.', img: 'hill-view' },
    { name: 'Raja Kelkar Museum', area: 'Shukrawar Peth', desc: 'Eclectic artifact collection.', img: 'museum' },
  ]
};

export default function App() {
  const [location, setLocation] = useState('Kothrud');
  const [duration, setDuration] = useState(1);
  const [budget, setBudget] = useState('500-1000');
  const [mood, setMood] = useState('Cafes');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'explore' | 'saved'>('explore');

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      const res = await fetch('/api/itineraries');
      const data = await res.json();
      setSavedItineraries(data);
    } catch (e) {
      console.error(e);
    }
  };

  const generateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, duration, budgetLevel: budget, mood, interests }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate itinerary');
      }
      
      setItinerary(data);
      fetchSaved();
    } catch (e: any) {
      alert(e.message || 'Failed to generate itinerary. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="colorful-gradient px-8 py-12 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Navigation2 className="w-8 h-8" />
              <span className="text-3xl font-display font-bold tracking-tight">Pune Explorer</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-extrabold leading-tight">
              Discover the <span className="text-yellow-300">Heart</span> of Pune
            </h1>
            <p className="text-lg opacity-90 font-medium max-w-xl">
              Mood-based local adventures, AI-crafted for you.
            </p>
          </div>

          <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-2xl border border-white/30">
            <button 
              onClick={() => setActiveTab('explore')}
              className={`px-6 py-2 rounded-xl transition-all font-bold ${activeTab === 'explore' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              Explore
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-2 rounded-xl transition-all font-bold ${activeTab === 'saved' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              Saved
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 -mt-10 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'explore' ? (
            <motion.div 
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-12 gap-8"
            >
              {/* Form Section */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card rounded-3xl p-8 space-y-8">
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        Where are you in Pune?
                      </label>
                      <input 
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Kothrud, Baner, Camp..."
                        className="luxury-input"
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-bold text-slate-500">What's your mood?</label>
                      <div className="grid grid-cols-3 gap-3">
                        {MOODS.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMood(m.id)}
                            className={`mood-btn ${mood === m.id ? 'mood-btn-active' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
                          >
                            <m.icon className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          Days
                        </label>
                        <input 
                          type="number"
                          min="1"
                          max="7"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          className="luxury-input"
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-indigo-500" />
                          Budget (₹)
                        </label>
                        <select 
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="luxury-input bg-transparent"
                        >
                          <option value="Free">Free</option>
                          <option value="Under 500">Under 500</option>
                          <option value="500-1000">500 - 1000</option>
                          <option value="1000-2000">1000 - 2000</option>
                          <option value="Luxury">Luxury</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-indigo-500" />
                        Specific Interests
                      </label>
                      <input 
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="e.g. Filter Coffee, Maratha History..."
                        className="luxury-input"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={generateItinerary}
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <span>Find My Vibe</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Result Section */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {itinerary ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8"
                    >
                      <div className="glass-card rounded-3xl p-8 border-l-8 border-indigo-500">
                        <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-widest mb-2">
                          <Sparkles className="w-4 h-4" />
                          AI Recommendations
                        </div>
                        <h2 className="text-4xl font-display font-extrabold text-slate-900 mb-4">{itinerary.title}</h2>
                        <p className="text-slate-600 leading-relaxed text-lg">{itinerary.summary}</p>
                      </div>

                      <div className="space-y-12">
                        {itinerary.days.map((day) => (
                          <div key={day.day_number} className="space-y-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl colorful-gradient flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {day.day_number}
                              </div>
                              <h3 className="text-2xl font-display font-bold text-slate-800">{day.theme}</h3>
                              <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                              {/* Activities */}
                              <div className="space-y-6">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Planned Activities</h4>
                                <div className="space-y-4">
                                  {day.activities.map((act, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-4">
                                      <div className="text-indigo-500 font-bold text-xs pt-1 whitespace-nowrap">{act.time}</div>
                                      <div className="space-y-2">
                                        <p className="text-slate-700 font-medium leading-relaxed">{act.description}</p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                                          <Wallet className="w-3 h-3" />
                                          <span>Est. {act.cost}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Nearby Places */}
                              <div className="space-y-6">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Nearby Gems</h4>
                                <div className="space-y-4">
                                  {day.nearby_places.map((place, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
                                      <div className="h-32 relative overflow-hidden">
                                        <img 
                                          src={`https://picsum.photos/seed/${place.image_keyword}/600/300`} 
                                          alt={place.name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-3 left-4 text-white font-bold">{place.name}</div>
                                      </div>
                                      <div className="p-4">
                                        <p className="text-xs text-slate-500 leading-relaxed">{place.description}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-12">
                      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-slate-100">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                          <Search className="w-10 h-10 text-indigo-300" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">Ready to explore Pune?</h3>
                        <p className="text-slate-500 max-w-md text-sm">
                          Select your location and mood, and we'll craft a vibrant journey just for you.
                        </p>
                      </div>

                      {QUICK_PICKS[mood] && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-display font-bold text-slate-800">Popular {mood} in Pune</h3>
                            <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Quick Picks</div>
                          </div>
                          <div className="grid md:grid-cols-3 gap-6">
                            {QUICK_PICKS[mood].map((pick, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => setInterests(prev => prev ? `${prev}, ${pick.name}` : pick.name)}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-all"
                              >
                                <div className="h-40 relative overflow-hidden">
                                  <img 
                                    src={`https://picsum.photos/seed/${pick.img}/600/400`} 
                                    alt={pick.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                  <div className="absolute bottom-3 left-4 text-white">
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{pick.area}</div>
                                    <div className="font-bold">{pick.name}</div>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <p className="text-xs text-slate-500 leading-relaxed">{pick.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="saved"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <h2 className="text-4xl font-display font-extrabold text-slate-900">Your Saved Journeys</h2>
                  <p className="text-slate-500">Pick up where you left off.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {savedItineraries.map((item) => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setItinerary(item.content);
                      setActiveTab('explore');
                    }}
                  >
                    <div className="h-48 relative">
                      <img 
                        src={`https://picsum.photos/seed/${item.destination}/800/600`} 
                        alt={item.destination}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-6 text-white">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{item.duration} Day Trip</div>
                        <h3 className="text-2xl font-display font-bold">{item.destination}</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {item.budget_level}
                        </span>
                        <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {item.interests || 'General'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{item.content.summary}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-white">
            <Navigation2 className="w-6 h-6" />
            <span className="text-xl font-display font-bold">Pune Explorer</span>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
            © 2025 PUNE EXPLORER • MADE WITH AI
          </div>
        </div>
      </footer>
    </div>
  );
}
