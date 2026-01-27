import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { UserRole } from '../../types';
import { Bus, ShieldCheck, UserCircle,TramFront } from 'lucide-react';
export function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('parent@test.com');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<UserRole>('parent');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, role);
  };
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    // Auto-fill email for demo convenience
    if (newRole === 'parent') setEmail('parent@test.com');
    if (newRole === 'driver') setEmail('driver@test.com');
    if (newRole === 'admin') setEmail('admin@test.com');
  };
  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-400 via-white-400 via-white-100 to-white-800 white-200 via-purple-400 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <Bus className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          RideSafe Tracker
        </h2>
        <p className="mt-2 text-center text-md text-gray-500">
          Ensuring Safe Journeys for Every Child
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 sm:px-10">
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => handleRoleChange('parent')}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-md text-sm font-medium transition-all ${role === 'parent' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>

              <UserCircle className="h-5 w-5 mb-1" />
              Parent
            </button>
            <button
              onClick={() => handleRoleChange('driver')}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-md text-sm font-medium transition-all ${role === 'driver' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>

              <TramFront className="h-5 w-5 mb-1" />
              Driver
            </button>
            <button
              onClick={() => handleRoleChange('admin')}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-md text-sm font-medium transition-all ${role === 'admin' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>

              <ShieldCheck className="h-5 w-5 mb-1" />
              Admin
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com" />


            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••" />


            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />

                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900">

                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:text-primary-500">

                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}>

              Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
             <p>Don't have an account? <a href='/registerReq' className='text-purple-700 hover:underline'>Register</a></p>
              
            </div>
          </div>
        </div>
      </div>
    </div>);

}
