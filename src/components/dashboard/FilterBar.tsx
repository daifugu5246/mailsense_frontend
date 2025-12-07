import React from 'react';
import { Button } from '../ui/button';
import { RotateCw } from 'lucide-react';
import { CATEGORIES, CATEGORY_MAPPING } from './constants';

interface FilterBarProps {
  filter: string;
  setFilter: (filter: string) => void;
  onFetch: () => void;
  loading: boolean;
  user: any;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  setFilter,
  onFetch,
  loading,
  user
}) => {
  return (
    <section className="col-span-12 flex items-center justify-between mt-4">
      <div className="flex flex-wrap gap-[12px]">
        <button
          onClick={() => setFilter('all')}
          className={`h-[34px] px-[12px] rounded-[6px] border text-[16px] font-medium leading-[22px] transition-colors ${
            filter === 'all'
              ? 'bg-[#ebf6ff] border-[#0767b0] text-[#0767b0]'
              : 'bg-white border-[#bbbbbb] text-[#545454] hover:bg-slate-50'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`h-[34px] px-[12px] rounded-[6px] border text-[16px] font-medium leading-[22px] transition-colors ${
              filter === cat
                ? 'bg-[#ebf6ff] border-[#0767b0] text-[#0767b0]'
                : 'bg-white border-[#bbbbbb] text-[#545454] hover:bg-slate-50'
            }`}
          >
            {CATEGORY_MAPPING[cat] || cat}
          </button>
        ))}
      </div>
      <Button
        onClick={onFetch}
        disabled={loading || !user}
        className={`${!user ? 'opacity-50 cursor-not-allowed' : ''} bg-[#0767B0] hover:bg-[#055a99] text-white gap-2 font-medium transition-all`}
      >
        <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Fetching...' : 'Fetch Mail'}
      </Button>
    </section>
  );
};
