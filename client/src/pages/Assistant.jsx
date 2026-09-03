import { Bot, Copy, Plus, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import request from "../services/api.js";

const welcome = {
  role: "assistant",
  content:
    "Hi — I’m your developer learning assistant. Ask me anything...",
};

const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1200);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <pre>
      <button type="button" onClick={copy}>
        {copied ? "Copied" : <Copy size={14} />}
      </button>

      <code>{code}</code>
    </pre>
  );
};

const renderMessage = (content) => {
  if (!content) return null;

  return content
    .split(/(```[\s\S]*?```)/g)
    .map((part, index) => {
      if (part.startsWith("```")) {
        return (
          <CodeBlock
            key={index}
            code={part
              .replace(/^```[^\n]*\n?/, "")
              .replace(/```$/, "")}
          />
        );
      }

      return <span key={index}>{part}</span>;
    });
};

export default function Assistant() {
  const { isAuthenticated } = useAuth();

  const [messages, setMessages] = useState([welcome]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const end = useRef(null);

  // Scroll to the latest message
  useEffect(() => {
    if (end.current) {
      end.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, loading]);

  const clear = () => {
    setMessages([welcome]);
    setText("");
    setLoading(false);
  };

  const send = async (event) => {
    event.preventDefault();

    if (!text.trim() || loading) return;

    const message = text.trim();

    setText("");

    // Add user's message
    setMessages((items) => [
      ...items,
      {
        role: "user",
        content: message,
      },
    ]);

    // Check authentication
    if (!isAuthenticated) {
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          content: "Please login to use the connected AI assistant.",
        },
      ]);

      return;
    }

    setLoading(true);

    try {
      const data = await request("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          history: messages.slice(-8),
        }),
      });

      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          content:
            data?.reply || "I couldn't generate a response. Please try again.",
        },
      ]);
    } catch (error) {
      console.error("AI assistant error:", error);

      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          content:
            "Sorry, " +
            (error?.message || "something went wrong. Please try again."),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const keyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <section className="assistant-page">
      <header className="assistant-heading">
        <div>
          <span className="eyebrow">AI learning companion</span>

          <h1>Ask. Understand. Build.</h1>

          <p>
            Developer-focused help, with your key safely kept on the server.
          </p>
        </div>

        <button
          type="button"
          className="btn ghost"
          onClick={clear}
        >
          <Plus size={16} />
          New chat
        </button>
      </header>

      <div className="chat panel">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <article
              className={`message ${message.role}`}
              key={index}
            >
              {message.role === "assistant" && <Bot size={18} />}

              <div>{renderMessage(message.content)}</div>
            </article>
          ))}

          {loading && (
            <article className="message assistant">
              <Bot size={18} />

              <div className="thinking">
                <i />
                <i />
                <i />
              </div>
            </article>
          )}

          <div ref={end} />
        </div>

        <form
          onSubmit={send}
          className="chat-input"
        >
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={keyDown}
            placeholder="write your message here..."
            aria-label="Message AI assistant"
            disabled={loading}
          />

          <button
            type="submit"
            className="btn primary"
            disabled={loading || !text.trim()}
          >
            <Send size={16} />
            {loading ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </section>
  );
}