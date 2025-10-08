// src/admin/components/brand-edit-form-combobox.tsx
// Alternative version with autocomplete/search functionality

import { Drawer, Heading, Label, Button, Input } from "@medusajs/ui"
import { FormProvider, Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useState, useEffect, useMemo, useRef } from "react"
import { MagnifyingGlass, XMarkMini } from "@medusajs/icons"

// Validation schema
const schema = z.object({
    brand_id: z.string().optional(),
})

type FormData = z.infer<typeof schema>

type Brand = {
    id: string
    name: string
}

type EditBrandFormComboboxProps = {
    productId: string
    currentBrandId?: string
    onSuccess?: () => void
}

export const EditBrandForm = ({
    productId,
    currentBrandId,
    onSuccess
}: EditBrandFormComboboxProps) => {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const queryClient = useQueryClient()

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            brand_id: currentBrandId || "",
        },
    })

    // Fetch all brands
    const { data: brandsData, isLoading } = useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const response = await sdk.client.fetch<{ brands: Brand[] }>("/admin/brands", {
                query: {
                    fields: "id,name",
                }
            })
            return response.brands
        },
    })

    // Set initial selected brand
    useEffect(() => {
        if (brandsData && currentBrandId) {
            const brand = brandsData.find(b => b.id === currentBrandId)
            if (brand) {
                setSelectedBrand(brand)
                setSearchQuery(brand.name)
            }
        } else if (!currentBrandId) {
            setSelectedBrand(null)
            setSearchQuery("")
        }
    }, [brandsData, currentBrandId])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Filter brands based on search query
    const filteredBrands = useMemo(() => {
        if (!brandsData) return []
        if (!searchQuery) return brandsData

        return brandsData.filter(brand =>
            brand.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [brandsData, searchQuery])

    // Update product brand mutation
    const updateBrand = useMutation({
        mutationFn: async (brandId: string | null) => {
            return sdk.client.fetch(`/admin/products/${productId}`, {
                method: "POST",
                body: {
                    additional_data: {
                        "brand_id": brandId
                    }

                },
            })

        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product", productId] })
            queryClient.invalidateQueries({ queryKey: [["product", productId]] })
            queryClient.invalidateQueries({ queryKey: ["brands"] })
            setOpen(false)
            onSuccess?.()
        },
    })

    const handleSubmit = form.handleSubmit(async ({ brand_id }) => {
        await updateBrand.mutateAsync(brand_id || null)
    })

    const handleSelectBrand = (brand: Brand | null) => {
        if (brand) {
            setSelectedBrand(brand)
            setSearchQuery(brand.name)
            form.setValue("brand_id", brand.id)
        } else {
            // Clear selection
            setSelectedBrand(null)
            setSearchQuery("")
            form.setValue("brand_id", "")
        }
        setShowDropdown(false)
    }

    const handleInputChange = (value: string) => {
        setSearchQuery(value)
        setShowDropdown(true)

        // Clear selection if input doesn't match selected brand
        if (selectedBrand && value !== selectedBrand.name) {
            setSelectedBrand(null)
            form.setValue("brand_id", "")
        }
    }

    const handleClearSelection = () => {
        setSelectedBrand(null)
        setSearchQuery("")
        form.setValue("brand_id", "")
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <Drawer.Trigger asChild>
                <Button variant="secondary" size="small">
                    Edit Brand
                </Button>
            </Drawer.Trigger>
            <Drawer.Content>
                <FormProvider {...form}>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-1 flex-col overflow-hidden"
                    >
                        <Drawer.Header>
                            <Heading>Edit Product Brand</Heading>
                        </Drawer.Header>
                        <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
                            <Controller
                                control={form.control}
                                name="brand_id"
                                render={({ fieldState: { error } }) => {
                                    return (
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center gap-x-1">
                                                <Label size="small" weight="plus">
                                                    Brand
                                                </Label>
                                            </div>

                                            <div className="relative" ref={dropdownRef}>
                                                <div className="relative">
                                                    <Input
                                                        value={searchQuery}
                                                        onChange={(e) => handleInputChange(e.target.value)}
                                                        onFocus={() => setShowDropdown(true)}
                                                        placeholder="Search brands..."
                                                        disabled={isLoading}
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                        {selectedBrand && (
                                                            <button
                                                                type="button"
                                                                onClick={handleClearSelection}
                                                                className="text-ui-fg-muted hover:text-ui-fg-base transition-colors"
                                                            >
                                                                <XMarkMini />
                                                            </button>
                                                        )}
                                                        <MagnifyingGlass className="text-ui-fg-muted" />
                                                    </div>
                                                </div>

                                                {showDropdown && (
                                                    <div className="bg-ui-bg-base border-ui-border-base absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-lg">
                                                        {/* Option to clear brand */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectBrand(null)}
                                                            className={`text-ui-fg-muted hover:bg-ui-bg-base-hover w-full px-3 py-2 text-left text-sm transition-colors ${!selectedBrand ? "bg-ui-bg-base-pressed" : ""
                                                                }`}
                                                        >
                                                            No Brand
                                                        </button>

                                                        {filteredBrands.length > 0 ? (
                                                            filteredBrands.map((brand) => (
                                                                <button
                                                                    key={brand.id}
                                                                    type="button"
                                                                    onClick={() => handleSelectBrand(brand)}
                                                                    className={`text-ui-fg-base hover:bg-ui-bg-base-hover w-full px-3 py-2 text-left text-sm transition-colors ${selectedBrand?.id === brand.id
                                                                        ? "bg-ui-bg-base-pressed"
                                                                        : ""
                                                                        }`}
                                                                >
                                                                    {brand.name}
                                                                </button>
                                                            ))
                                                        ) : searchQuery ? (
                                                            <div className="text-ui-fg-muted px-3 py-2 text-sm">
                                                                No brands found
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>

                                            {error && (
                                                <span className="text-xs text-red-500">
                                                    {error.message}
                                                </span>
                                            )}

                                            {selectedBrand && (
                                                <div className="bg-ui-bg-subtle text-ui-fg-subtle flex items-center gap-2 rounded-md px-3 py-2 text-sm">
                                                    <span>Selected:</span>
                                                    <span className="font-medium">{selectedBrand.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                }}
                            />
                        </Drawer.Body>
                        <Drawer.Footer>
                            <div className="flex items-center justify-end gap-x-2">
                                <Drawer.Close asChild>
                                    <Button size="small" variant="secondary">
                                        Cancel
                                    </Button>
                                </Drawer.Close>
                                <Button
                                    size="small"
                                    type="submit"
                                    isLoading={updateBrand.isPending}
                                >
                                    Save
                                </Button>
                            </div>
                        </Drawer.Footer>
                    </form>
                </FormProvider>
            </Drawer.Content>
        </Drawer>
    )
}