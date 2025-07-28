"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type QAItem = {
  question: string;
  answer: string;
};

export default function TestPage() {
  const searchParams = useSearchParams();
  const collectionName = searchParams.get("collection") || "";

  const [quizData, setQuizData] = useState<QAItem[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(
          `/api/flashcard?collection=${encodeURIComponent(collectionName)}`
        );
        const data = await res.json();
        if (res.ok && data.ok) {
          const items: QAItem[] = data.quizzes ?? [];
          setQuizData(items);

          const shuffledIdx = [...items.keys()].sort(() => Math.random() - 0.5);
          setOrder(shuffledIdx);
          setPos(0);
        } else {
          console.error("Error fetching quiz data:", data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    if (collectionName) {
      fetchQuiz();
    }
  }, [collectionName]);

  const currentQuestion = quizData[order[pos]];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentQuestion || feedback !== null) return;

    const normalizedInput = input.trim().toLowerCase();
    const normalizedAnswer = currentQuestion.answer.trim().toLowerCase();
    const isCorrect = normalizedInput === normalizedAnswer;

    setAnswered((prev) => prev + 1);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback("correct");
      setTimeout(() => {
        handleNext();
      }, 1000);
    } else {
      setFeedback("incorrect");
    }
  }

  function handleNext() {
    const nextPos = pos + 1;
    if (nextPos >= order.length) {
      setFinished(true);
      return;
    }

    setPos(nextPos);
    setInput("");
    setFeedback(null);
  }

  function handleRestart() {
    const shuffledIdx = [...quizData.keys()].sort(() => Math.random() - 0.5);
    setOrder(shuffledIdx);
    setPos(0);
    setInput("");
    setScore(0);
    setAnswered(0);
    setFinished(false);
    setFeedback(null);
  }

  const inputClass = `input input-bordered w-full text-lg ${
    feedback === "correct"
      ? "border-green-500"
      : feedback === "incorrect"
      ? "border-red-500"
      : ""
  }`;

  if (!collectionName) {
    return <p className="p-6 text-red-500">No collection selected.</p>;
  }

  if (quizData.length === 0 && !finished) {
    return <p className="p-6">Loading quiz...</p>;
  }

  if (finished) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">จบการทดสอบ!</h1>
        <p className="text-lg mb-2">
          คุณตอบถูก {score} / {quizData.length} ข้อ
        </p>
        <button
          className="btn bg-blue-500 text-white rounded-2xl mt-4"
          onClick={handleRestart}
        >
          เริ่มใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Quiz: {collectionName}</h1>
      <div className="mb-4 text-sm text-gray-400">
        ข้อที่ {pos + 1} / {order.length} | ตอบถูก: {score} | ทำแล้ว: {answered}
      </div>

      {currentQuestion && (
        <div className="bg-gray-400 shadow-md rounded p-4 mb-4">
          <h2 className="text-xl font-semibold mb-4">
            {currentQuestion.question}
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={inputClass}
              placeholder="พิมพ์คำตอบที่นี่..."
              disabled={feedback === "correct"}
              autoFocus
            />
          </form>

          {/* แสดงเฉลยเมื่อผิด */}
          {feedback === "incorrect" && (
            <>
              <p className="mt-2 text-red-700 text-lg">
                ❌ คำตอบที่ถูกต้องคือ:{" "}
                <strong className="underline">{currentQuestion.answer}</strong>
              </p>
              <button
                onClick={handleNext}
                className="btn bg-red-500 text-white rounded-2xl mt-4"
              >
                ข้อต่อไป
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
