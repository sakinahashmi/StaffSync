import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiLock,
  FiCheck,
  FiSave,
} from 'react-icons/fi';

const Profile = () => {
  const { user, updateUser } = useAuth();

  // Profile fields state
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [skills, setSkills] = useState(
    Array.isArray(user?.skills) ? user.skills.join(', ') : ''
  );
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [emergencyName, setEmergencyName] = useState(
    user?.emergencyContact?.name || ''
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    user?.emergencyContact?.phone || ''
  );
  const [emergencyRelationship, setEmergencyRelationship] = useState(
    user?.emergencyContact?.relationship || ''
  );

  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setProfileLoading(true);

    try {
      const payload = {
        phone,
        address,
        avatar,
        skills: skills ? skills.split(',').map((s) => s.trim()) : [],
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRelationship,
        },
      };

      const res = await api.put('/auth/profile', payload);
      if (res.data?.success) {
        updateUser(res.data.user);
        setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.message || 'Failed to update profile',
        type: 'danger',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setPwMsg({ text: 'New password and confirmation do not match', type: 'danger' });
      return;
    }

    if (newPassword.length < 6) {
      setPwMsg({ text: 'Password must be at least 6 characters long', type: 'danger' });
      return;
    }

    setPwLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data?.success) {
        setPwMsg({ text: 'Password updated successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwMsg({
        text: err.response?.data?.message || 'Failed to change password',
        type: 'danger',
      });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h3 className="fw-bold text-navy mb-1">My Personal Profile</h3>
        <p className="text-muted small mb-0">
          Manage your personal details, emergency contacts, skills profile, and authentication credentials.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Profile Card Overview */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white mb-4">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || 'Staff'
                  )}&background=2563eb&color=fff&size=160`
                }
                alt={user?.name}
                className="rounded-circle border border-4 border-light shadow-sm"
                style={{ width: '110px', height: '110px', objectFit: 'cover' }}
              />
            </div>

            <h5 className="fw-bold text-navy mb-1">{user?.name}</h5>
            <p className="text-muted small mb-2">{user?.position}</p>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 small fw-semibold text-capitalize">
                {user?.role === 'hr' ? 'HR Administrator' : user?.role === 'manager' ? 'Team Manager' : 'Staff Employee'}
              </span>
              <span className="badge bg-light text-secondary border rounded-pill px-3 py-1 small">
                {user?.department}
              </span>
            </div>

            <div className="pt-3 border-top text-start small d-flex flex-column gap-2 text-muted">
              <div className="d-flex align-items-center gap-2">
                <FiMail className="text-primary flex-shrink-0" />
                <span className="text-truncate">{user?.email}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FiPhone className="text-primary flex-shrink-0" />
                <span>{user?.phone || 'No phone set'}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FiCalendar className="text-primary flex-shrink-0" />
                <span>
                  Joined{' '}
                  {user?.joinDate
                    ? new Date(user.joinDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : '2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Password Update Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h6 className="fw-bold text-navy mb-3 d-flex align-items-center gap-2">
              <FiLock className="text-primary" />
              <span>Change Security Password</span>
            </h6>

            {pwMsg.text && (
              <div className={`alert alert-${pwMsg.type} py-2 px-3 small rounded-3 mb-3`}>
                {pwMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="mb-2">
                <label className="form-label small fw-semibold text-muted">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold text-muted">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-outline-primary w-100 rounded-pill small py-2 fw-semibold"
                disabled={pwLoading}
              >
                {pwLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Editable Profile & Details */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-navy mb-3">Edit Profile & Contacts</h5>

            {profileMsg.text && (
              <div className={`alert alert-${profileMsg.type} py-2 px-3 small rounded-3 mb-3`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Full Legal Name</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={user?.name || ''}
                    disabled
                  />
                  <span className="small text-muted" style={{ fontSize: '0.72rem' }}>
                    Contact HR to change legal registered name.
                  </span>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Official Email</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={user?.email || ''}
                    disabled
                  />
                  <span className="small text-muted" style={{ fontSize: '0.72rem' }}>
                    Corporate primary email address.
                  </span>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Direct Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Profile Avatar URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted">Residential / Work Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Street, City, State, ZIP"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted">
                    Technical Skills & Expertise (Comma-separated)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. JavaScript, React, UI/UX, Cloud Operations"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>

                <div className="col-12 pt-3 border-top">
                  <h6 className="fw-bold small text-muted text-uppercase mb-3">Emergency Contact</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">Contact Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Jane Doe"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">Relationship</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Spouse / Parent"
                        value={emergencyRelationship}
                        onChange={(e) => setEmergencyRelationship(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">Emergency Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="+1 (555) 999-9999"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-12 pt-3 text-end">
                  <button
                    type="submit"
                    className="btn btn-primary px-4 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-2"
                    disabled={profileLoading}
                  >
                    <FiSave />
                    <span>{profileLoading ? 'Saving Changes...' : 'Save Profile Details'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
