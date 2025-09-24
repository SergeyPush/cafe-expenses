const webhookUrlGet = import.meta.env.VITE_PROD_WEBHOOK_GET_URL;

export const fetchPreviousExpenses = async () => {
  try {
    const response = await fetch(webhookUrlGet, { method: "GET" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data[0].previous_income || 0;
    console.log("Previous expenses fetched:", data[0].previous_income);
  } catch (error) {
    console.error("Error fetching previous expenses:", error);
  }
};
