import React, { useState, useEffect } from 'react';
import { authenticatedFetch, logout } from '../utils/auth';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authenticatedFetch('/api/user/');
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to load profile.');
        }
      } catch (err) {
        setError('Network error. Please try again later.');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  return (
    <>
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        ></div>
      </div>
      
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900">
            Your Profile
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-white bg-red-500 rounded-md mb-4">
              {error}
            </div>
          ) : userData ? (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="h-24 w-24 rounded-full bg-indigo-100 mx-auto flex items-center justify-center mb-4">
                    <span className="text-3xl font-medium text-indigo-600">
                      {userData.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">{userData.username}</h3>
                  <p className="text-gray-500">{userData.email}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Username</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{userData.username}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{userData.email}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">User ID</dt>
                      <dd className="text-sm text-gray-900 col-span-2">#{userData.id}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex justify-between">
                  <Link
                    to="/todos"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Go to Todo List
                  </Link>
                  <button
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      logout();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No profile data available.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;