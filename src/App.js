import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import PaymentPage from './pages/PaymentPage';
import ExamPage from './pages/ExamPage';
import Profile from './pages/Profile';
import InstructorPaymentsPage from './pages/InstructorPaymentsPage';
import ExamGradingPage from './pages/ExamGradingPage';
import ExamResults from './pages/ExamResults';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/student-dashboard"
                element={
                  <PrivateRoute role="student">
                    <StudentDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/instructor-dashboard"
                element={
                  <PrivateRoute role="instructor">
                    <InstructorDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <PrivateRoute role="student">
                    <PaymentPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/exams"
                element={
                  <PrivateRoute>
                    <ExamPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/instructor-payments"
                element={
                  <PrivateRoute role="instructor">
                    <InstructorPaymentsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/exam/:examId/grade"
                element={
                  <PrivateRoute role="instructor">
                    <ExamGradingPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/exam-results"
                element={
                  <PrivateRoute role="student">
                    <ExamResults />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
