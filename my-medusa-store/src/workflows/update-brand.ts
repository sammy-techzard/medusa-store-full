// src/workflows/update-brand.ts
import {
    createStep,
    StepResponse,
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"
import { emitEventStep } from "@medusajs/medusa/core-flows"

export type UpdateBrandStepInput = {
    id: string
    name?: string
}

export const updateBrandStep = createStep(
    "update-brand-step",
    async (input: UpdateBrandStepInput, { container }) => {
        const brandModuleService: BrandModuleService = container.resolve(
            BRAND_MODULE
        )
        const brand = await brandModuleService.updateBrands([
            {
                id: input.id,
                name: input.name,
            },
        ])

        return new StepResponse(brand[0], input.id)

    }
)

type UpdateBrandWorkflowInput = {
    id: string
    name?: string
}

export const updateBrandWorkflow = createWorkflow(
    "update-brand",
    (input: UpdateBrandWorkflowInput) => {
        const brand = updateBrandStep(input)

        emitEventStep({
            eventName: "brand.updated",
            data: {
                id: brand.id,
            },
        })

        return new WorkflowResponse(brand)
    }
)
