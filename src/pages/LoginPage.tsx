import { useNavigate } from 'react-router-dom';
import { APP_NAME } from '../config/constants';

export function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center text-gray-900">{APP_NAME}</h2>
        <p className="text-center text-gray-600">Sign in to manage your devices</p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
