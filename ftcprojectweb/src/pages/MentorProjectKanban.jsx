import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  listTasks,
  listSubtasks,
  createSubtask,
  listInterns,
  rateSubtask,
} from "../services/mentor";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import MultiSelect from "../components/MultiSelect";
import Swal from "sweetalert2";

const statuses = ["In Progress", "In Review", "Done"];

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

export default function MentorProjectKanban() {
  const { projectId } = useParams();
  const nav = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState({});
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [interns, setInterns] = useState([]);
  const [form, setForm] = useState({
    title: "",
    intern_id: "",
    work_type: "",
    labels: [],
    due_date: "",
  });

  // Rating state
  const [rateModal, setRateModal] = useState({ open: false, subtaskId: null });
  const [rating, setRating] = useState(5);

  // (This fetchAttachment function is defined but not currently used)
  // const fetchAttachment = async (taskId) => {
  //   try {
  //     const response = await api.get(`/mentor/tasks/${taskId}/attachment`, {
  //       responseType: "arraybuffer",
  //     });
  //
  //     // Convert array buffer to base64
  //     const base64 = btoa(
  //       new Uint8Array(response.data).reduce(
  //         (data, byte) => data + String.fromCharCode(byte),
  //         ""
  //       )
  //     );
  //
  //     return `data:${response.headers["content-type"]};base64,${base64}`;
  //   } catch (error) {
  //     console.error("Error fetching attachment:", error);
  //     return null;
  //   }
  // };

  // Handle attachment download
  const handleDownload = async (task) => {
    try {
      if (!task.attachment_name || !task.has_attachment) {
        throw new Error("No attachment found for this task");
      }

      // Fetch the attachment data
      const response = await api.get(`/mentor/tasks/${task.id}/attachment`, {
        responseType: "arraybuffer",
      });

      // Convert the response data to base64
      const base64String = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      // Use the existing downloadFile function
      downloadFile(
        base64String,
        task.attachment_name,
        response.headers["content-type"] || task.attachment_mime
      );
    } catch (error) {
      console.error("Download error:", error);
      setError(`Failed to download file: ${error.message}`);
    }
  };
  useEffect(() => {
    const fetchImages = async () => {
      const urls = {};
      const imageTasks = tasks.filter(
        (task) =>
          task.has_attachment &&
          task.attachment_name?.match(/\.(jpg|jpeg|png|gif)$/i)
      );

      await Promise.all(
        imageTasks.map(async (task) => {
          try {
            const response = await api.get(
              `/mentor/tasks/${task.id}/attachment`,
              {
                responseType: "arraybuffer",
              }
            );

            const base64 = btoa(
              new Uint8Array(response.data).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ""
              )
            );

            urls[
              task.id
            ] = `data:${response.headers["content-type"]};base64,${base64}`;
          } catch (error) {
            console.error(`Error loading image for task ${task.id}:`, error);
          }
        })
      );
      setImageUrls(urls);
    };

    if (tasks.length > 0) {
      fetchImages();
    }
  }, [tasks]);

  // Load interns for the project
  useEffect(() => {
    async function loadInterns() {
      try {
        const res = await listInterns(projectId);
        setInterns(res);
      } catch (e) {
        console.error("Failed to load interns:", e);
        setError("Failed to load interns");
      }
    }
    loadInterns();
  }, [projectId]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSubtask = (taskId) => {
    setCurrentTaskId(taskId);
    setShowSubtaskModal(true);
  };

  // Function to handle opening the rate popup
  function openRatePopup(subtaskId) {
    setRateModal({ open: true, subtaskId });
    setRating(5);
  }

  // Function to handle saving the rating
  async function handleSaveRating() {
    try {
      await rateSubtask(rateModal.subtaskId, rating);

      // Refresh the tasks to show the updated rating
      const updatedTasks = await listTasks(projectId);
      const tasksWithSubtasks = await Promise.all(
        updatedTasks.map(async (task) => {
          const subtasks = await listSubtasks(task.id);
          return {
            ...task,
            subtasks: subtasks.map((st) => ({
              ...st,
              status: statuses.includes(st.status) ? st.status : "In Progress",
            })),
          };
        })
      );

      setTasks(tasksWithSubtasks);
      setRateModal({ open: false, subtaskId: null });

      await Swal.fire({
        title: "Success!",
        text: "Rating saved successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (e) {
      console.error("Error saving rating:", e);
      await Swal.fire({
        title: "Error!",
        text: e?.response?.data?.message || "Failed to save rating",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  const handleSubmitSubtask = async (e) => {
    e.preventDefault();
    if (!currentTaskId) return;

    try {
      await createSubtask({
        ...form,
        task_id: Number(currentTaskId),
        intern_id: Number(form.intern_id),
      });

      // Refresh tasks after adding subtask
      const updatedTasks = await listTasks(projectId);
      const tasksWithSubtasks = await Promise.all(
        updatedTasks.map(async (task) => {
          const subtasks = await listSubtasks(task.id);
          return {
            ...task,
            subtasks: subtasks.map((st) => ({
              ...st,
              status: statuses.includes(st.status) ? st.status : "In Progress",
            })),
          };
        })
      );

      setTasks(tasksWithSubtasks);

      await Swal.fire({
        title: "Success!",
        text: "Subtask created successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Reset form and close modal
      setForm({
        title: "",
        intern_id: "",
        work_type: "",
        labels: [],
        due_date: "",
      });
      setShowSubtaskModal(false);
      setCurrentTaskId(null);
    } catch (e) {
      console.error("Error creating subtask:", e);
      await Swal.fire({
        title: "Error!",
        text: e?.response?.data?.message || "Failed to create subtask",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    document.title = `FCT | Project Kanban`;
    const loadData = async () => {
      try {
        setLoading(true);
        // Get tasks for the project
        const tasksData = await listTasks(projectId);

        if (tasksData.length === 0) {
          setProject({ id: projectId, name: "Project" }); // Still set project name if no tasks
          setTasks([]);
          setLoading(false);
          return;
        }

        // Get subtasks for each task
        const tasksWithSubtasks = await Promise.all(
          tasksData.map(async (task) => {
            const subtasks = await listSubtasks(task.id);
            return {
              ...task,
              subtasks: subtasks.map((st) => ({
                ...st,
                // Ensure status is one of our expected values
                status: statuses.includes(st.status)
                  ? st.status
                  : "In Progress",
              })),
            };
          })
        );

        setTasks(tasksWithSubtasks);
        setProject({
          id: projectId,
          name: tasksData[0]?.project_name || "Project",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Subtask Modal */}
      {showSubtaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg w-full max-w-md p-6 overflow-y-auto"
            style={{ maxHeight: "90vh" }}
          >
            <h2 className="text-xl font-bold mb-4">Assign Subtask</h2>
            <form onSubmit={handleSubmitSubtask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtask Title *
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to Intern *
                  </label>
                  <Select
                    value={form.intern_id}
                    onChange={(e) =>
                      handleFormChange("intern_id", e.target.value)
                    }
                    required
                  >
                    <option value="" disabled>
                      Select an intern
                    </option>
                    {interns.map((intern) => (
                      <option key={intern.id} value={intern.id}>
                        {intern.username}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Type *
                  </label>
                  <Select
                    value={form.work_type}
                    onChange={(e) =>
                      handleFormChange("work_type", e.target.value)
                    }
                    required
                  >
                    <option value="" disabled>
                      Select work type
                    </option>
                    <option value="bug">🐛 Bug</option>
                    <option value="task">📝 Task</option>
                    <option value="new feature">✨ New Feature</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Labels
                  </label>
                  <MultiSelect
                    placeholder="Select labels"
                    options={[
                      { value: "ui", label: "🎨 UI" },
                      { value: "backend", label: "☁️ Backend" },
                      { value: "urgent", label: "🔥 Urgent" },
                    ]}
                    selectedOptions={form.labels}
                    onChange={(v) => handleFormChange("labels", v)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={form.due_date}
                    onChange={(e) =>
                      handleFormChange("due_date", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowSubtaskModal(false);
                    setForm({
                      title: "",
                      intern_id: "",
                      work_type: "",
                      labels: [],
                      due_date: "",
                    });
                  }}
                  className="bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Create Subtask
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">
          {project
            ? `${project.name} - Kanban Board`
            : error
            ? "Error loading project name"
            : "Loading..."}
        </h1>
        <div>
          <Button
            onClick={() => nav(`/mentor/projects/${projectId}/tasks/new`)}
            className="bg-green-500 hover:bg-green-600 mr-2 transform hover:scale-105 transition-transform duration-200 shadow-lg text-white font-bold rounded-md"
          >
            + Create Task
          </Button>
          <Button
            onClick={() => nav(-1)}
            className="bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 transition-transform duration-200 shadow-lg text-white font-bold rounded-md"
          >
            Back to Projects
          </Button>
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No tasks found for this project.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map((status) => (
          <div
            key={status}
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
                <div className="text-xl font-bold text-gray-700">{status}</div>
              }
            >
              <div className="min-h-[200px]">
                {(() => {
                  // Show tasks in this status column if they have matching subtasks
                  // OR if they have no subtasks and we're in the 'In Progress' column
                  const tasksInThisStatus = tasks.filter((task) => {
                    const hasMatchingSubtasks = task.subtasks.some(
                      (st) => st.status === status
                    );
                    const hasNoSubtasks = task.subtasks.length === 0;
                    return (
                      hasMatchingSubtasks ||
                      (hasNoSubtasks && status === "In Progress")
                    );
                  });

                  if (tasksInThisStatus.length === 0) {
                    return (
                      <div className="text-center text-gray-500 p-4">
                        {status === "In Progress"
                          ? "No tasks or subtasks"
                          : "No subtasks in this status"}
                      </div>
                    );
                  }

                  return tasksInThisStatus.map((task) => {
                    const subtasksInStatus = task.subtasks.filter(
                      (subtask) => subtask.status === status
                    );

                    // Don't filter out tasks with no subtasks in this status if they have no subtasks at all
                    // and we're in the 'In Progress' column
                    if (
                      task.subtasks.length > 0 &&
                      subtasksInStatus.length === 0
                    ) {
                      return null;
                    }

                    // Show 'No subtasks in this status' for tasks with no subtasks
                    if (task.subtasks.length === 0) {
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
                                </div>
                              </div>
                            }
                          >
                            <div className="flex justify-end mb-2">
                              <Button
                                className="w-auto px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transform hover:scale-105 transition-transform duration-200"
                                onClick={() => handleAddSubtask(task.id)}
                              >
                                + Subtask
                              </Button>
                            </div>
                            <div className="text-center text-gray-500 p-4">
                              No subtasks in this status.
                            </div>
                          </Card>
                        </div>
                      );
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
                                  ? new Date(task.due_date).toLocaleDateString()
                                  : "-"}
                                {task.attachment_name && (
                                  <div className="mt-2">
                                    {task.has_attachment &&
                                    task.attachment_name?.match(
                                      /\.(jpg|jpeg|png|gif)$/i
                                    ) ? (
                                      <div className="relative">
                                        {imageUrls[task.id] ? (
                                          <img
                                            src={imageUrls[task.id]}
                                            alt={task.attachment_name}
                                            className="max-w-full h-auto rounded border border-gray-200"
                                            style={{ maxHeight: "150px" }}
                                            onError={(e) => {
                                              console.error(
                                                "Image load error:",
                                                e
                                              );
                                              e.target.style.display = "none";
                                            }}
                                          />
                                        ) : (
                                          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                                            <span className="text-gray-500 text-sm">
                                              Loading image...
                                            </span>
                                          </div>
                                        )}
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
                          <div className="mb-4">
                            <div className="flex justify-end mb-2">
                              <Button
                                className="w-auto px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transform hover:scale-105 transition-transform duration-200"
                                onClick={() => handleAddSubtask(task.id)}
                              >
                                + Subtask
                              </Button>
                            </div>
                            {subtasksInStatus.map((subtask) => (
                              <div
                                key={subtask.id}
                                className="mb-3 p-3 rounded-xl border shadow-lg bg-white transform hover:scale-105 transition-transform duration-200"
                              >
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
                                      {subtask.intern_name || "Unassigned"}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs mt-1">
                                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                    {subtask.work_type || "N/A"}
                                  </span>
                                  <br />
                                  Due Date:{" "}
                                  {subtask.due_date
                                    ? new Date(
                                        subtask.due_date
                                      ).toLocaleDateString()
                                    : "-"}
                                </div>
                                {subtask.labels &&
                                  subtask.labels.length > 0 && (
                                    <div className="text-xs mt-1">
                                      Labels: {subtask.labels.join(", ")}
                                    </div>
                                  )}
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
                                        Rating: ⭐ {subtask.rating}/10
                                      </span>
                                    )}
                                  </div>
                                )}
                                {/* ERRONEOUS CODE BLOCK REMOVED FROM HERE */}
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>
          </div>
        ))}
      </div>

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
