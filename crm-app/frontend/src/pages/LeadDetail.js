import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLead, updateLead, addNote, deleteNote, addFollowUp, updateFollowUp, deleteFollowUp } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, Edit, Trash2, Plus, CheckCircle, Circle,
  MessageSquare, Calendar, Clock, Building, Phone, Globe, DollarSign, Tag, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const SOURCE_LABELS = {
  website: 'Website', referral: 'Referral', social_media: 'Social Media',
  email_campaign: 'Email Campaign', cold_call: 'Cold Call', other: 'Other',
};

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showFuModal, setShowFuModal] = useState(false);
  const [fuForm, setFuForm] = useState({ title: '', dueDate: '', priority: 'medium' });

  const fetchLead = async () => {
    try {
      const { data } = await getLead(id);
      setLead(data.lead);
    } catch { toast.error('Lead not found'); navigate('/leads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleStatusChange = async (status) => {
    try {
      const { data } = await updateLead(id, { status });
      setLead(data.lead);
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const { data } = await addNote(id, noteText);
      setLead(data.lead);
      setNoteText('');
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
    finally { setAddingNote(false); }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      const { data } = await deleteNote(id, noteId);
      setLead(data.lead);
    } catch { toast.error('Failed to delete note'); }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addFollowUp(id, fuForm);
      setLead(data.lead);
      setShowFuModal(false);
      setFuForm({ title: '', dueDate: '', priority: 'medium' });
      toast.success('Follow-up scheduled');
    } catch { toast.error('Failed to add follow-up'); }
  };

  const toggleFollowUp = async (fuId, completed) => {
    try {
      const { data } = await updateFollowUp(id, fuId, { completed: !completed });
      setLead(data.lead);
    } catch { toast.error('Failed to update'); }
  };

  const handleDeleteFollowUp = async (fuId) => {
    try {
      const { data } = await deleteFollowUp(id, fuId);
      setLead(data.lead);
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return (
    <div style={{ padding: 32 }}>
      <div className="skeleton" style={{ height: 40, width: 300, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div className="skeleton" style={{ height: 400 }} />
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    </div>
  );

  if (!lead) return null;

  const pendingFollowUps = lead.followUps?.filter(f => !f.completed) || [];
  const doneFollowUps = lead.followUps?.filter(f => f.completed) || [];

  const priorityColors = { low: 'var(--text3)', medium: 'var(--yellow)', high: 'var(--red)' };

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>
            <ArrowLeft size={14} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%',
              background: 'var(--accent-glow)',
              border: '2px solid rgba(79,124,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: 'var(--accent)',
            }}>
              {lead.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 22, marginBottom: 2 }}>{lead.name}</h1>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge badge-${lead.status}`}>{lead.status}</span>
                {lead.company && <span style={{ fontSize: 12, color: 'var(--text3)' }}>{lead.company}</span>}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/leads/${id}/edit`} className="btn btn-ghost">
            <Edit size={13} /> Edit
          </Link>
        </div>
      </div>

      {/* Status bar */}
      <div className="card" style={{ marginBottom: 20, padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 8 }}>Move to:</span>
          {STATUSES.map(s => (
            <button key={s} onClick={() => handleStatusChange(s)}
              className={`badge badge-${s}`}
              style={{
                border: 'none', cursor: 'pointer',
                opacity: lead.status === s ? 1 : 0.5,
                transform: lead.status === s ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.15s',
                outline: lead.status === s ? '2px solid currentColor' : 'none',
                outlineOffset: 2,
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Contact info */}
          <div className="card">
            <h3 style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { icon: Mail, label: 'Email', value: lead.email, href: `mailto:${lead.email}` },
                { icon: Phone, label: 'Phone', value: lead.phone || '—', href: lead.phone ? `tel:${lead.phone}` : null },
                { icon: Building, label: 'Company', value: lead.company || '—' },
                { icon: Globe, label: 'Source', value: SOURCE_LABELS[lead.source] || lead.source },
                { icon: DollarSign, label: 'Value', value: lead.value > 0 ? `$${lead.value.toLocaleString()}` : '—' },
                { icon: Clock, label: 'Added', value: format(new Date(lead.createdAt), 'MMM d, yyyy') },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={13} color="var(--text3)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    {href ? (
                      <a href={href} style={{ color: 'var(--accent)', fontSize: 13 }}>{value}</a>
                    ) : (
                      <div style={{ fontSize: 13 }}>{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {lead.tags?.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <Tag size={12} color="var(--text3)" />
                {lead.tags.map(tag => (
                  <span key={tag} style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 99, padding: '2px 8px', fontSize: 11, color: 'var(--text2)',
                  }}>{tag}</span>
                ))}
              </div>
            )}

            {lead.message && (
              <>
                <hr className="divider" />
                <div style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic' }}>"{lead.message}"</div>
              </>
            )}
          </div>

          {/* Notes */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <MessageSquare size={12} style={{ display: 'inline', marginRight: 6 }} />
                Notes ({lead.notes?.length || 0})
              </h3>
            </div>

            <form onSubmit={handleAddNote} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea
                  value={noteText} onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  rows={2}
                  style={{ flex: 1, resize: 'none' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={addingNote || !noteText.trim()} style={{ alignSelf: 'flex-end' }}>
                  <Plus size={13} />
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lead.notes?.length === 0 ? (
                <p style={{ color: 'var(--text3)', fontSize: 13 }}>No notes yet.</p>
              ) : (
                [...lead.notes].reverse().map(note => (
                  <div key={note._id} style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '10px 12px',
                  }}>
                    <div style={{ fontSize: 13, marginBottom: 6, lineHeight: 1.5 }}>{note.content}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {note.createdByName} · {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                      </span>
                      <button onClick={() => handleDeleteNote(note._id)} className="btn btn-danger btn-sm">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column - Follow-ups */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Calendar size={12} style={{ display: 'inline', marginRight: 6 }} />
                Follow-ups
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowFuModal(true)}>
                <Plus size={12} /> Add
              </button>
            </div>

            {pendingFollowUps.length === 0 && doneFollowUps.length === 0 ? (
              <p style={{ color: 'var(--text3)', fontSize: 13 }}>No follow-ups scheduled.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendingFollowUps.map(fu => (
                  <div key={fu._id} style={{
                    background: 'var(--bg3)', border: `1px solid ${isPast(new Date(fu.dueDate)) ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', padding: '10px 12px',
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <button onClick={() => toggleFollowUp(fu._id, fu.completed)} style={{ background: 'none', border: 'none', padding: 0, marginTop: 1, flexShrink: 0 }}>
                        <Circle size={15} color="var(--text3)" />
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{fu.title}</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: isPast(new Date(fu.dueDate)) ? 'var(--red)' : 'var(--text3)' }}>
                            {format(new Date(fu.dueDate), 'MMM d, yyyy')}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: priorityColors[fu.priority], textTransform: 'uppercase' }}>{fu.priority}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteFollowUp(fu._id)} className="btn btn-danger btn-sm">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
                {doneFollowUps.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</p>
                    {doneFollowUps.map(fu => (
                      <div key={fu._id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 0', borderTop: '1px solid var(--border)',
                        opacity: 0.5,
                      }}>
                        <CheckCircle size={14} color="var(--green)" />
                        <span style={{ fontSize: 12, textDecoration: 'line-through' }}>{fu.title}</span>
                        <button onClick={() => handleDeleteFollowUp(fu._id)} className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }}>
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Follow-up modal */}
      {showFuModal && (
        <div className="modal-overlay" onClick={() => setShowFuModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Schedule Follow-up</h2>
            <form onSubmit={handleAddFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Title *</label>
                <input value={fuForm.title} onChange={e => setFuForm({ ...fuForm, title: e.target.value })} placeholder="e.g. Send proposal email" required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Due Date *</label>
                  <input type="date" value={fuForm.dueDate} onChange={e => setFuForm({ ...fuForm, dueDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={fuForm.priority} onChange={e => setFuForm({ ...fuForm, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowFuModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={13} />Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
