import { useEffect, useMemo, useState } from "react";

const accentColors = ["#E8845C", "#4CAF80", "#7C6BC4"];
const makeId = () => crypto.randomUUID();

const LIBRARY_CONFIG = {
  title: "Prompt Library",
  titleAccent: "Library",
  subtitle: "PERSONAL PROMPT PACK",
  heroDescription:
    "Create categories, save individual prompts, and group multi-step prompt processes into processes.",
};

export default function App() {
  const [categories, setCategories] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const [loadError, setLoadError] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeType, setActiveType] = useState("prompts");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptText, setNewPromptText] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [showCategoryActions, setShowCategoryActions] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [folderComposerId, setFolderComposerId] = useState(null);
  const [folderPromptTitle, setFolderPromptTitle] = useState("");
  const [folderPromptText, setFolderPromptText] = useState("");
  const [expandedFolderPromptId, setExpandedFolderPromptId] = useState(null);
  const [editingPromptId, setEditingPromptId] = useState(null);
  const [editingFolderPromptId, setEditingFolderPromptId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [pendingDeletePromptId, setPendingDeletePromptId] = useState(null);
  const [pendingDeleteProcessPromptId, setPendingDeleteProcessPromptId] =
    useState(null);
  const [pendingDeleteProcessId, setPendingDeleteProcessId] = useState(null);
  const [copiedPromptId, setCopiedPromptId] = useState(null);

  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ?? null;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/library", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Library load failed (${response.status})`);
        }
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Could not load library",
        );
      } finally {
        setIsLoaded(true);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const timeout = window.setTimeout(async () => {
      setSaveState("saving");
      await fetch("/api/library", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categories),
      });
      setSaveState("saved");
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [categories, isLoaded]);

  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].id);
    }
  }, [activeCategoryId, categories]);

  useEffect(() => {
    setShowComposer(false);
  }, [activeCategoryId, activeType]);

  const visibleItems = useMemo(() => {
    if (!activeCategory) return [];
    const source =
      activeType === "prompts"
        ? activeCategory.prompts
        : activeCategory.folders;
    const normalized = searchTerm.toLowerCase();

    return source.filter((item) => {
      const haystack =
        activeType === "prompts"
          ? `${item.title} ${item.text}`.toLowerCase()
          : item.name.toLowerCase();
      return !normalized || haystack.includes(normalized);
    });
  }, [activeCategory, activeType, searchTerm]);

  const addCategory = (event) => {
    event.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    const next = {
      id: makeId(),
      name,
      prompts: [],
      folders: [],
    };

    setCategories((current) => [...current, next]);
    setActiveCategoryId(next.id);
    setNewCategoryName("");
  };

  const saveCategoryRename = (event) => {
    event.preventDefault();
    if (!activeCategory) return;
    const name = renameValue.trim();
    if (!name) return;

    setCategories((current) =>
      current.map((category) =>
        category.id === activeCategory.id ? { ...category, name } : category,
      ),
    );
    setShowCategoryActions(false);
  };

  const deleteCategory = () => {
    if (!activeCategory) return;
    const remaining = categories.filter(
      (category) => category.id !== activeCategory.id,
    );
    setCategories(remaining);
    setActiveCategoryId(remaining[0]?.id ?? null);
    setShowCategoryActions(false);
  };

  const addPrompt = (event) => {
    event.preventDefault();
    if (!activeCategory) return;
    const title = newPromptTitle.trim();
    const text = newPromptText.trim();
    if (!title || !text) return;

    setCategories((current) =>
      current.map((category) =>
        category.id === activeCategory.id
          ? {
              ...category,
              prompts: [...category.prompts, { id: makeId(), title, text }],
            }
          : category,
      ),
    );
    setNewPromptTitle("");
    setNewPromptText("");
  };

  const addFolder = (event) => {
    event.preventDefault();
    if (!activeCategory) return;
    const name = newFolderName.trim();
    if (!name) return;

    setCategories((current) =>
      current.map((category) =>
        category.id === activeCategory.id
          ? {
              ...category,
              folders: [...category.folders, { id: makeId(), name, prompts: [] }],
            }
          : category,
      ),
    );
    setNewFolderName("");
  };

  const addPromptToFolder = (event, folderId) => {
    event.preventDefault();
    if (!activeCategory) return;
    const title = folderPromptTitle.trim();
    const text = folderPromptText.trim();
    if (!title || !text) return;

    setCategories((current) =>
      current.map((category) =>
        category.id === activeCategory.id
          ? {
              ...category,
              folders: category.folders.map((folder) =>
                folder.id === folderId
                  ? {
                      ...folder,
                      prompts: [...folder.prompts, { id: makeId(), title, text }],
                    }
                  : folder,
              ),
            }
          : category,
      ),
    );

    setFolderPromptTitle("");
    setFolderPromptText("");
    setFolderComposerId(null);
  };

  const beginEdit = (prompt) => {
    setEditingPromptId(prompt.id);
    setEditTitle(prompt.title);
    setEditText(prompt.text);
  };

  const savePromptEdit = (event, promptId) => {
    event.preventDefault();
    if (!activeCategory) return;

    setCategories((current) =>
      current.map((category) =>
        category.id === activeCategory.id
          ? {
              ...category,
              prompts: category.prompts.map((prompt) =>
                prompt.id === promptId
                  ? { ...prompt, title: editTitle.trim(), text: editText.trim() }
                  : prompt,
              ),
            }
          : category,
      ),
    );
    setEditingPromptId(null);
  };

  const beginFolderPromptEdit = (prompt) => {
    setEditingFolderPromptId(prompt.id);
    setEditTitle(prompt.title);
    setEditText(prompt.text);
  };

  const saveFolderPromptEdit = (event, folderId, promptId) => {
    event.preventDefault();
    if (!activeCategory) return;

    setCategories((current) =>
      current.map((category) =>
        category.id === activeCategory.id
          ? {
              ...category,
              folders: category.folders.map((folder) =>
                folder.id === folderId
                  ? {
                      ...folder,
                      prompts: folder.prompts.map((prompt) =>
                        prompt.id === promptId
                          ? {
                              ...prompt,
                              title: editTitle.trim(),
                              text: editText.trim(),
                            }
                          : prompt,
                      ),
                    }
                  : folder,
              ),
            }
          : category,
      ),
    );
    setEditingFolderPromptId(null);
  };

  const deletePrompt = (promptId) => {
    if (!activeCategory) return;

    setCategories((current) =>
      current.map((category) =>
        category.id === activeCategory.id
          ? {
              ...category,
              prompts: category.prompts.filter((prompt) => prompt.id !== promptId),
            }
          : category,
      ),
    );
    setPendingDeletePromptId(null);
    if (expandedId === promptId) setExpandedId(null);
  };

  const deleteProcessPrompt = (folderId, promptId) => {
    if (!activeCategory) return;

    setCategories((current) =>
      current.map((category) =>
        category.id === activeCategory.id
          ? {
              ...category,
              folders: category.folders.map((folder) =>
                folder.id === folderId
                  ? {
                      ...folder,
                      prompts: folder.prompts.filter(
                        (prompt) => prompt.id !== promptId,
                      ),
                    }
                  : folder,
              ),
            }
          : category,
      ),
    );
    setPendingDeleteProcessPromptId(null);
    if (expandedFolderPromptId === promptId) setExpandedFolderPromptId(null);
  };

  const deleteProcess = (processId) => {
    if (!activeCategory) return;

    setCategories((current) =>
      current.map((category) =>
        category.id === activeCategory.id
          ? {
              ...category,
              folders: category.folders.filter(
                (folder) => folder.id !== processId,
              ),
            }
          : category,
      ),
    );
    setPendingDeleteProcessId(null);
    if (expandedId === processId) setExpandedId(null);
  };

  const copyPrompt = async (promptId, text) => {
    await navigator.clipboard.writeText(text);
    setCopiedPromptId(promptId);
    window.setTimeout(() => {
      setCopiedPromptId((current) => (current === promptId ? null : current));
    }, 1200);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF6F1",
        fontFamily: "'DM Sans', sans-serif",
        color: "#2D2A33",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        button, input, textarea { font: inherit; }
        .pill, .entry-card, .save-btn { transition: all 0.2s ease; }
        .pill:hover, .pill:focus-visible { transform: translateY(-1px); }
        .entry-card:hover { box-shadow: 0 4px 16px rgba(45,42,51,0.08); }
        .pill-rail {
          display: flex;
          gap: 8px;
          align-items: center;
          overflow-x: auto;
          flex-wrap: nowrap;
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }
        .pill-rail > * {
          flex: 0 0 auto;
        }
        .pill-rail::-webkit-scrollbar {
          height: 6px;
        }
        .pill-rail::-webkit-scrollbar-thumb {
          background: rgba(45,42,51,0.18);
          border-radius: 999px;
        }
        @media (max-width: 640px) {
          .hero-title { font-size: 28px !important; }
          .composer-grid { grid-template-columns: 1fr !important; }
          .entry-header { align-items: flex-start !important; }
        }
      `}</style>

      <header
        style={{
          background: "linear-gradient(135deg, #1E1B2E, #2A2540)",
          padding: "48px 20px 40px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2,
              color: "#E8845C",
              marginBottom: 16,
              textTransform: "uppercase",
            }}
          >
            {LIBRARY_CONFIG.subtitle}
          </p>
          <h1
            className="hero-title"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 38,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.2,
              margin: "0 0 16px",
            }}
          >
            Prompt <em style={{ color: "#E8845C" }}>Library</em>
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "#C5C0CC",
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            {LIBRARY_CONFIG.heroDescription}
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px 40px" }}>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: "#6B6575",
            textTransform: "uppercase",
            letterSpacing: 1.5,
            marginBottom: 12,
          }}
        >
          {!isLoaded
            ? "Loading library..."
            : loadError
              ? loadError
              : saveState === "saving"
                ? "Saving..."
                : "Saved"}
        </div>
        <div className="pill-rail" style={{ marginBottom: 16 }}>
          {categories.map((category, index) => (
            <button
              key={category.id}
              className="pill"
              onClick={() => setActiveCategoryId(category.id)}
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                border:
                  category.id === activeCategoryId
                    ? "1px solid #E8845C"
                    : "1px solid rgba(45,42,51,0.08)",
                background:
                  category.id === activeCategoryId
                    ? "rgba(232,132,92,0.12)"
                    : "#FFFFFF",
                color:
                  category.id === activeCategoryId
                    ? "#E8845C"
                    : accentColors[index % accentColors.length],
              }}
            >
              {category.name}
            </button>
          ))}
          <button
            className="pill"
            onClick={() => setShowCategoryForm((current) => !current)}
            style={{
              padding: "8px 14px",
              borderRadius: 20,
              border: "1px dashed rgba(45,42,51,0.18)",
              background: "#FFFFFF",
              color: "#6B6575",
            }}
          >
            + Category
          </button>
          {activeCategory && (
            <button
              onClick={() => {
                if (!showCategoryActions) {
                  setRenameValue(activeCategory.name);
                }
                setShowCategoryActions((current) => !current);
              }}
              style={{
                marginLeft: 4,
                padding: "8px 12px",
                borderRadius: 20,
                border: "1px solid rgba(45,42,51,0.08)",
                background: "rgba(45,42,51,0.04)",
                color: "#6B6575",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span aria-hidden="true">⚙</span>
              Edit category
            </button>
          )}
        </div>

        {showCategoryForm && (
          <form
            onSubmit={(event) => {
              addCategory(event);
              setShowCategoryForm(false);
            }}
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Category name"
              style={{
                flex: 1,
                padding: "14px 16px",
                borderRadius: 10,
                border: "1px solid rgba(45,42,51,0.1)",
                background: "#FFFFFF",
              }}
            />
            <button
              style={{
                border: "none",
                borderRadius: 10,
                padding: "0 16px",
                background: "#E8845C",
                color: "#FFFFFF",
                fontWeight: 700,
              }}
            >
              Save
            </button>
          </form>
        )}

        {!activeCategory ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px dashed rgba(45,42,51,0.14)",
              borderRadius: 14,
              padding: 28,
              color: "#6B6575",
              textAlign: "center",
            }}
          >
            Create your first category to begin.
          </div>
        ) : (
          <>
            {showCategoryActions && (
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  background: "#FFFFFF",
                  borderRadius: 14,
                  border: "1px solid rgba(45,42,51,0.06)",
                  padding: 16,
                  marginBottom: 18,
                }}
              >
                <form
                  onSubmit={saveCategoryRename}
                  style={{ display: "flex", gap: 10 }}
                >
                  <input
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(45,42,51,0.1)",
                    }}
                  />
                  <button
                    style={{
                      border: "none",
                      borderRadius: 10,
                      padding: "0 16px",
                      background: "#E8845C",
                      color: "#FFFFFF",
                      fontWeight: 700,
                    }}
                  >
                    Rename
                  </button>
                </form>
                <button
                  onClick={deleteCategory}
                  style={{
                    justifySelf: "start",
                    border: "none",
                    background: "transparent",
                    color: "#B54747",
                    padding: 0,
                  }}
                >
                  Delete category
                </button>
              </div>
            )}

            <div className="pill-rail" style={{ marginBottom: 14 }}>
              {["prompts", "processes"].map((type) => (
                <button
                  key={type}
                  className="pill"
                  onClick={() => setActiveType(type)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 20,
                    border:
                      activeType === type
                        ? "1px solid #E8845C"
                        : "1px solid rgba(45,42,51,0.08)",
                    background:
                      activeType === type ? "rgba(232,132,92,0.12)" : "#FFFFFF",
                    color: activeType === type ? "#E8845C" : "#4A4555",
                    textTransform: "capitalize",
                  }}
                >
                  {type}
                </button>
              ))}
              <button
                className="pill"
                onClick={() => setShowComposer((current) => !current)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 20,
                  border: "1px dashed rgba(45,42,51,0.18)",
                  background: "#FFFFFF",
                  color: "#6B6575",
                }}
              >
                + Add {activeType === "prompts" ? "prompt" : "process"}
              </button>
            </div>

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`Search ${activeType}...`}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 10,
                border: "1px solid rgba(45,42,51,0.1)",
                background: "#FFFFFF",
                marginBottom: 14,
              }}
            />

            {showComposer && (
              <div
                className="composer-grid"
                style={{
                  display: "grid",
                  gap: 10,
                  background: "#FFFFFF",
                  borderRadius: 14,
                  border: "1px solid rgba(45,42,51,0.06)",
                  padding: 16,
                  marginBottom: 18,
                }}
              >
                {activeType === "prompts" ? (
                <form
                  onSubmit={(event) => {
                    addPrompt(event);
                    setShowComposer(false);
                  }}
                  style={{ display: "grid", gap: 10 }}
                >
                  <input
                    value={newPromptTitle}
                    onChange={(event) => setNewPromptTitle(event.target.value)}
                    placeholder="Prompt title"
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(45,42,51,0.1)",
                    }}
                  />
                  <textarea
                    value={newPromptText}
                    onChange={(event) => setNewPromptText(event.target.value)}
                    placeholder="Prompt text"
                    style={{
                      minHeight: 110,
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(45,42,51,0.1)",
                      resize: "vertical",
                    }}
                  />
                  <button
                    style={{
                      justifySelf: "start",
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 16px",
                      background: "#E8845C",
                      color: "#FFFFFF",
                      fontWeight: 700,
                    }}
                  >
                    Add prompt
                  </button>
                </form>
                ) : (
                <form
                  onSubmit={(event) => {
                    addFolder(event);
                    setShowComposer(false);
                  }}
                  style={{ display: "flex", gap: 10 }}
                >
                  <input
                    value={newFolderName}
                    onChange={(event) => setNewFolderName(event.target.value)}
                    placeholder="Process name"
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(45,42,51,0.1)",
                    }}
                  />
                  <button
                    style={{
                      border: "none",
                      borderRadius: 10,
                      padding: "0 16px",
                      background: "#E8845C",
                      color: "#FFFFFF",
                      fontWeight: 700,
                    }}
                  >
                    Add process
                  </button>
                </form>
                )}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {visibleItems.map((item, index) => {
                const accent = accentColors[index % accentColors.length];
                const isOpen = expandedId === item.id;
                const title = activeType === "prompts" ? item.title : item.name;
                const summary =
                  activeType === "prompts"
                    ? item.text
                    : `${item.prompts.length} prompts`;

                return (
                  <article
                    key={item.id}
                    className="entry-card"
                    style={{
                      background: "#FFFFFF",
                      border: `1px solid ${isOpen ? accent + "40" : "rgba(45,42,51,0.06)"}`,
                      borderLeft: `4px solid ${accent}`,
                      borderRadius: "0 14px 14px 0",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      className="entry-header"
                      onClick={() => setExpandedId(isOpen ? null : item.id)}
                      style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        padding: "16px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        textAlign: "left",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 16,
                            margin: "0 0 4px",
                          }}
                        >
                          {title}
                        </h2>
                        <p
                          style={{
                            fontSize: 13,
                            color: "#4A4555",
                            margin: 0,
                          }}
                        >
                          {activeType === "prompts"
                            ? summary.slice(0, 110)
                            : summary}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {activeType === "prompts" && (
                          pendingDeletePromptId === item.id ? (
                            <>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deletePrompt(item.id);
                                }}
                                style={{
                                  border: "none",
                                  borderRadius: 999,
                                  padding: "6px 10px",
                                  background: "rgba(181,71,71,0.12)",
                                  color: "#B54747",
                                }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setPendingDeletePromptId(null);
                                }}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "#6B6575",
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setPendingDeletePromptId(item.id);
                              }}
                              aria-label={`Delete ${title}`}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "#9B95A5",
                                fontSize: 18,
                                lineHeight: 1,
                              }}
                            >
                              ×
                            </button>
                          )
                        )}
                        {activeType === "processes" && (
                          pendingDeleteProcessId === item.id ? (
                            <>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deleteProcess(item.id);
                                }}
                                style={{
                                  border: "none",
                                  borderRadius: 999,
                                  padding: "6px 10px",
                                  background: "rgba(181,71,71,0.12)",
                                  color: "#B54747",
                                }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setPendingDeleteProcessId(null);
                                }}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "#6B6575",
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setPendingDeleteProcessId(item.id);
                              }}
                              aria-label={`Delete ${title}`}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "#9B95A5",
                                fontSize: 18,
                                lineHeight: 1,
                              }}
                            >
                              ×
                            </button>
                          )
                        )}
                        <span style={{ color: "#6B6575" }}>
                          {isOpen ? "▲" : "▼"}
                        </span>
                      </div>
                    </button>

                    {isOpen && (
                      <div style={{ padding: "0 18px 18px" }}>
                        <div
                          style={{
                            borderTop: `1px solid ${accent}30`,
                            paddingTop: 14,
                            color: "#4A4555",
                            lineHeight: 1.7,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {activeType === "prompts"
                            ? item.text
                            : item.prompts.length === 0
                              ? "No prompts in this process yet."
                              : item.prompts.map((prompt) => prompt.title).join(" → ")}
                        </div>
                        {activeType === "prompts" &&
                          (editingPromptId === item.id ? (
                            <form
                              onSubmit={(event) => savePromptEdit(event, item.id)}
                              style={{
                                display: "grid",
                                gap: 10,
                                marginTop: 14,
                              }}
                            >
                              <input
                                value={editTitle}
                                onChange={(event) => setEditTitle(event.target.value)}
                                style={{
                                  padding: "12px 14px",
                                  borderRadius: 10,
                                  border: "1px solid rgba(45,42,51,0.1)",
                                }}
                              />
                              <textarea
                                value={editText}
                                onChange={(event) => setEditText(event.target.value)}
                                style={{
                                  minHeight: 100,
                                  padding: "12px 14px",
                                  borderRadius: 10,
                                  border: "1px solid rgba(45,42,51,0.1)",
                                  resize: "vertical",
                                }}
                              />
                              <button
                                style={{
                                  justifySelf: "start",
                                  border: "none",
                                  borderRadius: 10,
                                  padding: "12px 16px",
                                  background: "#E8845C",
                                  color: "#FFFFFF",
                                  fontWeight: 700,
                                }}
                              >
                                Save
                              </button>
                            </form>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                                marginTop: 14,
                              }}
                            >
                              <button
                                className="pill"
                                onClick={() => copyPrompt(item.id, item.text)}
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: 20,
                                  border: "1px solid rgba(45,42,51,0.08)",
                                  background: "rgba(76,175,128,0.12)",
                                  color: "#4CAF80",
                                }}
                              >
                                {copiedPromptId === item.id ? "Copied" : "Copy"}
                              </button>
                              <button
                                className="pill"
                                onClick={() => beginEdit(item)}
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: 20,
                                  border: "1px dashed rgba(45,42,51,0.18)",
                                  background: "#FFFFFF",
                                  color: "#6B6575",
                                }}
                              >
                                Edit
                              </button>
                            </div>
                          ))}
                        {activeType === "processes" && (
                          <div style={{ marginTop: 14 }}>
                            {item.prompts.length > 0 && (
                              <div
                                style={{
                                  display: "grid",
                                  gap: 10,
                                  marginBottom: 14,
                                }}
                              >
                                {item.prompts.map((prompt) => {
                                  const promptIsOpen =
                                    expandedFolderPromptId === prompt.id;

                                  return (
                                    <div
                                      key={prompt.id}
                                      style={{
                                        border: "1px solid rgba(45,42,51,0.06)",
                                        borderRadius: 12,
                                        background: "#FFFFFF",
                                        overflow: "hidden",
                                      }}
                                    >
                                      <button
                                        onClick={() =>
                                          setExpandedFolderPromptId(
                                            promptIsOpen ? null : prompt.id,
                                          )
                                        }
                                        style={{
                                          width: "100%",
                                          border: "none",
                                          background: "transparent",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          gap: 12,
                                          padding: "12px 14px",
                                          textAlign: "left",
                                        }}
                                      >
                                        <span>{prompt.title}</span>
                                        <span
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                          }}
                                        >
                                          {pendingDeleteProcessPromptId ===
                                          prompt.id ? (
                                            <>
                                              <button
                                                onClick={(event) => {
                                                  event.stopPropagation();
                                                  deleteProcessPrompt(
                                                    item.id,
                                                    prompt.id,
                                                  );
                                                }}
                                                style={{
                                                  border: "none",
                                                  borderRadius: 999,
                                                  padding: "6px 10px",
                                                  background:
                                                    "rgba(181,71,71,0.12)",
                                                  color: "#B54747",
                                                }}
                                              >
                                                Confirm
                                              </button>
                                              <button
                                                onClick={(event) => {
                                                  event.stopPropagation();
                                                  setPendingDeleteProcessPromptId(
                                                    null,
                                                  );
                                                }}
                                                style={{
                                                  border: "none",
                                                  background: "transparent",
                                                  color: "#6B6575",
                                                }}
                                              >
                                                Cancel
                                              </button>
                                            </>
                                          ) : (
                                            <button
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                setPendingDeleteProcessPromptId(
                                                  prompt.id,
                                                );
                                              }}
                                              aria-label={`Delete ${prompt.title}`}
                                              style={{
                                                border: "none",
                                                background: "transparent",
                                                color: "#9B95A5",
                                                fontSize: 18,
                                                lineHeight: 1,
                                              }}
                                            >
                                              ×
                                            </button>
                                          )}
                                          <span style={{ color: "#6B6575" }}>
                                            {promptIsOpen ? "▲" : "▼"}
                                          </span>
                                        </span>
                                      </button>

                                      {promptIsOpen && (
                                        <div
                                          style={{
                                            borderTop:
                                              "1px solid rgba(45,42,51,0.06)",
                                            padding: "12px 14px",
                                            color: "#4A4555",
                                            lineHeight: 1.7,
                                            whiteSpace: "pre-wrap",
                                          }}
                                        >
                                          {editingFolderPromptId === prompt.id ? (
                                            <form
                                              onSubmit={(event) =>
                                                saveFolderPromptEdit(
                                                  event,
                                                  item.id,
                                                  prompt.id,
                                                )
                                              }
                                              style={{ display: "grid", gap: 10 }}
                                            >
                                              <input
                                                value={editTitle}
                                                onChange={(event) =>
                                                  setEditTitle(event.target.value)
                                                }
                                                style={{
                                                  padding: "12px 14px",
                                                  borderRadius: 10,
                                                  border:
                                                    "1px solid rgba(45,42,51,0.1)",
                                                }}
                                              />
                                              <textarea
                                                value={editText}
                                                onChange={(event) =>
                                                  setEditText(event.target.value)
                                                }
                                                style={{
                                                  minHeight: 100,
                                                  padding: "12px 14px",
                                                  borderRadius: 10,
                                                  border:
                                                    "1px solid rgba(45,42,51,0.1)",
                                                  resize: "vertical",
                                                }}
                                              />
                                              <button
                                                style={{
                                                  justifySelf: "start",
                                                  border: "none",
                                                  borderRadius: 10,
                                                  padding: "12px 16px",
                                                  background: "#E8845C",
                                                  color: "#FFFFFF",
                                                  fontWeight: 700,
                                                }}
                                              >
                                                Save
                                              </button>
                                            </form>
                                          ) : (
                                            <>
                                              {prompt.text}
                                              <div
                                                style={{
                                                  display: "flex",
                                                  gap: 8,
                                                  flexWrap: "wrap",
                                                }}
                                              >
                                                <button
                                                  className="pill"
                                                  onClick={() =>
                                                    copyPrompt(
                                                      prompt.id,
                                                      prompt.text,
                                                    )
                                                  }
                                                  style={{
                                                    marginTop: 14,
                                                    padding: "8px 14px",
                                                    borderRadius: 20,
                                                    border:
                                                      "1px solid rgba(45,42,51,0.08)",
                                                    background:
                                                      "rgba(76,175,128,0.12)",
                                                    color: "#4CAF80",
                                                  }}
                                                >
                                                  {copiedPromptId === prompt.id
                                                    ? "Copied"
                                                    : "Copy"}
                                                </button>
                                                <button
                                                  className="pill"
                                                  onClick={() =>
                                                    beginFolderPromptEdit(prompt)
                                                  }
                                                  style={{
                                                    marginTop: 14,
                                                    padding: "8px 14px",
                                                    borderRadius: 20,
                                                    border:
                                                      "1px dashed rgba(45,42,51,0.18)",
                                                    background: "#FFFFFF",
                                                    color: "#6B6575",
                                                  }}
                                                >
                                                  Edit
                                                </button>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            <button
                              className="pill"
                              onClick={() =>
                                setFolderComposerId(
                                  folderComposerId === item.id ? null : item.id,
                                )
                              }
                              style={{
                                padding: "8px 14px",
                                borderRadius: 20,
                                border: "1px dashed rgba(45,42,51,0.18)",
                                background: "#FFFFFF",
                                color: "#6B6575",
                              }}
                            >
                              + Add prompt
                            </button>

                            {folderComposerId === item.id && (
                              <form
                                onSubmit={(event) => addPromptToFolder(event, item.id)}
                                style={{
                                  display: "grid",
                                  gap: 10,
                                  marginTop: 12,
                                }}
                              >
                                <input
                                  value={folderPromptTitle}
                                  onChange={(event) =>
                                    setFolderPromptTitle(event.target.value)
                                  }
                                  placeholder="Prompt title"
                                  style={{
                                    padding: "12px 14px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(45,42,51,0.1)",
                                  }}
                                />
                                <textarea
                                  value={folderPromptText}
                                  onChange={(event) =>
                                    setFolderPromptText(event.target.value)
                                  }
                                  placeholder="Prompt text"
                                  style={{
                                    minHeight: 100,
                                    padding: "12px 14px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(45,42,51,0.1)",
                                    resize: "vertical",
                                  }}
                                />
                                <button
                                  style={{
                                    justifySelf: "start",
                                    border: "none",
                                    borderRadius: 10,
                                    padding: "12px 16px",
                                    background: "#E8845C",
                                    color: "#FFFFFF",
                                    fontWeight: 700,
                                  }}
                                >
                                  Save prompt
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}

              {visibleItems.length === 0 && (
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px dashed rgba(45,42,51,0.14)",
                    borderRadius: 14,
                    padding: 24,
                    color: "#6B6575",
                    textAlign: "center",
                  }}
                >
                  No {activeType} yet.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
