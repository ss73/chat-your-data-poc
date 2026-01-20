import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import type { Node, Edge, NodeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const POSITIONS_STORAGE_KEY = 'erd-node-positions';

function getSavedPositions(datasetId: string): Record<string, { x: number; y: number }> {
  try {
    const stored = localStorage.getItem(`${POSITIONS_STORAGE_KEY}-${datasetId}`);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function savePositions(datasetId: string, positions: Record<string, { x: number; y: number }>) {
  localStorage.setItem(`${POSITIONS_STORAGE_KEY}-${datasetId}`, JSON.stringify(positions));
}

export interface TableColumn {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: { table: string; column: string };
}

export interface TableSchema {
  name: string;
  columns: TableColumn[];
}

export interface ERDSchema {
  tables: TableSchema[];
}

interface ERDDiagramProps {
  schema: ERDSchema;
  datasetId: string;
}

function TableNode({ data }: { data: { label: string; columns: TableColumn[] } }) {
  return (
    <div className="erd-table-node">
      <Handle type="target" position={Position.Left} className="erd-handle" />
      <Handle type="source" position={Position.Right} className="erd-handle" />
      <div className="erd-table-header">{data.label}</div>
      <div className="erd-table-columns">
        {data.columns.map((col) => (
          <div key={col.name} className="erd-column">
            <span className="erd-column-keys">
              {col.isPrimaryKey && <span className="erd-pk" title="Primary Key">PK</span>}
              {col.isForeignKey && <span className="erd-fk" title="Foreign Key">FK</span>}
            </span>
            <span className="erd-column-name">{col.name}</span>
            <span className="erd-column-type">{col.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const nodeTypes = {
  tableNode: TableNode,
};

export function ERDDiagram({ schema, datasetId }: ERDDiagramProps) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const savedPositions = getSavedPositions(datasetId);

    // Calculate layout - arrange tables in a grid
    const cols = Math.ceil(Math.sqrt(schema.tables.length));
    const nodeWidth = 220;
    const nodeHeight = 200;
    const gapX = 100;
    const gapY = 80;

    schema.tables.forEach((table, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const defaultPosition = {
        x: col * (nodeWidth + gapX),
        y: row * (nodeHeight + gapY)
      };

      nodes.push({
        id: table.name,
        type: 'tableNode',
        position: savedPositions[table.name] || defaultPosition,
        data: {
          label: table.name,
          columns: table.columns
        },
      });

      // Create edges for foreign keys
      table.columns.forEach((col) => {
        if (col.isForeignKey && col.references) {
          edges.push({
            id: `${table.name}-${col.name}-${col.references.table}`,
            source: table.name,
            target: col.references.table,
            type: 'smoothstep',
            style: { stroke: '#6b7280', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#6b7280',
            },
            label: col.name,
            labelStyle: { fontSize: 10, fill: '#6b7280' },
            labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
          });
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [schema, datasetId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);

    // Save positions after drag ends
    const hasDragEnd = changes.some(
      (change) => change.type === 'position' && 'dragging' in change && !change.dragging
    );
    if (hasDragEnd) {
      setNodes((currentNodes) => {
        const positions: Record<string, { x: number; y: number }> = {};
        currentNodes.forEach((node) => {
          positions[node.id] = node.position;
        });
        savePositions(datasetId, positions);
        return currentNodes;
      });
    }
  }, [onNodesChange, datasetId, setNodes]);

  return (
    <div className="erd-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
      </ReactFlow>
    </div>
  );
}
