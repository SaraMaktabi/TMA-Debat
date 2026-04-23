import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Tickets from "../pages/Tickets";
import TicketDetails from "../pages/TicketDetails";
import TicketDetailsAdmin from "../pages/TicketDetailsAdmin";
import Debate from "../pages/Debate";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Demo from "../pages/Demo";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/ticket/:id" element={<TicketDetails />} />
        <Route path="/ticket-details/:id" element={<TicketDetailsAdmin />} />
        <Route path="/debat/:id" element={<Debate />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute adminOnly>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}