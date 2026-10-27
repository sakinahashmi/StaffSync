import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FiCalendar,
  FiPlus,
  FiCheck,
  FiX,
  FiClock,
  FiAlertCircle,
  FiMessageSquare,
  FiTrash2,
} from 'react-icons/fi';

const LEAVE_TYPES = [
  'Annual Leave',
  'Sick Leave',
  'Casual Leave',
  'Maternity/Paternity Leave',
  'Unpaid Leave',
];

const Leaves = () => {
  const { user, isHr, isManager } = useAuth();

  // Tab: 'my' or 'all' (HR/Manager)
  const [activeTab, setActiveTab] = useState('my');

  // Personal leaves
  const [myLeaves, setMyLeaves] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // All leaves (HR/Manager)
  const [allLeaves, setAllLeaves] = useState([]);
  const [allLoading, setAllLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Apply leave modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [daysCountPreview, setDaysCountPreview] = useState(0);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [applying, setApplying] = useState(false);

  // Review modal (HR/Manager)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('Approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Calculate days when start or end date change
  useEffect(() => {
    if (applyForm.startDate && applyForm.endDate) {
      const s = new Date(applyForm.startDate);
      const e = new Date(applyForm.endDate);
      if (s <= e) {
        const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setDaysCountPreview(diff);
      } else {
        setDaysCountPreview(0);
      }
    } else {
      setDaysCountPreview(0);
    }
  }, [applyForm.startDate, applyForm.endDate]);

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/leaves/my-leaves');
      if (res.data?.success) {
        setMyLeaves(res.data.leaves);
        setMyStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load my leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLeaves = async () => {
    if (!isHr && !isManager) return;
    setAllLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (typeFilter !== 'All') params.leaveType = typeFilter;

      const res = await api.get('/leaves', { params });
      if (res.data?.success) {
        setAllLeaves(res.data.leaves);
      }
    } catch (err) {
      console.error('Failed to load all leaves:', err);
    } finally {
      setAllLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
    if (isHr || isManager) {
      fetchAllLeaves();
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'all' && (isHr || isManager)) {
      fetchAllLeaves();
    }
  }, [statusFilter, typeFilter, activeTab]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');

    if (new Date(applyForm.startDate) > new Date(applyForm.endDate)) {
      setApplyError('Leave start date cannot be after end date.');
      return;
    }

    setApplying(true);
    try {
      const res = await api.post('/leaves', applyForm);
      if (res.data?.success) {
        setApplySuccess('Leave application submitted successfully!');
        setApplyForm({
          leaveType: 'Annual Leave',
          startDate: '',
          endDate: '',
          reason: '',
        });
        setTimeout(() => {
          setShowApplyModal(false);
          fetchMyLeaves();
          if (isHr || isManager) fetchAllLeaves();
        }, 800);
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setApplying(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) {
      return;
    }

    try {
      await api.delete(`/leaves/${id}`);
      fetchMyLeaves();
      if (isHr || isManager) fetchAllLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const handleOpenReview = (leave, decision) => {
    setSelectedLeave(leave);
    setReviewDecision(decision);
    setReviewNotes(
      decision === 'Approved'
        ? 'Approved as requested.'
        : 'Request cannot be accommodated due to team workload.'
    );
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setReviewing(true);
    try {
      await api.patch(`/leaves/${selectedLeave._id}/review`, {
        status: reviewDecision,
        reviewNotes,
      });
      setShowReviewModal(false);
      fetchAllLeaves();
      fetchMyLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Header bar */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-navy mb-1">Leave & Time Off</h3>
          <p className="text-muted small mb-0">
            Submit leave requests, track application statuses, and process departmental approvals.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {(isHr || isManager) && (
            <div className="btn-group p-1 bg-white border rounded-pill shadow-xs">
              <button
                className={`btn btn-sm rounded-pill px-3 py-1 ${
                  activeTab === 'my' ? 'btn-primary' : 'btn-light border-0'
                }`}
                onClick={() => setActiveTab('my')}
              >
                My Requests
              </button>
              <button
                className={`btn btn-sm rounded-pill px-3 py-1 ${
                  activeTab === 'all' ? 'btn-primary' : 'btn-light border-0'
                }`}
                onClick={() => setActiveTab('all')}
              >
                Team Approvals
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setApplyError('');
              setApplySuccess('');
              setShowApplyModal(true);
            }}
            className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 py-2"
          >
            <FiPlus size={18} />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
            <span className="small text-muted d-block mb-1">Total Applied</span>
            <h3 className="fw-bold text-navy mb-0">{myStats?.totalLeaves || 0}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
            <span className="small text-muted d-block mb-1">Pending Approval</span>
            <h3 className="fw-bold text-warning mb-0">{myStats?.pendingCount || 0}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
            <span className="small text-muted d-block mb-1">Approved Days</span>
            <h3 className="fw-bold text-success mb-0">{myStats?.approvedCount || 0}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
            <span className="small text-muted d-block mb-1">Rejected</span>
            <h3 className="fw-bold text-danger mb-0">{myStats?.rejectedCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Tab: My Requests */}
      {activeTab === 'my' && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-0 pt-4 px-4 pb-2">
            <h5 className="fw-bold text-navy mb-0">My Leave Applications</h5>
            <span className="small text-muted">History of personal time-off applications</span>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <LoadingSpinner message="Fetching your leave history..." />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Leave Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Reviewer / Notes</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaves && myLeaves.length > 0 ? (
                      myLeaves.map((item) => {
                        const sDate = new Date(item.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });
                        const eDate = new Date(item.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });

                        return (
                          <tr key={item._id}>
                            <td className="ps-4">
                              <span className="fw-semibold text-dark small">{item.leaveType}</span>
                            </td>
                            <td>
                              <span className="small text-muted">
                                {sDate} &ndash; {eDate}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border px-2 py-1 rounded-pill small">
                                {item.daysCount} {item.daysCount === 1 ? 'day' : 'days'}
                              </span>
                            </td>
                            <td>
                              <span className="small text-muted text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                                {item.reason}
                              </span>
                            </td>
                            <td>
                              {item.reviewedBy ? (
                                <div className="small">
                                  <strong className="text-dark d-block">
                                    {item.reviewedBy.name}
                                  </strong>
                                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    {item.reviewNotes || 'No notes left'}
                                  </span>
                                </div>
                              ) : (
                                <span className="small text-muted italic">Pending review</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge rounded-pill ${
                                  item.status === 'Approved'
                                    ? 'bg-success-subtle text-success'
                                    : item.status === 'Rejected'
                                    ? 'bg-danger-subtle text-danger'
                                    : 'bg-warning-subtle text-warning-emphasis'
                                } px-3 py-1 small`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="text-end pe-4">
                              {item.status === 'Pending' && (
                                <button
                                  onClick={() => handleCancelLeave(item._id)}
                                  className="btn btn-sm btn-outline-danger p-1 px-2 rounded-pill small"
                                  title="Cancel Leave Request"
                                >
                                  <FiTrash2 size={13} className="me-1" />
                                  <span>Cancel</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted small">
                          No leave applications submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Team Approvals (HR & Manager) */}
      {activeTab === 'all' && (isHr || isManager) && (
        <div>
          {/* Filters Bar */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
            <div className="row g-2 align-items-center">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted mb-1">Filter by Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Only</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted mb-1">Filter by Leave Type</label>
                <select
                  className="form-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  {LEAVE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            {allLoading ? (
              <LoadingSpinner message="Loading team requests..." />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Applicant</th>
                      <th>Department</th>
                      <th>Type</th>
                      <th>Duration</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLeaves && allLeaves.length > 0 ? (
                      allLeaves.map((item) => {
                        const sDate = new Date(item.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        });
                        const eDate = new Date(item.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        });

                        return (
                          <tr key={item._id}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={
                                    item.user?.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      item.user?.name || 'Staff'
                                    )}&size=60`
                                  }
                                  alt=""
                                  className="rounded-circle border"
                                  style={{ width: '32px', height: '32px' }}
                                />
                                <div>
                                  <div className="fw-semibold small">{item.user?.name || 'Unknown'}</div>
                                  <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                    {item.user?.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="small text-secondary fw-medium">
                                {item.user?.department || 'Staff'}
                              </span>
                            </td>
                            <td>
                              <span className="small fw-semibold text-dark">{item.leaveType}</span>
                            </td>
                            <td>
                              <span className="small text-muted">
                                {sDate} &ndash; {eDate} ({item.daysCount}d)
                              </span>
                            </td>
                            <td>
                              <span className="small text-muted text-truncate d-inline-block" style={{ maxWidth: '180px' }}>
                                {item.reason}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge rounded-pill ${
                                  item.status === 'Approved'
                                    ? 'bg-success-subtle text-success'
                                    : item.status === 'Rejected'
                                    ? 'bg-danger-subtle text-danger'
                                    : 'bg-warning-subtle text-warning-emphasis'
                                } px-3 py-1 small`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="text-end pe-4">
                              {item.status === 'Pending' ? (
                                <div className="d-flex align-items-center justify-content-end gap-1">
                                  <button
                                    onClick={() => handleOpenReview(item, 'Approved')}
                                    className="btn btn-sm btn-success rounded-pill px-3 py-1 small d-flex align-items-center gap-1"
                                  >
                                    <FiCheck />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenReview(item, 'Rejected')}
                                    className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 small d-flex align-items-center gap-1"
                                  >
                                    <FiX />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="small text-muted">
                                  Processed ({item.reviewedBy?.name || 'Reviewer'})
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                          No leave applications matching the filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-navy">Apply for Time Off</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApplyModal(false)}
                ></button>
              </div>

              <form onSubmit={handleApplySubmit}>
                <div className="modal-body p-4">
                  {applyError && <div className="alert alert-danger py-2 small">{applyError}</div>}
                  {applySuccess && <div className="alert alert-success py-2 small">{applySuccess}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Leave Type *</label>
                    <select
                      className="form-select"
                      required
                      value={applyForm.leaveType}
                      onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                    >
                      {LEAVE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={applyForm.startDate}
                        onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={applyForm.endDate}
                        onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {daysCountPreview > 0 && (
                    <div className="p-3 bg-light rounded-3 border mb-3 small d-flex align-items-center justify-content-between">
                      <span className="text-muted">Calculated Leave Duration:</span>
                      <strong className="text-primary fs-6">
                        {daysCountPreview} {daysCountPreview === 1 ? 'Calendar Day' : 'Calendar Days'}
                      </strong>
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Reason for Absence *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      required
                      placeholder="Briefly describe the reason for your leave request..."
                      value={applyForm.reason}
                      onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 px-4 pb-4">
                  <button
                    type="button"
                    className="btn btn-light px-4 rounded-pill"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 rounded-pill"
                    disabled={applying}
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal (HR & Manager) */}
      {showReviewModal && selectedLeave && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-navy">
                  Review Leave Request: {reviewDecision}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowReviewModal(false)}
                ></button>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body p-4">
                  <div className="p-3 bg-light rounded-3 border mb-3">
                    <div className="fw-bold text-dark">{selectedLeave.user?.name}</div>
                    <div className="small text-muted mb-2">
                      {selectedLeave.leaveType} &bull; {selectedLeave.daysCount} days
                    </div>
                    <div className="small text-secondary">
                      <strong>Reason:</strong> {selectedLeave.reason}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Review Decision</label>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewDecision('Approved')}
                        className={`btn w-50 py-2 rounded-3 fw-semibold ${
                          reviewDecision === 'Approved' ? 'btn-success' : 'btn-outline-secondary'
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewDecision('Rejected')}
                        className={`btn w-50 py-2 rounded-3 fw-semibold ${
                          reviewDecision === 'Rejected' ? 'btn-danger' : 'btn-outline-secondary'
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label small fw-semibold">Supervisor Feedback Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 px-4 pb-4">
                  <button
                    type="button"
                    className="btn btn-light px-4 rounded-pill"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn px-4 rounded-pill ${
                      reviewDecision === 'Approved' ? 'btn-success' : 'btn-danger'
                    }`}
                    disabled={reviewing}
                  >
                    {reviewing ? 'Saving...' : `Confirm ${reviewDecision}`}
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

export default Leaves;
