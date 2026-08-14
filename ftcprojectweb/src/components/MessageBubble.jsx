export default function MessageBubble({ message, currentUser }) {
  const isMine = message.sender_id === currentUser.id && message.sender_role === currentUser.role;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`p-3 rounded-xl max-w-xs ${isMine ? " bg-gray-200 text-gray-800" : "bg-indigo-200 text-gray-800"}`}>
        {/* Sender's name */}
        <strong>{message.to?.name || "Unknown"}</strong>
        <div>
          {/* Message text */}
          {message.text || message.message}
        </div>
        {/* File link if present */}
        {(message.file || message.file_path) && (
          <div>
            <a
              href={message.file_path || message.file}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 underline text-sm"
              download
            >
              {message.fileName || "Download File"}
            </a>
          </div>
        )}
        {/* Timestamp */}
        <div className="text-gray-500 text-xs mt-1">{message.timestamp}</div>
      </div>
    </div>
  );
}
