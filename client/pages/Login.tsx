import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Lock, Mail, User, ArrowRight, Sparkles } from "lucide-react";

interface Institute {
  _id: string;
  name: string;
  domain: string;
  city?: string;
}

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup state
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [institutesError, setInstitutesError] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    if (mode !== "signup" || institutes.length > 0) return;
    fetch("/api/institutes")
      .then((r) => r.json())
      .then((data) => setInstitutes(data.institutes || []))
      .catch(() => setInstitutesError("Could not load institutes. Please try again."));
  }, [mode]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!instituteId) {
      setError("Please select your institute");
      return;
    }
    setLoading(true);
    const result = await signup({
      name,
      email: signupEmail,
      password: signupPassword,
      instituteId,
      studentId: studentId || undefined,
      department: department || undefined,
      year: year || undefined,
    });
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Welcome Message */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Synapse
              </h1>
            </div>

            <h2 className="text-5xl font-bold text-gray-900 leading-tight">
              Your Campus,
              <span className="block text-blue-600">Reimagined.</span>
            </h2>

            <p className="text-xl text-gray-600 leading-relaxed">
              Welcome to <span className="font-semibold text-blue-600">Synapse</span> —
              the intelligent campus ecosystem where academics, administration, and student life converge seamlessly.
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>One-stop solution for campus management</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>Real-time academic tracking & analytics</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>Integrated healthcare & hostel systems</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>Smart communication & task management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md p-8 shadow-2xl border-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === "login" ? "Welcome Back" : "Create Your Account"}
              </h2>
              <p className="text-gray-600 mt-2">
                {mode === "login"
                  ? "Sign in to access your campus dashboard"
                  : "Sign up with your institute to get started"}
              </p>
            </div>

            <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === "login" ? "bg-white shadow text-blue-600" : "text-gray-500"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === "signup" ? "bg-white shadow text-blue-600" : "text-gray-500"
                }`}
              >
                Sign Up
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@institute.ac.in"
                        className="pl-10 py-6 text-base"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pl-10 py-6 text-base"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? "Signing in..." : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="pl-10 py-5 text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-email" className="text-gray-700 font-medium">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@institute.ac.in"
                      className="pl-10 py-5 text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="pl-10 py-5 text-base"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Institute</Label>
                  <Select value={instituteId} onValueChange={setInstituteId}>
                    <SelectTrigger className="mt-1 py-5">
                      <SelectValue placeholder="Select your institute" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutes.map((inst) => (
                        <SelectItem key={inst._id} value={inst._id}>
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {institutesError && (
                    <p className="text-xs text-red-600 mt-1">{institutesError}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="studentId" className="text-gray-700 font-medium">Student ID</Label>
                    <Input
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Optional"
                      className="mt-1 py-5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year" className="text-gray-700 font-medium">Year</Label>
                    <Input
                      id="year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="Optional"
                      className="mt-1 py-5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="department" className="text-gray-700 font-medium">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Optional"
                    className="mt-1 py-5"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? "Creating account..." : (
                    <>
                      Sign Up
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-600">
                Having trouble signing in?{" "}
                <button className="text-blue-600 font-medium hover:text-blue-700">
                  Contact Admin
                </button>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
