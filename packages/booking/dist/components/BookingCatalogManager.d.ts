import type { BookingConfiguration, BookingPlan, BookingService } from "../types.js";
export interface BookingCatalogManagerProps {
    services: BookingService[];
    plans: BookingPlan[];
    onServicesChange: (services: BookingService[]) => void;
    onPlansChange: (plans: BookingPlan[]) => void;
    configuration?: BookingConfiguration;
    className?: string;
}
export declare function BookingCatalogManager({ services, plans, onServicesChange, onPlansChange, configuration, className }: BookingCatalogManagerProps): import("react").JSX.Element;
//# sourceMappingURL=BookingCatalogManager.d.ts.map