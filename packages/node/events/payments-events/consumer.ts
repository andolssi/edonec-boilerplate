import Consumer from "consumer";
import { PaymentsEvents, PaymentsEventsPayload } from "payments-types/events";

const events = Object.values(PaymentsEvents);

type OnMessageReceivedFunc<EventName extends PaymentsEvents> = (
  message: PaymentsEventsPayload[EventName],
  key?: EventName
) => void;

type TSubscriber<EventName extends PaymentsEvents> = (
  onMessageReceived: OnMessageReceivedFunc<EventName>
) => Promise<void>;

type Subscribers = {
  [eventName in PaymentsEvents]: TSubscriber<eventName>;
};
class PaymentsConsumer {
  private consumer: Consumer<typeof PaymentsEvents>;

  subscribe: Subscribers;

  subscribeToAll;

  constructor() {
    this.consumer = new Consumer(PaymentsEvents, "payments");
    const sub: Subscribers | Record<string, unknown> = {};

    for (let index = 0; index < events.length; index++) {
      const eventName = events[index];

      sub[eventName] = async (
        onMessageReceived: OnMessageReceivedFunc<typeof eventName>
      ) => {
        await this.consumer.subscribe(eventName, onMessageReceived);
      };
    }
    this.subscribe = sub as Subscribers;
    this.subscribeToAll = (
      onMessageReceived: OnMessageReceivedFunc<PaymentsEvents>
    ) => {
      this.consumer.subscribeToAll(onMessageReceived);
    };
  }
}

export default PaymentsConsumer;
