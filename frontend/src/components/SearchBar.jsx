import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div style={{
      marginBottom: '2rem',
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'flex',
          gap: '1rem',
        }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for people..."
            style={{
              flex: 1,
              fontSize: '1rem',
            }}
          />
          <button
            type="submit"
            style={{
              minWidth: '120px',
            }}
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar; 