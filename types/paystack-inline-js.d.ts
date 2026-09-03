declare module "@paystack/inline-js" {
  export interface PaystackTransaction {
    id: number;
    reference: string;
    message: string;
  }

  export interface PaystackError {
    message: string;
  }

  export interface PaystackLoadResponse {
    id: number;
    customer: unknown;
    accessCode: string;
  }

  export interface PaystackCallbacks {
    onSuccess?: (transaction: PaystackTransaction) => void;
    onCancel?: () => void;
    onError?: (error: PaystackError) => void;
    onLoad?: (response: PaystackLoadResponse) => void;
  }

  export interface PaystackTransactionOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    reference?: string;
    metadata?: Record<string, unknown>;
    channels?: string[];
    onSuccess?: (transaction: PaystackTransaction) => void;
    onCancel?: () => void;
    onError?: (error: PaystackError) => void;
    onLoad?: (response: PaystackLoadResponse) => void;
  }

  export default class PaystackPop {
    constructor();

    newTransaction(
      options: PaystackTransactionOptions
    ): unknown;

    resumeTransaction(
      accessCode: string,
      callbacks?: PaystackCallbacks
    ): unknown;

    cancelTransaction(
      transaction: unknown
    ): void;

    isLoaded(): boolean;
  }
}