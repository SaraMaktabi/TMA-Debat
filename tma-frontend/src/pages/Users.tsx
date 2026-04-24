import { Link, useNavigate } from "react-router-dom";
import {
  Bot,
  BarChart3,
  UsersIcon,
  Home,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { userAPI, type UserDto } from "../api/client";
import { clearSession, getSession } from "../utils/auth";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
  joinDate: string | null;
  lastActive: string;
  department: string;
}

interface CreateUserForm {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  department: string;
  cv_texte: string;
  competences: string;
}

interface ApiErrorLike {
  response?: {
    data?: {
      detail?: unknown;
    };
  };
}

const defaultCreateUserForm: CreateUserForm = {
  prenom: "",
  nom: "",
  email: "",
  password: "",
  phone: "",
  role: "Employee",
  department: "Support",
  cv_texte: "",
  competences: "",
};

function splitName(fullName: string): { prenom: string; nom: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { prenom: "", nom: "" };
  }
  if (parts.length === 1) {
    return { prenom: parts[0], nom: parts[0] };
  }
  return { prenom: parts[0], nom: parts.slice(1).join(" ") };
}

function mapDtoToUser(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    role: dto.role,
    status: dto.status,
    joinDate: dto.joinDate,
    lastActive: dto.lastActive,
    department: dto.department,
  };
}

export default function Users() {
  const navigate = useNavigate();
  const currentUser = getSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm>(defaultCreateUserForm);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState<CreateUserForm>(defaultCreateUserForm);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setLoadError(null);
    try {
      const data = await userAPI.list();
      setUsers(data.map(mapDtoToUser));
    } catch {
      setLoadError("Impossible de charger les utilisateurs.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "All" || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const deleteUser = async (id: string) => {
    setActionError(null);
    try {
      await userAPI.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setActionError("Suppression impossible pour le moment.");
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const toggleUserStatus = async (id: string) => {
    setActionError(null);
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const nextStatus: "Active" | "Inactive" = user.status === "Active" ? "Inactive" : "Active";

    try {
      await userAPI.updateStatus(id, nextStatus);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)));
    } catch {
      setActionError("Changement de status impossible pour le moment.");
    }
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);
    setIsCreatingUser(true);

    try {
      await userAPI.create({
        prenom: createUserForm.prenom,
        nom: createUserForm.nom,
        email: createUserForm.email,
        password: createUserForm.password,
        phone: createUserForm.phone,
        role: createUserForm.role,
        department: createUserForm.department,
        cv_texte: createUserForm.cv_texte,
        competences: createUserForm.competences,
      });

      setShowCreateModal(false);
      setCreateUserForm(defaultCreateUserForm);
      await loadUsers();
    } catch (error: unknown) {
      const apiError = error as ApiErrorLike;
      const detail =
        typeof apiError.response?.data?.detail === "string" ? apiError.response.data.detail : null;
      setCreateError(typeof detail === "string" ? detail : "Creation de l'utilisateur echouee.");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const openEditModal = (user: User) => {
    const names = splitName(user.name);
    setEditingUserId(user.id);
    setEditError(null);
    setEditUserForm({
      prenom: names.prenom,
      nom: names.nom,
      email: user.email,
      password: "",
      phone: user.phone,
      role: user.role,
      department: user.department,
      cv_texte: "",
      competences: "",
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUserId) {
      return;
    }

    setEditError(null);
    setIsUpdatingUser(true);
    try {
      const payload = {
        prenom: editUserForm.prenom,
        nom: editUserForm.nom,
        email: editUserForm.email,
        phone: editUserForm.phone,
        role: editUserForm.role,
        department: editUserForm.department,
        ...(editUserForm.password.trim() ? { password: editUserForm.password } : {}),
      };

      await userAPI.update(editingUserId, payload);

      setShowEditModal(false);
      setEditingUserId(null);
      await loadUsers();
    } catch (error: unknown) {
      const apiError = error as ApiErrorLike;
      const detail =
        typeof apiError.response?.data?.detail === "string" ? apiError.response.data.detail : null;
      setEditError(typeof detail === "string" ? detail : "Modification de l'utilisateur echouee.");
    } finally {
      setIsUpdatingUser(false);
    }
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
      case "Employee":
        return "bg-emerald-100 text-emerald-700";
      case "Analyst":
        return "bg-orange-100 text-orange-700";
      case "Client":
        return "bg-cyan-100 text-cyan-700";
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
  ];

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const avatarText = (currentUser?.name || "Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

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
                {avatarText || "AD"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name ?? "Admin"}</p>
                <p className="text-xs font-medium" style={{color: '#0f0745'}}>{currentUser?.role ?? "Admin"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all duration-200 hover:opacity-90" style={{backgroundColor: '#0f0745'}}>
                Profile
              </button>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all duration-200"
              >
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
            <button
              onClick={() => {
                setCreateError(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: "#08052e" }}
            >
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
                  <option>Employee</option>
                  <option>Manager</option>
                  <option>Supervisor</option>
                  <option>Technician</option>
                  <option>Analyst</option>
                  <option>Client</option>
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
                </select>
              </div>
            </div>
          </div>

          {loadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {actionError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

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
                  {!isLoadingUsers && filteredUsers.map((user) => (
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
                            {/* <p className="text-sm text-gray-500">{user.id}</p> */}
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
                            onClick={() => openEditModal(user)}
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
                                    onClick={() => {
                                      void deleteUser(user.id);
                                    }}
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
                  {isLoadingUsers && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                        Chargement des utilisateurs...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
              {!isLoadingUsers && filteredUsers.length === 0 && (
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

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  aria-label="Close create user modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prenom</label>
                    <input
                      required
                      value={createUserForm.prenom}
                      onChange={(e) =>
                        setCreateUserForm((prev) => ({ ...prev, prenom: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                    <input
                      required
                      value={createUserForm.nom}
                      onChange={(e) =>
                        setCreateUserForm((prev) => ({ ...prev, nom: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={createUserForm.email}
                      onChange={(e) =>
                        setCreateUserForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={createUserForm.password}
                      onChange={(e) =>
                        setCreateUserForm((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      value={createUserForm.phone}
                      onChange={(e) =>
                        setCreateUserForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                {(createUserForm.role === "Employee" || createUserForm.role === "Technician") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Competences professionnelles
                      </label>
                      <textarea
                        required
                        value={createUserForm.competences}
                        onChange={(e) =>
                          setCreateUserForm((prev) => ({ ...prev, competences: e.target.value }))
                        }
                        placeholder="React:5, Python:4, SQL:3"
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Format attendu: Competence:niveau, separees par des virgules.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CV / Experience professionnelle
                      </label>
                      <textarea
                        required
                        value={createUserForm.cv_texte}
                        onChange={(e) =>
                          setCreateUserForm((prev) => ({ ...prev, cv_texte: e.target.value }))
                        }
                        placeholder="Resume experience, certifications, and technical background"
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      value={createUserForm.role}
                      onChange={(e) =>
                        setCreateUserForm((prev) => ({ ...prev, role: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    >
                      <option>Admin</option>
                      <option>Employee</option>
                      <option>Manager</option>
                      <option>Supervisor</option>
                      <option>Technician</option>
                      <option>Analyst</option>
                      <option>Client</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                    <input
                      value={createUserForm.department}
                      onChange={(e) =>
                        setCreateUserForm((prev) => ({ ...prev, department: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                {createError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {createError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className="px-4 py-2.5 rounded-lg text-white font-semibold hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: "#08052e" }}
                  >
                    {isCreatingUser ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUserId(null);
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  aria-label="Close edit user modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prenom</label>
                    <input
                      required
                      value={editUserForm.prenom}
                      onChange={(e) =>
                        setEditUserForm((prev) => ({ ...prev, prenom: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                    <input
                      required
                      value={editUserForm.nom}
                      onChange={(e) => setEditUserForm((prev) => ({ ...prev, nom: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={editUserForm.email}
                      onChange={(e) =>
                        setEditUserForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password <span className="text-gray-500 font-normal">(optionnel)</span>
                    </label>
                    <input
                      type="password"
                      minLength={6}
                      value={editUserForm.password}
                      onChange={(e) =>
                        setEditUserForm((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      value={editUserForm.phone}
                      onChange={(e) =>
                        setEditUserForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      value={editUserForm.role}
                      onChange={(e) => setEditUserForm((prev) => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    >
                      <option>Admin</option>
                      <option>Employee</option>
                      <option>Manager</option>
                      <option>Supervisor</option>
                      <option>Technician</option>
                      <option>Analyst</option>
                      <option>Client</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                    <input
                      value={editUserForm.department}
                      onChange={(e) =>
                        setEditUserForm((prev) => ({ ...prev, department: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                {editError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {editError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUserId(null);
                    }}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingUser}
                    className="px-4 py-2.5 rounded-lg text-white font-semibold hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: "#08052e" }}
                  >
                    {isUpdatingUser ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
