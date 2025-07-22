// Typeform Response Parser
// Converts Typeform webhook data into our format

function parseTypeformResponse(webhookData) {
    const answers = {};
    
    // Extract form response data
    const formResponse = webhookData.form_response;
    if (!formResponse) {
        throw new Error('Invalid Typeform webhook data');
    }
    
    // Parse each answer
    formResponse.answers.forEach(answer => {
        const fieldRef = answer.field.ref;
        const fieldType = answer.type;
        
        // Handle different answer types
        switch (fieldType) {
            case 'choice':
                answers[fieldRef] = answer.choice.label;
                break;
                
            case 'choices':
                // Multiple choice - store as array
                answers[fieldRef] = answer.choices.labels;
                break;
                
            case 'number':
                answers[fieldRef] = answer.number;
                break;
                
            case 'text':
                answers[fieldRef] = answer.text;
                break;
                
            case 'opinion_scale':
                answers[fieldRef] = answer.number;
                break;
                
            default:
                console.warn(`Unknown answer type: ${fieldType}`);
                answers[fieldRef] = answer.value;
        }
    });
    
    // Add metadata
    answers._metadata = {
        submitted_at: formResponse.submitted_at,
        response_id: formResponse.token,
        form_id: formResponse.form_id,
        token: formResponse.token
    };
    
    return answers;
}

// Map Typeform answer values to our scoring values
function normalizeAnswer(fieldRef, value) {
    const mappings = {
        exit_timeline: {
            'Within 12 months': 'within-12',
            '1-2 years': '1-2-years',
            '2-3 years': '2-3-years',
            '3-5 years': '3-5-years',
            '5+ years': '5-plus',
            'Not sure': 'not-sure'
        },
        revenue_growth: {
            'Declining': 'declining',
            'Flat (0-2% annually)': 'flat',
            'Modest growth (3-10% annually)': 'modest',
            'Strong growth (11-25% annually)': 'strong',
            'Exceptional growth (>25% annually)': 'exceptional'
        },
        ebitda_margin: {
            'Negative/Break-even': 'negative',
            '0-10%': '0-10',
            '10-20%': '10-20',
            '20-30%': '20-30',
            'Over 30%': 'over-30',
            'Not sure': 'not-sure'
        },
        operate_without_owner: {
            'Yes, definitely': 'yes-definitely',
            'Yes, with minor issues': 'yes-minor',
            'Maybe, with significant challenges': 'maybe',
            'No, would struggle significantly': 'no-struggle',
            'No, would likely fail': 'no-fail'
        }
        // Add more mappings as needed
    };
    
    if (mappings[fieldRef] && mappings[fieldRef][value]) {
        return mappings[fieldRef][value];
    }
    
    return value;
}

module.exports = {
    parseTypeformResponse,
    normalizeAnswer
};