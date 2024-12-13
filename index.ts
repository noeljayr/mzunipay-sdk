class MzuniPay {
    private apiKey: string;
    private baseUrl: string;
  
    constructor(apiKey: string, baseUrl = "http://localhost:5000/api/transaction") {
      if (!apiKey) throw new Error("API Key is required.");
      this.apiKey = apiKey;
      this.baseUrl = baseUrl;
    }
  
    /**
     * Processes the payment by calling the backend API.
     * @param {object} paymentData - The payment details.
     */
    async processPayment(paymentData: {
      customer_email: string;
      password: string;
      amount: number;
      description?: string;
    }): Promise<any> {
      const response = await fetch(`${this.baseUrl}/merchant/one-time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify(paymentData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment failed.");
      }
  
      return await response.json();
    }
  
    /**
     * Creates and renders the payment form for vanilla JS apps.
     * @param {string} containerId - The ID of the HTML element to mount the form into.
     * @param {Function} onSuccess - Callback function for successful transactions.
     * @param {Function} onError - Callback function for failed transactions.
     */
    renderForm(
      containerId: string,
      onSuccess: (response: any) => void,
      onError: (error: any) => void
    ): void {
      const container = document.getElementById(containerId);
      if (!container) throw new Error("Container element not found.");
  
      container.innerHTML = `
        <form id="paymentForm">
          <label for="customer_email">Customer Email:</label>
          <input type="email" id="customer_email" name="customer_email" required />
  
          <label for="password">Customer Password:</label>
          <input type="password" id="password" name="password" required />
  
          <label for="amount">Amount:</label>
          <input type="number" id="amount" name="amount" required min="0.01" step="0.01" />
  
          <label for="description">Description:</label>
          <textarea id="description" name="description"></textarea>
  
          <button type="submit">Pay Now</button>
        </form>
        <div id="paymentStatus"></div>
      `;
  
      const form = document.getElementById("paymentForm");
      form?.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent form submission
        const customer_email = (document.getElementById("customer_email") as HTMLInputElement)
          .value;
        const password = (document.getElementById("password") as HTMLInputElement).value;
        const amount = parseFloat(
          (document.getElementById("amount") as HTMLInputElement).value
        );
        const description = (document.getElementById("description") as HTMLTextAreaElement)
          .value;
  
        try {
          const statusDiv = document.getElementById("paymentStatus");
          if (statusDiv) statusDiv.innerHTML = "Processing payment...";
  
          const response = await this.processPayment({
            customer_email,
            password,
            amount,
            description,
          });
  
          if (statusDiv) statusDiv.innerHTML = `<p style="color: green;">Payment Successful! Transaction ID: ${response.transaction.transaction_id}</p>`;
          onSuccess(response);
        } catch (error: any) {
          console.error(error);
          const statusDiv = document.getElementById("paymentStatus");
          if (statusDiv) statusDiv.innerHTML = `<p style="color: red;">Payment Failed: ${error.message}</p>`;
          onError(error);
        }
      });
    }
  }
  
  export default MzuniPay;
  