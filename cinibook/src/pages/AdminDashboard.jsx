import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import Layout from '../components/Layout';
import { Plus, Film, Building, Monitor, Clock } from 'lucide-react';

const tabs = [
  { key: 'movies', label: 'Movies', icon: Film },
  { key: 'theaters', label: 'Theaters', icon: Building },
  { key: 'screens', label: 'Screens', icon: Monitor },
  { key: 'shows', label: 'Shows', icon: Clock },
];

const formFields = {
  movies: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'genre', label: 'Genre', type: 'text' },
    { name: 'duration', label: 'Duration (min)', type: 'number' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'poster_url', label: 'Poster URL', type: 'text' },
  ],
  theaters: [
    { name: 'name', label: 'Theater Name', type: 'text' },
    { name: 'location', label: 'Location', type: 'text' },
  ],
  screens: [
    { name: 'name', label: 'Screen Name', type: 'text' },
    { name: 'theater_id', label: 'Theater ID', type: 'text' },
    { name: 'capacity', label: 'Capacity', type: 'number' },
  ],
  shows: [
    { name: 'movie_id', label: 'Movie ID', type: 'text' },
    { name: 'screen_id', label: 'Screen ID', type: 'text' },
    { name: 'start_time', label: 'Start Time', type: 'datetime-local' },
    { name: 'price', label: 'Price', type: 'number' },
  ],
};

const apiMap = {
  movies: adminAPI.createMovie,
  theaters: adminAPI.createTheater,
  screens: adminAPI.createScreen,
  shows: adminAPI.createShow,
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('movies');
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await apiMap[activeTab](form);
      setMessage(`${activeTab.slice(0, -1)} created successfully!`);
      setForm({});
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create. Check the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-4xl mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage movies, theaters, screens, and shows</p>

      <div className="flex gap-2 mb-8">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setForm({}); setMessage(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-5">
          <h2 className="text-2xl flex items-center gap-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <Plus className="h-5 w-5 text-primary" />
            Add {activeTab.slice(0, -1)}
          </h2>

          {message && (
            <div className={`text-sm p-3 rounded-lg ${message.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-destructive/10 text-destructive'}`}>
              {message}
            </div>
          )}

          {formFields[activeTab].map(({ name, label, type }) => (
            <div key={name}>
              <label className="text-sm text-muted-foreground mb-2 block">{label}</label>
              {type === 'textarea' ? (
                <textarea
                  name={name}
                  value={form[name] || ''}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                  required
                />
              ) : (
                <input
                  type={type}
                  name={name}
                  value={form[name] || ''}
                  onChange={handleChange}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : `Create ${activeTab.slice(0, -1)}`}
          </button>
        </form>
      </div>
    </Layout>
  );
}
