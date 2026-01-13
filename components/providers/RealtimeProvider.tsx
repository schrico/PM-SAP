"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/useSupabase";
import { queryKeys } from "@/lib/queryKeys";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

type PostgresChangeEvent = "INSERT" | "UPDATE" | "DELETE";

interface RealtimeContextValue {
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  isConnected: false,
});

export function useRealtime() {
  return useContext(RealtimeContext);
}

interface RealtimeProviderProps {
  children: ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Handler for projects table changes
  const handleProjectsChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      const eventType = payload.eventType as PostgresChangeEvent;
      const newRecord = payload.new as Record<string, unknown> | undefined;
      const oldRecord = payload.old as Record<string, unknown> | undefined;

      console.log("[Realtime] projects change:", eventType, {
        new: newRecord,
        old: oldRecord,
      });

      // Invalidate relevant queries based on event type
      if (eventType === "INSERT" || eventType === "DELETE") {
        // List queries need refresh
        queryClient.invalidateQueries({
          queryKey: ["projects-with-translators"],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.homeManageProjectsCount(),
        });
      }

      if (eventType === "UPDATE" && newRecord?.id) {
        // Invalidate specific project query
        queryClient.invalidateQueries({
          queryKey: queryKeys.project(newRecord.id as number),
        });
        // Also invalidate list queries in case status/deadline changed
        queryClient.invalidateQueries({
          queryKey: ["projects-with-translators"],
        });
      }

      if (eventType === "DELETE" && oldRecord?.id) {
        // Remove from cache
        queryClient.removeQueries({
          queryKey: queryKeys.project(oldRecord.id as number),
        });
        queryClient.invalidateQueries({
          queryKey: ["projects-with-translators"],
        });
      }
    },
    [queryClient]
  );

  // Handler for projects_assignment table changes
  const handleAssignmentChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      const eventType = payload.eventType as PostgresChangeEvent;
      const newRecord = payload.new as Record<string, unknown> | undefined;
      const oldRecord = payload.old as Record<string, unknown> | undefined;

      console.log("[Realtime] projects_assignment change:", eventType, {
        new: newRecord,
        old: oldRecord,
      });

      const projectId = (newRecord?.project_id ??
        oldRecord?.project_id) as number | undefined;
      const userId = (newRecord?.user_id ?? oldRecord?.user_id) as
        | string
        | undefined;

      if (projectId) {
        // Invalidate the specific project (translator list changed)
        queryClient.invalidateQueries({
          queryKey: queryKeys.project(projectId),
        });
      }

      if (userId) {
        // Invalidate the user's "my projects" view
        queryClient.invalidateQueries({
          queryKey: queryKeys.myProjects(userId),
        });
        // Invalidate home counts for this user
        queryClient.invalidateQueries({
          queryKey: queryKeys.homeMyProjectsCount(userId),
        });
      }

      // Always invalidate the projects list with translators
      queryClient.invalidateQueries({
        queryKey: ["projects-with-translators"],
      });
    },
    [queryClient]
  );

  useEffect(() => {
    // Create a single channel for all database changes
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        handleProjectsChange
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects_assignment",
        },
        handleAssignmentChange
      )
      .subscribe((status) => {
        console.log("[Realtime] Subscription status:", status);
        setIsConnected(status === "SUBSCRIBED");

        if (status === "SUBSCRIBED") {
          console.log(
            "[Realtime] Successfully subscribed to database changes"
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            "[Realtime] Channel error - check if tables are in supabase_realtime publication"
          );
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      console.log("[Realtime] Cleaning up subscription");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [supabase, handleProjectsChange, handleAssignmentChange]);

  return (
    <RealtimeContext.Provider value={{ isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
}
