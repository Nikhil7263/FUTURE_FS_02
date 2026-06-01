import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Users, TrendingUp, DollarSign, CheckCircle, ArrowUpRight, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

const STATUS_COLORS = {
  new: '#06b6d4',
  contacted: '#f59e0b',
  qualified: '#a855f7',
  converted: '#22c55e',
  lost: '#ef4444',
};

const SOURCE_LABELS = {
  website: 'Website',
  referral: 'Referral',
  social_media: 'Social',
  email_campaign: 'Email',
  cold_call: 'Cold Call',
  other: 'Other',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100 }} />)}
      </div>
    </div>
  );

  const statusData = data?.stats ? Object.entries(data.stats).map(([name, value]) => ({ name, value })) : [];
  const sourceData = (data?.sourceCounts || []).map(s => ({ name: SOURCE_LABELS[s._id] || s._id, count: s.count }));

  const statCards = [
    { label: 'Total Leads', value: data?.total || 0, icon: Users, color: 'var(--accent)', sub: 'All time' },
    { label: 'Converted', value: data?.stats?.converted || 0, icon: CheckCircle, color: 'var(--green)', sub: `${data?.total ? Math.round((data.stats.converted / data.total) * 100) : 0}% conversion` },
    { label: 'Pipeline Value', value: `$${(data?.totalValue || 0).toLocaleString()}`, icon: DollarSign, color: 'var(--purple)', sub: 'Estimated' },
    { label: 'New Leads', value: data?.stats?.new || 0, icon: TrendingUp, color: 'var(--yellow)', sub: 'Needs attention' },
  ];

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'},{' '}
          <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--text2)' }}>Here's what's happening with your leads today.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {statCards.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 80, height: 80,
              background: `${color}15`,
              borderRadius: '50%',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 38, height: 38,
                background: `${color}15`,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color={color} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Syne', marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Pipeline status */}
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 20, color: 'var(--text2)' }}>Pipeline by Status</h3>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={statusData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#888'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {statusData.map(({ name, value }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[name] }} />
                    <span style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'capitalize' }}>{name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead sources */}
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 20, color: 'var(--text2)' }}>Leads by Source</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={sourceData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent leads */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, color: 'var(--text2)' }}>Recent Leads</h3>
          <Link to="/leads" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        {data?.recentLeads?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)' }}>No leads yet. <Link to="/leads/new" style={{ color: 'var(--accent)' }}>Add your first</Link></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {data?.recentLeads?.map((lead, i) => (
              <Link key={lead._id} to={`/leads/${lead._id}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'var(--accent-glow)',
                    border: '1px solid rgba(79,124,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'var(--accent)',
                  }}>
                    {lead.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{lead.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{lead.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge badge-${lead.status}`}>{lead.status}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text3)' }}>
                    <Clock size={10} />
                    {format(new Date(lead.createdAt), 'MMM d')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
