import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiMapPin,
  FiFilter,
  FiPlus,
  FiUser,
  FiActivity,
} from 'react-icons/fi';

const Attendance = () => {
  const { user, isHr, isManager } = useAuth();

  // Active view tab: 'my' or 'company' (for HR/Manager)
  const [activeTab, setActiveTab] = useState('my');

  // Personal punch state
  const [todayStatus, setTodayStatus] = useState(null);
  const [myHistory, setMyHistory] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [locationType, setLocationType] = useState('Office (HQ)');
  const [punchNotes, setPunchNotes] = useState('');
  const [message, setMessage] = useState('');

  // Company attendance state (HR & Manager)
  const [companyRecords, setCompanyRecords] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Manual entry modal (HR only)
  const [showManualModal, setShowManualModal] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [manualForm, setManualForm] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '17:30',
    status: 'Present',
    location: 'Office (HQ)',
    notes: 'Approved manual adjustment by HR',
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Live timer clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMyAttendanceData = async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/my-history'),
      ]);
      setTodayStatus(todayRes.data);
      setMyHistory(historyRes.data?.records || []);
      setMyStats(historyRes.data?.stats || null);
    } catch (err) {
      console.error('Failed to load my attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyAttendance = async () => {
    if (!isHr && !isManager) return;
    setCompanyLoading(true);
    try {
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (selectedDepartment !== 'All') params.department = selectedDepartment;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await api.get('/attendance', { params });
      if (res.data?.success) {
        setCompanyRecords(res.data.records);
      }
    } catch (err) {
      console.error('Failed to load company attendance:', err);
    } finally {
      setCompanyLoading(false);
    }
  };

  const fetchEmployeesForManual = async () => {
    if (!isHr) return;
    try {
      const res = await api.get('/employees');
      if (res.data?.success) {
        setEmployeesList(res.data.employees);
        if (res.data.employees.length > 0) {
          setManualForm((prev) => ({ ...prev, userId: res.data.employees[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load employees for manual punch:', err);
    }
  };

  useEffect(() => {
    fetchMyAttendanceData();
    if (isHr || isManager) {
      fetchCompanyAttendance();
    }
    if (isHr) {
      fetchEmployeesForManual();
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'company' && (isHr || isManager)) {
      fetchCompanyAttendance();
    }
  }, [selectedDate, selectedDepartment, selectedStatus, activeTab]);

  const handlePunchIn = async () => {
    setPunchLoading(true);
    setMessage('');
    try {
      const res = await api.post('/attendance/check-in', {
        location: locationType,
        notes: punchNotes,
      });
      setMessage(res.data?.message || 'Checked in successfully!');
      fetchMyAttendanceData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to check in');
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setPunchLoading(true);
    setMessage('');
    try {
      const res = await api.post('/attendance/check-out');
      setMessage(res.data?.message || 'Checked out successfully!');
      fetchMyAttendanceData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to check out');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualSubmitting(true);
    try {
      await api.post('/attendance/manual', manualForm);
      setShowManualModal(false);
      fetchCompanyAttendance();
      alert('Manual attendance entry recorded successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record manual attendance');
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-navy mb-1">Attendance & Biometrics</h3>
          <p className="text-muted small mb-0">
            Real-time biometric punch tracking, shift duration calculation, and workforce attendance registers.
          </p>
        </div>

        {/* Tab Switcher for HR/Manager */}
        {(isHr || isManager) && (
          <div className="d-flex align-items-center gap-2">
            <div className="btn-group p-1 bg-white border rounded-pill shadow-xs">
              <button
                className={`btn btn-sm rounded-pill px-3 py-1 ${
                  activeTab === 'my' ? 'btn-primary' : 'btn-light border-0'
                }`}
                onClick={() => setActiveTab('my')}
              >
                My Punches
              </button>
              <button
                className={`btn btn-sm rounded-pill px-3 py-1 ${
                  activeTab === 'company' ? 'btn-primary' : 'btn-light border-0'
                }`}
                onClick={() => setActiveTab('company')}
              >
                Organization Register
              </button>
            </div>

            {isHr && activeTab === 'company' && (
              <button
                onClick={() => setShowManualModal(true)}
                className="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 d-flex align-items-center gap-1"
              >
                <FiPlus size={16} />
                <span>Manual Punch</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab: My Punches */}
      {activeTab === 'my' && (
        <div className="row g-4">
          {/* Left Column: Live Clock Punch Terminal */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="badge bg-primary-subtle text-primary px-3 py-1 rounded-pill small fw-semibold">
                    Live Punch Clock
                  </span>
                  <div className="small text-muted d-flex align-items-center gap-1">
                    <FiCalendar />
                    <span>{currentTime.toDateString()}</span>
                  </div>
                </div>

                {/* Big Live Digital Clock */}
                <div className="text-center py-4 my-2 bg-light rounded-4 border">
                  <div className="display-4 fw-bold text-navy mb-0 tracking-wider">
                    {currentTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                  <span className="small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>
                    Standard Working Hours: 09:00 AM &ndash; 05:30 PM
                  </span>
                </div>

                {message && (
                  <div className="alert alert-info py-2 px-3 small rounded-3 mb-3">
                    {message}
                  </div>
                )}

                {/* Today's Punch Information */}
                <div className="mb-4">
                  <h6 className="fw-bold small text-muted text-uppercase mb-2">Today's Activity</h6>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="row g-2 text-center">
                      <div className="col-6 border-end">
                        <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>
                          First Punch In
                        </span>
                        <strong className="text-dark small">
                          {todayStatus?.attendance?.checkIn
                            ? new Date(todayStatus.attendance.checkIn).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-- : --'}
                        </strong>
                      </div>
                      <div className="col-6">
                        <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>
                          Last Punch Out
                        </span>
                        <strong className="text-dark small">
                          {todayStatus?.attendance?.checkOut
                            ? new Date(todayStatus.attendance.checkOut).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-- : --'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location & Notes selection if not checked in */}
                {!todayStatus?.checkedIn && (
                  <div className="mb-4">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Punch Location</label>
                      <select
                        className="form-select"
                        value={locationType}
                        onChange={(e) => setLocationType(e.target.value)}
                      >
                        <option value="Office (HQ)">Office (HQ)</option>
                        <option value="Remote">Remote / Work From Home</option>
                        <option value="Client Site">Client Site</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label small fw-semibold text-muted">Notes / Shift Details</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Standard morning shift"
                        value={punchNotes}
                        onChange={(e) => setPunchNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Punch Buttons */}
              <div className="pt-3 border-top">
                {!todayStatus?.checkedIn ? (
                  <button
                    onClick={handlePunchIn}
                    disabled={punchLoading}
                    className="btn btn-success w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  >
                    <FiClock size={20} />
                    <span>{punchLoading ? 'Recording Punch In...' : 'Clock In for Today'}</span>
                  </button>
                ) : !todayStatus?.checkedOut ? (
                  <button
                    onClick={handlePunchOut}
                    disabled={punchLoading}
                    className="btn btn-danger w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  >
                    <FiClock size={20} />
                    <span>{punchLoading ? 'Recording Punch Out...' : 'Clock Out (Finish Day)'}</span>
                  </button>
                ) : (
                  <div className="text-center p-3 bg-success-subtle text-success rounded-3 fw-semibold small">
                    <FiCheckCircle className="me-1" />
                    Day completed! Logged {todayStatus.attendance?.workingHours || 0} working hours.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Attendance History & Personal Stats */}
          <div className="col-lg-7">
            {/* Quick Personal Metric Bar */}
            <div className="row g-3 mb-4">
              <div className="col-sm-4">
                <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
                  <span className="small text-muted d-block mb-1">Attendance Rate</span>
                  <h3 className="fw-bold text-primary mb-0">{myStats?.attendanceRate || 100}%</h3>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
                  <span className="small text-muted d-block mb-1">Present Days</span>
                  <h3 className="fw-bold text-success mb-0">{myStats?.presentDays || 0}</h3>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
                  <span className="small text-muted d-block mb-1">Avg. Hours/Day</span>
                  <h3 className="fw-bold text-navy mb-0">{myStats?.averageHours || 0}h</h3>
                </div>
              </div>
            </div>

            {/* Attendance History Table */}
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              <div className="card-header bg-white border-0 pt-4 px-4 pb-2">
                <h5 className="fw-bold text-navy mb-0">My Recent Attendance Records</h5>
                <span className="small text-muted">Past 60 calendar working day logs</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Date</th>
                        <th>In / Out</th>
                        <th>Working Hours</th>
                        <th>Location</th>
                        <th className="text-end pe-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myHistory && myHistory.length > 0 ? (
                        myHistory.map((item) => (
                          <tr key={item._id}>
                            <td className="ps-4 fw-medium text-dark small">{item.date}</td>
                            <td>
                              <div className="small">
                                <span className="text-success fw-semibold">
                                  {item.checkIn
                                    ? new Date(item.checkIn).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : '--'}
                                </span>
                                {' - '}
                                <span className="text-secondary">
                                  {item.checkOut
                                    ? new Date(item.checkOut).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : '--'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="small fw-bold text-dark">
                                {item.workingHours ? `${item.workingHours} hrs` : '--'}
                              </span>
                            </td>
                            <td>
                              <span className="small text-muted d-flex align-items-center gap-1">
                                <FiMapPin size={12} className="text-primary" />
                                {item.location || 'Office (HQ)'}
                              </span>
                            </td>
                            <td className="text-end pe-4">
                              <span
                                className={`badge rounded-pill ${
                                  item.status === 'Present'
                                    ? 'bg-success-subtle text-success'
                                    : item.status === 'Late'
                                    ? 'bg-warning-subtle text-warning-emphasis'
                                    : item.status === 'Half Day'
                                    ? 'bg-info-subtle text-info-emphasis'
                                    : 'bg-danger-subtle text-danger'
                                } px-3 py-1 small`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted small">
                            No attendance history recorded yet. Punch in to begin tracking!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Organization Register (HR & Managers) */}
      {activeTab === 'company' && (isHr || isManager) && (
        <div>
          {/* Filters Bar */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
            <div className="row g-2 align-items-center">
              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted mb-1">Calendar Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted mb-1">Department</label>
                <select
                  className="form-select"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance & Legal">Finance & Legal</option>
                  <option value="Customer Operations">Customer Operations</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted mb-1">Status</label>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Company Table */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            {companyLoading ? (
              <LoadingSpinner message="Fetching company attendance logs..." />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Employee</th>
                      <th>Department</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Duration</th>
                      <th>Location</th>
                      <th className="text-end pe-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyRecords && companyRecords.length > 0 ? (
                      companyRecords.map((r) => (
                        <tr key={r._id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={
                                  r.user?.avatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    r.user?.name || 'Staff'
                                  )}&size=60`
                                }
                                alt=""
                                className="rounded-circle border"
                                style={{ width: '32px', height: '32px' }}
                              />
                              <div>
                                <div className="fw-semibold small">{r.user?.name || 'Unknown'}</div>
                                <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                  {r.user?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="small text-secondary fw-medium">
                              {r.user?.department || 'Unassigned'}
                            </span>
                          </td>
                          <td>
                            <span className="small text-success fw-medium">
                              {r.checkIn
                                ? new Date(r.checkIn).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '--'}
                            </span>
                          </td>
                          <td>
                            <span className="small text-secondary">
                              {r.checkOut
                                ? new Date(r.checkOut).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '--'}
                            </span>
                          </td>
                          <td>
                            <span className="small fw-bold text-dark">
                              {r.workingHours ? `${r.workingHours} hrs` : '--'}
                            </span>
                          </td>
                          <td>
                            <span className="small text-muted">{r.location || 'Office (HQ)'}</span>
                          </td>
                          <td className="text-end pe-4">
                            <span
                              className={`badge rounded-pill ${
                                r.status === 'Present'
                                  ? 'bg-success-subtle text-success'
                                  : r.status === 'Late'
                                  ? 'bg-warning-subtle text-warning-emphasis'
                                  : r.status === 'Half Day'
                                  ? 'bg-info-subtle text-info-emphasis'
                                  : 'bg-danger-subtle text-danger'
                              } px-3 py-1 small`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                          No attendance records found for the selected criteria.
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

      {/* Manual Attendance Modal (HR Only) */}
      {showManualModal && isHr && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-navy">Record Manual Attendance</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowManualModal(false)}
                ></button>
              </div>

              <form onSubmit={handleManualSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Employee *</label>
                    <select
                      className="form-select"
                      required
                      value={manualForm.userId}
                      onChange={(e) => setManualForm({ ...manualForm, userId: e.target.value })}
                    >
                      {employeesList.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} ({emp.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={manualForm.date}
                      onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Check-In Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={manualForm.checkIn}
                        onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Check-Out Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={manualForm.checkOut}
                        onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={manualForm.status}
                        onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Half Day">Half Day</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Location</label>
                      <select
                        className="form-select"
                        value={manualForm.location}
                        onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
                      >
                        <option value="Office (HQ)">Office (HQ)</option>
                        <option value="Remote">Remote</option>
                        <option value="Client Site">Client Site</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Adjustment Reason</label>
                    <input
                      type="text"
                      className="form-control"
                      value={manualForm.notes}
                      onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 px-4 pb-4">
                  <button
                    type="button"
                    className="btn btn-light px-4 rounded-pill"
                    onClick={() => setShowManualModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 rounded-pill"
                    disabled={manualSubmitting}
                  >
                    {manualSubmitting ? 'Saving...' : 'Save Record'}
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

export default Attendance;
