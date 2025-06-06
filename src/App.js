import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ServieceDetailsPage from './pages/ServiceDetail';
import AboutDetailsPage from './pages/AboutDetailsPage';
import BlogDetail from './pages/BlogDetailsPage';
import PrivacyPolicy from './components/Policy/Policy';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path='/about' element={<AboutDetailsPage />} />
          <Route path="/service/:label" element={<ServieceDetailsPage />} />
          <Route path="/service" element={<Navigate to="/service/all" />} />
          <Route path="blogs/:slug" element={<BlogDetail />} />
          <Route path="/blogs" element={<Navigate to="/blog/all" />} />
          <Route path="/policy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
