// src/admin/components/brand-form.tsx
import { Drawer, Heading, Label, Button, Input } from "@medusajs/ui"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useState } from "react"

const schema = z.object({
    name: z.string().min(1, "Brand name is required"),
})

type FormData = z.infer<typeof schema>

type BrandFormProps = {
    brand?: { id: string; name: string }
    triggerLabel: string
}

export const BrandForm = ({ brand, triggerLabel }: BrandFormProps) => {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: brand?.name || "",
        },
    })

    const mutation = useMutation({
        mutationFn: async (values: FormData) => {
            if (brand) {
                // Update
                return sdk.client.fetch(`/admin/brands/${brand.id}`, {
                    method: "PATCH",
                    body: values,
                })
            } else {
                // Create
                return sdk.client.fetch(`/admin/brands`, {
                    method: "POST",
                    body: values,
                })
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [["brands"]] })
            setOpen(false)
        },
    })

    const handleSubmit = form.handleSubmit(async (values) => {
        await mutation.mutateAsync(values)
    })

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <Drawer.Trigger asChild>
                <Button size="small" variant={brand ? "secondary" : "primary"}>
                    {triggerLabel}
                </Button>
            </Drawer.Trigger>
            <Drawer.Content>
                <FormProvider {...form}>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-1 flex-col overflow-hidden"
                    >
                        <Drawer.Header>
                            <Heading>{brand ? "Edit Brand" : "Create Brand"}</Heading>
                        </Drawer.Header>
                        <Drawer.Body className="flex flex-1 flex-col gap-y-4 overflow-y-auto">
                            <div className="flex flex-col gap-2">
                                <Label>Name</Label>
                                <Input {...form.register("name")} placeholder="Brand name" />
                            </div>
                        </Drawer.Body>
                        <Drawer.Footer>
                            <Drawer.Close asChild>
                                <Button size="small" variant="secondary">
                                    Cancel
                                </Button>
                            </Drawer.Close>
                            <Button
                                size="small"
                                type="submit"
                                isLoading={mutation.isPending}
                            >
                                Save
                            </Button>
                        </Drawer.Footer>
                    </form>
                </FormProvider>
            </Drawer.Content>
        </Drawer>
    )
}
