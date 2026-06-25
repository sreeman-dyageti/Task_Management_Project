import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const priorityColors = {
  high:   'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low:    'bg-green-500/20 text-green-400',
};

const statusColors = {
  pending:       'bg-gray-500/20 text-gray-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  completed:     'bg-green-500/20 text-green-400',
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
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {adminView ? 'All Tasks' : 'My Tasks'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={() => navigate('/tasks/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
          >
            + Create Task
          </button>
        </div>

        {loading && <p className="text-gray-400">Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && tasks.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No tasks yet</p>
            <button
              onClick={() => navigate('/tasks/create')}
              className="mt-4 text-indigo-400 hover:underline text-sm"
            >
              Create your first task
            </button>
          </div>
        )}

        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task.task_id}
              className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4"
            >
              {/* Top row — title, badges, buttons */}
              <div className="flex items-center justify-between gap-4">
                <p className="text-white font-medium truncate flex-1 min-w-0">
                  {task.title}
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
                    {task.status}
                  </span>
                  {task.due_date && (
                    <span className="text-xs text-gray-500">
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                  <button
                    onClick={() => navigate(`/tasks/edit/${task.task_id}`)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    Edit
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(task.task_id)}
                      className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Description + show more */}
              {task.description && (
                <div className="mt-1">
                  <p className={`text-gray-400 text-sm ${expanded[task.task_id] ? '' : 'line-clamp-1'}`}>
                    {task.description}
                  </p>
                  {task.description.length > 80 && (
                    <button
                      onClick={() => toggleExpand(task.task_id)}
                      className="text-indigo-400 text-xs hover:underline mt-0.5"
                    >
                      {expanded[task.task_id] ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}

              {/* Admin user info */}
              {user?.role === 'admin' && adminView && task.f_name && (
                <p className="text-gray-500 text-xs mt-1">
                  {task.f_name} {task.l_name} · {task.email}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}