import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import HCaptchaComponent from '../../components/HCaptcha';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [showTroubleshootingTips, setShowTroubleshootingTips] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Email validation
  const emailValidation = useMemo(() => {
    if (!email) return { isValid: true, message: '' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    return {
      isValid,
      message: isValid ? '' : 'Please enter a valid email address'
    };
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Client-side validation
    if (!emailValidation.isValid) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (!captchaToken) {
      setError('Please complete the captcha verification');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password, captchaToken);
      navigate('/dashboard');
    } catch (err: any) {
      // Reset captcha on error
      setCaptchaToken('');

      // Provide more helpful error messages
      const errorMessage = err.message || 'Invalid email or password';
      if (errorMessage.includes('password') || errorMessage.includes('credentials') || errorMessage.includes('Invalid')) {
        setError('Invalid email or password. Please check your credentials and try again.');
        setShowTroubleshootingTips(true);
      } else if (errorMessage.includes('account') || errorMessage.includes('active')) {
        setError('Your account may be inactive. Please contact support.');
      } else if (errorMessage.includes('captcha')) {
        setError('Captcha verification failed. Please try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500 underline"
            >
              Create one now
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-secondary-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`form-input ${emailTouched && !emailValidation.isValid
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : ''
                  }`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
              />
              {emailTouched && !emailValidation.isValid && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <span className="mr-1">⚠</span>
                  {emailValidation.message}
                </p>
              )}
              {emailTouched && emailValidation.isValid && email && (
                <p className="mt-1 text-xs text-green-600 flex items-center">
                  <span className="mr-1">✓</span>
                  Valid email format
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="form-input pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-secondary-600 hover:text-secondary-900"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <span className="text-xs">Hide</span>
                  ) : (
                    <span className="text-xs">Show</span>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-secondary-500">
                Password must be at least 8 characters long
              </p>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500 underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-600">⚠</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Troubleshooting Tips */}
          {showTroubleshootingTips && (
            <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
              <button
                type="button"
                className="w-full flex items-center justify-between text-left"
                onClick={() => setShowTroubleshootingTips(!showTroubleshootingTips)}
              >
                <h4 className="text-sm font-medium text-blue-900">
                  Having trouble logging in?
                </h4>
                <span className="text-blue-600 text-xs">
                  {showTroubleshootingTips ? '−' : '+'}
                </span>
              </button>
              <div className="mt-3 text-xs text-blue-800 space-y-2">
                <p className="font-medium">Common solutions:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Make sure your email address is spelled correctly</li>
                  <li>Check that Caps Lock is not turned on</li>
                  <li>Ensure your password is at least 8 characters</li>
                  <li>Try using the "Forgot password" link to reset your password</li>
                  <li>If you just registered, check your email for verification</li>
                </ul>
              </div>
            </div>
          )}

          {/* hCaptcha */}
          <HCaptchaComponent
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken('')}
            onError={() => setCaptchaToken('')}
          />

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || (emailTouched && !emailValidation.isValid) || !captchaToken}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Additional Help */}
          <div className="text-center">
            <p className="text-xs text-secondary-500">
              Need help?{' '}
              <a href="mailto:support@example.com" className="text-primary-600 hover:text-primary-500 underline">
                Contact Support
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;