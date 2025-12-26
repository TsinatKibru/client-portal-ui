"use client";

import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import api from "@/lib/api";
import { MessageSquare, Send, Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
}

export function CommentSection({ projectId }: { projectId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        console.log("Pusher Key:", process.env.NEXT_PUBLIC_PUSHER_KEY);
        const userStr = localStorage.getItem("user");
        if (userStr) setUser(JSON.parse(userStr));

        const fetchComments = async () => {
            try {
                const res = await api.get(`/comments/project/${projectId}`);
                setComments(res.data);
            } catch (err) {
                console.error("Failed to fetch comments", err);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();

        // Pusher Setup
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const channel = pusher.subscribe(`project-${projectId}`);
        channel.bind("comment.added", (data: Comment) => {
            setComments((prev) => {
                // Avoid duplicates if the sender also added it optimisticallly
                if (prev.find(c => c.id === data.id)) return prev;
                return [...prev, data];
            });
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [projectId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || sending) return;

        setSending(true);
        try {
            const res = await api.post("/comments", {
                projectId,
                content: newComment,
            });
            // Re-fetch or add manually if Pusher doesn't catch it immediately for the sender
            setComments(prev => [...prev.filter(c => c.id !== res.data.id), res.data]);
            setNewComment("");
        } catch (err) {
            toast.error("Failed to send comment");
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[500px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600" style={{ color: 'var(--brand-primary)', backgroundColor: 'var(--brand-soft)' }}>
                    <MessageSquare size={20} />
                </div>
                <h3 className="font-bold text-slate-900">Project Discussion</h3>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {comments.map((comment) => (
                    <div key={comment.id} className={`flex flex-col ${comment.user.id === user?.id ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${comment.user.id === user?.id
                            ? "bg-slate-900 text-white rounded-tr-none"
                            : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                            }`}>
                            <p className="text-sm leading-relaxed">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 px-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                {comment.user.email.split('@')[0]} • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-20">
                        <MessageSquare size={40} className="opacity-20" />
                        <p className="text-sm italic">No messages yet. Start the conversation!</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all text-sm"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                />
                <button
                    type="submit"
                    disabled={!newComment.trim() || sending}
                    className="p-2.5 text-white rounded-xl transition-all disabled:opacity-50 hover:brightness-110 shadow-lg shadow-indigo-100"
                    style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 4px 6px -1px var(--brand-soft)' }}
                >
                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
            </form>
        </div>
    );
}
