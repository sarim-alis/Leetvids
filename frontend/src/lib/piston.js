// OpenAI-based code execution service

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn("OpenAI API key not found. Code execution will use local simulation.");
}

/**
 * @param {string} language - programming language
 * @param {string} code - source code to execute
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */

// Local code execution simulation as fallback
function simulateCodeExecution(language, code) {
  try {
    let output = "";
    
    // Simple simulation based on language
    if (language === "javascript") {
      // Basic JavaScript simulation
      if (code.includes("console.log")) {
        const matches = code.match(/console\.log\((.*?)\)/g);
        if (matches) {
          output = matches.map(match => {
            const content = match.replace(/console\.log\((.*?)\)/, "$1");
            try {
              return eval(content);
            } catch (e) {
              return content;
            }
          }).join("\n");
        }
      }
      // Try to evaluate simple expressions
      try {
        const result = eval(code);
        if (result !== undefined) {
          output = String(result);
        }
      } catch (e) {
        // Ignore eval errors for complex code
      }
    } else if (language === "python") {
      // Python simulation
      if (code.includes("print")) {
        const matches = code.match(/print\((.*?)\)/g);
        if (matches) {
          output = matches.map(match => {
            const content = match.replace(/print\((.*?)\)/, "$1");
            return content.replace(/['"]/g, "");
          }).join("\n");
        }
      }
    } else if (language === "java") {
      // Java simulation
      if (code.includes("System.out.println")) {
        const matches = code.match(/System\.out\.println\((.*?)\)/g);
        if (matches) {
          output = matches.map(match => {
            const content = match.replace(/System\.out\.println\((.*?)\)/, "$1");
            return content.replace(/['"]/g, "");
          }).join("\n");
        }
      }
    }

    return {
      success: true,
      output: output || "Code executed successfully (local simulation)",
      isSimulation: true
    };
  } catch (error) {
    return {
      success: false,
      error: `Simulation error: ${error.message}`,
      isSimulation: true
    };
  }
}

export async function executeCode(language, code) {
  try {
    if (!OPENAI_API_KEY) {
      console.log("OpenAI API key not found, using local simulation");
      return simulateCodeExecution(language, code);
    }

    // Use OpenAI to execute and analyze the code
    const prompt = `Execute and analyze this ${language} code. Provide the exact output that would be produced when this code runs.

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Please respond with ONLY the exact output that would be printed to console. If there are multiple lines of output, separate them with newlines. If there would be no output, respond with "No output". Do not include explanations, just the raw output.`;

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
            content: 'You are a code execution engine. Respond only with the exact output that would be produced by running the code. No explanations, no formatting, just raw output.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const output = data.choices[0].message.content.trim();

    return {
      success: true,
      output: output === "No output" ? "" : output,
      isSimulation: false,
      executionMethod: "OpenAI"
    };

  } catch (error) {
    console.error('OpenAI execution error:', error);
    console.log('Falling back to local simulation');
    return simulateCodeExecution(language, code);
  }
}

function getFileExtension(language) {
  const extensions = {
    javascript: "js",
    python: "py",
    java: "java",
  };

  return extensions[language] || "txt";
}