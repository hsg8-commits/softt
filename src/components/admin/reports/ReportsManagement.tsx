"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiCheckCircle, FiTrash2, FiEye } from "react-icons/fi";

interface Report {
  _id: string;
  reporterId: { username: string; phone: string };
  reportedUserId?: { username: string };
  reportType: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [statusFilter, setStatusFilter] = useState("open");

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/admin/reports?page=${page}&limit=20&status=${statusFilter}`
      );
      setReports(response.data.reports);
      setTotalReports(response.data.totalReports);
    } catch (error) {
      toast.error("فشل تحميل البلاغات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: string) => {
    try {
      await axios.put(`/api/admin/reports`, { reportId, action });
      toast.success("تم تنفيذ الإجراء بنجاح");
      fetchReports();
    } catch (error) {
      toast.error("فشل تنفيذ الإجراء");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="open">المفتوحة</option>
          <option value="in_review">قيد المراجعة</option>
          <option value="resolved">المحلولة</option>
          <option value="all">الكل</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-right text-gray-700 font-semibold">المبلغ</th>
                  <th className="px-6 py-3 text-right text-gray-700 font-semibold">نوع البلاغ</th>
                  <th className="px-6 py-3 text-right text-gray-700 font-semibold">الوصف</th>
                  <th className="px-6 py-3 text-right text-gray-700 font-semibold">الحالة</th>
                  <th className="px-6 py-3 text-right text-gray-700 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{report.reporterId.username}</td>
                    <td className="px-6 py-4 text-gray-800">{report.reportType}</td>
                    <td className="px-6 py-4 text-gray-800 truncate">{report.content}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          report.status === "open"
                            ? "bg-red-100 text-red-800"
                            : report.status === "in_review"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {report.status === "open"
                          ? "مفتوح"
                          : report.status === "in_review"
                          ? "قيد المراجعة"
                          : "محلول"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleReportAction(report._id, "ignore")}
                        className="p-2 hover:bg-gray-100 rounded text-gray-600"
                        title="تجاهل البلاغ"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleReportAction(report._id, "delete_message")}
                        className="p-2 hover:bg-yellow-100 rounded text-yellow-600"
                        title="حذف الرسالة"
                      >
                        <FiTrash2 size={18} />
                      </button>
                      <button
                        onClick={() => handleReportAction(report._id, "block_user")}
                        className="p-2 hover:bg-red-100 rounded text-red-600"
                        title="حظر المستخدم"
                      >
                        <FiCheckCircle size={18} />
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
          إجمالي البلاغات: <span className="font-bold">{totalReports}</span>
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
            disabled={page * 20 >= totalReports}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
