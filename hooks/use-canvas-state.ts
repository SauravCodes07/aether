"use client";

import { useCallback, useRef, useState } from "react";
import type { CanvasNode, CanvasEdge, CanvasViewport } from "@/lib/validation/schemas";

type CanvasState = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: CanvasViewport;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
};

const initialCanvasState: CanvasState = {
  nodes: [],
  edges: [],
  viewport: { panX: 0, panY: 0, scale: 1 },
  selectedNodeIds: [],
  selectedEdgeIds: [],
};

/**
 * Phase 6: Spatial Canvas Engine — Node Management
 * Manages add, update, remove operations for canvas nodes and edges
 * within a unified application state engine.
 */
export function useCanvasState(initial?: Partial<CanvasState>) {
  const [state, setState] = useState<CanvasState>({
    ...initialCanvasState,
    ...(initial?.nodes ? { nodes: initial.nodes } : {}),
    ...(initial?.edges ? { edges: initial.edges } : {}),
    ...(initial?.viewport ? { viewport: initial.viewport } : {}),
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const addNode = useCallback((node: Omit<CanvasNode, "id"> & { id?: string }) => {
    const id = node.id ?? crypto.randomUUID();
    const newNode: CanvasNode = { ...node, id } as CanvasNode;
    setState((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    return id;
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<CanvasNode>) => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  }, []);

  const removeNode = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== id),
      edges: prev.edges.filter((e) => e.source_node_id !== id && e.target_node_id !== id),
      selectedNodeIds: prev.selectedNodeIds.filter((nid) => nid !== id),
    }));
  }, []);

  const addEdge = useCallback((edge: Omit<CanvasEdge, "id"> & { id?: string }) => {
    const id = edge.id ?? crypto.randomUUID();
    const newEdge: CanvasEdge = { ...edge, id } as CanvasEdge;
    setState((prev) => ({ ...prev, edges: [...prev.edges, newEdge] }));
    return id;
  }, []);

  const updateEdge = useCallback((id: string, updates: Partial<CanvasEdge>) => {
    setState((prev) => ({
      ...prev,
      edges: prev.edges.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, []);

  const removeEdge = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      edges: prev.edges.filter((e) => e.id !== id),
      selectedEdgeIds: prev.selectedEdgeIds.filter((eid) => eid !== id),
    }));
  }, []);

  const setViewport = useCallback((viewport: Partial<CanvasViewport>) => {
    setState((prev) => ({
      ...prev,
      viewport: { ...prev.viewport, ...viewport },
    }));
  }, []);

  const selectNode = useCallback((id: string, multi = false) => {
    setState((prev) => ({
      ...prev,
      selectedNodeIds: multi
        ? prev.selectedNodeIds.includes(id)
          ? prev.selectedNodeIds.filter((nid) => nid !== id)
          : [...prev.selectedNodeIds, id]
        : [id],
      selectedEdgeIds: multi ? prev.selectedEdgeIds : [],
    }));
  }, []);

  const selectEdge = useCallback((id: string, multi = false) => {
    setState((prev) => ({
      ...prev,
      selectedEdgeIds: multi
        ? prev.selectedEdgeIds.includes(id)
          ? prev.selectedEdgeIds.filter((eid) => eid !== id)
          : [...prev.selectedEdgeIds, id]
        : [id],
      selectedNodeIds: multi ? prev.selectedNodeIds : [],
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedNodeIds: [],
      selectedEdgeIds: [],
    }));
  }, []);

  const getNode = useCallback(
    (id: string) => stateRef.current.nodes.find((n) => n.id === id),
    [],
  );

  const getEdge = useCallback(
    (id: string) => stateRef.current.edges.find((e) => e.id === id),
    [],
  );

  const getConnectedEdges = useCallback(
    (nodeId: string) =>
      stateRef.current.edges.filter(
        (e) => e.source_node_id === nodeId || e.target_node_id === nodeId,
      ),
    [],
  );

  return {
    ...state,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    updateEdge,
    removeEdge,
    setViewport,
    selectNode,
    selectEdge,
    clearSelection,
    getNode,
    getEdge,
    getConnectedEdges,
  };
}