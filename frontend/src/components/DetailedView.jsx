import React from 'react';

const DetailedView = ({ person }) => {
  const shouldShowPhone = person.phone && !person.is_phone_private;
  const phoneDisplay = shouldShowPhone ? (
    <div className="info-item">
      <span className="label">Phone</span>
      <a href={`tel:${person.phone}`} className="value link">
        {person.phone}
      </a>
    </div>
  ) : person.is_phone_private ? (
    <div className="info-item private">
      <span className="label">Phone</span>
      <span className="value private-text">
        <svg viewBox="0 0 24 24" className="lock-icon">
          <path fill="currentColor" d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1V6a5 5 0 0110 0v2h1zm-6-5a3 3 0 00-3 3v2h6V6a3 3 0 00-3-3z"/>
        </svg>
        Private number
      </span>
    </div>
  ) : null;

  return (
    <div className="detailed-view">
      <div className="header">
        <div className="profile-section">
          <div className="profile-image">
            <img
              src={person.photo_url || 'https://via.placeholder.com/300?text=No+Image'}
              alt={person.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300?text=No+Image';
              }}
            />
          </div>
          <div className="profile-info">
            <h2>{person.name}</h2>
            <div className="header-details">
              {person.organization && (
                <span className="organization-badge">{person.organization}</span>
              )}
              {person.role && (
                <span className="role-badge">{person.role}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="info-grid">
        {person.email && (
          <div className="info-item">
            <span className="label">Email</span>
            <a href={`mailto:${person.email}`} className="value link">
              {person.email}
            </a>
          </div>
        )}

        {phoneDisplay}

        <div className="info-item">
          <span className="label">Location</span>
          <span className="value">
            {person.distance ? (
              <span className="distance">{person.distance.toFixed(1)} km away</span>
            ) : (
              'Distance not available'
            )}
          </span>
        </div>

        {person.latitude && person.longitude && (
          <div className="info-item">
            <span className="label">Coordinates</span>
            <span className="value coordinates">
              {person.latitude.toFixed(6)}°, {person.longitude.toFixed(6)}°
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .detailed-view {
          color: var(--text-color);
          max-width: 800px;
          margin: 0 auto;
        }

        .header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .profile-section {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .profile-image {
          flex-shrink: 0;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid rgba(0, 198, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          position: relative;
        }

        .profile-image::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(0, 198, 255, 0.2) 0%,
            rgba(0, 114, 255, 0.2) 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .profile-image:hover::after {
          opacity: 1;
        }

        .profile-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .profile-image:hover img {
          transform: scale(1.1);
        }

        .profile-info {
          flex-grow: 1;
        }

        h2 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-details {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .organization-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(0, 198, 255, 0.1);
          border: 1px solid rgba(0, 198, 255, 0.2);
          border-radius: 20px;
          color: #00c6ff;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .role-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: var(--gray-600);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .info-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(0, 198, 255, 0.2);
        }

        .info-item.private {
          background: rgba(0, 198, 255, 0.03);
          border-color: rgba(0, 198, 255, 0.1);
        }

        .info-item.private:hover {
          background: rgba(0, 198, 255, 0.05);
          border-color: rgba(0, 198, 255, 0.2);
        }

        .private-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--gray-600);
          font-style: italic;
        }

        .lock-icon {
          width: 16px;
          height: 16px;
          color: var(--primary-color);
        }

        .label {
          font-size: 0.75rem;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .value {
          font-size: 1rem;
          color: var(--text-color);
        }

        .link {
          color: #00c6ff;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .link:hover {
          color: #0072ff;
          text-decoration: underline;
        }

        .distance {
          color: #00c6ff;
          font-weight: 500;
        }

        .coordinates {
          font-family: monospace;
          font-size: 0.875rem;
          color: var(--gray-600);
        }

        @media (max-width: 640px) {
          .profile-section {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .profile-image {
            width: 120px;
            height: 120px;
            margin: 0 auto;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          h2 {
            font-size: 1.5rem;
          }

          .header-details {
            justify-content: center;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DetailedView; 