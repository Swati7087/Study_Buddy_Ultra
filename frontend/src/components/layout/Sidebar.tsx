import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiHome, 
  FiUser, 
  FiBookOpen, 
  FiClock, 
  FiTrendingUp,
  FiTarget,
  FiAward,
  FiX
} from 'react-icons/fi';

const Sidebar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Study Room', href: '/study-room', icon: FiBookOpen },
    { name: 'Sessions', href: '/sessions', icon: FiClock },
    { name: 'Profile', href: '/profile', icon: FiUser },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${!isOpen ? 'sidebar-closed' : ''} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1 rounded-lg hover:bg-gray-100"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Stats */}
          {user && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiTarget className="w-4 h-4 text-primary-500" />
                    <span className="text-xs text-gray-600">Total Sessions</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {user.totalSessions}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 text-secondary-500" />
                    <span className="text-xs text-gray-600">Study Time</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.floor(user.totalStudyTime / 60)}h {user.totalStudyTime % 60}m
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiTrendingUp className="w-4 h-4 text-success-500" />
                    <span className="text-xs text-gray-600">Avg Focus</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {user.averageFocusScore}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Achievements Preview */}
          {user && user.totalSessions > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Achievement</h3>
              <div className="flex items-center space-x-2">
                <FiAward className="w-4 h-4 text-warning-500" />
                <span className="text-xs text-gray-600">
                  {user.totalSessions >= 5 ? 'Consistent Learner' : 'Getting Started'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar; 