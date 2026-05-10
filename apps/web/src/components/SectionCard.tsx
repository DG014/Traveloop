import { useState } from 'react';
import { Trash2, MapPin, Calendar, DollarSign, GripVertical } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  cityId?: string;
  cityName?: string;
}

interface SectionCardProps {
  section: Section;
  onUpdate: (id: string, data: Partial<Section>) => void;
  onDelete: (id: string) => void;
  index: number;
}

export function SectionCard({ section, onUpdate, onDelete, index }: SectionCardProps) {
  const [isEditing, setIsEditing] = useState(!section.id || section.id.startsWith('new-'));
  const [formData, setFormData] = useState<Section>(section);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = () => {
    if (isEditing && formData.title && formData.startDate && formData.endDate) {
      onUpdate(section.id, formData);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white p-5 rounded-xl border border-primary ring-1 ring-primary/20 shadow-sm relative pl-10 mb-4 transition-all">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 cursor-grab text-slate-300 hover:text-slate-500">
          <GripVertical className="w-5 h-5" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Section Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              autoFocus
              className="w-full text-lg font-bold bg-transparent border-b border-dashed border-slate-300 focus:border-primary focus:outline-none pb-1 placeholder:font-normal placeholder:text-slate-400"
              placeholder="e.g. 3 Days in Tokyo"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date *</label>
            <div className="relative">
              <Calendar className="absolute left-0 top-1.5 w-4 h-4 text-slate-400" />
              <input
                type="date"
                name="startDate"
                value={formData.startDate.split('T')[0]}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-primary focus:outline-none pb-1 pl-6 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date *</label>
            <div className="relative">
              <Calendar className="absolute left-0 top-1.5 w-4 h-4 text-slate-400" />
              <input
                type="date"
                name="endDate"
                value={formData.endDate.split('T')[0]}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-primary focus:outline-none pb-1 pl-6 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City</label>
            <div className="relative">
              <MapPin className="absolute left-0 top-1.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="cityName"
                value={formData.cityName || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Search city..."
                className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-primary focus:outline-none pb-1 pl-6 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Section Budget</label>
            <div className="relative">
              <DollarSign className="absolute left-0 top-1.5 w-4 h-4 text-slate-400" />
              <input
                type="number"
                name="budget"
                value={formData.budget || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 500"
                className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-primary focus:outline-none pb-1 pl-6 text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-1">
             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
             <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Notes for this section..."
              rows={2}
              className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-primary focus:outline-none pb-1 text-sm resize-none"
             />
          </div>
        </div>

        <button 
          onClick={() => onDelete(section.id)}
          className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition-colors p-1"
          title="Delete Section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className="bg-white p-5 rounded-xl border border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all cursor-pointer relative pl-10 mb-4 group"
      onClick={() => setIsEditing(true)}
    >
      <div className="absolute left-3 top-1/2 -translate-y-1/2 cursor-grab text-slate-200 group-hover:text-slate-400 transition-colors">
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{section.title}</h3>
          </div>
          
          <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-500 ml-9">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
              {new Date(section.startDate).toLocaleDateString()} - {new Date(section.endDate).toLocaleDateString()}
            </div>
            {section.cityName && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                {section.cityName}
              </div>
            )}
            {section.budget !== undefined && section.budget > 0 && (
              <div className="flex items-center font-medium text-slate-700">
                <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                {section.budget}
              </div>
            )}
          </div>
          
          {section.description && (
            <p className="text-sm text-slate-600 mt-3 ml-9 line-clamp-2">{section.description}</p>
          )}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(section.id); }}
          className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100"
          title="Delete Section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
