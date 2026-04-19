import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { UserRole } from "../../types";
import {
  Bus,
  ShieldCheck,
  UserCircle,
  TramFront,
} from "lucide-react";

export function LoginPage() {
  const { login, isLoading } = useAuth();

  const [username, setUsername] = useState("parent@test.com");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState<UserRole>("parent");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);

    // Demo autofill
    if (newRole === "parent") setUsername("parent@test.com");
    if (newRole === "driver") setUsername("driver@test.com");
    if (newRole === "admin") setUsername("admin@test.com");
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-400 via-white to-purple-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg -rotate-6">
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

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 sm:px-10 rounded-xl shadow-lg bg-white">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => handleRoleChange("parent")}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-md text-sm font-medium transition-all ${
                role === "parent"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <UserCircle className="h-5 w-5 mb-1" />
              Parent
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange("driver")}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-md text-sm font-medium transition-all ${
                role === "driver"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <TramFront className="h-5 w-5 mb-1" />
              Driver
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange("admin")}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-md text-sm font-medium transition-all ${
                role === "admin"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ShieldCheck className="h-5 w-5 mb-1" />
              Admin
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="name@example.com"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Sign in as{" "}
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          </form>

          {/* Register */}
          <div className="mt-6 text-center">
            <p>
              Don't have an account?{" "}
              <a
                href="/registerReq"
                className="text-purple-700 hover:underline"
              >
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}