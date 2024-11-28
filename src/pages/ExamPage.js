import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function ExamPage() {
  const { currentUser } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    belt: '',
    status: 'upcoming'
  });
  const [showExamForm, setShowExamForm] = useState(false);
  const [newExam, setNewExam] = useState({
    examName: '',
    examDate: '',
    maxRegistrants: '',
    targetBelt: 'yellow',
    eligibilityRequirements: {
      minimumBelt: 'white',
      minimumTrainingMonths: 3
    }
  });

  useEffect(() => {
    fetchExams();
  }, [filter]);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(
        Object.entries(filter).filter(([_, value]) => value !== '')
      ).toString();
      const response = await axios.get(
        `http://localhost:5000/api/exams?${queryParams}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/exams/${examId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchExams();
    } catch (error) {
      console.error('Error registering for exam:', error);
      alert(error.response?.data?.message || 'Failed to register for exam');
    }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/exams/${examId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchExams();
    } catch (error) {
      console.error('Error updating exam status:', error);
    }
  };

  const isEligible = (exam) => {
    const beltLevels = ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'];
    const currentBeltIndex = beltLevels.indexOf(currentUser.beltLevel);
    const requiredBeltIndex = beltLevels.indexOf(exam.eligibilityRequirements.minimumBelt);
    return currentBeltIndex >= requiredBeltIndex;
  };

  const isRegistered = (exam) => {
    return exam.currentRegistrants.some(
      registrant => registrant._id === currentUser._id
    );
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const examData = {
        ...newExam,
        examDate: new Date(newExam.examDate).toISOString(),
        maxRegistrants: parseInt(newExam.maxRegistrants),
        eligibilityRequirements: {
          ...newExam.eligibilityRequirements,
          minimumTrainingMonths: parseInt(newExam.eligibilityRequirements.minimumTrainingMonths)
        }
      };

      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/exams',
        examData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Exam created successfully!');
      
      setNewExam({
        examName: '',
        examDate: '',
        maxRegistrants: '',
        targetBelt: 'yellow',
        eligibilityRequirements: {
          minimumBelt: 'white',
          minimumTrainingMonths: 3
        }
      });
      setShowExamForm(false);
      
      fetchExams();
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Failed to create exam: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/exams/${examId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchExams(); // Refresh the exams list
      alert('Exam deleted successfully');
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert(error.response?.data?.message || 'Failed to delete exam');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900">Exams</h1>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Belt Level Filter */}
          <div className="relative flex-1">
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={filter.belt}
              onChange={(e) => setFilter({ ...filter, belt: e.target.value })}
            >
              <option value="">All Belts</option>
              <option value="yellow">Yellow</option>
              <option value="orange">Orange</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
              <option value="brown">Brown</option>
              <option value="black">Black</option>
            </select>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter({ ...filter, status: '' })}
              className={`px-4 py-2 rounded-md ${
                filter.status === '' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter({ ...filter, status: 'upcoming' })}
              className={`px-4 py-2 rounded-md ${
                filter.status === 'upcoming' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter({ ...filter, status: 'ongoing' })}
              className={`px-4 py-2 rounded-md ${
                filter.status === 'ongoing' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              Ongoing
            </button>
            <button
              onClick={() => setFilter({ ...filter, status: 'completed' })}
              className={`px-4 py-2 rounded-md ${
                filter.status === 'completed' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Create Exam Button - only show for instructors */}
      {currentUser.role === 'instructor' && (
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setShowExamForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md"
          >
            Create New Exam
          </button>
        </div>
      )}

      {/* Exams List */}
      <div className="mt-6 grid gap-6">
        {exams.map((exam) => (
          <div key={exam._id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {exam.examName}
                </h3>
                <p className="text-sm text-gray-500">
                  Target Belt: {exam.targetBelt.charAt(0).toUpperCase() + exam.targetBelt.slice(1)}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Instructor: {exam.instructor.fullName}
                </p>
                <p className="text-sm text-gray-500">
                  Date: {new Date(exam.examDate).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Spots: {exam.currentRegistrants.length} / {exam.maxRegistrants}
                </p>
                <p className="text-sm text-gray-500">
                  Minimum Belt Required: {exam.eligibilityRequirements.minimumBelt}
                </p>
              </div>
              <div className="flex space-x-2">
                {currentUser.role === 'student' && exam.status === 'upcoming' && (
                  <button
                    onClick={() => handleRegister(exam._id)}
                    disabled={!isEligible(exam) || isRegistered(exam)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      isRegistered(exam)
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : !isEligible(exam)
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {isRegistered(exam)
                      ? '✓ Registered'
                      : !isEligible(exam)
                      ? 'Not Eligible'
                      : 'Register'}
                  </button>
                )}
                {currentUser.role === 'instructor' && (
                  <div className="flex space-x-2">
                    {exam.instructor._id === currentUser._id && exam.status === 'upcoming' && (
                      <button
                        onClick={() => handleDeleteExam(exam._id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md"
                      >
                        Delete Exam
                      </button>
                    )}
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
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showExamForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowExamForm(false)} />

            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Create New Exam
                    </h3>
                    <form onSubmit={handleCreateExam} className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Exam Name
                        </label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          value={newExam.examName}
                          onChange={(e) => setNewExam({ ...newExam, examName: e.target.value })}
                          placeholder="e.g., Summer Belt Promotion, Winter Grading..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Exam Date and Time
                        </label>
                        <input
                          type="datetime-local"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          value={newExam.examDate}
                          onChange={(e) => setNewExam({ ...newExam, examDate: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Maximum Registrants
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          value={newExam.maxRegistrants}
                          onChange={(e) => setNewExam({ ...newExam, maxRegistrants: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Target Belt
                        </label>
                        <select
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          value={newExam.targetBelt}
                          onChange={(e) => setNewExam({ ...newExam, targetBelt: e.target.value })}
                        >
                          <option value="yellow">Yellow Belt</option>
                          <option value="orange">Orange Belt</option>
                          <option value="green">Green Belt</option>
                          <option value="blue">Blue Belt</option>
                          <option value="brown">Brown Belt</option>
                          <option value="black">Black Belt</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Minimum Belt Required
                        </label>
                        <select
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          value={newExam.eligibilityRequirements.minimumBelt}
                          onChange={(e) => setNewExam({
                            ...newExam,
                            eligibilityRequirements: {
                              ...newExam.eligibilityRequirements,
                              minimumBelt: e.target.value
                            }
                          })}
                        >
                          <option value="white">White Belt</option>
                          <option value="yellow">Yellow Belt</option>
                          <option value="orange">Orange Belt</option>
                          <option value="green">Green Belt</option>
                          <option value="blue">Blue Belt</option>
                          <option value="brown">Brown Belt</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Minimum Training Months
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          value={newExam.eligibilityRequirements.minimumTrainingMonths}
                          onChange={(e) => setNewExam({
                            ...newExam,
                            eligibilityRequirements: {
                              ...newExam.eligibilityRequirements,
                              minimumTrainingMonths: e.target.value
                            }
                          })}
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Create Exam
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowExamForm(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 