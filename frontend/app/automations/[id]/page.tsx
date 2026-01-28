'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import WorkflowGraph from '@/components/WorkflowGraph';
import WorkflowMetadata from '@/components/WorkflowMetadata';
import Sidebar from '@/components/Sidebar';

interface ExecutionDetailsData {
    execution: {
        id: string;
        status: string;
        started_at?: string;
        ended_at?: string;
        credits_used: number;
        error_message?: string;
    };
    workflow: {
        id: string;
        name: string;
        trigger_type: string;
        total_runs: number;
        last_run_at?: string;
    };
    graph: {
        nodes: any[];
        connections: any[];
    };
}

export default function AutomationDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;

    const [data, setData] = useState<ExecutionDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [polling, setPolling] = useState(false);

    useEffect(() => {
        loadData();

        // Start polling if execution is running
        const interval = setInterval(() => {
            if (data?.execution.status === 'RUNNING') {
                setPolling(true);
                loadData();
            } else {
                setPolling(false);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [id, data?.execution.status]);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/executions/${id}/details`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to load execution details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF4F00] border-t-transparent animate-spin"></div>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-slate-500">
            Failed to load execution details.
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />

            {/* Main content with sidebar offset */}
            <div className="flex-1 ml-64">
                <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                    <div className="px-8 py-6">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => router.push('/automations')}
                                className="text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                ← Back
                            </button>
                            <h1 className="text-3xl font-bold text-slate-900">Automation Run Details</h1>
                        </div>
                        <p className="text-sm text-slate-500">
                            Execution ID: {params.id}
                        </p>
                    </div>
                </header>

                <div className="px-8 py-8">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Left: Visual Graph (Takes 3 columns) */}
                        <div className="xl:col-span-3 space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                    <span className="text-3xl">📊</span>
                                    Workflow Execution Graph
                                </h2>
                                {data.graph.nodes.length > 0 ? (
                                    <WorkflowGraph
                                        nodes={data.graph.nodes}
                                        connections={data.graph.connections}
                                    />
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-16 text-center text-slate-500">
                                        <div className="text-5xl mb-4">📊</div>
                                        <p className="text-lg font-medium">No workflow graph available</p>
                                        <p className="text-sm mt-2">This execution doesn't have graph data yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Node Status Legend</h3>
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
                                        <span className="text-slate-700 font-medium">Success</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
                                        <span className="text-slate-700 font-medium">Error</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse shadow-sm"></div>
                                        <span className="text-slate-700 font-medium">Running</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-slate-300 shadow-sm"></div>
                                        <span className="text-slate-700 font-medium">Pending</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Metadata (Takes 1 column) */}
                        <div className="xl:col-span-1">
                            <WorkflowMetadata
                                workflow={data.workflow}
                                execution={data.execution}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
