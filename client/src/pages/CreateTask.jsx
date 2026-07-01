import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import api from '../api/axios';

export default function CreateTask() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProject = searchParams.get('project_id') || '';

  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', due_date: '',
    project_id: preselectedProject, assigned_to: ''
  });
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (form.project_id) {
      fetchMembers(form.project_id);
    } else {
      setMembers([]);
    }
  }, [form.project_id]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/myProjects');
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async (project_id) => {
    try {
      const res = await api.get(`/projects/${project_id}/members`);
      setMembers(res.data.members);
    } catch (err) {
      console.error(err);
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
      const payload = {
        ...form,
        project_id: form.project_id ? parseInt(form.project_id) : null,
        assigned_to: form.assigned_to ? parseInt(form.assigned_to) : null,
        due_date: form.due_date || null,
      };
      await api.post('/tasks/create', payload);
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark">Create Task</h1>
          <p className="text-muted text-sm mt-1">Add a new task to your list</p>
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
                placeholder="Task title"
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
                placeholder="What needs to be done?"
                rows={3}
                className="w-full bg-white border border-border-c text-dark rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mustard resize-none"
              />
            </div>

            <div>
              <label className="text-sm text-muted mb-1 block">Project (optional)</label>
              <select
                name="project_id"
                value={form.project_id}
                onChange={handleChange}
                className="w-full bg-white border border-border-c text-dark rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mustard"
              >
                <option value="">No project</option>
                {projects.map(p => (
                  <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
                ))}
              </select>
            </div>

            {form.project_id && (
              <div className="animate-fade-in">
                <label className="text-sm text-muted mb-1 block">Assign To</label>
                <select
                  name="assigned_to"
                  value={form.assigned_to}
                  onChange={handleChange}
                  className="w-full bg-white border border-border-c text-dark rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mustard"
                >
                  <option value="">Myself</option>
                  {members.map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.f_name} {m.l_name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-4">
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
                {loading ? 'Creating...' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/tasks')}
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