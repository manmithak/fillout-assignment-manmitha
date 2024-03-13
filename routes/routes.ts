import express, { Request, Response } from 'express';
import { getSubmissions } from '../services/submissions';
import { ZodError } from 'zod';

const router = express.Router();

router.get('/v1/api/forms/:formId/filteredResponses', async (req: Request, res: Response) => {
    try {
        const submissions = await getSubmissions(req, res);
        res.status(200).json(submissions);
    } catch(error) {
        if (error instanceof ZodError) {
            console.error(error.issues); // Handle ZodError
            const errorMessage = error.issues;
            
            res.status(400).json({ error: errorMessage });
        } else {
            console.error(error); // Log other errors
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
})

export default router;