'use client';

import React from 'react';
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface WorkflowNode {
    id: string;
    name: string;
    type: string;
    position: [number, number];
    status: 'pending' | 'running' | 'success' | 'error';
    execution_time?: number;
    error?: string;
}

interface WorkflowConnection {
    from: string;
    to: string;
}

interface WorkflowGraphProps {
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
}

export default function WorkflowGraph({ nodes, connections }: WorkflowGraphProps) {
    // Convert to React Flow format with horizontal layout
    const flowNodes: Node[] = nodes.map((node, index) => ({
        id: node.id,
        type: 'custom',
        // Force horizontal layout: space nodes 250px apart horizontally
        position: { x: index * 250, y: 100 },
        data: {
            label: node.name,
            status: node.status,
            nodeType: node.type,
            executionTime: node.execution_time,
            error: node.error,
        },
    }));

    const flowEdges: Edge[] = connections.map((conn, idx) => ({
        id: `edge-${idx}`,
        source: conn.from,
        target: conn.to,
        animated: true,
        type: 'smoothstep',
        style: {
            stroke: '#94a3b8',
            strokeWidth: 2,
        },
    }));

    const [nodesState, , onNodesChange] = useNodesState(flowNodes);
    const [edgesState, , onEdgesChange] = useEdgesState(flowEdges);

    // Custom node renderer
    const nodeTypes = {
        custom: CustomNode,
    };

    return (
        <div className="w-full h-[500px] bg-white rounded-xl border border-slate-200 overflow-hidden">
            <ReactFlow
                nodes={nodesState}
                edges={edgesState}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.3}
                maxZoom={1.2}
                defaultViewport={{ x: 50, y: 50, zoom: 0.8 }}
            >
                <Background color="#f1f5f9" gap={16} />
                <Controls className="bg-white border border-slate-200 rounded-lg shadow-sm" />
                <MiniMap
                    className="bg-white border border-slate-200 rounded-lg shadow-sm"
                    nodeColor={(node) => {
                        const status = node.data.status;
                        if (status === 'success') return '#10b981';
                        if (status === 'error') return '#ef4444';
                        if (status === 'running') return '#3b82f6';
                        return '#cbd5e1';
                    }}
                />
            </ReactFlow>
        </div>
    );
}

// Custom Node Component with improved styling
function CustomNode({ data }: any) {
    const { label, status, nodeType, executionTime, error } = data;

    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'border-green-500 bg-white shadow-green-100';
            case 'error':
                return 'border-red-500 bg-white shadow-red-100';
            case 'running':
                return 'border-blue-500 bg-white shadow-blue-100 animate-pulse';
            default:
                return 'border-slate-300 bg-white shadow-slate-100';
        }
    };

    const getStatusIndicator = () => {
        switch (status) {
            case 'success':
                return <div className="w-3 h-3 rounded-full bg-green-500"></div>;
            case 'error':
                return <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>;
            case 'running':
                return <div className="w-3 h-3 rounded-full bg-blue-500 animate-spin border-2 border-white border-t-blue-500"></div>;
            default:
                return <div className="w-3 h-3 rounded-full bg-slate-300"></div>;
        }
    };

    const getNodeIcon = () => {
        const type = nodeType.toLowerCase();
        if (type.includes('schedule')) return '⏰';
        if (type.includes('webhook')) return '🔗';
        if (type.includes('google')) return '📊';
        if (type.includes('openai') || type.includes('ai')) return '🤖';
        if (type.includes('email') || type.includes('resend')) return '📧';
        if (type.includes('slack')) return '💬';
        if (type.includes('http')) return '🌐';
        if (type.includes('filter')) return '🔍';
        if (type.includes('code')) return '💻';
        if (type.includes('if')) return '🔀';
        return '⚙️';
    };

    return (
        <div
            className={`px-5 py-4 rounded-xl border-2 shadow-lg transition-all duration-300 min-w-[180px] max-w-[200px] ${getStatusColor()}`}
        >
            {/* Header with icon and status */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{getNodeIcon()}</span>
                {getStatusIndicator()}
            </div>

            {/* Node name */}
            <div className="font-semibold text-sm text-slate-900 mb-1 line-clamp-2">
                {label}
            </div>

            {/* Execution time */}
            {executionTime && (
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                    <span>⚡</span>
                    <span>{executionTime}ms</span>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded border border-red-200 line-clamp-2">
                    {error}
                </div>
            )}
        </div>
    );
}
