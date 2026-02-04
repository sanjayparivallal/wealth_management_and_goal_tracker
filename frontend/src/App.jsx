import { Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Home from "./common/Home";
import Goals from "./goals/Goals";
import Investments from "./investments/Investments";
import Transactions from "./transactions/Transactions";
import Profile from "./profile/Profile";
import RiskAssessment from "./risk/RiskAssessment";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/risk-assessment" element={<RiskAssessment />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/investments" element={<Investments />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
