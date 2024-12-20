class MzuniPay {
  private apiKey: string;
  private baseUrl: string;

  constructor(
    apiKey: string,
    baseUrl = "http://localhost:5000/api/transaction"
  ) {
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
   * Creates and renders the payment form for vanilla JS apps with customizable styles.
   * @param {string} containerId - The ID of the HTML element to mount the form into.
   * @param {Function} onSuccess - Callback function for successful transactions.
   * @param {Function} onError - Callback function for failed transactions.
   * @param {object} options - Optional parameters to customize the form.
   */
  renderForm(
    containerId: string,
    onSuccess: (response: any) => void,
    onError: (error: any) => void,
    options: {
      styles?: {
        form?: Record<string, string>;
        input?: Record<string, string>;
        button?: Record<string, string>;
        status?: Record<string, string>;
      };
      buttonText?: string;
    } = {}
  ): void {
    const { styles = {}, buttonText = "Pay Now" } = options;

    const container = document.getElementById(containerId);
    if (!container) throw new Error("Container element not found.");

    // Default styles for the form elements
    const defaultStyles = {
      form: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      },
      input: {
        padding: "0.5rem",
        fontSize: "0.8rem",
        borderRadius: "4px",
        border: "1px solid #ccc",
      },
      button: {
        padding: "0.5rem 0.5rem",
        fontSize: "0.5rem",
        color: "#fff",
        backgroundColor: "#007BFF",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      },
      status: {
        marginTop: "0.5rem",
        fontSize: "0.5rem",
      },
    };

    // Merge user-provided styles with default styles
    const mergedStyles = {
      form: { ...defaultStyles.form, ...styles.form },
      input: { ...defaultStyles.input, ...styles.input },
      button: { ...defaultStyles.button, ...styles.button },
      status: { ...defaultStyles.status, ...styles.status },
    };

    // Apply styles to the container
    container.innerHTML = `
      <form id="paymentForm">
        <input type="email" placeholder= "Email" id="customer_email" name="customer_email" required />
        <input placeholder = "Password" type="password" id="password" name="password" required />
        <input placeholder="Amount" type="number" id="amount" name="amount" required min="0.01" step="0.01" />
        <textarea placeholder="description" id="description" name="description"></textarea>
        <button type="submit">${buttonText}</button>
      </form>
      <div id="paymentStatus"></div>
    `;

    // Apply dynamic styles
    const form = document.getElementById("paymentForm") as HTMLElement;
    Object.assign(form.style, mergedStyles.form);

    const inputs = form.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      Object.assign((input as HTMLElement).style, mergedStyles.input);
    });

    const button = form.querySelector("button") as HTMLElement;
    Object.assign(button.style, mergedStyles.button);

    const statusDiv = document.getElementById("paymentStatus") as HTMLElement;
    Object.assign(statusDiv.style, mergedStyles.status);

    // Add form submission logic
    form?.addEventListener("submit", async (e) => {
      e.preventDefault(); // Prevent form submission
      const customer_email = (
        document.getElementById("customer_email") as HTMLInputElement
      ).value;
      const password = (document.getElementById("password") as HTMLInputElement)
        .value;
      const amount = parseFloat(
        (document.getElementById("amount") as HTMLInputElement).value
      );
      const description = (
        document.getElementById("description") as HTMLTextAreaElement
      ).value;

      try {
        statusDiv.innerHTML = "Processing payment...";
        const response = await this.processPayment({
          customer_email,
          password,
          amount,
          description,
        });

        statusDiv.innerHTML = `<p style="color: green;">Payment Successful! Transaction ID: ${response.transaction.one_time_tx_id}</p>`;
        onSuccess(response);
      } catch (error: any) {
        console.error(error);
        statusDiv.innerHTML = `<p style="color: red;">Payment Failed: ${error.message}</p>`;
        onError(error);
      }
    });
  }
}

export default MzuniPay;
