import React, { useState } from 'react';
import { MarketplaceItem, User } from '../../types';
import { getMarketplaceItems, addMarketplaceItem, reserveMarketplaceItem } from '../../services/storage';
import { Search, Plus, Wrench, ShieldCheck, Tag, Check, AlertCircle, X, ArrowRight } from 'lucide-react';

interface Props {
  currentUser: User;
}

export const Marketplace: React.FC<Props> = ({ currentUser }) => {
  const items = getMarketplaceItems();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');

  const [activeItemDetails, setActiveItemDetails] = useState<MarketplaceItem | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [reserveSuccessMsg, setReserveSuccessMsg] = useState('');

  // Post form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Laptops');
  const [newPrice, setNewPrice] = useState<number>(50);
  const [newCondition, setNewCondition] = useState<'refurbished_grade_a' | 'tested_working' | 'for_parts'>('tested_working');
  const [newDesc, setNewDesc] = useState('');
  const [newSpecs, setNewSpecs] = useState('');
  const [newWarranty, setNewWarranty] = useState<number>(30);
  const [formError, setFormError] = useState('');

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCat === 'All' || item.category === selectedCat;
    const matchesCond = selectedCondition === 'All' || item.condition === selectedCondition;

    return matchesSearch && matchesCat && matchesCond;
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      setFormError('Please provide an item title and description.');
      return;
    }

    addMarketplaceItem({
      title: newTitle.trim(),
      category: newCategory,
      price: newPrice,
      condition: newCondition,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerRole: currentUser.role === 'repair' ? 'Lab Technician' : currentUser.role === 'recycler' ? 'Certified Refurbisher' : 'Verified Student',
      location: currentUser.address.split(',')[0] || 'Campus Quad',
      description: newDesc.trim(),
      specs: newSpecs.split(',').map(s => s.trim()).filter(Boolean),
      warrantyDays: newWarranty
    });

    setPostModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewSpecs('');
  };

  const handleToggleReserve = (itemId: string) => {
    const success = reserveMarketplaceItem(itemId);
    if (success) {
      setReserveSuccessMsg('Item reservation status updated! Contact details shared with seller.');
      setTimeout(() => setReserveSuccessMsg(''), 4000);
      if (activeItemDetails && activeItemDetails.id === itemId) {
        setActiveItemDetails({ ...activeItemDetails, isReserved: !activeItemDetails.isReserved });
      }
    }
  };

  const getConditionBadge = (cond: MarketplaceItem['condition']) => {
    switch (cond) {
      case 'refurbished_grade_a':
        return <span className="text-[#16A36A] font-semibold font-mono text-[11px]">Refurbished Grade A</span>;
      case 'tested_working':
        return <span className="text-[#123D32] font-semibold font-mono text-[11px]">Tested Working</span>;
      case 'for_parts':
        return <span className="text-amber-700 font-semibold font-mono text-[11px]">Spare Parts Only</span>;
    }
  };

  return (
    <section className="py-12 bg-[#F7FAF8] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E1EBE5]">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#16A36A] font-semibold flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5" />
              <span>Circular Hardware Co-Op</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#182B26] mt-1">
              Reuse & Repair Marketplace
            </h1>
            <p className="text-xs text-[#718078] mt-1 max-w-2xl leading-relaxed">
              Find affordable refurbished student laptops, verified memory sticks, and salvage donor parts. Keep functioning electronics circulating in the economy.
            </p>
          </div>

          <button
            onClick={() => setPostModalOpen(true)}
            className="px-4 py-2.5 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List Device or Spare Part</span>
          </button>
        </div>

        {/* Reservation Toast */}
        {reserveSuccessMsg && (
          <div className="mt-4 p-3 bg-[#B9F5D0]/45 border border-[#16A36A]/35 rounded-xl text-[#123D32] font-medium text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-[#16A36A]" />
            <span>{reserveSuccessMsg}</span>
          </div>
        )}

        {/* Search & Filters */}
        <div className="mt-6 p-4 eco-card flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 w-4 h-4 text-[#718078] top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by device model, RAM, screen, seller..."
              className="w-full pl-9 pr-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#718078] font-medium whitespace-nowrap">Category:</span>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Laptops">Laptops</option>
              <option value="Displays">Displays</option>
              <option value="Components">Components & RAM</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#718078] font-medium whitespace-nowrap">Condition:</span>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
            >
              <option value="All">All Conditions</option>
              <option value="refurbished_grade_a">Refurbished Grade A</option>
              <option value="tested_working">Tested Working</option>
              <option value="for_parts">For Parts / Salvage</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`eco-card eco-card-interactive p-6 flex flex-col justify-between ${
                item.isReserved ? 'opacity-65' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E1EBE5] text-xs">
                  {getConditionBadge(item.condition)}
                  <div className="text-base font-bold text-[#123D32] font-mono tabular-nums">
                    ${item.price}
                  </div>
                </div>

                <h2 className="text-base font-bold text-[#182B26] mt-3 line-clamp-1">{item.title}</h2>
                <div className="text-[11px] text-[#718078] font-mono mt-0.5">
                  {item.sellerName} · <span className="text-[#16A36A] font-semibold">{item.sellerRole}</span>
                </div>

                <p className="text-xs text-[#53635B] mt-3 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Specs bullets */}
                <div className="mt-4 space-y-1">
                  {item.specs.slice(0, 3).map((sp, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[#718078] font-mono">
                      <span className="text-[#16A36A] font-bold">·</span>
                      <span className="truncate">{sp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E1EBE5] flex items-center justify-between text-xs">
                <span className="text-[#718078] font-mono tabular-nums">{item.warrantyDays}d warranty</span>
                <button
                  onClick={() => setActiveItemDetails(item)}
                  className="px-3.5 py-1.5 bg-[#F7FAF8] hover:bg-[#123D32] border border-[#DCE6E0] hover:border-[#123D32] text-[#182B26] hover:text-white font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-3.5 bg-white border border-[#DCE6E0] rounded-xl text-center text-xs text-[#718078] font-mono">
          *Campus Co-Op Notice: Direct physical inspections and peer reservation. No mock financial payment gateways simulated.
        </div>

      </div>

      {/* Item Details Modal */}
      {activeItemDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#123D32]/50 backdrop-blur-sm animate-modal-in">
          <div className="w-full max-w-lg bg-white border border-[#DCE6E0] rounded-2xl p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#E1EBE5]">
              <div>
                <span className="text-xs font-mono uppercase text-[#16A36A] font-semibold">{activeItemDetails.category}</span>
                <h3 className="text-lg font-bold text-[#182B26] mt-0.5">{activeItemDetails.title}</h3>
                <div className="text-xs text-[#718078] font-mono mt-0.5">
                  Listed by {activeItemDetails.sellerName} ({activeItemDetails.sellerRole}) · {activeItemDetails.location}
                </div>
              </div>
              <button
                onClick={() => setActiveItemDetails(null)}
                className="p-1 text-[#718078] hover:text-[#182B26] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E1EBE5] font-mono">
              <span className="text-[#718078]">Condition & Testing:</span>
              <span>{getConditionBadge(activeItemDetails.condition)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E1EBE5] font-mono">
              <span className="text-[#718078]">Listed Price:</span>
              <span className="text-xl font-bold text-[#16A36A] tabular-nums">${activeItemDetails.price}</span>
            </div>

            <div>
              <span className="text-[#182B26] font-semibold block mb-1">Hardware Diagnostic Notes:</span>
              <p className="text-[#53635B] leading-relaxed bg-[#F7FAF8] p-3 rounded-xl border border-[#E1EBE5]">
                {activeItemDetails.description}
              </p>
            </div>

            <div>
              <span className="text-[#182B26] font-semibold block mb-1">Verified Specifications:</span>
              <ul className="space-y-1 font-mono text-[11px] text-[#53635B] pl-2">
                {activeItemDetails.specs.map((s, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#16A36A] shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-[#B9F5D0]/30 border border-[#16A36A]/25 rounded-xl text-[11px] text-[#123D32] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16A36A] shrink-0" />
              <span>Includes {activeItemDetails.warrantyDays}-day student diagnostic warranty & return window.</span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setActiveItemDetails(null)}
                className="px-4 py-2 bg-[#F7FAF8] hover:bg-[#E1EBE5] border border-[#DCE6E0] text-[#182B26] rounded-xl font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleToggleReserve(activeItemDetails.id)}
                className={`px-5 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
                  activeItemDetails.isReserved
                    ? 'bg-[#F7FAF8] border border-[#DCE6E0] text-[#718078]'
                    : 'bg-[#16A36A] hover:bg-[#128757] text-white shadow-sm'
                }`}
              >
                {activeItemDetails.isReserved ? 'Reserved (Cancel Reservation)' : 'Reserve for Campus Handover'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Listing Modal */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#123D32]/50 backdrop-blur-sm animate-modal-in">
          <div className="w-full max-w-lg bg-white border border-[#DCE6E0] rounded-2xl p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1EBE5]">
              <h3 className="text-base font-bold text-[#182B26]">Post Circular Listing</h3>
              <button onClick={() => setPostModalOpen(false)} className="p-1 text-[#718078] hover:text-[#182B26] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handlePostSubmit} className="space-y-3">
              <div>
                <label className="block text-[#182B26] font-semibold mb-1">Item Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Dell 24-inch IPS Monitor (1080p)"
                  className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#182B26] font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Displays">Displays</option>
                    <option value="Components">Components & RAM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#182B26] font-semibold mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] font-mono tabular-nums focus:outline-none focus:border-[#16A36A] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#182B26] font-semibold mb-1">Condition</label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
                  >
                    <option value="tested_working">Tested Working</option>
                    <option value="refurbished_grade_a">Refurbished Grade A</option>
                    <option value="for_parts">For Parts / Salvage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#182B26] font-semibold mb-1">Warranty (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={newWarranty}
                    onChange={(e) => setNewWarranty(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] font-mono tabular-nums focus:outline-none focus:border-[#16A36A] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#182B26] font-semibold mb-1">Description & Condition Details</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain operational state, ports tested, and cosmetic condition..."
                  className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[#182B26] font-semibold mb-1">Specifications (comma separated)</label>
                <input
                  type="text"
                  value={newSpecs}
                  onChange={(e) => setNewSpecs(e.target.value)}
                  placeholder="e.g. 16GB DDR4, 3200MHz, Non-ECC, Low Voltage"
                  className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  className="px-4 py-2 bg-[#F7FAF8] hover:bg-[#E1EBE5] border border-[#DCE6E0] text-[#182B26] rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#16A36A] hover:bg-[#128757] text-white font-semibold rounded-xl shadow-sm cursor-pointer"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
