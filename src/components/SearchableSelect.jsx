import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Check, Wrench, ArrowLeft, ChevronRight } from 'lucide-react';
import { FEATURED_ISSUES, MAINTENANCE_CATEGORIES } from '../utils/constants';

export default function SearchableSelect({ value, onChange, error, placeholder = '-- Select Issue Category --', disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDomain, setActiveDomain] = useState(null); // Step 1: null (Main Categories), Step 2: Selected Category Object
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
    setActiveDomain(null);
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    setActiveDomain(null);
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
      {/* Trigger Button - Wraps text cleanly without cutting off */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`gov-input flex items-center justify-between cursor-pointer py-2.5 px-3 min-h-[48px] h-auto ${
          error ? 'border-danger focus:ring-danger' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white hover:border-gray-400'}`}
      >
        <div className="flex items-start gap-2.5 flex-1 pr-2 min-w-0">
          <Wrench size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <span className={`text-sm leading-snug whitespace-normal break-words text-left ${value ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
            {value || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 self-center">
          {value && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear selection"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[95] left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-[420px] flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header Controls (Search & Back Button) */}
          <div className="p-3 border-b border-gray-100 bg-gray-50 sticky top-0 z-10 space-y-2">
            {/* Step 2 Back Navigation Header */}
            {activeDomain && !searchTerm && (
              <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveDomain(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors py-1 px-2 bg-blue-50 rounded-md"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Main Categories</span>
                </button>
                <span className="text-xs font-bold text-gray-700 truncate max-w-[180px]">
                  {activeDomain.domain}
                </span>
              </div>
            )}

            {/* Search Input Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value) setActiveDomain(null);
                }}
                placeholder="Search issues e.g. bench, light, toilet, tree..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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

          {/* Options Content Area */}
          <div className="overflow-y-auto flex-1 p-2 space-y-3">
            {/* SEARCH ACTIVE: Render matching search items */}
            {searchTerm.trim() ? (
              hasMatches ? (
                filteredCategories.map((cat) => (
                  <div key={cat.domain} className="space-y-1.5">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-2 py-1 bg-gray-50 rounded-lg">
                      {cat.domain}
                    </div>
                    <div className="space-y-1 pl-1">
                      {cat.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleSelect(item)}
                          className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-xl flex items-center justify-between transition-colors whitespace-normal break-words leading-snug ${
                            value === item ? 'bg-primary-light text-primary font-semibold' : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="pr-2">{item}</span>
                          {value === item && <Check size={16} className="text-primary flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 px-4">
                  <p className="text-sm text-gray-500 mb-3">No matching category found for "{searchTerm}"</p>
                  <button
                    type="button"
                    onClick={() => handleSelect('Other')}
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-primary-dark transition-colors"
                  >
                    Select "Other (Describe the Issue)"
                  </button>
                </div>
              )
            ) : activeDomain ? (
              /* STEP 2: Show Sub-Options of Selected Main Domain */
              <div className="space-y-1.5 animate-fade-in">
                <div className="text-xs font-bold text-gray-500 px-2 py-1">
                  Select Specific Issue in <span className="text-gray-800">{activeDomain.domain}</span>:
                </div>
                <div className="space-y-1">
                  {activeDomain.items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`w-full text-left px-3 py-2.5 text-xs sm:text-sm rounded-xl flex items-center justify-between transition-colors whitespace-normal break-words leading-snug ${
                        value === item ? 'bg-primary-light text-primary font-semibold' : 'hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      <span className="pr-2">{item}</span>
                      {value === item && <Check size={16} className="text-primary flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* STEP 1: Show Main Domain Categories + Popular Quick Picks */
              <div className="space-y-4">
                {/* Popular Quick Picks */}
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">
                    ⭐ Popular Quick Options
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {FEATURED_ISSUES.slice(0, 8).map((item) => (
                      <button
                        key={`quick-${item}`}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-xl flex items-center justify-between border border-gray-100 transition-colors whitespace-normal break-words leading-snug ${
                          value === item ? 'bg-primary-light border-blue-200 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="pr-1">{item}</span>
                        {value === item && <Check size={14} className="text-primary flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Domain Categories (Step 1 Selection) */}
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">
                    📁 Browse By Category (Select Main Domain)
                  </div>
                  <div className="space-y-1">
                    {MAINTENANCE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.domain}
                        type="button"
                        onClick={() => setActiveDomain(cat)}
                        className="w-full text-left px-3 py-2.5 text-xs sm:text-sm rounded-xl flex items-center justify-between bg-gray-50/70 hover:bg-blue-50/80 border border-gray-100 hover:border-blue-200 text-gray-800 font-medium transition-all group"
                      >
                        <div className="flex items-center gap-2 pr-2">
                          <span className="leading-snug whitespace-normal break-words">{cat.domain}</span>
                          <span className="text-[10px] text-gray-400 group-hover:text-primary font-normal">
                            ({cat.items.length} options)
                          </span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-primary flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Item */}
          <div className="p-2.5 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
            <span>Issue not listed in categories?</span>
            <button
              type="button"
              onClick={() => handleSelect('Other')}
              className="text-primary font-bold hover:underline"
            >
              Select "Other (Describe)"
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
