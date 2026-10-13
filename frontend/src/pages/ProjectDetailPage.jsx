import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Send,
  MessageSquare,
  Star,
  ShieldCheck,
  RotateCcw,
  Download,
  Paperclip,
  Check,
  Lock,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { formatPrice } = useCurrency();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Revision Request State
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');

  // Upload File State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileName, setFileName] = useState('');

  // Feedback Review State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const statusSteps = ['Payment Pending', 'Awaiting Creator', 'Accepted', 'In Progress', 'Under Review', 'Completed'];

  useEffect(() => {
    fetchProject();
  }, [id, token]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
        // Load messages for this project
        const convId = [data.project.clientId, data.project.creatorId].sort().join('_conv_');
        const msgRes = await fetch(`/api/messages/${convId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const msgData = await msgRes.json();
        if (msgData.success) {
          setMessages(msgData.messages);
        }
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`/api/projects/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handlePayEscrow = async () => {
    if (!window.confirm(`Fund escrow with ${formatPrice(project.budget)} to send your proposal to ${project.creatorName}?`)) return;
    try {
      const res = await fetch(`/api/projects/${id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        alert(data.message);
      } else {
        alert(data.message || 'Payment failed.');
      }
    } catch (err) {
      console.error('Error funding escrow:', err);
      alert('Payment error. Please try again.');
    }
  };


  const handleToggleDeliverable = async (deliverableIndex) => {
    try {
      const res = await fetch(`/api/projects/${id}/deliverable-toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ deliverableIndex })
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
      }
    } catch (err) {
      console.error('Error toggling deliverable:', err);
    }
  };

  const handleRequestRevision = async (e) => {
    e.preventDefault();
    if (!revisionFeedback.trim()) return;
    try {
      const res = await fetch(`/api/projects/${id}/revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ feedback: revisionFeedback })
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        setShowRevisionModal(false);
        setRevisionFeedback('');
      }
    } catch (err) {
      console.error('Error submitting revision:', err);
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;
    try {
      const res = await fetch(`/api/projects/${id}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: fileName, size: '4.8 MB', url: '#' })
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        setShowUploadModal(false);
        setFileName('');
      }
    } catch (err) {
      console.error('Error attaching file:', err);
    }
  };

  const handleSendProjectMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !project) return;
    const convId = [project.clientId, project.creatorId].sort().join('_conv_');
    const receiverId = user?.id === project.clientId ? project.creatorId : project.clientId;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: convId,
          projectId: project.id,
          receiverId,
          text: newMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        setShowFeedbackModal(false);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading project collaboration room...</div>;
  }

  if (!project) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Project brief not found. <Link to="/projects" className="text-purple-300">View all projects</Link>
      </div>
    );
  }

  const currentStepIdx = statusSteps.indexOf(project.status);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Project Room Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-purple-900/30">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {project.category || 'General Content'}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: #{project.id || id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span>Client: <strong className="text-purple-300">{project.clientName}</strong></span>
              <span>•</span>
              <span>Creator: <strong className="text-violet-300">{project.creatorName}</strong></span>
              <span className={`flex items-center gap-1 font-bold ${project.status === 'Payment Pending' ? 'text-rose-400' : 'text-emerald-400'}`}>
                <DollarSign className="w-3.5 h-3.5" /> {formatPrice(project.budget)} {project.status === 'Payment Pending' ? 'Escrow Unfunded' : 'Escrow Funded'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Deadline: {project.deadline}
              </span>
            </div>
          </div>

          {/* Action Trigger Controls based on role & status */}
          <div className="flex flex-wrap items-center gap-2">
            {project.status === 'Payment Pending' && (
              <Link
                to={`/checkout/${project.id || id}`}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-glow-sm flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" /> Pay Real Money & Fund Escrow ({formatPrice(project.budget)})
              </Link>
            )}

            {(project.status === 'Awaiting Creator' || project.status === 'Requested') && (
              <button
                onClick={() => handleStatusChange('Accepted')}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-sm"
              >
                Accept Proposal
              </button>
            )}


            {project.status === 'Accepted' && (
              <button
                onClick={() => handleStatusChange('In Progress')}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                Begin Production
              </button>
            )}

            {project.status === 'In Progress' && (
              <>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-navy-900 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Attach Delivery
                </button>
                <button
                  onClick={() => handleStatusChange('Under Review')}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                >
                  Submit for Client Review
                </button>
              </>
            )}

            {project.status === 'Under Review' && (
              <>
                <button
                  onClick={() => setShowRevisionModal(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-navy-900 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Request Revision
                </button>
                <button
                  onClick={() => handleStatusChange('Completed')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-sm"
                >
                  Approve & Release Funds
                </button>
              </>
            )}

            {project.status === 'Completed' && !project.feedback && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Leave Feedback
              </button>
            )}
          </div>
        </div>

        {/* Status Stepper Progression */}
        <div className="pt-6">
          <div className="text-xs font-semibold text-purple-300 mb-3 flex items-center justify-between">
            <span>Production Workflow Status</span>
            <span className="font-mono text-slate-400">{project.pendingAction}</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {statusSteps.map((step, idx) => {
              const isPassed = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step} className="space-y-1.5 text-center">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isPassed
                        ? 'bg-gradient-to-r from-purple-500 to-violet-400 shadow-glow-sm'
                        : 'bg-navy-900'
                    }`}
                  />
                  <span
                    className={`text-[10px] sm:text-xs block font-bold truncate ${
                      isCurrent ? 'text-white' : isPassed ? 'text-purple-300' : 'text-slate-600'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Deliverables & Files on Left, Project Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): Deliverables & Revision History */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Brief Overview Card */}
          <div className="glass-card p-6 rounded-2xl border border-purple-900/40 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> Scope & Creative Brief
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Deliverables Checklist */}
          <div className="glass-card p-6 rounded-2xl border border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Milestone Deliverables
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {project.deliverables?.filter(d => d.completed).length || 0}/{project.deliverables?.length || 0} Ready
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {(project.deliverables || []).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleToggleDeliverable(idx)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    item.completed
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-navy-950/60 border-purple-900/30 text-slate-300 hover:border-purple-400/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        item.completed ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-slate-500'
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {item.completed ? 'Approved' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Attached Files & Assets */}
          <div className="glass-card p-6 rounded-2xl border border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-purple-400" /> Deliverable Files & Media ({project.files?.length || 0})
              </h3>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" /> Attach File
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {(project.files && project.files.length > 0) ? (
                project.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-navy-950/60 border border-purple-900/30 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <div>
                        <strong className="text-white block">{file.name}</strong>
                        <span className="text-[10px] text-slate-400">
                          {file.size} • Uploaded by {file.uploadedBy}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Simulating download of ${file.name}`)}
                      className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white text-[11px] flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-2">No files attached yet.</p>
              )}
            </div>
          </div>

          {/* Revision Requests History */}
          {(project.revisions && project.revisions.length > 0) && (
            <div className="glass-card p-6 rounded-2xl border border-amber-900/40 space-y-3">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" /> Revision Notes ({project.revisions.length})
              </h3>
              <div className="space-y-2">
                {project.revisions.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                    <div className="flex items-center justify-between text-amber-200 font-semibold">
                      <span>Requested by {rev.requestedBy}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300">{rev.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Review if present */}
          {project.feedback && (
            <div className="glass-card p-6 rounded-2xl border border-emerald-900/40 space-y-2 bg-emerald-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Client Feedback Rating</span>
                <div className="flex items-center text-amber-400">
                  {[...Array(project.feedback.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-300 italic">"{project.feedback.comment}"</p>
            </div>
          )}

        </div>

        {/* Right Column (5 cols): Embedded Project Messaging Hub */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-2xl border border-purple-900/40 overflow-hidden flex flex-col h-[640px]">
            
            <div className="p-4 border-b border-purple-900/30 bg-navy-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Project Discussion</h3>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold">● Active Room</span>
            </div>

            {/* Chat Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 italic text-center px-4">
                  Send a message to discuss script revisions, delivery specs, and timelines.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id || m._id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-slate-500 mb-0.5 px-1">{m.senderName}</span>
                      <div
                        className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                          isMe
                            ? 'bg-purple-600 text-white rounded-br-none shadow-glow-sm'
                            : 'bg-navy-950/90 border border-purple-900/40 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {m.text}
                        {m.attachment && (
                          <div className="mt-2 pt-2 border-t border-purple-400/30 text-[11px] font-mono flex items-center gap-1 text-purple-200">
                            <Paperclip className="w-3 h-3" /> {m.attachment.name}
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendProjectMessage} className="p-3 border-t border-purple-900/30 bg-navy-950/90 flex gap-2">
              <input
                type="text"
                placeholder="Type project message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-navy-900 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl purple-glow-btn text-white transition-all"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </div>

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-amber-500/40 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" /> Request Deliverable Revision
            </h3>
            <p className="text-xs text-slate-300">
              Provide constructive, actionable feedback to help the creator polish the output.
            </p>
            <form onSubmit={handleRequestRevision} className="space-y-4">
              <textarea
                rows={4}
                required
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                placeholder="e.g. Please sharpen the hook pacing around 0:15 and adjust the background audio ducking level..."
                className="w-full bg-navy-950 border border-purple-900/40 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  Send Revision Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Deliverable Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-purple-500/40 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-400" /> Attach Deliverable Asset
            </h3>
            <form onSubmit={handleUploadFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">File Name / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Final_Render_4K_v2.mp4"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-navy-950 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl purple-glow-btn text-white font-bold text-xs"
                >
                  Attach to Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-purple-500/40 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Leave Verified Client Feedback
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Review Comments</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe your collaboration experience, output quality, and communication..."
                  className="w-full bg-navy-950 border border-purple-900/40 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl purple-glow-btn text-white font-bold text-xs"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
