/** Illustrative economics – NOT actual carrier prices or accounting figures. */
export function studioEconomics(input: { projects: number; subscribers: number; hours: number; setup: number; retainer: number }) {
  const revenue = input.projects * input.setup + input.subscribers * input.retainer;
  const direct = input.projects * 1500 + input.subscribers * 150;
  const time = (input.projects * input.hours + input.subscribers * 0.5) * 350;
  return { revenue, providerAndTime: direct + time, net: revenue - direct - time - 2000 };
}
export function linkEconomics(input: { users: number; price: number; numberCost: number; minutes: number; sms: number }) {
  const revenue = input.users * input.price;
  const provider = input.users * (input.numberCost + input.minutes * 0.18 + input.sms * 0.55);
  const time = input.users * 0.1 * 350;
  return { revenue, providerAndTime: provider + time, net: revenue - provider - time - 500 };
}
export function pbxEconomics(input: { companies: number; seats: number; base: number; seatPrice: number; minutes: number }) {
  const revenue = input.companies * (input.base + input.seats * input.seatPrice);
  const provider = input.companies * input.seats * (25 + input.minutes * 0.18);
  const time = input.companies * 1.5 * 350;
  return { revenue, providerAndTime: provider + time, net: revenue - provider - time - 1500 };
}
