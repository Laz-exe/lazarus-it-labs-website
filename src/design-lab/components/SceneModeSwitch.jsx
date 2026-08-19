"use client";

import { Box, Square } from "lucide-react";

import { DOCUMENT_MODES } from "@/design-lab/engine/schema";

const MODES = [
  {
    value: DOCUMENT_MODES.TWO_D,
    label: "2D",
    description: "Current canvas workspace",
    Icon: Square,
  },
  {
    value: DOCUMENT_MODES.THREE_D,
    label: "3D",
    description: "Scene data active; renderer coming next",
    Icon: Box,
  },
];

export default function SceneModeSwitch({ mode, onModeChange }) {
  return (
    <section
      aria-label="Scene mode"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 6,
        border: "1px solid rgba(148, 163, 184, 0.22)",
        borderRadius: 12,
        background: "rgba(15, 23, 42, 0.78)",
      }}
    >
      {MODES.map(({ value, label, description, Icon }) => {
        const active = mode === value;

        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            title={description}
            onClick={() => onModeChange(value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              minHeight: 34,
              padding: "6px 10px",
              border: active
                ? "1px solid rgba(168, 85, 247, 0.9)"
                : "1px solid transparent",
              borderRadius: 8,
              color: active ? "#f8fafc" : "#94a3b8",
              background: active
                ? "linear-gradient(135deg, rgba(124, 58, 237, 0.34), rgba(37, 99, 235, 0.22))"
                : "transparent",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
            {label}
          </button>
        );
      })}
    </section>
  );
}
