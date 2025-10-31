"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";

interface User {
  _id: string;
  name: string;
  username: string;
  phone: string;
  status: string;
  avatar?: string;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/users?page=${page}&limit=20`);
      setUsers(response.data.users);
      setTotalUsers(response.data.totalUsers);
    } catch (error) {
      toast.error("فشل تحميل المستخدمين");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حظر هذا المستخدم؟")) return;

    try {
      await axios.delete(`/api/admin/users?userId=${userId}&action=block`);
      toast.success("تم حظر المستخدم بنجاح");
      fetchUsers();
    } catch (error) {
      toast.error("فشل حظر المستخدم");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      await axios.delete(`/api/admin/users?userId=${userId}&action=delete`);
      toast.success("تم حذف المستخدم بنجاح");
      fetchUsers();
    } catch (error) {
      toast.error("فشل حذف المستخدم");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.includes(searchTerm) ||
      user.name.includes(searchTerm) ||
      user.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute right-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-right text-gray-700 font-semibold">اسم المستخدم</th>
                  <th className="px-6 py-3 text-right text-gray-700 font-semibold">الاسم الكامل</th>
                  <th className="px-6 py-3 text-right text-gray-700 font-semibold">رقم الهاتف</th>
                  <th className="px-6 py-3 text-right text-gray-700 font-semibold">الحالة</th>
                  <th className="px-6 py-3 text-right text-gray-700 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{user.username}</td>
                    <td className="px-6 py-4 text-gray-800">{user.name}</td>\n                    <td className="px-6 py-4 text-gray-800">{user.phone}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          user.status === "online"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.status === "online" ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleBlockUser(user._id)}
                        className="p-2 hover:bg-yellow-100 rounded text-yellow-600"
                        title="حظر المستخدم"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 hover:bg-red-100 rounded text-red-600"
                        title="حذف المستخدم"
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

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-gray-600">
          إجمالي المستخدمين: <span className="font-bold">{totalUsers}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            السابق
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded">الصفحة {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * 20 >= totalUsers}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
