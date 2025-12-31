import React, { useEffect, useState } from 'react';
import BlogCard from '../component/BlogCard';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Home = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch(`${API_URL}/blogs`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && Array.isArray(data.message)) {
                    setBlogs(data.message);
                } else {
                    setBlogs([]);
                }
            } catch (error) {
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="text-base text-gray-600">Loading content...</div>
            </div>
        );
    }

    // Filter blogs
    const originalBlogs = blogs.filter(b => b && !b.isUpdated);
    const updatedBlogs = blogs.filter(b => b && b.isUpdated).slice(-5).reverse();

    return (
        <div className="max-w-7xl mx-auto px-6 py-16" style={{ fontFamily: "'DM Sans', sans-serif" }}>

            {/* Original Articles Section */}
            <section className="mb-20">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-black mb-2">Original Articles</h2>
                    <p className="text-gray-600">{originalBlogs.length} articles</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {originalBlogs.map(blog => (
                        <BlogCard key={blog._id} blog={blog} />
                    ))}
                    {originalBlogs.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-base mb-2">No original articles found.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* AI Updated Insights Section */}
            <section className="mb-20">
                <div className="mb-10">
                    <div className="inline-block bg-black text-white text-xs font-bold px-3 py-1 mb-3">
                        LATEST UPDATES
                    </div>
                    <h2 className="text-3xl font-bold text-black mb-2">AI Enhanced Insights</h2>
                    <p className="text-gray-600">Last {updatedBlogs.length} updated articles</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {updatedBlogs.map(blog => (
                        <BlogCard key={blog._id} blog={blog} />
                    ))}
                    {updatedBlogs.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-base mb-2">No updated articles yet.</p>
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
};

export default Home;
