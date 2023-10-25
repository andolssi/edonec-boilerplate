import { HealthRouteTypes } from "payments-types/routes/health";
import { PaymentRouteTypes } from "payments-types/routes/payment";
import ServerSDK from "server-sdk/sdk";
import ServerSDKTypes from "server-sdk/types";

const baseUrl = "/v1/payments";

export default class PaymentsSDK extends ServerSDK {
  public async getMicroservicesStatus() {
    const { data } = await this.api.get<
      HealthRouteTypes["/health/"]["GET"]["response"]
    >(`${baseUrl}/health`);

    return data;
  }

  public async addPayment({
    body,
  }: {
    body: PaymentRouteTypes["/payment/"]["POST"]["body"];
    query?: never;
    params?: never;
  }) {
    const { data } = await this.api.post<
      PaymentRouteTypes["/payment/"]["POST"]["response"]
    >(`${baseUrl}/payment/`, body);

    return data;
  }

  public async updatePayment({
    body,
    params,
  }: {
    body: PaymentRouteTypes["/payment/:id"]["PUT"]["body"];
    query?: never;
    params: PaymentRouteTypes["/payment/:id"]["PUT"]["params"];
  }) {
    const { data } = await this.api.put<
      PaymentRouteTypes["/payment/:id"]["PUT"]["response"]
    >(`${baseUrl}/payment/${params.id}`, body);

    return data;
  }

  public async deletePayment({
    params,
  }: {
    body?: never;
    query?: never;
    params: PaymentRouteTypes["/payment/:id"]["DELETE"]["params"];
  }) {
    const { data } = await this.api.delete<
      PaymentRouteTypes["/payment/:id"]["DELETE"]["response"]
    >(`${baseUrl}/payment/${params.id}`);

    return data;
  }

  public async getPayment({
    params,
  }: {
    body?: never;
    query?: never;
    params: PaymentRouteTypes["/payment/:id"]["GET"]["params"];
  }) {
    const { data } = await this.api.get<
      PaymentRouteTypes["/payment/:id"]["GET"]["response"]
    >(`${baseUrl}/payment/${params.id}`);

    return data;
  }

  public async getPayments({
    query,
  }: {
    body?: never;
    query: PaymentRouteTypes["/payment/"]["GET"]["query"];
    params?: never;
  }) {
    const { data } = await this.api.get<
      PaymentRouteTypes["/payment/"]["GET"]["response"]
    >(`${baseUrl}/payment/`, { params: query });

    return data;
  }

  public async addCreateCheckoutSession({
    body,
  }: {
    body: PaymentRouteTypes["/payment/create-checkout-session"]["POST"]["body"];
    query?: never;
    params?: never;
  }) {
    const { data } = await this.api.post<
      PaymentRouteTypes["/payment/create-checkout-session"]["POST"]["response"]
    >(`${baseUrl}/payment/create-checkout-session`, body);

    return data;
  }

  public async addWebhook({
    body,
  }: {
    body: PaymentRouteTypes["/payment/webhook"]["POST"]["body"];
    query?: never;
    params?: never;
  }) {
    const { data } = await this.api.post<
      PaymentRouteTypes["/payment/webhook"]["POST"]["response"]
    >(`${baseUrl}/payment/webhook`, body);

    return data;
  }
}

export type PaymentsSDKTypes = ServerSDKTypes<PaymentsSDK>;
