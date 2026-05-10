interface Note {
  id: string;
  title?: string;
  content: string;
  dayNumber?: number;
  createdAt: string;
  updatedAt: string;
}

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const preview = note.content.length > 120 ? note.content.slice(0, 120) + '…' : note.content;
  const date = new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {note.title ? (
            <h4 className="font-semibold text-slate-900 text-sm truncate">{note.title}</h4>
          ) : (
            <h4 className="font-medium text-slate-400 text-sm italic">Untitled note</h4>
          )}
          {note.dayNumber && (
            <span className="text-xs text-blue-600 font-medium">Day {note.dayNumber}</span>
          )}
        </div>
        <span className="text-xs text-slate-400 shrink-0">{date}</span>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed mb-3">{preview}</p>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={() => onEdit(note)}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(note.id)}
            className="px-3 py-1 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            aria-label={`Delete note ${note.title || 'untitled'}`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
