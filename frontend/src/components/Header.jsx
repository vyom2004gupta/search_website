import React from 'react';

const Header = ({ onNearbyClick, onLogoClick }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo" onClick={onLogoClick}>
          PeopleConnect
        </h1>
        <button className="nearby-button" onClick={onNearbyClick}>
          Find Nearby
        </button>
      </div>

      <style jsx>{`
        .header {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .logo::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
          transition: width 0.3s ease;
        }

        .logo:hover::after {
          width: 100%;
        }

        .nearby-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
          border: none;
          border-radius: 30px;
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nearby-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 15px rgba(0, 198, 255, 0.2);
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 0 1rem;
          }
        }
      `}</style>
    </header>
  );
};

export default Header; 