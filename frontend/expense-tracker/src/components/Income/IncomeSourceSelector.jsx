import React, { useEffect, useState } from "react";
import { LuPlus, LuPencil, LuTrash2, LuCheck, LuX, LuEllipsis } from "react-icons/lu";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { INCOME_ICON_PALETTE, getIconOption } from "../../utils/transactionIcons";

const DEFAULT_ICON = INCOME_ICON_PALETTE[0].key;

// Lets the user pick an income source from their own editable list, and
// create / rename / delete sources (each with a chosen icon) inline.
const IncomeSourceSelector = ({ selectedName, onSelect }) => {
  const [sources, setSources] = useState([]);
  // editor: null when closed; otherwise { id?, name, icon }. `id` present => editing.
  const [editor, setEditor] = useState(null);

  const loadSources = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.INCOME_SOURCE.GET_ALL);
      setSources(res.data || []);
    } catch (error) {
      console.error("Failed to load income sources:", error);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.INCOME_SOURCE.GET_ALL);
        if (active) setSources(res.data || []);
      } catch (error) {
        console.error("Failed to load income sources:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const openAdd = () => setEditor({ name: "", icon: DEFAULT_ICON });
  const openEdit = (src) =>
    setEditor({ id: src._id, name: src.name, icon: src.icon || DEFAULT_ICON });
  const closeEditor = () => setEditor(null);

  const saveEditor = async () => {
    const name = editor.name.trim();
    if (!name) {
      toast.error("Name is required.");
      return;
    }
    try {
      if (editor.id) {
        await axiosInstance.put(API_PATHS.INCOME_SOURCE.UPDATE(editor.id), {
          name,
          icon: editor.icon,
        });
        toast.success("Source updated");
      } else {
        await axiosInstance.post(API_PATHS.INCOME_SOURCE.ADD, {
          name,
          icon: editor.icon,
        });
        toast.success("Source added");
      }
      closeEditor();
      await loadSources();
      onSelect({ name, icon: editor.icon }); // auto-select the saved source
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save source.");
    }
  };

  const deleteSource = async (src) => {
    try {
      await axiosInstance.delete(API_PATHS.INCOME_SOURCE.DELETE(src._id));
      toast.success("Source deleted");
      if (selectedName === src.name) onSelect({ name: "", icon: "" });
      await loadSources();
    } catch {
      toast.error("Failed to delete source.");
    }
  };

  return (
    <div className="mb-6">
      <label className="text-[13px] text-slate-800">Income Source</label>

      <div className="grid grid-cols-3 gap-3 mt-2">
        {sources.map((src) => {
          const option = getIconOption(src.icon);
          const isActive = selectedName === src.name;
          return (
            <div key={src._id} className="relative group">
              <button
                type="button"
                onClick={() => onSelect({ name: src.name, icon: src.icon })}
                aria-pressed={isActive}
                className={`w-full flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg border transition-colors cursor-pointer ${
                  isActive
                    ? "border-primary bg-purple-50 text-primary"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {option ? (
                  <option.Icon className="text-2xl" />
                ) : (
                  <LuEllipsis className="text-2xl" />
                )}
                <span className="text-xs font-medium text-center break-words">
                  {src.name}
                </span>
              </button>

              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => openEdit(src)}
                  aria-label={`Edit ${src.name}`}
                  className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-primary cursor-pointer"
                >
                  <LuPencil className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteSource(src)}
                  aria-label={`Delete ${src.name}`}
                  className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-red-500 cursor-pointer"
                >
                  <LuTrash2 className="text-xs" />
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={openAdd}
          className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-primary hover:text-primary cursor-pointer"
        >
          <LuPlus className="text-2xl" />
          <span className="text-xs font-medium">Add</span>
        </button>
      </div>

      {editor && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-[13px] font-medium text-slate-800 mb-2">
            {editor.id ? "Edit source" : "New source"}
          </p>

          <input
            type="text"
            value={editor.name}
            onChange={(e) => setEditor({ ...editor, name: e.target.value })}
            placeholder="Source name"
            className="w-full text-sm bg-white rounded px-3 py-2 border border-slate-200 outline-none mb-3"
          />

          <div className="grid grid-cols-6 gap-2 mb-3">
            {INCOME_ICON_PALETTE.map((opt) => {
              const active = editor.icon === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setEditor({ ...editor, icon: opt.key })}
                  title={opt.label}
                  className={`flex items-center justify-center py-2 rounded-lg border cursor-pointer ${
                    active
                      ? "border-primary bg-purple-50 text-primary"
                      : "border-gray-200 text-gray-600 hover:bg-white"
                  }`}
                >
                  <opt.Icon className="text-lg" />
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeEditor}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              <LuX /> Cancel
            </button>
            <button
              type="button"
              onClick={saveEditor}
              className="flex items-center gap-1 text-xs font-medium text-white bg-primary px-3 py-1.5 rounded-lg cursor-pointer"
            >
              <LuCheck /> Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeSourceSelector;
