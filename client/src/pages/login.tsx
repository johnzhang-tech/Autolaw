import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import lawImagePath from "@assets/ChatGPT Image Jul 21, 2025, 07_35_10 PM_1753151956635.png";
import altoseraBrandPath from "@assets/Altosera_Two_Toned_Logo (1)_1753153209175.png";

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
      {/* Left Panel - Law Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center">
        <div className="w-full h-full flex items-center justify-center p-12">
          <img 
            src={lawImagePath}
            alt="Scales of Justice and Law Books"
            className="w-full max-w-lg h-auto object-contain"
          />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Altosera Brand Logo */}
          <div className="text-center">
            <img 
              src={altoseraBrandPath}
              alt="Altosera"
              className="h-8 mx-auto mb-6"
            />
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
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
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
        </div>
      </div>
    </div>
  );
}