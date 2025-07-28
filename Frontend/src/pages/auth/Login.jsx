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


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // uses baseURL: http://localhost:3000

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [animate, setAnimate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100); // trigger animation on mount
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { role } = res.data;
      console.log("Login successful:", res.data);
      console.log("User role:", role);
     
      localStorage.setItem("role", role);
      // Redirect based on role
      if (role === "patient") navigate("/patient/dashboard");
      else if (role === "caretaker") navigate("/caretaker/dashboard");
    } catch (error) {
      alert(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center px-4 text-white font-sans">
      <div
        className={`bg-[#181818] p-8 rounded-2xl w-full max-w-md transform transition duration-700 ease-in-out ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } shadow-[10px_10px_20px_#0c0c0c,-10px_-10px_20px_#1c1c1c] hover:shadow-[0_0_20px_#60a5fa,0_0_10px_#3b82f6]`}
      >
        <h2 className="text-3xl font-semibold text-center mb-6 tracking-widest">LOGIN</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-gray-300 block mb-1">Email</label>
            <input
              type="email"
              placeholder="example@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none focus:ring focus:ring-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-1">Password</label>
            <input
              type="password"
              placeholder="•••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none focus:ring focus:ring-blue-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1f1f1f] rounded-xl shadow hover:shadow-md hover:bg-[#222] transition text-blue-400 hover:text-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-4">
          Forgot Password?{" "}
          <span className="text-pink-500 cursor-pointer hover:underline">Click Here!</span>
        </p>

        <p className="text-center text-gray-400 text-sm mt-2">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-green-400 cursor-pointer hover:underline"
          >
            Register here!
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;


