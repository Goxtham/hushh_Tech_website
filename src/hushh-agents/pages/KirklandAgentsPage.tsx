/**
 * Kirkland Agents — Listing Page
 * 
 * Shows Top 10 recommended agents + full searchable list.
 * Data loaded from Supabase kirkland_agents table.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiMapPin, FiPhone, FiStar, FiX, FiFilter } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';

const playfair = { fontFamily: "'Playfair Display', serif" };

// Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://ibsisfnjxeowvdtvgzff.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

/** Agent type matching DB schema */
interface KirklandAgent {
  id: string;
  name: string;
  alias: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  latitude: number | null;
  longitude: number | null;
  avg_rating: number | null;
  review_count: number;
  categories: string[];
  is_closed: boolean;
  photo_url: string | null;
}

/** Star rating display */
const Stars: React.FC<{ rating: number | null }> = ({ rating }) => {
  if (!rating) return <span className="text-xs text-gray-400">No rating</span>;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <FiStar
          key={i}
          className={`w-3.5 h-3.5 ${
            i < full ? 'text-yellow-500 fill-yellow-500' : 
            i === full && half ? 'text-yellow-500 fill-yellow-200' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

/** Category chip */
const CategoryChip: React.FC<{ label: string; active?: boolean; onClick?: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
      active 
        ? 'bg-black text-white' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

/** Agent card */
const AgentCard: React.FC<{ agent: KirklandAgent; featured?: boolean }> = ({ agent, featured }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/hushh-agents/kirkland/${agent.id}`)}
      className={`text-left w-full rounded-2xl border transition-all hover:shadow-md active:scale-[0.98] ${
        featured 
          ? 'border-yellow-200 bg-gradient-to-br from-yellow-50/50 to-white p-5' 
          : 'border-gray-100 bg-white p-4 hover:border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0 ${
          featured ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        }`}>
          {agent.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{agent.name}</h3>
          {agent.city && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <FiMapPin className="w-3 h-3" />
              {agent.city}{agent.state ? `, ${agent.state}` : ''}
            </p>
          )}
        </div>
        {featured && (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-semibold rounded-full">
            TOP
          </span>
        )}
      </div>

      {/* Rating */}
      <div className="mt-3">
        <Stars rating={agent.avg_rating} />
        {agent.review_count > 0 && (
          <span className="text-[10px] text-gray-400 ml-1">({agent.review_count} reviews)</span>
        )}
      </div>

      {/* Categories */}
      {agent.categories?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {agent.categories.slice(0, 3).map((cat) => (
            <span key={cat} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">
              {cat}
            </span>
          ))}
          {agent.categories.length > 3 && (
            <span className="text-[10px] text-gray-400">+{agent.categories.length - 3}</span>
          )}
        </div>
      )}

      {/* Phone */}
      {agent.phone && (
        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <FiPhone className="w-3 h-3" />
          {agent.phone}
        </p>
      )}
    </button>
  );
};

const KirklandAgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<KirklandAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch agents from Supabase
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('kirkland_agents')
        .select('id, name, alias, phone, city, state, zip, latitude, longitude, avg_rating, review_count, categories, is_closed, photo_url')
        .eq('is_closed', false)
        .order('avg_rating', { ascending: false, nullsFirst: false });

      if (!error && data) {
        setAgents(data);
      }
      setIsLoading(false);
    };
    fetchAgents();
  }, []);

  // Get unique categories
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    agents.forEach(a => a.categories?.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [agents]);

  // Top 10 by rating
  const topAgents = useMemo(() => {
    return agents
      .filter(a => a.avg_rating && a.avg_rating > 0 && a.review_count > 0)
      .slice(0, 10);
  }, [agents]);

  // Filtered agents
  const filteredAgents = useMemo(() => {
    let result = agents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q) ||
        a.categories?.some(c => c.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) {
      result = result.filter(a => a.categories?.includes(selectedCategory));
    }
    return result;
  }, [agents, searchQuery, selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <FiMapPin className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400 text-sm">Loading Kirkland agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/hushh-agents"
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900" style={playfair}>
              Kirkland Agents
            </h1>
            <p className="text-xs text-gray-400">{agents.length} agents available</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pb-8">
        {/* Search */}
        <div className="sticky top-[61px] z-10 bg-gray-50 pt-3 pb-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, city, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-10 top-1/2 -translate-y-1/2"
              >
                <FiX className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${selectedCategory ? 'text-blue-500' : 'text-gray-400'}`}
            >
              <FiFilter className="w-4 h-4" />
            </button>
          </div>

          {/* Category filters */}
          {showFilters && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <CategoryChip
                label="All"
                active={!selectedCategory}
                onClick={() => setSelectedCategory(null)}
              />
              {allCategories.slice(0, 20).map((cat) => (
                <CategoryChip
                  key={cat}
                  label={cat}
                  active={selectedCategory === cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Top 10 Recommended */}
        {!searchQuery && !selectedCategory && topAgents.length > 0 && (
          <section className="mt-4 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2" style={playfair}>
              <FiStar className="w-4 h-4 text-yellow-500" />
              Top Recommended
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {topAgents.map((agent) => (
                <div key={agent.id} className="min-w-[260px] max-w-[280px] shrink-0">
                  <AgentCard agent={agent} featured />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Agents */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3" style={playfair}>
            {searchQuery || selectedCategory ? `Results (${filteredAgents.length})` : 'All Agents'}
          </h2>
          
          {filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <FiSearch className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No agents found</p>
              <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default KirklandAgentsPage;
