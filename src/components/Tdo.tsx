import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient"; // make sure supabaseClient is configured

// Types
interface Task {
  id: number;
  text: string;
  due_date: string;
  completed: boolean;
  color: string;
}

interface Category {
  id: number;
  title: string;
  tasks: Task[];
}

interface EditingTask {
  catId: number;
  taskId: number;
}

export default function GlassTodoBoard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [addingTaskCat, setAddingTaskCat] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskColor, setNewTaskColor] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState<number | null>(null);

  const colors = ["#F44336", "#FF9800", "#FFEB3B", "#4CAF50", "#2196F3", "#9C27B0", "#795548"];

  // Fetch categories + tasks
  const fetchData = async () => {
    const { data: cats, error } = await supabase
      .from("categories")
      .select("id, title, tasks(id, text, due_date, completed, color)");
    if (error) console.error(error);
    else setCategories(cats as Category[]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add/Edit Task
  const handleAddOrEditTask = async (catId: number) => {
    if (!newTaskText.trim() || !newTaskDate) return;

    if (editingTask) {
      const { error } = await supabase
        .from("tasks")
        .update({ text: newTaskText, due_date: newTaskDate, color: newTaskColor })
        .eq("id", editingTask.taskId);
      if (error) console.error(error);
    } else {
      const { error } = await supabase.from("tasks").insert([
        { text: newTaskText, due_date: newTaskDate, color: newTaskColor || "#ffffff10", category_id: catId },
      ]);
      if (error) console.error(error);
    }

    setEditingTask(null);
    setNewTaskText("");
    setNewTaskDate("");
    setNewTaskColor("");
    setAddingTaskCat(null);
    fetchData();
  };

  // Delete Task
  const handleDeleteTask = async (taskId: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) console.error(error);
    fetchData();
  };

  // Toggle Task Completion
  const toggleTask = async (taskId: number, completed: boolean) => {
    const { error } = await supabase.from("tasks").update({ completed: !completed }).eq("id", taskId);
    if (error) console.error(error);
    fetchData();
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task, fromCat: Category) => {
    e.dataTransfer.setData("taskId", task.id.toString());
    e.dataTransfer.setData("fromCat", fromCat.id.toString());
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, toCat: Category) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    const fromCatId = parseInt(e.dataTransfer.getData("fromCat"));
    if (fromCatId === toCat.id) return;
    const { error } = await supabase.from("tasks").update({ category_id: toCat.id }).eq("id", taskId);
    if (error) console.error(error);
    fetchData();
  };

  // Delete Category
  const handleDeleteCategory = async (catId: number) => {
    const { error } = await supabase.from("categories").delete().eq("id", catId);
    if (error) console.error(error);
    setCategoryMenuOpen(null);
    fetchData();
  };

  // Save/Edit Category
  const handleSaveCategory = async (catId: number) => {
    if (!newCategoryTitle.trim()) return;
    const { error } = await supabase.from("categories").update({ title: newCategoryTitle }).eq("id", catId);
    if (error) console.error(error);
    setEditingCategory(null);
    setNewCategoryTitle("");
    fetchData();
  };

  // Add Category
  const handleAddCategory = async () => {
    if (!newCategoryTitle.trim()) return;
    const { error } = await supabase.from("categories").insert([{ title: newCategoryTitle }]);
    if (error) console.error(error);
    setAddingCategory(false);
    setNewCategoryTitle("");
    fetchData();
  };

  return (
    <div className="board-wrapper">
      <div className="board">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="column glass"
            onDrop={(e) => handleDrop(e, cat)}
            onDragOver={(e) => e.preventDefault()}
            style={{ position: "relative" }}
          >
            {/* Category Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {editingCategory === cat.id ? (
                <input
                  type="text"
                  value={newCategoryTitle}
                  onChange={(e) => setNewCategoryTitle(e.target.value)}
                  onBlur={() => handleSaveCategory(cat.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveCategory(cat.id);
                    if (e.key === "Escape") {
                      setEditingCategory(null);
                      setNewCategoryTitle("");
                    }
                  }}
                  autoFocus
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid #ccc", borderRadius: "4px", padding: "2px 6px", color: "#fff" }}
                />
              ) : (
                <h2>{cat.title}</h2>
              )}

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setCategoryMenuOpen(categoryMenuOpen === cat.id ? null : cat.id)}
                  style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "18px", color: "#fff" }}
                >
                  ⋯
                </button>
                {categoryMenuOpen === cat.id && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "24px",
                      background: "#222222dd",
                      borderRadius: "6px",
                      padding: "4px 0",
                      zIndex: 10,
                      width: "100px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <button
                      style={{ background: "transparent", border: "none", padding: "6px", color: "#fff", cursor: "pointer" }}
                      onClick={() => {
                        setEditingCategory(cat.id);
                        setNewCategoryTitle(cat.title);
                        setCategoryMenuOpen(null);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      style={{ background: "transparent", border: "none", padding: "6px", color: "#fff", cursor: "pointer" }}
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tasks */}
            <div className="cards">
              {cat.tasks?.map((task) => (
                <div
                  key={task.id}
                  className="card glass-card"
                  style={{
                    borderLeft: `6px solid ${task.color}`,
                    background: task.completed ? `${task.color}20` : "rgba(255,255,255,0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task, cat)}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id, task.completed)} />
                      <span
                        style={{
                          marginLeft: "8px",
                          textDecoration: task.completed ? "line-through" : "none",
                          opacity: task.completed ? 0.6 : 1,
                        }}
                      >
                        {task.text}
                      </span>
                    </div>
                    <div className="task-footer" style={{ display: "flex", alignItems: "center", marginTop: "4px" }}>
                      <span>📅 {task.due_date}</span>
                      <span
                        style={{ display: "inline-block", width: "14px", height: "14px", borderRadius: "50%", background: task.color, marginLeft: "8px" }}
                      ></span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        setEditingTask({ catId: cat.id, taskId: task.id });
                        setNewTaskText(task.text);
                        setNewTaskDate(task.due_date);
                        setNewTaskColor(task.color);
                        setAddingTaskCat(cat.id);
                      }}
                      style={{ cursor: "pointer", border: "none", background: "transparent" }}
                    >
                      ✏️
                    </button>
                    <button onClick={() => handleDeleteTask(task.id)} style={{ cursor: "pointer", border: "none", background: "transparent" }}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add / Edit Task Form */}
            {addingTaskCat === cat.id ? (
              <div className="add-card-form glass-card">
                <input type="text" placeholder="Task name…" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} className="add-card-input" />
                <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} className="add-card-input" />
                <div className="color-picker" style={{ margin: "8px 0" }}>
                  {colors.map((c) => (
                    <span
                      key={c}
                      onClick={() => setNewTaskColor(c)}
                      style={{
                        display: "inline-block",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        margin: "4px",
                        cursor: "pointer",
                        border: newTaskColor === c ? "2px solid #fff" : "2px solid transparent",
                        background: c,
                      }}
                    ></span>
                  ))}
                </div>
                <div className="add-card-actions">
                  <button className="add-card-confirm" onClick={() => handleAddOrEditTask(cat.id)}>
                    {editingTask ? "Save Task" : "Add Task"}
                  </button>
                  <button
                    className="add-card-cancel"
                    onClick={() => {
                      setAddingTaskCat(null);
                      setEditingTask(null);
                      setNewTaskText("");
                      setNewTaskDate("");
                      setNewTaskColor("");
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <button className="add-card-btn" onClick={() => setAddingTaskCat(cat.id)} style={{ marginTop: "8px" }}>
                + Add a task
              </button>
            )}
          </div>
        ))}

        {/* Add Category */}
        {addingCategory ? (
          <div className="column glass add-list-form">
            <input type="text" placeholder="Category title…" value={newCategoryTitle} onChange={(e) => setNewCategoryTitle(e.target.value)} className="add-card-input" />
            <div className="add-card-actions">
              <button className="add-card-confirm" onClick={handleAddCategory}>
                Add Category
              </button>
              <button
                className="add-card-cancel"
                onClick={() => {
                  setAddingCategory(false);
                  setNewCategoryTitle("");
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button className="add-list-btn" onClick={() => setAddingCategory(true)}>
            + Add another category
          </button>
        )}
      </div>
    </div>
  );
}
