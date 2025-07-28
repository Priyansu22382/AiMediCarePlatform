import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PatientDashboard from "./pages/patient/PatientDashboard";
import CaretakerDashboard from "./pages/caretaker/CaretakerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/patient/dashboard",
    element: (
      <ProtectedRoute role="patient">
        <PatientDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/caretaker/dashboard",
    element: (
      <ProtectedRoute role="caretaker">
        <CaretakerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "*", // 🔥 404 fallback
    element: (
      <div className="text-center text-white bg-black h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
        <p className="text-gray-400 mt-2">The page you're looking for doesn't exist.</p>
      </div>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
