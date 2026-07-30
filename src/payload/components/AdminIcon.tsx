const logoSrc = "/images/app/logo-psr.png";
const companyName = "Persatuan Sukan & Rekreasi";

export function AdminIcon() {
  return (
    <div className="psr-admin-brand psr-admin-brand--nav">
      <img
        src={logoSrc}
        alt={`${companyName} logo`}
        className="psr-admin-brand__icon"
        width={132}
        height={52}
      />
      <span className="psr-admin-brand__nav-name">{companyName}</span>
    </div>
  );
}
