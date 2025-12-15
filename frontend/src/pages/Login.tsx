import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const Login: React.FC = () => {
    const { signInWithGoogle, signInWithEmail, user, loading } = useAuth();
    const [email, setEmail] = React.useState('');
    const [isEmailSent, setIsEmailSent] = React.useState(false);
    const [error, setError] = React.useState('');

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmail(email);
            setIsEmailSent(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send magic link');
        }
    };

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Recruiter Login
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sign in to manage jobs and view applications
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center">
                            {error}
                        </div>
                    )}

                    {isEmailSent ? (
                        <div className="bg-green-50 text-green-700 p-4 rounded text-center">
                            <h3 className="font-bold">Check your email!</h3>
                            <p className="text-sm mt-1">We sent a magic link to {email}</p>
                            <Button
                                variant="link"
                                onClick={() => setIsEmailSent(false)}
                                className="mt-2 text-green-700 underline"
                            >
                                Try another email
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-8 space-y-6">
                            <Button
                                onClick={signInWithGoogle}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-2 bg-white rounded-full p-0.5" alt="Google" />
                                Sign in with Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
                                </div>
                            </div>

                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="sr-only">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Send Magic Link
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Login;
