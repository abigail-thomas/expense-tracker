import React, { useEffect, useState } from "react";
import { LuPlus, LuPencil, LuTrash2, LuCheck, LuX, LuEllipsis } from "react-icons/lu";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { getIconOption } from "../../utils/transactionIcons";

// Generic picker for a user-owned, editable list of named+iconed items
// (income sources, expense categories, …). The grid is selection-only with
// uniform cards (titles clamped to two lines); create / rename / delete /
// change-icon all happen in a "Manage" modal opened via the Edit button.
//
// Props:
//   label       – section label (e.g. "Category")
//   manageTitle – title of the manage modal (e.g. "Manage expense categories")
//   itemNoun    – singular noun for buttons/messages (e.g. "category")
//   api         – { GET_ALL, ADD, UPDATE(id), DELETE(id) } from API_PATHS
//   iconPalette – array of { key, label, Icon } to choose from
//   max         – maximum number of items the user may keep
//   selectBy    – "name" (highlight/track by item name, e.g. income source) or
//                 "icon" (track by icon key, e.g. subscription/goal category)
//   selectedValue / onSelect({ name, icon }) – controlled selection
//   ModalComponent – the shared Modal (passed in to avoid a circular import)
const EditableCategorySelector = ({
  label,
  manageTitle,
  itemNoun = "item",
  api,
  iconPalette,
  max = 9,
  selectBy = "name",
  selectedValue,
  onSelect,
  ModalComponent,
}) => {
  const DEFAULT_ICON = iconPalette[0].key;
  const [items, setItems] = useState([]);
  const [manageOpen, setManageOpen] = useState(false);
  // editor: null when closed; otherwise { id?, origName?, name, icon }.
  const [editor, setEditor] = useState(null);

  const loadItems = async () => {
    try {
      const res = await axiosInstance.get(api.GET_ALL);
      setItems(res.data || []);
    } catch (error) {
      console.error(`Failed to load ${itemNoun} list:`, error);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axiosInstance.get(api.GET_ALL);
        if (active) setItems(res.data || []);
      } catch (error) {
        console.error(`Failed to load ${itemNoun} list:`, error);
      }
    })();
    return () => {
      active = false;
    };
    // api.GET_ALL is a stable string constant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const atMax = items.length >= max;

  // Whether an item is the currently-selected one, per the chosen tracking key.
  const isSelected = (item) =>
    selectBy === "icon" ? item.icon === selectedValue : item.name === selectedValue;

  const openAdd = () => setEditor({ name: "", icon: DEFAULT_ICON });
  const openEdit = (item) =>
    setEditor({
      id: item._id,
      origName: item.name,
      origIcon: item.icon || DEFAULT_ICON,
      name: item.name,
      icon: item.icon || DEFAULT_ICON,
    });
  const closeEditor = () => setEditor(null);

  const openManage = () => {
    setEditor(null);
    setManageOpen(true);
  };
  const closeManage = () => {
    setEditor(null);
    setManageOpen(false);
  };

  const saveEditor = async () => {
    const name = editor.name.trim();
    if (!name) {
      toast.error("Name is required.");
      return;
    }
    try {
      if (editor.id) {
        await axiosInstance.put(api.UPDATE(editor.id), {
          name,
          icon: editor.icon,
        });
        // Keep the parent form's selection in sync if the renamed/re-iconed
        // item is the one currently selected.
        const wasSelected =
          selectBy === "icon"
            ? editor.origIcon === selectedValue
            : editor.origName === selectedValue;
        if (wasSelected) onSelect({ name, icon: editor.icon });
        toast.success("Saved");
      } else {
        await axiosInstance.post(api.ADD, { name, icon: editor.icon });
        toast.success("Added");
      }
      setEditor(null);
      await loadItems();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to save ${itemNoun}.`);
    }
  };

  const deleteItem = async (item) => {
    try {
      await axiosInstance.delete(api.DELETE(item._id));
      toast.success("Deleted");
      if (isSelected(item)) onSelect({ name: "", icon: "" });
      if (editor?.id === item._id) setEditor(null);
      await loadItems();
    } catch {
      toast.error(`Failed to delete ${itemNoun}.`);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <label className="text-[13px] text-slate-800 dark:text-gray-200">{label}</label>
        <button
          type="button"
          onClick={openManage}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover cursor-pointer"
        >
          <LuPencil className="text-xs" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        {items.map((item) => {
          const option = getIconOption(item.icon);
          const isActive = isSelected(item);
          return (
            <button
              key={item._id}
              type="button"
              onClick={() => onSelect({ name: item.name, icon: item.icon })}
              aria-pressed={isActive}
              title={item.name}
              className={`h-[72px] md:h-[84px] w-full flex flex-col items-center justify-center gap-1 px-1 rounded-lg border transition-colors cursor-pointer ${
                isActive
                  ? "border-primary bg-purple-50 dark:bg-purple-500/10 text-primary"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              {option ? (
                <option.Icon className="text-xl md:text-2xl shrink-0" />
              ) : (
                <LuEllipsis className="text-xl md:text-2xl shrink-0" />
              )}
              <span className="w-full text-xs font-medium text-center leading-tight line-clamp-2 break-words">
                {item.name}
              </span>
            </button>
          );
        })}

        {items.length === 0 && (
          <p className="col-span-3 text-xs text-gray-400 py-2">
            None yet — tap Edit to add one.
          </p>
        )}
      </div>

      {/* Manage modal — opens on top of the Add form modal. */}
      <ModalComponent isOpen={manageOpen} onClose={closeManage} title={manageTitle}>
        <div className="space-y-2">
          {items.map((item) => {
            const option = getIconOption(item.icon);
            return (
              <div
                key={item._id}
                className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700/50 rounded-full text-gray-700 dark:text-gray-200">
                  {option ? <option.Icon /> : <LuEllipsis />}
                </div>
                <span className="flex-1 min-w-0 truncate text-sm text-gray-700 dark:text-gray-200">
                  {item.name}
                </span>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  aria-label={`Edit ${item.name}`}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-primary cursor-pointer"
                >
                  <LuPencil className="text-sm" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem(item)}
                  aria-label={`Delete ${item.name}`}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 cursor-pointer"
                >
                  <LuTrash2 className="text-sm" />
                </button>
              </div>
            );
          })}
          {items.length === 0 && (
            <p className="text-sm text-gray-400">Nothing here yet.</p>
          )}
        </div>

        {editor ? (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p className="text-[13px] font-medium text-slate-800 dark:text-gray-200 mb-2">
              {editor.id ? `Edit ${itemNoun}` : `New ${itemNoun}`}
            </p>

            <input
              type="text"
              value={editor.name}
              onChange={(e) => setEditor({ ...editor, name: e.target.value })}
              placeholder="Name"
              className="w-full text-sm bg-white dark:bg-gray-800 rounded px-3 py-2 border border-slate-200 dark:border-gray-700 outline-none mb-3"
            />

            <div className="grid grid-cols-6 gap-2 mb-3">
              {iconPalette.map((opt) => {
                const active = editor.icon === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setEditor({ ...editor, icon: opt.key })}
                    title={opt.label}
                    className={`flex items-center justify-center py-2 rounded-lg border cursor-pointer ${
                      active
                        ? "border-primary bg-purple-50 dark:bg-purple-500/10 text-primary"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800"
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
                className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg cursor-pointer"
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
        ) : atMax ? (
          <p className="text-xs text-gray-400 text-center">
            Maximum of {max} reached — delete one to add another.
          </p>
        ) : (
          <button
            type="button"
            onClick={openAdd}
            className="add-btn w-full justify-center"
          >
            <LuPlus /> Add {itemNoun}
          </button>
        )}
      </ModalComponent>
    </div>
  );
};

export default EditableCategorySelector;
