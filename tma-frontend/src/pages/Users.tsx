import { Link } from "react-router-dom";
import { Bot, BarChart3, AlertCircle, UsersIcon, Home, Settings, LogOut, Plus, Trash2, Edit2, Eye, Search, Filter, MoreVertical, UserCheck, UserX, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  joinDate: string;
  lastActive: string;
  department: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "USR-001",
      name: "John Doe",
      email: "john.doe@company.com",
      phone: "+1-555-0101",
      role: "Admin",
      status: "Active",
      joinDate: "2025-01-15",
      lastActive: "Today 14:30",
      department: "IT",
    },
    {
      id: "USR-002",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      phone: "+1-555-0102",
      role: "Supervisor",
      status: "Active",
      joinDate: "2025-02-20",
      lastActive: "Today 09:15",
      department: "Support",
    },
    {
      id: "USR-003",
      name: "Robert Johnson",
      email: "robert.johnson@company.com",
      phone: "+1-555-0103",
      role: "Technician",
      status: "Active",
      joinDate: "2025-03-10",
      lastActive: "Yesterday 16:45",
      department: "Support",
    },
    {
      id: "USR-004",
      name: "Emily Brown",
      email: "emily.brown@company.com",
      phone: "+1-555-0104",
      role: "Manager",
      status: "Active",
      joinDate: "2025-01-05",
      lastActive: "Today 11:20",
      department: "Operations",
    },
    {
      id: "USR-005",
      name: "Michael Davis",
      email: "michael.davis@company.com",
      phone: "+1-555-0105",
      role: "Technician",
      status: "Inactive",
      joinDate: "2025-04-01",
      lastActive: "5 days ago",
      department: "Support",
    },
    {
      id: "USR-006",
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      phone: "+1-555-0106",
      role: "Analyst",
      status: "Pending",
      joinDate: "2026-04-15",
      lastActive: "Never",
      department: "Analytics",
    },
    {
      id: "USR-007",
      name: "David Martinez",
      email: "david.martinez@company.com",
      phone: "+1-555-0107",
      role: "Technician",
      status: "Active",
      joinDate: "2025-02-28",
      lastActive: "Today 13:50",
      department: "Support",
    },
    {
      id: "USR-008",
      name: "Lisa Anderson",
      email: "lisa.anderson@company.com",
      phone: "+1-555-0108",
      role: "Supervisor",
      status: "Active",
      joinDate: "2025-03-05",
      lastActive: "Today 10:30",
      department: "Support",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "All" || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const deleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    setShowDeleteConfirm(null);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-700";
      case "Manager":
        return "bg-blue-100 text-blue-700";
      case "Supervisor":
        return "bg-indigo-100 text-indigo-700";
      case "Technician":
        return "bg-green-100 text-green-700";
      case "Analyst":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const menuItems = [
    { icon: Home, label: "Accueil", href: "/", badge: null },
    { icon: BarChart3, label: "Tableau de Bord", href: "/dashboard", badge: null },
    // { icon: AlertCircle, label: "Tickets", href: "/tickets", badge: tickets.length.toString() },
    { icon: UsersIcon, label: "Utilisateurs", href: "/users", badge: null },
    { icon: Settings, label: "Paramètres", href: "#", badge: null },
  ];

  const stats = [
    { label: "Total Users", value: users.length.toString(), color: "bg-blue-50", icon: UsersIcon, textColor: "text-blue-600" },
    { label: "Active", value: users.filter((u) => u.status === "Active").length.toString(), color: "bg-green-50", icon: UserCheck, textColor: "text-green-600" },
    { label: "Inactive", value: users.filter((u) => u.status === "Inactive").length.toString(), color: "bg-red-50", icon: UserX, textColor: "text-red-600" },
    { label: "Pending", value: users.filter((u) => u.status === "Pending").length.toString(), color: "bg-yellow-50", icon: UsersIcon, textColor: "text-yellow-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex">
      {/* Sidebar - Light Premium */}
      <aside className="w-72 bg-white border-r border-gray-200 shadow-sm sticky top-0 h-screen overflow-y-auto">
        {/* Logo Section - Light */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <Link to="/" className="flex items-center gap-3 group hover:opacity-90 transition-all duration-300">
            <div className="p-2.5 rounded-xl shadow-md group-hover:shadow-gray-400/50 transition-all duration-300" style={{backgroundColor: '#08052e'}}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900">TMA System</span>
        
            </div>
          </Link>
        </div>

        {/* Navigation - Light */}
        <nav className="p-4 space-y-2 mt-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.href}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 to-purple-100/0 group-hover:from-blue-100/50 group-hover:to-purple-100/50 transition-all duration-300"></div>
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                <span className="text-sm font-semibold relative z-10">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-2.5 py-1 text-xs font-bold rounded-full text-white shadow-md relative z-10" style={{backgroundColor: '#08052e'}}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-6 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="rounded-xl p-4 border border-gray-200 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl text-white font-bold shadow-md flex items-center justify-center" style={{backgroundColor: '#0f0745'}}>
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">John Doe</p>
                <p className="text-xs font-medium" style={{color: '#0f0745'}}>Admin</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all duration-200 hover:opacity-90" style={{backgroundColor: '#0f0745'}}>
                Profile
              </button>
              <button className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all duration-200">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Navigation - Light */}
        <nav className="border-b border-gray-200 bg-white/60 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">Gestion complète des utilisateurs du système</p>
            </div>
            <button className="px-4 py-2.5 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:opacity-90 flex items-center gap-2" style={{backgroundColor: '#08052e'}}>
              <Plus className="w-5 h-5" />
              Add New User
            </button>
          </div>
        </nav>

        {/* Page Content */}
        <div className="px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:shadow-purple-200/50 cursor-pointer transform hover:scale-105 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">{stat.label}</p>
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                      <Icon className={`w-5 h-5 ${stat.textColor} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-black mb-2">{stat.value}</h3>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">Total en système</p>
                </div>
              );
            })}
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                >
                  <option>All</option>
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Supervisor</option>
                  <option>Technician</option>
                  <option>Analyst</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                >
                  <option>All</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/50 transition-all duration-200">
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md" style={{backgroundColor: '#08052e'}}>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {user.phone}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{user.department}</p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                          <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-60"></span>
                          {user.status}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{user.lastActive}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                            title={user.status === "Active" ? "Deactivate" : "Activate"}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-500 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <div className="relative group">
                            <button
                              onClick={() => setShowDeleteConfirm(showDeleteConfirm === user.id ? null : user.id)}
                              className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Delete Confirmation */}
                            {showDeleteConfirm === user.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
                                <p className="text-sm font-semibold text-gray-900 mb-3">Delete user?</p>
                                <p className="text-xs text-gray-600 mb-4">This action cannot be undone.</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => deleteUser(user.id)}
                                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 transition-colors"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded hover:bg-gray-300 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50">
                <UsersIcon className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">No users found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredUsers.length}</span> of <span className="font-semibold">{users.length}</span> users
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                Previous
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
