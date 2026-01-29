'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import WorkflowGraph from '@/components/WorkflowGraph';
import WorkflowMetadata from '@/components/WorkflowMetadata';

export default function AutomationDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const [execution, setExecution] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        if (id) {
            loadExecution(id);
        }
    }, [id]);

    // Auto-polling every 10 seconds
    useEffect(() => {
        if (!id) return;

        const interval = setInterval(() => {
            console.log('Auto-refreshing execution data...');
            loadExecution(id, true); // Silent refresh
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [id]);

    const loadExecution = async (executionId: string, silent = false) => {
        if (!silent) {
            setLoading(true);
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/executions/${executionId}/details`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setExecution(data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Failed to load execution details:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadExecution(id);
    };

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 10) return 'just now';
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF4F00] border-t-transparent animate-spin"></div>
        </div>
    );

    if (!execution) return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center flex-col gap-4">
            <h1 className="text-2xl font-bold text-[#2D2E2E]">Automation Not Found</h1>
            <p className="text-slate-500">The requested automation details could not be loaded.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-8 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-[#2D2E2E] flex items-center gap-3">
                            {execution.workflow?.name || 'Untitled Automation'}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${execution.execution?.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                execution.execution?.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {execution.execution?.status}
                            </span>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="ml-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                                title="Refresh data"
                            >
                                <svg
                                    className={`w-4 h-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-3">
                            <span>Run ID: <span className="font-mono bg-slate-100 px-1 rounded">{id}</span></span>
                            <span className="text-xs text-slate-400">• Last updated {getTimeAgo(lastUpdated)}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-[#2D2E2E]">
                            {execution.execution?.credits_used || 0}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                            Credits Used
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-8 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Left: Visual Graph (Takes 3 columns) */}
                    <div className="xl:col-span-3 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[800px] relative">
                            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
                                Workflow Visualization
                            </div>
                            <WorkflowGraph
                                nodes={execution.graph?.nodes || []}
                                connections={execution.graph?.connections || []}
                            />
                        </div>
                    </div>


                    {/* Right: Metadata & Details (Takes 1 column) */}
                    <div className="xl:col-span-1 space-y-6">
                        <WorkflowMetadata workflow={execution.workflow || {}} execution={execution.execution || {}} />

                        {/* JSON Data Preview */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-semibold text-slate-900">Output Data</h3>
                            </div>
                            <div className="p-0">
                                <pre className="p-4 bg-slate-50 text-xs text-slate-600 overflow-x-auto max-h-[400px] custom-scrollbar">
                                    {JSON.stringify(execution.raw_execution || execution.execution?.result_data || {}, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
