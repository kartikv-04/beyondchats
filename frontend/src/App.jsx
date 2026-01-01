import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './component/Navigation';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-white text-black font-sans">
        <Navigation />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blogs" element={<Home />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
          </Routes>
        </main>

        <footer className="py-12 text-center text-sm text-gray-600 border-t border-gray-200 mt-20">
          <p>© 2026 BeyondChats. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;