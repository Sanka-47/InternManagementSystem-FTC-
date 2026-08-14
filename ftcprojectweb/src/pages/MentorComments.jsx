import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Card from "../components/Card";
import Button from "../components/Button";
import Textarea from "../components/Textarea";
import {
  listDoneTasksForMentor,
  listCommentsForTask,
  createComment,
} from "../services/mentor";
import { useAuth } from "../context/AuthContext";

export default function MentorComments() {
    document.title = "FCT | Mentor Feedbacks";
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]); 
  const [commentsByTask, setCommentsByTask] = useState({}); 
  const [newComment, setNewComment] = useState({}); 
  const [openTaskId, setOpenTaskId] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
        try {
        setLoading(true);
        const rows = await listDoneTasksForMentor();
        setTasks(rows);

        // fetch comments for all tasks
        const commentsMap = {};
        for (const t of rows) {
            commentsMap[t.task_id] = await listCommentsForTask(t.task_id);
        }
        setCommentsByTask(commentsMap);

        } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load tasks!");
        } finally {
        setLoading(false);
        }
    })();
  }, []);

  const toggleTask = async (task_id) => {
    if (openTaskId === task_id) {
      setOpenTaskId(null);
      return;
    }
    setOpenTaskId(task_id);
    if (!commentsByTask[task_id]) {
      try {
        const cs = await listCommentsForTask(task_id);
        setCommentsByTask((prev) => ({ ...prev, [task_id]: cs }));
      } catch {
        // show inline error on that section if needed
      }
    }
  };

  const onAddComment = async (task_id) => {
    const text = (newComment[task_id] || "").trim();
    if (!text) return;
    try {
      const created = await createComment({ task_id: task_id, comment_text: text });
      setCommentsByTask((prev) => ({
        ...prev,
        [task_id]: [...(prev[task_id] || []), created],
      }));
      setNewComment((prev) => ({ ...prev, [task_id]: "" }));
    } catch (e) {
      await Swal.fire({
        title: 'Oops!',
        text: e?.response?.data?.message || "Failed to add comment!",
        icon: 'error',
        confirmButtonText: 'Try Again!',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">Future Code Technology — Task Comments</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>

      <main className="flex-1 p-6 space-y-6">
        {err && <div className="text-red-600">{err}</div>}

        <Card title="Completed Tasks" subtitle="Add and view comments for completed tasks">
          <div className="space-y-4">
            {tasks.map((t) => (
              <div key={t.task_id} className="rounded-2xl border p-4 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-gray-800">{t.task_title}</div>
                    <div className="text-sm text-gray-500">Project: {t.project_name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        t.task_status === "Done"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {t.task_status}
                    </span>
                    <Button
                      className="w-auto px-3 py-1 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => toggleTask(t.task_id)}
                    >
                      {openTaskId === t.task_id ? "Hide Comments" : "View Comments"}
                    </Button>
                  </div>
                </div>

                {openTaskId === t.task_id && (
                  <div className="mt-4">
                    {/* existing comments */}
                    <div className="space-y-3 mb-4">
                      {(commentsByTask[t.task_id] || []).map((c) => (
                        <div key={c.id} className="rounded-xl bg-gray-50 border px-3 py-2">
                          <div className="text-sm text-gray-800">{c.comment_text}</div>
                          <div className="text-[11px] text-gray-500 mt-1">
                            {c.mentor_id
                              ? `Mentor${c.mentor_name ? `: ${c.mentor_name}` : ""}`
                              : c.admin_id
                              ? `Admin${c.admin_name ? `: ${c.admin_name}` : ""}`
                              : "—"}{" "}
                            • {new Date(c.created_at).toLocaleString("en-US", { 
                                dateStyle: "medium", 
                                timeStyle: "short" 
                              })}
                          </div>
                        </div>
                      ))}
                      {(!commentsByTask[t.task_id] || commentsByTask[t.task_id].length === 0) && (
                        <div className="text-sm text-gray-500">No comments yet.</div>
                      )}
                    </div>

                    {/* add comment */}
                    <div className="rounded-xl bg-white border p-3">
                      <Textarea
                        label="Add Comment"
                        value={newComment[t.task_id] || ""}
                        onChange={(e) =>
                          setNewComment((prev) => ({ ...prev, [t.task_id]: e.target.value }))
                        }
                        placeholder="Write your feedback..."
                        rows={3}
                      />
                      <div className="flex items-center justify-end">
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => onAddComment(t.task_id)}
                        >
                          + Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="text-sm text-gray-500">No completed tasks found!</div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
