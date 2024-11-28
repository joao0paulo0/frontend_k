import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [paymentsRes, examsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/payments/student/${currentUser._id}`, { headers }),
          axios.get(`http://localhost:5000/api/exams/registered/${currentUser._id}`, { headers })
        ]);

        setPayments(paymentsRes.data);
        setUpcomingExams(examsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser._id]);

  const handlePayment = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/payments/${paymentId}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh payments
      const paymentsRes = await axios.get(
        `http://localhost:5000/api/payments/student/${currentUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {currentUser.fullName}</h1>
        
        {/* Profile Section */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Belt Level: {currentUser.beltLevel}</p>
              <p className="text-gray-600">Membership Plan: {currentUser.membershipPlan}</p>
            </div>
            <div>
              <p className="text-gray-600">Email: {currentUser.email}</p>
              <p className="text-gray-600">Age: {currentUser.age}</p>
            </div>
          </div>
        </div>

        {/* Payments Section */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => handlePayment(payment._id)}
                          className="text-primary hover:text-primary-dark"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Exams Section */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Exams</h2>
          <div className="grid gap-4">
            {upcomingExams.map((exam) => (
              <div key={exam._id} className="border rounded-lg p-4">
                <p className="font-medium">Target Belt: {exam.targetBelt}</p>
                <p className="text-gray-600">Date: {new Date(exam.examDate).toLocaleDateString()}</p>
                <p className="text-gray-600">
                  Spots Available: {exam.maxRegistrants - exam.currentRegistrants.length}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 