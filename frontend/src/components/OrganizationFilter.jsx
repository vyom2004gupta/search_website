import React from 'react';

const OrganizationFilter = ({ organizations, selectedOrganization, onOrganizationChange }) => {
  return (
    <select
      value={selectedOrganization}
      onChange={(e) => onOrganizationChange(e.target.value)}
      style={{
        width: '100%',
        padding: '1rem',
        fontSize: '1rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        color: '#fff',
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1em',
        paddingRight: '2.5rem'
      }}
    >
      <option value="" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>All Organizations</option>
      {organizations.map((org) => (
        <option key={org} value={org} style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
          {org}
        </option>
      ))}
    </select>
  );
};

export default OrganizationFilter; 