import { z, ZodError, ZodIssueCode } from 'zod';

// inpu request Params schema
export const FilterRequestParamsSchema = z.object({
    formId: z.string(),   
});

// input query params schema and some validation
export const FilterRequestQuerySchema = z.object({
    limit: z.number().default(150).optional(),
    afterDate: z.string().optional(),
    beforeDate: z.string().optional(),
    offset: z.number().default(0).optional(),
    status: z.string().optional(),
    includeEditLink: z.string().optional(),
    sort: z.string().default('asc').optional(),
    filters: z.string()
}).refine(data => {
    const issues = [];
       
    if (data.limit !== undefined && (data.limit > 1 || data.limit <= 150)) {
        const customIssue = {
            code: ZodIssueCode.custom,
            message: "Limit must be a number between, including 1 and 150",
            path: ['limit'],
        };
        issues.push(customIssue)
    }
    if (data.status !== undefined && data.status !== 'in_progress') {
        const customIssue = {
            code: ZodIssueCode.custom,
            message: "Status must be a string with value 'in_progress'",
            path: ['status'],
        };
        issues.push(customIssue)
    }
    if (data.includeEditLink !== undefined && !['true', 'false'].includes(data.includeEditLink)) {
        const invalidLiteralIssue = {
            code: ZodIssueCode.invalid_literal,
            message: "IncludeEditLink must be 'true' or 'false'",
            expected: ['true', 'false'],
            received: data.includeEditLink,
            path: ['includeEditLink'],
        };
        issues.push(invalidLiteralIssue)
    }
    if (issues.length > 0) {
        throw new ZodError(issues);
    }
    return true;
});

// input query parm filter json array's schema
const FilterClauseSchema = z.object({
    id: z.string(),
    condition: z.enum(['equals', 'does_not_equal', 'greater_than', 'less_than']),
    value: z.union([z.string(), z.number()]),
});
  
export const RequestFiltersSchema = z.array(FilterClauseSchema);

export type FilterClauseType = z.infer<typeof FilterClauseSchema>;
export type RequestFiltersType = z.infer<typeof RequestFiltersSchema>;
export type FilterRequestQueryType = z.infer<typeof FilterRequestQuerySchema>;
export type FilterRequestParamsType = z.infer<typeof FilterRequestParamsSchema>;