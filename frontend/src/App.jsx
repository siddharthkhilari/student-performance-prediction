import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PredictPerformance from './pages/PredictPerformance';
import StudentRecords from './pages/StudentRecords';
import PredictionHistory from './pages/PredictionHistory';
import ModelEvaluation from './pages/ModelEvaluation';
import AboutProject from './pages/AboutProject';
import api from './services/api';
import './App.css';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('edupredict_theme') || 'light';
  });
  const [backendOnline, setBackendOnline] = useState(false);

  // Apply theme to html document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('edupredict_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Check backend health periodically
  const checkHealth = async () => {
    try {
      const res = await api.checkHealth();
      setBackendOnline(res.status === 'healthy');
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000); // every 15s
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'predict':
        return <PredictPerformance setActivePage={setActivePage} />;
      case 'records':
        return <StudentRecords setActivePage={setActivePage} />;
      case 'history':
        return <PredictionHistory setActivePage={setActivePage} />;
      case 'metrics':
        return <ModelEvaluation />;
      case 'about':
        return <AboutProject />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`main-wrapper ${collapsed ? 'expanded' : ''}`}>
        <Navbar
          activePage={activePage}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          theme={theme}
          toggleTheme={toggleTheme}
          backendOnline={backendOnline}
        />

        <main className="page-container">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
