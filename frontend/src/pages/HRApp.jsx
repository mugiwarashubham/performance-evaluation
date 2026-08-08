import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';

function HRApp() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [summary, setSummary] = useState(null);
  const [pendingDetail, setPendingDetail] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCycles();
  }, []);

  useEffect(() => {
    if (selectedCycle) loadCycleData(selectedCycle);
  }, [selectedCycle]);

  const loadCycles = async () => {
    try {
      const res = await axiosClient.get('/hr/cycles');
      setCycles(res.data);
      if (res.data.length > 0) setSelectedCycle(res.data[0]._id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCycleData = async (cycleId) => {
    try {
      const [summaryRes, pendingRes] = await Promise.all([
        axiosClient.get(`/hr/summary/${cycleId}`),
        axiosClient.get(`/hr/pending/${cycleId}`)
      ]);
      setSummary(summaryRes.data);
      setPendingDetail(pendingRes.data);
    } catch (error) {
      console.error(error);
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
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">HR Dashboard</h1>
            <p className="mt-1 text-slate-600">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {cycles.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-slate-600 shadow-sm">
            No feedback cycles found for this company yet.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-sm">
              <label className="font-medium text-slate-700">Cycle:</label>
              <select
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="rounded-lg border p-2"
              >
                {cycles.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.month}/{c.year} — {c.status}
                  </option>
                ))}
              </select>
            </div>

            {summary && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">Total Assignments</p>
                  <p className="mt-2 text-3xl font-bold text-slate-800">
                    {summary.totalAssignments}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">Submitted</p>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    {summary.submitted}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">Pending</p>
                  <p className="mt-2 text-3xl font-bold text-yellow-600">
                    {summary.pending}
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-800">
                Who still hasn't submitted
              </h2>

              {pendingDetail.length === 0 ? (
                <div className="rounded-xl bg-green-50 p-6 text-center text-green-700">
                  Everyone has submitted 🎉
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                          Manager
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                          Employee
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingDetail.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-800">
                            {item.managerId?.name}{' '}
                            <span className="text-slate-500">
                              ({item.managerId?.email})
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            {item.employeeId?.name}{' '}
                            <span className="text-slate-500">
                              ({item.employeeId?.email})
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HRApp;
