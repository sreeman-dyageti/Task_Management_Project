import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function TaskDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { task_id } = useParams();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [tab, setTab] = useState('comments');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/tasks/all' : '/tasks/my-tasks';
      const [taskListRes, commentsRes, activityRes] = await Promise.all([
        api.get(endpoint),
        api.get(`/tasks/${task_id}/comments`),
        api.get(`/activity/task/${task_id}`),
      ]);

      const found = taskListRes.data.tasks.find(t => t.task_id === parseInt(task_id));
      if (!found) { navigate('/tasks'); return; }

      setTask(found);
      setComments(commentsRes.data.comments);
      setActivity(activityRes.data.logs);
    } catch (err) {
      console.error(err);
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);

    try {
      const res = await api.post(`/tasks/${task_id}/comments`, { content: newComment.trim() });
      setComments(prev => [...prev, res.data.comment]);
      setNewComment('');
      // refresh activity since a comment log was added
      const activityRes = await api.get(`/activity/task/${task_id}`);
      setActivity(activityRes.data.logs);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (comment_id) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${comment_id}`);
      setComments(prev => prev.filter(c => c.comment_id !== comment_id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete comment');
    }
  };

  if (loading || !task) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <p className="text-muted">Loading task...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10">

        {/* Task Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-dark">{task.title}</h1>
              {task.project_name && (
                <p className="text-mustard-dark text-sm mt-1">{task.project_name}</p>
              )}
            </div>
            <button
              onClick={() => navigate(`/tasks/edit/${task.task_id}`)}
              className="bg-white border border-border-c hover:bg-cream text-dark text-sm font-medium px-4 py-2 rounded-lg transition shrink-0"
            >
              Edit Task
            </button>
          </div>

          <p className="text-muted text-sm mt-4">{task.description || 'No description'}</p>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
              {task.status}
            </span>
            {task.due_date && (
              <span className="text-xs text-muted">
                Due {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            {task.assigned_f_name && (
              <span className="text-xs text-muted">
                · Assigned to {task.assigned_f_name} {task.assigned_l_name}
              </span>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-card border border-border-c rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('comments')}
            className={`text-sm px-4 py-2 rounded-lg transition ${
              tab === 'comments' ? 'bg-mustard text-dark font-medium' : 'text-muted hover:text-dark'
            }`}
          >
            Comments ({comments.length})
          </button>
          <button
            onClick={() => setTab('activity')}
            className={`text-sm px-4 py-2 rounded-lg transition ${
              tab === 'activity' ? 'bg-mustard text-dark font-medium' : 'text-muted hover:text-dark'
            }`}
          >
            Activity ({activity.length})
          </button>
        </div>

        {/* Comments Tab */}
        {tab === 'comments' && (
          <Card className="p-6 animate-fade-in">
            <form onSubmit={handlePostComment} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-white border border-border-c text-dark rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mustard"
              />
              <button
                type="submit"
                disabled={posting || !newComment.trim()}
                className="bg-mustard hover:bg-mustard-dark text-dark text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </form>

            {comments.length === 0 ? (
              <p className="text-muted text-sm text-center py-6">No comments yet — start the discussion</p>
            ) : (
              <div className="space-y-4">
                {comments.map(c => (
                  <div key={c.comment_id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-mustard/20 text-mustard-dark flex items-center justify-center text-xs font-semibold shrink-0">
                      {c.f_name?.[0]}{c.l_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-dark">{c.f_name} {c.l_name}</p>
                        <p className="text-xs text-muted">{new Date(c.created_at).toLocaleString()}</p>
                        {(c.user_id === user?.user_id || user?.role === 'admin') && (
                          <button
                            onClick={() => handleDeleteComment(c.comment_id)}
                            className="text-xs text-red-500 hover:underline ml-auto"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-dark mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Activity Tab */}
        {tab === 'activity' && (
          <Card className="p-6 animate-fade-in">
            {activity.length === 0 ? (
              <p className="text-muted text-sm text-center py-6">No activity recorded yet</p>
            ) : (
              <div className="space-y-4">
                {activity.map(log => (
                  <div key={log.log_id} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-mustard mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-dark">{log.description}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {log.f_name} {log.l_name} · {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

      </div>
    </PageWrapper>
  );
}