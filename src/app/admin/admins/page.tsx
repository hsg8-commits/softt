"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

interface Admin {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "moderator",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/admins");
      setAdmins(response.data.admins);
    } catch (error) {
      toast.error("فشل تحميل المشرفين");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/admins", formData);
      toast.success("تم إضافة مشرف جديد بنجاح");
      setFormData({ username: "", email: "", password: "", role: "moderator" });
      setShowForm(false);
      fetchAdmins();
    } catch (error) {
      toast.error("فشل إضافة المشرف");
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المشرف؟")) return;

    try {
      await axios.delete(`/api/admin/admins?adminId=${adminId}`);
      toast.success("تم حذف المشرف بنجاح");
      fetchAdmins();
    } catch (error) {
      toast.error("فشل حذف المشرف");
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">إدارة المشرفين</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus size={20} />
            إضافة مشرف جديد
          </button>
        </div>

        {/* Add Admin Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="اسم المستخدم"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="كلمة المرور"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="moderator">مشرف عادي</option>
                  <option value="superadmin">مشرف عام</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admins Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">جاري التحميل...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-right text-gray-700 font-semibold">اسم المستخدم</th>
                    <th className="px-6 py-3 text-right text-gray-700 font-semibold">البريد الإلكتروني</th>
                    <th className="px-6 py-3 text-right text-gray-700 font-semibold">الدور</th>
                    <th className="px-6 py-3 text-right text-gray-700 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-800">{admin.username}</td>
                      <td className="px-6 py-4 text-gray-800">{admin.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            admin.role === "superadmin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {admin.role === "superadmin" ? "مشرف عام" : "مشرف عادي"}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          className="p-2 hover:bg-yellow-100 rounded text-yellow-600"
                          title="تعديل"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin._id)}
                          className="p-2 hover:bg-red-100 rounded text-red-600"
                          title="حذف"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
