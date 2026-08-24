import Editor from "@monaco-editor/react";
import {
  Check,
  Copy,
  Download,
  Expand,
  Play,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import request from "../services/api.js";

const initial = {
  html: "<main>\n  <h1>Hello, builder!</h1>\n  <p>Make something delightful.</p>\n</main>",
  css: "body { font-family: system-ui; padding: 2rem; color: #0f172a; }\nh1 { color: #0284c7; }",
  javascript: 'console.log("Ready to build");',
};
const languages = [
  { id: "web", label: "HTML / CSS / JS" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "ruby", label: "Ruby" },
  { id: "php", label: "PHP" },
  { id: "kotlin", label: "Kotlin" },
  { id: "swift", label: "Swift" },
  { id: "dart", label: "Dart" },
  { id: "r", label: "R" },
  { id: "scala", label: "Scala" },
  { id: "shell", label: "Bash / Shell" },
  { id: "sql", label: "SQL" },
  { id: "lua", label: "Lua" },
  { id: "perl", label: "Perl" },
  { id: "haskell", label: "Haskell" },
];
const editorLanguage = {
  html: "html",
  css: "css",
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  c: "c",
  cpp: "cpp",
  java: "java",
  csharp: "csharp",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "php",
  kotlin: "kotlin",
  swift: "swift",
  dart: "dart",
  r: "r",
  scala: "scala",
  shell: "shell",
  sql: "sql",
  lua: "lua",
  perl: "perl",
  haskell: "haskell",
};
const demos = {
  javascript:
    "const numbers = [1, 2, 3, 4, 5];\nconsole.log(numbers);\nconsole.log(numbers.reduce((sum, value) => sum + value, 0));",
  typescript:
    'interface User { name: string; age: number; }\nconst user: User = { name: "Vishant", age: 20 };\nconsole.log(user.name + " is " + user.age);',
  python:
    'name = "Vishant"\nfor i in range(5):\n    print(f"Hello {name} - {i}")',
  c: '#include <stdio.h>\n\nint main(void) {\n  printf("Hello from C!\\n");\n  return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello from C++!" << endl;\n  return 0;\n}',
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java!");\n  }\n}',
  csharp:
    'using System;\n\nclass MainClass {\n  static void Main() {\n    Console.WriteLine("Hello from C#!");\n  }\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello from Go!")\n}',
  rust: 'fn main() {\n  println!("Hello from Rust!");\n}',
  ruby: 'puts "Hello from Ruby!"',
  php: '<?php\necho "Hello from PHP!\\n";',
  kotlin: 'fun main() {\n  println("Hello from Kotlin!")\n}',
  swift: 'print("Hello from Swift!")',
  dart: 'void main() {\n  print("Hello from Dart!");\n}',
  r: 'print("Hello from R!")',
  scala: 'object Main extends App {\n  println("Hello from Scala!")\n}',
  shell: '#!/usr/bin/env bash\necho "Hello from Bash!"',
  sql: 'CREATE TABLE students (name TEXT, score INTEGER);\nINSERT INTO students VALUES ("Vishant", 100);\nSELECT * FROM students;',
  lua: 'print("Hello from Lua!")',
  perl: 'print "Hello from Perl!\\n";',
  haskell: 'main :: IO ()\nmain = putStrLn "Hello from Haskell!"',
};

export default function Playground() {
  const { isAuthenticated } = useAuth();
  const [code, setCode] = useState(initial);
  const [language, setLanguage] = useState("web");
  const [file, setFile] = useState("html");
  const [singleCode, setSingleCode] = useState("");
  const [title, setTitle] = useState("Untitled playground");
  const [projectId, setProjectId] = useState(null);
  const [saved, setSaved] = useState([]);
  const [runVersion, setRunVersion] = useState(0);
  const [consoleLines, setConsoleLines] = useState([
    { type: "info", text: "Ready. Press Run to update the preview." },
  ]);
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [livePreview, setLivePreview] = useState(false);
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const shellRef = useRef(null);
  const isWeb = language === "web";
  const currentCode = isWeb ? code[file] : singleCode;
  const srcDoc = useMemo(() => {
    const bridge =
      '<script>const send=(type,args)=>parent.postMessage({source:"vk-playground",type,text:args.map(a=>typeof a==="string"?a:JSON.stringify(a)).join(" ")},"*");["log","info","warn","error"].forEach(type=>{const original=console[type];console[type]=(...args)=>{send(type,args);original(...args)}});window.onerror=(message)=>send("error",[message]);<\\/script>';
    const userScript = code.javascript.replace(/<\/script/gi, "<\\/script");
    return (
      "<!doctype html><html><head><style>" +
      code.css +
      "</style></head><body>" +
      code.html +
      bridge +
      "<script>" +
      userScript +
      "<\\/script></body></html>"
    );
  }, [code]);
  useEffect(() => {
    if (!isAuthenticated) {
      setSaved([]);
      return;
    }
    request("/playground/my")
      .then(setSaved)
      .catch(() => setSaved([]));
  }, [isAuthenticated]);
  useEffect(() => {
    const listener = (event) => {
      if (event.data?.source === "vk-playground")
        setConsoleLines((lines) => [
          ...lines,
          { type: event.data.type, text: event.data.text },
        ]);
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);
  useEffect(() => {
    localStorage.setItem(
      "playground_draft",
      JSON.stringify({ code, language, file, singleCode, title, stdin }),
    );
  }, [code, language, file, singleCode, title, stdin]);
  useEffect(() => {
    const draft = localStorage.getItem("playground_draft");
    if (!draft) return;
    try {
      const value = JSON.parse(draft);
      if (value.code) setCode(value.code);
      if (value.language) setLanguage(value.language);
      if (value.file) setFile(value.file);
      setSingleCode(value.singleCode || "");
      setTitle(value.title || "Untitled playground");
      setStdin(value.stdin || "");
    } catch {
      localStorage.removeItem("playground_draft");
    }
  }, []);
  useEffect(() => {
    const shortcut = (event) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key === "Enter") {
        event.preventDefault();
        run();
      }
      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        save();
      }
      if (event.key.toLowerCase() === "k") {
        event.preventDefault();
        setConsoleLines([]);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  });
  useEffect(() => {
    if (livePreview && isWeb) run();
  }, [code, livePreview]);
  const selectLanguage = (next) => {
    setLanguage(next);
    setFile(next === "web" ? "html" : next);
    setSingleCode(demos[next] || "");
    setProjectId(null);
    setStatus("");
  };
  const run = async () => {
    if (running) return;
    if (isWeb) {
      setConsoleLines([{ type: "info", text: "Preview refreshed." }]);
      setRunVersion((version) => version + 1);
      setStatus("Running in a sandboxed browser preview.");
      return;
    }
    setRunning(true);
    setConsoleLines([
      { type: "info", text: "Compiling and running in the sandbox…" },
    ]);
    setStatus("Running…");
    try {
      const result = await request("/playground/execute", {
        method: "POST",
        body: JSON.stringify({ language, code: singleCode, stdin }),
      });
      const output = [
        result.stdout,
        result.compileOutput,
        result.stderr,
        result.message,
      ].filter(Boolean);
      setConsoleLines(
        output.length
          ? output.map((text) => ({
              type: result.success ? "success" : "error",
              text,
            }))
          : [
              {
                type: result.success ? "success" : "error",
                text: result.success
                  ? "Execution completed with no output."
                  : result.status,
              },
            ],
      );
      setStatus(
        (result.success ? "Success" : result.status || "Execution error") +
          (result.time !== null ? " · " + result.time + " ms" : ""),
      );
    } catch (error) {
      setConsoleLines([{ type: "error", text: error.message }]);
      setStatus("Execution failed.");
    } finally {
      setRunning(false);
    }
  };
  const reset = () => {
    setCode(initial);
    setSingleCode(demos[language] || "");
    setProjectId(null);
    setTitle("Untitled playground");
    setConsoleLines([{ type: "info", text: "Editor reset to the demo." }]);
    setStatus("");
  };
  const save = async () => {
    if (!isAuthenticated)
      return setStatus("Please login to save your playground.");
    const payload = { title, language, code: isWeb ? "" : singleCode, ...code };
    try {
      const result = projectId
        ? await request("/playground/" + projectId, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await request("/playground", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      setProjectId(result._id);
      setSaved((items) => [
        result,
        ...items.filter((item) => item._id !== result._id),
      ]);
      setStatus("Saved to My Playground.");
    } catch (error) {
      setStatus(error.message);
    }
  };
  const openProject = (project) => {
    setProjectId(project._id);
    setTitle(project.title);
    setLanguage(project.language || "web");
    setCode({
      html: project.html || "",
      css: project.css || "",
      javascript: project.javascript || "",
    });
    setSingleCode(project.code || "");
    setFile(
      project.language === "web" || !project.language
        ? "html"
        : project.language,
    );
    setStatus("Opened " + project.title + ".");
  };
  const removeProject = async (id) => {
    try {
      await request("/playground/" + id, { method: "DELETE" });
      setSaved((items) => items.filter((item) => item._id !== id));
      if (projectId === id) setProjectId(null);
      setStatus("Saved project deleted.");
    } catch (error) {
      setStatus(error.message);
    }
  };
  const copy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };
  const download = () => {
    const content = isWeb
      ? "<!doctype html>\n<html><head><style>\n" +
        code.css +
        "\n</style></head><body>\n" +
        code.html +
        "\n<script>\n" +
        code.javascript +
        "\n<\\/script></body></html>"
      : singleCode;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      (title.replace(/[^a-z0-9-_]/gi, "-") || "playground") +
      "." +
      (isWeb ? "html" : language);
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="playground-page">
      <div className="playground-heading">
        <div>
          <span className="eyebrow">Browser playground</span>
          <h1>Build. Run. Learn.</h1>
        </div>
        <span className={"play-status " + (isWeb ? "ready" : "")}>
          {isWeb ? "Browser runtime ready" : "Compiler not configured"}
        </span>
      </div>
      <div className="playground-shell" ref={shellRef}>
        <header className="play-toolbar">
          <div className="play-actions">
            <button className="btn primary" onClick={run} disabled={running}>
              <Play size={16} /> {running ? "Running…" : "Run"}
            </button>
            <button
              className="tool-button"
              onClick={reset}
              title="Reset to demo"
            >
              <RotateCcw size={17} />
            </button>
            <select
              value={language}
              onChange={(event) => selectLanguage(event.target.value)}
              aria-label="Language"
            >
              {languages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-label="Project title"
          />
          <div className="play-actions">
            {isWeb && (
              <label className="live-toggle">
                <input
                  type="checkbox"
                  checked={livePreview}
                  onChange={(event) => setLivePreview(event.target.checked)}
                />{" "}
                Live
              </label>
            )}
            <button className="tool-button" onClick={copy} title="Copy code">
              {copied ? <Check size={17} /> : <Copy size={17} />}
            </button>
            <button className="tool-button" onClick={download} title="Download">
              <Download size={17} />
            </button>
            <button
              className="tool-button"
              onClick={() => shellRef.current?.requestFullscreen?.()}
              title="Full screen"
            >
              <Expand size={17} />
            </button>
            <button className="btn ghost" onClick={save}>
              <Save size={16} /> Save
            </button>
          </div>
        </header>
        <div className="play-body">
          <aside className="file-sidebar">
            <strong>Languages</strong>
            <div className="web-files">
              {["html", "css", "javascript"].map((item) => (
                <button
                  key={item}
                  className={isWeb && file === item ? "selected" : ""}
                  onClick={() => {
                    setLanguage("web");
                    setFile(item);
                  }}
                >
                  {item === "javascript" ? "JavaScript" : item.toUpperCase()}
                </button>
              ))}
            </div>
            <select
              className="language-dropdown"
              value={language}
              onChange={(e) => selectLanguage(e.target.value)}
            >
              {languages
                .filter((item) => item.id !== "web" && item.id !== "javascript")
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
            </select>
            <div className="saved-projects">
              <strong>My playgrounds</strong>
              {isAuthenticated ? (
                saved.length ? (
                  saved.slice(0, 6).map((item) => (
                    <div key={item._id}>
                      <button onClick={() => openProject(item)}>
                        {item.title}
                      </button>
                      <button
                        aria-label={"Delete " + item.title}
                        onClick={() => removeProject(item._id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                ) : (
                  <small>No saved projects yet.</small>
                )
              ) : (
                <small>Login to save projects.</small>
              )}
            </div>
          </aside>
          <div className="editor-panel">
            <div className="panel-label">{isWeb ? file : language}</div>
            <Editor
              height="100%"
              theme="vs-dark"
              language={editorLanguage[isWeb ? file : language] || "plaintext"}
              value={currentCode}
              onChange={(value) =>
                isWeb
                  ? setCode({ ...code, [file]: value || "" })
                  : setSingleCode(value || "")
              }
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                wordWrap: "on",
                padding: { top: 16 },
              }}
            />
          </div>
          <div className="preview-panel">
            <div className="panel-label">
              {isWeb ? "Preview" : "Standard input"}
            </div>
            {isWeb ? (
              <iframe
                key={runVersion}
                title="Playground preview"
                sandbox="allow-scripts"
                srcDoc={srcDoc}
              />
            ) : (
              <textarea
                className="stdin-editor"
                value={stdin}
                onChange={(event) => setStdin(event.target.value)}
                placeholder="Optional standard input…"
              />
            )}
          </div>
        </div>
        <div className="console-panel">
          <div className="panel-label">
            Console <button onClick={() => setConsoleLines([])}>Clear</button>
          </div>
          <div>
            {consoleLines.map((line, index) => (
              <p className={line.type} key={line.text + index}>
                {line.text}
              </p>
            ))}
          </div>
        </div>
      </div>
      {status && <p className="notice">{status}</p>}
    </section>
  );
}
