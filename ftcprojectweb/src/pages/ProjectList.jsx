import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import { listProjects } from "../services/mentor";
import { useAuth } from "../context/AuthContext";

export default function ProjectList() {
  document.title = "FCT | My Projects";
  const nav = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const data = await listProjects();
        setProjects(data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!user) return <div className="p-6">Loading user data...</div>;
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">
            Future Code Technology - My Projects
          </div>
          <span className="text-sm text-gray-400">
            Welcome back, {user?.username}
          </span>
        </div>
      </nav>

      <div className="flex items-center justify-between mb-4 p-6">
        <h1 className="text-xl font-semibold">My Projects</h1>
        <Button
          className="w-[200px] px-6 bg-green-500 hover:bg-green-600 flex items-center justify-center transform hover:scale-105 transition-transform duration-200 shadow-lg text-white font-bold rounded-md"
          onClick={() => nav("/mentor/projects/new")}
        >
          <span className="mr-2">+</span>
          New Project
        </Button>
      </div>

      <main className="flex-1 p-6 space-y-6">
        {err && <div className="text-red-600">{err}</div>}
        {projects.length === 0 && !loading && !err && (
          <div className="text-center text-gray-500 p-4">
            You don't have any projects assigned yet.
          </div>
        )}
        {projects.length > 0 && (
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="min-w-[1200px] w-full text-sm border">
              <thead>
                <tr className="text-center text-gray-500">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Project</th>
                  <th className="py-2 pr-4">Cohort</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Dates</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-t text-center">
                    <td className="py-2 pr-4">{p.id}</td>
                    <td className="py-2 pr-4 font-medium">{p.name}</td>
                    <td className="py-2 pr-4">{p.cohort_name || p.cohorts_id}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          p.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : p.status === "Done"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      {p.start_date
                        ? new Date(p.start_date).toLocaleDateString()
                        : "-"}{" "}
                      →{" "}
                      {p.end_date
                        ? new Date(p.end_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-2 pr-4 space-x-2">
                      <Button
                        className="w-auto px-3 py-1 bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => nav(`/mentor/projects/${p.id}/kanban`)}
                      >
                        View Kanban Board
                      </Button>
                      <Button
                        className="w-auto px-3 py-1 bg-green-600 hover:bg-green-700"
                        onClick={() => nav(`/mentor/projects/${p.id}/tasks/new`)}
                      >
                        + Task
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}