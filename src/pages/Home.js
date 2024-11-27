import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Home() {
  const { currentUser } = useAuth();
  const [activePlan, setActivePlan] = useState(null);

  const beltLevels = [
    { name: 'White Belt', description: 'Beginning of the journey', color: 'bg-white' },
    { name: 'Yellow Belt', description: '3 months minimum training', color: 'bg-yellow-300' },
    { name: 'Orange Belt', description: '6 months minimum training', color: 'bg-orange-400' },
    { name: 'Green Belt', description: '9 months minimum training', color: 'bg-green-500' },
    { name: 'Blue Belt', description: '12 months minimum training', color: 'bg-blue-500' },
    { name: 'Brown Belt', description: '18 months minimum training', color: 'bg-amber-700' },
    { name: 'Black Belt', description: '24 months minimum training', color: 'bg-black' }
  ];

  const plans = [
    {
      name: 'Basic',
      classes: 2,
      price: 14.99,
      description: 'Start your karate journey with the essentials. The Base Plan is perfect for beginners looking to learn the fundamentals, build discipline, and gain confidence.'
    },
    {
      name: 'Standard',
      classes: 3,
      price: 22.99,
      description: 'Take your karate practice to the next level! The Standard Plan combines technical and physical training for students committed to progressing and tackling new challenges.'
    },
    {
      name: 'Premium',
      classes: 4,
      price: 29.99,
      description: 'Master the art of karate with the Premium Plan. Enjoy personalized training, access to advanced classes, and exclusive support for those striving for excellence in their karate journey.'
    }
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-primary">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Welcome to Karate School
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-100">
              Join our dojo and start your martial arts journey today. Learn discipline, respect, and self-defense from expert instructors.
            </p>
            {!currentUser && (
              <div className="mt-10 flex justify-center gap-4">
                <Link
                  to="/register"
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-dark md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Membership Plans */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Membership Plans
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                activePlan === index ? 'scale-105' : 'scale-100'
              }`}
              onMouseEnter={() => setActivePlan(index)}
              onMouseLeave={() => setActivePlan(null)}
            >
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-gray-900 text-center">{plan.name}</h3>
                <p className="mt-4 text-center text-gray-600">{plan.classes} Classes per Week</p>
                <p className="mt-4 text-center">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </p>
              </div>
              {activePlan === index && (
                <div className="px-6 py-4 bg-gray-100">
                  <p className="text-gray-700 text-center">{plan.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Belt Levels */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Belt Progression
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beltLevels.map((belt) => (
              <div key={belt.name} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className={`w-full h-4 ${belt.color} rounded mb-4`}></div>
                  <h3 className="text-lg font-medium text-gray-900">{belt.name}</h3>
                  <p className="mt-2 text-gray-600">{belt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Contact Us</h2>
            <p className="mt-4 text-lg text-gray-600">
              Have questions? Get in touch with us.
            </p>
            <div className="mt-8">
              <p className="text-gray-600">Email: contact@karateschool.com</p>
              <p className="text-gray-600">Phone: (555) 123-4567</p>
              <p className="text-gray-600">Address: 123 Dojo Street, Martial Arts City</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}