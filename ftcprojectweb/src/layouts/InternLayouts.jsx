import { Outlet } from "react-router-dom";
import InternSidebar from "../components/InternSidebar";
import Footer from "../components/Footer";

export default function MentorLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex flex-1">
            {/* Sidebar */}
            <InternSidebar />

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
