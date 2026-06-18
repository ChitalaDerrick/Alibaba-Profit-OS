import { z } from 'zod'

// Calculation input validation schema
export const calculationSchema = z.object({
  unitCost: z.number()
    .positive('Unit cost must be greater than 0')
    .finite('Unit cost must be a finite number')
    .max(1000000, 'Unit cost cannot exceed 1,000,000'),
  unitSale: z.number()
    .positive('Unit sale price must be greater than 0')
    .finite('Unit sale price must be a finite number')
    .max(1000000, 'Unit sale price cannot exceed 1,000,000'),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .positive('Quantity must be greater than 0')
    .max(1000000, 'Quantity cannot exceed 1,000,000'),
})

export type CalculationInput = z.infer<typeof calculationSchema>

// Saved product validation schema
export const savedProductSchema = z.object({
  productName: z.string()
    .trim()
    .min(1, 'Product name is required')
    .max(255, 'Product name cannot exceed 255 characters'),
  unitCost: z.number()
    .positive('Unit cost must be greater than 0')
    .finite('Unit cost must be a finite number')
    .max(1000000, 'Unit cost cannot exceed 1,000,000'),
  unitSale: z.number()
    .positive('Unit sale price must be greater than 0')
    .finite('Unit sale price must be a finite number')
    .max(1000000, 'Unit sale price cannot exceed 1,000,000'),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .positive('Quantity must be greater than 0')
    .max(1000000, 'Quantity cannot exceed 1,000,000'),
  profitMargin: z.number()
    .min(0, 'Profit margin cannot be negative')
    .max(1000000, 'Profit margin cannot exceed 1,000,000'),
  totalProfit: z.number()
    .finite('Total profit must be a finite number')
    .max(1000000000, 'Total profit cannot exceed 1,000,000,000'),
})

export type SavedProduct = z.infer<typeof savedProductSchema>

// Update product validation schema (all fields optional)
export const updateProductSchema = savedProductSchema.partial()

export type UpdateProduct = z.infer<typeof updateProductSchema>

// Validate and sanitize inputs
export function validateCalculation(data: unknown) {
  try {
    return {
      success: true,
      data: calculationSchema.parse(data),
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      }
    }
    return {
      success: false,
      errors: [{ path: 'unknown', message: 'Validation failed' }],
    }
  }
}

export function validateSavedProduct(data: unknown) {
  try {
    return {
      success: true,
      data: savedProductSchema.parse(data),
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      }
    }
    return {
      success: false,
      errors: [{ path: 'unknown', message: 'Validation failed' }],
    }
  }
}
