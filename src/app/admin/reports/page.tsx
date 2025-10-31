import AdminLayout from "@/components/admin/AdminLayout";
import ReportsManagement from "@/components/admin/reports/ReportsManagement";

export default function AdminReportsPage() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">إدارة البلاغات</h1>
        <ReportsManagement />
      </div>
    </AdminLayout>
  );
}
