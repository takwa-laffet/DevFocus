import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient"; // adjust path
import { MoreVertical } from "lucide-react";

export default function GlassBoard() {
  const [columns, setColumns] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);

  const [addingCardCol, setAddingCardCol] = useState<number | null>(null);
  const [newCardText, setNewCardText] = useState("");
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [editingCol, setEditingCol] = useState<number | null>(null);
  const [editColTitle, setEditColTitle] = useState("");

  // 🔹 Load data from Supabase
  useEffect(() => {
    fetchColumns();
    fetchCards();
  }, []);

  const fetchColumns = async () => {
    const { data, error } = await supabase.from("columns").select("*").order("id");
    if (!error && data) setColumns(data);
  };

  const fetchCards = async () => {
    const { data, error } = await supabase.from("cards").select("*").order("id");
    if (!error && data) setCards(data);
  };

  // 🔹 Add column
  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    const { data, error } = await supabase
      .from("columns")
      .insert([{ title: newListTitle }])
      .select();
    if (!error && data) {
      setColumns((prev) => [...prev, data[0]]);
      setNewListTitle("");
      setAddingList(false);
    }
  };

  // 🔹 Edit column
  const handleEditList = async (colId: number) => {
    if (!editColTitle.trim()) return;
    const { error } = await supabase
      .from("columns")
      .update({ title: editColTitle })
      .eq("id", colId);
    if (!error) {
      setColumns((prev) =>
        prev.map((col) => (col.id === colId ? { ...col, title: editColTitle } : col))
      );
      setEditingCol(null);
      setEditColTitle("");
    }
  };

  // 🔹 Delete column
  const handleDeleteList = async (colId: number) => {
    const { error } = await supabase.from("columns").delete().eq("id", colId);
    if (!error) {
      setColumns((prev) => prev.filter((col) => col.id !== colId));
      setCards((prev) => prev.filter((c) => c.column_id !== colId)); // cleanup
      setOpenMenu(null);
    }
  };

  // 🔹 Add card
  const handleAddCard = async (colId: number) => {
    if (!newCardText.trim()) return;
    const { data, error } = await supabase
      .from("cards")
      .insert([{ text: newCardText, column_id: colId }])
      .select();
    if (!error && data) {
      setCards((prev) => [...prev, data[0]]);
      setNewCardText("");
      setAddingCardCol(null);
    }
  };

  // 🔹 Delete card
  const handleDeleteCard = async (cardId: number) => {
    const { error } = await supabase.from("cards").delete().eq("id", cardId);
    if (!error) {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    }
  };

  // 🔹 Drag Start
  const handleDragStart = (e: React.DragEvent, cardId: number, fromColId: number) => {
    e.dataTransfer.setData("cardId", String(cardId));
    e.dataTransfer.setData("fromColId", String(fromColId));
  };

  // 🔹 Drop
  const handleDrop = async (e: React.DragEvent, toColId: number) => {
    e.preventDefault();
    const cardId = parseInt(e.dataTransfer.getData("cardId"));
    const fromColId = parseInt(e.dataTransfer.getData("fromColId"));

    if (fromColId === toColId) return;

    // Update DB
    const { error } = await supabase
      .from("cards")
      .update({ column_id: toColId })
      .eq("id", cardId);

    if (!error) {
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, column_id: toColId } : c))
      );
    }
  };

  return (
    <div className="board-wrapper">
      <div className="board">
        {columns.map((col) => (
          <div
            key={col.id}
            className="column glass relative"
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Column Header */}
            <div className="flex justify-between items-center mb-2">
              {editingCol === col.id ? (
                <div className="flex w-full gap-2">
                  <input
                    type="text"
                    value={editColTitle}
                    onChange={(e) => setEditColTitle(e.target.value)}
                    className="add-card-input flex-1"
                  />
                  <button
                    onClick={() => handleEditList(col.id)}
                    className="add-card-confirm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCol(null)}
                    className="add-card-cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-bold">{col.title}</h2>
                  <div className="relative">
                    <button
                      className="p-1 rounded-full hover:bg-white/10 transition"
                      onClick={() =>
                        setOpenMenu(openMenu === col.id ? null : col.id)
                      }
                    >
                      <MoreVertical className="w-5 h-5 text-white" />
                    </button>
                    {openMenu === col.id && (
                      <div className="absolute right-0 mt-2 w-32 bg-black/70 text-white rounded-xl shadow-lg z-10">
                        <button
                          onClick={() => {
                            setEditingCol(col.id);
                            setEditColTitle(col.title);
                            setOpenMenu(null);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-white/20 rounded-t-xl"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteList(col.id)}
                          className="block w-full text-left px-4 py-2 hover:bg-white/20 rounded-b-xl text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Cards */}
            <div className="cards">
              {cards
                .filter((c) => c.column_id === col.id)
                .map((card) => (
                  <div
                    key={card.id}
                    className="card glass-card flex justify-between items-center"
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id, col.id)}
                  >
                    <span>{card.text}</span>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>

            {/* Add Card */}
            {addingCardCol === col.id ? (
              <div className="add-card-form glass-card">
                <input
                  type="text"
                  placeholder="Enter a title…"
                  value={newCardText}
                  onChange={(e) => setNewCardText(e.target.value)}
                  className="add-card-input"
                />
                <div className="add-card-actions">
                  <button
                    className="add-card-confirm"
                    onClick={() => handleAddCard(col.id)}
                  >
                    Add
                  </button>
                  <button
                    className="add-card-cancel"
                    onClick={() => {
                      setAddingCardCol(null);
                      setNewCardText("");
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="add-card-btn"
                onClick={() => setAddingCardCol(col.id)}
              >
                + Add a task
              </button>
            )}
          </div>
        ))}

        {/* Add List */}
        {addingList ? (
          <div className="column glass add-list-form">
            <input
              type="text"
              placeholder="Enter list title…"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              className="add-card-input"
            />
            <div className="add-card-actions">
              <button className="add-card-confirm" onClick={handleAddList}>
                Add list
              </button>
              <button
                className="add-card-cancel"
                onClick={() => {
                  setAddingList(false);
                  setNewListTitle("");
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button className="add-list-btn" onClick={() => setAddingList(true)}>
            + Add another list
          </button>
        )}
      </div>
    </div>
  );
}
