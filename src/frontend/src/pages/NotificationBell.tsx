import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:5000/notifications/user/${userInfo._id}`);
      const data: Notification[] = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (err) {
      console.error("Lỗi khi tải thông báo", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Gọi API đánh dấu đã đọc
  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/notifications/read/${id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev: Notification[]) =>
          prev.map((n: Notification) =>
            n._id === id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } catch (err) {
      console.error("Lỗi khi đánh dấu đã đọc", err);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpandedId = expandedId === id ? null : id;
    setExpandedId(newExpandedId);

    // Nếu mở chi tiết và thông báo chưa đọc thì đánh dấu đã đọc
    if (newExpandedId) {
      const notif = notifications.find((n) => n._id === id);
      if (notif && !notif.isRead) {
        markAsRead(id);
      }
    }
  };

  return (
    <div className="relative font-sans">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative rounded-full p-2 hover:bg-gray-100/30 focus:outline-none focus:ring-2 focus:ring-gray-500/40 transition"
        aria-label="Thông báo"
      >
        <Bell size={26} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-lg">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-96 max-h-[360px] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-500/30 p-5 z-50 ">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-500/30 pb-2">
            Thông báo
          </h3>

          {notifications.length === 0 ? (
            <p className="text-center text-gray-400 py-16 select-none">Không có thông báo</p>
          ) : (
            <ul className="space-y-4">
              {notifications.map((n) => {
                const isExpanded = expandedId === n._id;
                return (
                  <li
                    key={n._id}
                    onClick={() => toggleExpand(n._id)}
                    className={`p-4 rounded-lg cursor-pointer transition duration-200 ${
                      n.isRead
                        ? "bg-gray-50 hover:bg-gray-100"
                        : "bg-green-50 hover:bg-green-100 border border-green-300"
                    } shadow-sm select-none`}
                    title="Click để xem chi tiết"
                  >
                    <p
                      className={`text-sm font-medium ${
                        n.isRead ? "text-gray-900" : "text-green-700"
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="mt-1 text-gray-600 text-xs line-clamp-1">
                      {n.content}
                    </p>
                    <p className="mt-2 text-gray-400 text-[11px] select-none">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>

                    {isExpanded && (
                      <div className="mt-3 text-gray-700 text-sm leading-relaxed border-t border-gray-500/30 pt-3">
                        {n.content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
