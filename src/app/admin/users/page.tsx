import AdminLayout from "@/components/admin/AdminLayout";
import UsersManagement from "@/components/admin/users/UsersManagement";

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">إدارة المستخدمين</h1>
        <UsersManagement />
      </div>
    </AdminLayout>
  );
}
