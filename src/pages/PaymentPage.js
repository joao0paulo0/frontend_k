import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentPage() {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [newPlan, setNewPlan] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [paymentError, setPaymentError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/payments/student/${currentUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCardData = () => {
    if (paymentMethod === 'card') {
      if (cardData.number.length !== 16) {
        setPaymentError('Card number must be 16 digits');
        return false;
      }
      if (cardData.name.trim() === '') {
        setPaymentError('Cardholder name is required');
        return false;
      }
      if (!cardData.expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
        setPaymentError('Invalid expiry date (MM/YY)');
        return false;
      }
      if (cardData.cvv.length !== 3) {
        setPaymentError('CVV must be 3 digits');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async (paymentId) => {
    try {
      setPaymentError('');
      setProcessing(true);

      if (!validateCardData()) {
        setProcessing(false);
        return;
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/payments/${paymentId}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Show success message
      alert('Payment processed successfully!');
      
      fetchPayments();
      setShowPaymentModal(false);
      setCardData({ number: '', name: '', expiry: '', cvv: '' });
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentError('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePlanChangeRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/users/plan-change-request',
        { newPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowPlanChangeModal(false);
      alert('Plan change request sent to instructor');
    } catch (error) {
      console.error('Error requesting plan change:', error);
      alert('Failed to send plan change request');
    }
  };

  const handlePayNowClick = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
    // Reset payment form data
    setPaymentMethod('card');
    setCardData({
      number: '',
      name: '',
      expiry: '',
      cvv: ''
    });
    setPaymentError('');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900">Payments</h1>

      {/* Current Plan */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">
              Plan: {currentUser.membershipPlan.replace('classes', ' Classes/Week')}
            </p>
            <p className="text-gray-600">
              Monthly Fee: $
              {currentUser.membershipPlan === '2classes'
                ? '14.99'
                : currentUser.membershipPlan === '3classes'
                ? '22.99'
                : '29.99'}
            </p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
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
                        onClick={() => handlePayNowClick(payment)}
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

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowPaymentModal(false)} />

            {/* Modal panel */}
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Payment Details
                    </h3>
                    <div className="mt-4">
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <p className="text-lg font-medium text-gray-900">
                          Amount to pay: ${selectedPayment.amount}
                        </p>
                        <p className="text-sm text-gray-500">
                          Due date: {new Date(selectedPayment.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      {paymentError && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                          {paymentError}
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            maxLength="16"
                            placeholder="1234 5678 9012 3456"
                            className="input-field"
                            value={cardData.number}
                            onChange={(e) => setCardData({ 
                              ...cardData, 
                              number: e.target.value.replace(/\D/g, '') 
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            className="input-field"
                            value={cardData.name}
                            onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength="5"
                              className="input-field"
                              value={cardData.expiry}
                              onChange={(e) => {
                                let value = e.target.value;
                                if (value.length === 2 && !value.includes('/')) {
                                  value += '/';
                                }
                                setCardData({ ...cardData, expiry: value });
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="text"
                              maxLength="3"
                              placeholder="123"
                              className="input-field"
                              value={cardData.cvv}
                              onChange={(e) => setCardData({ 
                                ...cardData, 
                                cvv: e.target.value.replace(/\D/g, '') 
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handlePayment(selectedPayment._id)}
                  disabled={processing}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {processing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Pay Now'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPayment(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowPlanChangeModal(true)}
          className="text-primary hover:text-primary-dark"
        >
          Request Plan Change
        </button>
      </div>

      {showPlanChangeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Request Plan Change</h3>
            <select
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            >
              <option value="">Select new plan</option>
              {['2classes', '3classes', '4classes']
                .filter(plan => plan !== currentUser.membershipPlan)
                .map(plan => (
                  <option key={plan} value={plan}>
                    {plan === '2classes' ? '2 Classes/Week - $14.99' :
                     plan === '3classes' ? '3 Classes/Week - $22.99' :
                     '4 Classes/Week - $29.99'}
                  </option>
                ))}
            </select>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPlanChangeModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handlePlanChangeRequest}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 