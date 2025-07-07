import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from "@clerk/clerk-react";
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import PersonCard from './components/PersonCard';
import Modal from './components/Modal';
import OrganizationFilter from './components/OrganizationFilter';
import UserForm from './components/UserForm';
import LandingPage from './components/LandingPage';
import DetailedView from './components/DetailedView';
import './styles/LandingPage.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ChatPage from './pages/ChatPage';

// API base URL
const API_BASE_URL = 'http://localhost:5002';

// Default radius for nearby search (in kilometers)
const DEFAULT_RADIUS_KM = 10;

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState({ latitude: '', longitude: '' });
  const { isSignedIn, isLoaded } = useUser();

  // Fetch organizations when component mounts
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/organizations`);
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        console.error('Error fetching organizations:', err);
      }
    };

    fetchOrganizations();
  }, []);

  // Handle search when query or organization changes
  useEffect(() => {
    if (searchQuery || selectedOrganization) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, selectedOrganization]);

  const handleSearch = async (query) => {
    if (!isSignedIn) {
      setError('Please sign in to search');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        q: query,
        ...(selectedOrganization && { organization: selectedOrganization })
      });
      const response = await fetch(`${API_BASE_URL}/api/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setPeople(data);
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      setError('Please sign in to search nearby');
      return;
    }

    setError(null);
    setLocationStatus('Searching with provided coordinates...');
    setLoading(true);

    try {
      const { latitude, longitude } = manualLocation;
      
      // Validate coordinates
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lon) || 
          lat < -90 || lat > 90 || 
          lon < -180 || lon > 180) {
        throw new Error('Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.');
      }

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        radius: '10'
      });

      if (selectedOrganization) {
        params.append('organization', selectedOrganization);
      }

      const response = await fetch(`${API_BASE_URL}/api/nearby?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby people. Please try again later.');
      }

      const data = await response.json();
      setPeople(data);
      setShowManualLocation(false);
      setLocationStatus('');
      setLoading(false);

    } catch (err) {
      setError(err.message);
      setLocationStatus('');
      setLoading(false);
    }
  };

  const handleNearbySearch = async () => {
    if (!isSignedIn) {
      setError('Please sign in to search nearby');
      return;
    }

    setError(null);
    setLocationStatus('Detecting your location...');
    setLoading(true);

    try {
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by your browser'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => {
            let errorMessage = 'Unable to get your location. ';
            switch (err.code) {
              case err.PERMISSION_DENIED:
                errorMessage += 'Please enable location access in your browser settings or enter location manually.';
                break;
              case err.POSITION_UNAVAILABLE:
                errorMessage += 'Location information is unavailable. Please try again or enter location manually.';
                break;
              case err.TIMEOUT:
                errorMessage += 'Location request timed out. Please try again or enter location manually.';
                break;
              default:
                errorMessage += 'An unknown error occurred. Please try again or enter location manually.';
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      setLocationStatus('Location detected, searching for people nearby...');

      const params = new URLSearchParams({
        lat: position.coords.latitude.toString(),
        lon: position.coords.longitude.toString(),
        radius: '10'
      });

      if (selectedOrganization) {
        params.append('organization', selectedOrganization);
      }

      const response = await fetch(`${API_BASE_URL}/api/nearby?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby people. Please try again later.');
      }

      const data = await response.json();
      setPeople(data);
      setLocationStatus('');
      setLoading(false);

    } catch (err) {
      setError(err.message);
      setLocationStatus('');
      setLoading(false);
      // Show manual location input option when geolocation fails
      setShowManualLocation(true);
    }
  };

  // Helper function to calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
  };

  const handleOrganizationChange = (organization) => {
    setSelectedOrganization(organization);
    // Rerun the last search with the new organization filter
    if (people.length > 0) {
      handleSearch('');
    }
  };

  const handleStartSearch = () => {
    if (isSignedIn) {
      setShowLanding(false);
    }
  };

  const handleReturnToLanding = () => {
    // Reset all states when returning to landing
    setPeople([]);
    setError(null);
    setSelectedPerson(null);
    setSelectedOrganization('');
    setSearchQuery('');
    setLocationStatus('');
    setShowManualLocation(false);
    setManualLocation({ latitude: '', longitude: '' });
    setShowLanding(true);
  };

  if (!isLoaded) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AnimatePresence mode="wait">
            {showLanding ? (
              <motion.div
                key="landing"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <LandingPage onStartSearch={handleStartSearch} />
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="search-page"
              >
                <Header 
                  onNearbyClick={handleNearbySearch} 
                  onLogoClick={handleReturnToLanding}
                />
                <div className="search-interface">
                  <div className="search-controls" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          flex: 2,
                          padding: '1rem',
                          fontSize: '1.1rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          color: '#fff',
                          minWidth: '300px'
                        }}
                      />
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <OrganizationFilter
                          organizations={organizations}
                          selectedOrganization={selectedOrganization}
                          onOrganizationChange={setSelectedOrganization}
                        />
                      </div>
                      <button
                        className="add-details-btn"
                        style={{
                          background: '#00c6ff',
                          color: '#fff',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          marginLeft: '0.5rem',
                          height: '48px',
                          alignSelf: 'stretch',
                          fontWeight: 600
                        }}
                        onClick={() => setIsUserFormOpen(true)}
                      >
                        Add Your Details
                      </button>
                    </div>
                  </div>
                  <div className="results-section">
                    {showManualLocation && (
                      <div className="manual-location-form">
                        <h3>Enter Your Location</h3>
                        <form onSubmit={handleManualLocationSubmit}>
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="latitude">Latitude (-90 to 90)</label>
                              <input
                                type="number"
                                id="latitude"
                                step="any"
                                value={manualLocation.latitude}
                                onChange={(e) => setManualLocation(prev => ({
                                  ...prev,
                                  latitude: e.target.value
                                }))}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="longitude">Longitude (-180 to 180)</label>
                              <input
                                type="number"
                                id="longitude"
                                step="any"
                                value={manualLocation.longitude}
                                onChange={(e) => setManualLocation(prev => ({
                                  ...prev,
                                  longitude: e.target.value
                                }))}
                                required
                              />
                            </div>
                          </div>
                          <div className="form-actions">
                            <button type="button" onClick={() => setShowManualLocation(false)} className="cancel-button">
                              Cancel
                            </button>
                            <button type="submit" className="submit-button">
                              Search
                            </button>
                          </div>
                        </form>
                        <div className="location-tip">
                          Tip: You can find your coordinates using{' '}
                          <a
                            href="https://www.google.com/maps"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Google Maps
                          </a>
                          . Right-click on your location and the coordinates will appear.
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="error-message">
                        <p>{error}</p>
                        {error.includes('location') && (
                          <button
                            onClick={() => setShowManualLocation(true)}
                            className="manual-location-button"
                          >
                            Enter Location Manually
                          </button>
                        )}
                      </div>
                    )}

                    {locationStatus && (
                      <div className="status-message">
                        <div className="loading-spinner" />
                        <p>{locationStatus}</p>
                      </div>
                    )}

                    {loading ? (
                      <div className="loading-message">Loading...</div>
                    ) : (
                      <div className="results-grid">
                        {people.map(person => (
                          <PersonCard
                            key={person.id || Math.random()}
                            person={person}
                            onClick={() => setSelectedPerson(person)}
                          />
                        ))}
                        {people.length === 0 && !loading && !error && !showManualLocation && (
                          <div className="no-results">
                            No results found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Modal
                  isOpen={selectedPerson !== null}
                  onClose={() => setSelectedPerson(null)}
                >
                  {selectedPerson && <DetailedView person={selectedPerson} />}
                </Modal>
                <UserForm
                  isOpen={isUserFormOpen}
                  onClose={() => setIsUserFormOpen(false)}
                  organizations={organizations}
                />
                <style>{`
                  .search-page {
                    min-height: 100vh;
                    background: var(--background-color);
                    color: var(--text-color);
                  }
                  .search-interface {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                  }
                  .search-controls {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 2rem;
                  }
                  .add-details-button {
                    padding: 0.75rem 1.5rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s ease;
                  }
                  .add-details-button:hover {
                    background: var(--primary-color-dark);
                    transform: translateY(-1px);
                  }
                  .results-section {
                    background: var(--gray-100);
                    border-radius: 8px;
                    padding: 1.5rem;
                  }
                  .error-message {
                    padding: 1.5rem;
                    background: #ffebee;
                    color: #c62828;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                    border: 1px solid #ef9a9a;
                  }
                  .error-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                  }
                  .error-content h4 {
                    margin: 0 0 0.5rem 0;
                    color: #c62828;
                    font-size: 1rem;
                    font-weight: 600;
                  }
                  .error-content p {
                    white-space: pre-line;
                    color: #c62828;
                    font-size: 0.875rem;
                    line-height: 1.5;
                  }
                  .error-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                  }
                  .retry-button {
                    padding: 0.75rem 1.25rem;
                    background: #c62828;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                  }
                  .manual-button {
                    padding: 0.75rem 1.25rem;
                    background: white;
                    color: #c62828;
                    border: 1px solid #c62828;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                  }
                  .status-message {
                    padding: 1rem;
                    background: var(--gray-100);
                    color: var(--text-color);
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    border: 1px solid var(--gray-300);
                  }
                  .status-title {
                    font-weight: 500;
                    color: var(--text-color);
                  }
                  .status-subtitle {
                    font-size: 0.875rem;
                    color: var(--gray-600);
                    margin-top: 0.25rem;
                  }
                  .loading-message {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-color);
                  }
                  .results-grid {
                    display: grid;
                    gap: 1rem;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    padding: 1rem 0;
                  }
                  .no-results {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 2rem;
                    color: var(--gray-600);
                  }
                  .manual-location-form {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                  }
                  .manual-location-form h3 {
                    margin: 0 0 1.5rem 0;
                    font-size: 1.25rem;
                    color: var(--text-color);
                  }
                  .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                  }
                  .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                  }
                  .form-group label {
                    font-size: 0.875rem;
                    color: var(--gray-600);
                  }
                  .form-group input {
                    padding: 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: var(--text-color);
                    font-size: 1rem;
                  }
                  .form-group input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(0, 114, 255, 0.2);
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
                  .location-tip {
                    margin-top: 1rem;
                    font-size: 0.875rem;
                    color: var(--gray-600);
                  }
                  .location-tip a {
                    color: #00c6ff;
                    text-decoration: none;
                    transition: color 0.2s ease;
                  }
                  .location-tip a:hover {
                    color: #0072ff;
                    text-decoration: underline;
                  }
                  @media (max-width: 640px) {
                    .form-row {
                      grid-template-columns: 1fr;
                    }
                    .manual-location-form {
                      padding: 1rem;
                    }
                  }
                `}</style>
              </motion.div>
            )}
          </AnimatePresence>
        } />
        <Route path="/chat/:userId" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
