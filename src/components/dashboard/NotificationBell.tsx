"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import Pusher from "pusher-js";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell({ businessId, userId }: { businessId: string, userId: string }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get("/notifications");
                setNotifications(res.data);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };

        fetchNotifications();

        // Pusher integration
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '640989ada453a4792610', {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
        });

        const channel = pusher.subscribe(`business-${businessId}`);
        channel.bind('new-notification', (data: any) => {
            // Only add if it's for this user
            if (data.userId === userId) {
                setNotifications(prev => [data, ...prev]);
                toast.info(data.message);
            }
        });

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            pusher.unsubscribe(`business-${businessId}`);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [businessId, userId]);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`, {});
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.post("/notifications/read-all", {});
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors relative"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">Notifications</h4>
                        <button
                            onClick={markAllRead}
                            className="text-[10px] font-bold text-blue-600 uppercase hover:underline"
                        >
                            Mark all read
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 flex gap-3 transition-colors ${notification.read ? 'opacity-60' : 'bg-blue-50/30'}`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-900 leading-snug">
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-blue-600 hover:text-blue-800 shrink-0"
                                        title="Mark as read"
                                    >
                                        <CheckCircle size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {notifications.length === 0 && (
                            <div className="p-12 text-center text-slate-400">
                                <p className="text-sm">No notifications yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
