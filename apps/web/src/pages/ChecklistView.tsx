import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { CheckSquare, Square, Trash2, Plus, RefreshCw, Share2, ArrowLeft } from 'lucide-react';

export default function ChecklistView() {
  const { id: tripId } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Misc');

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const tripRes = await apiClient(`/trips/${tripId}`);
      setTrip(tripRes.data);

      const itemsRes = await apiClient(`/trips/${tripId}/checklist`);
      setItems(itemsRes.data || []);
    } catch (e: any) {
      alert('Failed to load checklist: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId: string, isPacked: boolean) => {
    try {
      await apiClient(`/trips/${tripId}/checklist/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPacked: !isPacked }),
      });
      setItems(items.map(item => item.id === itemId ? { ...item, isPacked: !isPacked } : item));
    } catch (e) {
      alert('Failed to update item');
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await apiClient(`/trips/${tripId}/checklist/${itemId}`, { method: 'DELETE' });
      setItems(items.filter(item => item.id !== itemId));
    } catch (e) {
      alert('Failed to delete item');
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    try {
      const res = await apiClient(`/trips/${tripId}/checklist`, {
        method: 'POST',
        body: JSON.stringify({ itemName: newItemName, category: newItemCategory }),
      });
      setItems([...items, res.data]);
      setNewItemName('');
    } catch (e) {
      alert('Failed to add item');
    }
  };

  const resetAll = async () => {
    if (!confirm('Are you sure you want to reset all checked items?')) return;
    try {
      await apiClient(`/trips/${tripId}/checklist/reset`, { method: 'POST' });
      setItems(items.map(item => ({ ...item, isPacked: false })));
    } catch (e) {
      alert('Failed to reset checklist');
    }
  };

  const shareChecklist = () => {
    const text = items.map(i => `[${i.isPacked ? 'x' : ' '}] ${i.itemName} (${i.category})`).join('\n');
    navigator.clipboard.writeText(`Packing List for ${trip?.title || 'Trip'}:\n\n${text}`);
    alert('Checklist copied to clipboard!');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const totalItems = items.length;
  const packedItems = items.filter(i => i.isPacked).length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((packedItems / totalItems) * 100);

  // Group by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-20">
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Link to={`/trips/${tripId}`} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Itinerary
          </Link>
          <div className="flex space-x-3">
            <button onClick={resetAll} className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md px-3 py-1.5 shadow-sm">
              <RefreshCw className="w-4 h-4 mr-2" /> Reset
            </button>
            <button onClick={shareChecklist} className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md px-3 py-1.5 shadow-sm">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Packing Checklist</h1>
          <p className="text-slate-500 text-sm mb-6">{trip?.title} • {totalItems} items total</p>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
              <span>Packing Progress</span>
              <span>{packedItems} / {totalItems} Packed ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          {/* Add Item Form */}
          <form onSubmit={addItem} className="flex gap-3 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <input 
              type="text" 
              placeholder="What to pack?" 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 bg-white border border-input rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
              required
            />
            <select 
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="bg-white border border-input rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="Documents">Documents</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Toiletries">Toiletries</option>
              <option value="Misc">Misc</option>
            </select>
            <button type="submit" className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Add
            </button>
          </form>

          {/* Categories */}
          <div className="space-y-6">
            {Object.keys(groupedItems).sort().map(category => {
              const catItems = groupedItems[category];
              const catPacked = catItems.filter(i => i.isPacked).length;
              return (
                <div key={category} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">{category}</h3>
                    <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{catPacked}/{catItems.length}</span>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {catItems.map(item => (
                      <li key={item.id} className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors ${item.isPacked ? 'opacity-60' : ''}`}>
                        <div 
                          className="flex items-center cursor-pointer flex-1"
                          onClick={() => toggleItem(item.id, item.isPacked)}
                        >
                          {item.isPacked ? (
                            <CheckSquare className="w-5 h-5 text-green-500 mr-3" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 mr-3" />
                          )}
                          <span className={`text-sm ${item.isPacked ? 'line-through text-slate-500' : 'font-medium text-slate-700'}`}>
                            {item.itemName}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
