import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Admin from './components/Admin';
import Users from './components/Users';
import Hours from './components/Hours';
import RegistrationForm from './components/RegistrationForm';
import PostContent from './components/PostContent';
import ResetPassword from './components/ResetPassword';
import NewPassword from './components/NewPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Admin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/users" element={<Users />} />
        <Route path="/hours" element={<Hours />} />
        <Route path="/forgotpassword" element={<ResetPassword />} />
        <Route path="newpassword" element={<NewPassword />} />
        <Route path="/registration" element={<RegistrationForm />} />
      </Routes>
    </Router>
  );
}

export default App;
