"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type QAItem = {
  question: string;
  answer: string;
};

type MCState = {
  question: QAItem;
  choices: string[];
  correctIndex: number;
};

export default function TestPage() {
  const searchParams = useSearchParams();
  const collectionName = searchParams.get("collection") || "";

  const [quizData, setQuizData] = useState<QAItem[]>([]);
  const [order, setOrder] = useState<number[]>([]); // ลำดับคำถามแบบสุ่ม
  const [pos, setPos] = useState(0); // ตำแหน่งข้อปัจจุบันใน order
  const [mc, setMc] = useState<MCState | null>(null); // ข้อมูล MC ที่ render
  const [score, setScore] = useState(0); // จำนวนข้อถูก
  const [answered, setAnswered] = useState(0); // จำนวนข้อที่ตอบไปแล้ว
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null); // index ที่เลือก
  const [finished, setFinished] = useState(false); // จบการทดสอบหรือยัง

  /* โหลดข้อมูลจาก API เมื่อ collectionName เปลี่ยน */
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

          // สร้างลำดับสุ่มข้อสอบ
          const shuffledIdx = shuffleArray(items.map((_, i) => i));
          setOrder(shuffledIdx);
          setPos(0);

          // เตรียมข้อแรก
          const first = buildMC(items, shuffledIdx[0]);
          setMc(first);
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

  /* สร้าง MCState จาก index ของ quizData */
  function buildMC(all: QAItem[], idx: number): MCState | null {
    const question = all[idx];
    if (!question) return null;

    // pool คำตอบผิด (ทั้งหมดที่ไม่ใช่คำตอบถูก และไม่ว่าง)
    const wrongPool = all
      .map((q) => (q.answer ?? "").trim())
      .filter((ans) => ans !== "" && ans !== question.answer);

    // สุ่มเลือก 3 คำตอบผิด (หรือเท่าที่มี)
    const wrongChoices = shuffleArray(wrongPool).slice(0, 3);

    // รวม + สลับ
    const merged = [question.answer, ...wrongChoices];
    const shuffled = shuffleArray(merged);
    const correctIndex = shuffled.findIndex((c) => c === question.answer);

    return {
      question,
      choices: shuffled,
      correctIndex,
    };
  }

  /* ผู้ใช้เลือกคำตอบ */
  function handleAnswer(choiceIdx: number) {
    if (!mc || selectedIdx !== null) return; // กันกดซ้ำ
    setSelectedIdx(choiceIdx);

    // อัปเดตจำนวนข้อที่ตอบ
    setAnswered((prev) => prev + 1);

    // ถ้าถูก → เพิ่มคะแนน
    if (choiceIdx === mc.correctIndex) {
      setScore((prev) => prev + 1);
      setTimeout(handleNext, 500);
    }
  }

  /* ไปข้อต่อไป */
  function handleNext() {
    if (finished) return;
    const nextPos = pos + 1;

    if (nextPos >= order.length) {
      // จบ
      setFinished(true);
      return;
    }

    setPos(nextPos);
    const nextMC = buildMC(quizData, order[nextPos]);
    setMc(nextMC);
    setSelectedIdx(null);
  }

  /* เริ่มใหม่ */
  function handleRestart() {
    if (quizData.length === 0) return;
    const shuffledIdx = shuffleArray(quizData.map((_, i) => i));
    setOrder(shuffledIdx);
    setPos(0);
    setScore(0);
    setAnswered(0);
    setFinished(false);
    setSelectedIdx(null);
    setMc(buildMC(quizData, shuffledIdx[0]));
  }

  if (!collectionName) {
    return <p className="p-6 text-red-500">No collection selected.</p>;
  }

  if (quizData.length === 0 && !finished) {
    return <p className="p-6">Loading quiz...</p>;
  }

  /* หน้าสรุปเมื่อจบ */
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
    <div className="p-6">
      {/* ส่วนหัว + สถานะ */}
      <h1 className="text-2xl font-bold mb-2">Quiz: {collectionName}</h1>
      <div className="mb-4 text-sm text-gray-400">
        ข้อที่ {pos + 1} / {order.length} | ตอบถูก: {score} | ทำแล้ว: {answered}
      </div>

      {/* แสดงคำถาม */}
      {mc ? (
        <div className=" bg-gray-500 shadow-md rounded p-4 mb-4">
          <h2 className="text-3xl font-semibold mb-4">
            {mc.question.question}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {mc.choices.map((choice, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrect = idx === mc.correctIndex;
              const showFeedback = selectedIdx !== null;

              let btnClass = "btn rounded-lg";
              if (showFeedback) {
                if (isCorrect) {
                  btnClass += " !bg-green-400 !text-white ";
                } else if (isSelected) {
                  btnClass += " !bg-red-400 !text-white";
                } else {
                  btnClass += " !bg-red-200";
                }
              } else {
                btnClass += " !bg-blue-200 hover:!bg-blue-400";
              }

              return (
                <button
                  key={idx}
                  className={btnClass}
                  disabled={showFeedback}
                  onClick={() => handleAnswer(idx)}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p>Loading quiz...</p>
      )}

      {/* ปุ่มไปต่อ (แสดงหลังเลือกคำตอบแล้ว) */}
      {selectedIdx !== null && (
        <button
          className="btn bg-green-400 mt-4 rounded-2xl"
          onClick={handleNext}
        >
          ข้อต่อไป
        </button>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */
function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
