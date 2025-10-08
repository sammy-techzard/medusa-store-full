import { MedusaContainer } from "@medusajs/framework/types"
import { syncBrandsFromCmsWorkflow } from "../workflows/sync-brands-from-cms"

export default async function (container: MedusaContainer) {
    const logger = container.resolve("logger")

    const { result } = await syncBrandsFromCmsWorkflow(container).run()

    logger.info(
        `Synced brands from third-party system: ${result.created.length
        } brands created and ${result.updated.length} brands updated.`)
}

export const config = {
    name: "sync-brands-from-system",
    schedule: "* * * * *", // change to * * * * * for debugging
}