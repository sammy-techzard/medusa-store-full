// src/admin/components/brand-delete.tsx
import { Button } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"

type BrandDeleteProps = {
    brandId: string
}

export const BrandDelete = ({ brandId }: BrandDeleteProps) => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async () => {
            return sdk.client.fetch(`/admin/brands/${brandId}`, {
                method: "DELETE",
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [["brands"]] })
        },
    })

    return (
        <Button
            size="small"
            variant="danger"
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
        >
            Delete
        </Button>
    )
}
