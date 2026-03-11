import React from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { UserCircle } from "lucide-react";

export function RegisterReq() {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Parent registration request submitted!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-purple-300 to-indigo-200 flex items-center justify-center px-4">

      <div className="glass max-w-md w-full p-8 rounded-xl shadow-lg mt-12 mb-8">

        {/* Icon */}
        <div className="flex justify-center mb-3">
          <div className="bg-purple-600 p-3 rounded-xl shadow-md">
            <UserCircle className="text-white h-8 w-8" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Parent Registration
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Submit a request to register your child for RideSafe
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">


          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            className="h-10"
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="name@email.com"
            className="h-10"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="07XXXXXXXX"
            className="h-10"
            required
          />

          <Input
            label="Home Address"
            type="text"
            placeholder="Enter your address"
            className="h-10"
            required
          />

          <Input
            label="Student Index"
            type="text"
            placeholder="Enter your Student Index No"
            className="h-10"
          />

          <Input
            label="Student Name"
            type="text"
            placeholder="Enter your child's name"
            className="h-10"
            required
          />

          <Input
            label="Student Grade"
            type="text"
            placeholder="Enter your child's name"
            className="h-10"
            required
          />

          <div className="md:col-span-2">
            <Button type="submit" className="w-full" size="lg">
              Submit Registration Request
            </Button>
          </div>

        </form>

        <div className="text-center mt-5 text-sm">
          Already registered?{" "}
          <a
            href="/"
            className="text-purple-700 font-medium hover:underline"
          >
            Back to Login
          </a>
        </div>

      </div>
    </div>
  );
}