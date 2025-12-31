import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  if (!blog) return null;

  const { _id, title, content, author, date, image } = blog;

  // Create excerpt
  const excerpt = content?.substring(0, 150) + '...';

  // Format date
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link to={`/blogs/${_id}`} className="block">
      <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {image && image.length > 0 && (
          <div className="w-full h-48 bg-gray-100 overflow-hidden">
            <img
              src={image[0]}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          <div className="text-sm text-gray-600 mb-3">
            {author} • {formattedDate}
          </div>

          <h3 className="text-xl font-bold text-black mb-3 leading-tight">
            {title}
          </h3>

          <p className="text-base text-gray-700 leading-relaxed mb-4 flex-1">
            {excerpt}
          </p>

          <div className="text-sm text-black font-medium mt-auto pt-4 border-t border-gray-100">
            Read more →
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
