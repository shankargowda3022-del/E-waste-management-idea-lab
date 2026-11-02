import React, { useState } from 'react';
import { CollectionCentre } from '../../types';
import { getCentres } from '../../services/storage';
import { MapPin, Search, Phone, Mail, Clock, ShieldCheck, CheckCircle2, ArrowRight, Filter } from 'lucide-react';

interface Props {
  onSelectCentreForPickup: (centreId: string) => void;
}

export const CentresDirectory: React.FC<Props> = ({ onSelectCentreForPickup }) => {
  const centres = getCentres();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedService, setSelectedService] = useState('All');

  const filteredCentres = centres.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      c.acceptedCategories.some(cat => cat.toLowerCase().includes(selectedCategory.toLowerCase()));

    const matchesService =
      selectedService === 'All' ||
      c.services.some(srv => srv.toLowerCase().includes(selectedService.toLowerCase()));

    return matchesSearch && matchesCategory && matchesService;
  });

  return (
    <section className="py-12 bg-neutral-950 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-800">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Verified Hardware Depots</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-1">
              Collection Centre Directory
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Find solar-powered campus drop-off depots and R2v3-certified industrial smelters. Book direct drop-offs or doorstep routing with zero middleman diversion.
            </p>
          </div>

          <div className="text-xs font-mono text-neutral-500">
            *Demo locations for campus & regional pilot test
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-8 p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-4 text-xs">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 w-4 h-4 text-neutral-500 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by center name, city, or district..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 whitespace-nowrap">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Laptops">Laptops & PCs</option>
              <option value="Batteries">Batteries</option>
              <option value="Displays">Displays & TVs</option>
              <option value="Smartphones">Smartphones</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 whitespace-nowrap">Service:</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Services</option>
              <option value="Doorstep">Free Doorstep Pickup</option>
              <option value="Instant Eco-Points">Instant Eco-Points</option>
              <option value="Data Wiping">Data Wiping Verification</option>
            </select>
          </div>

        </div>

        {/* Interactive Simulated Map Grid Overview */}
        <div className="mt-8 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden relative">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800 text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Regional Logistics Map (Campus & Metro Grid)
            </span>
            <span className="text-neutral-400">Low-Emission Clustered Network</span>
          </div>

          {/* Visual Vector Grid Map */}
          <div className="my-4 h-48 bg-neutral-950 rounded-xl border border-neutral-800/80 relative overflow-hidden flex items-center justify-center p-4">
            {/* Grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Pins on map */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-bold text-[10px] shadow-lg shadow-emerald-950">
                1
              </div>
              <span className="mt-1 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[10px] text-neutral-300 font-mono whitespace-nowrap">
                North Campus Kiosk (0.4 km)
              </span>
            </div>

            <div className="absolute top-1/2 right-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-[10px] shadow-lg shadow-cyan-950">
                2
              </div>
              <span className="mt-1 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[10px] text-neutral-300 font-mono whitespace-nowrap">
                Apex Recovery Hub (3.2 km)
              </span>
            </div>

            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-bold text-[10px]">
                3
              </div>
              <span className="mt-1 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[10px] text-neutral-300 font-mono whitespace-nowrap">
                MicroFix Lab (1.1 km)
              </span>
            </div>
          </div>
          <div className="text-[11px] text-neutral-400 font-mono text-center">
            Locations optimized to minimize student transit distance and group municipal truck pickups.
          </div>
        </div>

        {/* Centres Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCentres.map((c) => (
            <div
              key={c.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">{c.name}</h2>
                      {c.certifiedR2 && (
                        <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800 rounded text-[10px] font-mono text-emerald-400 font-bold">
                          R2v3 Certified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span>{c.address}, {c.city}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-emerald-400 font-bold">{c.distanceKm} km</span>
                    <div className="text-[10px] text-neutral-500 font-mono">Distance away</div>
                  </div>
                </div>

                {/* Operating hours & Contacts */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300 font-mono">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>{c.openHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                </div>

                {/* Accepted Categories */}
                <div className="mt-4">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase block mb-1.5">Accepted Electronics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.acceptedCategories.map((cat, i) => (
                      <span key={i} className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 rounded text-[11px] text-neutral-300 font-mono">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div className="mt-4 pt-4 border-t border-neutral-800/60">
                  <div className="flex flex-wrap gap-2 text-xs text-emerald-400 font-mono">
                    {c.services.map((srv, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{srv}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  Rating: <strong className="text-white font-mono">{c.rating} / 5.0</strong> ({c.reviewsCount} reviews)
                </span>

                <button
                  onClick={() => onSelectCentreForPickup(c.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Book Drop-off Here</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
