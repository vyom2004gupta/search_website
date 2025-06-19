import React from 'react';

const PersonCard = ({ person, onClick }) => {
  const shouldShowPhone = person.phone && !person.is_phone_private;

  return (
    <div className="person-card" onClick={onClick}>
      <div className="person-image">
        <img 
          src={person.photo_url || 'https://via.placeholder.com/150?text=No+Image'} 
          alt={person.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
          }}
        />
      </div>
      <div className="person-info">
        <h3>{person.name}</h3>
        
        {person.organization && (
          <div className="organization">
            <span className="organization-badge">{person.organization}</span>
          </div>
        )}
        
        {person.role && (
          <p className="role">{person.role}</p>
        )}

        <div className="footer">
          <div className="footer-info">
            {shouldShowPhone && (
              <a href={`tel:${person.phone}`} className="phone-link" onClick={(e) => e.stopPropagation()}>
                <svg viewBox="0 0 24 24" className="phone-icon">
                  <path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                {person.phone}
              </a>
            )}
            {person.is_phone_private && (
              <span className="private-indicator">
                <svg viewBox="0 0 24 24" className="lock-icon">
                  <path fill="currentColor" d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1V6a5 5 0 0110 0v2h1zm-6-5a3 3 0 00-3 3v2h6V6a3 3 0 00-3-3z"/>
                </svg>
                Private number
              </span>
            )}
            <p className="distance">
              {person.distance ? `${person.distance.toFixed(1)} km away` : 'Distance not available'}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .person-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .person-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(
            180deg,
            rgba(0, 198, 255, 0.1) 0%,
            transparent 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .person-card:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--primary-color);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .person-card:hover::before {
          opacity: 1;
        }

        .person-image {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(0, 198, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .person-card:hover .person-image {
          border-color: var(--primary-color);
          transform: scale(1.05);
        }

        .person-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.3s ease;
        }

        .person-info {
          position: relative;
          z-index: 1;
          flex-grow: 1;
        }

        .person-info h3 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-color);
          background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .organization {
          margin-bottom: 0.75rem;
        }

        .organization-badge {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          background: rgba(0, 198, 255, 0.1);
          border: 1px solid rgba(0, 198, 255, 0.2);
          border-radius: 20px;
          color: #00c6ff;
          font-size: 0.75rem;
          font-weight: 500;
          line-height: 1;
        }

        .role {
          color: var(--gray-600);
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .phone-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #00c6ff;
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .phone-link:hover {
          color: #0072ff;
          text-decoration: underline;
        }

        .phone-icon {
          width: 16px;
          height: 16px;
        }

        .private-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--gray-600);
          font-size: 0.75rem;
          font-style: italic;
        }

        .lock-icon {
          width: 14px;
          height: 14px;
          color: var(--primary-color);
        }

        .distance {
          color: var(--primary-color);
          font-size: 0.75rem;
          margin: 0;
          opacity: 0.8;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .person-card {
            padding: 1.25rem;
            gap: 1rem;
          }

          .person-image {
            width: 60px;
            height: 60px;
          }

          .person-info h3 {
            font-size: 1.125rem;
          }

          .footer-info {
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PersonCard; 