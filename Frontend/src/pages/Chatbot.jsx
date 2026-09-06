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
            text,
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
            // Build conversation history from previous messages
            const conversationHistory = messages.map(
                (message) => ({
                    role: message.role,
                    content: message.text,
                })
            );

            const data = await sendChatMessage(
                text,
                currentLocation,
                conversationHistory
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">
                    WeatherGPT
                </h1>

                <p className="text-sm text-ink-400 mt-1">
                    Your AI weather assistant
                </p>
            </div>

            {/* Chat container */}
            <div className="bg-white rounded-xl3 shadow-card overflow-hidden">

                {/* Messages */}
                <div className="h-[520px] overflow-y-auto px-4 sm:px-7 py-6">

                    <div className="space-y-7">

                        {messages.map((message) => {
                            const isUser =
                                message.role === "user";

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
                                        <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-1">
                                            <Bot size={18} />
                                        </div>
                                    )}

                                    {/* User message */}
                                    {isUser ? (
                                        <>
                                            <div className="max-w-[75%]">
                                                <div className="px-4 py-3 rounded-2xl rounded-br-md bg-sky-500 text-white text-sm leading-6">
                                                    {message.text}
                                                </div>
                                            </div>

                                            <div className="w-9 h-9 rounded-full bg-ink-100 text-ink-600 flex items-center justify-center shrink-0 mt-1">
                                                <User size={18} />
                                            </div>
                                        </>
                                    ) : (

                                        /* Assistant message */
                                        <div className="max-w-[88%] sm:max-w-[82%] text-ink-700 text-sm leading-6">

                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => (
                                                        <p className="mb-4 last:mb-0">
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

                                                    ol: ({ children }) => (
                                                        <ol className="space-y-4 my-4 pl-6 list-decimal marker:font-semibold marker:text-sky-600">
                                                            {children}
                                                        </ol>
                                                    ),

                                                    ul: ({ children }) => (
                                                        <ul className="space-y-2 my-4 pl-6 list-disc marker:text-sky-500">
                                                            {children}
                                                        </ul>
                                                    ),

                                                    li: ({ children }) => (
                                                        <li className="pl-1 leading-6">
                                                            {children}
                                                        </li>
                                                    ),

                                                    h1: ({ children }) => (
                                                        <h1 className="text-xl font-bold text-ink-900 mt-5 mb-3">
                                                            {children}
                                                        </h1>
                                                    ),

                                                    h2: ({ children }) => (
                                                        <h2 className="text-lg font-bold text-ink-900 mt-5 mb-3">
                                                            {children}
                                                        </h2>
                                                    ),

                                                    h3: ({ children }) => (
                                                        <h3 className="text-base font-bold text-ink-900 mt-4 mb-2">
                                                            {children}
                                                        </h3>
                                                    ),

                                                    blockquote: ({ children }) => (
                                                        <blockquote className="border-l-4 border-sky-300 pl-4 my-4 text-ink-500 italic">
                                                            {children}
                                                        </blockquote>
                                                    ),

                                                    hr: () => (
                                                        <hr className="my-5 border-ink-100" />
                                                    ),

                                                    code: ({ children }) => (
                                                        <code className="px-1.5 py-0.5 rounded-md bg-ink-100 text-ink-800 text-xs">
                                                            {children}
                                                        </code>
                                                    ),

                                                    a: ({
                                                        children,
                                                        href,
                                                    }) => (
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

                                        </div>
                                    )}

                                </div>
                            );
                        })}

                        {/* Loading */}
                        {loading && (
                            <div className="flex gap-3 justify-start">

                                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-1">
                                    <Bot size={18} />
                                </div>

                                <div className="flex items-center gap-1.5 pt-3">
                                    <span className="w-2 h-2 rounded-full bg-ink-300 animate-bounce" />

                                    <span
                                        className="w-2 h-2 rounded-full bg-ink-300 animate-bounce"
                                        style={{
                                            animationDelay:
                                                "120ms",
                                        }}
                                    />

                                    <span
                                        className="w-2 h-2 rounded-full bg-ink-300 animate-bounce"
                                        style={{
                                            animationDelay:
                                                "240ms",
                                        }}
                                    />
                                </div>

                            </div>
                        )}

                    </div>
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
                            className="flex-1 px-4 py-3 rounded-xl bg-sky-50 border border-sky-100 outline-none text-sm text-ink-800 placeholder:text-ink-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-100 disabled:opacity-60"
                        />

                        <button
                            onClick={handleSend}
                            disabled={
                                !input.trim() || loading
                            }
                            className="w-11 h-11 rounded-xl bg-sky-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-sky-600 transition-colors shrink-0"
                        >
                            <Send size={18} />
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
}