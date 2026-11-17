import React, { useState } from 'react';
import { User } from '../../types';
import { getRewards, getClaimedRewards, claimReward, getChallenges } from '../../services/storage';
import { Award, Gift, Trophy, Users, CheckCircle, Copy, Share2, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  currentUser: User;
  onOpenPickupModal: () => void;
}

export const RewardsCenter: React.FC<Props> = ({ currentUser, onOpenPickupModal }) => {
  const rewards = getRewards();
  const claimedRewards = getClaimedRewards();
  const challenges = getChallenges();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'history' | 'leaderboard' | 'challenges'>('catalog');
  const [claimFeedback, setClaimFeedback] = useState<{ success: boolean; message: string; promoCode?: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  const referralLink = `https://e-cycle-ai.org/join?ref=${currentUser.id.slice(-6)}`;

  const badges = [
    { id: 'b1', name: 'First Spark', desc: 'Completed your first electronic collection', earned: currentUser.devicesRecycled >= 1 },
    { id: 'b2', name: 'Carbon Guardian', desc: 'Diverted over 50kg of lifecycle CO2e emissions', earned: currentUser.carbonSavedKg >= 50 },
    { id: 'b3', name: 'Circular Refurbisher', desc: 'Opted for repair or donation before recycling', earned: true },
    { id: 'b4', name: 'Campus Ambassador', desc: 'Invited peers to zero-waste dorm drives', earned: currentUser.devicesRecycled >= 3 }
  ];

  const leaderboardUsers = [
    { rank: 1, name: 'Priya Sharma', dept: 'Biomedical Engineering', points: 1420, devices: 14 },
    { rank: 2, name: 'Alex Rivera (You)', dept: 'Computer Science & Eng', points: currentUser.ecoPoints, devices: currentUser.devicesRecycled },
    { rank: 3, name: 'Liam O’Connor', dept: 'Materials Science', points: 410, devices: 4 },
    { rank: 4, name: 'Zara Chen', dept: 'Electrical Engineering', points: 340, devices: 3 },
    { rank: 5, name: 'David Miller', dept: 'Environmental Studies', points: 290, devices: 3 }
  ];

  const handleClaim = (rewardId: string) => {
    const result = claimReward(rewardId);
    setClaimFeedback(result);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  return (
    <section className="py-12 bg-[#F7FAF8] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E1EBE5]">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#16A36A] font-semibold flex items-center gap-2">
              <Award className="w-3.5 h-3.5" />
              <span>Gamified Environmental Impact</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#182B26] mt-1">
              Eco-Points & Rewards
            </h1>
            <p className="text-xs text-[#718078] mt-1 max-w-2xl leading-relaxed">
              Earn verified circular credits for every laptop, smartphone, or lithium battery saved from landfills. Redeem for student benefits or real tree planting.
            </p>
          </div>

          {/* User Points Card */}
          <div className="p-4 bg-[#123D32] text-white border border-[#1D5446] rounded-2xl flex items-center gap-4 shadow-sm">
            <div>
              <div className="text-[11px] font-mono text-[#B9F5D0] uppercase">Your Balance</div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {currentUser.ecoPoints} <span className="text-xs font-normal text-[#B9F5D0]">Eco-Points</span>
              </div>
            </div>
            <button
              onClick={onOpenPickupModal}
              className="px-3.5 py-2 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              Earn More
            </button>
          </div>
        </div>

        {/* Claim Feedback Banner */}
        {claimFeedback && (
          <div className={`mt-6 p-4 rounded-xl border flex items-center justify-between gap-4 text-xs ${
            claimFeedback.success
              ? 'bg-[#B9F5D0]/45 border-[#16A36A]/35 text-[#123D32]'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center gap-2 flex-wrap">
              {claimFeedback.success ? <CheckCircle className="w-4 h-4 text-[#16A36A]" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span className="font-medium">{claimFeedback.message}</span>
              {claimFeedback.promoCode && (
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#DCE6E0] text-[#123D32]">
                  Code: {claimFeedback.promoCode}
                </span>
              )}
            </div>
            <button
              onClick={() => setClaimFeedback(null)}
              className="text-xs underline font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Sub-tabs toolbar */}
        <div className="mt-8 flex items-center gap-2 border-b border-[#E1EBE5] pb-3 text-xs font-medium overflow-x-auto scrollbar-none flex-nowrap sm:flex-wrap">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${activeSubTab === 'catalog' ? 'bg-[#123D32] text-white font-semibold' : 'text-[#718078] hover:text-[#182B26] hover:bg-white'}`}
          >
            Redeem Catalog
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${activeSubTab === 'history' ? 'bg-[#123D32] text-white font-semibold' : 'text-[#718078] hover:text-[#182B26] hover:bg-white'}`}
          >
            Claimed Vouchers ({claimedRewards.length})
          </button>
          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${activeSubTab === 'leaderboard' ? 'bg-[#123D32] text-white font-semibold' : 'text-[#718078] hover:text-[#182B26] hover:bg-white'}`}
          >
            Campus Leaderboard
          </button>
          <button
            onClick={() => setActiveSubTab('challenges')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${activeSubTab === 'challenges' ? 'bg-[#123D32] text-white font-semibold' : 'text-[#718078] hover:text-[#182B26] hover:bg-white'}`}
          >
            Community Drives
          </button>
        </div>

        {/* Tab 1: Redeem Catalog */}
        {activeSubTab === 'catalog' && (
          <div className="mt-8 space-y-12">
            
            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rewards.map((r) => {
                const canAfford = currentUser.ecoPoints >= r.pointsCost;
                return (
                  <div
                    key={r.id}
                    className="eco-card eco-card-interactive p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 text-xs font-mono">
                        <span className="text-[#16A36A] font-bold">{r.discountVal}</span>
                        <span className="text-[#718078] tabular-nums">{r.pointsCost} pts</span>
                      </div>

                      <h2 className="text-base font-bold text-[#182B26] mb-1">{r.title}</h2>
                      <div className="text-xs text-[#718078] font-mono mb-3">{r.partner}</div>
                      <p className="text-xs text-[#53635B] leading-relaxed">{r.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E1EBE5] flex items-center justify-between">
                      <span className="text-[11px] text-[#718078] font-mono tabular-nums">{r.claimedCount} claimed</span>
                      <button
                        onClick={() => handleClaim(r.id)}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                          canAfford
                            ? 'bg-[#16A36A] hover:bg-[#128757] text-white shadow-sm cursor-pointer'
                            : 'bg-[#F7FAF8] border border-[#DCE6E0] text-[#718078] cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Redeem Voucher' : 'Need More Pts'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Badges Section */}
            <div>
              <div className="pb-4 border-b border-[#E1EBE5]">
                <h2 className="text-base font-bold text-[#182B26]">Your Achievement Badges</h2>
                <p className="text-xs text-[#718078] mt-0.5">Unlocked through verified hardware handovers</p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                      b.earned
                        ? 'bg-white border-[#16A36A]/35 text-[#182B26] shadow-xs'
                        : 'bg-white/60 border-[#E1EBE5] opacity-60'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${b.earned ? 'bg-[#B9F5D0]/55 text-[#123D32]' : 'bg-[#F7FAF8] text-[#718078]'}`}>
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#182B26]">{b.name}</div>
                      <div className="text-[11px] text-[#718078] mt-0.5">{b.desc}</div>
                      <span className={`text-[10px] font-mono mt-1 block font-semibold ${b.earned ? 'text-[#16A36A]' : 'text-[#718078]'}`}>
                        {b.earned ? '✓ Unlocked' : 'Locked'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Banner */}
            <div className="p-6 eco-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#16A36A] font-semibold">Campus Referral Program</div>
                <h3 className="text-lg font-bold text-[#182B26] mt-1">Invite Friends & Earn 50 Eco-Points</h3>
                <p className="text-xs text-[#718078] mt-1">
                  Share your personalized link. When your roommate or classmate logs their first e-waste pickup, both receive 50 bonus points.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs text-[#182B26] font-mono w-full md:w-64"
                />
                <button
                  onClick={handleCopyReferral}
                  className="px-4 py-2 bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-semibold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#B9F5D0]" />
                  <span>{copiedReferral ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Claimed Vouchers */}
        {activeSubTab === 'history' && (
          <div className="mt-8 space-y-4">
            {claimedRewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claimedRewards.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 eco-card flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-[#182B26]">{c.rewardTitle}</div>
                      <div className="text-xs text-[#718078] font-mono mt-0.5 tabular-nums">
                        Claimed on {c.claimedAt} · Deducted {c.pointsDeducted} pts
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-[#B9F5D0]/50 border border-[#16A36A]/25 rounded-lg text-xs font-mono text-[#123D32] font-bold">
                        {c.promoCode}
                      </div>
                      <button
                        onClick={() => handleCopyCode(c.promoCode)}
                        className="p-2 bg-[#F7FAF8] hover:bg-[#E1EBE5] border border-[#DCE6E0] text-[#182B26] rounded-lg transition-colors cursor-pointer"
                        title="Copy promo code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 eco-card text-center">
                <Gift className="w-8 h-8 text-[#718078] mx-auto mb-2" />
                <h3 className="text-base font-bold text-[#182B26]">No Claimed Vouchers Yet</h3>
                <p className="text-xs text-[#718078] mt-1">
                  Redeem your accumulated Eco-Points in the catalog above to claim campus rewards.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Leaderboard */}
        {activeSubTab === 'leaderboard' && (
          <div className="mt-8 eco-card overflow-hidden">
            <div className="p-4 border-b border-[#E1EBE5] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#182B26]">Campus Circular Leaderboard</h2>
                <div className="text-xs text-[#718078]">Top individual contributors across all departments</div>
              </div>
              <span className="text-xs font-mono text-[#16A36A] font-semibold">November 2026 Season</span>
            </div>

            <div className="divide-y divide-[#E1EBE5] text-xs font-mono">
              {leaderboardUsers.map((u) => (
                <div
                  key={u.rank}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    u.name.includes('(You)') ? 'bg-[#B9F5D0]/30' : 'hover:bg-[#F7FAF8]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-6 font-bold text-center tabular-nums ${u.rank === 1 ? 'text-amber-600 text-sm' : u.rank === 2 ? 'text-[#123D32]' : 'text-[#718078]'}`}>
                      #{u.rank}
                    </span>
                    <div>
                      <div className="font-bold text-[#182B26] font-sans text-xs">{u.name}</div>
                      <div className="text-[11px] text-[#718078]">{u.dept}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-[#182B26] font-semibold tabular-nums">{u.devices} units</div>
                      <div className="text-[10px] text-[#718078]">Recycled</div>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <div className="text-[#16A36A] font-bold tabular-nums">{u.points}</div>
                      <div className="text-[10px] text-[#718078]">Eco-Points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Challenges */}
        {activeSubTab === 'challenges' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((chl) => {
              const progress = Math.min(100, Math.round((chl.currentKg / chl.targetKg) * 100));
              return (
                <div
                  key={chl.id}
                  className="eco-card p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-[#16A36A] font-semibold">{chl.campusName}</span>
                      <span className="text-[#718078] tabular-nums">{chl.daysLeft} days left</span>
                    </div>

                    <h3 className="text-lg font-bold text-[#182B26] mb-1">{chl.title}</h3>
                    <div className="text-xs text-[#718078] font-mono mb-4">Organized by {chl.organizer}</div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[#53635B] tabular-nums">{chl.currentKg} kg collected</span>
                        <span className="text-[#16A36A] font-bold tabular-nums">{progress}% of {chl.targetKg} kg</span>
                      </div>
                      <div className="w-full bg-[#F7FAF8] h-2.5 rounded-full overflow-hidden border border-[#DCE6E0]">
                        <div
                          className="bg-gradient-to-r from-[#123D32] to-[#16A36A] h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E1EBE5] flex items-center justify-between text-xs">
                    <span className="text-[#718078] font-mono tabular-nums">{chl.participantsCount} students participating</span>
                    <button
                      onClick={onOpenPickupModal}
                      className="px-4 py-2 bg-[#16A36A] hover:bg-[#128757] text-white font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Contribute E-Waste
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
