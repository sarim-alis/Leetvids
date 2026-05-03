// Imports.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PROBLEMS } from "../data/problems";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import Navbar from "../components/Navbar";
import { executeCode } from "../lib/piston";
import { validateSolution, generateHint } from "../lib/openai";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

// Frontend.
function ProblemPage() {
  // States.
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentProblemId, setCurrentProblemId] = useState("two-sum");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(PROBLEMS[currentProblemId].starterCode.javascript);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [aiValidation, setAiValidation] = useState(null);
  const [hint, setHint] = useState(null);
  const currentProblem = PROBLEMS[currentProblemId];

  // Update problem when url param changes.
  useEffect(() => {
    if (id && PROBLEMS[id]) {
      setCurrentProblemId(id);
      setCode(PROBLEMS[id].starterCode[selectedLanguage]);
      setOutput(null);
    }
  }, [id, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
    setOutput(null);
  };

  const handleProblemChange = (newProblemId) => navigate(`/problem/${newProblemId}`);
  const triggerConfetti = () => {confetti({ particleCount: 80, spread: 250, origin: { x: 0.2, y: 0.6 },});confetti({ particleCount: 80, spread: 250, origin: { x: 0.8, y: 0.6 },});
  };

  const normalizeOutput = (output) => {
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          .replace(/\s*,\s*/g, ",")
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const checkIfTestsPassed = (actualOutput, expectedOutput) => {
    const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);

    return normalizedActual == normalizedExpected;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    if (result.success) {
      const expectedOutput = currentProblem.expectedOutput[selectedLanguage];
      const testsPassed = checkIfTestsPassed(result.output, expectedOutput);

      if (testsPassed) {
        triggerConfetti();
        toast.success("All tests passed! Great job!");
      } else {
        toast.error("Tests failed. Check your output!");
      }
    } else {
      toast.error("Code execution failed!");
    }
  };

  const handleValidateWithAI = async () => {
    if (!currentProblem.openaiValidation?.enabled) {
      toast.error("AI validation not available for this problem");
      return;
    }

    setIsValidating(true);
    setAiValidation(null);

    try {
      const validation = await validateSolution(
        currentProblem.title,
        currentProblem.description.text,
        code,
        selectedLanguage
      );

      setAiValidation(validation);

      if (validation.success) {
        if (validation.isCorrect) {
          toast.success(`AI Validation: Score ${validation.score}/100 - Solution is correct!`);
          if (validation.score >= 90) {
            triggerConfetti();
          }
        } else {
          toast.error(`AI Validation: Score ${validation.score}/100 - Solution needs improvement`);
        }
      } else {
        toast.error("AI validation failed");
      }
    } catch (error) {
      toast.error("Error validating with AI");
    } finally {
      setIsValidating(false);
    }
  };

  const handleGetHint = async () => {
    if (!currentProblem.openaiValidation?.enabled) {
      toast.error("Hints not available for this problem");
      return;
    }

    try {
      const hintResult = await generateHint(
        currentProblem.title,
        currentProblem.description.text,
        selectedLanguage
      );

      if (hintResult.success) {
        setHint(hintResult.hint);
        toast.success("Hint generated!");
      } else {
        toast.error("Failed to generate hint");
      }
    } catch (error) {
      toast.error("Error getting hint");
    }
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* left panel- problem desc */}
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription problem={currentProblem} currentProblemId={currentProblemId} onProblemChange={handleProblemChange} allProblems={Object.values(PROBLEMS)} />
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* right panel- code editor & output */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Top panel - Code editor */}
              <Panel defaultSize={70} minSize={30}>
                <CodeEditorPanel selectedLanguage={selectedLanguage} code={code} isRunning={isRunning} onLanguageChange={handleLanguageChange} onCodeChange={setCode} onRunCode={handleRunCode} />
              </Panel>
              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              {/* Bottom panel - Output Panel*/}
              <Panel defaultSize={30} minSize={30}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;