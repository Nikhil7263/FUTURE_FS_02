import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLeads, deleteLead, updateLead } from '../utils/api';
import { Search, Plus, Trash2, Eye, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['', 'new', 'contacted', 'qualified', 'converted', 'lost'];
const SOURCE_OPTIONS = ['', 'website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'other'];

const SOURCE_LABELS = {
  website: 'Website', referral: 'Referral', social_media: 'Social Media',
  email_campaign: 'Email Campaign', cold_call: 'Cold Call', other: 'Other',
};

export default function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      const { data } = await getLeads(params);
      setLeads(data.leads);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, sourceFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => { setPage(1); }, [search, statusFilter, sourceFilter]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Delete this lead?')) return;
    setDeleting(id);
    try {
      await deleteLead(id);
      toast.success('Lead deleted');
      fetchLeads();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const handleStatusChange = async (id, status, e) => {
    e.stopPropagation();
    try {
      await updateLead(id, { status });
      setLeads(leads.map(l => l._id === id ? { ...l, status } : l));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 2 }}>All Leads</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{total} leads total</p>
        </div>
        <Link to="/leads/new" className="btn btn-primary">
          <Plus size={15} /> Add Lead
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, company..."
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 150 }}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>)}
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{ width: 160 }}>
          {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s ? SOURCE_LABELS[s] : 'All Sources'}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={fetchLeads}>
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Lead', 'Email', 'Source', 'Status', 'Value', 'Added', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 600, color: 'var(--text3)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div className="skeleton" style={{ height: 16, width: j === 0 ? 120 : j === 6 ? 60 : 80 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text3)' }}>
                    No leads found. <Link to="/leads/new" style={{ color: 'var(--accent)' }}>Create one?</Link>
                  </td>
                </tr>
              ) : (
                leads.map((lead, i) => (
                  <tr
                    key={lead._id}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    style={{
                      borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'var(--accent-glow)',
                          border: '1px solid rgba(79,124,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0,
                        }}>
                          {lead.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{lead.name}</div>
                          {lead.company && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{lead.company}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text2)' }}>{lead.email}</td>
                    <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text2)' }}>{SOURCE_LABELS[lead.source] || lead.source}</td>
                    <td style={{ padding: '13px 16px' }} onClick={e => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={e => handleStatusChange(lead._id, e.target.value, e)}
                        className={`badge badge-${lead.status}`}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {STATUS_OPTIONS.filter(Boolean).map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600 }}>
                      {lead.value > 0 ? `$${lead.value.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td style={{ padding: '13px 16px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/leads/${lead._id}`} className="btn btn-ghost btn-sm" title="View">
                          <Eye size={12} />
                        </Link>
                        <button className="btn btn-danger btn-sm" onClick={e => handleDelete(lead._id, e)} disabled={deleting === lead._id}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px', borderTop: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Page {page} of {pages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={13} />
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
