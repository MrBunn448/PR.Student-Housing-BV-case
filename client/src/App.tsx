import React, { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, Megaphone, PlusCircle, Filter, Eye, Users } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

// MOCK CONNECTION
const socket = io('http://localhost:3001');
type User = { id: number; name: string };
const CURRENT_USER: User = { id: 1, name: 'Gio' };

type Announcement = {
  id: number;
  titel: string;
  datum: string; // ISO date string
  beschrijving: string;
  student_id?: number;
};

export default function App() {
  const [view, setView] = useState<'home' | 'create'>('home');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filterFuture, setFilterFuture] = useState<boolean>(false);
  const [readersMap, setReadersMap] = useState<Record<number, string[]>>({});

  useEffect(() => {
    fetchAnnouncements();
    socket.on('trigger_light', () => alert("💡 HARDWARE TRIGGER: Light turned ON!"));
    socket.on('trigger_alarm', () => alert("🚨 HARDWARE TRIGGER: Alarm turned ON!"));
    return () => { socket.off('trigger_light'); socket.off('trigger_alarm'); };
  }, [filterFuture]);

  const fetchAnnouncements = async () => {
    try {
        const url = `http://localhost:3001/api/announcements${filterFuture ? '?filter=future' : ''}`;
        const res = await axios.get<Announcement[]>(url);
        setAnnouncements(res.data);
        res.data.forEach((a: Announcement) => fetchReaders(a.id));
    } catch (e) { console.error(e); }
  };

  const fetchReaders = async (id: number) => {
    const res = await axios.get<string[]>(`http://localhost:3001/api/announcements/${id}/readers`);
    setReadersMap(prev => ({ ...prev, [id]: res.data }));
  };

  const handleRead = async (id: number) => {
    await axios.post(`http://localhost:3001/api/announcements/${id}/read`, { student_id: CURRENT_USER.id });
    fetchReaders(id);
  };

  const handleReport = async () => {
    if(confirm("Weet je zeker dat je een ongemeld feestje wilt melden?")) {
        await axios.post('http://localhost:3001/api/reports', { student_id: CURRENT_USER.id });
        alert("Melding verstuurd! Alarm geactiveerd.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    await axios.post('http://localhost:3001/api/announcements', {
        titel: fd.get('titel'), 
        datum: fd.get('datum'), 
        beschrijving: fd.get('beschrijving'), 
        student_id: CURRENT_USER.id
    });
    alert('Feestje aangemaakt!'); 
    setView('home'); 
    fetchAnnouncements();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-[#FDB022] text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users /> Student Housing</h1>
        <div className="bg-white/20 px-3 py-1 rounded-full text-sm">Ingelogd: {CURRENT_USER.name}</div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* ALARM BUTTON */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-red-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Overlast?</h2>
            <p className="text-sm text-gray-500">Meld direct een ongemeld feestje.</p>
          </div>
          <button onClick={handleReport} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg">
            <AlertTriangle /> MELD NU
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setView('home')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === 'home' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>Overzicht</button>
          <button onClick={() => setView('create')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${view === 'create' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}><PlusCircle size={18}/> Nieuw Feestje</button>
        </div>

        {view === 'create' ? (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-[#FDB022]">Nieuw Feestje Aankondigen</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titel</label>
                <input name="titel" required className="w-full p-2 border rounded-lg" placeholder="Bijv. Huisfeestje" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Datum</label>
                <input name="datum" type="datetime-local" required className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Beschrijving</label>
                <textarea name="beschrijving" required className="w-full p-2 border rounded-lg h-24" placeholder="Wat gaan we doen?" />
              </div>
              <button type="submit" className="w-full bg-[#FDB022] text-white py-2 rounded-lg font-bold hover:bg-orange-500">Plaatsen & Lamp Aan</button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Aankondigingen</h2>
                <button onClick={() => setFilterFuture(!filterFuture)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${filterFuture ? 'bg-[#FDB022] text-white' : 'bg-white'}`}>
                    <Filter size={16}/> {filterFuture ? 'Filter: Toekomst' : 'Filter: Alles'}
                </button>
            </div>
            <div className="space-y-4">
                {announcements.map(a => (
                    <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{a.titel}</h3>
                                <p className="text-xs text-gray-500">{new Date(a.datum).toLocaleString()}</p>
                            </div>
                            <Megaphone className="text-[#FDB022]" />
                        </div>
                        <p className="text-gray-700 my-3 bg-gray-50 p-3 rounded text-sm">{a.beschrijving}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t">
                            <div className="flex items-center gap-2"><Eye size={16}/> <span>Gelezen: {readersMap[a.id]?.join(', ') || 'Niemand'}</span></div>
                            {!readersMap[a.id]?.includes(CURRENT_USER.name) && 
                                <button onClick={() => handleRead(a.id)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded font-medium">Markeer als gelezen</button>
                            }
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
