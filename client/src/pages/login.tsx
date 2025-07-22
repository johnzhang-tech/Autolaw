import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import lawImagePath from "@assets/ChatGPT Image Jul 21, 2025, 07_35_10 PM_1753151956635.png";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Real-time validation
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear errors and validate
    if (field === 'email') {
      if (value === '') {
        setErrors(prev => ({ ...prev, email: 'Email is required' }));
      } else if (!validateEmail(value as string)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }

    if (field === 'password') {
      if (value === '') {
        setErrors(prev => ({ ...prev, password: 'Password is required' }));
      } else {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    }
  };

  // Form validation
  const isFormValid = () => {
    return (
      formData.email !== '' &&
      formData.password !== '' &&
      validateEmail(formData.email) &&
      errors.email === '' &&
      errors.password === ''
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store JWT token if provided
        if (data.token) {
          localStorage.setItem('docuai_token', data.token);
          localStorage.removeItem('docuai_logged_out');
        }

        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });

        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Law Theme with Provided Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden items-center justify-center">
        {/* Law Image */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
          <img 
            src={lawImagePath}
            alt="Scales of Justice and Law Books"
            className="w-full max-w-lg h-auto object-contain"
            onError={(e) => {
              // Fallback to a beautiful SVG if image fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector('.fallback-svg')) {
                parent.innerHTML = `
                  <svg class="fallback-svg w-full max-w-lg h-auto" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(200, 100)">
                      <ellipse cx="0" cy="120" rx="40" ry="12" fill="#4F46E5" opacity="0.8" />
                      <rect x="-3" y="-60" width="6" height="180" fill="#6366F1" />
                      <circle cx="0" cy="-60" r="8" fill="#818CF8" />
                      <rect x="-80" y="-40" width="160" height="4" fill="#6366F1" />
                      <g transform="translate(-60, -35)">
                        <path d="M -25 0 L 25 0 L 20 -15 L -20 -15 Z" fill="#8B5CF6" opacity="0.9" />
                        <path d="M -20 -15 Q 0 -25 20 -15" stroke="#A78BFA" stroke-width="2" fill="none" />
                        <line x1="-25" y1="0" x2="-25" y2="-30" stroke="#6366F1" stroke-width="2" />
                        <line x1="25" y1="0" x2="25" y2="-30" stroke="#6366F1" stroke-width="2" />
                        <line x1="0" y1="-30" x2="0" y2="-40" stroke="#6366F1" stroke-width="2" />
                      </g>
                      <g transform="translate(60, -35)">
                        <path d="M -25 0 L 25 0 L 20 -15 L -20 -15 Z" fill="#8B5CF6" opacity="0.9" />
                        <path d="M -20 -15 Q 0 -25 20 -15" stroke="#A78BFA" stroke-width="2" fill="none" />
                        <line x1="-25" y1="0" x2="-25" y2="-30" stroke="#6366F1" stroke-width="2" />
                        <line x1="25" y1="0" x2="25" y2="-30" stroke="#6366F1" stroke-width="2" />
                        <line x1="0" y1="-30" x2="0" y2="-40" stroke="#6366F1" stroke-width="2" />
                      </g>
                    </g>
                    <g transform="translate(200, 280)">
                      <rect x="-60" y="0" width="120" height="20" rx="2" fill="#1E40AF" />
                      <rect x="-55" y="5" width="110" height="10" fill="#3B82F6" />
                      <text x="0" y="13" text-anchor="middle" fill="white" font-size="10" font-weight="bold">LAW</text>
                      <rect x="-50" y="-25" width="100" height="18" rx="2" fill="#7C3AED" />
                      <rect x="-45" y="-20" width="90" height="8" fill="#8B5CF6" />
                      <rect x="-45" y="-45" width="90" height="16" rx="2" fill="#1D4ED8" />
                      <rect x="-40" y="-40" width="80" height="6" fill="#3B82F6" />
                    </g>
                  </svg>
                `;
              }
            }}
          />
        </div>
        
        {/* Brand text overlay */}
        <div className="absolute bottom-12 left-12 text-white">
          <h1 className="text-3xl font-bold mb-2">Altosera</h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-sm">
            Professional Legal Document Management & Analysis Platform
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your real estate document platform
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`transition-all duration-200 ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 hover:border-gray-400'
                }`}
                placeholder="Enter your email"
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pr-10 transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 hover:border-gray-400'
                  }`}
                  placeholder="Enter your password"
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    handleInputChange('rememberMe', checked as boolean)
                  }
                />
                <Label htmlFor="remember-me" className="text-sm text-gray-700 cursor-pointer">
                  Remember me
                </Label>
              </div>

              <button
                type="button"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => toast({
                  title: "Password Reset",
                  description: "Password reset functionality will be available soon.",
                })}
              >
                Forgot Password
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition-all duration-200 py-3 text-white font-medium rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Log In'
              )}
            </Button>
          </form>

          {/* Social Login Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">— or login with —</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
              disabled={isLoading}
              title="Login with Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            
            <button
              type="button"
              className="w-12 h-12 bg-blue-400 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
              disabled={isLoading}
              title="Login with Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>

            <button
              type="button"
              className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
              disabled={isLoading}
              title="Login with Google"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}