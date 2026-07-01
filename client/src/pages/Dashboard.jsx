import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import api from '../api/axios';

const STAT_CONFIG = [
  { key: 'totalTasks',      label: 'Total Tasks',    color: 'text-dark' },
  { key: 'pendingTasks',    label: 'Pending',         color: 'text-yellow-600' },
  { key: 'completedTasks',  label: 'Completed',       color: 'text-green-600' },
  { key: 'overdueTasks',    label: 'Overdue',         color: 'text-red-600' },
  { key: 'highPriorityTasks', label: 'High Priority', color: 'text-orange-600' },
];

const PIE_COLORS = ['#D9A441', '#8A8272', '#4CAF7D'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const endpoint = user?.role === 'admin'
        ? '/dashboard/admin-analytics'
        : '/dashboard/my-analytics';

     const metricsRes = await api.get(endpoint);
     setMetrics(metricsRes.data.metrics);

      setMetrics(metricsRes.data.metrics);

      // for admin, pull recent activity across all — for employee, skip or use project activity
      if (user?.role === 'admin') {
        const allActivity = await api.get('/activity/all');
        setActivity(allActivity.data.logs.slice(0, 6));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = metrics ? [
    { name: 'Pending', value: metrics.pendingTasks },
    { name: 'Completed', value: metrics.completedTasks },
    { name: 'Other', value: Math.max(metrics.totalTasks - metrics.pendingTasks - metrics.completedTasks, 0) },
  ] : [];

  return (
    <PageWrapper>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">

        {/* Welcome Card */}
        <Card className="p-6 md:p-8 mb-6 bg-gradient-to-r from-mustard/10 to-transparent">
          <h1 className="text-2xl md:text-3xl font-bold text-dark">
            Welcome back, {user?.f_name}
          </h1>
          <p className="text-muted text-sm mt-1">
            Here's what's happening {user?.role === 'admin' ? 'across your team' : 'with your tasks'}
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => navigate('/tasks/create')}
              className="bg-mustard hover:bg-mustard-dark text-dark font-medium text-sm px-5 py-2.5 rounded-lg transition"
            >
              + Create Task
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="bg-white border border-border-c hover:bg-cream text-dark text-sm font-medium px-5 py-2.5 rounded-lg transition"
            >
              View My Tasks
            </button>
          </div>
        </Card>

        {loading || !metrics ? (
          <p className="text-muted">Loading dashboard...</p>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
              {STAT_CONFIG.map(stat => (
                <Card key={stat.key} className="p-4 md:p-5">
                  <p className="text-muted text-xs md:text-sm mb-1">{stat.label}</p>
                  <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                    {metrics[stat.key]}
                  </p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Donut Chart */}
              <Card className="p-6 lg:col-span-1">
                <h2 className="text-dark font-semibold mb-4">Task Breakdown</h2>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-muted">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {entry.name} ({entry.value})
                    </div>
                  ))}
                </div>
              </Card>

              {/* Tasks per employee (admin) or recent activity */}
              <Card className="p-6 lg:col-span-2">
                {user?.role === 'admin' && metrics.tasksPerEmployee ? (
                  <>
                    <h2 className="text-dark font-semibold mb-4">Tasks Per Employee</h2>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {metrics.tasksPerEmployee.map(emp => (
                        <div key={emp.user_id} className="flex items-center justify-between">
                          <span className="text-sm text-dark">{emp.name}</span>
                          <div className="flex items-center gap-2 flex-1 max-w-[60%] ml-4">
                            <div className="flex-1 bg-border-c rounded-full h-2">
                              <div
                                className="bg-mustard h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(emp.task_count * 15, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted w-6 text-right">{emp.task_count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-dark font-semibold mb-4">Recent Activity</h2>
                    <p className="text-muted text-sm">Visit a project to see its activity timeline.</p>
                  </>
                )}
              </Card>
            </div>

            {/* Recent Activity — admin only, global feed */}
            {user?.role === 'admin' && activity.length > 0 && (
              <Card className="p-6 mt-6">
                <h2 className="text-dark font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {activity.map(log => (
                    <div key={log.log_id} className="flex items-start gap-3 text-sm">
                      <span className="w-2 h-2 rounded-full bg-mustard mt-1.5 shrink-0" />
                      <div>
                        <p className="text-dark">{log.description}</p>
                        <p className="text-muted text-xs mt-0.5">
                          {log.f_name} {log.l_name} · {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}