import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createLead, updateLead, getLead } from '../utils/api';
import { ArrowLeft, Save, User, Mail, Phone, Building, Globe, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const SOURCES = ['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'other'];
const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];

const INITIAL = {
  name: '', email: '', phone: '', company: '',
  source: 'website', status: 'new', value: 0,
  tags: '', message: ''
};

export default function LeadForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      getLead(id).then(r => {
        const l = r.data.lead;
        setForm({
          name: l.name, email: l.email, phone: l.phone || '',
          company: l.company || '', source: l.source, status: l.status,
          value: l.value, tags: (l.tags || []).join(', '), message: l.message || ''
        });
        setFetchLoading(false);
      }).catch(() => { toast.error('Lead not found'); navigate('/leads'); });
    }
  }, [id, isEdit, navigate]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (isEdit) {
        await updateLead(id, payload);
        toast.success('Lead updated');
        navigate(`/leads/${id}`);
      } else {
        const { data } = await createLead(payload);
        toast.success('Lead created');
        navigate(`/leads/${data.lead._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving lead');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div style={{ padding: 32 }}>
      <div className="skeleton" style={{ height: 36, width: 200, marginBottom: 24 }} />
      <div className="card"><div className="skeleton" style={{ height: 400 }} /></div>
    </div>
  );

  const FieldIcon = ({ icon: Icon }) => (
    <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
  );

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} />
        </button>
        <div>
          <h1 style={{ fontSize: 22 }}>{isEdit ? 'Edit Lead' : 'New Lead'}</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{isEdit ? 'Update lead information' : 'Add a new lead to your CRM'}</p>
        </div>
      </div>

      <form onSubmit={submit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact Info</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <FieldIcon icon={User} />
                <input name="name" value={form.name} onChange={handle} required placeholder="Jane Smith" style={{ paddingLeft: 36 }} />
              </div>
            </div>
            <div className="form-group">
              <label>Email *</label>
              <div style={{ position: 'relative' }}>
                <FieldIcon icon={Mail} />
                <input name="email" type="email" value={form.email} onChange={handle} required placeholder="jane@example.com" style={{ paddingLeft: 36 }} />
              </div>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <div style={{ position: 'relative' }}>
                <FieldIcon icon={Phone} />
                <input name="phone" value={form.phone} onChange={handle} placeholder="+1 555 0123" style={{ paddingLeft: 36 }} />
              </div>
            </div>
            <div className="form-group">
              <label>Company</label>
              <div style={{ position: 'relative' }}>
                <FieldIcon icon={Building} />
                <input name="company" value={form.company} onChange={handle} placeholder="Acme Corp" style={{ paddingLeft: 36 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lead Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Source</label>
              <div style={{ position: 'relative' }}>
                <FieldIcon icon={Globe} />
                <select name="source" value={form.source} onChange={handle} style={{ paddingLeft: 36 }}>
                  {SOURCES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handle}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Estimated Value ($)</label>
              <div style={{ position: 'relative' }}>
                <FieldIcon icon={DollarSign} />
                <input name="value" type="number" min="0" value={form.value} onChange={handle} placeholder="0" style={{ paddingLeft: 36 }} />
              </div>
            </div>
            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input name="tags" value={form.tags} onChange={handle} placeholder="hot-lead, enterprise, q4" />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 14 }}>
            <label>Initial Message / Notes</label>
            <textarea name="message" value={form.message} onChange={handle} rows={3} placeholder="Contact form message or initial notes..." style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={14} />
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}
