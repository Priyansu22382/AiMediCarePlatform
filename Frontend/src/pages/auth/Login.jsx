// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("/api/auth/login", { email, password });
//       const { role } = res.data;
//       if (role === "patient") navigate("/patient/dashboard");
//       else if (role === "caretaker") navigate("/caretaker/dashboard");
//     } catch (error) {
//       alert(error?.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#111] flex items-center justify-center text-white font-sans px-4">
//       <div className="bg-[#181818] p-8 rounded-2xl shadow-[10px_10px_20px_#0c0c0c,-10px_-10px_20px_#1c1c1c] w-full max-w-md">
//         <h2 className="text-3xl font-semibold text-center mb-6 tracking-widest">LOGIN</h2>
//         <form onSubmit={handleLogin} className="space-y-6">
//           <div>
//             <label className="text-gray-300 block mb-1">Username</label>
//             <input
//               type="email"
//               placeholder="example@test.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none focus:ring focus:ring-purple-500 transition"
//               required
//             />
//           </div>
//           <div>
//             <label className="text-gray-300 block mb-1">Password</label>
//             <input
//               type="password"
//               placeholder="•••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none focus:ring focus:ring-purple-500 transition"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full py-3 bg-[#1f1f1f] rounded-xl shadow hover:shadow-md hover:bg-[#222] transition text-blue-400 hover:text-blue-300"
//           >
//             Sign In
//           </button>
//         </form>
//         <p className="text-center text-gray-400 text-sm mt-4">
//           Forgot Password?{" "}
//           <span className="text-pink-500 cursor-pointer hover:underline">Click Here!</span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;


// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../services/api"; // uses baseURL: http://localhost:3000

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [animate, setAnimate] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     setTimeout(() => setAnimate(true), 100); // trigger animation on mount
//   }, []);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const res = await api.post("/api/auth/login", { email, password });
//       const { role } = res.data;
//       console.log("Login successful:", res.data);
//       console.log("User role:", role);
     
//       localStorage.setItem("role", role);
//       // Redirect based on role
//       if (role === "patient") navigate("/patient/dashboard");
//       else if (role === "caretaker") navigate("/caretaker/dashboard");
//     } catch (error) {
//       alert(error?.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#111] flex items-center justify-center px-4 text-white font-sans">
//       <div
//         className={`bg-[#181818] p-8 rounded-2xl w-full max-w-md transform transition duration-700 ease-in-out ${
//           animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
//         } shadow-[10px_10px_20px_#0c0c0c,-10px_-10px_20px_#1c1c1c] hover:shadow-[0_0_20px_#60a5fa,0_0_10px_#3b82f6]`}
//       >
//         <h2 className="text-3xl font-semibold text-center mb-6 tracking-widest">LOGIN</h2>

//         <form onSubmit={handleLogin} className="space-y-6">
//           <div>
//             <label className="text-gray-300 block mb-1">Email</label>
//             <input
//               type="email"
//               placeholder="example@test.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none focus:ring focus:ring-blue-500 transition"
//               required
//             />
//           </div>

//           <div>
//             <label className="text-gray-300 block mb-1">Password</label>
//             <input
//               type="password"
//               placeholder="•••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none focus:ring focus:ring-blue-500 transition"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full py-3 bg-[#1f1f1f] rounded-xl shadow hover:shadow-md hover:bg-[#222] transition text-blue-400 hover:text-blue-300"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? "Signing In..." : "Sign In"}
//           </button>
//         </form>

//         <p className="text-center text-gray-400 text-sm mt-4">
//           Forgot Password?{" "}
//           <span className="text-pink-500 cursor-pointer hover:underline">Click Here!</span>
//         </p>

//         <p className="text-center text-gray-400 text-sm mt-2">
//           Don't have an account?{" "}
//           <span
//             onClick={() => navigate("/register")}
//             className="text-green-400 cursor-pointer hover:underline"
//           >
//             Register here!
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [animate, setAnimate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { role } = res.data;
      console.log("Login successful:", res.data);
      console.log("User role:", role);
     
      localStorage.setItem("role", role);
      if (role === "patient") navigate("/patient/dashboard");
      else if (role === "caretaker") navigate("/caretaker/dashboard");
    } catch (error) {
      alert(error?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4 text-white font-sans relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div
        className={`relative bg-black/20 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md transform transition-all duration-1000 ease-out ${
          animate ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
        } border border-white/10 shadow-2xl hover:shadow-purple-500/25 hover:border-purple-500/30 transition-all duration-500`}
      >
        {/* Header with animated icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-wider">
            Welcome Back
          </h2>
          <p className="text-gray-400 mt-2 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">Email Address</label>
            <div className="relative group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 pl-12 bg-black/30 border border-gray-600/50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">Password</label>
            <div className="relative group">
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pl-12 bg-black/30 border border-gray-600/50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/50 hover:from-purple-500 hover:to-blue-500 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <p className="text-center text-gray-400 text-sm">
            Forgot your password?{" "}
            <span className="text-purple-400 cursor-pointer hover:text-purple-300 transition-colors duration-300 font-medium">
              Reset it here
            </span>
          </p>
          
          <div className="flex items-center justify-center">
            <div className="flex-1 h-px bg-gray-600/50"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-600/50"></div>
          </div>

          <p className="text-center text-gray-400 text-sm">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors duration-300 font-medium"
            >
              Create one now
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


