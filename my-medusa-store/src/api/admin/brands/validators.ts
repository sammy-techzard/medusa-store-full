import { z } from "zod"

export const PostAdminCreateBrand = z.object({
    name: z.string(),
})
export const PatchAdminUpdateBrand = z.object({
    name: z.string().optional(),
})