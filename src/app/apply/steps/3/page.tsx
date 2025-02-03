"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";

// FIXME: this page is currently broken due to lack of context (previous implementation was using a context provider)
export default function stepPage() {
  const router = useRouter();

  // TODO: integrate with zod
  const sigRef = useRef<SignaturePad | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const [show, setShow] = useState(true);
  const [back, setBack] = useState(false);

  const handleSignatureEnd = () => {
    if (sigRef.current) {
      setSignature(sigRef.current.toDataURL());
    }
  };
  const clearSignature = () => {
    if (sigRef.current) {
      sigRef.current.clear();
    }
    setSignature(null);
  };

  useEffect(() => {
    console.log(signature);
  }, [signature]);

  return (
    <div className="space-y-2">
      <p className="text-lg font-bold">請詳閱xxxxxxxxxxx後在下方簽名</p>

      <p className="text-sm">請本人在此簽名 (簽名及代表同意xxxxx) *</p>
      <div className="bg-white">
        <SignaturePad
          canvasProps={{
            className: "w-full aspect-[2/1]",
          }}
          penColor="black"
          ref={sigRef}
          onEnd={handleSignatureEnd}
        />
      </div>
    </div>
  );
}
