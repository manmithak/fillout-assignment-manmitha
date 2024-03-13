import { Request, Response } from 'express';
const axios = require('axios').default;
import { FilterRequestParamsSchema, FilterRequestQuerySchema, RequestFiltersType, RequestFiltersSchema, FilterRequestQueryType, FilterRequestParamsType} from '../models/filteredReq';
import { FilteredResponse, Responses } from '../models/filteredRes'
import dayjs from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();

const questionTypes = ['Address', 'AudioRecording', 'Calcom', 'Calendly', 'Captcha', 'Checkbox', 'Checkboxes', 'ColorPicker', 'CurrencyInput', 'DatePicker', 'DateRange', 'DateTimePicker', 'Dropdown', 'EmailInput', 'FileUpload', 'ImagePicker', 'LocationCoordinates', 'LongAnswer', 'Matrix', 'MultiSelect', 'MultipleChoice', 'NumberInput', 'OpinionScale', 'Password', 'Payment', 'PhoneNumber', 'Ranking', 'RecordPicker', 'ShortAnswer', 'Signature', 'Slider', 'StarRating', 'Switch', 'TimePicker', 'URLInput']
const calcTypes = ['number', 'text']
export async function getSubmissions(req: Request, res: Response): Promise<FilteredResponse> {
    try{
        // parse input request params and query params using zod objects
        const filterParams = FilterRequestParamsSchema.parse(req.params) as FilterRequestParamsType
        const filterQueryParams = FilterRequestQuerySchema.parse(req.query) as FilterRequestQueryType
        console.log(filterQueryParams)

        const parsedValue = JSON.parse(filterQueryParams.filters);
        const filterClauseResponse = RequestFiltersSchema.parse(parsedValue);

        // getting apiKey and apiUrl from .env file
        const apiKey = process.env.FILLOUT_API_KEY;
        const apiUrl = process.env.FILLOUT_API_HOST;

        // build apiRoute and query params
        const apiRoute = '/v1/api/forms/' + filterParams.formId + '/submissions'
        const queryParams = {
            limit: filterQueryParams.limit,
            afterDate: filterQueryParams.afterDate,
            beforeDate: filterQueryParams.beforeDate,
            offset: filterQueryParams.offset,
            status: filterQueryParams.status,
            includeEditLink: filterQueryParams.includeEditLink?.toString(),
            sort: filterQueryParams.sort,
        }
        
        // use axios to make a get call to fillout submissions api, with authorization as bearer apiKey
        const apiResponse = await axios.get(apiUrl+apiRoute, {
            params: queryParams,
            headers:{
                'Authorization': `Bearer ${apiKey}`
            }
        })
        const filloutApiResponse = apiResponse.data as FilteredResponse

        const filterResponse = filterResponses(filloutApiResponse.responses, filterClauseResponse)
        const totalResponses = filterResponse.length
        return {responses: filterResponse, totalResponses: totalResponses, pageCount: Math.ceil(totalResponses / 150)} as FilteredResponse

    } catch (error){
        throw error
    }
}

function isValidDate(dateStr: string, format: string = 'YYYY-MM-DD'): boolean {
    return dayjs(dateStr, format).isValid();
}


function filterResponses(responses: Responses[], filters: RequestFiltersType): Responses[] {
    return responses.filter(response => {
        return filters.every(filter => {
            const question = response.questions.find(q => q.id === filter.id);
            if (!question) return false;
            console.log(question)
            console.log(isValidDate(question.value), 'is valid ----------------------------------->')
            if (questionTypes.includes(question.type) && !isValidDate(question.value)) {
                if (filter.condition === 'equals') {
                    return question.value === filter.value;
                } else if (filter.condition === 'does_not_equal') {
                    return question.value !== filter.value;
                } 
            } else if (calcTypes.includes(question.type) || isValidDate(question.value)) {
                if (filter.condition === 'equals') {
                    return question.value === filter.value;
                } else if (filter.condition === 'does_not_equal') {
                    return question.value !== filter.value;
                } else if (filter.condition === 'greater_than') {
                    return question.value > filter.value;
                } else if (filter.condition === 'less_than') {
                    return question.value < filter.value;
                }
            }
            return false
        });
    });
}

