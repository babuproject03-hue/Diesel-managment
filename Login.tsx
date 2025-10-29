import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FuelIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAppContext();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would have authentication logic here.
        // For this demo, we'll just log in and navigate to the dashboard.
        login();
        navigate('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center bg-diesel-blue/10 text-diesel-blue p-4 rounded-full mb-4">
                        <FuelIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-diesel-blue font-poppins">Diesel Mgmt Login</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Sign in to access your dashboard
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Email or Phone
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="text"
                            autoComplete="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-diesel-blue focus:border-diesel-blue sm:text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-diesel-blue focus:border-diesel-blue sm:text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-fuel-orange border-slate-300 rounded focus:ring-fuel-orange" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-diesel-blue hover:text-fuel-orange">
                                Forgot your password?
                            </a>
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-fuel-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
