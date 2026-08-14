import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import Footer from "../components/Footer";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Content area */}
        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1">
            <Outlet />
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

