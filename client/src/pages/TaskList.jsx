import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import api from '../api/axios';

const priorityColors = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-mustard/20 text-mustard-dark',
  low:    'bg-green-100 text-green-600',
};

const statusColors = {
  pending:       'bg-border-c text-muted',
  'in-progress': 'bg-blue-100 text-blue-600',
  completed:     'bg-green-100 text-green-600',
};

export default function TaskList({ adminView }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (task_id) => {
    setExpanded(prev => ({ ...prev, [task_id]: !prev[task_id] }));
  };

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchTasks();
  }, [adminView]);

  const fetchTasks = async () => {
    try {
      const endpoint = adminView ? '/tasks/all' : '/tasks/my-tasks';
      const res = await api.get(endpoint);
      setTasks(res.data.tasks);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (task_id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${task_id}`);
      setTasks(tasks.filter(t => t.task_id !== task_id));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  return (
    <PageWrapper>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-dark">
              {adminView ? 'All Tasks' : 'My Tasks'}
            </h1>
            <p className="text-muted text-sm mt-1">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={() => navigate('/tasks/create')}
            className="bg-mustard hover:bg-mustard-dark text-dark font-medium text-sm px-5 py-2.5 rounded-lg transition"
          >
            + Create Task
          </button>
        </div>

        {loading && <p className="text-muted">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && tasks.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted">No tasks yet</p>
            <button
              onClick={() => navigate('/tasks/create')}
              className="mt-3 text-mustard-dark hover:underline text-sm"
            >
              Create your first task
            </button>
          </Card>
        )}

        <div className="space-y-3">
          {tasks.map(task => (
            <Card key={task.task_id} className="px-6 py-4">
              <div
                className="flex items-center justify-between gap-4 cursor-pointer"
                onClick={() => navigate(`/tasks/${task.task_id}`)}
              >
                <p className="text-dark font-medium truncate flex-1 min-w-0">
                  {task.title}
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  {task.project_name && (
                    <span className="text-xs px-2 py-1 rounded-full bg-mustard/10 text-mustard-dark">
                      {task.project_name}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
                    {task.status}
                  </span>
                  {task.due_date && (
                    <span className="text-xs text-muted hidden sm:inline">
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/tasks/edit/${task.task_id}`); }}
                    className="text-xs bg-white border border-border-c hover:bg-cream text-dark px-3 py-1.5 rounded-lg transition"
                  >
                    Edit
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(task.task_id); }}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {task.description && (
                <div className="mt-1">
                  <p className={`text-muted text-sm ${expanded[task.task_id] ? '' : 'line-clamp-1'}`}>
                    {task.description}
                  </p>
                  {task.description.length > 80 && (
                    <button
                      onClick={() => toggleExpand(task.task_id)}
                      className="text-mustard-dark text-xs hover:underline mt-0.5"
                    >
                      {expanded[task.task_id] ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 mt-1">
                {task.assigned_f_name && (
                  <p className="text-xs text-muted">
                    Assigned to: {task.assigned_f_name} {task.assigned_l_name}
                  </p>
                )}
                {user?.role === 'admin' && adminView && task.f_name && (
                  <p className="text-xs text-muted">
                    Created by: {task.f_name} {task.l_name}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}