import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';

// Unified app: everyone who isn't HR lands here. It shows a "My Team" tab
// (only if this user actually has direct reports — e.g. Priya, Rohan, the
// COO, and the Bright Path founder see it; a regular employee like Amit
// doesn't) and a "My Feedback History" tab that everyone sees, since
// everyone in the hierarchy (except the top of the chain) receives
// feedback from someone above them.
function EmployeeApp() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [team, setTeam] = useState([]);
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('history');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [teamRes, pendingRes, historyRes] = await Promise.all([
        axiosClient.get('/feedback/team'),
        axiosClient.get('/feedback/pending'),
        axiosClient.get('/feedback/history')
      ]);

      setTeam(teamRes.data);
      setPending(pendingRes.data);
      setHistory(historyRes.data);
      setTab(teamRes.data.length > 0 ? 'team' : 'history');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg font-medium text-slate-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Performance Evaluation
            </h1>
            <p className="mt-1 text-slate-600">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-2">
          {team.length > 0 && (
            <button
              onClick={() => setTab('team')}
              className={`rounded-xl px-4 py-2 font-medium transition ${
                tab === 'team'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              My Team ({pending.length} pending)
            </button>
          )}
          <button
            onClick={() => setTab('history')}
            className={`rounded-xl px-4 py-2 font-medium transition ${
              tab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            My Feedback History
          </button>
        </div>

        {tab === 'team' && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-800">
              Team members pending feedback this cycle
            </h2>

            {pending.length === 0 ? (
              <div className="rounded-xl bg-green-50 p-6 text-center text-green-700">
                All caught up — no pending feedback 🎉
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pending.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between py-4"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {item.employeeId?.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.employeeId?.email} · {item.cycleId?.month}/
                        {item.cycleId?.year}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/app/feedback/${item._id}`)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Give Feedback
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-6">
            {history.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center text-slate-600 shadow-sm">
                No feedback received yet.
              </div>
            ) : (
              history.map((item) => (
                <div key={item._id} className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-800">
                      {item.cycleId?.month}/{item.cycleId?.year}
                    </h3>
                    <span className="text-sm text-slate-500">
                      By {item.managerId?.name}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {item.ratings.map((r, idx) => (
                      <div key={idx} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{r.parameterName}</p>
                          <p className="font-semibold text-blue-600">
                            {r.score}/5
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {r.reason}
                        </p>
                      </div>
                    ))}
                  </div>

                  {item.comment && (
                    <div className="mt-4 rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-700">
                        Overall Comment
                      </p>
                      <p className="mt-1 text-slate-600">{item.comment}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeApp;
