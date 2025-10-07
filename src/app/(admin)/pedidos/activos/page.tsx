import ActiveOrders from "@/components/orders/ActiveOrders";
import OrderCard from "@/components/orders/OrderCard";          // <-- tarjeta

export default function Page() {
  return (
    <div>
      
     
      <div className="space-y-6">
        <OrderCard title="Activos">
          <ActiveOrders />
        </OrderCard>
      </div>
    </div>
  );
}
