import { statusToHex, statuses } from "@/web/utils/api/mojang";

export default function Statuses() {
  const essential = statuses.filter((status) => status.essential);
  const nonessential = statuses.filter((status) => !status.essential);

  return (
    <div>
      <span>MOJANGステータス</span>
      <span id="mojang_status_icon">&#8226;</span>
      <div>
        <div>サービス</div>
        <div>
          {essential.map((service) => {
            return (
              <div key={service.service}>
                <span style={{ color: statusToHex(service.status) }}>&#8226;</span>
                <span>{service.name}</span>
              </div>
            );
          })}
        </div>
        <div>
          <div></div>
          <div>Non Essential</div>
          <div></div>
        </div>
        <div>
          {nonessential.map((service) => {
            return (
              <div key={service.service}>
                <span style={{ color: statusToHex(service.status) }}>&#8226;</span>
                <span>{service.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
