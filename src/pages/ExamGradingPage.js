import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function ExamGradingPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/exams/${examId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExam(response.data);
      // Initialize results array with all registrants
      setResults(response.data.currentRegistrants.map(student => ({
        student: student._id,
        passed: false,
        notes: ''
      })));
    } catch (error) {
      console.error('Error fetching exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultChange = (studentId, field, value) => {
    setResults(prevResults => 
      prevResults.map(result => 
        result.student === studentId 
          ? { ...result, [field]: value }
          : result
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/exams/${examId}/results`,
        { results },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Exam results submitted successfully');
      navigate('/instructor-dashboard');
    } catch (error) {
      console.error('Error submitting results:', error);
      alert('Failed to submit results');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!exam) return <div>Exam not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {exam.examName}
          </h2>
          <p className="mt-2 text-gray-600">
            Target Belt: {exam.targetBelt.charAt(0).toUpperCase() + exam.targetBelt.slice(1)}
          </p>
          <p className="text-gray-600">
            Date: {new Date(exam.examDate).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {exam.currentRegistrants.map((student) => (
            <div key={student._id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">{student.fullName}</h3>
                  <p className="text-sm text-gray-500">Current Belt: {student.beltLevel}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={results.find(r => r.student === student._id)?.passed || false}
                      onChange={(e) => handleResultChange(student._id, 'passed', e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Promote to {exam.targetBelt}</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={results.find(r => r.student === student._id)?.notes || ''}
                  onChange={(e) => handleResultChange(student._id, 'notes', e.target.value)}
                  className="w-full h-24 p-2 border rounded-md focus:ring-primary focus:border-primary"
                  placeholder="Add notes about the student's performance..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate('/instructor-dashboard')}
            className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Results'}
          </button>
        </div>
      </div>
    </div>
  );
} 