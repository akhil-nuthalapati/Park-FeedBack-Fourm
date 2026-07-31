import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Check, Wrench } from 'lucide-react';
import { FEATURED_ISSUES, MAINTENANCE_CATEGORIES } from '../utils/constants';

export default function SearchableSelect({ value, onChange, error, placeholder = '-- Select Issue Category --', disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (item) => {
    onChange(item);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  // Filter categories based on search term
  const filteredCategories = MAINTENANCE_CATEGORIES.map((cat) => {
    if (!searchTerm.trim()) return cat;
    const term = searchTerm.toLowerCase();
    const domainMatch = cat.domain.toLowerCase().includes(term);
    const matchingItems = cat.items.filter(
      (item) => item.toLowerCase().includes(term) || domainMatch
    );
    return {
      ...cat,
      items: matchingItems,
    };
  }).filter((cat) => cat.items.length > 0);

  const hasMatches = filteredCategories.length > 0;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`gov-input flex items-center justify-between cursor-pointer min-h-[44px] ${
          error ? 'border-danger focus:ring-danger' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white hover:border-gray-400'}`}
      >
        <div className="flex items-center gap-2 overflow-hidden pr-2">
          <Wrench size={18} className="text-primary flex-shrink-0" />
          <span className={`text-sm truncate ${value ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
            {value || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear selection"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[95] left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl max-h-[380px] flex flex-col overflow-hidden animate-fade-in-up">
          {/* Search Bar Header */}
          <div className="p-3 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10 backdrop-blur-xs">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search e.g. bench, light, toilet, tree..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* List Options */}
          <div className="overflow-y-auto flex-1 p-2 space-y-4">
            {/* Display Featured Items when search term is empty */}
            {!searchTerm.trim() && (
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">
                  ⭐ Top Commonly Reported Issues
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {FEATURED_ISSUES.map((item) => (
                    <button
                      key={`featured-${item}`}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg flex items-center justify-between transition-colors ${
                        value === item ? 'bg-primary-light text-primary font-semibold' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>{item}</span>
                      {value === item && <Check size={14} className="text-primary flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categorized Domains List */}
            {hasMatches ? (
              filteredCategories.map((cat) => (
                <div key={cat.domain} className="space-y-1">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-2 py-1 bg-gray-50 rounded">
                    {cat.domain}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-1">
                    {cat.items.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={`w-full text-left px-3 py-1.5 text-xs sm:text-sm rounded-lg flex items-center justify-between transition-colors ${
                          value === item ? 'bg-primary-light text-primary font-semibold' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="truncate">{item}</span>
                        {value === item && <Check size={14} className="text-primary flex-shrink-0 ml-1" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 px-4">
                <p className="text-sm text-gray-500 mb-2">No matching category found for "{searchTerm}"</p>
                <button
                  type="button"
                  onClick={() => handleSelect('Other')}
                  className="btn btn-outline btn-sm text-xs py-1.5 px-4"
                >
                  Select "Other (Describe the Issue)"
                </button>
              </div>
            )}
          </div>

          {/* Footer Item */}
          <div className="p-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
            <span>Can't find your issue?</span>
            <button
              type="button"
              onClick={() => handleSelect('Other')}
              className="text-primary font-semibold hover:underline"
            >
              Select "Other"
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
