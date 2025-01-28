import { signUpData } from "./types";
import { createContext, useContext, useState, type ReactNode } from "react";

// Ref: https://github.com/63r6o/shadcn-nextjs-multistep-form-example

interface MultistepFormContextType {
  formData: signUpData;
  updateFormData: (data: Partial<signUpData>) => void;
  clearFormData: () => void;
}

const MultistepFormContext = createContext<
  MultistepFormContextType | undefined
>(undefined);

const STORAGE_KEY = "signup-form-data";

export default function MultistepFormContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const initialFormData: signUpData = {
    name: {
      en: "",
      zh: "",
    },
    teamMemberCount: 4,
    teamLeader: {
      name: {
        en: "",
        zh: "",
      },
      grade: "高中一年級",
      school: "",
      telephone: "",
      email: "",
      emergencyContact: {
        name: "",
        telephone: "",
        ID: "",
      },
      diet: "",
      specialNeeds: "",
      insurance: {
        ID: "",
        birthday: new Date("2009-01-01"),
        address: "",
      },
      tShirtSize: "M",
    },
  };

  const [formData, setFormData] = useState<signUpData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialFormData;
  });

  const updateFormData = (data: Partial<signUpData>) => {
    const updatedData = { ...formData, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    setFormData(updatedData);
  };

  const clearFormData = () => {
    setFormData(initialFormData);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <MultistepFormContext.Provider
      value={{ formData, updateFormData, clearFormData }}
    >
      {children}
    </MultistepFormContext.Provider>
  );
}

export function useMultistepFormContext() {
  const context = useContext(MultistepFormContext);
  if (context === undefined) {
    throw new Error(
      "useMultistepFormContext must be used within a MultistepFormContextProvider",
    );
  }
  return context;
}
