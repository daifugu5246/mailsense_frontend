import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MailSenseDashboard from './components/MailSenseDashboard';
import AuthCallback from './components/AuthCallback';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MailSenseDashboard />} />
        <Route path="/dashboard" element={<MailSenseDashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}
