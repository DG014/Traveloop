import { Search, Filter, ArrowUpDown, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SearchBar() {
  const navigate = useNavigate();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
    }
  };

  return (
    <div className="flex w-full flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 bg-card p-4 rounded-xl shadow-sm border border-border">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input 
          type="search" 
          placeholder="Search destinations, activities, or trips..." 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          onKeyDown={handleSearch}
        />
      </div>
      <div className="flex space-x-2 w-full sm:w-auto">
        <button className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md border border-input bg-background h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
          <LayoutGrid className="mr-2 h-4 w-4" /> Group
        </button>
        <button className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md border border-input bg-background h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </button>
        <button className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md border border-input bg-background h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
          <ArrowUpDown className="mr-2 h-4 w-4" /> Sort
        </button>
      </div>
    </div>
  );
}
