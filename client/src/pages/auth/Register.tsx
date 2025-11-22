import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import HCaptchaComponent from '../../components/HCaptcha';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    affiliation: '',
    role: 'author'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (!password) return { level: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { level: 2, label: 'Medium', color: 'bg-yellow-500' };
    return { level: 3, label: 'Strong', color: 'bg-green-500' };
  }, [formData.password]);

  // Password validation checks
  const passwordValidation = useMemo(() => {
    const password = formData.password;
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[^a-zA-Z0-9]/.test(password)
    };
  }, [formData.password]);

  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
  };

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
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
      await register({ ...formData, captchaToken });
      navigate('/dashboard');
    } catch (err: any) {
      // Reset captcha on error
      setCaptchaToken('');
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="form-input"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="affiliation" className="form-label">
                Affiliation
              </label>
              <input
                id="affiliation"
                name="affiliation"
                type="text"
                className="form-input"
                placeholder="University or Organization"
                value={formData.affiliation}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="form-label">
                Primary Role
              </label>
              <select
                id="role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="author">Author</option>
                <option value="reviewer">Reviewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                onBlur={handlePasswordBlur}
              />

              {/* Password Requirements */}
              <div className="mt-2 space-y-2">
                <div className="text-xs text-secondary-600">
                  <p className="font-medium mb-1">Password must contain:</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-secondary-500'}`}>
                      <span className="mr-2">{passwordValidation.minLength ? '✓' : '○'}</span>
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-secondary-400'}`}>
                      <span className="mr-2">{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                      One uppercase letter (recommended)
                    </li>
                    <li className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-secondary-400'}`}>
                      <span className="mr-2">{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                      One lowercase letter (recommended)
                    </li>
                    <li className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-secondary-400'}`}>
                      <span className="mr-2">{passwordValidation.hasNumber ? '✓' : '○'}</span>
                      One number (recommended)
                    </li>
                    <li className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-secondary-400'}`}>
                      <span className="mr-2">{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                      One special character (recommended)
                    </li>
                  </ul>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-secondary-600">Password Strength:</span>
                      <span className={`text-xs font-medium ${passwordStrength.level === 1 ? 'text-red-600' :
                        passwordStrength.level === 2 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.level / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleConfirmPasswordBlur}
              />

              {/* Password Match Indicator */}
              {confirmPasswordTouched && formData.confirmPassword && (
                <div className={`mt-1 text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordsMatch ? (
                    <span className="flex items-center">
                      <span className="mr-1">✓</span>
                      Passwords match
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="mr-1">✗</span>
                      Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* hCaptcha */}
          <HCaptchaComponent
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken('')}
            onError={() => setCaptchaToken('')}
          />

          <div>
            <button
              type="submit"
              disabled={isLoading || !captchaToken}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;