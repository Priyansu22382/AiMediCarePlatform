import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-[#121212] text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-[#4f46e5] tracking-wide">
          AIMedicare
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className="hover:text-[#ef4444] transition duration-300 font-medium"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="hover:text-[#10b981] transition duration-300 font-medium"
          >
            Register
          </Link>
        </div>

        {/* User Dropdown or Dashboard */}
        <div className="hidden md:block">
          {/* Replace with user state later */}
          <Link
            to="/patient/dashboard"
            className="bg-[#4f46e5] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#4338ca] transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
