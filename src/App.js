import "./App.css";
import {BrowserRouter as Router,Routes, Route, Navigate} from "react-router-dom";
import HomePage from "./pages/HomePage";
import ServieceDetailsPage from "./pages/ServiceDetail";
import AboutDetailsPage from "./pages/AboutDetailsPage";
import BlogDetail from "./pages/BlogDetailsPage";
import PrivacyPolicy from "./components/Policy/Policy";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./components/admin_side/AdminDashboard/AdminDashboard";
import AttendanceList from "./components/admin_side/Attendance/Attendance";
import UserManagement from "./components/admin_side/UserManagement/UserManagement";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutDetailsPage />} />
          <Route path="/service/:label" element={<ServieceDetailsPage />} />
          <Route path="/service" element={<Navigate to="/service/all" />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/blogs" element={<Navigate to="/blog/all" />} />
          <Route path="/policy" element={<PrivacyPolicy />} />

          <Route path="/userLogin" element={<AdminLoginPage />} />
          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendanceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usermanagement"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
