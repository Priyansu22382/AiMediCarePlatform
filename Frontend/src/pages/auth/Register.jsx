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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleRegister = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    const res = await api.post("/api/auth/register", formData);
    const { role } = res.data;
    console.log("Registration successful:", res.data);
    console.log("User role:", role);

    alert("Registration successful");
 
    localStorage.setItem("role", role);
    // Redirect based on role
    if (role === "patient") navigate("/patient/dashboard");
    else if (role === "caretaker") navigate("/caretaker/dashboard");
  } catch (error) {
    alert(error?.response?.data?.message || "Registration failed");
  }
};

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center text-white font-sans px-4">
      <div
        className={`bg-[#181818] p-8 rounded-2xl transition duration-700 ease-in-out transform ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } shadow-[10px_10px_20px_#0c0c0c,-10px_-10px_20px_#1c1c1c] hover:shadow-[0_0_20px_#6ee7b7,0_0_10px_#10b981] w-full max-w-md`}
      >
        <h2 className="text-3xl font-semibold text-center mb-6 tracking-widest">REGISTER</h2>
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-gray-300 block mb-1">Role</label>
            <select
              name="role"
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none"
              value={formData.role}
            >
              <option value="patient">Patient</option>
              <option value="caretaker">Caretaker</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Full Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none"
          />
          <input
            type="text"
            placeholder="Contact Number"
            name="contactNumber"
            required
            value={formData.contactNumber}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none"
          />
          <input
            type="number"
            placeholder="Age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#111] shadow-inner outline-none"
          />

          <button
            type="submit"
            className="w-full py-3 bg-[#1f1f1f] rounded-xl shadow hover:shadow-md hover:bg-[#222] transition text-green-400 hover:text-green-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
