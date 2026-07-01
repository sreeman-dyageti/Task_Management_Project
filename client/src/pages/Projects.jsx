import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import api from '../api/axios';

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ project_name: '', description: '' });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/myProjects');
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      await api.post('/projects/createProject', form);
      setForm({ project_name: '', description: '' });
      setShowCreate(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageWrapper>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-dark">Projects</h1>
            <p className="text-muted text-sm mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''} you're part of
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-mustard hover:bg-mustard-dark text-dark font-medium text-sm px-5 py-2.5 rounded-lg transition"
          >
            {showCreate ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {showCreate && (
          <Card className="p-6 mb-6 animate-fade-in">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm text-muted mb-1 block">Project Name *</label>
                <input
                  type="text"
                  name="project_name"
                  value={form.project_name}
                  onChange={handleChange}
                  placeholder="e.g. HR Portal"
                  className="w-full bg-white border border-border-c text-dark rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mustard"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted mb-1 block">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full bg-white border border-border-c text-dark rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mustard resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="bg-mustard hover:bg-mustard-dark text-dark font-medium text-sm px-6 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </Card>
        )}

        {loading ? (
          <p className="text-muted">Loading projects...</p>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted">No projects yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-mustard-dark hover:underline text-sm"
            >
              Create your first project
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <Card
                key={project.project_id}
                className="p-5 cursor-pointer"
                onClickCapture={() => navigate(`/projects/${project.project_id}`)}
              >
                <div onClick={() => navigate(`/projects/${project.project_id}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-dark font-semibold">{project.project_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                      project.role === 'owner'
                        ? 'bg-mustard/20 text-mustard-dark'
                        : 'bg-border-c text-muted'
                    }`}>
                      {project.role}
                    </span>
                  </div>
                  <p className="text-muted text-sm line-clamp-2">{project.description}</p>
                  <p className="text-xs text-muted mt-3">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}