import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Tickets from "../pages/Tickets";
import TicketDetails from "../pages/TicketDetails";
import TicketDetailsAdmin from "../pages/TicketDetailsAdmin";
import Debate from "../pages/Debate";
import Dashboard from "../pages/Dashboard";
import AdminTickets from "../pages/AdminTickets";
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
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <Tickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket/:id"
          element={
            <ProtectedRoute>
              <TicketDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket-details/:id"
          element={
            <ProtectedRoute adminOnly>
              <TicketDetailsAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/debat/:id"
          element={
            <ProtectedRoute>
              <Debate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute adminOnly>
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
        <Route
          path="/admin-tickets"
          element={
            <ProtectedRoute adminOnly>
              <AdminTickets />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}