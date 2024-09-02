import './App.css';
import React from "react";
import LandingPage from './components/LandingPage.js';
import InboxSetup from './components/InboxSetup.js';
import Dashboard from './components/Dashboard.js';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/inbox-setup" element={<InboxSetup />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
