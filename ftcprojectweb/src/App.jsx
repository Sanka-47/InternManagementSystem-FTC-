import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAuth } from "./context/AuthContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// --- Cleaned & De-duplicated Lazy Imports ---

// Public pages
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const ContactUsPage = lazy(() => import("./pages/ContactUsPage"));

// Auth
const LoginPage = lazy(() => import("./pages/LoginPage"));
const MentorLogin = lazy(() => import("./pages/MentorLogin"));
const InternLogin = lazy(() => import("./pages/InternLogin"));
const AdminRegister = lazy(() => import("./pages/AdminRegister"));
const OTPVerifyPage = lazy(() => import("./pages/OTPVerifyPage"));

// Layouts
const AdminLayout = lazy(() => import("./layouts/AdminLayouts"));
const MentorLayout = lazy(() => import("./layouts/MentorLayouts"));
const InternLayout = lazy(() => import("./layouts/InternLayouts"));

// Dashboards
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MentorDashboard = lazy(() => import("./pages/MentorDashboard"));
const InternDashboard = lazy(() => import("./pages/InternDashboard"));

// Admin pages
const MentorRegister = lazy(() => import("./pages/MentorRegister"));
const MentorList = lazy(() => import("./pages/MentorList"));
const CohortRegister = lazy(() => import("./pages/CohortRegister"));
const CohortList = lazy(() => import("./pages/CohortList"));
const InternRegister = lazy(() => import("./pages/InternRegister"));
const InternList = lazy(() => import("./pages/InternList"));
const ProjectsCreateByAdmin = lazy(() =>
  import("./pages/ProjectsCreateByAdmin")
);
const TaskCreateByAdmin = lazy(() => import("./pages/TaskCreateByAdmin"));
const SubtaskAssignByAdmin = lazy(() => import("./pages/SubtaskAssignByAdmin"));
const ProjectListByAdmin = lazy(() => import("./pages/ProjectListByAdmin"));
const AdminComments = lazy(() => import("./pages/AdminComments"));
const AdminCandidates = lazy(() => import("./pages/AdminCandidates"));
const AdminAppointments = lazy(() => import("./pages/AdminAppointments"));
const AdminMentorDetails = lazy(() => import("./pages/AdminMentorDetails"));
const AdminInternDetails = lazy(() => import("./pages/AdminInternDetails"));
const AdminAttendance = lazy(() => import("./pages/AdminAttendance"));
const ProjectKanban = lazy(() => import("./pages/ProjectKanban"));

// Mentor pages
const ProjectCreate = lazy(() => import("./pages/ProjectsCreate"));
const TaskCreate = lazy(() => import("./pages/TaskCreate"));
const SubtaskAssign = lazy(() => import("./pages/SubtaskAssign"));
const ProjectList = lazy(() => import("./pages/ProjectList"));
const MentorAttendance = lazy(() => import("./pages/MentorAttendance"));
const MentorComments = lazy(() => import("./pages/MentorComments"));
const MentorDetailsPage = lazy(() => import("./pages/MentorDetailsPage"));
const MentorRequestLeave = lazy(() => import("./pages/MentorRequestLeave"));

// Intern pages
const InternKanban = lazy(() => import("./pages/InternKanban"));
const InternAttendance = lazy(() => import("./pages/InternAttendance"));
const InternRequestLeave = lazy(() => import("./pages/InternRequestLeave"));
const InternDetailsPage = lazy(() => import("./pages/InternDetailsPage"));

// Chat pages
const ChatPage = lazy(() => import("./pages/ChatPage"));
const ChatPageForMentor = lazy(() => import("./pages/ChatPageForMentor"));
const ChatPageForIntern = lazy(() => import("./pages/ChatPageForIntern"));

import "./index.css";
import MentorProjectKanban from "./pages/MentorProjectKanban";

function AppRoutes() {
  const { user, role, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  const isAdmin = user && role === "admin";
  const isMentor = user && role === "mentor";
  const isIntern = user && role === "intern";

  // Navbar should show only on login pages
  const loginAndRegisterPaths = [
    "/admin/login",
    "/mentor/login",
    "/intern/login",
    "/admin/register",
    "/admin/register/otp",
  ];
  const showNavbar = !user && loginAndRegisterPaths.includes(pathname);
  const showFooter = !user && loginAndRegisterPaths.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}

      <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
        <Routes>
          {/* ---------- Public Home ---------- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactUsPage />} />

          {/* ---------- Logins and registrations ---------- */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/mentor/login" element={<MentorLogin />} />
          <Route path="/intern/login" element={<InternLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/register/otp" element={<OTPVerifyPage />} />

          {/* ---------- Admin (wrapped with AdminLayout) ---------- */}
          {isAdmin ? (
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />

              <Route path="mentors" element={<MentorList />} />
              <Route path="mentors/new" element={<MentorRegister />} />
              <Route path="mentors/details" element={<AdminMentorDetails />} />
              <Route path="cohorts" element={<CohortList />} />
              <Route path="cohorts/new" element={<CohortRegister />} />
              <Route path="interns" element={<InternList />} />
              <Route path="interns/new" element={<InternRegister />} />
              <Route path="interns/details" element={<AdminInternDetails />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="projects" element={<ProjectListByAdmin />} />
              <Route path="projects/new" element={<ProjectsCreateByAdmin />} />
              <Route
                path="projects/:projectId/tasks/new"
                element={<TaskCreateByAdmin />}
              />
              <Route
                path="projects/:projectId/tasks/:taskId/subtasks/new"
                element={<SubtaskAssignByAdmin />}
              />
              <Route path="comments" element={<AdminComments />} />
              <Route path="candidates" element={<AdminCandidates />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="chat" element={<ChatPage />} />
              <Route
                path="projects/:projectId/kanban"
                element={<ProjectKanban />}
              />
            </Route>
          ) : (
            <Route path="/admin/*" element={<Navigate to="/admin/login" />} />
          )}

          {/* ---------- Mentor (wrapped with MentorLayout) ---------- */}
          {isMentor ? (
            <Route path="/mentor" element={<MentorLayout />}>
              <Route index element={<MentorDashboard />} />
              <Route path="details" element={<MentorDetailsPage />} />
              <Route path="projects" element={<ProjectList />} />
              <Route path="projects/new" element={<ProjectCreate />} />
              <Route
                path="projects/:projectId/tasks/new"
                element={<TaskCreate />}
              />
              <Route
                path="projects/:projectId/tasks/:taskId/subtasks/new"
                element={<SubtaskAssign />}
              />
              <Route path="attendance" element={<MentorAttendance />} />
              <Route path="leaves" element={<MentorRequestLeave />} />
              <Route path="comments" element={<MentorComments />} />
              <Route path="chat" element={<ChatPageForMentor />} />
              <Route
                path="/mentor/projects/:projectId/kanban"
                element={<MentorProjectKanban />}
              />
            </Route>
          ) : (
            <Route path="/mentor/*" element={<Navigate to="/mentor/login" />} />
          )}

          {/* ---------- Intern (wrapped with InternLayout) ---------- */}
          {isIntern ? (
            <Route path="/intern" element={<InternLayout />}>
              <Route index element={<InternDashboard />} />
              <Route path="details" element={<InternDetailsPage />} />
              <Route path="kanban" element={<InternKanban />} />
              <Route path="attendance" element={<InternAttendance />} />
              <Route path="leaves" element={<InternRequestLeave />} />
              <Route path="chat" element={<ChatPageForIntern />} />
            </Route>
          ) : (
            <Route path="/intern/*" element={<Navigate to="/intern/login" />} />
          )}

          {/* ---------- Fallback ---------- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {showFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
