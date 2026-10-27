import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiClock,
  FiCalendar,
  FiBookOpen,
  FiCheckCircle,
  FiAlertCircle,
  FiBell,
  FiArrowRight,
  FiMapPin,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard = () => {
  const { user, isHr, isManager } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [dashRes, todayRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/attendance/today'),
      ]);
      setData(dashRes.data);
      setTodayAttendance(todayRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setPunchFeedback('');
    try {
      const res = await api.post('/attendance/check-in', {
        location: 'Office (HQ)',
        notes: 'Clocked in from Dashboard',
      });
      setPunchFeedback(res.data?.message || 'Checked in successfully!');
      fetchDashboardData();
    } catch (err) {
      setPunchFeedback(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setPunchFeedback('');
    try {
      const res = await api.post('/attendance/check-out');
      setPunchFeedback(res.data?.message || 'Checked out successfully!');
      fetchDashboardData();
    } catch (err) {
      setPunchFeedback(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generating executive dashboard insights..." />;
  }

  const { stats, weeklyChartData, departmentStats, recentLeaves, recentAnnouncements } =
    data || {};

  const COLORS = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="container-fluid px-0">
      {/* Welcome & Quick Action Punch Banner */}
      <div className="card border-0 shadow-sm p-4 mb-4 rounded-4 bg-white">
        <div className="row align-items-center g-3">
          <div className="col-lg-7">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary text-white px-2 py-1 rounded">Live HRMS</span>
              <span className="text-muted small">&bull; Welcome back</span>
            </div>
            <h3 className="fw-bold text-navy mb-1">Good day, {user?.name}!</h3>
            <p className="text-muted small mb-0">
              {isHr
                ? 'Overview of active workforce metrics, pending authorizations, and team growth.'
                : isManager
                ? 'Team operational overview, leave reviews, and departmental training status.'
                : 'Manage your attendance punches, leave balances, and career training programs.'}
            </p>
          </div>

          <div className="col-lg-5">
            <div className="p-3 bg-light rounded-3 border d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
              <div>
                <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>
                  Today's Attendance Status
                </span>
                <span className="fw-bold d-flex align-items-center gap-1">
                  {todayAttendance?.checkedIn ? (
                    todayAttendance?.checkedOut ? (
                      <span className="text-secondary d-flex align-items-center gap-1">
                        <FiCheckCircle className="text-secondary" /> Clocked Out
                      </span>
                    ) : (
                      <span className="text-success d-flex align-items-center gap-1">
                        <FiCheckCircle className="text-success" /> Active on Duty
                      </span>
                    )
                  ) : (
                    <span className="text-warning d-flex align-items-center gap-1">
                      <FiAlertCircle className="text-warning" /> Not Checked In
                    </span>
                  )}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                {!todayAttendance?.checkedIn ? (
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="btn btn-sm btn-success rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1"
                  >
                    <FiClock />
                    <span>Check In Now</span>
                  </button>
                ) : !todayAttendance?.checkedOut ? (
                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1"
                  >
                    <FiClock />
                    <span>Clock Out</span>
                  </button>
                ) : (
                  <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill small">
                    Completed Today ({todayAttendance?.attendance?.workingHours || 0} hrs)
                  </span>
                )}
              </div>
            </div>

            {punchFeedback && (
              <div className="small text-primary mt-2 text-end fw-semibold">
                {punchFeedback}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Key Executive Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            icon={FiUsers}
            color="primary"
            subtitle={`${stats?.inactiveEmployees || 0} inactive records`}
            badgeText="Headcount"
            badgeType="primary-subtle"
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="Today's Attendance Rate"
            value={`${stats?.attendanceRate || 0}%`}
            icon={FiClock}
            color="success"
            subtitle={`${stats?.presentToday || 0} present (${stats?.lateToday || 0} late)`}
            badgeText="Biometric Log"
            badgeType="success-subtle"
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="Pending Leaves"
            value={stats?.pendingLeaves || 0}
            icon={FiCalendar}
            color="warning"
            subtitle="Awaiting management review"
            badgeText="Requests"
            badgeType="warning-subtle"
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="Active Trainings"
            value={stats?.activeTrainings || 0}
            icon={FiBookOpen}
            color="purple"
            subtitle={`${stats?.totalEnrollments || 0} employee enrollments`}
            badgeText="Workforce L&D"
            badgeType="light"
          />
        </div>
      </div>

      {/* Charts Section: Weekly Trend & Department Distribution */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white d-flex align-items-center justify-content-between border-0 pt-4 px-4 pb-0">
              <div>
                <h5 className="fw-bold text-navy mb-1">Weekly Attendance Trends</h5>
                <span className="small text-muted">
                  Present, late, and absentee dynamics across the previous 7 work days
                </span>
              </div>
              <Link to="/attendance" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                Full Log
              </Link>
            </div>
            <div className="card-body p-4" style={{ height: '340px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData || []} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      border: 'none',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="present" fill="#2563eb" name="Present On-Time" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" fill="#f59e0b" name="Late Arrivals" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h5 className="fw-bold text-navy mb-1">Department Ratio</h5>
              <span className="small text-muted">Active staff distribution by department</span>
            </div>
            <div className="card-body p-3 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '340px' }}>
              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentStats || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(departmentStats || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-100 d-flex flex-wrap gap-2 justify-content-center mt-2">
                {(departmentStats || []).map((dept, index) => (
                  <span
                    key={dept.name}
                    className="badge rounded-pill bg-light text-dark border px-2 py-1 small fw-normal d-flex align-items-center gap-1"
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <span>{dept.name} ({dept.value})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Leaves & Announcements */}
      <div className="row g-4">
        {/* Recent Leave Requests */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white d-flex align-items-center justify-content-between border-0 pt-4 px-4 pb-2">
              <div>
                <h5 className="fw-bold text-navy mb-1">Recent Leave Applications</h5>
                <span className="small text-muted">Latest employee leave submissions</span>
              </div>
              <Link to="/leaves" className="btn btn-sm btn-link text-decoration-none">
                View all leaves &rarr;
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Employee</th>
                      <th>Type</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeaves && recentLeaves.length > 0 ? (
                      recentLeaves.map((leave) => {
                        const sDate = new Date(leave.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        });
                        const eDate = new Date(leave.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        });

                        return (
                          <tr key={leave._id}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={
                                    leave.user?.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      leave.user?.name || 'Staff'
                                    )}&size=60`
                                  }
                                  alt=""
                                  className="rounded-circle border"
                                  style={{ width: '32px', height: '32px' }}
                                />
                                <div>
                                  <div className="fw-semibold small">{leave.user?.name || 'Unknown'}</div>
                                  <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                    {leave.user?.department || 'Staff'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="small fw-medium text-dark">{leave.leaveType}</span>
                            </td>
                            <td>
                              <span className="small text-muted">
                                {sDate} &ndash; {eDate} ({leave.daysCount}d)
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge rounded-pill ${
                                  leave.status === 'Approved'
                                    ? 'bg-success-subtle text-success'
                                    : leave.status === 'Rejected'
                                    ? 'bg-danger-subtle text-danger'
                                    : 'bg-warning-subtle text-warning-emphasis'
                                } px-2 py-1 small`}
                              >
                                {leave.status}
                              </span>
                            </td>
                            <td className="text-end pe-4">
                              <Link
                                to="/leaves"
                                className="btn btn-sm btn-light border rounded-pill px-3 py-1 small"
                              >
                                Review
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted small">
                          No recent leave applications on file.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Company Announcements Preview */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white d-flex align-items-center justify-content-between border-0 pt-4 px-4 pb-2">
              <div className="d-flex align-items-center gap-2">
                <FiBell className="text-primary" />
                <h5 className="fw-bold text-navy mb-0">Company Broadcasts</h5>
              </div>
              <Link to="/announcements" className="btn btn-sm btn-link text-decoration-none">
                All &rarr;
              </Link>
            </div>
            <div className="card-body p-4 pt-2">
              <div className="d-flex flex-column gap-3">
                {recentAnnouncements && recentAnnouncements.length > 0 ? (
                  recentAnnouncements.map((ann) => {
                    const postDate = new Date(ann.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={ann._id}
                        className="p-3 rounded-3 border bg-light transition-all hover-shadow-sm"
                      >
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 small">
                            {ann.category}
                          </span>
                          <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                            {postDate}
                          </span>
                        </div>
                        <h6 className="fw-bold text-dark mb-1 small">{ann.title}</h6>
                        <p className="text-muted small mb-0 text-truncate-2" style={{ fontSize: '0.82rem' }}>
                          {ann.content}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-muted small">
                    No active company broadcasts at this time.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
