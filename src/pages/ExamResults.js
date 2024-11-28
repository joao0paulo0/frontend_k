import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function ExamResults() {
  const { currentUser } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamResults();
  }, []);

  const fetchExamResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/exams/student/${currentUser._id}/results`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exam results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>

      <div className="mt-6 space-y-6">
        {exams.map((exam) => {
          const studentResult = exam.results.find(
            r => r.student.toString() === currentUser._id
          );

          return (
            <div key={exam._id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{exam.examName}</h2>
                  <p className="text-gray-600">Date: {new Date(exam.examDate).toLocaleDateString()}</p>
                  <p className="text-gray-600">Target Belt: {exam.targetBelt}</p>
                  <p className="text-gray-600">Instructor: {exam.instructor.fullName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  studentResult?.passed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {studentResult?.passed ? 'Passed' : 'Did not pass'}
                </span>
              </div>

              {studentResult?.notes && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Instructor Notes:</h3>
                  <p className="mt-1 text-gray-600">{studentResult.notes}</p>
                </div>
              )}

              {studentResult?.passed && (
                <div className="mt-4 bg-green-50 p-4 rounded-md">
                  <p className="text-green-800">
                    Congratulations! You have been promoted to {exam.targetBelt} belt!
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {exams.length === 0 && (
          <div className="text-center text-gray-500">
            No exam results available yet.
          </div>
        )}
      </div>
    </div>
  );
} 