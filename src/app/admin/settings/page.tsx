"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Setting {
  _id: string;
  key: string;
  value: any;
  description: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/settings");
      setSettings(response.data.settings);
    } catch (error) {
      toast.error("فشل تحميل الإعدادات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key: string) => {
    try {
      await axios.put("/api/admin/settings", {
        key,
        value: editingValue,
      });
      toast.success("تم حفظ الإعداد بنجاح");
      setEditingKey(null);
      fetchSettings();
    } catch (error) {
      toast.error("فشل حفظ الإعداد");
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">إعدادات النظام</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">جاري التحميل...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-right text-gray-700 font-semibold">المفتاح</th>
                    <th className="px-6 py-3 text-right text-gray-700 font-semibold">القيمة</th>
                    <th className="px-6 py-3 text-right text-gray-700 font-semibold">الوصف</th>
                    <th className="px-6 py-3 text-right text-gray-700 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.map((setting) => (
                    <tr key={setting._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-800">{setting.key}</td>
                      <td className="px-6 py-4 text-gray-800">
                        {editingKey === setting.key ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          setting.value
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-800">{setting.description}</td>
                      <td className="px-6 py-4 flex gap-2">
                        {editingKey === setting.key ? (
                          <>
                            <button
                              onClick={() => handleSaveSetting(setting.key)}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => setEditingKey(null)}
                              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              إلغاء
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingKey(setting.key);
                              setEditingValue(setting.value);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            تعديل
                          </button>
                        )}
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
