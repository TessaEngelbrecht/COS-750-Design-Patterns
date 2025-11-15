"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CheatSheetDialog({
  attemptId,
  onOpenLog,
}: {
  attemptId: string;
  onOpenLog?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);

    // Log access API call
    if (onOpenLog && attemptId) {
      onOpenLog();
    }
  };

  return (
    <>
      {/* <Button
        onClick={handleOpen}
        className="rounded-lg border border-teal-700 text-teal-700 hover:bg-teal-50 px-3 py-2"
      >
        Cheat Sheet
      </Button> */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button
                variant="outline"
                className="rounded-lg border border-teal-200 px-3 py-2 text-teal-700 hover:bg-teal-50"
                onClick={handleOpen}
            >
                <img
                src="/icons/idea.svg"
                alt=""
                className="h-[24px] w-[24px]"
                />
            </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[92vw] lg:max-w-6xl h-[85vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-6 pt-4 pb-3 border-b shrink-0">
                  <DialogTitle className="text-teal-700">
                    Quick Reference
                  </DialogTitle>
                </DialogHeader>

                <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-2 pb-3">
                  <h2 className="font-bold text-teal-700">Introduction</h2>
                  <span>
                    The Observer Pattern creates a one-to-many link between a Subject and its Observers. When the Subject changes state, all registered Observers are automatically notified and updated. It allows dynamic attach/detach and keeps components loosely coupled.
                  </span>

                  <h2 className="font-bold text-teal-700 mt-4">Intent</h2>
                  <ul className="list-disc ml-6 space-y-1">
                    <li><strong>Name:</strong> Observer</li>
                    <li><strong>Classification:</strong> Behavioural Pattern</li>
                    <li><strong>Strategy:</strong> Delegation (Object)
                    </li>
                    <li>
                      <strong>Intent:</strong> Define a one-to-many dependency so that when
                      one object changes state, all its dependents are notified and updated
                      automatically.
                    </li>
                  </ul>

                  <h2 className="font-bold text-teal-700 mt-4">Participants</h2>
                  <ul className="list-disc ml-6 space-y-1">
                    <li><strong>Subject</strong> – interface for attaching and detaching observers.</li>
                    <li><strong>ConcreteSubject</strong> – implements storage and notifies observers on state change.</li>
                    <li><strong>Observer</strong> – defines an <code>update()</code> interface.</li>
                    <li><strong>ConcreteObserver</strong> – keeps a reference to the subject and updates its own state
                    </li>
                  </ul>

                  <h2 className="font-bold text-teal-700 mt-4">Structure</h2>

                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {`interface Subject {
    attach(o: Observer): void;
    detach(o: Observer): void;
    notify(): void;
}

interface Observer {
    update(subject: Subject): void;
}`}
                  </pre>
                </div>
              </DialogContent>
      </Dialog>
    </>
  );
}
