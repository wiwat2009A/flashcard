"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [collectionName, setCollectionName] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectCollection, setSelectCollection] = useState<string>("");
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

  function handlePlayRandomAns() {
    let collectionName: string = selectCollection;
    router.push(
      `lesson/random/?collection=${encodeURIComponent(collectionName)}`
    );
  }

  function handlePlayTypingAns() {
    let collectionName: string = selectCollection;
    router.push(
      `lesson/typing/?collection=${encodeURIComponent(collectionName)}`
    );
  }

  const modalRef = useRef<HTMLDialogElement>(null);

  const openModal = (collectionName: string) => {
    setSelectCollection(collectionName);
    modalRef.current?.showModal();
  };
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
                    onClick={() => openModal(collectionName)}
                  >
                    Play Now!
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div>
        <dialog ref={modalRef} className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Please select mode !</h3>
            <p className="">Typing answer or Select answer</p>
            <div className="mt-10">
              {" "}
              <button
                className="btn bg-blue-500 rounded-2xl"
                onClick={() => handlePlayTypingAns()}
              >
                Typing
              </button>{" "}
              <button
                className="btn bg-emerald-500 rounded-2xl"
                onClick={() => handlePlayRandomAns()}
              >
                Choose answer
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
}
