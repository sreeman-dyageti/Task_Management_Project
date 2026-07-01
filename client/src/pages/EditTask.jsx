import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import api from '../api/axios';

export default function EditTask() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { task_id } = useParams();

  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', status: 'pending', due_date: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchTask();
  }, []);

  const fetchTask = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/tasks/all' : '/tasks/my-tasks';
      const res = await api.get(endpoint);
      const task = res.data.tasks.find(t => t.task_id === parseInt(task_id));

      if (!task) {
        navigate('/tasks');
        return;
      }

      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date ? task.due_date.split('T')[0] : ''
      });
    } catch (err) {
      navigate('/tasks');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = user?.role === 'admin'
        ? `/tasks/admin/${task_id}`
        : `/tasks/${task_id}`;

      await api.patch(endpoint, form);
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted">Loading task...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark">Edit Task</h1>
          <p className="text-muted text-sm mt-1">Update task details</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="text-sm text-muted mb-1 block">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full bg-white border border-border-c text-dark rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mustard"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted mb-1 block">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white border border-border-c text-dark rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mustard resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm text-muted mb-1 block">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full bg-white border border-border-c text-dark rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mustard"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-sm text-muted mb-1 block">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full bg-white border border-border-c text-dark rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mustard"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-sm text-muted mb-1 block">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  className="w-full bg-white border border-border-c text-dark rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mustard"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-mustard hover:bg-mustard-dark text-dark text-sm font-medium px-6 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-white border border-border-c hover:bg-cream text-dark text-sm font-medium px-6 py-2.5 rounded-lg transition"
              >
                Cancel
              </button>
            </div>

          </form>
        </Card>
      </div>
    </PageWrapper>
  );
}