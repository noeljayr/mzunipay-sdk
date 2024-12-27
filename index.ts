import { ChangeEvent } from "rollup";

interface RenderFormOptions {
  containerId: string; // The ID of the HTML element to mount the form into
  onSuccess: (response: any) => void; // Callback function for successful transactions
  onError: (error: any) => void; // Callback function for failed transactions
  styled?: boolean; // Whether to render the form with styles (default is true)
  buttonText?: string; // Custom text for the submit button (default is "Pay Now")
  defaultValues?: {
    amount?: number;
    description?: string;
  }; // Default values for input fields
  customStyles?: {
    form?: Partial<CSSStyleDeclaration>;
    input?: Partial<CSSStyleDeclaration>;
    button?: Partial<CSSStyleDeclaration>;
    status?: Partial<CSSStyleDeclaration>;
  }; // Custom styles for the form elements
}

class MzuniPay {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("API Key is required.");
    this.apiKey = apiKey;
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
    const response = await fetch(
      `http://localhost:5000/api/transactions/merchant/one-time`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify(paymentData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Payment failed.");
    }

    return await response.json();
  }

  /**
   * Renders a payment form with configurable options.
   * @param {RenderFormOptions} options - The options to customize the form rendering.
   */
  renderForm(options: RenderFormOptions): void {
    const {
      containerId,
      onSuccess,
      onError,
      styled = true,
      buttonText = "Pay Now",
      defaultValues = {},
      customStyles = {},
    } = options;

    const container = document.getElementById(containerId);
    if (!container) throw new Error("Container element not found.");

    // Default styles for the form elements
    const defaultStyles = styled
      ? {
          form: {
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          },
          input: {
            padding: "0.35rem",
            fontSize: "0.8rem",
            borderRadius: "4px",
            border: "1px solid rgba(142, 225, 173, 0.5)",
          },
          button: {
            padding: "0.5rem 0.5rem",
            fontSize: "0.8rem",
            color: "#fff",
            backgroundColor: "#129549",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            height: "2rem",
          },
          status: {
            marginTop: "0.5rem",
            fontSize: "0.8rem",
          },
        }
      : {};

    // Merge custom styles with default styles
    const mergedStyles = {
      form: { ...defaultStyles.form, ...customStyles.form },
      input: { ...defaultStyles.input, ...customStyles.input },
      button: { ...defaultStyles.button, ...customStyles.button },
      status: { ...defaultStyles.status, ...customStyles.status },
    };

    // Render the HTML structure
    container.innerHTML = `
      <form id="paymentForm">
        <input type="email" placeholder="Email" id="customer_email" name="customer_email" required />
        <input type="password" placeholder="Password" id="password" name="password" required />
        <input
          type="text" 
          placeholder="Amount" 
          id="amount" 
          name="amount" 
          required 
          value="${defaultValues.amount || ""}" 
        />
        <textarea 
          placeholder="Description (optional)" 
          id="description" 
          name="description"
        >${defaultValues.description || ""}</textarea>
        <button id="mzunipay-submit" type="submit">${buttonText}</button>
      </form>
      <span id="paymentStatus"></span>
    `;

    // Apply styles
    if (styled) {
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

      const styleTag = document.createElement("style");
      document.head.appendChild(styleTag);
      styleTag.innerHTML = `
      @keyframes spinner-c7wet2 {
        100% {
          transform: rotate(1turn);
        }
      }   
    `;
    }

    document.getElementById("amount")?.addEventListener("input", function (e) {
      const target = e.target as HTMLInputElement | null; // Explicit type assertion
      if (target) {
        let value = target.value;

        // Remove all invalid characters
        value = value.replace(/[^0-9.]/g, "");

        // Ensure only one decimal point is allowed
        const parts = value.split(".");
        if (parts.length > 2) {
          value = `${parts[0]}.${parts.slice(1).join("")}`;
        }

        target.value = value;
      }
    });

    // Form submission logic
    const form = document.getElementById("paymentForm") as HTMLElement;
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

      const loader = styled
        ? `
     <div style= "width: 15px;
        height: 15px;
        border-radius: 50%;
        background: radial-gradient(farthest-side, #e8f2ec 94%, #0000) top/3.8px 3.8px
            no-repeat,
          conic-gradient(#0000 30%, #e8f2ec);
        mask: radial-gradient(farthest-side, #0000 calc(100% - 3.8px), #000 0);
        -webkit-mask: radial-gradient(
          farthest-side,
          #0000 calc(100% - 3.8px),
          #000 0
        );
        animation: spinner-c7wet2 1s infinite linear;
        class="spinner"></div>
     `
        : "Processing...";

      const statusDiv = document.getElementById("paymentStatus") as HTMLElement;
      const button = form.querySelector("button") as HTMLElement;
      button.innerHTML = loader;

      try {
        statusDiv.innerHTML = "";
        button.innerHTML = loader;
        const response = await this.processPayment({
          customer_email,
          password,
          amount,
          description,
        });

        statusDiv.innerHTML = `<p style="background-color: rgba(142, 225, 173, 0.15); border: 1px solid rgba(142, 225, 173, 0.5); color: #129549; padding: 0.25rem; padding-left: 0.5rem; padding-right: 0.5rem; font-size: 0.6rem; font-weight: 600; border-radius: 0.5rem; text-align: center;">${response.message}</p>`;
        onSuccess(response);
        button.innerHTML = buttonText;
      } catch (error: any) {
        console.error(error);
        statusDiv.innerHTML = `<p style="background-color: rgba(255, 0, 0, 0.15); border: 1px solid rgba(255, 0, 0, 0.25); color: #c11209; padding: 0.25rem; padding-left: 0.5rem; padding-right: 0.5rem; font-size: 0.6rem; font-weight: 600; border-radius: 0.5rem; text-align: center;">${error.message}</p>`;
        onError(error);
        button.innerHTML = buttonText;
      }
    });
  }
}

export default MzuniPay;
