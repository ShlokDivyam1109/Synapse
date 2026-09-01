import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

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

        {/* Right Side - Login Form */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md p-8 shadow-2xl border-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to access your campus dashboard</p>
            </div>

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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">Demo credentials</p>
                <p>email: mock@email.com</p>
                <p>password: mock</p>
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
