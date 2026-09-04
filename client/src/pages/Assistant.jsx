import { Bot, Plus, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CodeBlock from "../components/notes/CodeBlock.jsx";
import { normalizeLanguage } from "../components/notes/blockTypes.js";
import { renderInlineMarkdown as renderInline } from "../components/notes/inlineMarkdown.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import request, { absoluteAsset } from "../services/api.js";
import "../styles/notes-blocks.css";

const now = () => new Date().toISOString();

const welcome = {
  role: "assistant",
  content:
    "Hi — I’m your developer learning assistant. Ask me about React, JavaScript, Node.js, MongoDB, debugging, or paste code to examine.",
  time: now(),
};

// Turns a plain-text segment into paragraphs / bullet lists / numbered
// lists / light headings, applying inline formatting along the way.
const renderTextSegment = (text, segmentKey) => {
  const lines = text.split("\n");
  const nodes = [];
  let listBuffer = [];
  let listType = null;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    nodes.push(
      <Tag key={`${segmentKey}-list-${nodes.length}`} className="message-list">
        {listBuffer.map((item, index) => (
          <li key={index}>{renderInline(item, `${segmentKey}-li-${nodes.length}-${index}`)}</li>
        ))}
      </Tag>
    );
    listBuffer = [];
    listType = null;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.*)/);
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.*)/);
    const headingMatch = trimmed.match(/^#{1,4}\s+(.*)/);

    if (bulletMatch) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuffer.push(bulletMatch[1]);
      return;
    }

    if (numberedMatch) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuffer.push(numberedMatch[1]);
      return;
    }

    flushList();

    if (headingMatch) {
      nodes.push(
        <p key={`${segmentKey}-h-${index}`} className="message-heading">
          {renderInline(headingMatch[1], `${segmentKey}-h-${index}`)}
        </p>
      );
      return;
    }

    nodes.push(<p key={`${segmentKey}-p-${index}`}>{renderInline(trimmed, `${segmentKey}-p-${index}`)}</p>);
  });

  flushList();
  return nodes;
};

const renderMessage = (content) => {
  if (!content) return null;

  return content
    .split(/(```[\s\S]*?```)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("```")) {
        const fenceMatch = part.match(/^```([^\n]*)\n?([\s\S]*?)```$/);
        const language = normalizeLanguage(fenceMatch?.[1]);
        const code = (fenceMatch?.[2] ?? part.replace(/^```[^\n]*\n?/, "").replace(/```$/, "")).replace(/\n$/, "");
        return <CodeBlock key={index} language={language} content={code} />;
      }
      return (
        <div className="message-text" key={index}>
          {renderTextSegment(part, `seg-${index}`)}
        </div>
      );
    });
};

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

export default function Assistant() {
  const { isAuthenticated, user } = useAuth();

  const [messages, setMessages] = useState([welcome]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const end = useRef(null);

  useEffect(() => {
    if (end.current) {
      end.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, loading]);

  const clear = () => {
    setMessages([{ ...welcome, time: now() }]);
    setText("");
    setLoading(false);
  };

  const send = async (event) => {
    event.preventDefault();
    if (!text.trim() || loading) return;

    const message = text.trim();
    setText("");

    setMessages((items) => [...items, { role: "user", content: message, time: now() }]);

    if (!isAuthenticated) {
      setMessages((items) => [
        ...items,
        { role: "assistant", content: "Please login to use the connected AI assistant.", time: now() },
      ]);
      return;
    }

    setLoading(true);

    try {
      const data = await request("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message, history: messages.slice(-8) }),
      });

      setMessages((items) => [
        ...items,
        { role: "assistant", content: data?.reply || "I couldn't generate a response. Please try again.", time: now() },
      ]);
    } catch (error) {
      setMessages((items) => [
        ...items,
        { role: "assistant", content: "Sorry, " + (error?.message || "something went wrong. Please try again."), time: now() },
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
          <p>Developer-focused help, with your key safely kept on the server.</p>
        </div>

        <button type="button" className="btn ghost" onClick={clear}>
          <Plus size={16} /> New chat
        </button>
      </header>

      <div className="chat panel">
        <div className="chat-messages">
          {messages.map((message, index) => {
            const hasCode = message.content?.includes("```");
            return (
              <article className={`message ${message.role}${hasCode ? " has-code" : ""}`} key={index}>
                <span className="message-avatar" aria-hidden="true">
                  {message.role === "assistant" ? (
                    <Bot size={16} />
                  ) : user?.avatar?.url ? (
                    <img src={absoluteAsset(user.avatar.url)} alt="" />
                  ) : (
                    <User size={16} />
                  )}
                </span>
                <div className="message-body">
                  {renderMessage(message.content)}
                  {message.time && <span className="message-time">{formatTime(message.time)}</span>}
                </div>
              </article>
            );
          })}

          {loading && (
            <article className="message assistant">
              <span className="message-avatar" aria-hidden="true">
                <Bot size={16} />
              </span>
              <div className="message-body">
                <div className="thinking">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </article>
          )}

          <div ref={end} />
        </div>

        <form onSubmit={send} className="chat-input">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={keyDown}
            placeholder="Ask about React, JavaScript, MongoDB, or paste code…"
            aria-label="Message AI assistant"
            disabled={loading}
          />
          <button type="submit" className="btn primary" disabled={loading || !text.trim()}>
            <Send size={16} /> {loading ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </section>
  );
}
