import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { PARAMETERS } from '../constants/parameters';

function FeedbackForm() {
  const navigate = useNavigate();
  const { assignmentId } = useParams();

  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [ratings, setRatings] = useState(
    PARAMETERS.map((p) => ({ parameterName: p, score: 3, reason: '' }))
  );

  const updateRating = (index, field, value) => {
    const copy = [...ratings];
    copy[index][field] = value;
    setRatings(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await axiosClient.post('/feedback/submit', {
        assignmentId,
        ratings,
        comment
      });

      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Submit Feedback</h1>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {ratings.map((item, index) => (
            <div key={item.parameterName} className="rounded-xl border p-4">
              <h2 className="font-semibold">{item.parameterName}</h2>

              <div className="mt-3">
                <label className="mb-1 block text-sm font-medium">Score</label>
                <select
                  value={item.score}
                  onChange={(e) =>
                    updateRating(index, 'score', Number(e.target.value))
                  }
                  className="w-full rounded-lg border p-2"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-sm font-medium">
                  Why this score?
                </label>
                <textarea
                  value={item.reason}
                  onChange={(e) => updateRating(index, 'reason', e.target.value)}
                  className="w-full rounded-lg border p-3"
                  rows={3}
                  required
                />
              </div>
            </div>
          ))}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Overall Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border p-3"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="rounded-xl border px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FeedbackForm;
