import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Expense {
  id: number;
  category: string;
  description: string;
  amount: string;
}

interface FormData {
  date: string;
  startingCash: string;
  totalExpenses: number;
  dailyIncome: string;
}

interface FormStore {
  formData: FormData;
  expenses: Expense[];
  setFormData: (data: Partial<FormData>) => void;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (id: number) => void;
  updateExpense: (id: number, field: string, value: string) => void;
  clearForm: () => void;
}

const getInitialFormData = (): FormData => ({
  date: new Date().toISOString().split("T")[0],
  startingCash: "",
  totalExpenses: 0,
  dailyIncome: "",
});

const getInitialExpenses = (): Expense[] => [
  { id: 1, category: "Закупка Продуктов", description: "", amount: "" },
];

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      formData: getInitialFormData(),
      expenses: getInitialExpenses(),

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      setExpenses: (expenses) => set({ expenses }),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, expense],
        })),

      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        })),

      updateExpense: (id, field, value) =>
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, [field]: value } : expense
          ),
        })),

      clearForm: () =>
        set({
          formData: getInitialFormData(),
          expenses: getInitialExpenses(),
        }),
    }),
    {
      name: "cafe-expenses-form-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
