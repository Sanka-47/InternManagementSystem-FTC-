import { useState, useRef, useEffect } from "react";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { listAllMentor, listAllAdmin } from "../services/intern";
import { fetchChatHistory, sendMessageToApi } from "../services/message";
import api from "../services/api";


export default function ChatPageForIntern() {
  document.title = "FCT | Intern Chat";
  const [admins, setAdmins] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const { user, role } = useAuth();

  // 🔹 Auto scroll to bottom when chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const adminsData = await listAllAdmin();
        setAdmins(adminsData);
        const mentorsData = await listAllMentor();
        setMentors(mentorsData);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setChatHistory([]);
      return;
    }
    async function fetchMessages() {
      try {
        const messages = await fetchChatHistory(
          user.id,
          role.toLowerCase(),
          selectedUser.id.split("-")[1],
          selectedUser.role.toLowerCase()
        );
        setChatHistory(messages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setChatHistory([]);
      }
    }
    fetchMessages();
  }, [selectedUser, user.id, role]);

  const handleSend = async () => {
    if (!selectedUser || (!message.trim() && !file)) return;

    const payload = {
      receiver_id: selectedUser.id.split("-")[1],
      receiver_role: selectedUser.role.toLowerCase(),
      text: message,
      file: file || null,
    };

    try {
      const res = await sendMessageToApi(payload);
      setChatHistory((prev) => [...prev, res.newMessage]);
      setMessage("");
      setFile(null);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">Future Code Technology - Intern Chat</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>
      <div className="flex h-screen p-4 gap-4">
        <div className="w-1/4 border-r p-2 overflow-y-auto">
          <h2 className="font-semibold mb-2">Select User</h2>
          <h3 className="text-[11px] uppercase tracking-wide text-gray-400 mt-3 mb-1">Admins</h3>
          {admins.length === 0 && <div className="text-gray-500">Loading admins...</div>}
          {admins.map((admin) => (
            <div
              key={`admin-${admin.id}`}
              className={`p-2 cursor-pointer rounded text-sm ${
                selectedUser?.id === `admin-${admin.id}` ? "bg-indigo-100 text-indigo-700 font-semibold" : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedUser({ id: `admin-${admin.id}`, name: admin.username, role: "Admin" })}
            >
              {admin.username}
            </div>
          ))}
          <h3 className="text-[11px] uppercase tracking-wide text-gray-400 mt-3 mb-1">Mentors</h3>
          {mentors.length === 0 && <div className="text-gray-500">Loading mentors...</div>}
          {mentors.map((mentor) => (
            <div
              key={`mentor-${mentor.id}`}
              className={`p-2 cursor-pointer rounded text-sm ${
                selectedUser?.id === `mentor-${mentor.id}` ? "bg-indigo-100 text-indigo-700 font-semibold" : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedUser({ id: `mentor-${mentor.id}`, name: mentor.username, role: "Mentor" })}
            >
              {mentor.username}
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <h2 className="font-semibold mb-2">
            Chat with: {selectedUser ? selectedUser.name : "Select a user"}
          </h2>
          <div className="flex-1 overflow-y-auto border p-2 mb-2 flex flex-col gap-2">
            {chatHistory.length === 0 && (
              <div className="text-gray-400 text-center mt-4">No messages yet.</div>
            )}

            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-2 rounded max-w-xs break-words ${
                    msg.sender_id === user.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text && <div>{msg.text}</div>}

                  {msg.file_name && (
                    <div>
                      <a
                        href={`${api.defaults.baseURL}${msg.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-sm"
                      >
                        {msg.file_name}
                      </a>
                    </div>
                  )}

                  <div className="text-[10px] text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              className="flex-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!selectedUser}
            />
            <button
              type="button"
              className="p-2 rounded hover:bg-indigo-200"
              onClick={() => fileInputRef.current.click()}
              disabled={!selectedUser}
            >
              📎
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Button
              className="bg-blue-500 text-white px-4 rounded disabled:opacity-50"
              onClick={handleSend}
              disabled={!selectedUser || (!message.trim() && !file)}
            >
              Send
            </Button>
          </div>
          {file && (
            <div className="text-gray-700 text-sm mt-1">
              Selected file: {file.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
