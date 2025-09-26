import { useState, useRef, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import html2pdf from "html2pdf.js";
import { ImageDrop } from "quill-image-drop-module";
import ImageResize from "quill-image-resize-module-react";
import { supabase } from "./supabaseClient";

// Register Quill plugins
Quill.register("modules/imageDrop", ImageDrop);
Quill.register("modules/imageResize", ImageResize);

export default function WordLikeNotesManager() {
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [noteContent, setNoteContent] = useState("");
  const editorRef = useRef<any>(null);

  // Load notes from Supabase on mount
  useEffect(() => {
    const fetchNotes = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotes(data);
      }
    };

    fetchNotes();
  }, []);

  // Save or Update note
  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    if (selectedNote) {
      const { data, error } = await supabase
        .from("notes")
        .update({ content: noteContent })
        .eq("id", selectedNote.id)
        .eq("user_id", session.user.id)
        .select();

      if (!error && data) {
        setNotes((prev) =>
          prev.map((n) => (n.id === selectedNote.id ? data[0] : n))
        );
      }
    } else {
      const { data, error } = await supabase
        .from("notes")
        .insert([{ content: noteContent, user_id: session.user.id }])
        .select();

      if (!error && data) {
        setNotes((prev) => [data[0], ...prev]);
      }
    }

    setSelectedNote(null);
    setNoteContent("");
  };

  // Select note
  const handleSelectNote = (note: any) => {
    setSelectedNote(note);
    setNoteContent(note.content);
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (!error) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setNoteContent("");
      }
    }
  };

  // Export PDF
  const handleExportPDF = () => {
    if (!noteContent.trim()) return;
    const element = document.createElement("div");
    element.innerHTML = noteContent;
    html2pdf().from(element).save("note.pdf");
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image"],
      ["clean"],
    ],
    imageDrop: true,
    imageResize: {
      parchment: Quill.import("parchment"),
      modules: ["Resize", "DisplaySize"],
    },
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "20px",
          width: "1000px",
          height: "600px",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(16px)",
          borderRadius: "20px",
          padding: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          color: "#fff",
        }}
      >
        {/* Notes List */}
        <div
          style={{
            width: "250px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "14px",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden",
          }}
        >
          <h3 style={{ margin: 0, fontWeight: 500 }}>📒 Notes</h3>
          <button
            onClick={() => {
              setSelectedNote(null);
              setNoteContent("");
            }}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: "#4CAF50",
              color: "#fff",
              fontWeight: 500,
              transition: "0.2s",
            }}
          >
            + New Note
          </button>
          <div
            style={{
              flexGrow: 1,
              overflowY: "auto",
              marginTop: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              scrollbarWidth: "thin",
            }}
          >
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note)}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  background:
                    selectedNote?.id === note.id
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  transition: "0.2s",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {note.content.replace(/<[^>]+>/g, "").slice(0, 28) ||
                  "Untitled…"}
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div
          style={{
            flexGrow: 1,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "14px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h3 style={{ margin: 0, fontWeight: 500 }}>
            {selectedNote ? "✏️ Edit Note" : "📝 New Note"}
          </h3>
          <div
            style={{
              flexGrow: 1,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <ReactQuill
              ref={editorRef}
              theme="snow"
              value={noteContent}
              onChange={setNoteContent}
              modules={modules}
              style={{
                height: "100%",
                border: "none",
              }}
            />
          </div>
          <style>
            {`
              .ql-container {
                border: none !important;
              }
              .ql-toolbar {
                border: none !important;
              }
              .ql-editor {
                border: none !important;
                outline: none !important;
                min-height: 300px;
                color: black !important;
              }
            `}
          </style>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={handleSaveNote}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: "#4CAF50",
                color: "#fff",
                fontWeight: 500,
                transition: "0.2s",
              }}
            >
              {selectedNote ? "💾 Save" : "➕ Add"}
            </button>
            {selectedNote && (
              <button
                onClick={() => handleDeleteNote(selectedNote.id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  background: "#F44336",
                  color: "#fff",
                  fontWeight: 500,
                  transition: "0.2s",
                }}
              >
                🗑️ Delete
              </button>
            )}
            <button
              onClick={handleExportPDF}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: "#2196F3",
                color: "#fff",
                fontWeight: 500,
                transition: "0.2s",
              }}
            >
              📄 Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
