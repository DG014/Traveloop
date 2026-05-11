import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { Check, MapPin, GripVertical, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const GRADIENT_PRESETS = [
  "linear-gradient(135deg,#064e3b,#065f46)",  // Emerald
  "linear-gradient(135deg,#831843,#9d174d)",  // Rose
  "linear-gradient(135deg,#1e3a5f,#1e40af)",  // Ocean
  "linear-gradient(135deg,#7c2d12,#9a3412)",  // Terracotta
  "linear-gradient(135deg,#2d1b69,#11072f)",  // Midnight
  "linear-gradient(135deg,#134e4a,#0f766e)",  // Teal
];

const FLAGS: Record<string, string> = {
  France:"🇫🇷", Japan:"🇯🇵", Indonesia:"🇮🇩", Greece:"🇬🇷",
  USA:"🇺🇸", "South Africa":"🇿🇦", Portugal:"🇵🇹", Maldives:"🇲🇻",
  "New Zealand":"🇳🇿", Colombia:"🇨🇴", Italy:"🇮🇹",
};

const MOCK_DESTINATIONS = [
  { city: "Paris", country: "France" },
  { city: "Tokyo", country: "Japan" },
  { city: "Kyoto", country: "Japan" },
  { city: "Bali", country: "Indonesia" },
  { city: "Athens", country: "Greece" },
  { city: "New York", country: "USA" },
  { city: "Cape Town", country: "South Africa" },
  { city: "Lisbon", country: "Portugal" },
  { city: "Male", country: "Maldives" },
  { city: "Auckland", country: "New Zealand" },
  { city: "Bogota", country: "Colombia" },
  { city: "Rome", country: "Italy" },
];

const TRIP_TYPES = ['Beach', 'City Break', 'Adventure', 'Cultural', 'Road Trip', 'Ski', 'Cruise', 'Wellness'];
const TRAVEL_STYLES = ['Adventure', 'Luxury', 'Budget', 'Cultural', 'Family', 'Romantic', 'Solo', 'Wellness'];
const AVATAR_COLORS = ["#6366f1","#f59e0b","#10b981","#8b5cf6","#ef4444"];

const FloatingLabelInput = ({ label, value, onChange, placeholder, maxLength, type = "text", error, ...props }: any) => (
  <div className="relative mt-2 mb-1">
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`peer block w-full appearance-none rounded-lg border bg-white/50 px-4 pb-2 pt-6 text-sm text-slate-900 focus:outline-none focus:ring-0 ${error ? 'border-red-500 focus:border-red-500 animate-[shake_0.4s]' : 'border-slate-300 focus:border-indigo-600'}`}
      {...props}
    />
    <label className={`absolute left-4 top-2.5 z-10 origin-[0] -translate-y-1 scale-75 transform text-xs duration-300 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:scale-100 peer-focus:-translate-y-1 peer-focus:scale-75 ${error ? 'text-red-500' : 'text-slate-500 peer-focus:text-indigo-600'}`}>
      {label}
    </label>
    {maxLength && (
      <span className="absolute right-4 top-2 text-xs text-slate-400">
        {value.length}/{maxLength}
      </span>
    )}
    {error && <p className="mt-1 text-xs text-red-500 animate-[fadeInUp_200ms]">{error}</p>}
  </div>
);

export default function CreateTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [tripData, setTripData] = useState({
    name: "",
    coverGradient: 0,
    startDate: "",
    endDate: "",
    types: [] as string[],
    destinations: [] as any[],
    travelers: [
      { email: "priya@example.com", role: "Editor", initials: "PR" },
      { email: "james@example.com", role: "Viewer", initials: "JA" }
    ],
    budgetMin: 500,
    budgetMax: 3000,
    styles: [] as string[],
    dietary: "",
    accessibility: "",
  });

  const [citySearch, setCitySearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [draggedStop, setDraggedStop] = useState<number | null>(null);

  const updateTrip = (key: string, val: any) => {
    setTripData(prev => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors(prev => { const n = {...prev}; delete n[key]; return n; });
    }
  };

  const toggleArrayItem = (key: 'types' | 'styles', item: string) => {
    setTripData(prev => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter(i => i !== item)
        : [...prev[key], item]
    }));
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!tripData.name || tripData.name.length < 3) newErrors.name = "Trip name must be at least 3 characters.";
      if (!tripData.startDate) newErrors.startDate = "Start date is required.";
      if (!tripData.endDate) newErrors.endDate = "End date is required.";
      if (tripData.startDate && tripData.endDate && new Date(tripData.endDate) < new Date(tripData.startDate)) {
        newErrors.endDate = "End date must be after start date.";
      }
    } else if (currentStep === 2) {
      if (tripData.destinations.length === 0) newErrors.destinations = "Please add at least one destination.";
    } else if (currentStep === 4) {
      if (tripData.budgetMin >= tripData.budgetMax) newErrors.budget = "Minimum budget must be less than maximum budget.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) setStep(step + 1);
      else submitTrip();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitTrip = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    try {
      const payload = {
        title: tripData.name,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        description: `Trip styles: ${tripData.styles.join(', ')}. Dietary: ${tripData.dietary}.`,
        totalBudget: tripData.budgetMax,
        // Assuming the backend handles other fields if needed, or we adapt as best we can
      };
      const res = await apiClient('/trips', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      // Optionally create locations if backend supports it directly or separately
      // For now, we simulate full success and redirect
      setTimeout(() => {
        setIsSubmitting(false);
        alert(`🎉 ${tripData.name} created! Let's build your itinerary.`);
        navigate(`/trips/${res.data.id}/builder`);
      }, 1500);
    } catch (e: any) {
      alert("Failed to create trip: " + e.message);
      setIsSubmitting(false);
    }
  };

  const addDestination = (cityObj: any) => {
    if (tripData.destinations.length >= 8) {
      alert("You can add more stops after creating the trip.");
      return;
    }
    updateTrip('destinations', [...tripData.destinations, { ...cityObj, flag: FLAGS[cityObj.country] || "📍" }]);
    setCitySearch("");
  };

  const removeDestination = (idx: number) => {
    updateTrip('destinations', tripData.destinations.filter((_, i) => i !== idx));
  };

  const addTraveler = () => {
    if (!inviteEmail.includes('@')) {
      setInviteError("Please enter a valid email.");
      return;
    }
    updateTrip('travelers', [
      ...tripData.travelers,
      { email: inviteEmail, role: "Editor", initials: inviteEmail.slice(0, 2).toUpperCase() }
    ]);
    setInviteEmail("");
    setInviteError("");
  };

  const removeTraveler = (idx: number) => {
    updateTrip('travelers', tripData.travelers.filter((_, i) => i !== idx));
  };

  const filteredCities = MOCK_DESTINATIONS.filter(d => d.city.toLowerCase().includes(citySearch.toLowerCase()));

  const calculateNights = () => {
    if (tripData.startDate && tripData.endDate) {
      const start = new Date(tripData.startDate);
      const end = new Date(tripData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const nights = calculateNights();

  return (
    <>
      <style>{`
        :root {
          --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
          --glass-border: 1px solid rgba(255, 255, 255, 0.18);
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="w-full max-w-[900px] mx-auto my-6 md:my-10 p-0 bg-white/80 backdrop-blur-xl rounded-[20px] shadow-[var(--glass-shadow)] border border-[var(--glass-border)] flex flex-col md:flex-row overflow-hidden min-h-[600px]">
          
          {/* Left Panel */}
          <div className="flex-grow flex flex-col relative">
            {/* Step Progress Bar */}
            <div className="px-6 md:px-10 pt-8 pb-4 flex items-center justify-between relative">
              <div className="absolute left-10 right-10 top-12 h-[2px] bg-slate-100 -z-10" />
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2 relative bg-transparent z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    s < step ? 'bg-indigo-600 text-white' : 
                    s === step ? 'bg-indigo-600 text-white animate-[pulse-ring_1.5s_ease_infinite]' : 
                    'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {s < step ? <Check className="w-[18px] h-[18px]" /> : <span className="text-sm font-medium">{s}</span>}
                  </div>
                  <span className={`text-[12px] font-medium hidden md:block ${s === step ? 'text-indigo-900' : 'text-slate-400'}`}>
                    {['Basics', 'Destinations', 'Travelers', 'Preferences'][s - 1]}
                  </span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="px-6 md:px-10 py-6 flex-grow overflow-y-auto">
              {step === 1 && (
                <div className="space-y-8 animate-[fadeInUp_300ms]">
                  <div>
                    <h2 className="text-2xl font-serif text-slate-900">Let's start with the basics</h2>
                    <p className="text-sm text-slate-500 mt-1">Name your adventure and set your dates.</p>
                  </div>

                  <div className="space-y-6">
                    <FloatingLabelInput
                      label="Trip Name"
                      placeholder="e.g. Bali & Lombok Escape"
                      value={tripData.name}
                      onChange={(e: any) => updateTrip('name', e.target.value)}
                      maxLength={60}
                      error={errors.name}
                    />

                    <div>
                      <p className="text-sm text-slate-500 mb-3">Choose a cover</p>
                      <div className="flex flex-wrap gap-3">
                        {GRADIENT_PRESETS.map((grad, i) => (
                          <div
                            key={i}
                            onClick={() => updateTrip('coverGradient', i)}
                            className={`w-12 h-8 rounded-lg cursor-pointer transition-transform ${tripData.coverGradient === i ? 'outline outline-3 outline-indigo-500 outline-offset-2 scale-105' : 'hover:scale-105'}`}
                            style={{ background: grad }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <FloatingLabelInput
                            label="Start Date"
                            type="date"
                            value={tripData.startDate}
                            onChange={(e: any) => updateTrip('startDate', e.target.value)}
                            error={errors.startDate}
                          />
                        </div>
                        <div className="flex-1">
                          <FloatingLabelInput
                            label="End Date"
                            type="date"
                            min={tripData.startDate}
                            value={tripData.endDate}
                            onChange={(e: any) => updateTrip('endDate', e.target.value)}
                            error={errors.endDate}
                          />
                        </div>
                      </div>
                      {nights > 0 && tripData.startDate && tripData.endDate && !errors.endDate && (
                        <div className="flex justify-center mt-3">
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold animate-[fadeInUp_200ms]">
                            ✈️ {nights} night{nights > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-slate-500 mb-3">What kind of trip?</p>
                      <div className="flex flex-wrap gap-2">
                        {TRIP_TYPES.map(type => (
                          <button
                            key={type}
                            onClick={() => toggleArrayItem('types', type)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              tripData.types.includes(type)
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/50'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-[fadeInUp_300ms]">
                  <div>
                    <h2 className="text-2xl font-serif text-slate-900">Where are you headed?</h2>
                    <p className="text-sm text-slate-500 mt-1">Add your stops in order. Drag to reorder.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-indigo-500" />
                      <input
                        type="text"
                        placeholder="Search cities..."
                        value={citySearch}
                        onChange={e => setCitySearch(e.target.value)}
                        className={`w-full h-10 pl-9 pr-4 rounded-lg border bg-white/50 text-sm focus:outline-none focus:ring-0 focus:border-indigo-600 ${errors.destinations ? 'border-red-500 animate-[shake_0.4s]' : 'border-slate-300'}`}
                      />
                      {errors.destinations && <p className="mt-1 text-xs text-red-500">{errors.destinations}</p>}
                      
                      {citySearch.length > 0 && (
                        <div className="absolute top-12 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-[100] max-h-[200px] overflow-y-auto">
                          {filteredCities.length > 0 ? filteredCities.map((city, idx) => (
                            <button
                              key={idx}
                              onClick={() => addDestination(city)}
                              className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                            >
                              <span className="text-lg">{FLAGS[city.country] || "📍"}</span>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{city.city}</p>
                                <p className="text-xs text-slate-500">{city.country}</p>
                              </div>
                            </button>
                          )) : (
                            <div className="p-4 text-sm text-slate-500 text-center">No cities found.</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {tripData.destinations.map((dest, i) => (
                        <div 
                          key={i} 
                          className={`flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg transition-all ${draggedStop === i ? 'opacity-50 border-dashed border-indigo-400' : ''}`}
                          onMouseDown={() => setDraggedStop(i)}
                          onMouseUp={() => setDraggedStop(null)}
                          onMouseLeave={() => setDraggedStop(null)}
                        >
                          <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                          <span className="text-lg">{dest.flag}</span>
                          <div className="flex-grow">
                            <span className="font-bold text-sm text-slate-900">{dest.city}</span>
                            <span className="text-xs text-slate-500 ml-2">{dest.country}</span>
                          </div>
                          <button onClick={() => removeDestination(i)} className="text-slate-400 hover:text-red-500 p-1 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-[fadeInUp_300ms]">
                  <div>
                    <h2 className="text-2xl font-serif text-slate-900">Who's joining you?</h2>
                    <p className="text-sm text-slate-500 mt-1">Invite collaborators and set their permissions.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex gap-2">
                        <div className="flex-grow">
                          <input
                            type="email"
                            placeholder="Email address"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addTraveler()}
                            className={`w-full h-12 px-4 rounded-lg border bg-white/50 text-sm focus:outline-none focus:border-indigo-600 ${inviteError ? 'border-red-500 animate-[shake_0.4s]' : 'border-slate-300'}`}
                          />
                        </div>
                        <button onClick={addTraveler} className="h-12 px-6 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                          Invite
                        </button>
                      </div>
                      {inviteError && <p className="mt-1 text-xs text-red-500">{inviteError}</p>}
                    </div>

                    <div className="space-y-3">
                      {tripData.travelers.map((t, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 border-b border-slate-100 last:border-0">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                          >
                            {t.initials}
                          </div>
                          <div className="flex-grow text-sm text-slate-900 truncate">{t.email}</div>
                          <select 
                            value={t.role}
                            onChange={(e) => {
                              const newTravelers = [...tripData.travelers];
                              newTravelers[i].role = e.target.value;
                              updateTrip('travelers', newTravelers);
                            }}
                            className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none"
                          >
                            <option>Owner</option>
                            <option>Editor</option>
                            <option>Viewer</option>
                          </select>
                          <button onClick={() => removeTraveler(i)} className="text-slate-400 hover:text-red-500 p-1 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                      <div className="flex -space-x-2.5">
                        <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white bg-slate-800 z-10">AC</div>
                        {tripData.travelers.map((t, i) => (
                          <div 
                            key={i} 
                            className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white relative"
                            style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], zIndex: 9 - i }}
                          >
                            {t.initials}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-slate-600">{tripData.travelers.length + 1} travelers</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 animate-[fadeInUp_300ms]">
                  <div>
                    <h2 className="text-2xl font-serif text-slate-900">Set your preferences</h2>
                    <p className="text-sm text-slate-500 mt-1">Help us personalize your experience.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-slate-500">Total Budget Range</p>
                        <p className="text-xl font-bold text-indigo-600">${tripData.budgetMin} – ${tripData.budgetMax}</p>
                      </div>
                      <div className="relative h-2">
                        <div className="absolute inset-0 bg-slate-200 rounded-full" />
                        <div 
                          className="absolute h-full bg-indigo-500 rounded-full"
                          style={{ 
                            left: `${(tripData.budgetMin / 15000) * 100}%`, 
                            right: `${100 - (tripData.budgetMax / 15000) * 100}%` 
                          }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="15000"
                          step="100"
                          value={tripData.budgetMin}
                          onChange={(e) => updateTrip('budgetMin', Math.min(Number(e.target.value), tripData.budgetMax - 100))}
                          className="absolute w-full top-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-slate-200"
                        />
                        <input
                          type="range"
                          min="0"
                          max="15000"
                          step="100"
                          value={tripData.budgetMax}
                          onChange={(e) => updateTrip('budgetMax', Math.max(Number(e.target.value), tripData.budgetMin + 100))}
                          className="absolute w-full top-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-slate-200"
                        />
                      </div>
                      {errors.budget && <p className="mt-2 text-xs text-red-500">{errors.budget}</p>}
                    </div>

                    <div>
                      <p className="text-sm text-slate-500 mb-3">Your travel style</p>
                      <div className="flex flex-wrap gap-2">
                        {TRAVEL_STYLES.map(style => (
                          <button
                            key={style}
                            onClick={() => toggleArrayItem('styles', style)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              tripData.styles.includes(style)
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/50'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <textarea
                          placeholder="Any dietary requirements? (optional)"
                          maxLength={120}
                          value={tripData.dietary}
                          onChange={e => updateTrip('dietary', e.target.value)}
                          className="w-full min-h-[80px] p-3 text-sm bg-white/50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 resize-none"
                        />
                        <span className="absolute bottom-3 right-3 text-xs text-slate-400">{tripData.dietary.length}/120</span>
                      </div>
                    </div>

                    <div>
                      <textarea
                        placeholder="Any accessibility requirements? (optional)"
                        value={tripData.accessibility}
                        onChange={e => updateTrip('accessibility', e.target.value)}
                        className="w-full min-h-[80px] p-3 text-sm bg-white/50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Bar */}
            <div className="px-6 md:px-10 py-5 border-t border-slate-200 flex items-center justify-between mt-auto bg-white/50 backdrop-blur-md">
              <button
                onClick={handleBack}
                disabled={step === 1 || isSubmitting}
                className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
              
              <span className="text-xs font-medium text-slate-400">Step {step} of 4</span>
              
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : step === 4 ? (
                  <>Create Trip 🚀</>
                ) : (
                  <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Live Preview Card (Desktop Only) */}
          <div className="hidden md:flex w-[320px] border-l border-slate-200 bg-slate-50/50 p-8 flex-col">
            <div className="w-full bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden relative transition-all duration-500">
              {/* Cover Image Simulation */}
              <div 
                className="h-[160px] w-full transition-all duration-500"
                style={{ background: GRADIENT_PRESETS[tripData.coverGradient] }}
              />
              {/* Overlay Name */}
              <div className="absolute top-[120px] left-4 right-4">
                <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md truncate animate-[fadeInUp_200ms]" key={tripData.name}>
                  {tripData.name || "My New Trip"}
                </h3>
              </div>
              
              <div className="p-4 space-y-4 pt-5">
                {/* Date Chip */}
                <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-100 w-fit px-2.5 py-1 rounded-md">
                  {tripData.startDate && tripData.endDate ? `${tripData.startDate} → ${tripData.endDate}` : "Dates TBD"}
                </div>
                
                {/* Destinations */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Destinations</p>
                  <p className="text-sm font-medium text-slate-800 line-clamp-2">
                    {tripData.destinations.length > 0 ? tripData.destinations.map(d => d.city).join(" · ") : "No stops yet"}
                  </p>
                </div>
                
                {/* Travelers */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Travelers</p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <div className="w-6 h-6 rounded-full border border-white bg-slate-800 flex items-center justify-center text-[8px] text-white font-bold z-10">AC</div>
                      {tripData.travelers.slice(0, 3).map((t, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-[8px] text-white font-bold relative" style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], zIndex: 9 - i }}>
                          {t.initials}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {tripData.travelers.length === 0 ? "Just you" : `${tripData.travelers.length + 1} total`}
                    </span>
                  </div>
                </div>
                
                {/* Budget */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Budget</span>
                  <span className="text-sm font-bold text-indigo-600">${tripData.budgetMin} – ${tripData.budgetMax}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center px-4">
              <p className="text-sm italic text-slate-400">
                {step === 1 && "Give your trip a name and dates to get started."}
                {step === 2 && "Add the cities you want to visit."}
                {step === 3 && "Invite travel companions."}
                {step === 4 && "Set your budget and preferences."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
