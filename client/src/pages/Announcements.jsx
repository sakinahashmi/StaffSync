import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FiBell,
  FiPlus,
  FiSearch,
  FiTag,
  FiCalendar,
  FiUser,
  FiTrash2,
  FiBookmark,
  FiAlertTriangle,
} from 'react-icons/fi';

const CATEGORIES = ['All', 'General', 'Event', 'Policy', 'Urgent', 'Holiday', 'Celebration'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const Announcements = () => {
  const { user, isHr } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Medium',
    targetAudience: 'All',
    pinned: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;

      const res = await api.get('/announcements', { params });
      if (res.data?.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnnouncements();
    }, 200);
    return () => clearTimeout(timer);
  }, [category, search]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await api.post('/announcements', formData);
      if (res.data?.success) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          content: '',
          category: 'General',
          priority: 'Medium',
          targetAudience: 'All',
          pinned: false,
        });
        fetchAnnouncements();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to publish announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company announcement?')) {
      return;
    }

    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Header bar */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-navy mb-1">Company Announcements</h3>
          <p className="text-muted small mb-0">
            Official communications, organizational policies, corporate events, and urgent updates.
          </p>
        </div>

        {isHr && (
          <button
            onClick={() => {
              setFormError('');
              setShowCreateModal(true);
            }}
            className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 py-2"
          >
            <FiPlus size={18} />
            <span>Publish Announcement</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-md-7">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <FiSearch />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search announcements by headline or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-5">
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <LoadingSpinner message="Fetching announcements..." />
      ) : announcements.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {announcements.map((item) => {
            const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={item._id}
                className={`card border-0 shadow-sm rounded-4 p-4 bg-white transition-all ${
                  item.pinned ? 'border-start border-primary border-4' : ''
                }`}
              >
                <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-2">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {item.pinned && (
                      <span className="badge bg-primary text-white rounded-pill px-3 py-1 small d-flex align-items-center gap-1">
                        <FiBookmark size={12} />
                        <span>Pinned Notice</span>
                      </span>
                    )}
                    <span className="badge bg-light text-dark border rounded-pill px-3 py-1 small fw-normal">
                      {item.category}
                    </span>
                    <span
                      className={`badge rounded-pill px-2 py-1 small ${
                        item.priority === 'Urgent'
                          ? 'bg-danger-subtle text-danger'
                          : item.priority === 'High'
                          ? 'bg-warning-subtle text-warning-emphasis'
                          : 'bg-secondary-subtle text-secondary'
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                    <span className="badge bg-light text-muted border rounded-pill px-2 py-1 small fw-normal">
                      Audience: {item.targetAudience}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted d-flex align-items-center gap-1">
                      <FiCalendar size={13} />
                      <span>{dateStr}</span>
                    </span>

                    {isHr && (
                      <button
                        onClick={() => handleDeleteAnnouncement(item._id)}
                        className="btn btn-sm btn-light border text-danger p-1 px-2 rounded-3"
                        title="Delete Announcement"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <h5 className="fw-bold text-navy mb-2">{item.title}</h5>
                <p className="text-secondary small mb-3 lh-base">{item.content}</p>

                <div className="d-flex align-items-center gap-2 pt-2 border-top border-light">
                  <span className="small text-muted d-flex align-items-center gap-1">
                    <FiUser size={13} className="text-primary" />
                    <span>Published by {item.createdBy?.name || 'HR Team'}</span>
                    {item.createdBy?.position && (
                      <span className="text-muted">({item.createdBy.position})</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <FiBell size={42} className="text-muted mx-auto mb-3" />
          <h5 className="fw-bold text-navy">No Announcements Found</h5>
          <p className="text-muted small mb-0">
            No announcements match your search or selected category filter.
          </p>
        </div>
      )}

      {/* Create Announcement Modal (HR Only) */}
      {showCreateModal && isHr && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-navy">Publish New Announcement</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateAnnouncement}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 small">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Headline / Subject *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Q4 Company Strategy All-Hands"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Priority Level</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Target Audience</label>
                      <select
                        className="form-select"
                        value={formData.targetAudience}
                        onChange={(e) =>
                          setFormData({ ...formData, targetAudience: e.target.value })
                        }
                      >
                        <option value="All">All Staff</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Managers">Managers Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Detailed Message Body *</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      required
                      placeholder="Provide full announcement details, links, or action items..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="pinAnnouncement"
                      checked={formData.pinned}
                      onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                    />
                    <label className="form-check-label small fw-medium" htmlFor="pinAnnouncement">
                      Pin this announcement to top of dashboard & notice board
                    </label>
                  </div>
                </div>

                <div className="modal-footer border-0 px-4 pb-4">
                  <button
                    type="button"
                    className="btn btn-light px-4 rounded-pill"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 rounded-pill"
                    disabled={submitting}
                  >
                    {submitting ? 'Publishing...' : 'Publish Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
