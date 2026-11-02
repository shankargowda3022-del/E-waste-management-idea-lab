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
    <section className="py-12 bg-neutral-950 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-800">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Award className="w-3.5 h-3.5" />
              <span>Gamified Environmental Impact</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-1">
              Eco-Points & Rewards
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Earn verified circular credits for every laptop, smartphone, or lithium battery saved from landfills. Redeem for student benefits or real tree planting.
            </p>
          </div>

          {/* User Points Card */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl flex items-center gap-4">
            <div>
              <div className="text-[11px] font-mono text-emerald-300 uppercase">Your Balance</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {currentUser.ecoPoints} <span className="text-xs font-normal text-emerald-300">Eco-Points</span>
              </div>
            </div>
            <button
              onClick={onOpenPickupModal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
            >
              Earn More
            </button>
          </div>
        </div>

        {/* Claim Feedback Banner */}
        {claimFeedback && (
          <div className={`mt-6 p-4 rounded-xl border flex items-center justify-between gap-4 text-xs ${
            claimFeedback.success
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              : 'bg-red-950/40 border-red-800 text-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {claimFeedback.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
              <span>{claimFeedback.message}</span>
              {claimFeedback.promoCode && (
                <span className="font-mono font-bold bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
                  Code: {claimFeedback.promoCode}
                </span>
              )}
            </div>
            <button
              onClick={() => setClaimFeedback(null)}
              className="text-xs underline hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Sub-tabs toolbar */}
        <div className="mt-8 flex items-center gap-2 border-b border-neutral-800 pb-3 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeSubTab === 'catalog' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
          >
            Redeem Catalog
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeSubTab === 'history' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
          >
            Claimed Vouchers ({claimedRewards.length})
          </button>
          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeSubTab === 'leaderboard' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
          >
            Campus Leaderboard
          </button>
          <button
            onClick={() => setActiveSubTab('challenges')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeSubTab === 'challenges' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
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
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between hover:border-neutral-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 text-xs font-mono">
                        <span className="text-emerald-400 font-bold">{r.discountVal}</span>
                        <span className="text-neutral-400">{r.pointsCost} pts</span>
                      </div>

                      <h2 className="text-base font-bold text-white mb-1">{r.title}</h2>
                      <div className="text-xs text-neutral-400 font-mono mb-3">{r.partner}</div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{r.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400 font-mono">{r.claimedCount} claimed</span>
                      <button
                        onClick={() => handleClaim(r.id)}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                          canAfford
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
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
              <div className="pb-4 border-b border-neutral-800">
                <h2 className="text-base font-bold text-white">Your Achievement Badges</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Unlocked through verified hardware handovers</p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                      b.earned
                        ? 'bg-neutral-900 border-emerald-900/60 text-neutral-200'
                        : 'bg-neutral-900/40 border-neutral-800/60 opacity-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${b.earned ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-800 text-neutral-500'}`}>
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">{b.name}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{b.desc}</div>
                      <span className="text-[10px] font-mono mt-1 block text-emerald-400">
                        {b.earned ? '✓ Unlocked' : 'Locked'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Banner */}
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">Campus Referral Program</div>
                <h3 className="text-lg font-bold text-white mt-1">Invite Friends & Earn 50 Eco-Points</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Share your personalized link. When your roommate or classmate logs their first e-waste pickup, both receive 50 bonus points.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 font-mono w-full md:w-64"
                />
                <button
                  onClick={handleCopyReferral}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
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
                    className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{c.rewardTitle}</div>
                      <div className="text-xs text-neutral-400 font-mono mt-0.5">
                        Claimed on {c.claimedAt} · Deducted {c.pointsDeducted} pts
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-emerald-400 font-bold">
                        {c.promoCode}
                      </div>
                      <button
                        onClick={() => handleCopyCode(c.promoCode)}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors"
                        title="Copy promo code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-center">
                <Gift className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                <h3 className="text-base font-bold text-white">No Claimed Vouchers Yet</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Redeem your accumulated Eco-Points in the catalog above to claim campus rewards.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Leaderboard */}
        {activeSubTab === 'leaderboard' && (
          <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Campus Circular Leaderboard</h2>
                <div className="text-xs text-neutral-400">Top individual contributors across all departments</div>
              </div>
              <span className="text-xs font-mono text-emerald-400">November 2026 Season</span>
            </div>

            <div className="divide-y divide-neutral-800/80 text-xs font-mono">
              {leaderboardUsers.map((u) => (
                <div
                  key={u.rank}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    u.name.includes('(You)') ? 'bg-emerald-950/30' : 'hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-6 font-bold text-center ${u.rank === 1 ? 'text-amber-400 text-sm' : u.rank === 2 ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      #{u.rank}
                    </span>
                    <div>
                      <div className="font-bold text-white font-sans text-xs">{u.name}</div>
                      <div className="text-[11px] text-neutral-400">{u.dept}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-neutral-300 tabular-nums">{u.devices} units</div>
                      <div className="text-[10px] text-neutral-500">Recycled</div>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <div className="text-emerald-400 font-bold tabular-nums">{u.points}</div>
                      <div className="text-[10px] text-neutral-500">Eco-Points</div>
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
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-emerald-400 font-semibold">{chl.campusName}</span>
                      <span className="text-neutral-400">{chl.daysLeft} days left</span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">{chl.title}</h3>
                    <div className="text-xs text-neutral-400 font-mono mb-4">Organized by {chl.organizer}</div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-300">{chl.currentKg} kg collected</span>
                        <span className="text-emerald-400 font-bold">{progress}% of {chl.targetKg} kg</span>
                      </div>
                      <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-mono">{chl.participantsCount} students participating</span>
                    <button
                      onClick={onOpenPickupModal}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
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
