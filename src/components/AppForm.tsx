import { Plus, X, Calculator, Coffee } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchPreviousExpenses } from "../api/webhook-api";

function AppForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    startingCash: "",
    totalExpenses: 0,
    dailyIncome: "",
  });

  const [previousExpenses, setPreviousExpenses] = useState<number | null>(null);

  const [expenses, setExpenses] = useState([
    { id: 1, category: "Закупка Продуктов", description: "", amount: "" },
  ]);

  const webhookUrlEnv = import.meta.env.DEV
    ? import.meta.env.VITE_DEV_WEBHOOK_URL
    : import.meta.env.VITE_PROD_WEBHOOK_URL;

  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl] = useState(webhookUrlEnv);

  useEffect(() => {
    const loadPreviousExpenses = async () => {
      const previous = await fetchPreviousExpenses();
      setPreviousExpenses(previous || null);
    };

    loadPreviousExpenses();
  }, []);

  const categories = [
    "Закупка Продуктов",
    "Закупка Дессертов",
    "Закупка Молока",
    "Закупка Кофе",
    "Закупка Посуды",
    "На руки",
    "Аренда",
    "Реклама",
    "Коммуналка",
    "Прочее",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addExpenseRow = () => {
    const newExpense = {
      id: Date.now(),
      category: "Закупка Продуктов",
      description: "",
      amount: "",
    };
    setExpenses([...expenses, newExpense]);
  };

  const removeExpenseRow = (id: number) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter((expense) => expense.id !== id));
    }
  };

  const updateExpense = (id: number, field: string, value: string) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
  };

  const calculateTotal = () => {
    return (
      (parseFloat(formData.startingCash) || 0) +
      (parseFloat(formData.dailyIncome) || 0) -
      expenses.reduce((sum, expense) => {
        return sum + (parseFloat(expense.amount) || 0);
      }, 0)
    );
  };

  const handleSave = async () => {
    // Validation
    // if (!formData.date || !formData.startingCash) {
    //   // return;
    // }
    console.log(formData);

    const incompleteExpenses = expenses.filter(
      (expense) => parseFloat(expense.amount) < 1.0
    );
    console.log(incompleteExpenses);

    if (
      incompleteExpenses.length > 0 ||
      !parseFloat(formData.dailyIncome) ||
      !parseFloat(formData.startingCash)
    ) {
      alert("Нужно заполнить все поля!");
      return;
    }

    const reportData = {
      date: formData.date,
      startingCash: parseFloat(formData.startingCash),
      dailyIncome: parseFloat(formData.dailyIncome),
      expenses: expenses.map((expense) => ({
        category: expense.category,
        description: expense.description,
        amount: parseFloat(expense.amount),
      })),
      totalExpenses: calculateTotal(),
    };

    setIsLoading(true);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        alert(
          `Daily report sent successfully!\nTotal expenses: ${calculateTotal().toFixed(
            2
          )}`
        );
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Error sending report:", error);
      alert(
        `Failed to send report: ${error.message}\n\nPlease check your webhook URL and try again.`
      );
    } finally {
      setIsLoading(false);
    }

    // Clear form data
    setFormData({
      date: new Date().toISOString().split("T")[0],
      startingCash: "",
      totalExpenses: 0,
      dailyIncome: "",
    });
    setExpenses([
      { id: 1, category: "Закупка Продуктов", description: "", amount: "" },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 md:p-4 text-gray-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-xl shadow-sm p-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Coffee className="text-amber-600" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">
              Termos Cafe Report
            </h1>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-b-xl">
          {/* Basic Information Section */}
          <div className="p-5 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата Отчета
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сумма на начало дня
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.startingCash}
                    onChange={(e) =>
                      handleInputChange("startingCash", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                Приход за день грн.
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.dailyIncome}
                  onChange={(e) =>
                    handleInputChange("dailyIncome", e.target.value)
                  }
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="p-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Расход</h2>
              <button
                onClick={addExpenseRow}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm cursor-pointer"
              >
                <Plus size={18} />
                Добавить расход
              </button>
            </div>

            {/* Expenses Table */}
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-3/12">
                        Категория
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-6/12">
                        Описание
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-2/12">
                        Сумма
                      </th>
                      <th className="px-2 py-3 text-center text-sm font-semibold text-gray-700 w-1/12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="hover:bg-white transition-colors"
                      >
                        <td className="px-2 py-3">
                          <select
                            value={expense.category}
                            onChange={(e) =>
                              updateExpense(
                                expense.id,
                                "category",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={expense.description}
                            onChange={(e) =>
                              updateExpense(
                                expense.id,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Enter expense description..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="relative">
                            <input
                              type="number"
                              value={expense.amount}
                              onChange={(e) =>
                                updateExpense(
                                  expense.id,
                                  "amount",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                          </div>
                        </td>
                        <td className="px-1 py-3 text-center">
                          <button
                            onClick={() => removeExpenseRow(expense.id)}
                            disabled={expenses.length === 1}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove expense"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end flex-row gap-4">
              {previousExpenses && (
                <div className="mt-6 flex justify-end">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calculator size={18} />
                      <span className="text-sm font-medium">
                        Сумма за вчерашний день
                      </span>
                    </div>
                    <div className="text-2xl font-bold">
                      {previousExpenses.toFixed(2)} грн.
                    </div>
                  </div>
                </div>
              )}

              {/* Total Section */}
              <div className="mt-6 flex justify-end">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator size={18} />
                    <span className="text-sm font-medium">
                      Сумма на конец дня
                    </span>
                  </div>
                  <div className="text-2xl font-bold">
                    {calculateTotal().toFixed(2)} грн.
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 hover:cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    "Отправляем отчет..."
                  </>
                ) : (
                  "Отправить отчет"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppForm;
