import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const StatCard = ({ label, value, color }) => (
  <div className={`bg-gray-900 rounded-2xl p-6 border ${color}`}>
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <p className="text-3xl font-bold text-white">{value}</p>
  </div>
);


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

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, high: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchData();
  }, []);

const toggleExpand = (task_id) => {
  setExpanded(prev => ({ ...prev, [task_id]: !prev[task_id] }));
};

  const fetchData = async () => {
    try {
      const res = await api.get('/tasks/my-tasks');
      const tasks = res.data.tasks;

      setStats({
        total:     tasks.length,
        pending:   tasks.filter(t => t.status === 'pending').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        high:      tasks.filter(t => t.priority === 'high').length,
      });

      // latest 5 tasks
      setRecentTasks(tasks.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.f_name}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Here's what's happening with your tasks
          </p>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Tasks"   value={stats.total}     color="border-gray-700" />
              <StatCard label="Pending"       value={stats.pending}   color="border-yellow-500/30" />
              <StatCard label="Completed"     value={stats.completed} color="border-green-500/30" />
              <StatCard label="High Priority" value={stats.high}      color="border-red-500/30" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-10">
              <button
                onClick={() => navigate('/tasks/create')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                + Create Task
              </button>
              <button
                onClick={() => navigate('/tasks')}
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                View My Tasks
              </button>
            </div>

            {/* Recent Tasks */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Recent Tasks</h2>

              {recentTasks.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
                  <p className="text-gray-500">No tasks yet</p>
                  <button
                    onClick={() => navigate('/tasks/create')}
                    className="mt-3 text-indigo-400 hover:underline text-sm"
                  >
                    Create your first task
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map(task => (
                  <div
                    key={task.task_id}
                    className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4"
                  >
                    {/* Top row — title + badges + edit */}
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <p className="text-white font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
                          {task.status}
                        </span>
                        <button
                          onClick={() => navigate(`/tasks/edit/${task.task_id}`)}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Description + show more */}
                    {task.description && (
                      <div>
                        <p className={`text-gray-400 text-sm ${expanded[task.task_id] ? '' : 'line-clamp-1'}`}>
                          {task.description}
                        </p>
                        {task.description.length > 80 && (
                          <button
                            onClick={() => toggleExpand(task.task_id)}
                            className="text-indigo-400 text-xs hover:underline mt-1"
                          >
                            {expanded[task.task_id] ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}