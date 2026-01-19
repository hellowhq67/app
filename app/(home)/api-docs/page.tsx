"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_REGISTRY, type APIEndpoint } from "@/lib/api/registry";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Search,
    Server,
    Clock,
    MemoryStick,
    Zap,
    Code,
    Play,
    Copy,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthStatus {
    status: "healthy" | "degraded" | "down";
    timestamp: string;
    uptime: number;
    version: string;
    totalLatency: number;
    checks: Array<{
        service: string;
        status: "healthy" | "degraded" | "down";
        latency: number;
        message?: string;
    }>;
    environment: string;
    memoryUsage: {
        rss: number;
        heapUsed: number;
        heapTotal: number;
    };
}

export default function APIDocsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
    const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
    const [isLoadingHealth, setIsLoadingHealth] = useState(false);
    const [copiedPath, setCopiedPath] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<any>(null);
    const [isTestingAPI, setIsTestingAPI] = useState(false);
    const [customRequestBody, setCustomRequestBody] = useState<string>("");

    // Auto-refresh health status every 10 seconds
    useEffect(() => {
        fetchHealthStatus();
        const interval = setInterval(fetchHealthStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchHealthStatus = async () => {
        setIsLoadingHealth(true);
        try {
            const response = await fetch("/api/monitor/health");
            const data = await response.json();
            setHealthStatus(data);
        } catch (error) {
            console.error("Failed to fetch health status:", error);
        } finally {
            setIsLoadingHealth(false);
        }
    };

    const categories = Array.from(new Set(API_REGISTRY.map((api) => api.category)));

    const filteredAPIs = API_REGISTRY.filter((api) => {
        const matchesSearch =
            api.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
            api.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || api.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedPath(text);
        setTimeout(() => setCopiedPath(null), 2000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "healthy":
                return "text-green-500";
            case "degraded":
                return "text-yellow-500";
            case "down":
                return "text-red-500";
            default:
                return "text-gray-500";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "healthy":
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case "degraded":
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case "down":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Activity className="w-5 h-5 text-gray-500" />;
        }
    };

    const testAPI = async (endpoint: APIEndpoint) => {
        setIsTestingAPI(true);
        setTestResult(null);

        try {
            let requestBody = undefined;
            if (customRequestBody) {
                try {
                    requestBody = JSON.parse(customRequestBody);
                } catch {
                    requestBody = endpoint.requestBody?.example;
                }
            } else {
                requestBody = endpoint.requestBody?.example;
            }

            const response = await fetch("/api/monitor/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    path: endpoint.path,
                    method: endpoint.method,
                    body: requestBody,
                }),
            });

            const result = await response.json();
            setTestResult(result);
        } catch (error) {
            setTestResult({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        } finally {
            setIsTestingAPI(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header with Glass Effect */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                                <Server className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                    API Documentation & Monitor
                                </h1>
                                <p className="text-slate-400 text-sm mt-1">
                                    PedagogistsPTE Real-time API Explorer
                                </p>
                            </div>
                        </div>

                        {/* Real-time Health Badge */}
                        {healthStatus && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800/50"
                            >
                                {getStatusIcon(healthStatus.status)}
                                <div>
                                    <p className="text-sm font-medium text-white">System Status</p>
                                    <p className={cn("text-xs font-semibold uppercase", getStatusColor(healthStatus.status))}>
                                        {healthStatus.status}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar - Health Monitoring */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* System Overview */}
                        <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                    System Health
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Real-time monitoring dashboard
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {healthStatus ? (
                                    <>
                                        {/* Uptime */}
                                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-400" />
                                                <span className="text-sm text-slate-300">Uptime</span>
                                            </div>
                                            <span className="text-sm font-semibold text-white">
                                                {Math.floor(healthStatus.uptime / 60)}m {Math.floor(healthStatus.uptime % 60)}s
                                            </span>
                                        </div>

                                        {/* Latency */}
                                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-yellow-400" />
                                                <span className="text-sm text-slate-300">Latency</span>
                                            </div>
                                            <span className="text-sm font-semibold text-white">
                                                {healthStatus.totalLatency}ms
                                            </span>
                                        </div>

                                        {/* Memory Usage */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <MemoryStick className="w-4 h-4 text-purple-400" />
                                                <span className="text-sm text-slate-300">Memory Usage</span>
                                            </div>
                                            <div className="space-y-1 text-xs text-slate-400">
                                                <div className="flex justify-between">
                                                    <span>Heap Used</span>
                                                    <span className="text-white font-medium">{healthStatus.memoryUsage.heapUsed} MB</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>RSS</span>
                                                    <span className="text-white font-medium">{healthStatus.memoryUsage.rss} MB</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Service Checks */}
                                        <div className="space-y-2 pt-4 border-t border-slate-800">
                                            <h4 className="text-sm font-semibold text-white">Service Status</h4>
                                            {healthStatus.checks.map((check, idx) => (
                                                <motion.div
                                                    key={check.service}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex items-center justify-between p-2 bg-slate-800/20 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(check.status)}
                                                        <span className="text-xs text-slate-300 capitalize">
                                                            {check.service.replace("-", " ")}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-slate-400">{check.latency}ms</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-pulse text-slate-400">Loading health data...</div>
                                    </div>
                                )}

                                <Button
                                    onClick={fetchHealthStatus}
                                    disabled={isLoadingHealth}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                >
                                    {isLoadingHealth ? "Refreshing..." : "Refresh Status"}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* API Statistics */}
                        <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800/50">
                            <CardHeader>
                                <CardTitle className="text-white">API Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
                                    <span className="text-sm text-slate-300">Total Endpoints</span>
                                    <span className="text-2xl font-bold text-blue-400">{API_REGISTRY.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                                    <span className="text-sm text-slate-300">Categories</span>
                                    <span className="text-2xl font-bold text-green-400">{categories.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
                                    <span className="text-sm text-slate-300">Protected Routes</span>
                                    <span className="text-2xl font-bold text-purple-400">
                                        {API_REGISTRY.filter((api) => api.requiresAuth).length}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content - API Explorer */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search and Filter */}
                        <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800/50">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            placeholder="Search APIs..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                        />
                                    </div>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* API List */}
                        <div className="space-y-4">
                            <AnimatePresence>
                                {filteredAPIs.map((api, idx) => (
                                    <motion.div
                                        key={api.path}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card
                                            className={cn(
                                                "bg-slate-900/50 backdrop-blur-sm border-slate-800/50 hover:border-blue-500/50 transition-all cursor-pointer",
                                                selectedEndpoint?.path === api.path && "border-blue-500 bg-slate-900/80"
                                            )}
                                            onClick={() =>
                                                setSelectedEndpoint(selectedEndpoint?.path === api.path ? null : api)
                                            }
                                        >
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Badge
                                                                className={cn(
                                                                    "font-mono font-semibold",
                                                                    api.method === "GET" && "bg-green-500/20 text-green-400 border-green-500/30",
                                                                    api.method === "POST" &&
                                                                    "bg-blue-500/20 text-blue-400 border-blue-500/30",
                                                                    api.method === "PUT" &&
                                                                    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                                                                    api.method === "DELETE" && "bg-red-500/20 text-red-400 border-red-500/30"
                                                                )}
                                                            >
                                                                {api.method}
                                                            </Badge>
                                                            <code className="text-sm text-blue-300 font-mono">{api.path}</code>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    copyToClipboard(api.path);
                                                                }}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                {copiedPath === api.path ? (
                                                                    <Check className="w-3 h-3 text-green-400" />
                                                                ) : (
                                                                    <Copy className="w-3 h-3" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                        <p className="text-sm text-slate-300">{api.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {api.category}
                                                        </Badge>
                                                        {api.requiresAuth && (
                                                            <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/30">
                                                                🔒 Auth Required
                                                            </Badge>
                                                        )}
                                                        <Badge
                                                            className={cn(
                                                                "text-xs",
                                                                api.status === "stable" && "bg-green-500/20 text-green-400",
                                                                api.status === "beta" && "bg-yellow-500/20 text-yellow-400",
                                                                api.status === "deprecated" && "bg-red-500/20 text-red-400"
                                                            )}
                                                        >
                                                            {api.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            {selectedEndpoint?.path === api.path && (
                                                <CardContent className="border-t border-slate-800">
                                                    <Tabs defaultValue="request" className="mt-4">
                                                        <TabsList className="bg-slate-800/50">
                                                            <TabsTrigger value="request">Request</TabsTrigger>
                                                            <TabsTrigger value="response">Response</TabsTrigger>
                                                            <TabsTrigger value="test">Test</TabsTrigger>
                                                        </TabsList>

                                                        <TabsContent value="request" className="space-y-4">
                                                            {api.requestBody && (
                                                                <div className="space-y-2">
                                                                    <h4 className="text-sm font-semibold text-white">Request Body</h4>
                                                                    <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto">
                                                                        <code className="text-xs text-green-400">
                                                                            {JSON.stringify(api.requestBody.example, null, 2)}
                                                                        </code>
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </TabsContent>

                                                        <TabsContent value="response" className="space-y-4">
                                                            <div className="space-y-2">
                                                                <h4 className="text-sm font-semibold text-white">Response Example</h4>
                                                                <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto">
                                                                    <code className="text-xs text-blue-400">
                                                                        {JSON.stringify(api.response.example, null, 2)}
                                                                    </code>
                                                                </pre>
                                                            </div>
                                                        </TabsContent>

                                                        <TabsContent value="test" className="space-y-4">
                                                            <div className="space-y-4">
                                                                {api.requestBody && (
                                                                    <div className="space-y-2">
                                                                        <h4 className="text-sm font-semibold text-white">Custom Request Body (Optional)</h4>
                                                                        <textarea
                                                                            value={customRequestBody}
                                                                            onChange={(e) => setCustomRequestBody(e.target.value)}
                                                                            placeholder={JSON.stringify(api.requestBody.example, null, 2)}
                                                                            className="w-full h-32 p-3 bg-slate-950 text-green-400 rounded-lg font-mono text-xs border border-slate-700 focus:border-blue-500 focus:outline-none"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                    </div>
                                                                )}

                                                                <Button
                                                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        testAPI(api);
                                                                    }}
                                                                    disabled={isTestingAPI}
                                                                >
                                                                    <Play className="w-4 h-4 mr-2" />
                                                                    {isTestingAPI ? "Testing..." : "Send Test Request"}
                                                                </Button>

                                                                {testResult && (
                                                                    <div className="space-y-2 mt-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <h4 className="text-sm font-semibold text-white">Test Result</h4>
                                                                            <Badge
                                                                                className={cn(
                                                                                    testResult.success
                                                                                        ? "bg-green-500/20 text-green-400"
                                                                                        : "bg-red-500/20 text-red-400"
                                                                                )}
                                                                            >
                                                                                {testResult.success ? "✓ Success" : "✗ Failed"}
                                                                            </Badge>
                                                                        </div>

                                                                        {testResult.latency && (
                                                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                                                <Zap className="w-3 h-3" />
                                                                                <span>Response time: {testResult.latency}ms</span>
                                                                            </div>
                                                                        )}

                                                                        <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto max-h-96">
                                                                            <code className="text-xs text-blue-400">
                                                                                {JSON.stringify(testResult, null, 2)}
                                                                            </code>
                                                                        </pre>
                                                                    </div>
                                                                )}

                                                                {!testResult && !isTestingAPI && (
                                                                    <div className="p-4 bg-slate-800/30 rounded-lg text-center">
                                                                        <p className="text-sm text-slate-400">
                                                                            Click &ldquo;Send Test Request&rdquo; to test this endpoint
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TabsContent>
                                                    </Tabs>
                                                </CardContent>
                                            )}
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {filteredAPIs.length === 0 && (
                                <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800/50">
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <Code className="w-12 h-12 text-slate-600 mb-4" />
                                        <p className="text-slate-400">No APIs found matching your search.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                        <p>PedagogistsPTE API Documentation v1.0.0</p>
                        <p>Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
