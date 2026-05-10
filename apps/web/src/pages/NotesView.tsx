import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { FileText, Plus, Trash2, Edit3, ArrowLeft, Calendar, MapPin } from 'lucide-react';

export default function NotesView() {
  const { id: tripId } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dayNumber, setDayNumber] = useState<number | ''>('');

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const tripRes = await apiClient(`/trips/${tripId}`);
      setTrip(tripRes.data);

      const notesRes = await apiClient(`/trips/${tripId}/notes`);
      setNotes(notesRes.data || []);
    } catch (e: any) {
      alert('Failed to load notes: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      const payload = { title, content, dayNumber: dayNumber || null };
      
      if (editingNote?.id) {
        const res = await apiClient(`/trips/${tripId}/notes/${editingNote.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setNotes(notes.map(n => n.id === editingNote.id ? res.data : n));
      } else {
        const res = await apiClient(`/trips/${tripId}/notes`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setNotes([res.data, ...notes]);
      }
      
      setIsEditing(false);
      setEditingNote(null);
    } catch (e: any) {
      alert('Failed to save note');
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await apiClient(`/trips/${tripId}/notes/${noteId}`, { method: 'DELETE' });
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (e) {
      alert('Failed to delete note');
    }
  };

  const startEdit = (note?: any) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.content);
      setDayNumber(note.dayNumber || '');
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
      setDayNumber('');
    }
    setIsEditing(true);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-20">
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Link to={`/trips/${tripId}`} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Itinerary
          </Link>
          <button 
            onClick={() => startEdit()}
            className="inline-flex items-center text-sm font-medium bg-primary text-primary-foreground rounded-md px-4 py-2 shadow-sm hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" /> New Note
          </button>
        </div>

        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-slate-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Trip Journal & Notes</h1>
            <p className="text-slate-500 text-sm">{trip?.title}</p>
          </div>
        </div>

        {/* Editor Modal / Inline */}
        {isEditing && (
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editingNote ? 'Edit Note' : 'Create Note'}</h2>
            <form onSubmit={saveNote} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="note-title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input 
                    id="note-title"
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-input rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Day (Optional)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={dayNumber}
                    onChange={(e) => setDayNumber(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full bg-white border border-input rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="note-content" className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea 
                  id="note-content"
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white border border-input rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.length === 0 && !isEditing ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
              <FileText className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <p>No notes yet.</p>
              <button onClick={() => startEdit()} className="text-primary hover:underline text-sm font-medium mt-2">
                Create your first note
              </button>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col group relative">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <button onClick={() => startEdit(note)} className="p-1.5 text-slate-400 hover:text-primary bg-slate-50 rounded-md">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteNote(note.id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded-md">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="font-bold text-slate-900 pr-16 mb-2">{note.title}</h3>
                
                {note.dayNumber && (
                  <div className="flex items-center text-xs font-medium text-primary mb-3 bg-primary/10 w-fit px-2 py-0.5 rounded-full">
                    <Calendar className="w-3 h-3 mr-1" /> Day {note.dayNumber}
                  </div>
                )}
                
                <p className="text-slate-600 text-sm flex-1 whitespace-pre-wrap line-clamp-4">
                  {note.content}
                </p>
                
                <div className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                  {new Date(note.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
