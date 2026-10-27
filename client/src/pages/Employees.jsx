import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FiUsers,
  FiSearch,
  FiPlus,
  FiEdit2,
  FiEye,
  FiPower,
  FiPhone,
  FiMail,
  FiBriefcase,
  FiDollarSign,
  FiMapPin,
  FiTag,
  FiX,
  FiCheck,
} from 'react-icons/fi';

const DEPARTMENTS = [
  'All',
  'Engineering',
  'Human Resources',
  'Product & Design',
  'Marketing',
  'Sales',
  'Finance & Legal',
  'Customer Operations',
];

const ROLES = ['All', 'HR', 'Manager', 'Employee'];
const STATUSES = ['All', 'Active', 'Inactive'];

const Employees = () => {
  const { user, isHr } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    position: '',
    phone: '',
    salary: '',
    address: '',
    skills: '',
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (department !== 'All') params.department = department;
      if (role !== 'All') params.role = role.toLowerCase();
      if (status !== 'All') params.status = status.toLowerCase();

      const res = await api.get('/employees', { params });
      if (res.data?.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEmployees();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, department, role, status]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: 'Engineering',
      position: '',
      phone: '',
      salary: '',
      address: '',
      skills: '',
    });
    setFormError('');
    setFormSuccess('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name || '',
      email: emp.email || '',
      password: '',
      role: emp.role || 'employee',
      department: emp.department || 'Engineering',
      position: emp.position || '',
      phone: emp.phone || '',
      salary: emp.salary || '',
      address: emp.address || '',
      skills: Array.isArray(emp.skills) ? emp.skills.join(', ') : '',
    });
    setFormError('');
    setFormSuccess('');
    setShowEditModal(true);
  };

  const handleOpenView = (emp) => {
    setSelectedEmployee(emp);
    setShowViewModal(true);
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        salary: Number(formData.salary) || 60000,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()) : [],
      };

      const res = await api.post('/employees', payload);
      if (res.data?.success) {
        setFormSuccess('Employee created successfully!');
        setTimeout(() => {
          setShowAddModal(false);
          fetchEmployees();
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        department: formData.department,
        position: formData.position,
        role: formData.role,
        phone: formData.phone,
        salary: Number(formData.salary) || undefined,
        address: formData.address,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()) : undefined,
      };

      const res = await api.put(`/employees/${selectedEmployee._id}`, payload);
      if (res.data?.success) {
        setFormSuccess('Employee updated successfully!');
        setTimeout(() => {
          setShowEditModal(false);
          fetchEmployees();
        }, 800);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (emp) => {
    const action = emp.status === 'active' ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${emp.name}?`)) {
      return;
    }

    try {
      await api.patch(`/employees/${emp._id}/toggle-status`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Header bar */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-navy mb-1">Employee Directory</h3>
          <p className="text-muted small mb-0">
            View, search, and manage workforce profiles across organizational units.
          </p>
        </div>

        {isHr && (
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 py-2"
          >
            <FiPlus size={18} />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-2">
          <div className="col-lg-4 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <FiSearch />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by name, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  Dept: {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="col-lg-2 col-md-6">
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  Role: {r}
                </option>
              ))}
            </select>
          </div>

          <div className="col-lg-3 col-md-6">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        {loading ? (
          <LoadingSpinner message="Loading employee directory..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={
                              emp.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                emp.name
                              )}&background=2563eb&color=fff&size=80`
                            }
                            alt=""
                            className="rounded-circle border"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-semibold text-dark">{emp.name}</div>
                            <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                              {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border px-2 py-1 rounded-pill small fw-normal">
                          {emp.department}
                        </span>
                      </td>
                      <td>
                        <span className="small fw-medium text-secondary">{emp.position}</span>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill text-capitalize px-3 py-1 ${
                            emp.role === 'hr'
                              ? 'bg-primary-subtle text-primary'
                              : emp.role === 'manager'
                              ? 'bg-info-subtle text-info-emphasis'
                              : 'bg-secondary-subtle text-secondary'
                          }`}
                        >
                          {emp.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-1 ${
                            emp.status === 'active'
                              ? 'bg-success-subtle text-success'
                              : 'bg-danger-subtle text-danger'
                          }`}
                        >
                          {emp.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            onClick={() => handleOpenView(emp)}
                            className="btn btn-sm btn-light border text-muted p-2 rounded-3 hover-text-primary"
                            title="View Full Profile"
                          >
                            <FiEye size={15} />
                          </button>

                          {isHr && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(emp)}
                                className="btn btn-sm btn-light border text-muted p-2 rounded-3 hover-text-primary"
                                title="Edit Employee"
                              >
                                <FiEdit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(emp)}
                                disabled={emp._id === user?._id}
                                className={`btn btn-sm border p-2 rounded-3 ${
                                  emp.status === 'active'
                                    ? 'btn-light text-danger'
                                    : 'btn-success text-white'
                                }`}
                                title={
                                  emp.status === 'active' ? 'Deactivate Account' : 'Reactivate Account'
                                }
                              >
                                <FiPower size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No matching employee records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Profile Modal */}
      {showViewModal && selectedEmployee && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={
                      selectedEmployee.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedEmployee.name
                      )}&background=2563eb&color=fff&size=100`
                    }
                    alt=""
                    className="rounded-circle border"
                    style={{ width: '56px', height: '56px' }}
                  />
                  <div>
                    <h5 className="modal-title fw-bold text-navy mb-0">{selectedEmployee.name}</h5>
                    <span className="small text-muted">
                      {selectedEmployee.position} &bull; {selectedEmployee.department}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold small text-muted text-uppercase mb-3">Employment Details</h6>
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex align-items-center gap-2 small">
                        <FiBriefcase className="text-primary" />
                        <span className="text-muted">Role:</span>
                        <strong className="text-capitalize">{selectedEmployee.role}</strong>
                      </div>
                      <div className="d-flex align-items-center gap-2 small">
                        <FiMail className="text-primary" />
                        <span className="text-muted">Email:</span>
                        <strong>{selectedEmployee.email}</strong>
                      </div>
                      <div className="d-flex align-items-center gap-2 small">
                        <FiPhone className="text-primary" />
                        <span className="text-muted">Phone:</span>
                        <strong>{selectedEmployee.phone || 'N/A'}</strong>
                      </div>
                      {selectedEmployee.salary && (
                        <div className="d-flex align-items-center gap-2 small">
                          <FiDollarSign className="text-success" />
                          <span className="text-muted">Annual Compensation:</span>
                          <strong>${selectedEmployee.salary.toLocaleString()} USD</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-bold small text-muted text-uppercase mb-3">Location & Emergency</h6>
                    <div className="d-flex flex-column gap-2 small">
                      <div className="d-flex align-items-start gap-2">
                        <FiMapPin className="text-primary mt-1" />
                        <div>
                          <span className="text-muted d-block">Work / Residential Address:</span>
                          <strong>{selectedEmployee.address || 'Standard HQ Location'}</strong>
                        </div>
                      </div>
                      {selectedEmployee.emergencyContact && (
                        <div className="p-2 bg-light rounded-3 mt-1">
                          <span className="text-muted small d-block">Emergency Contact:</span>
                          <strong>
                            {selectedEmployee.emergencyContact.name} (
                            {selectedEmployee.emergencyContact.relationship})
                          </strong>
                          <div className="text-muted small">
                            {selectedEmployee.emergencyContact.phone}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-12 pt-2 border-top">
                    <h6 className="fw-bold small text-muted text-uppercase mb-2">Technical Skills & Competencies</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedEmployee.skills && selectedEmployee.skills.length > 0 ? (
                        selectedEmployee.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill small fw-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted small">No specific skills listed.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 px-4 pb-4">
                <button
                  type="button"
                  className="btn btn-light px-4 rounded-pill"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal (HR Only) */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-navy">Add New Employee</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateEmployee}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 small">{formError}</div>}
                  {formSuccess && <div className="alert alert-success py-2 small">{formSuccess}</div>}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Full Legal Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rachel Adams"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Work Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. rachel.adams@staffsync.com"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Initial Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Leave blank for 'Password123!'"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">System Role *</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR Administrator</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Department *</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Position / Job Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="e.g. Senior Frontend Engineer"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Annual Salary (USD)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="e.g. 75000"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Residential / Office Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Corporate Blvd, Suite 400"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Skills (Comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        placeholder="e.g. React.js, TypeScript, Project Leadership"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 px-4 pb-4">
                  <button
                    type="button"
                    className="btn btn-light px-4 rounded-pill"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 rounded-pill"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating Employee...' : 'Save Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal (HR Only) */}
      {showEditModal && selectedEmployee && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-navy">Edit Employee Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              <form onSubmit={handleUpdateEmployee}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 small">{formError}</div>}
                  {formSuccess && <div className="alert alert-success py-2 small">{formSuccess}</div>}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Full Legal Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">System Role *</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR Administrator</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Department *</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Position / Job Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Annual Salary (USD)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Residential / Office Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Skills (Comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 px-4 pb-4">
                  <button
                    type="button"
                    className="btn btn-light px-4 rounded-pill"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 rounded-pill"
                    disabled={submitting}
                  >
                    {submitting ? 'Updating...' : 'Save Changes'}
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

export default Employees;
