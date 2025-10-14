import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Samples from "./Samples";

import Clients from "./Clients";

import SampleWorkflow from "./SampleWorkflow";

import Analysis from "./Analysis";

import Procedures from "./Procedures";

import OTGeneration from "./OTGeneration";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Samples: Samples,
    
    Clients: Clients,
    
    SampleWorkflow: SampleWorkflow,
    
    Analysis: Analysis,
    
    Procedures: Procedures,
    
    OTGeneration: OTGeneration,
    
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
    const currentPage = _getCurrentPage(location.pathname);
    
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