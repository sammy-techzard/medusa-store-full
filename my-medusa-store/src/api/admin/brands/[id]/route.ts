// src/api/admin/brands/[id]/route.ts
import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "zod"
import { BRAND_MODULE } from "../../../../modules/brand"
import { updateBrandWorkflow } from "../../../../workflows/update-brand"

const UpdateBrandSchema = z.object({
    name: z.string().optional(),
})

// Update a brand
export const PATCH = async (
    req: MedusaRequest<z.infer<typeof UpdateBrandSchema>>,
    res: MedusaResponse
) => {
    const { id } = req.params
    const input = req.validatedBody

    const { result } = await updateBrandWorkflow(req.scope).run({
        input: {
            id,
            ...input,
        },
    })

    return res.json({ brand: result })
}

// Delete a brand
export const DELETE = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { id } = req.params

    const repo = req.scope.resolve(BRAND_MODULE)

    await repo.deleteBrands(id)

    return res.json({ id, deleted: true })
}
