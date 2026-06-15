"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfig } from "@/config/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type PresenceUser = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  color: string;
  cursor: { x: number; y: number } | null;
  viewport: { panX: number; panY: number; scale: number } | null;
  lastSeen: number;
};

type PresenceState = Record<string, PresenceUser>;

const USER_COLORS = [
  "#A871F7", // violet
  "#22D3EE", // cyan
  "#FB923C", // orange
  "#4ADE80", // green
  "#F472B6", // pink
  "#FBBF24", // amber
  "#60A5FA", // blue
  "#FB7185", // rose
];

/**
 * Phase 7: Collaboration System — Supabase Presence.
 * Tracks live user presence in a workspace channel,
 * broadcasting cursor positions and viewport state.
 */
export function usePresence(workspaceId: string, userId: string, userName: string) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const colorRef = useRef(USER_COLORS[0]);

  useEffect(() => {
    // Assign a color based on userId hash
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
    }
    colorRef.current = USER_COLORS[Math.abs(hash) % USER_COLORS.length];
  }, [userId]);

  const connect = useCallback(
    (initialCursor?: { x: number; y: number }, initialViewport?: { panX: number; panY: number; scale: number }) => {
      if (channelRef.current) return;

      const supabase = createClient();
      const channelName = `${supabaseConfig.realtime.channelPrefixes.presence}:${workspaceId}`;

      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState<PresenceUser>();
          const present: PresenceUser[] = [];

          for (const key of Object.keys(state)) {
            const presences = state[key];
            if (presences && presences.length > 0) {
              present.push(presences[0]);
            }
          }

          setUsers(present);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              userId,
              name: userName,
              avatarUrl: null,
              color: colorRef.current,
              cursor: initialCursor ?? null,
              viewport: initialViewport ?? null,
              lastSeen: Date.now(),
            });
          }
        });

      channelRef.current = channel;
    },
    [workspaceId, userId, userName],
  );

  const updateCursor = useCallback((x: number, y: number) => {
    if (!channelRef.current) return;
    channelRef.current.track({
      cursor: { x, y },
      lastSeen: Date.now(),
    });
  }, []);

  const updateViewport = useCallback((viewport: { panX: number; panY: number; scale: number }) => {
    if (!channelRef.current) return;
    channelRef.current.track({
      viewport,
      lastSeen: Date.now(),
    });
  }, []);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabaseConfig.realtime.channelPrefixes.presence;
      channelRef.current = null;
    }
    setUsers([]);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    users,
    connect,
    disconnect,
    updateCursor,
    updateViewport,
  };
}