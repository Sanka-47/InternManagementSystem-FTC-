import { useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { listTeamSubtasks, updateSubtaskStatus } from "../services/intern";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Input from "../components/input";
import Button from "../components/Button";
import api from "../services/api";

// ---------- Small helper: zoom-on-hover image ----------
function ImageHoverZoom({ src, alt, className = "", zoom = 2 }) {
  const containerRef = useRef(null);
  const [origin, setOrigin] = useState("center center");
  const [hovered, setHovered] = useState(false);

  function onMove(e) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={onMove}
      className={`relative overflow-hidden rounded-lg border bg-white ${className}`}
      style={{
        cursor: hovered ? "zoom-in" : "default",
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 ease-out"
        style={{
          transform: hovered ? `scale(${zoom})` : "scale(1)",
          transformOrigin: origin,
          willChange: "transform",
          display: "block",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

const statuses = ["In Progress", "In Review", "Done"];

export default function InternKanban() {
  document.title = "FCT | Kanban Board";
  const [tasks, setTasks] = useState([]);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);

  // task_id -> blob URL
  const [imageUrls, setImageUrls] = useState({});
  // keep list of created URLs to revoke on cleanup
  const createdUrlsRef = useRef(new Set());

  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const data = await listTeamSubtasks();
        setTasks(data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load subtasks");
      }
    })();
  }, []);

  // Fetch image blobs for tasks that are images & have attachments
  useEffect(() => {
    let cancelled = false;

    async function fetchImages() {
      const candidates = tasks.filter(
        (t) => t.has_attachment && typeof t.attachment_mime === "string" && t.attachment_mime.startsWith("image/")
      );

      // Only fetch ones we don't already have
      const toFetch = candidates.filter((t) => !imageUrls[t.task_id]);

      for (const t of toFetch) {
        try {
          const res = await api.get(`/api/intern/tasks/${t.task_id}/attachment`, {
            responseType: "blob",
          });
          if (cancelled) return;

          const blobUrl = URL.createObjectURL(res.data);
          createdUrlsRef.current.add(blobUrl);
          setImageUrls((m) => ({ ...m, [t.task_id]: blobUrl }));
        } catch (e) {
          // swallow; we'll just show no image
          // You can log if useful: console.warn("img fetch failed", t.task_id, e);
        }
      }
    }

    if (tasks.length) fetchImages();

    return () => {
      cancelled = true;
    };
  }, [tasks]);

  // Revoke blob URLs on unmount
  useEffect(() => {
    return () => {
      for (const url of createdUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
      createdUrlsRef.current.clear();
    };
  }, []);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const newStatus = statuses[destination.droppableId];
    const oldStatus = statuses[source.droppableId];
    if (newStatus === oldStatus) return;

    try {
      await updateSubtaskStatus(draggableId, newStatus);
      setTasks((ts) => ts.map((t) => (t.id == draggableId ? { ...t, status: newStatus } : t)));
    } catch {
      alert("Failed to update status");
    }
  };

  const addNote = () => {
    if (!note.trim()) return;
    setSavedNotes((s) => [...s, note.trim()]);
    setNote("");
  };

  const handleDownload = async (taskId, attachmentName) => {
    try {
      const res = await api.get(`/intern/tasks/${taskId}/attachment`, {
        responseType: "blob",
      });
      const blobUrl = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = attachmentName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download attachment", error);
      setErr("Failed to download attachment.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">
            Future Code Technology - Intern Kanban Board
          </div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>

      {/* Page Content */}
      <div className="flex-grow p-6 space-y-6">
        {err && <div className="text-red-600">{err}</div>}

        {/* Quick Note Section */}
        <Card title="Quick Notes" subtitle="Write down reminders or thoughts">
          <div className="flex items-start gap-2 mb-4">
            <div className="flex-grow">
              <Input
                placeholder="Write a quick note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <Button type="button" onClick={addNote} className="bg-indigo-600 hover:bg-indigo-700">
              + Add
            </Button>
          </div>
          {savedNotes.length > 0 && (
            <ul className="space-y-2 text-sm text-gray-700">
              {savedNotes.map((n, idx) => (
                <li key={idx} className="px-3 py-2 rounded-xl bg-gray-100 border shadow-sm">
                  {n}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statuses.map((status, idx) => (
              <Droppable droppableId={String(idx)} key={status}>
                {(provided) => (
                  <Card title={status}>
                    <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[300px]">
                      {tasks
                        .filter((t) => t.status === status)
                        .map((t, i) => {
                          const isImg =
                            t.has_attachment &&
                            typeof t.attachment_mime === "string" &&
                            t.attachment_mime.startsWith("image/");
                          const url = isImg ? imageUrls[t.task_id] : null;
                          const isMyTask = t.intern_id === user.id;

                          return (
                            <Draggable
                              key={t.id}
                              draggableId={String(t.id)}
                              index={i}
                              isDragDisabled={!isMyTask}
                            >
                              {(prov) => (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  className={`mb-3 p-3 rounded-xl border shadow-sm bg-white ${
                                    isMyTask ? "hover:bg-gray-50" : "opacity-70"
                                  }`}
                                >
                                  <div className="flex items-center mb-2">
                                    <img
                                      src={`https://ui-avatars.com/api/?name=${t.intern_name}&background=random`}
                                      alt={t.intern_name}
                                      className="w-8 h-8 rounded-full mr-2"
                                    />
                                    <div>
                                      <div className="font-medium">{t.subtask_title}</div>
                                      <div className="text-xs text-gray-500">{t.intern_name}</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Project: {t.project_name}
                                    <br />
                                    Task: {t.task_title}
                                  </div>
                                  <div className="text-xs mt-1">
                                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                      {t.work_type || "N/A"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
                                      {t.priority || "N/A"}
                                    </span>
                                    <br />
                                    Due Date: {new Date(t.due_date).toLocaleDateString() || "-"}
                                  </div>
                                  <div className="text-xs mt-1">
                                    Labels: {(t.labels || []).join(', ')}
                                  </div>

                                  {isImg && url ? (
                                    <div className="mt-3">
                                      <ImageHoverZoom
                                        src={url}
                                        alt={t.attachment_name || "attachment"}
                                        className="w-full h-40"
                                        zoom={2.2}
                                      />
                                    </div>
                                  ) : t.has_attachment ? (
                                    <div className="mt-3">
                                      <button
                                        onClick={() => handleDownload(t.task_id, t.attachment_name)}
                                        className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                                      >
                                        Download attachment
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="mt-2 text-xs text-gray-400">No attachment</div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </div>
                  </Card>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

