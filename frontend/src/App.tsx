import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            StudyBuddy Ultra
          </h1>
          <p className="text-gray-600 mb-8">
            Your comprehensive study companion is ready!
          </p>
          <div className="space-y-4">
            <div className="btn btn-primary">
              Get Started
            </div>
            <div className="text-sm text-gray-500">
              Frontend is working with Tailwind CSS!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
