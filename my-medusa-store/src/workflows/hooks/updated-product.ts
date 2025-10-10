// src/workflows/hooks/updated-product.ts
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { LinkDefinition } from "@medusajs/framework/types"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { BRAND_MODULE } from "../../modules/brand"

updateProductsWorkflow.hooks.productsUpdated(
    async (
        {
            products,
            additional_data,
        }: {
            products: { id: string }[]
            additional_data?: Record<string, unknown>
        },
        { container }
    ) => {
        const brandId = additional_data?.brand_id as string | null | undefined

        if (typeof brandId === "undefined") {
            // nothing to do if brand_id not passed in
            return new StepResponse([], [])
        }

        const link = container.resolve("link")
        const logger = container.resolve("logger")

        // Delete existing links for these products first
        for (const product of products) {
            try {
                await link.dismiss({
                    [Modules.PRODUCT]: { product_id: product.id },
                    [BRAND_MODULE]: {},
                })
            } catch (error) {
                // Link might not exist, which is fine
                logger.debug(`No existing link to dismiss for product ${product.id}`)
            }
        }

        if (brandId) {
            // Create new links with the brand
            const links: LinkDefinition[] = products.map((product) => ({
                [Modules.PRODUCT]: { product_id: product.id },
                [BRAND_MODULE]: { brand_id: brandId },
            }))

            await link.create(links)
            logger.info(`Linked brand '${brandId}' to ${products.length} product(s)`)

            return new StepResponse(links, links)
        } else {
            // brandId is null - links already dismissed above
            logger.info(`Cleared brand links for ${products.length} product(s)`)
            return new StepResponse([], [])
        }
    }
)