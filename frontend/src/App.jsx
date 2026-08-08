import { BrowserRouter, Routes, Route, Navigate } from 'react-router';

import LoginPage from './pages/LoginPage';
import EmployeeApp from './pages/EmployeeApp';
import FeedbackForm from './pages/FeedbackForm';
import HRApp from './pages/HRApp';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

// Both the "logged in?" check and the "right role?" check live here,
// instead of just checking `user ? ... : ...` per-route like the original
// did. That original version let any logged-in user, including a plain
// employee, type /hr into the URL bar and load the HR dashboard — the API
// calls would 403, but the shell of the page still rendered.
function ProtectedRoute({ children, allow }) {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

// Deliberately its own component, NOT inlined as a ternary in App's JSX.
// If this logic lived directly in App() using a `user` variable computed
// at App's top level, it would go stale: client-side navigation (e.g. the
// navigate('/') call right after login) doesn't remount App, so App's own
// closure would keep whatever `user` value existed at initial page load
// (often null, pre-login) and bounce back to /login in a loop. Making it
// its own component means React re-invokes this function — and re-reads
// localStorage — every time the "/" route is matched.
function RootRedirect() {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'hr' ? '/hr' : '/app'} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute allow={['employee']}>
              <EmployeeApp />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/feedback/:assignmentId"
          element={
            <ProtectedRoute allow={['employee']}>
              <FeedbackForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr"
          element={
            <ProtectedRoute allow={['hr']}>
              <HRApp />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<RootRedirect />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
