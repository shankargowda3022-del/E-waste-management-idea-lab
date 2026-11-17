import React, { useState, useEffect } from 'react';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_FULL_SQL,
  checkAllSupabaseTables,
  TableStatusReport
} from '../../services/supabase';
import { syncAllLocalRequestsToSupabase, syncRequestsWithSupabase } from '../../services/storage';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  Server,
  Layers,
  ShieldCheck,
  FileCode
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [tablesStatus, setTablesStatus] = useState<Record<string, TableStatusReport>>({});
  const [allReady, setAllReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'sql' | 'credentials'>('tables');

  const checkStatus = async () => {
    setIsChecking(true);
    setSyncResult(null);
    try {
      const status = await checkAllSupabaseTables();
      setTablesStatus(status.tables);
      setAllReady(status.allReady);
    } catch (e: any) {
      console.error('Error checking Supabase tables:', e);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_FULL_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(SUPABASE_ANON_KEY);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    const res = await syncAllLocalRequestsToSupabase();
    if (res.synced > 0) {
      setSyncResult(`Successfully pushed ${res.synced} request(s) directly to Supabase cloud!`);
      checkStatus();
    } else {
      setSyncResult(
        `Table 'recycle_requests' was not found in Supabase yet. Please run the SQL script below in your Supabase SQL Editor first, then click Sync again.`
      );
    }
    setIsSyncing(false);
  };

  const handlePullFromSupabase = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    const res = await syncRequestsWithSupabase();
    if (res.success && res.count > 0) {
      setSyncResult(`Fetched & synced ${res.count} record(s) from Supabase!`);
    } else {
      setSyncResult(`Checked Supabase: 0 new records found or table not yet initialized.`);
    }
    setIsSyncing(false);
  };

  const tableDescriptions: Record<string, string> = {
    profiles: 'Users, roles (Citizen, Campus Admin, Recycler, Super Admin), contact info & eco-points',
    recycle_requests: 'E-Waste submissions, specs, pickup dates, and live chain-of-custody status',
    tracking_events: 'Immutable 7-stage chain of custody events ledger with locations & signatures',
    eco_transactions: 'Eco-points wallet ledger recording all earned points and reward redemptions',
    collection_centres: 'Dynamic drop-off kiosks, campus depots, and certified R2v3 recycler locations',
    marketplace_listings: 'Repaired and refurbished hardware, components, and tested spare parts',
    impact_metrics: 'Platform totals: devices collected, kg processed, GHG avoided, active partners'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 bg-[#123D32]/50 backdrop-blur-sm animate-modal-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto bg-white border border-[#DCE6E0] rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-6 text-[#182B26] flex flex-col max-h-[92vh] box-border min-w-0">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E1EBE5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B9F5D0]/55 border border-[#16A36A]/30 flex items-center justify-center text-[#123D32] shrink-0">
              <Database className="w-5 h-5 text-[#16A36A]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#16A36A] uppercase tracking-wider font-semibold block">
                Backend Cloud Database & Schema Manager
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#182B26] mt-0.5">
                Supabase 7-Table Production Architecture
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#718078] hover:text-[#182B26] rounded-lg hover:bg-[#F7FAF8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="mt-4 p-3.5 bg-[#F7FAF8] border border-[#E1EBE5] rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full shrink-0 ${allReady ? 'bg-[#16A36A]' : 'bg-amber-500'}`} />
            <div>
              <span className="text-xs font-bold text-[#182B26] block">
                {allReady ? 'All 7 Production Tables Active & Verified' : 'Supabase Connected · 1 Table Ready, 6 Pending SQL Migration'}
              </span>
              <span className="text-[11px] text-[#718078] font-mono">
                Project: {SUPABASE_PROJECT_ID} · {SUPABASE_URL}
              </span>
            </div>
          </div>

          <button
            onClick={checkStatus}
            disabled={isChecking}
            className="p-2 bg-white hover:bg-[#F7FAF8] text-[#182B26] rounded-lg border border-[#DCE6E0] transition-colors shrink-0 cursor-pointer"
            title="Refresh Table Health"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mt-4 border-b border-[#E1EBE5] text-xs font-mono">
          <button
            onClick={() => setActiveTab('tables')}
            className={`pb-2.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tables' ? 'text-[#123D32] border-[#16A36A]' : 'text-[#718078] border-transparent hover:text-[#182B26]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>7 Core Tables</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sql' ? 'text-[#123D32] border-[#16A36A]' : 'text-[#718078] border-transparent hover:text-[#182B26]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>1-Click SQL Migration</span>
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-2.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'credentials' ? 'text-[#123D32] border-[#16A36A]' : 'text-[#718078] border-transparent hover:text-[#182B26]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>API Keys & Endpoints</span>
          </button>
        </div>

        {/* Tab 1: Core Tables Status */}
        {activeTab === 'tables' && (
          <div className="overflow-y-auto space-y-3 py-4 flex-1 text-xs">
            <div className="grid grid-cols-1 gap-2.5">
              {Object.keys(tableDescriptions).map((tableName) => {
                const report = tablesStatus[tableName];
                const exists = report?.exists ?? false;

                return (
                  <div
                    key={tableName}
                    className="p-3 bg-[#F7FAF8] border border-[#E1EBE5] rounded-xl flex items-center justify-between gap-3 hover:border-[#16A36A]/40 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[#182B26]">public.{tableName}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          exists ? 'bg-[#B9F5D0]/60 text-[#123D32] border border-[#16A36A]/30' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {exists ? 'Ready & Active' : 'Needs SQL Migration'}
                        </span>
                        {exists && (
                          <span className="text-[10px] font-mono text-[#718078] tabular-nums">
                            ({report?.count ?? 0} rows)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#718078] leading-relaxed">
                        {tableDescriptions[tableName]}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {exists ? (
                        <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {syncResult && (
              <div className="p-3 bg-[#B9F5D0]/30 border border-[#16A36A]/30 rounded-xl text-[#123D32] font-medium text-xs mt-3">
                {syncResult}
              </div>
            )}

            <div className="pt-3 border-t border-[#E1EBE5] flex flex-wrap gap-2">
              <button
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="px-4 py-2 bg-[#123D32] hover:bg-[#0D2E25] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Server className="w-3.5 h-3.5 text-[#B9F5D0]" />
                <span>{isSyncing ? 'Syncing...' : 'Push All Local Records to Supabase'}</span>
              </button>

              <button
                onClick={handlePullFromSupabase}
                disabled={isSyncing}
                className="px-4 py-2 bg-white hover:bg-[#F7FAF8] text-[#182B26] border border-[#DCE6E0] rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#16A36A]" />
                <span>Pull Live Supabase Cloud Records</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: 1-Click SQL Migration */}
        {activeTab === 'sql' && (
          <div className="overflow-y-auto space-y-3 py-4 flex-1 text-xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-[#182B26] text-xs block">
                  Complete 7-Table PostgreSQL Schema
                </span>
                <span className="text-[11px] text-[#718078]">
                  Creates tables, RLS policies, indexes, and initial seed data for immediate use.
                </span>
              </div>

              <button
                onClick={handleCopySql}
                className="px-3.5 py-1.5 bg-[#16A36A] hover:bg-[#128757] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 bg-[#123D32] border border-[#1D5446] rounded-xl font-mono text-[11px] text-[#E6F4EC] overflow-x-auto max-h-56 leading-relaxed selection:bg-[#16A36A]/40">
                {SUPABASE_FULL_SQL}
              </pre>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-[#16A36A] hover:underline font-mono text-xs font-semibold"
              >
                <span>Open Supabase SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/editor`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-[#123D32] hover:underline font-mono text-xs font-semibold"
              >
                <span>View Supabase Table Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Tab 3: Credentials */}
        {activeTab === 'credentials' && (
          <div className="overflow-y-auto space-y-4 py-4 flex-1 text-xs">
            <div className="p-4 bg-[#F7FAF8] border border-[#E1EBE5] rounded-xl space-y-3 font-mono">
              <div className="flex justify-between items-center text-[#718078]">
                <span>Project ID:</span>
                <span className="text-[#16A36A] font-bold">{SUPABASE_PROJECT_ID}</span>
              </div>
              <div className="flex justify-between items-center text-[#718078]">
                <span>REST URL:</span>
                <span className="text-[#182B26]">{SUPABASE_URL}</span>
              </div>
              <div className="flex justify-between items-center text-[#718078]">
                <span>Publishable Anon Key:</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#182B26] truncate max-w-[220px]">
                    {SUPABASE_ANON_KEY.substring(0, 18)}...
                  </span>
                  <button
                    onClick={handleCopyKey}
                    className="p-1 hover:text-[#123D32] text-[#718078] cursor-pointer"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-[#16A36A]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-[#E1EBE5] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#16A36A] hover:bg-[#128757] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
