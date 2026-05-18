import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import EditorRoom from './pages/EditorRoom';
import PlagiarismReport from './pages/PlagiarismReport';
import ExamRoom from './pages/ExamRoom';
import SubmissionsList from './pages/SubmissionsList';
import KeystrokeAnalysis from './pages/KeystrokeAnalysis';
import { ToastProvider } from './components/ui/Toast';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<><Navbar /><LandingPage /></>} />
          <Route path="/login" element={<><Navbar /><Login /></>} />
          <Route path="/register" element={<><Navbar /><Register /></>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/create-room" element={<PrivateRoute><CreateRoom /></PrivateRoute>} />
          <Route path="/join-room" element={<PrivateRoute><JoinRoom /></PrivateRoute>} />
          <Route path="/editor/:roomId" element={<PrivateRoute><EditorRoom /></PrivateRoute>} />
          <Route path="/plagiarism/:roomId" element={<PrivateRoute><PlagiarismReport /></PrivateRoute>} />
          <Route path="/exam/:roomId" element={<PrivateRoute><ExamRoom /></PrivateRoute>} />
          <Route path="/submissions/:roomId" element={<PrivateRoute><SubmissionsList /></PrivateRoute>} />
          <Route path="/keystroke/:roomId" element={<PrivateRoute><KeystrokeAnalysis /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;