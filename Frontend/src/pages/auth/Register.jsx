// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const Register = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     contactNumber: "",
//     age: "",
//     role: "patient",
//   });

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     try {
//       const payload = {
//         ...formData,
//         age: formData.age ? Number(formData.age) : undefined, // optional
//       };

//       const res = await axios.post("http://localhost:3000/api/auth/register", payload, {
//         withCredentials: true,
//       });

//       setSuccess("Registered successfully! Redirecting to login...");
//       setTimeout(() => navigate("/login"), 2000);
//     } catch (err) {
//       setError(err.response?.data?.message || "Registration failed");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
//       <div className="relative group w-full max-w-md p-8 rounded-xl bg-[#1a1a1a] shadow-xl transition-all duration-300 hover:shadow-[0_0_20px_#00d4ff] hover:-translate-y-1">
//         <h2 className="text-2xl font-bold text-white text-center mb-6 tracking-wide">
//           Create an Account
//         </h2>

//         {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
//         {success && <p className="text-green-400 text-sm mb-4 text-center">{success}</p>}

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-gray-300 mb-1">Name</label>
//             <input
//               type="text"
//               name="name"
//               placeholder="John Doe"
//               value={formData.name}
//               onChange={handleChange}
//               className="w-full px-4 py-2 rounded bg-[#2b2b2b] text-white focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-gray-300 mb-1">Email</label>
//             <input
//               type="email"
//               name="email"
//               placeholder="you@example.com"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full px-4 py-2 rounded bg-[#2b2b2b] text-white focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-gray-300 mb-1">Password</label>
//             <input
//               type="password"
//               name="password"
//               placeholder="••••••••"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full px-4 py-2 rounded bg-[#2b2b2b] text-white focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-gray-300 mb-1">Contact Number</label>
//             <input
//               type="text"
//               name="contactNumber"
//               placeholder="9876543210"
//               value={formData.contactNumber}
//               onChange={handleChange}
//               className="w-full px-4 py-2 rounded bg-[#2b2b2b] text-white focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-gray-300 mb-1">Age (optional)</label>
//             <input
//               type="number"
//               name="age"
//               placeholder="e.g. 25"
//               value={formData.age}
//               onChange={handleChange}
//               className="w-full px-4 py-2 rounded bg-[#2b2b2b] text-white focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
//             />
//           </div>

//           <div>
//             <label className="block text-gray-300 mb-1">Role</label>
//             <select
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               className="w-full px-4 py-2 rounded bg-[#2b2b2b] text-white focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
//             >
//               <option value="patient">Patient</option>
//               <option value="caretaker">Caretaker</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-[#00d4ff] hover:bg-[#00aacc] transition-all duration-200 text-black font-semibold py-2 rounded"
//           >
//             Register
//           </button>
//         </form>

//         <p className="text-sm text-gray-400 text-center mt-6">
//           Already have an account?{" "}
//           <a href="/login" className="text-[#00d4ff] hover:underline">
//             Login
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../services/api";
// const Register = () => {
//   const [formData, setFormData] = useState({
//     role: "patient",
//     name: "",
//     email: "",
//     password: "",
//     contactNumber: "",
//     age: "",
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [animate, setAnimate] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     setTimeout(() => setAnimate(true), 100);
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

// const handleRegister = async (e) => {
//   e.preventDefault();
//   setIsSubmitting(true);
//   try {
//     const res = await api.post("/api/auth/register", formData);
//     const { role } = res.data;
//     console.log("Registration successful:", res.data);
//     console.log("User role:", role);

//     alert("Registration successful");
 
//     localStorage.setItem("role", role);
//     // Redirect based on role
//     if (role === "patient") navigate("/patient/dashboard");
//     else if (role === "caretaker") navigate("/caretaker/dashboard");
//   } catch (error) {
//     alert(error?.response?.data?.message || "Registration failed");
//   }
// };

//   return (
//     <div className="min-h-screen bg-[#111] flex items-center justify-center text-white font-sans px-4">
//       <div
//         className={`bg-[#181818] p-8 rounded-2xl transition duration-700 ease-in-out transform ${
//           animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
//         } shadow-[10px_10px_20px_#0c0c0c,-10px_-10px_20px_#1c1c1c] hover:shadow-[0_0_20px_#6ee7b7,0_0_10px_#10b981] w-full max-w-md`}
//       >
//         <h2 className="text-3xl font-semibold text-center mb-6 tracking-widest">REGISTER</h2>
//         <form onSubmit={handleRegister} className="space-y-5">
//           <div>
//             <label className="text-gray-300 block mb-1">Role</label>
//             <select
//               name="role"
//               onChange={handleChange}
//               className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none"
//               value={formData.role}
//             >
//               <option value="patient">Patient</option>
//               <option value="caretaker">Caretaker</option>
//             </select>
//           </div>

//           <input
//             type="text"
//             placeholder="Full Name"
//             name="name"
//             required
//             value={formData.name}
//             onChange={handleChange}
//             className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none"
//           />
//           <input
//             type="email"
//             placeholder="Email"
//             name="email"
//             required
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             name="password"
//             required
//             value={formData.password}
//             onChange={handleChange}
//             className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none"
//           />
//           <input
//             type="text"
//             placeholder="Contact Number"
//             name="contactNumber"
//             required
//             value={formData.contactNumber}
//             onChange={handleChange}
//             className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none"
//           />
//           <input
//             type="number"
//             placeholder="Age"
//             name="age"
//             value={formData.age}
//             onChange={handleChange}
//             className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none"
//           />

//           <button
//             type="submit"
//             className="w-full py-3 bg-[#1f1f1f] rounded-xl shadow hover:shadow-md hover:bg-[#222] transition text-green-400 hover:text-green-300"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? "Signing In..." : "Sign In"}
//           </button>
//         </form>

//         <p className="text-center text-gray-400 text-sm mt-4">
//           Already have an account?{" "}
//           <span
//             onClick={() => navigate("/login")}
//             className="text-blue-500 cursor-pointer hover:underline"
//           >
//             Login
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    role: "patient",
    name: "",
    email: "",
    password: "",
    contactNumber: "",
    age: "",
  });

  const [animate, setAnimate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/register", formData);
      const { role } = res.data;
      console.log("Registration successful:", res.data);
      console.log("User role:", role);

      alert("Registration successful");
   
      localStorage.setItem("role", role);
      if (role === "patient") navigate("/patient/dashboard");
      else if (role === "caretaker") navigate("/caretaker/dashboard");
    } catch (error) {
      alert(error?.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 text-white font-sans relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute top-20 right-20 w-60 h-60 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-3000"></div>
      </div>

      <div
        className={`relative bg-black/20 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md transform transition-all duration-1000 ease-out ${
          animate ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
        } border border-white/10 shadow-2xl hover:shadow-purple-500/25 hover:border-purple-500/30 transition-all duration-500`}
      >
        {/* Header with animated icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4 shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-110">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent tracking-wider">
            Join Us
          </h2>
          <p className="text-gray-400 mt-2 text-sm">Create your account to get started</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">Role</label>
            <div className="relative group">
              <select
                name="role"
                onChange={handleChange}
                value={formData.role}
                className="w-full p-4 pl-12 bg-black/30 border border-gray-600/50 rounded-xl outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 text-white backdrop-blur-sm"
              >
                <option value="patient">Patient</option>
                <option value="caretaker">Caretaker</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">Full Name</label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Enter your full name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-black/30 border border-gray-600/50 rounded-xl outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">Email Address</label>
            <div className="relative group">
              <input
                type="email"
                placeholder="Enter your email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-black/30 border border-gray-600/50 rounded-xl outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-black/30 border border-gray-600/50 rounded-xl outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">Contact Number</label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Enter your contact number"
                name="contactNumber"
                required
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-black/30 border border-gray-600/50 rounded-xl outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">Age (Optional)</label>
            <div className="relative group">
              <input
                type="number"
                placeholder="Enter your age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-black/30 border border-gray-600/50 rounded-xl outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-green-500/50 hover:from-green-500 hover:to-emerald-500 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-center">
            <div className="flex-1 h-px bg-gray-600/50"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-600/50"></div>
          </div>

          <p className="text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-green-400 cursor-pointer hover:text-green-300 transition-colors duration-300 font-medium"
            >
              Sign in here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
