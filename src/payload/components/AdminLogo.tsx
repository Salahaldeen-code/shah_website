const logoSrc = "/images/app/logo-psr.png";
const companyName = "Persatuan Sukan & Rekreasi";
const companyTagline = "Bandar Putra Permai";

export function AdminLogo() {
  return (
    <div className="psr-admin-brand psr-admin-brand--login">
      <img
        src={logoSrc}
        alt={`${companyName} logo`}
        className="psr-admin-brand__logo"
        width={220}
        height={88}
      />
      <p className="psr-admin-brand__name">{companyName}</p>
      <p className="psr-admin-brand__tagline">{companyTagline}</p>
    </div>
  );
}
