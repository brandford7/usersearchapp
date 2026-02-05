// src/pages/TemporaryLogin.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Clock, User } from 'lucide-react';

export default function TemporaryLogin() {
  const [searchParams] = useSearchParams();
  const { username } = useParams(); // Extract username from URL
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('No token provided');
      setLoading(false);
      return;
    }

    const login = async () => {
      try {
        await loginWithToken(token);
        navigate('/search');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired token');
      } finally {
        setLoading(false);
      }
    };

    login();
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg text-center">
          {loading ? (
            <>
              <Clock className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
              <h1 className="text-xl font-bold text-white mb-2">Verifying Access</h1>
              {username && (
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{decodeURIComponent(username)}</span>
                </div>
              )}
              <p className="text-gray-400">Please wait...</p>
            </>
          ) : error ? (
            <>
              <h1 className="text-xl font-bold text-red-400 mb-2">Access Denied</h1>
              <p className="text-gray-400 mb-4">{error}</p>
              
              <a  href="/login"
                className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Go to Login
              </a>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}