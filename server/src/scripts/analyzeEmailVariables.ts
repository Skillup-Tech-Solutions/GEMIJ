/**
 * Script to verify all email methods pass the correct variables to templates
 */

import { emailTemplates } from '../templates/emailTemplates';

// Extract all variables used in each template
function extractVariables(templateString: string): Set<string> {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    let match;

    while ((match = regex.exec(templateString)) !== null) {
        // Clean up the variable name (remove helpers like #if, /if, etc.)
        const varName = match[1].trim().replace(/^[#/]/, '').split(' ')[0];
        if (varName && !['if', 'each', 'else'].includes(varName)) {
            variables.add(varName);
        }
    }

    return variables;
}

console.log('📋 Email Template Variable Requirements\n');
console.log('='.repeat(80));

for (const [templateName, template] of Object.entries(emailTemplates)) {
    console.log(`\n📧 ${templateName}`);
    console.log('-'.repeat(80));

    // Get HTML template string
    const htmlSample = template.html({});
    const textTemplate = template.text;

    // Extract variables from both HTML and text
    const htmlVars = extractVariables(htmlSample);
    const textVars = extractVariables(textTemplate);
    const subjectVars = extractVariables(template.subject);

    // Combine all variables
    const allVars = new Set([...htmlVars, ...textVars, ...subjectVars]);

    console.log('Required variables:');
    const sortedVars = Array.from(allVars).sort();
    sortedVars.forEach(v => {
        console.log(`  - ${v}`);
    });
}

console.log('\n' + '='.repeat(80));
console.log('\n✅ Analysis complete! Review the output above to ensure all variables are passed.');
