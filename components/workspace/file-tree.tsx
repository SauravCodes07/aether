"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileJson,
  FileText,
  FileType,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  MoveUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FILE_TREE_ITEM_VARIANTS,
  MICRO_INTERACTION_VARIANTS,
  MICRO_INTERACTION_TRANSITION,
} from "@/lib/motion";

export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  children?: FileNode[];
  content?: string;
};

type FileTreeProps = {
  nodes: FileNode[];
  onNodeSelect?: (node: FileNode) => void;
  onNodeCreate?: (parentId: string | null, type: "file" | "folder", name: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeRename?: (nodeId: string, newName: string) => void;
  onNodeMove?: (nodeId: string, newParentId: string | null) => void;
  selectedNodeId?: string | null;
};

function getFileIcon(name: string): React.ComponentType<{ className?: string }> {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return FileCode;
    case "json":
      return FileJson;
    case "md":
      return FileText;
    case "css":
    case "scss":
      return FileType;
    default:
      return File;
  }
}

function FileTreeItem({
  node,
  depth,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  selectedId,
  expandedIds,
  onToggleExpand,
}: {
  node: FileNode;
  depth: number;
  onSelect?: (node: FileNode) => void;
  onCreate?: (parentId: string | null, type: "file" | "folder", name: string) => void;
  onDelete?: (nodeId: string) => void;
  onRename?: (nodeId: string, newName: string) => void;
  selectedId?: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}) {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const isFolder = node.type === "folder";
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [showMenu, setShowMenu] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const handleRenameSubmit = useCallback(() => {
    if (renameValue.trim() && renameValue !== node.name) {
      onRename?.(node.id, renameValue.trim());
    }
    setIsRenaming(false);
  }, [renameValue, node.id, node.name, onRename]);

  const handleCreateSubmit = useCallback(
    (type: "file" | "folder") => {
      if (newItemName.trim()) {
        onCreate?.(node.id, type, newItemName.trim());
      }
      setIsCreating(false);
      setNewItemName("");
    },
    [newItemName, node.id, onCreate],
  );

  const FileIcon = isFolder
    ? isExpanded
      ? FolderOpen
      : Folder
    : getFileIcon(node.name);

  return (
    <motion.div
      variants={FILE_TREE_ITEM_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="select-none"
    >
      <div
        className={cn(
          "group relative flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors",
          isSelected
            ? "bg-white/10 text-white"
            : "text-white/60 hover:bg-white/5 hover:text-white/80",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            onToggleExpand(node.id);
          }
          onSelect?.(node);
        }}
        role="treeitem"
        aria-expanded={isFolder ? isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={0}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(true);
        }}
      >
        {isFolder && (
          <motion.span
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          </motion.span>
        )}

        <FileIcon className="h-4 w-4 shrink-0" />

        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            className="flex-1 bg-white/10 px-1 py-0 text-sm outline-none rounded"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{node.name}</span>
        )}

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isFolder && (
            <motion.button
              className="rounded p-0.5 hover:bg-white/10 transition-colors"
              variants={MICRO_INTERACTION_VARIANTS}
              whileHover="hover"
              whileTap="tap"
              transition={MICRO_INTERACTION_TRANSITION}
              onClick={(e) => {
                e.stopPropagation();
                setIsCreating(true);
              }}
              aria-label="Add item"
            >
              <Plus className="h-3 w-3" />
            </motion.button>
          )}
          <button
            className="rounded p-0.5 hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
              setRenameValue(node.name);
            }}
            aria-label="Rename"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            className="rounded p-0.5 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(node.id);
            }}
            aria-label="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {isCreating && (
        <div
          className="flex items-center gap-1.5 rounded-md px-2 py-1"
          style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
        >
          <span className="text-xs text-white/40">Create:</span>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onBlur={() => setIsCreating(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateSubmit(newItemName.includes(".") ? "file" : "folder");
              if (e.key === "Escape") setIsCreating(false);
            }}
            placeholder="name.ts"
            className="flex-1 bg-white/10 px-1 py-0 text-xs outline-none rounded"
            autoFocus
          />
        </div>
      )}

      {isFolder && isExpanded && node.children && (
        <AnimatePresence>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              onCreate={onCreate}
              onDelete={onDelete}
              onRename={onRename}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export function FileTree({
  nodes,
  onNodeSelect,
  onNodeCreate,
  onNodeDelete,
  onNodeRename,
  onNodeMove,
  selectedNodeId,
}: FileTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    function collectFolderIds(list: FileNode[]) {
      for (const n of list) {
        if (n.type === "folder") {
          ids.add(n.id);
          if (n.children) collectFolderIds(n.children);
        }
      }
    }
    collectFolderIds(nodes);
    return ids;
  });

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <nav className="flex flex-col gap-1 py-2" role="tree" aria-label="File tree">
      <AnimatePresence>
        {nodes.map((node) => (
          <FileTreeItem
            key={node.id}
            node={node}
            depth={0}
            onSelect={onNodeSelect}
            onCreate={onNodeCreate}
            onDelete={onNodeDelete}
            onRename={onNodeRename}
            selectedId={selectedNodeId}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </AnimatePresence>
    </nav>
  );
}