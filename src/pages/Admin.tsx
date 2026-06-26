import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useParts } from '../hooks/useParts';
import { useVariants } from '../hooks/useVariants';
import type { Part, PartVariant } from '../types/Part';
import { useAuth } from '@/hooks/useAuth';
import HGregLogo from '../components/HGregLogo';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  ArrowLeft,
  LogOut,
  ChevronDown,
  Filter,
  AlertTriangle,
  Users,
  UserPlus,
  Mail,
  Send,
  Store,
  PackageCheck,
  Truck,
  RefreshCw,
  Link2,
  ExternalLink,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

export default function Admin() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, logout, userName, isAdmin } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] bg-obsidian flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-obsidian flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] bg-ink rounded-xl border border-white/[0.08] p-8 text-center">
          <HGregLogo className="items-center" />
          <h2 className="text-lg text-steel mt-3 mb-6">Admin Panel</h2>
          <p className="text-sm text-steel mb-6">
            Please login with your HGreg Trucks account to access the admin panel.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-amber text-obsidian rounded-lg py-3 text-sm font-semibold tracking-[0.04em] uppercase hover:bg-chrome transition-colors"
          >
            GO TO LOGIN
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-3 border border-white/[0.12] text-steel rounded-lg py-3 text-sm hover:border-white/30 hover:text-chrome transition-all"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard onLogout={logout} userName={userName || 'Admin'} isAdmin={isAdmin} />;
}

function Dashboard({ onLogout, userName, isAdmin }: { onLogout: () => void; userName: string; isAdmin: boolean }) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'users' | 'messages' | 'fullbay'>('inventory');
  const {
    parts,
    filtered,
    loading,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filterMake,
    setFilterMake,
    categories,
    makes,
    deletePart,
    seedParts,
  } = useParts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const stats = {
    total: parts.length,
    lowStock: parts.filter((p: any) => p.stock < 5).length,
    totalValue: parts.reduce((sum: number, p: any) => sum + parseFloat(p.price) * p.stock, 0),
    categories: categories.length,
  };

  const handleDelete = (id: number) => {
    deletePart(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-[100dvh] bg-obsidian">
      <nav className="w-full h-16 bg-ink/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <a href="/" className="text-chrome hover:text-amber transition-colors">
            <ArrowLeft size={20} />
          </a>
          <HGregLogo />
          <span className="text-xs tracking-[0.1em] uppercase text-steel border-l border-white/[0.12] pl-4">
            Welcome, {userName}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-steel hover:text-warning transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </nav>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Parts" value={stats.total.toString()} />
          <StatCard label="Low Stock" value={stats.lowStock.toString()} />
          <StatCard label="Inventory Value" value={`$${stats.totalValue.toLocaleString()}`} />
          <StatCard label="Categories" value={stats.categories.toString()} />
        </div>

        {/* Tabs - visible to admin and manager */}
        <div className="flex items-center gap-1 mb-6 border-b border-white/[0.06]">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-3 text-sm font-medium tracking-[0.04em] uppercase transition-colors border-b-2 ${
              activeTab === 'inventory'
                ? 'text-amber border-amber'
                : 'text-steel border-transparent hover:text-chrome'
            }`}
          >
            <span className="flex items-center gap-2"><Package size={16} /> Inventory</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-5 py-3 text-sm font-medium tracking-[0.04em] uppercase transition-colors border-b-2 ${
              activeTab === 'messages'
                ? 'text-amber border-amber'
                : 'text-steel border-transparent hover:text-chrome'
            }`}
          >
            <span className="flex items-center gap-2"><Mail size={16} /> Messages</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-5 py-3 text-sm font-medium tracking-[0.04em] uppercase transition-colors border-b-2 ${
                activeTab === 'users'
                  ? 'text-amber border-amber'
                  : 'text-steel border-transparent hover:text-chrome'
              }`}
            >
              <span className="flex items-center gap-2"><Users size={16} /> Users</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('fullbay')}
            className={`px-5 py-3 text-sm font-medium tracking-[0.04em] uppercase transition-colors border-b-2 ${
              activeTab === 'fullbay'
                ? 'text-amber border-amber'
                : 'text-steel border-transparent hover:text-chrome'
            }`}
          >
            <span className="flex items-center gap-2"><Link2 size={16} /> Fullbay</span>
          </button>
        </div>

        {activeTab === 'users' && isAdmin ? (
          <UserManagement />
        ) : activeTab === 'messages' ? (
          <MessageManagement />
        ) : activeTab === 'fullbay' ? (
          <FullbaySyncPanel />
        ) : (
          <>
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, SKU, OEM..."
                className="bg-ink border border-white/[0.12] rounded-lg pl-10 pr-4 py-2.5 text-sm text-chrome w-[280px] focus:border-amber focus:outline-none"
              />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-ink border border-white/[0.12] rounded-lg pl-9 pr-8 py-2.5 text-sm text-chrome appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel pointer-events-none" />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <select
                value={filterMake}
                onChange={(e) => setFilterMake(e.target.value)}
                className="bg-ink border border-white/[0.12] rounded-lg pl-9 pr-8 py-2.5 text-sm text-chrome appearance-none"
              >
                <option value="">All Makes</option>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel pointer-events-none" />
            </div>
            {(searchTerm || filterCategory || filterMake) && (
              <button onClick={() => { setSearchTerm(''); setFilterCategory(''); setFilterMake(''); }} className="text-xs text-steel hover:text-chrome underline">Clear</button>
            )}
          </div>
          <div className="flex gap-3">
            {parts.length === 0 && (
              <button
                onClick={() => seedParts()}
                className="flex items-center gap-2 bg-teal/20 text-teal rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-teal/30 transition-colors"
              >
                <Plus size={16} />
                Seed Demo Parts
              </button>
            )}
            <button
              onClick={() => { setEditingPart(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-amber text-obsidian rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-chrome transition-colors"
            >
              <Plus size={16} />
              Add Part
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-ink rounded-xl border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase text-steel">Image</th>
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase text-steel">Name / SKU</th>
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase text-steel">OEM</th>
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase text-steel">Brand</th>
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase text-steel">Category</th>
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase text-steel">Make/Model</th>
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase text-steel">Price</th>
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase text-steel">Stock</th>
                  <th className="px-4 py-3 text-xs tracking-[0.1em] uppercase text-steel text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((part: any) => (
                  <tr key={part.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 relative">
                      <img
                        src={part.image || '/no-photo.png'}
                        alt={part.name}
                        className={`w-12 h-12 rounded object-cover ${part.image === '/no-photo.png' || !part.image ? 'opacity-60' : ''}`}
                      />
                      {(part.image === '/no-photo.png' || !part.image) && (
                        <span className="absolute -top-1 -right-1 bg-warning text-obsidian text-[8px] font-bold px-1 py-0.5 rounded">!</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-chrome">{part.name}</p>
                      <p className="text-xs text-steel mt-0.5">{part.sku}</p>
                      {part.source === 'fullbay' && (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-teal/10 text-teal border border-teal/20">Fullbay</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-steel font-mono">{part.oemNumber}</td>
                    <td className="px-4 py-3 text-sm text-steel">{part.brand}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded bg-amber/10 text-amber">{part.category}</span></td>
                    <td className="px-4 py-3 text-sm text-chrome">{part.make} {part.model}</td>
                    <td className="px-4 py-3 text-sm font-medium text-amber">${part.price}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${part.stock > 10 ? 'bg-teal/10 text-teal' : part.stock > 5 ? 'bg-amber/10 text-amber' : 'bg-warning/10 text-warning'}`}>{part.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditingPart(part as Part); setIsModalOpen(true); }} className="p-2 rounded-lg text-steel hover:text-amber hover:bg-amber/10 transition-all" title="Edit"><Pencil size={16} /></button>
                        <button onClick={() => setDeleteConfirm(part.id)} className="p-2 rounded-lg text-steel hover:text-warning hover:bg-warning/10 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-steel">
                      <Package size={48} className="mx-auto mb-3 text-steel/30" />
                      <p className="text-sm">No parts found. Click "Seed Demo Parts" to add sample data.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Add/Edit Part Modal */}
      {isModalOpen && (
        <PartModal
          part={editingPart}
          onClose={() => { setIsModalOpen(false); setEditingPart(null); }}
          onSave={() => { setIsModalOpen(false); setEditingPart(null); }}
        />
      )}

      {/* Delete Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-ink rounded-xl border border-white/[0.08] p-6 max-w-[400px] w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center"><AlertTriangle size={20} className="text-warning" /></div>
              <h3 className="text-lg font-medium text-chrome">Confirm Deletion</h3>
            </div>
            <p className="text-sm text-steel mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 text-sm text-steel border border-white/[0.12] rounded-lg hover:border-white/30">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-5 py-2.5 text-sm bg-warning text-white rounded-lg hover:bg-warning/80">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FullbaySyncPanel() {
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const pingQuery = trpc.fullbay.ping.useQuery();
  const syncMutation = trpc.fullbay.syncInventory.useMutation({
    onSuccess: (data) => {
      setSyncResult(`Created: ${data.created} | Updated: ${data.updated} | Skipped: ${data.skipped} | Errors: ${data.errors}`);
      setSyncing(false);
    },
    onError: (err) => {
      setSyncResult(`Error: ${err.message}`);
      setSyncing(false);
    },
  });

  const handleSync = () => {
    setSyncing(true);
    setSyncResult(null);
    syncMutation.mutate({ daysBack: 30 });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-ink rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-lg font-medium text-chrome mb-4 flex items-center gap-2">
          <Link2 size={20} className="text-amber" />
          Fullbay Connection
        </h3>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${pingQuery.data?.connected ? 'bg-teal' : 'bg-warning'} animate-pulse`} />
          <span className="text-sm text-chrome">
            {pingQuery.isLoading ? 'Checking...' : pingQuery.data?.message ?? 'Unknown'}
          </span>
        </div>
        {!pingQuery.data?.connected && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-warning flex items-center gap-2">
              <AlertTriangle size={16} />
              Fullbay is not connected.
            </p>
            <p className="text-xs text-steel mt-2">
              Add this environment variable in Railway:
            </p>
            <code className="block text-xs bg-obsidian rounded px-3 py-2 mt-1 text-chrome font-mono">
              FULLBAY_API_KEY=88816fee-5d15-e4ee-ab41-a3020a6c742c
            </code>
          </div>
        )}
      </div>

      {/* Sync Actions */}
      <div className="bg-ink rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-lg font-medium text-chrome mb-4 flex items-center gap-2">
          <RefreshCw size={20} className="text-amber" />
          Inventory Sync
        </h3>
        <p className="text-sm text-steel mb-4">
          Pull the latest inventory adjustments from Fullbay to update stock levels in this system.
          Only parts with matching SKUs will be updated.
        </p>
        <button
          onClick={handleSync}
          disabled={syncing || !pingQuery.data?.connected}
          className="bg-amber text-obsidian rounded-lg px-6 py-3 text-sm font-semibold tracking-[0.04em] uppercase hover:bg-chrome transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
        {syncResult && (
          <p className="text-sm text-teal mt-3 bg-teal/10 rounded-lg px-4 py-2">{syncResult}</p>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-ink rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-lg font-medium text-chrome mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-steel">
          <div className="space-y-2">
            <p className="text-chrome font-medium flex items-center gap-2">
              <Truck size={16} className="text-teal" />
              Fullbay → Website
            </p>
            <p>Stock levels are pulled from Fullbay adjustments. When inventory changes in Fullbay, click "Sync Now" to update this system.</p>
          </div>
          <div className="space-y-2">
            <p className="text-chrome font-medium flex items-center gap-2">
              <ExternalLink size={16} className="text-teal" />
              Website → Fullbay
            </p>
            <p>Online sales are automatically sent to Fullbay as Counter Sales. No manual action needed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink rounded-xl border border-white/[0.06] p-5">
      <p className="text-xs tracking-[0.1em] uppercase text-steel mb-2">{label}</p>
      <p className="text-2xl font-light text-amber tracking-tight">{value}</p>
    </div>
  );
}

function UserManagement() {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'manager' | 'admin'>('manager');
  const [message, setMessage] = useState('');

  const usersQuery = trpc.localAuth.listUsers.useQuery();
  const createUser = trpc.localAuth.createUser.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setMessage('User created successfully!');
        setNewUsername('');
        setNewPassword('');
        usersQuery.refetch();
      } else {
        setMessage(data.error || 'Failed to create user');
      }
    },
    onError: (err) => setMessage(err.message),
  });
  const deleteUser = trpc.localAuth.deleteUser.useMutation({
    onSuccess: () => usersQuery.refetch(),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (newUsername.length < 3 || newPassword.length < 6) {
      setMessage('Username: 3+ chars, Password: 6+ chars');
      return;
    }
    createUser.mutate({ username: newUsername, password: newPassword, role: newRole });
  };

  return (
    <div className="space-y-6">
      {/* Create User Form */}
      <div className="bg-ink rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-lg font-medium text-chrome mb-4 flex items-center gap-2">
          <UserPlus size={20} className="text-amber" /> Create New User
        </h3>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-steel mb-1 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="username"
              className="bg-white border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-obsidian w-[200px] focus:border-amber focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-steel mb-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="6+ characters"
              className="bg-white border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-obsidian w-[200px] focus:border-amber focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-steel mb-1 uppercase tracking-wider">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'manager' | 'admin')}
              className="bg-white border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-obsidian focus:border-amber focus:outline-none"
            >
              <option value="manager">Manager (inventory only)</option>
              <option value="admin">Admin (full access)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={createUser.isPending}
            className="bg-amber text-obsidian px-6 py-2.5 rounded-lg text-sm font-semibold tracking-[0.04em] uppercase hover:bg-chrome transition-colors disabled:opacity-50"
          >
            {createUser.isPending ? 'Creating...' : 'Create User'}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>
        )}
      </div>

      {/* Users List */}
      <div className="bg-ink rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-steel text-xs tracking-[0.1em] uppercase">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersQuery.data?.map((u) => (
              <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-chrome">{u.id}</td>
                <td className="px-4 py-3 text-chrome font-medium">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-amber/20 text-amber' : 'bg-blue-500/20 text-blue-400'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-steel">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { if (confirm('Delete this user?')) deleteUser.mutate({ id: u.id }); }}
                    className="text-steel hover:text-warning transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {(!usersQuery.data || usersQuery.data.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-steel">
                  <Users size={32} className="mx-auto mb-2 text-steel/30" />
                  <p className="text-sm">No users found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function MessageManagement() {
  const [selectedMsg, setSelectedMsg] = useState<number | null>(null);
  const [response, setResponse] = useState('');
  const [msgStatus, setMsgStatus] = useState('');

  const messagesQuery = trpc.messages.list.useQuery();
  const respondMutation = trpc.messages.respond.useMutation({
    onSuccess: () => {
      setResponse('');
      setSelectedMsg(null);
      setMsgStatus('Response saved!');
      messagesQuery.refetch();
      setTimeout(() => setMsgStatus(''), 3000);
    },
  });

  const handleRespond = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsg || !response.trim()) return;
    respondMutation.mutate({ id: selectedMsg, response: response.trim() });
  };

  const selected = messagesQuery.data?.find((m) => m.id === selectedMsg);

  return (
    <div className="space-y-6">
      {msgStatus && (
        <div className="bg-teal/10 border border-teal/20 text-teal px-4 py-3 rounded-lg text-sm">{msgStatus}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="bg-ink rounded-xl border border-white/[0.06] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-medium text-chrome tracking-[0.04em] uppercase flex items-center gap-2">
              <Mail size={16} className="text-amber" /> Customer Messages
            </h3>
            <span className="text-xs text-steel">
              {messagesQuery.data?.filter((m) => m.status === 'new').length ?? 0} new
            </span>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-[600px] overflow-auto">
            {messagesQuery.data?.map((msg) => (
              <button
                key={msg.id}
                onClick={() => { setSelectedMsg(msg.id); setResponse(msg.response || ''); }}
                className={`w-full text-left px-5 py-4 hover:bg-white/[0.02] transition-colors ${
                  selectedMsg === msg.id ? 'bg-white/[0.04] border-l-2 border-amber' : 'border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-chrome truncate">{msg.name}</p>
                    <p className="text-xs text-steel truncate">{msg.email}</p>
                    <p className="text-sm text-chrome mt-1 truncate">{msg.subject}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                    msg.status === 'new' ? 'bg-amber/20 text-amber' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {msg.status}
                  </span>
                </div>
                <p className="text-xs text-steel mt-2">{new Date(msg.createdAt).toLocaleDateString()}</p>
                {msg.respondedBy && (
                  <p className="text-[11px] text-green-400 mt-1">Answered by {msg.respondedBy}</p>
                )}
              </button>
            ))}
            {(!messagesQuery.data || messagesQuery.data.length === 0) && (
              <div className="px-5 py-12 text-center text-steel">
                <Mail size={32} className="mx-auto mb-2 text-steel/30" />
                <p className="text-sm">No messages yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail & Response */}
        <div>
          {selected ? (
            <div className="bg-ink rounded-xl border border-white/[0.06] p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-medium text-chrome">{selected.name}</p>
                    <p className="text-sm text-steel">{selected.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selected.status === 'new' ? 'bg-amber/20 text-amber' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {selected.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-amber mb-2">{selected.subject}</p>
                <p className="text-sm text-chrome leading-relaxed bg-obsidian rounded-lg p-4 border border-white/[0.04]">
                  {selected.body}
                </p>
              </div>

              {selected.respondedBy && (
                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-xs text-steel mb-2">Previous response by <span className="text-green-400">{selected.respondedBy}</span> on {selected.respondedAt ? new Date(selected.respondedAt).toLocaleDateString() : 'N/A'}</p>
                  <p className="text-sm text-chrome bg-green-500/5 rounded-lg p-4 border border-green-500/10">{selected.response}</p>
                </div>
              )}

              <form onSubmit={handleRespond} className="border-t border-white/[0.06] pt-4 space-y-3">
                <label className="block text-xs text-steel uppercase tracking-wider">Your Response</label>
                <textarea
                  rows={4}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response to the customer..."
                  className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={respondMutation.isPending || !response.trim()}
                  className="bg-amber text-obsidian px-6 py-2.5 rounded-lg text-sm font-semibold tracking-[0.04em] uppercase hover:bg-chrome transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={14} />
                  {respondMutation.isPending ? 'Saving...' : 'Save Response'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-ink rounded-xl border border-white/[0.06] p-12 text-center">
              <Mail size={48} className="mx-auto mb-3 text-steel/30" />
              <p className="text-steel text-sm">Select a message to view and respond</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function PartModal({ part, onClose, onSave }: { part: Part | null; onClose: () => void; onSave: () => void }) {
  const { addPart, updatePart } = useParts();
  const { variants: existingVariants, batchUpdate } = useVariants(part?.id);
  const isEditing = !!part;

  const [form, setForm] = useState({
    name: part?.name || '',
    sku: part?.sku || '',
    price: part?.price || '',
    stock: part?.stock || 0,
    category: part?.category || 'Engine',
    make: part?.make || '',
    model: part?.model || '',
    yearFrom: part?.yearFrom || 2020,
    yearTo: part?.yearTo || 2024,
    description: part?.description || '',
    image: part?.image || '',
    image2: part?.image2 || '',
    image3: part?.image3 || '',
    image4: part?.image4 || '',
    oemNumber: part?.oemNumber || '',
    brand: part?.brand || '',
    pickup: part?.pickup ?? 1,
    deliver: part?.deliver ?? 1,
    ship: part?.ship ?? 1,
    engine: (part as any)?.engine || '',
    coreCharge: (part as any)?.coreCharge || '',
    coreRebate: (part as any)?.coreRebate || '',
    variantLabel: (part as any)?.variantLabel || 'Size',
    source: (part as any)?.source || 'manual',
  });
  const [variants, setVariants] = useState<PartVariant[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync form when editing a different part
  useEffect(() => {
    if (part) {
      setForm({
        name: part.name || '',
        sku: part.sku || '',
        price: part.price || '',
        stock: part.stock || 0,
        category: part.category || 'Engine',
        make: part.make || '',
        model: part.model || '',
        yearFrom: part.yearFrom || 2020,
        yearTo: part.yearTo || 2024,
        description: part.description || '',
        image: part.image || '',
        image2: part.image2 || '',
        image3: part.image3 || '',
        image4: part.image4 || '',
        oemNumber: part.oemNumber || '',
        brand: part.brand || '',
        pickup: part.pickup ?? 1,
        deliver: part.deliver ?? 1,
        ship: part.ship ?? 1,
        engine: (part as any).engine || '',
        coreCharge: (part as any).coreCharge || '',
        coreRebate: (part as any).coreRebate || '',
        variantLabel: (part as any).variantLabel || 'Size',
        source: (part as any).source || 'manual',
      });
      setVariants(existingVariants.map(v => ({ ...v })));
    } else {
      setForm({
        name: '', sku: '', price: '', stock: 0, category: 'Engine',
        make: '', model: '', yearFrom: 2020, yearTo: 2024,
        description: '', image: '', image2: '', image3: '', image4: '',
        oemNumber: '', brand: '', pickup: 1, deliver: 1, ship: 1, engine: '',
        coreCharge: '', coreRebate: '', variantLabel: 'Size', source: 'manual',
      });
      setVariants([]);
    }
  }, [part?.id, existingVariants]);

  const CATEGORIES = ['Engine', 'Transmission', 'Brake', 'Suspension', 'Electrical', 'Body', 'Cooling', 'Air System', 'Emissions', 'Lighting', 'Chassis', 'Interior', 'Lubrication', 'Tools', 'Chemicals'];
  const MAKES = ['Kenworth', 'Peterbilt', 'Freightliner', 'Volvo', 'Mack', 'International', 'Western Star', 'Isuzu', 'Universal'];
  const YEARS = Array.from({ length: 30 }, (_, i) => 2026 - i);
  const modelsByMake: Record<string, string[]> = {
    Kenworth: ['T680', 'T880', 'W900', 'T660', 'T800', 'T270', 'T370'],
    Peterbilt: ['579', '389', '567', '386', '384', '365', '520'],
    Freightliner: ['Cascadia', 'M2 106', 'M2 112', '122SD', '108SD', 'Coronado'],
    Volvo: ['VNL 860', 'VNL 760', 'VNL 740', 'VNR 640', 'VHD 300', 'VAH 300'],
    Mack: ['Anthem', 'Granite', 'Pinnacle', 'LR', 'TerraPro', 'MD'],
    International: ['LT Series', 'RH Series', 'HV Series', 'MV Series', 'HV507', 'LT625'],
    'Western Star': ['49X', '47X', '5700XE', '4900', '4800'],
    Isuzu: ['NPR-HD', 'NPR-XD', 'NQR', 'NRR', 'FTR', 'FVR'],
    Universal: ['All Models'],
  };
  const enginesByMake: Record<string, string[]> = {
    Kenworth: ['Cummins ISX15', 'Cummins X15', 'PACCAR MX-13', 'PACCAR MX-11', 'N/A'],
    Peterbilt: ['Cummins ISX15', 'Cummins X15', 'PACCAR MX-13', 'PACCAR MX-11', 'N/A'],
    Freightliner: ['Detroit DD15', 'Detroit DD13', 'Cummins ISX15', 'Cummins B6.7', 'N/A'],
    Volvo: ['Volvo D13', 'Volvo D11', 'Volvo D16', 'Volvo D8', 'N/A'],
    Mack: ['Mack MP8', 'Mack MP7', 'Mack MP4', 'Mack MD7', 'N/A'],
    International: ['International A26', 'Cummins ISX15', 'International N9', 'N/A'],
    'Western Star': ['Detroit DD15', 'Cummins ISX15', 'Cummins X15', 'N/A'],
    Isuzu: ['Isuzu 4HK1', 'Isuzu 4JJ1', 'Isuzu 6HK1', 'N/A'],
    Universal: ['N/A'],
  };

  const handleChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, imgIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(imgIndex);
    setError('');
    const field = imgIndex === 0 ? 'image' : `image${imgIndex + 1}`;
    try {
      // Upload to our server (Railway Volume)
      const data = new FormData();
      data.append('file', file);

      const uploadUrl = window.location.hostname.includes('kimi.page')
        ? 'https://hgregtrucksparts.com/api/cloudinary-upload'
        : '/api/cloudinary-upload';
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (json.ok) {
        handleChange(field, json.url);
      } else {
        setError('Upload failed: ' + (json.error || 'Unknown error'));
      }
    } catch {
      setError('Upload failed. Please try again.');
    }
    setUploading(null);
  };

  const images = [
    { field: 'image', label: 'Main Image', url: form.image },
    { field: 'image2', label: 'Image 2', url: form.image2 },
    { field: 'image3', label: 'Image 3', url: form.image3 },
    { field: 'image4', label: 'Image 4', url: form.image4 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isUniversal = form.make === 'Universal';
    if (!form.name || !form.sku || !form.price || !form.make || (!isUniversal && !form.model) || !form.brand || !form.oemNumber) {
      setError(isUniversal
        ? 'Please fill all required fields (Name, SKU, Price, Make=Universal, Brand, OEM Number)'
        : 'Please fill all required fields (Name, SKU, Price, Make, Model, Brand, OEM Number)');
      return;
    }
    if (!form.image) {
      setError('Please upload an image');
      return;
    }
    setSaving(true);
    try {
      if (isEditing && part) {
        updatePart(part.id, form);
        // Save variants if any
        if (variants.length > 0) {
          batchUpdate({
            partId: part.id,
            variants: variants.map(v => ({
              variantName: v.variantName,
              price: v.price,
              stock: v.stock,
              sku: v.sku,
            })),
          });
        }
      } else {
        addPart(form as Omit<Part, 'id'>);
      }
      onSave();
    } catch {
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-ink rounded-xl border border-white/[0.08] w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h3 className="text-lg font-medium text-chrome">{isEditing ? 'Edit Part' : 'Add New Part'}</h3>
          <button onClick={onClose} className="text-steel hover:text-chrome transition-colors text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">{error}</p>}

          {/* Variants (Size, Color, etc.) */}
          <div>
            <label className="block text-xs text-steel uppercase tracking-wider mb-2">Variants (Optional)</label>
            <p className="text-[11px] text-steel mb-2">Add options if this part comes in multiple sizes, colors, etc. Leave empty for single-option parts.</p>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-xs text-steel">Label:</label>
              <input
                type="text"
                value={form.variantLabel}
                onChange={(e) => handleChange('variantLabel', e.target.value)}
                placeholder="Size, Color, Side..."
                className="w-32 bg-obsidian border border-white/[0.12] rounded-lg px-3 py-1.5 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none"
              />
            </div>
            {variants.length > 0 && (
              <div className="space-y-2 mb-3">
                <div className="grid grid-cols-12 gap-2 text-[10px] text-steel uppercase">
                  <div className="col-span-3">{form.variantLabel || 'Option'}</div>
                  <div className="col-span-3">Price</div>
                  <div className="col-span-2">Stock</div>
                  <div className="col-span-3">SKU</div>
                  <div className="col-span-1"></div>
                </div>
                {variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={v.variantName}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[i] = { ...v, variantName: e.target.value };
                        setVariants(updated);
                      }}
                      placeholder="18 inch"
                      className="col-span-3 bg-obsidian border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-chrome focus:border-amber focus:outline-none"
                    />
                    <input
                      type="text"
                      value={v.price}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[i] = { ...v, price: e.target.value };
                        setVariants(updated);
                      }}
                      placeholder="24.99"
                      className="col-span-3 bg-obsidian border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-chrome focus:border-amber focus:outline-none"
                    />
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[i] = { ...v, stock: Number(e.target.value) };
                        setVariants(updated);
                      }}
                      className="col-span-2 bg-obsidian border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-chrome focus:border-amber focus:outline-none"
                    />
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[i] = { ...v, sku: e.target.value };
                        setVariants(updated);
                      }}
                      placeholder="SKU-18"
                      className="col-span-3 bg-obsidian border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-chrome focus:border-amber focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                      className="col-span-1 text-steel hover:text-warning transition-colors flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setVariants([...variants, { id: 0, partId: part?.id || 0, variantName: '', price: '', stock: 0, sku: '' }])}
              className="text-xs text-amber hover:text-chrome transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add {form.variantLabel || 'Option'}
            </button>
          </div>

          {/* Image Upload - 4 images */}
          <div>
            <label className="block text-xs text-steel uppercase tracking-wider mb-2">Product Images (up to 4)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={img.field} className="relative">
                  <div className="w-full aspect-square bg-obsidian rounded-lg border border-white/[0.12] flex items-center justify-center overflow-hidden">
                    {img.url ? (
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-steel" />
                    )}
                  </div>
                  <input
                    ref={(el) => { fileInputRefs.current[idx] = el; }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, idx)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[idx]?.click()}
                    disabled={uploading === idx}
                    className="w-full mt-1 bg-surface border border-white/[0.12] text-chrome px-2 py-1 rounded text-xs hover:border-amber transition-colors disabled:opacity-50"
                  >
                    {uploading === idx ? '...' : img.url ? 'Change' : 'Upload'}
                  </button>
                  <p className="text-[10px] text-steel text-center mt-0.5">{img.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-steel uppercase tracking-wider mb-1">Part Name *</label>
              <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome focus:border-amber focus:outline-none" placeholder="e.g. Cummins ISX15 Turbocharger" />
            </div>
            <div>
              <label className="block text-xs text-steel uppercase tracking-wider mb-1">SKU *</label>
              <input type="text" value={form.sku} onChange={(e) => handleChange('sku', e.target.value)} className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome focus:border-amber focus:outline-none" placeholder="e.g. HGP-ISX15-TBO" />
            </div>
            <div>
              <label className="block text-xs text-steel uppercase tracking-wider mb-1">Price ($) *</label>
              <input type="text" value={form.price} onChange={(e) => handleChange('price', e.target.value)} className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome focus:border-amber focus:outline-none" placeholder="1245.00" />
            </div>
            <div>
              <label className="block text-xs text-steel uppercase tracking-wider mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => handleChange('stock', Number(e.target.value))} className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome focus:border-amber focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-steel uppercase tracking-wider mb-1">Category</label>
              <select value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome focus:border-amber focus:outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-steel uppercase tracking-wider mb-1">Make *</label>
              <select value={form.make} onChange={(e) => handleChange('make', e.target.value)} className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome focus:border-amber focus:outline-none">
                <option value="">Select Make</option>
                {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-steel uppercase tracking-wider mb-1">Model *</label>
              <select
                value={form.model}
                onChange={(e) => handleChange('model', e.target.value)}
                disabled={!form.make}
                className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none disabled:opacity-40"
              >
                <option value="">Select Model</option>
                {(modelsByMake[form.make] || []).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-steel uppercase tracking-wider mb-1">Brand *</label>
              <input type="text" value={form.brand} onChange={(e) => handleChange('brand', e.target.value)} className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome focus:border-amber focus:outline-none" placeholder="e.g. Cummins" />
            </div>
            <div>
              <label className="block text-xs text-steel uppercase tracking-wider mb-1">Year From</label>
              <select
                value={form.yearFrom}
                onChange={(e) => handleChange('yearFrom', Number(e.target.value))}
                className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-steel uppercase tracking-wider mb-1">Year To</label>
              <select
                value={form.yearTo}
                onChange={(e) => handleChange('yearTo', Number(e.target.value))}
                className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-steel uppercase tracking-wider mb-1">Engine</label>
              <select
                value={form.engine || ''}
                onChange={(e) => handleChange('engine', e.target.value)}
                disabled={!form.make}
                className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none disabled:opacity-40"
              >
                <option value="">Select Engine</option>
                {(enginesByMake[form.make] || []).map((eng) => (
                  <option key={eng} value={eng}>{eng}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-steel uppercase tracking-wider mb-1">OEM Number *</label>
              <input type="text" value={form.oemNumber} onChange={(e) => handleChange('oemNumber', e.target.value)} className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome focus:border-amber focus:outline-none" placeholder="e.g. 288210500" />
            </div>
          </div>

          {/* Core Charge */}
          <div>
            <label className="block text-xs text-steel uppercase tracking-wider mb-2">Core Charge</label>
            <p className="text-[11px] text-steel mb-2">Charge when customer does NOT return old part. Rebate when they do.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-steel uppercase tracking-wider mb-1">Core Charge ($)</label>
                <input
                  type="text"
                  value={form.coreCharge || ''}
                  onChange={(e) => handleChange('coreCharge', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none"
                />
                <p className="text-[10px] text-steel mt-1">Added to price if no core returned</p>
              </div>
              <div>
                <label className="block text-[10px] text-steel uppercase tracking-wider mb-1">Core Rebate ($)</label>
                <input
                  type="text"
                  value={form.coreRebate || ''}
                  onChange={(e) => handleChange('coreRebate', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none"
                />
                <p className="text-[10px] text-steel mt-1">Discount when core is returned</p>
              </div>
            </div>
          </div>

          {/* Fulfillment Options - Pickup / Deliver / Ship */}
          <div>
            <label className="block text-xs text-steel uppercase tracking-wider mb-2">Fulfillment Options</label>
            <p className="text-[11px] text-steel mb-2">Select how customers can receive this part:</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleChange('pickup', form.pickup ? 0 : 1)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                  form.pickup
                    ? 'border-amber bg-amber/10 text-amber'
                    : 'border-white/[0.12] bg-obsidian text-steel hover:border-white/30'
                }`}
              >
                <Store size={20} />
                <span className="text-xs font-medium">Pickup</span>
                <span className="text-[10px] opacity-70">In-store</span>
              </button>
              <button
                type="button"
                onClick={() => handleChange('deliver', form.deliver ? 0 : 1)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                  form.deliver
                    ? 'border-amber bg-amber/10 text-amber'
                    : 'border-white/[0.12] bg-obsidian text-steel hover:border-white/30'
                }`}
              >
                <Truck size={20} />
                <span className="text-xs font-medium">Deliver</span>
                <span className="text-[10px] opacity-70">Local</span>
              </button>
              <button
                type="button"
                onClick={() => handleChange('ship', form.ship ? 0 : 1)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                  form.ship
                    ? 'border-amber bg-amber/10 text-amber'
                    : 'border-white/[0.12] bg-obsidian text-steel hover:border-white/30'
                }`}
              >
                <PackageCheck size={20} />
                <span className="text-xs font-medium">Ship</span>
                <span className="text-[10px] opacity-70">Nationwide</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-steel uppercase tracking-wider mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => handleChange('description', e.target.value)} className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-chrome focus:border-amber focus:outline-none resize-none" placeholder="Part description..." />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm text-steel border border-white/[0.12] rounded-lg hover:border-white/30 hover:text-chrome transition-all">Cancel</button>
            <button type="submit" disabled={saving || uploading !== null} className="px-6 py-2.5 bg-amber text-obsidian rounded-lg text-sm font-semibold tracking-[0.04em] uppercase hover:bg-chrome transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : isEditing ? 'Update Part' : 'Add Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
