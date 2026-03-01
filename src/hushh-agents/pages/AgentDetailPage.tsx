/**
 * Agent Detail Page
 * 
 * Shows full agent profile with contact info, location, categories.
 * Tapping from the Kirkland Agents listing leads here.
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiPhone, FiStar, FiExternalLink, FiNavigation, FiTag, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';

const playfair = { fontFamily: "'Playfair Display', serif" };

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://ibsisfnjxeowvdtvgzff.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface AgentFull {
  id: string;
  name: string;
  alias: string | null;
  phone: string | null;
  localized_phone: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  avg_rating: number | null;
  review_count: number;
  categories: string[];
  is_closed: boolean;
  photo_url: string | null;
}

/** Full address string */
const formatAddress = (a: AgentFull): string => {
  const parts = [a.address1, a.address2, a.city, a.state, a.zip].filter(Boolean);
  return parts.join(', ') || 'Address not available';
};

/** Star display */
const Stars: React.FC<{ rating: number | null; size?: string }> = ({ rating, size = 'w-5 h-5' }) => {
  if (!rating) return <span className="text-sm text-gray-400">No rating yet</span>;
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <FiStar
          key={i}
          className={`${size} ${i < full ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`}
        />
      ))}
      <span className="text-lg font-semibold text-gray-900 ml-2">{rating.toFixed(1)}</span>
    </div>
  );
};

/** Info row */
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string; action?: () => void }> = ({ icon, label, value, action }) => (
  <button
    onClick={action}
    disabled={!action}
    className={`flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white w-full text-left ${action ? 'hover:bg-gray-50 active:scale-[0.99] cursor-pointer' : ''} transition-all`}
  >
    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5 break-words">{value}</p>
    </div>
    {action && <FiExternalLink className="w-4 h-4 text-gray-300 shrink-0 mt-1" />}
  </button>
);

const AgentDetailPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<AgentFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('kirkland_agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (!error && data) setAgent(data);
      setIsLoading(false);
    };
    fetchAgent();
  }, [agentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-500 text-lg mb-4">Agent not found</p>
        <Link to="/hushh-agents/kirkland" className="text-blue-500 text-sm underline">
          Back to Agents
        </Link>
      </div>
    );
  }

  const googleMapsUrl = agent.latitude && agent.longitude
    ? `https://www.google.com/maps?q=${agent.latitude},${agent.longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(formatAddress(agent))}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/hushh-agents/kirkland"
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 truncate">{agent.name}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
            {agent.name.charAt(0)}
          </div>

          <h2 className="text-2xl font-semibold text-gray-900" style={playfair}>
            {agent.name}
          </h2>

          {agent.alias && (
            <p className="text-sm text-gray-400 mt-1">@{agent.alias}</p>
          )}

          {/* Status */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {agent.is_closed ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                <FiXCircle className="w-3 h-3" /> Closed
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                <FiCheckCircle className="w-3 h-3" /> Open
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center mt-4">
            <Stars rating={agent.avg_rating} />
            {agent.review_count > 0 && (
              <p className="text-xs text-gray-400 mt-1">{agent.review_count} reviews</p>
            )}
          </div>

          {/* Categories */}
          {agent.categories?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {agent.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1"
                >
                  <FiTag className="w-3 h-3" />
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
            Contact Information
          </h3>

          {agent.phone && (
            <InfoRow
              icon={<FiPhone className="w-5 h-5 text-gray-500" />}
              label="Phone"
              value={agent.phone}
              action={() => window.open(`tel:${agent.phone}`, '_self')}
            />
          )}

          <InfoRow
            icon={<FiMapPin className="w-5 h-5 text-gray-500" />}
            label="Address"
            value={formatAddress(agent)}
            action={() => window.open(googleMapsUrl, '_blank')}
          />

          {agent.latitude && agent.longitude && (
            <InfoRow
              icon={<FiNavigation className="w-5 h-5 text-gray-500" />}
              label="Get Directions"
              value={`${agent.latitude.toFixed(4)}, ${agent.longitude.toFixed(4)}`}
              action={() => window.open(googleMapsUrl, '_blank')}
            />
          )}
        </section>

        {/* Location Map Preview */}
        {agent.latitude && agent.longitude && (
          <section>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
            >
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${agent.latitude},${agent.longitude}&zoom=14&size=600x200&markers=color:red%7C${agent.latitude},${agent.longitude}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`}
                alt={`Map of ${agent.name}`}
                className="w-full h-[160px] object-cover bg-gray-100"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="p-3 bg-white flex items-center justify-between">
                <span className="text-xs text-gray-500">View on Google Maps</span>
                <FiExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </a>
          </section>
        )}

        {/* Quick Actions */}
        <section className="flex gap-3">
          {agent.phone && (
            <a
              href={`tel:${agent.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors"
            >
              <FiPhone className="w-4 h-4" />
              Call Now
            </a>
          )}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <FiNavigation className="w-4 h-4" />
            Directions
          </a>
        </section>
      </div>
    </div>
  );
};

export default AgentDetailPage;
