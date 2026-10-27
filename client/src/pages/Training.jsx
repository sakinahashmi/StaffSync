import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FiBookOpen,
  FiPlus,
  FiCheckCircle,
  FiCalendar,
  FiUser,
  FiAward,
  FiMapPin,
  FiClock,
  FiLayers,
  FiTrash2,
} from 'react-icons/fi';

const Training = () => {
  const { user, isHr } = useAuth();

  // Tabs: 'catalog' or 'my'
  const [activeTab, setActiveTab] = useState('catalog');

  const [trainings, setTrainings] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoadingId, setEnrollLoadingId] = useState(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('All');

  // Create Modal (HR)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    department: 'All',
    startDate: '',
    endDate: '',
    capacity: 30,
    mode: 'Online',
    locationOrLink: 'Virtual Classroom (Zoom)',
    skillsCovered: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCatalog = async () => {
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/trainings', { params });
      if (res.data?.success) {
        setTrainings(res.data.trainings);
      }
    } catch (err) {
      console.error('Failed to load trainings:', err);
    }
  };

  const fetchMyEnrollments = async () => {
    try {
      const res = await api.get('/trainings/my-enrollments');
      if (res.data?.success) {
        setMyEnrollments(res.data.enrollments);
      }
    } catch (err) {
      console.error('Failed to load my enrollments:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchCatalog(), fetchMyEnrollments()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [statusFilter]);

  const handleEnroll = async (trainingId) => {
    setEnrollLoadingId(trainingId);
    try {
      const res = await api.post(`/trainings/${trainingId}/enroll`);
      if (res.data?.success) {
        alert('Enrolled in training program successfully!');
        await loadAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrollLoadingId(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity) || 30,
        skillsCovered: formData.skillsCovered
          ? formData.skillsCovered.split(',').map((s) => s.trim())
          : [],
      };

      const res = await api.post('/trainings', payload);
      if (res.data?.success) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          instructor: '',
          department: 'All',
          startDate: '',
          endDate: '',
          capacity: 30,
          mode: 'Online',
          locationOrLink: 'Virtual Classroom (Zoom)',
          skillsCovered: '',
        });
        loadAllData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create training');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTraining = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training program?')) {
      return;
    }

    try {
      await api.delete(`/trainings/${id}`);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete training');
    }
  };

  const handleUpdateProgress = async (enrollmentId, newStatus) => {
    try {
      await api.patch(`/trainings/enrollments/${enrollmentId}`, {
        status: newStatus,
      });
      fetchMyEnrollments();
      fetchCatalog();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-navy mb-1">Learning & Development</h3>
          <p className="text-muted small mb-0">
            Professional development courses, skills enhancement workshops, and certifications.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="btn-group p-1 bg-white border rounded-pill shadow-xs">
            <button
              className={`btn btn-sm rounded-pill px-3 py-1 ${
                activeTab === 'catalog' ? 'btn-primary' : 'btn-light border-0'
              }`}
              onClick={() => setActiveTab('catalog')}
            >
              Course Catalog
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 py-1 ${
                activeTab === 'my' ? 'btn-primary' : 'btn-light border-0'
              }`}
              onClick={() => setActiveTab('my')}
            >
              My Enrollments ({myEnrollments.length})
            </button>
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
              <span>Create Program</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab: Course Catalog */}
      {activeTab === 'catalog' && (
        <div>
          {/* Status filter chip bar */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">Status:</span>
              {['All', 'Upcoming', 'Ongoing', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`btn btn-sm rounded-pill px-3 py-1 ${
                    statusFilter === st ? 'btn-navy text-white bg-navy' : 'btn-light border text-muted'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <span className="small text-muted">{trainings.length} programs available</span>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading training curriculum..." />
          ) : trainings.length > 0 ? (
            <div className="row g-4">
              {trainings.map((course) => {
                const sDate = new Date(course.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const eDate = new Date(course.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                const occupancy = Math.round(
                  ((course.enrolledCount || 0) / (course.capacity || 1)) * 100
                );

                return (
                  <div key={course._id} className="col-lg-6 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white d-flex flex-column justify-content-between hover-shadow-sm transition-all">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span
                            className={`badge rounded-pill px-3 py-1 small ${
                              course.status === 'Ongoing'
                                ? 'bg-primary-subtle text-primary'
                                : course.status === 'Upcoming'
                                ? 'bg-warning-subtle text-warning-emphasis'
                                : 'bg-success-subtle text-success'
                            }`}
                          >
                            {course.status}
                          </span>

                          <div className="d-flex align-items-center gap-1">
                            <span className="badge bg-light text-secondary border rounded-pill px-2 py-1 small fw-normal">
                              {course.mode}
                            </span>
                            {isHr && (
                              <button
                                onClick={() => handleDeleteTraining(course._id)}
                                className="btn btn-sm btn-link text-danger p-0 ms-2"
                                title="Delete Program"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        <h5 className="fw-bold text-navy mb-2">{course.title}</h5>
                        <p className="text-muted small mb-3 lh-base" style={{ minHeight: '42px' }}>
                          {course.description}
                        </p>

                        <div className="d-flex flex-column gap-2 mb-3 small text-secondary">
                          <div className="d-flex align-items-center gap-2">
                            <FiUser className="text-primary" />
                            <span>
                              <strong>Instructor:</strong> {course.instructor}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <FiCalendar className="text-primary" />
                            <span>
                              {sDate} &ndash; {eDate}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <FiMapPin className="text-primary" />
                            <span className="text-truncate">{course.locationOrLink}</span>
                          </div>
                        </div>

                        {course.skillsCovered && course.skillsCovered.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mb-3">
                            {course.skillsCovered.map((skill, idx) => (
                              <span
                                key={idx}
                                className="badge bg-light text-muted border px-2 py-1 rounded-pill small"
                                style={{ fontSize: '0.72rem' }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-top">
                        <div className="d-flex align-items-center justify-content-between mb-2 small text-muted">
                          <span>Capacity</span>
                          <strong>
                            {course.enrolledCount} / {course.capacity} seats ({occupancy}%)
                          </strong>
                        </div>
                        <div className="progress mb-3" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${Math.min(100, occupancy)}%` }}
                          ></div>
                        </div>

                        {course.isEnrolled ? (
                          <div className="btn btn-outline-success w-100 rounded-pill small py-2 fw-semibold disabled d-flex align-items-center justify-content-center gap-1">
                            <FiCheckCircle />
                            <span>Already Enrolled</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course._id)}
                            disabled={
                              enrollLoadingId === course._id ||
                              course.enrolledCount >= course.capacity ||
                              course.status === 'Completed'
                            }
                            className="btn btn-primary w-100 rounded-pill small py-2 fw-semibold"
                          >
                            {enrollLoadingId === course._id
                              ? 'Enrolling...'
                              : course.enrolledCount >= course.capacity
                              ? 'Fully Booked'
                              : 'Enroll Now'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <FiBookOpen size={42} className="text-muted mx-auto mb-3" />
              <h5 className="fw-bold text-navy">No Training Programs</h5>
              <p className="text-muted small mb-0">
                No active training programs match the selected filter.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: My Enrollments */}
      {activeTab === 'my' && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-0 pt-4 px-4 pb-2">
            <h5 className="fw-bold text-navy mb-0">My Learning Dashboard</h5>
            <span className="small text-muted">Your registered programs and certifications</span>
          </div>

          <div className="card-body p-0">
            {myEnrollments.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Course Title</th>
                      <th>Instructor</th>
                      <th>Mode</th>
                      <th>Enrolled Date</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Progress Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myEnrollments.map((item) => (
                      <tr key={item._id}>
                        <td className="ps-4">
                          <div className="fw-semibold text-dark">{item.training?.title}</div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            {item.training?.department} &bull; {item.training?.locationOrLink}
                          </div>
                        </td>
                        <td>
                          <span className="small text-secondary">{item.training?.instructor}</span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border px-2 py-1 rounded-pill small">
                            {item.training?.mode}
                          </span>
                        </td>
                        <td>
                          <span className="small text-muted">
                            {new Date(item.enrolledAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill ${
                              item.status === 'Completed'
                                ? 'bg-success-subtle text-success'
                                : item.status === 'In Progress'
                                ? 'bg-primary-subtle text-primary'
                                : 'bg-warning-subtle text-warning-emphasis'
                            } px-3 py-1 small`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          {item.status !== 'Completed' ? (
                            <div className="d-flex align-items-center justify-content-end gap-1">
                              {item.status === 'Enrolled' && (
                                <button
                                  onClick={() => handleUpdateProgress(item._id, 'In Progress')}
                                  className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 small"
                                >
                                  Start Course
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateProgress(item._id, 'Completed')}
                                className="btn btn-sm btn-success rounded-pill px-3 py-1 small d-flex align-items-center gap-1"
                              >
                                <FiCheckCircle />
                                <span>Mark Completed</span>
                              </button>
                            </div>
                          ) : (
                            <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill small">
                              Certified & Complete
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5 text-center text-muted">
                <FiAward size={40} className="mb-2 text-muted" />
                <h6 className="fw-bold">No active enrollments</h6>
                <p className="small mb-3">Explore the course catalog to enroll in upcoming skill programs.</p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="btn btn-sm btn-primary rounded-pill px-4"
                >
                  Browse Catalog
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Training Program Modal (HR Only) */}
      {showCreateModal && isHr && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-navy">Create Training Program</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 small">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Course Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Modern Cloud Native Architecture with Docker"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Course Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      required
                      placeholder="Overview of learning objectives, prerequisites, and syllabus..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Instructor Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Dr. Robert Vance"
                        value={formData.instructor}
                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Target Department</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="All">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Capacity (Seats)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Delivery Mode</label>
                      <select
                        className="form-select"
                        value={formData.mode}
                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                      >
                        <option value="Online">Online Virtual</option>
                        <option value="In-Person">In-Person Classroom</option>
                        <option value="Hybrid">Hybrid Delivery</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Location / Link</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.locationOrLink}
                        onChange={(e) => setFormData({ ...formData, locationOrLink: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Skills Covered (Comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. React, Node.js, Cloud Design"
                      value={formData.skillsCovered}
                      onChange={(e) => setFormData({ ...formData, skillsCovered: e.target.value })}
                    />
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
                    {submitting ? 'Creating...' : 'Publish Program'}
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

export default Training;
