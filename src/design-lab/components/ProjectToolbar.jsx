"use client";

import {
  ChevronDown,
  Archive,
  Code2,
  Download,
  FilePlus2,
  FolderOpen,
  Save,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

export default function ProjectToolbar({
  projectName,
  onProjectNameChange,
  onNew,
  onSave,
  onOpen,
  onExportHtml,
  onExportZip,
}) {
  const inputRef =
    useRef(null);

  const [
    showExportMenu,
    setShowExportMenu,
  ] = useState(false);

  function handleOpenFile(event) {
    const file =
      event.target.files?.[0];

    if (file) {
      onOpen(file);
    }

    event.target.value =
      "";
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-2">
      <input
        ref={inputRef}
        type="file"
        accept=".laz,application/json,.json"
        onChange={
          handleOpenFile
        }
        className="hidden"
      />

      <button
        type="button"
        onClick={
          onNew
        }
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.05]"
      >
        <FilePlus2 className="h-4 w-4" />
        New
      </button>

      <button
        type="button"
        onClick={() =>
          inputRef.current?.click()
        }
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.05]"
      >
        <FolderOpen className="h-4 w-4" />
        Open
      </button>

      <button
        type="button"
        onClick={
          onSave
        }
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.05]"
      >
        <Save className="h-4 w-4" />
        Save
      </button>

      <div className="mx-1 hidden h-7 w-px bg-white/10 sm:block" />

      <input
        type="text"
        value={
          projectName
        }
        onChange={(event) =>
          onProjectNameChange(
            event.target.value,
          )
        }
        className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-medium text-white outline-none focus:border-[#D4AF37]/50"
        placeholder="Project name"
      />

      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setShowExportMenu(
              (current) =>
                !current,
            )
          }
          className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-black"
        >
          <Download className="h-4 w-4" />

          Export

          <ChevronDown className="h-4 w-4" />
        </button>

        {showExportMenu && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-[5000] w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F18] p-2 shadow-2xl shadow-black/60">
            <button
              type="button"
              onClick={() => {
                onExportHtml();

                setShowExportMenu(
                  false,
                );
              }}
              className="flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-white/[0.05]"
            >
              <Code2 className="mt-0.5 h-5 w-5 text-[#D4AF37]" />

              <span>
                <span className="block text-sm font-semibold text-white">
                  Static HTML
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Export a standalone
                  HTML website containing
                  the current scene and
                  styling.
                </span>
              </span>
            </button>

            <div className="my-2 h-px bg-white/10" />

            <button
              type="button"
              onClick={async () => {
                await onExportZip();

                setShowExportMenu(
                  false,
                );
              }}
              className="flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-white/[0.05]"
            >
              <Archive className="mt-0.5 h-5 w-5 text-[#A78BFA]" />

              <span>
                <span className="block text-sm font-semibold text-white">
                  Project ZIP
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Export index.html, CSS,
                  JavaScript and all project
                  images as a portable website
                  folder.
                </span>
              </span>
            </button>

            <div className="my-2 h-px bg-white/10" />

            <div className="px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Next Export Target
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Next.js project generation
                will come after the static
                project exporter is stable.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}