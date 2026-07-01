import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import api from '../api/axios';

export default function ProjectDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [projectRes, membersRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/members`),
        api.get(`/tasks/project/${projectId}`),
      ]);
      setProject(projectRes.data.project);
      setMembers(membersRes.data.members);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = members.find(m => m.user_id === user?.user_id)?.role === 'owner';

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/projects/${projectId}/members`, { user_id: parseInt(newUserId) });
      setNewUserId('');
      setShowAddMember(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${memberId}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-muted">Loading project...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10">

        <Card className="p-6 mb-6">
          <h1 className="text-2xl font-bold text-dark">{project?.project_name}</h1>
          <p className="text-muted text-sm mt-1">{project?.description}</p>
          <button
            onClick={() => navigate(`/tasks/create?project_id=${projectId}`)}
            className="mt-4 bg-mustard hover:bg-mustard-dark text-dark font-medium text-sm px-5 py-2.5 rounded-lg transition"
          >
            + Create Task in Project
          </button>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Members */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-dark font-semibold">Members</h2>
              {isOwner && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="text-mustard-dark text-xs hover:underline"
                >
                  {showAddMember ? 'Cancel' : '+ Add'}
                </button>
              )}
            </div>

            {showAddMember && (
              <form onSubmit={handleAddMember} className="mb-4 space-y-2 animate-fade-in">
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <input
                  type="number"
                  placeholder="User ID"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="w-full bg-white border border-border-c text-dark rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-mustard"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-mustard hover:bg-mustard-dark text-dark text-sm font-medium py-2 rounded-lg transition"
                >
                  Add Member
                </button>
              </form>
            )}

            <div className="space-y-3">
              {members.map(m => (
                <div key={m.user_id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark">{m.f_name} {m.l_name}</p>
                    <p className="text-xs text-muted">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      m.role === 'owner' ? 'bg-mustard/20 text-mustard-dark' : 'bg-border-c text-muted'
                    }`}>
                      {m.role}
                    </span>
                    {isOwner && m.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(m.user_id)}
                        className="text-red-500 text-xs hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Tasks */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-dark font-semibold mb-4">Project Tasks</h2>
            {tasks.length === 0 ? (
              <p className="text-muted text-sm">No tasks in this project yet</p>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div
                    key={task.task_id}
                    onClick={() => navigate(`/tasks/${task.task_id}`)}
                    className="border border-border-c rounded-xl p-4 cursor-pointer hover:bg-cream transition"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-dark font-medium">{task.title}</p>
                      <span className="text-xs text-muted">
                        {task.assigned_f_name ? `${task.assigned_f_name} ${task.assigned_l_name}` : 'Unassigned'}
                      </span>
                    </div>
                    <p className="text-muted text-sm mt-1 line-clamp-1">{task.description}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      </div>
    </PageWrapper>
  );
}