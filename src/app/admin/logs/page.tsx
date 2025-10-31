"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Log {
  _id: string;
  adminId: { username: string; email: string };
  action: string;
  target: string;
  createdAt: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/logs?page=${page}&limit=20`);
      setLogs(response.data.logs);
      setTotalLogs(response.data.totalLogs);
    } catch (error) {
      toast.error("فشل تحميل السجلات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ar-SA");
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">سجلات المشرفين</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">جاري التحميل...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-right text-gray-700 font-semibold">اسم المشرف</th>
                    <th className="px-6 py-3 text-right text-gray-700 font-semibold">الإجراء</th>
                    <th className="px-6 py-3 text-right text-gray-700 font-semibold">الهدف</th>
                    <th className="px-6 py-3 text-right text-gray-700 font-semibold">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-800">{log.adminId.username}</td>
                      <td className="px-6 py-4 text-gray-800">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800">{log.target}</td>
                      <td className="px-6 py-4 text-gray-800">{formatDate(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-gray-600">
            إجمالي السجلات: <span className="font-bold">{totalLogs}</span>
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
              disabled={page * 20 >= totalLogs}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
