"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMenu, FiX, FiLogOut, FiHome, FiUsers, FiAlertCircle, FiSettings, FiShield, FiFileText } from "react-icons/fi";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { name: "لوحة التحكم", href: "/admin/dashboard", icon: FiHome },
    { name: "إدارة المستخدمين", href: "/admin/users", icon: FiUsers },
    { name: "البلاغات", href: "/admin/reports", icon: FiAlertCircle },
    { name: "الإعدادات", href: "/admin/settings", icon: FiSettings },
    { name: "إدارة المشرفين", href: "/admin/admins", icon: FiShield },
    { name: "السجلات", href: "/admin/logs", icon: FiFileText },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">لوحة الأدمن</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded transition"
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 hover:bg-red-600 rounded transition text-left"
          >
            <FiLogOut size={20} />
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">لوحة تحكم الإدارة</h2>
          <div className="text-gray-600">
            <span className="text-sm">مرحبًا بك في لوحة الأدمن</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
