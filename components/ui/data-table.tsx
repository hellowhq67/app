"use client";

import { useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Column<T> {
    key: string;
    header: string;
    cell: (item: T) => React.ReactNode;
    sortable?: boolean;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    pageSize?: number;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    pageSize = 10,
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(pageSize);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(start, start + itemsPerPage);

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.key}
                                    className={cn(
                                        "text-xs uppercase tracking-wide text-gray-500 font-semibold",
                                        col.className
                                    )}
                                >
                                    {col.sortable ? (
                                        <button className="flex items-center gap-1 hover:text-blue-600">
                                            {col.header}
                                            <ArrowUpDown className="h-3.5 w-3.5" />
                                        </button>
                                    ) : (
                                        col.header
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {currentData.map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50">
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.key}
                                        className={cn("text-sm text-gray-700", col.className)}
                                    >
                                        {col.cell(item)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between border-t pt-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    Rows:
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(v) => {
                            setItemsPerPage(Number(v));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-8 w-16">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 20, 50].map((n) => (
                                <SelectItem key={n} value={n.toString()}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <span>
                    Page {currentPage} of {totalPages}
                </span>

                <div className="flex gap-1">
                    <Button size="icon" variant="outline" onClick={() => setCurrentPage(1)}>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => setCurrentPage((p) => p - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => setCurrentPage((p) => p + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => setCurrentPage(totalPages)}>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
