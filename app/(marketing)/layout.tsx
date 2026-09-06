import { BookingFloatingAction } from "@/components/booking/booking-floating-action";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className="studio-site">{children}<BookingFloatingAction /></div>;
}
