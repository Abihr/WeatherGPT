import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { Send, Bot, User } from "lucide-react";

import { useApp } from "../context/AppContext";
import { sendChatMessage } from "../services/chatService";

export default function Chatbot() {
    const { user } = useApp();

    const [messages, setMessages] = useState([
        {
            id: 1,
            role: "assistant",
            text: "Hi! I'm WeatherGPT 🌤️ Ask me anything!",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSend() {
        const text = input.trim();

        if (!text || loading) {
            return;
        }

        const userMessage = {
            id: Date.now(),
            role: "user",
            text: text,
        };

        setMessages((previous) => [
            ...previous,
            userMessage,
        ]);

        setInput("");
        setLoading(true);

        const currentLocation = {
            latitude:
                user?.location?.lat ??
                user?.latitude ??
                null,

            longitude:
                user?.location?.lng ??
                user?.longitude ??
                null,
        };

        console.log(
            "📤 CHATBOT SENDING LOCATION:",
            currentLocation
        );

        try {
            const data = await sendChatMessage(
                text,
                currentLocation
            );

            const assistantMessage = {
                id: Date.now() + 1,
                role: "assistant",
                text:
                    data?.reply ||
                    "Sorry, I couldn't generate a response.",
            };

            setMessages((previous) => [
                ...previous,
                assistantMessage,
            ]);
        } catch (error) {
            console.error("Chat error:", error);

            const errorMessage = {
                id: Date.now() + 1,
                role: "assistant",
                text:
                    "Sorry, I couldn't connect to the AI right now.",
            };

            setMessages((previous) => [
                ...previous,
                errorMessage,
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            handleSend();
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10">

            {/* Header */}
            <div className="mb-5">
                <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">
                    WeatherGPT
                </h1>

                <p className="text-sm text-ink-400 mt-0.5">
                    Your AI weather assistant
                </p>
            </div>

            {/* Chat container */}
            <div className="bg-white rounded-xl3 shadow-card overflow-hidden">

                {/* Messages */}
                <div className="h-[500px] overflow-y-auto p-4 sm:p-6 space-y-5">

                    {messages.map((message) => {
                        const isUser = message.role === "user";

                        return (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${
                                    isUser
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >

                                {/* Assistant icon */}
                                {!isUser && (
                                    <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                                        <Bot size={18} />
                                    </div>
                                )}

                                {/* Message */}
                                <div
                                    className={
                                        isUser
                                            ? "max-w-[75%] px-4 py-3 rounded-2xl rounded-br-md text-sm bg-sky-500 text-white"
                                            : "max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md text-sm bg-sky-50 text-ink-700"
                                    }
                                >

                                    {isUser ? (
                                        <div className="whitespace-pre-wrap">
                                            {message.text}
                                        </div>
                                    ) : (
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => (
                                                    <p className="mb-3 last:mb-0 leading-6">
                                                        {children}
                                                    </p>
                                                ),

                                                strong: ({ children }) => (
                                                    <strong className="font-bold text-ink-900">
                                                        {children}
                                                    </strong>
                                                ),

                                                em: ({ children }) => (
                                                    <em className="italic">
                                                        {children}
                                                    </em>
                                                ),

                                                ul: ({ children }) => (
                                                    <ul className="list-disc pl-5 mb-3 space-y-1.5">
                                                        {children}
                                                    </ul>
                                                ),

                                                ol: ({ children }) => (
                                                    <ol className="list-decimal pl-5 mb-3 space-y-2">
                                                        {children}
                                                    </ol>
                                                ),

                                                li: ({ children }) => (
                                                    <li className="pl-1 leading-6">
                                                        {children}
                                                    </li>
                                                ),

                                                h1: ({ children }) => (
                                                    <h1 className="text-lg font-bold text-ink-900 mb-3">
                                                        {children}
                                                    </h1>
                                                ),

                                                h2: ({ children }) => (
                                                    <h2 className="text-base font-bold text-ink-900 mt-4 mb-2">
                                                        {children}
                                                    </h2>
                                                ),

                                                h3: ({ children }) => (
                                                    <h3 className="font-bold text-ink-900 mt-3 mb-1.5">
                                                        {children}
                                                    </h3>
                                                ),

                                                blockquote: ({ children }) => (
                                                    <blockquote className="border-l-4 border-sky-300 pl-4 my-3 italic text-ink-500">
                                                        {children}
                                                    </blockquote>
                                                ),

                                                hr: () => (
                                                    <hr className="my-4 border-ink-100" />
                                                ),

                                                code: ({ children }) => (
                                                    <code className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-800 text-xs">
                                                        {children}
                                                    </code>
                                                ),

                                                a: ({ children, href }) => (
                                                    <a
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sky-600 underline hover:text-sky-700"
                                                    >
                                                        {children}
                                                    </a>
                                                ),
                                            }}
                                        >
                                            {message.text}
                                        </ReactMarkdown>
                                    )}

                                </div>

                                {/* User icon */}
                                {isUser && (
                                    <div className="w-9 h-9 rounded-full bg-ink-100 text-ink-600 flex items-center justify-center shrink-0">
                                        <User size={18} />
                                    </div>
                                )}

                            </div>
                        );
                    })}

                    {/* Loading */}
                    {loading && (
                        <div className="flex gap-3 justify-start">

                            <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                                <Bot size={18} />
                            </div>

                            <div className="bg-sky-50 text-ink-400 px-4 py-3 rounded-2xl rounded-bl-md text-sm">
                                Thinking...
                            </div>

                        </div>
                    )}

                </div>

                {/* Input */}
                <div className="border-t border-ink-100 p-3 sm:p-4">

                    <div className="flex items-center gap-2">

                        <input
                            type="text"
                            value={input}
                            onChange={(event) =>
                                setInput(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="Ask WeatherGPT..."
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-xl bg-sky-50 border border-sky-100 outline-none text-sm text-ink-800 placeholder:text-ink-400 focus:border-sky-300 disabled:opacity-60"
                        />

                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="w-11 h-11 rounded-xl bg-sky-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-sky-600 transition-colors"
                        >
                            <Send size={18} />
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
}