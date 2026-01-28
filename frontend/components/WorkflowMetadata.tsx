'use client';

import { Badge } from '@/components/ui/badge';

interface WorkflowMetadataProps {
    workflow: {
        name: string;
        trigger_type: string;
        total_runs: number;
        last_run_at?: string;
    };
    execution: {
        status: string;
        started_at?: string;
        ended_at?: string;
        credits_used: number;
        error_message?: string;
    };
}

export default function WorkflowMetadata({ workflow, execution }: WorkflowMetadataProps) {
    const getTriggerIcon = () => {
        switch (workflow.trigger_type) {
            case 'schedule':
                return '⏰';
            case 'webhook':
                return '🔗';
            default:
                return '▶️';
        }
    };

    const getStatusBadge = () => {
        const status = execution.status?.toUpperCase();
        switch (status) {
            case 'SUCCESS':
                return <Badge className="bg-green-100 text-green-700 border-green-200">✅ Success</Badge>;
            case 'FAILED':
                return <Badge className="bg-red-100 text-red-700 border-red-200">⚠️ Failed</Badge>;
            case 'RUNNING':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200 animate-pulse">🔄 Running</Badge>;
            default:
                return <Badge className="bg-slate-100 text-slate-700 border-slate-200">{status}</Badge>;
        }
    };

    const calculateDuration = () => {
        if (!execution.started_at || !execution.ended_at) return null;
        const start = new Date(execution.started_at).getTime();
        const end = new Date(execution.ended_at).getTime();
        const durationMs = end - start;

        if (durationMs < 1000) return `${durationMs}ms`;
        if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)}s`;
        return `${(durationMs / 60000).toFixed(1)}m`;
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm space-y-6">
            {/* Workflow Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-bold text-slate-900 pr-4">{workflow.name}</h2>
                    {getStatusBadge()}
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <span className="text-lg">{getTriggerIcon()}</span>
                    <span className="capitalize font-medium">{workflow.trigger_type} Trigger</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="px-6 grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600 font-medium mb-1">Total Runs</div>
                    <div className="text-3xl font-bold text-blue-900">{workflow.total_runs}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="text-xs text-orange-600 font-medium mb-1">Credits Used</div>
                    <div className="text-3xl font-bold text-orange-900">-{execution.credits_used}</div>
                </div>
            </div>

            {/* Execution Details */}
            <div className="px-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Execution Details</h3>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Started</span>
                        <span className="font-mono text-slate-900 text-xs">
                            {execution.started_at ? new Date(execution.started_at).toLocaleString() : '-'}
                        </span>
                    </div>

                    {execution.ended_at && (
                        <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Ended</span>
                            <span className="font-mono text-slate-900 text-xs">
                                {new Date(execution.ended_at).toLocaleString()}
                            </span>
                        </div>
                    )}

                    {calculateDuration() && (
                        <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Duration</span>
                            <span className="font-mono text-green-600 font-bold">
                                {calculateDuration()}
                            </span>
                        </div>
                    )}

                    {workflow.last_run_at && (
                        <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Previous Run</span>
                            <span className="font-mono text-slate-900 text-xs">
                                {new Date(workflow.last_run_at).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {execution.error_message && (
                <div className="mx-6 mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-600 text-lg">⚠️</span>
                        <div className="text-xs font-bold text-red-700 uppercase tracking-wide">Error</div>
                    </div>
                    <div className="text-sm text-red-600">{execution.error_message}</div>
                </div>
            )}
        </div>
    );
}
