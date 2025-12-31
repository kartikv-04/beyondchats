import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from "react-markdown";

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const BlogDetail = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`${API_URL}/blogs/${id}`);
                const data = await response.json();
                if (data.success) {
                    setBlog(data.message);
                }
            } catch (error) {
                // Silent fail
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="text-base text-gray-400">Loading article...</div>
            </div>
        );
    }

    if (!blog) {
        return <div className="text-center py-20 text-gray-500">Article not found</div>;
    }

    return (
        <article className="max-w-3xl mx-auto px-6 py-12">
            <Link to="/" className="inline-block mb-8 text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors">
                ← Back to all articles
            </Link>

            <header className="mb-10 text-center">
                {blog.topic && blog.topic.length > 0 && (
                    <div className="flex gap-2 justify-center mb-6">
                        {blog.topic.map((t, i) => (
                            <span key={i} className="text-[10px] font-bold uppercase tracking-widest border border-gray-200 px-2 py-1 text-gray-500">
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                    {blog.title}
                </h1>

                <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-500">
                    <span>{blog.author}</span>
                    <span>•</span>
                    <span>{blog.date}</span>
                </div>
            </header>

            {blog.image && blog.image.length > 0 && (
                <div className="mb-12">
                    <img
                        src={blog.image[0]}
                        alt={blog.title}
                        className="w-full h-auto object-cover rounded-sm border border-gray-100 shadow-sm"
                    />
                </div>
            )}

            {/* Main Content */}
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 text-gray-800 leading-relaxed">
                {blog.isUpdated ? (
                    <ReactMarkdown>{blog.content}</ReactMarkdown>
                ) : (
                    <div className="whitespace-pre-line">{blog.content}</div>
                )}
            </div>


            {/* References Section */}
            {blog.references && blog.references.length > 0 && (
                <div className="mt-16 pt-10 border-t border-gray-200">
                    <h3 className="text-lg font-bold mb-6 text-black">References & Citations</h3>
                    <ul className="space-y-3">
                        {blog.references.map((ref, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-600 break-all">
                                <span className="font-bold text-gray-400 select-none">[{i + 1}]</span>
                                <a href={ref} target="_blank" rel="noopener noreferrer" className="hover:text-black hover:underline underline-offset-2 transition-colors">
                                    {ref}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </article>
    );
};

export default BlogDetail;
