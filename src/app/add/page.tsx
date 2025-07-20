"use client";

import { useState } from "react";
type QAItem = {
  id: number;
  question: string;
  answer: string;
};
export default function Home() {
  const [collectionName, setCollectionName] = useState("");
  const [quizItem, setQuizItem] = useState<QAItem[]>([]);
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    const parse = parseQuizInput(raw);
    setQuizItem(parse);
  };

  async function handleSave() {
    try {
      const response = await fetch("/api/flashcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionName: collectionName.trim(),
          data: quizItem,
        }),
      });
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.log(error);
    }
  }

  function parseQuizInput(raw: string): QAItem[] {
    const lines = raw.split(/\r?\n/);
    const items: QAItem[] = [];

    lines.forEach((line, idx) => {
      const commaIdx = line.indexOf(",");
      if (commaIdx === -1) {
        const question = line.trim();
        items.push({ id: idx + 1, question: line.trim(), answer: "" });
        return;
      }
      const question = line.slice(0, commaIdx).trim();
      const answer = line.slice(commaIdx + 1).trim();

      if (!question && !answer) return;
      items.push({ id: idx + 1, question, answer });
    });

    return items;
  }
  return (
    <div>
      <div className=" justify-center items-center p-3">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Create your own quiz remembrain
          </legend>
          <textarea
            className="textarea h-12 w-full"
            placeholder="Enter header "
            onChange={(e) => {
              setCollectionName(e.target.value);
            }}
          ></textarea>
          <textarea
            className="textarea h-50 w-full"
            placeholder="Enter quiz "
            onChange={handleInput}
          ></textarea>
        </fieldset>
        <div className="flex justify-end">
          <button
            className="btn btn-lg flex justify-items-end mt-2 bg-blue-500 rounded-2xl"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 p-2 gap-2">
        {quizItem.map((quiz) => {
          return (
            <div
              key={quiz.id}
              className="card card-sm shadow-sm bg-gray-600 w-full max-w-full"
            >
              <div className="card-body">
                <h1 className="card-title">Question : {quiz.id}</h1>
                <h2 className="card-title break-words whitespace-normal">
                  Question : {quiz.question}
                </h2>
                <h3 className="break-words whitespace-normal">
                  Answer : {quiz.answer}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
