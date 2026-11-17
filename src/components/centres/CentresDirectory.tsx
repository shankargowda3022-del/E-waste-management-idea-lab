import React, { useState } from 'react';
import { CollectionCentre } from '../../types';
import { getCentres } from '../../services/storage';
import { MapPin, Search, Phone, Mail, Clock, ShieldCheck, CheckCircle2, ArrowRight, Filter, Sparkles, Truck } from 'lucide-react';

interface Props {
  onSelectCentreForPickup: (centreId: string) => void;
  onOpenAssistant?: () => void;
  onViewTracking?: (id: string) => void;
  onNavigateHome?: () => void;
}

export const CentresDirectory: React.FC<Props> = ({
  onSelectCentreForPickup,
  onOpenAssistant,
  onViewTracking,
  onNavigateHome
}) => {
  const centres = getCentres();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

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

    const matchesType =
      selectedType === 'All' ||
      c.type === selectedType;

    return matchesSearch && matchesCategory && matchesService && matchesType;
  });

  return (
    <section className="py-12 bg-[#F7FAF8] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#718078] mb-4">
          <button onClick={onNavigateHome} className="hover:text-[#16A36A] cursor-pointer">Home</button>
          <span>/</span>
          <span className="text-[#16A36A] font-semibold">Collection Centres</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E1EBE5]">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#16A36A] font-semibold flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Verified Hardware Depots</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#182B26] mt-1">
              Collection Centre Directory
            </h1>
            <p className="text-xs text-[#718078] mt-1 max-w-2xl leading-relaxed">
              Find solar-powered campus drop-off depots and R2v3-certified industrial smelters. Book direct drop-offs or doorstep routing with zero middleman diversion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenAssistant && (
              <button
                onClick={onOpenAssistant}
                className="px-3.5 py-2 bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B9F5D0]" />
                <span>Ask EcoAI</span>
              </button>
            )}

            {onViewTracking && (
              <button
                onClick={() => onViewTracking('ECY-2026-8941')}
                className="px-3.5 py-2 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] text-[#182B26] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Truck className="w-3.5 h-3.5 text-[#16A36A]" />
                <span>Track Deposit</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-8 p-4 eco-card flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center gap-3 text-xs">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 w-4 h-4 text-[#718078] top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by center name, city, or district..."
              className="w-full pl-9 pr-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[#718078] font-medium whitespace-nowrap">Depot Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
            >
              <option value="All">All Types</option>
              <option value="campus_depot">Campus Kiosks</option>
              <option value="certified_recycler">R2v3 Certified Recyclers</option>
              <option value="repair_hub">Repair Hubs</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[#718078] font-medium whitespace-nowrap">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
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
            <span className="text-[#718078] font-medium whitespace-nowrap">Service:</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
            >
              <option value="All">All Services</option>
              <option value="Doorstep">Free Doorstep Pickup</option>
              <option value="Instant Eco-Points">Instant Eco-Points</option>
              <option value="Data Wiping">Data Wiping Verification</option>
            </select>
          </div>

        </div>

        {/* Interactive Simulated Map Grid Overview */}
        <div className="mt-8 p-6 eco-card overflow-hidden relative">
          <div className="flex items-center justify-between pb-4 border-b border-[#E1EBE5] text-xs font-mono">
            <span className="text-[#123D32] font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#16A36A]" />
              Regional Logistics Map (Campus & Metro Grid)
            </span>
            <span className="text-[#718078]">Low-Emission Clustered Network</span>
          </div>

          {/* Visual Vector Grid Map */}
          <div className="my-4 h-48 bg-[#F7FAF8] rounded-xl border border-[#DCE6E0] relative overflow-hidden flex items-center justify-center p-4">
            {/* Grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#123D3210_1px,transparent_1px),linear-gradient(to_bottom,#123D3210_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Pins on map */}
            <div
              onClick={() => onSelectCentreForPickup('ctr_campus_01')}
              className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#16A36A] border-2 border-white flex items-center justify-center text-white font-bold text-[10px] shadow-md group-hover:scale-125 transition-transform">
                1
              </div>
              <span className="mt-1 px-2 py-0.5 bg-white border border-[#DCE6E0] rounded-md text-[10px] text-[#182B26] font-mono whitespace-nowrap shadow-xs group-hover:border-[#16A36A]">
                North Campus Kiosk (0.4 km) - Click to Book
              </span>
            </div>

            <div
              onClick={() => onSelectCentreForPickup('ctr_metro_02')}
              className="absolute top-1/2 right-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#123D32] border-2 border-white flex items-center justify-center text-[#B9F5D0] font-bold text-[10px] shadow-md group-hover:scale-125 transition-transform">
                2
              </div>
              <span className="mt-1 px-2 py-0.5 bg-white border border-[#DCE6E0] rounded-md text-[10px] text-[#182B26] font-mono whitespace-nowrap shadow-xs group-hover:border-[#16A36A]">
                Apex Recovery Hub (3.2 km) - Click to Book
              </span>
            </div>

            <div
              onClick={() => onSelectCentreForPickup('ctr_repair_03')}
              className="absolute bottom-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#16A36A] border-2 border-white flex items-center justify-center text-white font-bold text-[10px] shadow-md group-hover:scale-125 transition-transform">
                3
              </div>
              <span className="mt-1 px-2 py-0.5 bg-white border border-[#DCE6E0] rounded-md text-[10px] text-[#182B26] font-mono whitespace-nowrap shadow-xs group-hover:border-[#16A36A]">
                MicroFix Lab (1.1 km) - Click to Book
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[#718078] font-mono text-center">
            Locations optimized to minimize student transit distance and group municipal truck pickups. Click any pin to book.
          </div>
        </div>

        {/* Centres Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCentres.map((c) => (
            <div
              key={c.id}
              className="eco-card eco-card-interactive p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E1EBE5]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-[#182B26]">{c.name}</h2>
                      {c.certifiedR2 && (
                        <span className="px-2 py-0.5 bg-[#B9F5D0]/55 border border-[#16A36A]/25 rounded text-[10px] font-mono text-[#123D32] font-bold">
                          R2v3 Certified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#718078] mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#16A36A] shrink-0" />
                      <span>{c.address}, {c.city}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-[#16A36A] font-bold tabular-nums">{c.distanceKm} km</span>
                    <div className="text-[10px] text-[#718078] font-mono">Distance away</div>
                  </div>
                </div>

                {/* Operating hours & Contacts */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#53635B] font-mono">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#16A36A] shrink-0" />
                    <span>{c.openHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#16A36A] shrink-0" />
                    <span className="tabular-nums">{c.phone}</span>
                  </div>
                </div>

                {/* Accepted Categories */}
                <div className="mt-4">
                  <span className="text-[11px] font-mono text-[#718078] uppercase block mb-1.5">Accepted Electronics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.acceptedCategories.map((cat, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#F7FAF8] border border-[#E1EBE5] rounded text-[11px] text-[#182B26] font-mono">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div className="mt-4 pt-4 border-t border-[#E1EBE5]">
                  <div className="flex flex-wrap gap-2 text-xs text-[#123D32] font-mono">
                    {c.services.map((srv, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#16A36A]" />
                        <span>{srv}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-[#E1EBE5] flex items-center justify-between">
                <span className="text-xs text-[#718078]">
                  Rating: <strong className="text-[#182B26] font-mono tabular-nums">{c.rating} / 5.0</strong> ({c.reviewsCount} reviews)
                </span>

                <button
                  onClick={() => onSelectCentreForPickup(c.id)}
                  className="px-4 py-2 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
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
