import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import BlogForm from '../components/Admin/BlogForm';
import ChatManagement from '../components/Admin/ChatManagement';
import { Users, MessageSquare, Heart, Mail, FileText, BarChart3, Plus, Edit, Trash2, Eye } from 'lucide-react';

const AdminDashboard = () => {
  const { auth, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    healingForms: [],
    questions: [],
    chats: [],
    newsletters: [],
    blogs: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBlogForm, setShowBlogForm] = useState(false);

  // Show loading while AuthContext is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not admin
  useEffect(() => {
    console.log('🔍 AdminDashboard auth check:', {
      isLoading,
      hasUser: !!auth.user,
      userRole: auth.user?.role,
      userName: auth.user?.name,
      hasToken: !!auth.token,
      fullAuth: auth
    });

    // Don't check auth while still loading
    if (isLoading) {
      console.log('⏳ AdminDashboard: Waiting for auth to load...');
      return;
    }

    if (!auth.user || auth.user.role !== 'admin') {
      console.log('❌ AdminDashboard: Access denied, redirecting to auth');
      console.log('   Reason:', !auth.user ? 'No user' : `Role is '${auth.user.role}', not 'admin'`);

      // Store the intended destination before redirecting
      localStorage.setItem('redirectAfterLogin', '/admin');
      window.location.href = '/auth';
      return;
    }

    console.log('✅ AdminDashboard: Access granted for admin user');
  }, [auth, isLoading]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (!auth.token) return;

    setLoading(true);
    try {
      const endpoints = {
        overview: '/api/admin/db-stats',
        healing: '/api/admin/healing-forms',
        questions: '/api/admin/questions',
        chats: '/api/admin/chats',
        newsletters: '/api/admin/newsletter-subscribers',
        blogs: '/api/admin/blogs'
      };

      const endpoint = endpoints[activeTab] || endpoints.overview;
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        if (activeTab === 'overview') {
          setData(prev => ({ ...prev, stats: result.data }));
        } else if (activeTab === 'healing') {
          setData(prev => ({ ...prev, healingForms: result.data.forms || [] }));
        } else if (activeTab === 'questions') {
          setData(prev => ({ ...prev, questions: result.data.questions || [] }));
        } else if (activeTab === 'chats') {
          setData(prev => ({ ...prev, chats: result.data.conversations || [] }));
        } else if (activeTab === 'newsletters') {
          setData(prev => ({ ...prev, newsletters: result.data.subscribers || [] }));
        } else if (activeTab === 'blogs') {
          setData(prev => ({ ...prev, blogs: result.data.blogs || [] }));
        }
      } else {
        setError(result.message || 'Failed to fetch data');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!auth.user || auth.user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'healing', label: 'Healing Forms', icon: Heart },
    { id: 'questions', label: 'Questions', icon: MessageSquare },
    { id: 'chats', label: 'Chats', icon: Users },
    { id: 'newsletters', label: 'Newsletter', icon: Mail },
    { id: 'blogs', label: 'Blog Posts', icon: FileText }
  ];

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{data.stats.userCount || 0}</p>
          </div>
          <Users className="h-8 w-8 text-[#BCC571]" />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Publications</p>
            <p className="text-2xl font-bold text-gray-900">{data.stats.publicationCount || 0}</p>
          </div>
          <FileText className="h-8 w-8 text-[#BCC571]" />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Orders</p>
            <p className="text-2xl font-bold text-gray-900">{data.stats.orderCount || 0}</p>
          </div>
          <BarChart3 className="h-8 w-8 text-[#BCC571]" />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Collections</p>
            <p className="text-2xl font-bold text-gray-900">{data.stats.collections?.length || 0}</p>
          </div>
          <Mail className="h-8 w-8 text-[#BCC571]" />
        </div>
      </div>
    </div>
  );

  const renderHealingForms = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Healing Form Submissions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seeking For</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.healingForms.map((form) => (
              <tr key={form._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{form.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{form.seekingFor}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    form.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    form.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    form.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {form.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(form.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderQuestions = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Question Submissions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.questions.map((question) => (
              <tr key={question._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{question.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{question.category}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{question.question}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    question.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    question.status === 'answered' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {question.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(question.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Blog management functions
  const handleCreateBlog = async (blogData) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(blogData)
      });

      const result = await response.json();

      if (result.success) {
        setShowBlogForm(false);
        fetchData(); // Refresh blog list
      } else {
        setError(result.message || 'Failed to create blog post');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Create blog error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        fetchData(); // Refresh blog list
      } else {
        setError(result.message || 'Failed to delete blog post');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Delete blog error:', error);
    }
  };

  const renderNewsletters = () => {
    const newsletters = data.subscribers || [];
    const stats = data.stats || {};

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Newsletter Subscribers</h3>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
            <div className="text-sm text-green-600">Active Subscribers</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.inactive || 0}</div>
            <div className="text-sm text-gray-600">Inactive Subscribers</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
            <div className="text-sm text-blue-600">Total Subscribers</div>
          </div>
        </div>

        {newsletters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No newsletter subscribers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {newsletters.map((subscriber) => (
                  <tr key={subscriber._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscriber.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {subscriber.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.source || 'website'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderBlogs = () => {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Blog Posts</h3>
            <button
              onClick={() => setShowBlogForm(true)}
              className="bg-[#BCC571] text-white px-4 py-2 rounded-md hover:bg-[#a9b45d] flex items-center gap-2"
            >
              <Plus size={16} />
              New Blog Post
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.blogs.map((blog) => (
                <tr key={blog._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {blog.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {blog.excerpt ? blog.excerpt.substring(0, 100) + '...' : 'No excerpt'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      blog.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : blog.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString()
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {blog.viewCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {blog.status === 'published' && (
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => {/* TODO: Edit functionality */}}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.blogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No blog posts found. Create your first blog post!
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BCC571]"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'healing':
        return renderHealingForms();
      case 'questions':
        return renderQuestions();
      case 'chats':
        return <ChatManagement />;
      case 'newsletters':
        return renderNewsletters();
      case 'blogs':
        return renderBlogs();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {auth.user?.name}</p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-[#BCC571] text-[#BCC571]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="mb-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Blog Form Modal */}
      {showBlogForm && (
        <BlogForm
          onClose={() => setShowBlogForm(false)}
          onSave={handleCreateBlog}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
