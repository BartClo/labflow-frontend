import Layout from "./Layout.jsx";
import Login from "./Login.jsx";

import Dashboard from "./Dashboard";

import Samples from "./Samples";

import Clients from "./Clients";

import SampleWorkflow from "./SampleWorkflow";

import Analysis from "./Analysis";

import Procedures from "./Procedures";

import OTGeneration from "./OTGeneration";

import Administration from "./Administration";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";

const PAGES = {
    
    Dashboard: Dashboard,
    
    Samples: Samples,
    
    Clients: Clients,
    
    SampleWorkflow: SampleWorkflow,
    
    Analysis: Analysis,
    
    Procedures: Procedures,
    
    OTGeneration: OTGeneration,
    
    Administration: Administration,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const { isAuthenticated, loading } = useAuth();
    const currentPage = _getCurrentPage(location.pathname);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      );
    }

    // If not authenticated, show login page
    if (!isAuthenticated && location.pathname !== '/login') {
      return <Navigate to="/login" replace />;
    }

    // If authenticated and trying to access login, redirect to dashboard
    if (isAuthenticated && location.pathname === '/login') {
      return <Navigate to="/Dashboard" replace />;
    }
    
    // If on login page
    if (location.pathname === '/login') {
      return <Login />;
    }

    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Samples" element={<Samples />} />
                
                <Route path="/Clients" element={<Clients />} />
                
                <Route path="/SampleWorkflow" element={<SampleWorkflow />} />
                
                <Route path="/Analysis" element={<Analysis />} />
                
                <Route path="/Procedures" element={<Procedures />} />
                
                <Route path="/OTGeneration" element={<OTGeneration />} />
                
                <Route path="/Administration" element={<Administration />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}