import React, {useState} from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { UserCircle } from "lucide-react";

export function RegisterReq() {

    const [form, setForm] = useState({
    parent_name: "",
    email: "",
    phone_number: "",
    address: "",
    student_index: "",
    student_name: "",
    student_grade: ""
  });

  const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/register-requests/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to submit request");
      }

      alert("Registration request submitted successfully!");

      // reset form
      setForm({
        parent_name: "",
        email: "",
        phone_number: "",
        address: "",
        student_index: "",
        student_name: "",
        student_grade: ""
      });

    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-purple-300 to-indigo-200 flex items-center justify-center px-4">

      <div className="glass max-w-xl w-full p-8 rounded-xl shadow-lg mt-12 mb-8">

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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-7">

          <Input
            name="parent_name"
            value={form.parent_name}
            onChange={handleChange}
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            className="h-10"
            required
          />

          <Input
            name="email"
            value={form.email}
            onChange={handleChange}
            label="Email Address"
            type="email"
            placeholder="name@email.com"
            className="h-12"
            required
          />

          <Input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            label="Phone Number"
            type="tel"
            placeholder="07XXXXXXXX"
            className="h-12"
            required
          />

          <Input
            name="address"
            value={form.address}
            onChange={handleChange}
            label="Home Address"
            type="text"
            placeholder="Enter your address"
            className="h-12"
            required
          />

          <Input
            name="student_index"
            value={form.student_index}
            onChange={handleChange}
            label="Student Index"
            type="text"
            placeholder="Enter your Student Index"
            className="h-12"
          />

          <Input
            name="student_name"
            value={form.student_name}
            onChange={handleChange}
            label="Student Name"
            type="text"
            placeholder="Enter your child's name"
            className="h-12"
            required
          />

          <Input
            name="student_grade"
            value={form.student_grade}
            onChange={handleChange}
            label="Student Grade"
            type="text"
            placeholder="Enter your child's grade"
            className="h-12"
            required
          />

          <div className="md:col-span-2">
            <Button type="submit" className="w-full" size="md" disabled={loading}>
              {loading ? "Submitting..." : "Submit Registration Request"}
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