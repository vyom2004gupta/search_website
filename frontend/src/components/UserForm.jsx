import React, { useState } from 'react';
import Modal from './Modal';

const API_BASE_URL = 'http://localhost:5002';

const UserForm = ({ isOpen, onClose, organizations }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo_url: '',
    organization: '',
    new_organization: '',
    role: '',
    latitude: '',
    longitude: '',
    is_phone_private: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to get location. Please enter coordinates manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'organization'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (formData.organization === 'other' && !formData.new_organization) {
      setError('Please enter the new organization name');
      return false;
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit data');
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        photo_url: '',
        organization: '',
        new_organization: '',
        role: '',
        latitude: '',
        longitude: '',
        is_phone_private: true
      });

      // Close the modal after 2 seconds on success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err.message);
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="form-container">
        <h2>Add Your Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group phone-group">
              <label htmlFor="phone">Phone</label>
              <div className="phone-input-container">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={formData.is_phone_private ? 'private' : ''}
                />
                <div className="privacy-toggle">
                  <label className="toggle-label" htmlFor="is_phone_private">
                    <input
                      type="checkbox"
                      id="is_phone_private"
                      name="is_phone_private"
                      checked={formData.is_phone_private}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="privacy-label">
                    {formData.is_phone_private ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>
              <p className="privacy-hint">
                {formData.is_phone_private 
                  ? 'Your phone number will be hidden from other users'
                  : 'Your phone number will be visible to other users'}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="photo_url">Photo URL</label>
              <input
                type="url"
                id="photo_url"
                name="photo_url"
                value={formData.photo_url}
                onChange={handleChange}
                placeholder="https://example.com/your-photo.jpg"
              />
            </div>

            <div className="form-group">
              <label htmlFor="organization">Organization</label>
              <select
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
              >
                <option value="">Select Organization</option>
                {organizations.map(org => (
                  <option key={org} value={org}>{org}</option>
                ))}
                <option value="other">Other</option>
              </select>
            </div>

            {formData.organization === 'other' && (
              <div className="form-group">
                <label htmlFor="new_organization">New Organization</label>
                <input
                  type="text"
                  id="new_organization"
                  name="new_organization"
                  value={formData.new_organization}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="any"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="any"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            Your details have been successfully submitted!
          </div>
        )}
      </div>

      <style>{`
        .form-container {
          color: var(--text-color);
        }

        h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .phone-group {
          grid-column: span 2;
        }

        .phone-input-container {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .privacy-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toggle-label {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
          margin: 0;
        }

        .toggle-label input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: 0.4s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 2px;
          background: var(--primary-color);
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background: rgba(0, 198, 255, 0.2);
          border-color: rgba(0, 198, 255, 0.3);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }

        .privacy-label {
          font-size: 0.875rem;
          color: var(--gray-600);
          min-width: 50px;
        }

        .privacy-hint {
          font-size: 0.75rem;
          color: var(--gray-600);
          margin: 0.25rem 0 0 0;
          font-style: italic;
        }

        input.private {
          border-color: var(--primary-color);
          background: rgba(0, 198, 255, 0.05);
        }

        label {
          font-size: 0.875rem;
          color: var(--gray-600);
        }

        input,
        select {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-color);
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(0, 114, 255, 0.2);
        }

        input::placeholder {
          color: var(--gray-600);
        }

        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgba(255, 255, 255, 0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
          padding-right: 2.5rem;
        }

        select option {
          background: #1a1a1a;
          color: var(--text-color);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .cancel-button,
        .submit-button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-button {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-color);
        }

        .cancel-button:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .submit-button {
          background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
          border: none;
          color: white;
        }

        .submit-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 198, 255, 0.3);
        }

        .error-message {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
          background: rgba(255, 59, 48, 0.1);
          border: 1px solid rgba(255, 59, 48, 0.2);
          color: #ff3b30;
          font-size: 0.875rem;
        }

        .success-message {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
          background: rgba(52, 199, 89, 0.1);
          border: 1px solid rgba(52, 199, 89, 0.2);
          color: #34c759;
          font-size: 0.875rem;
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .phone-group {
            grid-column: span 1;
          }

          .phone-input-container {
            flex-direction: column;
            align-items: stretch;
          }

          .privacy-toggle {
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </Modal>
  );
};

export default UserForm; 