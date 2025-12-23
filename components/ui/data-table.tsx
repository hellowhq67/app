'use client'

import { useState } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Column<T> {
    key: string
    header: string
    cell: (item: T) => React.ReactNode
    sortable?: boolean
}

interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    pageSize?: number
    searchable?: boolean
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    pageSize = 10,
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(pageSize)
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    // Calculate pagination
    const totalPages = Math.ceil(data.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = data.slice(startIndex, endIndex)

    // Handle sorting
    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(columnKey)
            setSortDirection('asc')
        }
    }

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="rounded-lg border border-gray-200 bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            {columns.map((column) => (
                                <TableHead key={column.key} className="font-semibold text-gray-900">
                                    {column.sortable ? (
                                        <button
                                            onClick={() => handleSort(column.key)}
                                            className="flex items-center gap-2 hover:text-blue-600"
                                        >
                                            {column.header}
                                            <ArrowUpDown className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        column.header
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.length > 0 ? (
                            currentData.map((item) => (
                                <TableRow key={item.id} className="hover:bg-gray-50">
                                    {columns.map((column) => (
                                        <TableCell key={column.key} className="text-gray-700">
                                            {column.cell(item)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center text-gray-500"
                                >
                                    No data available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Rows per page:</span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                            setItemsPerPage(Number(value))
                            setCurrentPage(1)
                        }}
                    >
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages || 1} ({data.length} total)
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
