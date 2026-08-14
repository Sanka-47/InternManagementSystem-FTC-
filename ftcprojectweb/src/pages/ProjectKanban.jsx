import { useEffect, useState, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { rateSubtask, getProject, getProjectKanban } from "../services/admin";

// Helper function to handle file download
const downloadFile = (data, filename, mimeType) => {
  // Convert base64 to binary
  const binaryString = window.atob(data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
import Card from "../components/Card";
import Button from "../components/Button";

const statuses = ["In Progress", "In Review", "Done"];

export default function ProjectKanban() {
  const { projectId } = useParams();
  const nav = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Rating state
  const [rateModal, setRateModal] = useState({ open: false, subtaskId: null });
  const [rating, setRating] = useState(3);

  // Handle attachment download
  const handleDownload = (task) => {
    try {
      // Convert buffer to base64
      const base64String = btoa(
        new Uint8Array(task.attachment_data.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      downloadFile(base64String, task.attachment_name, task.attachment_mime);
    } catch (error) {
      setErr("Failed to download file");
    }
  };

  useEffect(() => {
    document.title = `FCT | Project Kanban`;
    (async () => {
      try {
        const [projectResult, tasksResult] = await Promise.allSettled([
          getProject(projectId),
          getProjectKanban(projectId),
        ]);

        if (projectResult.status === "fulfilled") {
          setProject(projectResult.value);
        } else {
          setErr("Failed to load project details");
        }

        if (tasksResult.status === "fulfilled") {
          setTasks(tasksResult.value);
        } else {
          setErr("Failed to load tasks");
        }
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load project data");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      setErr("");
    };
  }, [projectId]);

  const onDragEnd = (result) => {
    // Admins cannot change subtask status via drag and drop
  };

  function openRatePopup(subtaskId) {
    setRateModal({ open: true, subtaskId });
    setRating(3);
  }

  async function handleSaveRating() {
    try {
      await rateSubtask(rateModal.subtaskId, rating);

      // Refresh the tasks to show the updated rating
      const updatedTasks = await getProjectKanban(projectId);
      setTasks(updatedTasks);

      setRateModal({ open: false, subtaskId: null });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to save rating");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (tasks.length === 0)
    return (
      <div className="p-6">
        You have not created any tasks for this project yet.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">
          {project
            ? `${project.name} - Kanban Board`
            : err
            ? "Error loading project name"
            : "Loading..."}
        </h1>
        <div>
          <Button
            onClick={() => nav(`/admin/projects/${projectId}/tasks/new`)}
            className="bg-green-500 hover:bg-green-600 mr-2 transform hover:scale-105 transition-transform duration-200 shadow-lg text-white font-bold rounded-md"
          >
            + Create Task
          </Button>
          <Button
            onClick={() => nav("/admin/projects")}
            className="bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 transition-transform duration-200 shadow-lg text-white font-bold rounded-md"
          >
            Back to Projects
          </Button>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statuses.map((status, idx) => (
            <Droppable droppableId={String(idx)} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 rounded-lg ${
                    {
                      "In Progress": "bg-yellow-50",
                      "In Review": "bg-blue-50",
                      Done: "bg-green-50",
                    }[status]
                  }`}
                >
                  <Card
                    title={
                      <div className="text-xl font-bold text-gray-700">
                        {status}
                      </div>
                    }
                  >
                    <div className="min-h-[200px]">
                      {(() => {
                        const hasSubtasks = tasks.some((task) =>
                          task.subtasks.some((st) => st.status === status)
                        );

                        if (!hasSubtasks && status !== "In Progress") {
                          return null;
                        }

                        return tasks.map((task) => {
                          const subtasksInStatus = task.subtasks.filter(
                            (subtask) => subtask.status === status
                          );

                          // Check if there are any subtasks in other statuses (In Review or Done)
                          const hasSubtasksInOtherStatuses = task.subtasks.some(
                            (st) =>
                              st.status === "In Review" || st.status === "Done"
                          );

                          // Hide empty task card in In Progress if there are subtasks in other statuses
                          if (
                            status === "In Progress" &&
                            subtasksInStatus.length === 0 &&
                            hasSubtasksInOtherStatuses
                          ) {
                            return null;
                          }

                          // Hide task if it doesn't have subtasks in this status (for non-In Progress columns)
                          if (
                            subtasksInStatus.length === 0 &&
                            status !== "In Progress"
                          ) {
                            return null;
                          }

                          return (
                            <div key={task.id} className="mb-4">
                              <Card
                                title={
                                  <div>
                                    <div>{task.title}</div>
                                    <div className="text-xs font-normal mt-1">
                                      Priority: {task.priority || "N/A"} | Due:{" "}
                                      {task.due_date
                                        ? new Date(
                                            task.due_date
                                          ).toLocaleDateString()
                                        : "-"}
                                      {task.attachment_name && (
                                        <div className="mt-2">
                                          {task.attachment_mime?.startsWith(
                                            "image/"
                                          ) ? (
                                            <div className="relative">
                                              <img
                                                src={`data:${
                                                  task.attachment_mime
                                                };base64,${btoa(
                                                  new Uint8Array(
                                                    task.attachment_data.data
                                                  ).reduce(
                                                    (data, byte) =>
                                                      data +
                                                      String.fromCharCode(byte),
                                                    ""
                                                  )
                                                )}`}
                                                alt={task.attachment_name}
                                                className="max-w-full h-auto rounded border border-gray-200"
                                                style={{ maxHeight: "150px" }}
                                              />
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDownload(task);
                                                }}
                                                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                                                title="Download image"
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  className="h-4 w-4"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  stroke="currentColor"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                  />
                                                </svg>
                                              </button>
                                            </div>
                                          ) : (
                                            <button
                                              className="text-blue-600 hover:underline flex items-center bg-transparent border-none p-0 cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(task);
                                              }}
                                              title={`Download ${task.attachment_name}`}
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-3 w-3 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                />
                                              </svg>
                                              {task.attachment_name}
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                }
                              >
                                <div className="flex justify-end mb-2">
                                  <Button
                                    className="w-auto px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transform hover:scale-105 transition-transform duration-200"
                                    onClick={() =>
                                      nav(
                                        `/admin/projects/${projectId}/tasks/${task.id}/subtasks/new`
                                      )
                                    }
                                  >
                                    + Subtask
                                  </Button>
                                </div>
                                {subtasksInStatus.length === 0 ? (
                                  <div className="text-center text-gray-500 p-4">
                                    No subtasks in this status.
                                  </div>
                                ) : (
                                  subtasksInStatus.map((subtask, i) => (
                                    <Draggable
                                      key={subtask.id}
                                      draggableId={String(subtask.id)}
                                      index={i}
                                      isDragDisabled={true}
                                    >
                                      {(prov) => (
                                        <div
                                          ref={prov.innerRef}
                                          {...prov.draggableProps}
                                          {...prov.dragHandleProps}
                                        >
                                          <div className="mb-3 p-3 rounded-xl border shadow-lg bg-white transform hover:scale-105 transition-transform duration-200">
                                            <div className="flex items-center mb-2">
                                              <img
                                                src={`https://ui-avatars.com/api/?name=${subtask.intern_name}&background=random`}
                                                alt={subtask.intern_name}
                                                className="w-8 h-8 rounded-full mr-2"
                                              />
                                              <div>
                                                <div className="font-medium">
                                                  {subtask.title}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  {subtask.intern_name}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="text-xs mt-1">
                                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                                {subtask.work_type || "N/A"}
                                              </span>
                                              <br />
                                              Due Date:{" "}
                                              {new Date(
                                                subtask.due_date
                                              ).toLocaleDateString() || "-"}
                                            </div>
                                            <div className="text-xs mt-1">
                                              Labels:{" "}
                                              {(subtask.labels || []).join(
                                                ", "
                                              )}
                                            </div>
                                            {subtask.status === "Done" && (
                                              <div className="mt-2 flex justify-between items-center">
                                                {!subtask.rating ? (
                                                  <Button
                                                    className="w-auto px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-xs"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      openRatePopup(subtask.id);
                                                    }}
                                                  >
                                                    ⭐ Rate
                                                  </Button>
                                                ) : (
                                                  <span className="text-xs">
                                                    Rating: ⭐ {subtask.rating}
                                                    /10
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))
                                )}
                              </Card>
                            </div>
                          );
                        });
                      })()}{" "}
                      {/* <-- SYNTAX ERROR FIXED HERE */}
                      {!tasks.some((task) =>
                        task.subtasks.some((st) => st.status === status)
                      ) &&
                        status === "In Progress" && (
                          <div className="text-center text-gray-500 p-4">
                            No tasks with subtasks in this status.
                          </div>
                        )}
                      {provided.placeholder}
                    </div>
                  </Card>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Rating Popup */}
      {rateModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Rate Subtask</h3>
            <select
              className="border p-2 rounded w-full mb-4"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <Button
                className="px-4 py-2 bg-red-600 hover:bg-red-700"
                onClick={() => setRateModal({ open: false, subtaskId: null })}
              >
                Cancel
              </Button>
              <Button
                className="px-4 py-2 bg-green-600 hover:bg-green-700"
                onClick={handleSaveRating}
              >
                Rate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
