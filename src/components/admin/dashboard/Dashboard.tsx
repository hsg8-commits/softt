"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiUsers, FiMessageSquare, FiAlertCircle, FiHardDrive } from "react-icons/fi";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  dailyMessages: number;
  openReports: number;
  storageUsedGB: number;
  mostActiveUsers: Array<{ _id: string; username: string; name: string }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">جاري التحميل...</div>;
  }

  if (!stats) {
    return <div className="text-center py-10">فشل تحميل الإحصائيات</div>;
  }

  const statCards = [
    {
      title: "إجمالي المستخدمين",
      value: stats.totalUsers,
      icon: FiUsers,
      color: "bg-blue-500",
    },
    {
      title: "المستخدمين النشطين",
      value: stats.activeUsers,
      icon: FiUsers,
      color: "bg-green-500",
    },
    {
      title: "الرسائل اليومية",
      value: stats.dailyMessages,
      icon: FiMessageSquare,
      color: "bg-purple-500",
    },
    {
      title: "البلاغات المفتوحة",
      value: stats.openReports,
      icon: FiAlertCircle,
      color: "bg-red-500",
    },
    {
      title: "التخزين المستخدم",
      value: `${stats.storageUsedGB} GB`,
      icon: FiHardDrive,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Most Active Users */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">أكثر المستخدمين نشاطًا</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-right text-gray-700">اسم المستخدم</th>
                <th className="px-4 py-2 text-right text-gray-700">الاسم الكامل</th>
              </tr>
            </thead>
            <tbody>
              {stats.mostActiveUsers.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800">{user.username}</td>
                  <td className="px-4 py-2 text-gray-800">{user.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
