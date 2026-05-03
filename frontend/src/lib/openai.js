// OpenAI API service for solution validation

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn("OpenAI API key not found. Solution validation will be disabled.");
}

/**
 * Validates a coding solution using OpenAI API
 * @param {string} problemTitle - The title of the problem
 * @param {string} problemDescription - The problem description
 * @param {string} userCode - The user's submitted code
 * @param {string} language - The programming language (javascript, python, java)
 * @returns {Promise<{success: boolean, feedback: string, score: number, isCorrect: boolean}>}
 */
export async function validateSolution(problemTitle, problemDescription, userCode, language) {
  if (!OPENAI_API_KEY) {
    return {
      success: false,
      feedback: "OpenAI API key not configured. Cannot validate solution.",
      score: 0,
      isCorrect: false
    };
  }

  try {
    const prompt = `You are an expert coding instructor. Please analyze the following solution and provide detailed feedback.

Problem: ${problemTitle}
Description: ${problemDescription}
Language: ${language}
User's Code:
\`\`\`${language}
${userCode}
\`\`\`

Please evaluate the solution based on:
1. Correctness (Does it solve the problem correctly?)
2. Efficiency (Time and space complexity)
3. Code quality and best practices
4. Edge cases handled

Provide your response in this exact JSON format:
{
  "isCorrect": true/false,
  "score": 0-100,
  "feedback": "Detailed feedback explaining what's good and what needs improvement",
  "timeComplexity": "Big O notation for time complexity",
  "spaceComplexity": "Big O notation for space complexity",
  "suggestions": "Specific suggestions for improvement"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert coding instructor who provides detailed, constructive feedback on coding solutions. Always respond in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a basic response
      analysis = {
        isCorrect: content.toLowerCase().includes('correct') || content.toLowerCase().includes('solves'),
        score: 70,
        feedback: content,
        timeComplexity: "Unknown",
        spaceComplexity: "Unknown",
        suggestions: "Review the solution for potential improvements."
      };
    }

    return {
      success: true,
      ...analysis
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      success: false,
      feedback: `Error validating solution: ${error.message}`,
      score: 0,
      isCorrect: false
    };
  }
}

/**
 * Generates hints for a problem using OpenAI
 * @param {string} problemTitle - The title of the problem
 * @param {string} problemDescription - The problem description
 * @param {string} language - The programming language
 * @returns {Promise<{success: boolean, hint: string}>}
 */
export async function generateHint(problemTitle, problemDescription, language) {
  if (!OPENAI_API_KEY) {
    return {
      success: false,
      hint: "OpenAI API key not configured. Cannot generate hints."
    };
  }

  try {
    const prompt = `Provide a helpful hint for solving this coding problem without giving away the full solution.

Problem: ${problemTitle}
Description: ${problemDescription}
Language: ${language}

Give a gentle hint that points the user in the right direction. Keep it concise and encouraging.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful coding tutor who provides gentle hints without giving away the full solution.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const hint = data.choices[0].message.content;

    return {
      success: true,
      hint: hint.trim()
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      success: false,
      hint: `Error generating hint: ${error.message}`
    };
  }
}
