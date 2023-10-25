import { PaymentsEvents, PaymentsEventsPayload } from "payments-types/events";
import Producer from "producer";

const events = Object.values(PaymentsEvents);

type TSender<EventName extends PaymentsEvents> = (
  payload: PaymentsEventsPayload[EventName]
) => Promise<void>;
type EventSenders = {
  [eventName in PaymentsEvents]: TSender<eventName>;
};
class PaymentsEProducer {
  private producer: Producer<typeof PaymentsEvents>;

  emit: EventSenders;

  constructor() {
    this.producer = new Producer(PaymentsEvents);

    const emiter: EventSenders | Record<string, unknown> = {};

    for (let index = 0; index < events.length; index++) {
      const eventName = events[index];

      emiter[eventName] = async (
        payload: PaymentsEventsPayload[typeof eventName]
      ) => {
        await this.producer.send(payload, eventName);
      };
    }
    this.emit = emiter as EventSenders;
  }
}

export default PaymentsEProducer;
