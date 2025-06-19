import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";

const LandingPage = ({ onStartSearch }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallax = (y) => {
    return {
      transform: `translateY(${-y * 0.5}px)`,
    };
  };

  const handleExploreClick = () => {
    if (isSignedIn) {
      onStartSearch();
    }
    // If not signed in, the sign-in modal will be shown by the SignInButton
  };

  return (
    <div className="landing-page">
      <nav className="nav">
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] }}
          className="nav-content"
        >
          <div className="logo">PeopleConnect</div>
          <div className="nav-buttons">
            {isSignedIn ? (
              <button className="nav-button" onClick={onStartSearch}>Open Search</button>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="nav-button">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="nav-button primary">Sign Up</button>
                </SignUpButton>
              </>
            )}
          </div>
        </motion.div>
      </nav>

      <section className="hero">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={parallax(scrollY)}
        >
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Connect with
            <span className="gradient-text"> Extraordinary</span>
            <br />People Around You
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Discover meaningful connections in your vicinity.
            Build your network with like-minded individuals.
          </motion.p>

          <motion.div 
            className="hero-cta"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {isSignedIn ? (
              <button className="primary-button" onClick={onStartSearch}>
                Start Exploring
              </button>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <button className="primary-button">
                    Get Started
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="secondary-button">
                    Sign In
                  </button>
                </SignInButton>
              </>
            )}
          </motion.div>
        </motion.div>

        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          <div className="network-globe">
            <div className="globe-container">
              <div className="globe"></div>
              <div className="network-lines"></div>
              <div className="glow"></div>
            </div>
            <div className="particles">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="particle" style={{
                  '--delay': `${Math.random() * 4}s`,
                  '--position': `${Math.random() * 100}%`
                }}></div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="features">
        <motion.div 
          className="features-grid"
          initial={{ opacity: 0, y: 100 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {[
            {
              icon: '🌍',
              title: 'Location-Based',
              description: 'Find people within your preferred radius, connecting you with nearby opportunities.'
            },
            {
              icon: '🤝',
              title: 'Smart Matching',
              description: 'Our intelligent algorithm connects you with people sharing similar interests.'
            },
            {
              icon: '🔒',
              title: 'Privacy First',
              description: 'Your data security is our priority. Full control over your information.'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="stats">
        <motion.div 
          className="stats-container"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="stat-item">
            <h4>10K+</h4>
            <p>Active Users</p>
          </div>
          <div className="stat-item">
            <h4>50+</h4>
            <p>Cities</p>
          </div>
          <div className="stat-item">
            <h4>5K+</h4>
            <p>Connections Made</p>
          </div>
        </motion.div>
      </section>

      <footer className="footer">
        <motion.div 
          className="footer-content"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p>© 2024 PeopleConnect. All rights reserved.</p>
        </motion.div>
      </footer>

      <style jsx>{`
        .nav-buttons {
          display: flex;
          gap: 1rem;
        }

        .nav-button.primary {
          background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
          color: white;
          border: none;
        }

        .nav-button.primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .nav-buttons {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage; 