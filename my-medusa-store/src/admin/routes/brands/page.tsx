// src/admin/pages/brands/index.tsx
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { TagSolid } from "@medusajs/icons"
import {
    Container,
    Heading,
    createDataTableColumnHelper,
    DataTable,
    useDataTable,
    DataTablePaginationState,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useMemo, useState } from "react"
import { BrandForm } from "../../components/brand-page/brand-form"
import { BrandDelete } from "../../components/brand-page/brand-delete"

type Brand = {
    id: string
    name: string
}
type BrandsResponse = {
    brands: Brand[]
    count: number
    limit: number
    offset: number
}

const BrandsPage = () => {
    const columnHelper = createDataTableColumnHelper<Brand>()

    const columns = [
        columnHelper.accessor("id", { header: "ID" }),
        columnHelper.accessor("name", { header: "Name" }),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: (props) => {
                const brand = props.row.original
                return (
                    <div className="flex gap-2">
                        <BrandForm brand={brand} triggerLabel="Edit" />
                        <BrandDelete brandId={brand.id} />
                    </div>
                )
            },
        }),
    ]

    const limit = 15
    const [pagination, setPagination] = useState<DataTablePaginationState>({
        pageSize: limit,
        pageIndex: 0,
    })
    const offset = useMemo(() => pagination.pageIndex * limit, [pagination])

    const { data, isLoading } = useQuery<BrandsResponse>({
        queryFn: () =>
            sdk.client.fetch(`/admin/brands`, {
                query: { limit, offset },
            }),
        queryKey: [["brands", limit, offset]],
    })

    const table = useDataTable({
        columns,
        data: data?.brands || [],
        getRowId: (row) => row.id,
        rowCount: data?.count || 0,
        isLoading,
        pagination: {
            state: pagination,
            onPaginationChange: setPagination,
        },
    })

    return (
        <Container className="divide-y p-0">
            <DataTable instance={table}>
                <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
                    <Heading>Brands</Heading>
                    <BrandForm triggerLabel="Create Brand" />
                </DataTable.Toolbar>
                <DataTable.Table />
                <DataTable.Pagination />
            </DataTable>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Brands",
    icon: TagSolid,
})

export default BrandsPage
