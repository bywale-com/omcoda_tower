/** Collect ids of nodes that have children — used to start trees collapsed. */
export function collectExpandableIds(nodes: { id: string; children: { id: string; children: unknown[] }[] }[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.children.length > 0) {
      ids.push(node.id);
      ids.push(...collectExpandableIds(node.children as { id: string; children: { id: string; children: unknown[] }[] }[]));
    }
  }
  return ids;
}
