/* eslint-disable no-console */
import { createFakeToken } from "http-server/tests/createFakeToken";
import app, { baseUrl } from "init.testSetup";
import Payment from "models/Payment";
import {
  PaymentProviderEnum,
  PaymentStatus,
} from "payments-types/models/Payment";
import {
  ACCESS_RESSOURCES,
  PRIVILEGE,
  SortDirection,
  StatusCodes,
} from "shared-types";
import supertest from "supertest";

const writePaymentToken = createFakeToken([
  { ressource: ACCESS_RESSOURCES.PAYMENT, privileges: PRIVILEGE.WRITE },
]);
const deletePaymentToken = createFakeToken([
  { ressource: ACCESS_RESSOURCES.PAYMENT, privileges: PRIVILEGE.DELETE },
]);
const readPaymentToken = createFakeToken([
  { ressource: ACCESS_RESSOURCES.PAYMENT, privileges: PRIVILEGE.READ },
]);
const readPublicToken = createFakeToken([
  { ressource: ACCESS_RESSOURCES.PUBLIC, privileges: PRIVILEGE.READ },
]);

const BODY = {
  authId: "generated_string",
  orderId: "generated_string",
  amount: 420,
  currency: "generated_string",
  status: PaymentStatus.INITIATED,
  provider: {
    name: PaymentProviderEnum.NONE,
    reference: "generated_string",
  },
};

describe("POST /payment/", () => {
  describe("validation tests", () => {
    it("should respond successfully (1)", async () => {
      const response = await supertest(app)
        .post(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${writePaymentToken}`)
        .send(BODY);

      expect(response.status).toEqual(StatusCodes.Created);
    });

    it("should throw a validation error (2)", async () => {
      const body = {
        authId: 9090909,
        orderId: 9090909,
        amount: "420",
        currency: 9090909,
        status: 9090909,
        provider: { name: 9090909, reference: 9090909, meta: 9090909 },
      };
      const response = await supertest(app)
        .post(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${writePaymentToken}`)
        .send(body);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });
  });
});

describe("PUT /payment/:id", () => {
  describe("validation tests", () => {
    it("should respond successfully (1)", async () => {
      await supertest(app)
        .post(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${writePaymentToken}`)
        .send(BODY);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const payment = (await Payment.findOne({}))!;

      const response = await supertest(app)
        .put(`${baseUrl}/payment/${payment._id}`)
        .set("Authorization", `Bearer ${writePaymentToken}`)
        .send(BODY);

      expect(response.status).toEqual(StatusCodes.OK);
    });

    it("should throw a validation error (2)", async () => {
      const body = {
        authId: 9090909,
        orderId: 9090909,
        amount: "420",
        currency: 9090909,
        status: 9090909,
        provider: { name: 9090909, reference: 9090909, meta: 9090909 },
      };
      const response = await supertest(app)
        .put(`${baseUrl}/payment/generated_string`)
        .set("Authorization", `Bearer ${writePaymentToken}`)
        .send(body);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });

    it("should throw a validation error (3)", async () => {
      const response = await supertest(app)
        .put(`${baseUrl}/payment/9090909`)
        .set("Authorization", `Bearer ${writePaymentToken}`)
        .send(BODY);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });

    it("should throw a validation error (4)", async () => {
      const body = {
        authId: 9090909,
        orderId: 9090909,
        amount: "420",
        currency: 9090909,
        status: 9090909,
        provider: { name: 9090909, reference: 9090909, meta: 9090909 },
      };
      const response = await supertest(app)
        .put(`${baseUrl}/payment/9090909`)
        .set("Authorization", `Bearer ${writePaymentToken}`)
        .send(body);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });
  });
});

describe("DELETE /payment/:id", () => {
  describe("validation tests", () => {
    it("should respond successfully (1)", async () => {
      await supertest(app)
        .post(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${writePaymentToken}`)
        .send(BODY);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const payment = (await Payment.findOne({}))!;

      const response = await supertest(app)
        .delete(`${baseUrl}/payment/${payment._id}`)
        .set("Authorization", `Bearer ${deletePaymentToken}`);

      expect(response.status).toEqual(StatusCodes.OK);
    });

    it("should throw a validation error (2)", async () => {
      const response = await supertest(app)
        .delete(`${baseUrl}/payment/9090909`)
        .set("Authorization", `Bearer ${deletePaymentToken}`);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });
  });
});

describe("GET /payment/:id", () => {
  describe("validation tests", () => {
    it("should respond successfully (1)", async () => {
      await supertest(app)
        .post(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${writePaymentToken}`)
        .send(BODY);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const payment = (await Payment.findOne({}))!;

      const response = await supertest(app)
        .get(`${baseUrl}/payment/${payment._id}`)
        .set("Authorization", `Bearer ${readPaymentToken}`);

      expect(response.status).toEqual(StatusCodes.OK);
    });

    it("should throw a validation error (2)", async () => {
      const response = await supertest(app)
        .get(`${baseUrl}/payment/9090909`)
        .set("Authorization", `Bearer ${readPaymentToken}`);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });
  });
});

describe("GET /payment/", () => {
  describe("validation tests", () => {
    it("should respond successfully (1)", async () => {
      const query = {
        limit: "9090909",
        "sort-direction": SortDirection.ASC,
        "sort-field": "generated_string",
        keyword: "generated_string",
      };
      const response = await supertest(app)
        .get(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${readPaymentToken}`)
        .query(query);

      expect(response.status).toEqual(StatusCodes.OK);
    });

    it("should throw a validation error (2)", async () => {
      const query = {
        limit: 9090909,
        "sort-direction": 9090909,
        "sort-field": 9090909,
        keyword: 9090909,
      };
      const response = await supertest(app)
        .get(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${readPaymentToken}`)
        .query(query);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });

    it("should respond successfully (3)", async () => {
      const query = {
        page: "9090909",
        "sort-direction": SortDirection.ASC,
        "sort-field": "generated_string",
        keyword: "generated_string",
      };
      const response = await supertest(app)
        .get(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${readPaymentToken}`)
        .query(query);

      expect(response.status).toEqual(StatusCodes.OK);
    });

    it("should throw a validation error (4)", async () => {
      const query = {
        page: 9090909,
        "sort-direction": 9090909,
        "sort-field": 9090909,
        keyword: 9090909,
      };
      const response = await supertest(app)
        .get(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${readPaymentToken}`)
        .query(query);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });

    it("should respond successfully (5)", async () => {
      const query = {
        page: "9090909",
        limit: "9090909",
        "sort-field": "generated_string",
        keyword: "generated_string",
      };
      const response = await supertest(app)
        .get(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${readPaymentToken}`)
        .query(query);

      expect(response.status).toEqual(StatusCodes.OK);
    });

    it("should throw a validation error (6)", async () => {
      const query = {
        page: "generated_string",
        limit: "generated_string",
        "sort-field": 9090909,
        keyword: 9090909,
      };
      const response = await supertest(app)
        .get(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${readPaymentToken}`)
        .query(query);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });

    it("should respond successfully (7)", async () => {
      const query = {
        page: "9090909",
        limit: "9090909",
        "sort-direction": SortDirection.ASC,
        keyword: "generated_string",
      };
      const response = await supertest(app)
        .get(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${readPaymentToken}`)
        .query(query);

      expect(response.status).toEqual(StatusCodes.OK);
    });

    it("should throw a validation error (8)", async () => {
      const query = {
        page: 9090909,
        limit: 9090909,
        "sort-direction": 9090909,
        keyword: 9090909,
      };
      const response = await supertest(app)
        .get(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${readPaymentToken}`)
        .query(query);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });

    it("should respond successfully (9)", async () => {
      const query = {
        page: "9090909",
        limit: "9090909",
        "sort-direction": SortDirection.ASC,
        "sort-field": "generated_string",
      };
      const response = await supertest(app)
        .get(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${readPaymentToken}`)
        .query(query);

      expect(response.status).toEqual(StatusCodes.OK);
    });

    it("should throw a validation error (10)", async () => {
      const query = {
        page: 9090909,
        limit: 9090909,
        "sort-direction": 9090909,
        "sort-field": 9090909,
      };
      const response = await supertest(app)
        .get(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${readPaymentToken}`)
        .query(query);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });

    it("should respond successfully (11)", async () => {
      const query = {
        page: "9090909",
        limit: "9090909",
        "sort-direction": SortDirection.ASC,
        "sort-field": "generated_string",
        keyword: "generated_string",
      };
      const response = await supertest(app)
        .get(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${readPaymentToken}`)
        .query(query);

      expect(response.status).toEqual(StatusCodes.OK);
    });

    it("should throw a validation error (12)", async () => {
      const query = {
        page: 9090909,
        limit: 9090909,
        "sort-direction": 9090909,
        "sort-field": 9090909,
        keyword: 9090909,
      };
      const response = await supertest(app)
        .get(`${baseUrl}/payment/`)
        .set("Authorization", `Bearer ${readPaymentToken}`)
        .query(query);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });
  });
});

describe("POST /payment/create-checkout-session", () => {
  describe("validation tests", () => {
    // eslint-disable-next-line jest/no-commented-out-tests
    // it("should respond successfully (1)", async () => {
    //   const body = {
    //     orderId: "generated_string",
    //     lineItems: [
    //       { productName: "generated_string", price: 420, quantity: 420 },
    //     ],
    //   };
    //   const response = await supertest(app)
    //     .post(`${baseUrl}/payment/create-checkout-session`)
    //     .set("Authorization", `Bearer ${readPublicToken}`)
    //     .send(body);

    //   console.log(response.error);

    //   expect(response.status).toEqual(StatusCodes.Created);
    // });

    it("should throw a validation error (2)", async () => {
      const body = {
        orderId: 123,
        lineItems: [
          {
            productName: 123,
            price: "generated_string",
            quantity: "generated_string",
          },
        ],
      };
      const response = await supertest(app)
        .post(`${baseUrl}/payment/create-checkout-session`)
        .set("Authorization", `Bearer ${readPublicToken}`)
        .send(body);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });
  });
});

describe("POST /payment/create-payment-intent", () => {
  describe("validation tests", () => {
    it("should respond successfully (1)", async () => {
      const body = { orderAmount: 420 };
      const response = await supertest(app)
        .post(`${baseUrl}/payment/create-payment-intent`)
        .send(body);

      expect(response.status).toEqual(StatusCodes.Created);
    });

    it("should throw a validation error (2)", async () => {
      const body = { orderAmount: "420" };
      const response = await supertest(app)
        .post(`${baseUrl}/payment/create-payment-intent`)
        .send(body);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });
  });
});

describe("POST /payment/cancel-payment-intent", () => {
  describe("validation tests", () => {
    it("should respond successfully (1)", async () => {
      const body = { paymentId: "generated_string" };
      const response = await supertest(app)
        .post(`${baseUrl}/payment/cancel-payment-intent`)
        .send(body);

      expect(response.status).toEqual(StatusCodes.Created);
    });

    it("should throw a validation error (2)", async () => {
      const body = { paymentId: 9090909 };
      const response = await supertest(app)
        .post(`${baseUrl}/payment/cancel-payment-intent`)
        .send(body);

      expect(response.status).toEqual(StatusCodes["Bad Request"]);
    });
  });
});
