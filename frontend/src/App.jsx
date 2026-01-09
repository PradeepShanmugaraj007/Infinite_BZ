import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import EventFeed from './components/EventFeed';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import CreateEventPage from './components/CreateEventPage';
import SettingsPage from './components/SettingsPage';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // User state

  // View State: 'landing' or 'feed' or 'auth' or 'dashboard'
  const [currentView, setCurrentView] = useState('landing');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  useEffect(() => {
    fetchEvents();
    checkUserSession();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/v1/events');
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      // Handle new API structure { data: [], total: ... }
      if (data && Array.isArray(data.data)) {
        setEvents(data.data);
      } else if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
      setError("Could not load events. Ensure backend is running.");
      setLoading(false);
    }
  };

  const checkUserSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        // Only redirect to dashboard if we are on landing page or auth
        // Assuming we want auto-redirect on session check too if just visited
        // For now, let's keep landing unless explicitly logged in, OR 
        // if the user refreshes on Dashboard? 
        // Let's rely on explicit navigation for now, but handle login redirection below.
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error("Session check failed", err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('landing');
  };

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage
          events={events}
          user={user}
          onNavigate={() => {
            window.scrollTo(0, 0);
            setCurrentView('feed');
          }}
          onLogin={() => {
            if (user) {
              // If already logged in, go to Dashboard
              window.scrollTo(0, 0);
              setCurrentView('dashboard');
            } else {
              setAuthMode('login');
              window.scrollTo(0, 0);
              setCurrentView('auth');
            }
          }}
          onSignup={() => {
            setAuthMode('signup');
            window.scrollTo(0, 0);
            setCurrentView('auth');
          }}
        />
      )}

      {currentView === 'feed' && (
        <EventFeed
          events={events}
          loading={loading}
          error={error}
          onBack={() => {
            window.scrollTo(0, 0);
            setCurrentView('landing');
          }}
        />
      )}

      {currentView === 'auth' && (
        <AuthPage
          initialMode={authMode}
          onBack={() => {
            window.scrollTo(0, 0);
            setCurrentView('landing');
          }}
          onComplete={async () => {
            window.scrollTo(0, 0);
            await checkUserSession(); // Refresh user state
            setCurrentView('dashboard'); // Redirect to Dashboard
          }}
        />
      )}

      {currentView === 'dashboard' && (
        <ErrorBoundary>
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onNavigate={(view) => {
              window.scrollTo(0, 0);
              setCurrentView(view);
            }}
          />
        </ErrorBoundary>
      )}

      {currentView === 'create-event' && (
        <CreateEventPage
          user={user}
          onNavigate={(view) => {
            window.scrollTo(0, 0);
            setCurrentView(view);
          }}
          onLogout={handleLogout}
          onSave={async (eventData) => {
            // We can handle saving here or pass a callback that uses the API
            // For now, let's reuse the logic or move it here.
            // Actually CreateEventPage has onSave prop.
            // Let's implement the API call logic inside CreateEventPage or pass a wrapper here.
            // For consistency with Dashboard, let's just pass a simple fetch wrapper or let CreateEventPage handle it.
            // CreateEventPage expects onSave(payload).

            try {
              const token = localStorage.getItem('token');
              const res = await fetch('/api/v1/events', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
              });
              if (res.ok) {
                const newEvent = await res.json();
                return newEvent;
              } else {
                const data = await res.json();
                throw new Error(data.message || "Unknown error");
              }
            } catch (err) {
              console.error("Create event error", err);
              throw err;
            }
          }}
        />
      )}

      {currentView === 'settings' && (
        <SettingsPage
          user={user}
          onNavigate={(view) => {
            window.scrollTo(0, 0);
            setCurrentView(view);
          }}
        />
      )}
    </>
  );
}
