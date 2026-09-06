import { useState } from "react";
import { Send, Bot, User } from "lucide-react";

export default function Chatbot() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: "assistant",
            text: "Hi! I'm WeatherGPT 🌤️ Ask me anything!",
        },
    ]);

    const [input, setInput] = useState("");

    function handleSend() {
        const text = input.trim();

        if (!text) return;

        const userMessage = {
            id: Date.now(),
            role: "user",
            text,
        };

        setMessages((previous) => [...previous, userMessage]);
        setInput("");
    }

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            handleSend();
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10">
            <div className="mb-5">
                <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">
                    WeatherGPT
                </h1>

                <p className="text-sm text-ink-400 mt-0.5">
                    Your AI weather assistant
                </p>
            </div>

            <div className="bg-white rounded-xl3 shadow-card overflow-hidden">
                <div className="h-[500px] overflow-y-auto p-4 sm:p-6 space-y-4">
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
                                {!isUser && (
                                    <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                                        <Bot size={18} />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                                        isUser
                                            ? "bg-sky-500 text-white rounded-br-md"
                                            : "bg-sky-50 text-ink-700 rounded-bl-md"
                                    }`}
                                >
                                    {message.text}
                                </div>

                                {isUser && (
                                    <div className="w-9 h-9 rounded-full bg-ink-100 text-ink-600 flex items-center justify-center shrink-0">
                                        <User size={18} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="border-t border-ink-100 p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask WeatherGPT..."
                            className="flex-1 px-4 py-3 rounded-xl bg-sky-50 border border-sky-100 outline-none text-sm text-ink-800 placeholder:text-ink-400 focus:border-sky-300"
                        />

                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
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