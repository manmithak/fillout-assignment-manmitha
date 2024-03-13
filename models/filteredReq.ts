import { z, ZodError, ZodIssueCode } from 'zod';

// inpu request Params schema
export const FilterRequestParamsSchema = z.object({
    formId: z.string(),   
});

// input query params schema and some validation for the input data
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
    const { afterDate, beforeDate, limit, includeEditLink, status, sort } = data;
    const issues = [];
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

    if (afterDate !== undefined && regex.test(afterDate)) {
        const invalidDateIssue = {
            code: ZodIssueCode.invalid_date,
            message: "afterDate must be in the format YYYY-MM-DDTHH:mm:ss.sssZ",
            expected: [],
            received: afterDate,
            path: ['afterDate'],
        };
        issues.push(invalidDateIssue)
    }
    if (beforeDate !== undefined && regex.test(beforeDate)) {
        const invalidDateIssue = {
            code: ZodIssueCode.invalid_date,
            message: "beforeDate must be in the format YYYY-MM-DDTHH:mm:ss.sssZ",
            expected: [],
            received: beforeDate,
            path: ['beforeDate'],
        };
        issues.push(invalidDateIssue)
    }
    if (limit !== undefined && (limit > 1 || limit <= 150)) {
        const customIssue = {
            code: ZodIssueCode.custom,
            message: "Limit must be a number between, including 1 and 150",
            path: ['limit'],
        };
        issues.push(customIssue)
    }
    if (status !== undefined && status !== 'in_progress') {
        const invalidLiteralIssue = {
            code: ZodIssueCode.invalid_literal,
            message: "sort must be 'in_progress'",
            expected: ['in_progress'],
            received: status,
            path: ['status'],
        };
        issues.push(invalidLiteralIssue)
    }
    if (sort !== undefined && !['asc', 'dsc'].includes(sort)) {
        const invalidLiteralIssue = {
            code: ZodIssueCode.invalid_literal,
            message: "sort must be 'asc' or 'dsc'",
            expected: ['asc', 'dsc'],
            received: data.sort,
            path: ['sort'],
        };
        issues.push(invalidLiteralIssue)
    }
    if (includeEditLink !== undefined && !['true', 'false'].includes(includeEditLink)) {
        const invalidLiteralIssue = {
            code: ZodIssueCode.invalid_literal,
            message: "IncludeEditLink must be 'true' or 'false'",
            expected: ['true', 'false'],
            received: includeEditLink,
            path: ['includeEditLink'],
        };
        issues.push(invalidLiteralIssue)
    }
    if (issues.length > 0) {
        throw new ZodError(issues);
    }
    return true;
});

// input query param filter json array's schema and its validation

const conditionFilters = ['equals', 'does_not_equal', 'greater_than', 'less_than'];

const FilterClauseSchema = z.object({
    id: z.string(),
    condition: z.enum(['equals', 'does_not_equal', 'greater_than', 'less_than']),
    value: z.union([z.string(), z.number()]),
}).refine((data) => {
    const { condition } = data;

    if ( !conditionFilters.includes(condition)) {
        const invalidLiteralIssue = {
            code: ZodIssueCode.invalid_literal,
            message: "IncludeEditLink must be 'equals' or 'does_not_equal' or 'greater_than' or 'less_than'",
            expected: conditionFilters,
            received: condition,
            path: ['filters.condition'],
        };
        throw new ZodError([invalidLiteralIssue])
    }

    return true; // Refinement passed
});
  
export const RequestFiltersSchema = z.array(FilterClauseSchema);

export type FilterClauseType = z.infer<typeof FilterClauseSchema>;
export type RequestFiltersType = z.infer<typeof RequestFiltersSchema>;
export type FilterRequestQueryType = z.infer<typeof FilterRequestQuerySchema>;
export type FilterRequestParamsType = z.infer<typeof FilterRequestParamsSchema>;