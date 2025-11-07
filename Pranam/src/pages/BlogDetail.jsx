import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import dp from "../assets/Images/dp.png";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // Fetch the main blog
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/blog/${id}`);
        setBlog(res.data.data);

        // Fetch related blogs
        const relatedRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/blog/related/${id}`);
        setRelatedBlogs(relatedRes.data.data);
      } catch (err) {
        console.error("Error fetching blog:", err);
        setBlog(null);
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!blog) return <div className="p-10 text-center">Blog not found</div>;

  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        {/* Blog Header */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-semibold">{blog.author}</span> • {new Date(blog.date).toLocaleDateString()}
        </p>

        {/* Featured Image */}
        <img
          src={blog.image}
          alt={blog.title}
          className="rounded-[28px] mb-8 w-full max-h-[480px] object-cover"
        />

        {/* Blog Content */}
        <div className="prose max-w-none text-[#737373] font-semibold leading-relaxed">
          <p>{blog.description}</p>
          <p>{blog.content}</p>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <h2 className="text-2xl xl:text-4xl font-semibold mb-6">
            This Post Has {blog.comments?.length || 0} Comments
          </h2>
          {blog.comments?.map((c) => (
            <div
              key={c._id}
              className="border rounded-2xl p-4 px-10 mb-4 bg-gradient-to-r from-white via-[#EFF1DD60] to-white shadow-md border-t-[#BCC571]"
            >
              <div className="flex items-center">
                <img src={dp} alt={c.name} className="w-8 h-8 rounded-full mr-4" />
                <p className="font-medium text-[#BCC571]">{c.name}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-[#737373] font-semibold">{c.text}</p>
                <p className="text-end text-sm ml-4 whitespace-nowrap text-[#737373]">
                  {c.name} <br /> {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Leave a Reply */}
        <div className="mt-12">
          <h2 className="text-2xl lg:text-4xl font-semibold mb-6">Leave a Reply</h2>
          <div className="border rounded-2xl p-6 bg-gradient-to-r from-white via-[#EFF1DD60] to-white shadow-md border-t-[#BCC571]">
            <form className="space-y-4">
              <textarea
                rows="3"
                placeholder="Write your comment..."
                className="w-full border rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              ></textarea>
              <div className="flex gap-4 flex-col md:flex-row">
                <input
                  type="text"
                  placeholder="Name *"
                  className="flex-1 border rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  className="flex-1 border rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5B575FAB]">
                <input type="checkbox" id="save-info" className="h-4 w-4" />
                <label htmlFor="save-info">
                  Save my name, email, and website in this browser for the next time I comment.
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-white px-6 py-2 rounded-full shadow bg-[#BCC571]"
                >
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-16">
          <h2 className="text-2xl xl:text-4xl font-semibold mb-6">You Might Also Like</h2>
          <div className="space-y-10 mt-8">
            {relatedBlogs.slice(0, 2).map((item) => (
              <div key={item._id} className="pb-6">
                <h2 className="text-lg md:text-3xl font-semibold mb-2 text-[#00000099]">{item.title}</h2>
                <p className="text-sm text-gray-500 mb-3 text-end">
                  {item.author} <br /> {new Date(item.date).toLocaleDateString()}
                </p>
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="rounded-md shadow-md w-full md:w-[400px] h-[260px] object-cover"
                  />
                  <div className="flex flex-col justify-end w-full">
                    <p className="text-[#737373] font-semibold mt-12 mb-3">{item.description}</p>
                    <Link
                      to={`/blog/${item._id}`}
                      className="bg-[#BCC571] text-white text-sm px-4 py-2 rounded-full shadow hover:bg-green-500 transition self-end"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
                <div className="bg-[#000000] h-[1px] mt-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail;
