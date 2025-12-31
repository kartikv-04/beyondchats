import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
    return (
        <nav className="bg-white border-b border-gray-200" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-black hover:opacity-80 transition-opacity">
                    BeyondChats
                </Link>

                <div className="flex gap-8">
                    <Link to="/" className="text-base text-black hover:text-gray-600 transition-colors">
                        Home
                    </Link>
                    <Link to="/" className="text-base text-black hover:text-gray-600 transition-colors">
                        Blogs
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;