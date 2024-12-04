import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDownIcon, ChevronUpIcon, EnvelopeIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function InstructorDashboard() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [emailContent, setEmailContent] = useState({
    subject: '',
    message: ''
  });
  const [newExam, setNewExam] = useState({
    examDate: '',
    maxRegistrants: '',
    targetBelt: 'yellow',
    eligibilityRequirements: {
      minimumBelt: 'white',
      minimumTrainingMonths: 3
    }
  });
  const [expandedExams, setExpandedExams] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser._id]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [studentsRes, examsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/instructor/${currentUser._id}/students`, { headers }),
        axios.get(`http://localhost:5000/api/exams?instructor=${currentUser._id}`, { headers })
      ]);

      setStudents(studentsRes.data);
      setExams(examsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/exams',
        newExam,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
      setNewExam({
        examDate: '',
        maxRegistrants: '',
        targetBelt: 'yellow',
        eligibilityRequirements: {
          minimumBelt: 'white',
          minimumTrainingMonths: 3
        }
      });
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  };

  const handleBlockStudent = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/users/${studentId}/block`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) {
      console.error('Error blocking student:', error);
    }
  };

  const handleSendEmail = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/send-email/${studentId}`,
        emailContent,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.success) {
        setShowEmailModal(false);
        setEmailContent({ subject: '', message: '' });
        alert('Email sent successfully!');
      } else {
        alert('Failed to send email: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email: ' + (error.response?.data?.message || error.message));
    }
  };

  const toggleExamDetails = (examId) => {
    setExpandedExams(prev => ({
      ...prev,
      [examId]: !prev[examId]
    }));
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/exams/${examId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating exam status:', error);
    }
  };

  const EmailModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Send Email to {selectedStudent?.fullName}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              className="input-field"
              value={emailContent.subject}
              onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              className="input-field h-32"
              value={emailContent.message}
              onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowEmailModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSendEmail(selectedStudent._id)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md"
            >
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>

      {/* Students Section */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">My Students</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Belt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{student.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.beltLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {student.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-4">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowEmailModal(true);
                      }}
                      className="text-gray-600 hover:text-primary"
                      title="Send Email"
                    >
                      <EnvelopeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleBlockStudent(student._id)}
                      className={`${student.isBlocked ? 'text-green-600' : 'text-red-600'}`}
                      title={student.isBlocked ? 'Unblock Student' : 'Block Student'}
                    >
                      {student.isBlocked ? 
                        <LockOpenIcon className="h-5 w-5" /> : 
                        <LockClosedIcon className="h-5 w-5" />
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Existing Exams Section with Registrants */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">My Exams</h2>
        <div className="space-y-6">
          {exams.map((exam) => (
            <div key={exam._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{exam.examName}</h3>
                  <p className="text-gray-600">Target Belt: {exam.targetBelt}</p>
                  <p className="text-gray-600">Date: {new Date(exam.examDate).toLocaleDateString()}</p>
                  <p className="text-gray-600">
                    Registrants: {exam.currentRegistrants.length} / {exam.maxRegistrants}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    exam.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    exam.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {exam.status}
                  </span>
                  <button
                    onClick={() => toggleExamDetails(exam._id)}
                    className="text-gray-600 hover:text-primary"
                    title="Toggle Registrants"
                  >
                    {expandedExams[exam._id] ? 
                      <ChevronUpIcon className="h-5 w-5" /> : 
                      <ChevronDownIcon className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>

              {expandedExams[exam._id] && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Registered Students:</h4>
                  <div className="bg-gray-50 rounded-md p-4">
                    {exam.currentRegistrants.length > 0 ? (
                      <ul className="space-y-2">
                        {exam.currentRegistrants.map((student) => (
                          <li key={student._id} className="flex justify-between items-center">
                            <span>{student.fullName}</span>
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowEmailModal(true);
                              }}
                              className="text-gray-600 hover:text-primary"
                              title="Contact Student"
                            >
                              <EnvelopeIcon className="h-5 w-5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No students registered yet</p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                {exam.status === 'upcoming' && (
                  <button
                    onClick={() => handleStatusChange(exam._id, 'ongoing')}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                  >
                    Start Exam
                  </button>
                )}
                {exam.status === 'ongoing' && (
                  <>
                    <Link
                      to={`/exam/${exam._id}/grade`}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md"
                    >
                      Grade Exam
                    </Link>
                    <button
                      onClick={() => handleStatusChange(exam._id, 'completed')}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md"
                    >
                      End Exam
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEmailModal && selectedStudent && <EmailModal />}
    </div>
  );
} 