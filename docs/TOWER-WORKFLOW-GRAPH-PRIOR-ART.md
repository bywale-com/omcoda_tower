# Tower workflow graph prior art

Research date: 2026-10-19. Continues [`TOWER-LOAD-BEARING-ARCHITECTURE-DOSSIER.md`](TOWER-LOAD-BEARING-ARCHITECTURE-DOSSIER.md) and [`TOWER-ARCHITECTURE-PRIOR-ART.md`](TOWER-ARCHITECTURE-PRIOR-ART.md).

Scope: the node editor on `/prototype-ant` and the walker that runs the saved graph. Research only. No application code was changed.

This is not a recommendation to support arbitrary graphs. The walker header says it does not walk free-form graphs. The production systems below are evidence for the mechanisms Tower already needs: a constrained canvas, a real topology check, one execution order, and a run that can park and resume.

## How a claim is graded

| Grade | Meaning |
| --- | --- |
| Verified | Read in this pass from a Tower file or a fetched upstream file. |
| Inference | A conclusion from those files. |
| Unresolved | Not closed in this pass. |

## Decision

Keep `@xyflow/react` as the canvas and `walkValidatedWorkflow` as the interpreter. Do not adopt n8n, its `DirectedGraph`, or a general workflow engine.

Reuse three small patterns, as code Tower owns:

1. A connection predicate. React Flow will draw whatever edges the application stores. Validity is an application function.
2. An explicit topology check before Launch: one trigger, every node reachable from it, no cycle, branch handles match the edges, at most one incoming edge per node.
3. A graph revision stored on the run. Resume must walk the graph that parked, not whatever Save wrote later.

n8n’s partial-execution package is the reference for how a mature editor treats cycles, “run to this node,” and multi-input readiness. It is also the demonstration that those problems are large once the graph is arbitrary. Tower’s product shape is a chain that branches at If and Switch. Do not import that package to get there.

## What Tower does

Product canvas: `src/app/register/prototype-ant/operator/AntAutomationWorkbench.tsx`. Hub’s `AutomationWorkflowEditor.tsx` is a second editor. The product path is the Ant workbench.

### Authoring

The canvas is `ReactFlow` with `useNodesState` and `useEdgesState` (lines 8–10, 527, 1129–1159). There is no `onConnect`, no `isValidConnection`, and no `nodesConnectable={false}`.

Nodes are added from the Build column. `addBlock` appends after the visually lowest node via `appendNodeAfter`, then `relayoutWorkflowNodes` (lines 748–758). If and Switch add a successor with `insertKindAfter`, which splices with `insertNodeOnEdge` when that handle already has an edge (lines 766–779). Edge-drop insert uses the same pair (lines 810–821).

`appendNodeAfter` and `insertNodeOnEdge` live in `src/app/data/automationWorkflows.ts` (lines 1372–1481). Handles are stored on the edge as `sourceHandle`. If uses `"true"` / `"false"`. Switch uses one handle per path plus `fallback`.

Layout is not a graph ranker. `relayoutWorkflowNodes` (lines 1417–1433) groups nodes whose `y` differs by less than 80 and rewrites `y` to `rowIndex * 148`. `x` is left as the insert function set it.

Delete is two different functions:

- The node menu calls `deleteWorkflowNode` (workbench lines 801–804). That function bridges incoming edges to outgoing edges and skips a bridge that would point a node at itself (`automationWorkflows.ts` lines 1504–1539).
- The canvas `onNodesDelete` handler and the Remove button only filter the node and its edges (workbench lines 1142–1173). They do not bridge.

Dragging a handle does not persist an edge, because nothing handles `onConnect`. The library still allows the drag gesture. `nodesDraggable` is left at the React Flow default, so position changes are real and Save persists them inside the node objects.

### What the library actually checks

Verified from xyflow `packages/system/src/utils/graph.ts` on `main`: [`graph.ts`](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts).

`getOutgoers` and `getIncomers` filter the edge array by `source` or `target`. They do not look at handles, types, or cycles. `getConnectedEdges` keeps an edge if either end is in the node set. `getElementsToRemove` honors `deletable === false` and `onBeforeDelete`. None of these functions reject a bad graph.

The current Validation example ([`examples/react/src/examples/Validation/index.tsx`](https://github.com/xyflow/xyflow/blob/main/examples/react/src/examples/Validation/index.tsx)) sets `isValidConnection` to `connection.target === 'B'`. The edge is added only inside `onConnect` via `addEdge`. The example also shows `onBeforeDelete` and `reconnectEdge`. Cycle detection is not in that example and not in `graph.ts`.

Save/restore ([`SaveRestore/Controls.tsx`](https://github.com/xyflow/xyflow/blob/main/examples/react/src/examples/SaveRestore/Controls.tsx)) calls `toObject()` and stores the result in `localforage`, including the viewport. That is a browser cache of the canvas, not a server draft.

Inference: React Flow is the interaction surface. Topology, drafts, and execution are Tower’s.

### Persistence, Save, Run, Launch

`handleSave` (workbench lines 933–953) writes `{ nodes, edges }` through `createWorkflow`. The server upserts `workflow.graph` and does not bump a revision (`server/wire-service/machine.ts` `handleWorkflowCreate`, lines 56–65). No `workflow_version` table exists in `supabase/migrations`.

The same handler materializes `workflow_trigger` rows and restamps open `wait_occupancy` titles (lines 82–87). `workflow_state` is inserted as `draft` and left alone on conflict (lines 67–70). So Save updates the graph and the trigger rows of a draft without arming it.

`dispatchEventToWorkflows` requires `workflow_state.status = 'active'` (`workflowWalk.ts` line 1933). Webhook and schedule dispatch do the same (machine.ts line 885, workflowWalk.ts line 1818). Launch is `handleWorkflowActivate` (machine.ts lines 129–160): set `active`, materialize triggers again.

Run (`handleRun`, workbench lines 986–1017) refuses to start unless the trigger node has test writes, Save’s first, then `startManualRun` with `untilNodeId` when the user chooses Run to here. The server inserts a new `workflow_run` and calls `walkValidatedWorkflow` (`handleWorkflowRunStart`, machine.ts lines 177–204). There is no idempotency key on that insert.

### Execution

`walkValidatedWorkflow` (`workflowWalk.ts` lines 1044–1684) loads `workflow.graph` at the start of every walk, including resume.

`isValidatedPipeline` (lines 97–109) is a set of node types. The name says “validated.” The function checks that some node is `trigger` and some node is one of action, exit, get, rule, branch, if, switch, or wait. It does not look at edges.

Start is `triggers[0]` (lines 1085–1089). A second trigger is never entered.

`visit` (lines 1128–1130) returns immediately if `nodeId` is already in `visited`. A cycle cannot spin. A second incoming edge also cannot run the node again. First arrival wins. Later parents are dropped. Depth-first order follows the edge array (`goOn` awaits each edge in order).

`outgoing` (lines 112–118) returns every edge from the node when the caller passes no handle. It also treats a missing `sourceHandle` on the edge as a match for a specific handle. If and Switch do not use it. They use `outgoingHandle` (lines 727–728), which requires an exact `sourceHandle`.

If with a person split saves `contactIds` and `previousWrites`, walks the `true` handle, restores the writes, walks `false`, then restores again (lines 1185–1195). Switch buckets contacts by the first matching path and walks each taken handle the same way (lines 1229–1248). One contact follows one path. The node does not wait for both branches to finish before a join, because there is no join.

A node with `configured === false` is marked failed and not continued (lines 1137–1143), except the trigger. An exception fails that node and does not continue (lines 1616–1621). There is no retry loop inside the walk.

Wait (lines 1527–1602) parks the whole run. Duration stores `resume_at`. Approval inserts `wait_occupancy` with `ON CONFLICT (workflow_run_id, wait_node_id, contact_id) DO NOTHING`. The function then returns. It does not walk past the wait. `resumeWaitRun` (lines 1722–1754) sets the run back to `running` and calls the walker with `resumeFromNodeId`. That path marks the wait visited, copies prior `node_status`, and continues from the wait’s outgoing edges (lines 1625–1638). `chainWrites` is a new empty object. The resume payload is the wait’s `previousWrites`, not the map of every earlier node.

`resumeDueWaitingRuns` (lines 1757–1807) selects `status = 'waiting' AND resume_at <= now()` with no row lock.

`untilNodeId` stops after the named node has been visited (`goOn`, lines 1123–1125). That is Run to here. It still executes that node. It does not rebuild a partial stack from pinned upstream data. Upstream nodes run again because the walk always starts at the trigger unless `resumeFromNodeId` is set.

Run results are painted onto the open canvas by `paintRunOntoNodes` (workbench lines 436–458). `workflow_run.node_status` is the stored history. There is no separate execution viewer in this workbench.

Action rows upsert on `act-${workflowId}-${nodeId}` (lines 1324–1337). `enrollAndActuate` is called once per contact on every visit (lines 1355–1371). A second Run creates another enrollment unless `enrollAndActuate` itself dedupes. This pass did not read that function’s conflict clause.

## How n8n implements the same mechanisms

n8n’s editor is Vue Flow, the Vue port of the same xyflow system. The execution model is not the canvas. The code that matters is `packages/core/src/execution-engine/partial-execution-utils/`.

### Graph structure

[`directed-graph.ts`](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/partial-execution-utils/directed-graph.ts). The file’s own comment says `Workflow` stores connections in a nested normalized form that is bad for incremental edits, so `DirectedGraph` is an adjacency structure with `fromWorkflow` and `toWorkflow`.

A connection is `{ from, to, type, outputIndex, inputIndex }`. The map key is `fromName-type-outputIndex-inputIndex-toName`. `addConnection` asserts both nodes are already in the graph. `removeNode({ reconnectConnections: true })` bridges every parent to every child, which is the same idea as Tower’s `deleteWorkflowNode`, except n8n keeps output type and input index.

`getChildren` stops when it sees a node already in the set. That prevents infinite recursion. It does not reject the cycle. `getStronglyConnectedComponents` is Tarjan. The comment states that a single node is a strongly connected component of size one, and that components do not overlap.

Tests: [`directed-graph.test.ts`](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/partial-execution-utils/__tests__/directed-graph.test.ts).

### Cycles during partial execution

[`handle-cycles.ts`](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/partial-execution-utils/handle-cycles.ts). The comment says a partial run must not start in the middle of a cycle, because the engine would have to decide which iteration to repeat. If a start node sits inside a component, the start is moved to the first node of that component reached by depth-first search from the trigger.

The comment says single-node components are uninteresting. The filter in the file is `cycle.size >= 1`, which keeps them. For a one-node component the replacement is the node itself, so the result does not change. The comment and the predicate disagree. Do not copy the predicate as “real cycles only.”

Tests: [`handle-cycles.test.ts`](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/partial-execution-utils/__tests__/handle-cycles.test.ts).

### Run to this node

[`find-start-nodes.ts`](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/partial-execution-utils/find-start-nodes.ts). From the trigger toward the destination, the first dirty node on each branch is a start. Dirty means the node has an error, or it has neither run data nor pinned data. Two of the dirtiness checks are still `TODO` and hardcoded false: “properties changed” and “parent disabled.”

A `splitInBatches` node with no data on its done output becomes the start, so a loop is not resumed mid-iteration. Seeing a node already on the path stops that branch.

[`recreate-node-execution-stack.ts`](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/partial-execution-utils/recreate-node-execution-stack.ts) rebuilds the engine’s stack from the graph plus stored run data. The comment says this is so a restarted execution runs only what is required to reach the destination. Disabled nodes are rejected. A start node whose parents do not all have data is placed on `waitingExecution` instead of the stack.

Tower’s Run to here does not do this. It rewalks from the trigger and stops after the chosen node. That is the smaller behavior, and it matches a graph with no pinned upstream run. It is the wrong behavior once a run has parked, or once Run to here must not repeat an action that already enrolled someone.

### Multiple parents

[`get-source-data-groups.ts`](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/partial-execution-utils/get-source-data-groups.ts). Incoming connections are grouped so each group has at most one connection per input index. `complete` is true only when every connection in the group has run data or pinned data. The file’s examples show two sources on the same input producing two runs, and a source with no data producing a group with `complete: false`.

`recreateNodeExecutionStack` pushes the node onto the execution stack only for a complete group. Incomplete groups go to `waitingExecution` through `addWaitingExecution`.

That is n8n’s join. It exists because n8n nodes have multiple typed inputs and the product allows several nodes to feed one input. Tower nodes have one target handle and no join node. Copying `waitingExecution` would invent a product concept the canvas does not have.

The failure mode n8n is solving, and Tower currently solves by accident: two incoming edges. Tower’s `visited` set drops the second parent. n8n either waits or runs again. For Tower the explicit rule should be: a node may have one incoming edge. Branching is outgoing handles, not a merge.

### What not to take from n8n

n8n’s graph is the product. Node types are an open catalog. Connections have a type and two indexes. Partial execution has pinned data, run indexes, and loop special cases. `find-start-nodes.ts` still contains unimplemented dirtiness checks. Adopting the package would mean adopting that model.

Vue Flow versus React Flow is not a reason to change canvas libraries. Both sit on xyflow. Tower already depends on `@xyflow/react` 12.11.0.

## Recommendations

| Mechanism | Call | What to do |
| --- | --- | --- |
| Canvas library | Keep | `@xyflow/react`. Do not add Vue Flow or n8n’s editor. |
| How nodes are added | Keep | Palette, append, insert-on-edge, handle-specific If/Switch. Do not turn on free `onConnect` as the authoring model. |
| Connection predicate | Adapt | If a handle drag is left enabled, `isValidConnection` must reject self-edges, edges into a trigger, a second incoming edge, and a second edge on the same source handle. Otherwise set `nodesConnectable={false}` so the drag does nothing. |
| Delete | Adapt | One function. The keyboard path and the Remove button should call `deleteWorkflowNode`, which already bridges and refuses a self-bridge. |
| Layout | Keep | The row snap is enough for a downward chain with horizontal branch offsets. A dagre/elk dependency is not justified by the current shape. |
| Topology check | Adapt | Replace the meaning of `isValidatedPipeline`. Before Launch, and on Run, reject: no trigger, more than one trigger, a node not reachable from the trigger, a cycle, an If/Switch edge whose `sourceHandle` is not one of that node’s handles, a node with two incoming edges. |
| Interpreter | Keep | `walkValidatedWorkflow`. Do not replace it with n8n’s execution engine. |
| Branch semantics | Keep | One path per contact. Person-split walks each taken handle with restored writes. |
| Multi-parent execution | Do not add | No join and no `waitingExecution`. Reject the second incoming edge at edit time so `visited` is not the only guard. |
| Cycles | Reject | Do not build loop nodes. n8n’s cycle handling exists to run loops partially. Tower has no loop node. |
| Save / Launch | Keep the split | Save writes the graph and stays draft. Launch sets `active`. Dispatch already requires `active`. |
| Graph identity for a run | Adapt | Store the graph, or a revision, on `workflow_run` when the run starts. Resume walks that snapshot. Today resume reloads `workflow.graph`, so a Save during a wait changes the remainder of the run. |
| Run to here | Keep, with a guard | Rewalk from the trigger is acceptable for a manual test. It is not acceptable if the walk repeats `enrollAndActuate`. The action upsert does not by itself dedupe enrollments. |
| Waits | Keep the park | Duration and approval already stop the walk. The due-wait query still has no row lock. That lock belongs to the worker recommendation in the prior-art document, not to a new engine. |
| Resume context | Adapt | `chainWrites` is empty on resume. Either persist `chainWrites` on the run, or define that a node after a wait may read only `previousWrites` from the wait. The code does the second and does not say so. |
| Run visualization | Keep the paint | `paintRunOntoNodes` plus `workflow_run.node_status` is the history. A second execution UI is not required for the mechanism. |
| Versions of published graphs | Investigate | One JSONB column is the current store. A version table is justified only if a parked run must survive a later Save, which the snapshot above already does without a full version product. |

## What Tower does not have, and should not invent yet

- A general DAG executor.
- A merge/join node. n8n’s `getSourceDataGroups` is the implementation, and it is the wrong product surface.
- Loop nodes. n8n treats `splitInBatches` as a special start so a partial run does not enter the middle of the loop.
- Pinned data separate from the graph. Tower’s trigger test writes live on the trigger node and are sent as the Run payload. The walker does not read `node.data.lastOutput` as the trigger input. Leave that split alone.
- React Flow `toObject()` into `localforage`. The server graph is the source. A browser copy would be a second draft.
- Automatic layout libraries. Not read in this pass beyond confirming xyflow’s `graph.ts` has no ranker. Unresolved only if a later design needs ranked layout of a true DAG. The current chain does not.

## Verification

| Check | Pass |
| --- | --- |
| Free connect | A handle drag does not create an edge, or `isValidConnection` refuses a second incoming edge, a self-edge, and an unknown If/Switch handle. |
| One delete | Keyboard delete and Remove node leave the same edges as `deleteWorkflowNode`, including the bridge. |
| Launch gate | A cycle, a disconnected node, or two triggers returns a validation error and does not set `workflow_state` to `active`. |
| First arrival | A graph that somehow has two incoming edges does not run the node twice. Prefer that this graph is rejected before the walk. |
| If / Switch | One contact is enrolled on one path. The other path does not see that contact. |
| Run to here | Nodes after the chosen id have no `node_status` success from that run. The chosen node does. |
| Wait | The walk stops. `workflow_run.status` is `waiting`. A second tick does not resume the same duration wait twice. |
| Resume snapshot | Save a different graph while a run is waiting. Resume follows the graph captured at park, not the new Save. |
| Draft vs armed | Save on a draft writes `workflow.graph` and leaves `workflow_state` as `draft`. An event does not start a run until Launch. |
| Repeated Run | Two manual Runs with the same test payload do not create two enrollments for the same contact and workflow node. This is the check that decides whether the action upsert is enough. |

## Unresolved

- Whether `enrollAndActuate` has its own unique conflict on `(firm, contact, sequence)`. The walker calls it in a loop and this pass stopped at the call.
- Whether React Flow 12.11 still shows a connection preview when `onConnect` is omitted. The edge is not stored either way. The predicate recommendation covers the case where that preview becomes a stored edge later.
- The Layouting example’s choice of elk or dagre. Not fetched. `graph.ts` itself has no layout algorithm. That is enough to reject adding one now.
- n8n’s editor-side `isValidConnection` in the Vue canvas. Not fetched. The execution-side cycle and multi-input behavior was fetched and is the part that would be copied by mistake.

## Sources

- Tower: `src/app/register/prototype-ant/operator/AntAutomationWorkbench.tsx`, `src/app/data/automationWorkflows.ts`, `server/wire-service/workflowWalk.ts`, `server/wire-service/machine.ts`.
- xyflow: [`packages/system/src/utils/graph.ts`](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts), [`Validation/index.tsx`](https://github.com/xyflow/xyflow/blob/main/examples/react/src/examples/Validation/index.tsx), [`SaveRestore/Controls.tsx`](https://github.com/xyflow/xyflow/blob/main/examples/react/src/examples/SaveRestore/Controls.tsx).
- n8n `partial-execution-utils` on `master`: [`directed-graph.ts`](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/partial-execution-utils/directed-graph.ts), [`handle-cycles.ts`](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/partial-execution-utils/handle-cycles.ts), [`find-start-nodes.ts`](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/partial-execution-utils/find-start-nodes.ts), [`recreate-node-execution-stack.ts`](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/partial-execution-utils/recreate-node-execution-stack.ts), [`get-source-data-groups.ts`](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/partial-execution-utils/get-source-data-groups.ts), and the `__tests__` files beside them.
