"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [collectionName, setCollectionName] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    async function getQuiz() {
      setLoading(true);
      try {
        const response = await fetch("/api/collection");
        const data = await response.json();

        if (response.ok && data.ok) {
          setCollectionName(data.collections);
          setLoading(false);
        } else {
          console.log("error fetch data");
        }
      } catch (error) {
        console.log(error);
      }
    }
    getQuiz();
  }, []);

  function handlePlayRandomAns(collectionName: string) {
    router.push(`lesson?collection=${encodeURIComponent(collectionName)}`);
  }

  function handlePlay(collectionName: string) {}
  return (
    <div>
      {loading && (
        <div
          className="flex justify-center items-center"
          style={{ height: "70vh" }}
        >
          <div className="flex w-full max-w-md flex-col gap-6 px-4">
            <div className="flex items-center gap-6">
              <div className="skeleton h-24 w-24 shrink-0 rounded-full"></div>
              <div className="flex flex-col gap-4 flex-1">
                <div className="skeleton h-6 w-40 rounded"></div>
                <div className="skeleton h-6 w-56 rounded"></div>
              </div>
            </div>
            <div className="skeleton h-48 w-full rounded"></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 m-10 place-content-center">
        {!loading &&
          collectionName.map((collectionName, index) => (
            <div key={index} className="card card-border bg-gray-600 w-full">
              <div className="card-body">
                <h2 className="card-title">Lesson : {collectionName}</h2>

                <div className="card-actions justify-end">
                  <button
                    className="btn bg-fuchsia-400 rounded-2xl"
                    onClick={() => handlePlayRandomAns(collectionName)}
                  >
                    Play Now!
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className={"absolute "}>
        <div className="card bg-neutral text-neutral-content w-96">
          <div className="card-body items-center text-center">
            <h2 className="card-title">Select mode!</h2>
            <p>Type answer or choose answer</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Type</button>
              <button className="btn btn-primary">Choose</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
