import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiBookOpen, 
  FiClock, 
  FiTrendingUp, 
  FiTarget, 
  FiMusic, 
  FiMessageCircle,
  FiPlay,
  FiArrowRight
} from 'react-icons/fi';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: FiBookOpen,
      title: 'Smart Study Planning',
      description: 'Create and manage study schedules with intelligent recommendations based on your learning patterns.'
    },
    {
      icon: FiClock,
      title: 'Pomodoro Timer',
      description: 'Stay focused with customizable study sessions and automatic break reminders.'
    },
    {
      icon: FiTrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your learning progress with detailed analytics and focus score tracking.'
    },
    {
      icon: FiMusic,
      title: 'Lo-Fi Music Player',
      description: 'Enhance concentration with curated lo-fi music and ambient sounds.'
    },
    {
      icon: FiMessageCircle,
      title: 'AI Study Assistant',
      description: 'Get productivity tips and motivation from our AI-powered study companion.'
    },
    {
      icon: FiTarget,
      title: 'Focus Score Analytics',
      description: 'Track your focus levels and get insights to improve your study efficiency.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Ultimate
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Study Companion
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Transform your study sessions with AI-powered insights, focus tracking, and curated lo-fi music.
              Achieve your learning goals faster and more efficiently.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="btn btn-success text-lg px-8 py-3 flex items-center justify-center space-x-2"
                >
                  <FiPlay className="w-5 h-5" />
                  <span>Get Started Free</span>
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary-600"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/study-room"
                  className="btn btn-success text-lg px-8 py-3 flex items-center justify-center space-x-2"
                >
                  <FiBookOpen className="w-5 h-5" />
                  <span>Start Studying</span>
                </Link>
                <Link
                  to="/profile"
                  className="btn btn-outline text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary-600"
                >
                  View Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              StudyBuddy Ultra combines cutting-edge technology with proven study techniques
              to help you achieve your academic goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card p-6 hover:shadow-medium transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {isAuthenticated && user && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Study Progress
              </h2>
              <p className="text-xl text-gray-600">
                Keep track of your learning journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {user.totalSessions}
                </div>
                <div className="text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-600 mb-2">
                  {Math.floor(user.totalStudyTime / 60)}h {user.totalStudyTime % 60}m
                </div>
                <div className="text-gray-600">Study Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-success-600 mb-2">
                  {user.averageFocusScore}%
                </div>
                <div className="text-gray-600">Avg Focus Score</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Study Habits?
            </h2>
            <p className="text-xl mb-8 text-gray-100">
              Join thousands of students who have improved their focus and productivity
              with StudyBuddy Ultra.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn btn-success text-lg px-8 py-3 flex items-center justify-center space-x-2"
              >
                <span>Start Your Free Trial</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="btn btn-outline text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary-600"
              >
                Already have an account?
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">StudyBuddy Ultra</h3>
              <p className="text-gray-400">
                Your comprehensive study companion for enhanced learning and productivity.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Study Timer</li>
                <li>Focus Tracking</li>
                <li>Lo-Fi Music</li>
                <li>AI Assistant</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>GitHub</li>
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>Discord</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StudyBuddy Ultra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 