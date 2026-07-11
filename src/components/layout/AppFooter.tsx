// App footer — links are placeholders until the pages/URLs exist
export const AppFooter = () => {
  const footerLinks = [
    {
      label: "Privacy Policy",
      url: "",
    },
    {
      label: "Terms of Service",
      url: "",
    },
    {
      label: "Contact Us",
      url: "",
    },
    {
      label: "Rate Us",
      url: "",
    },
  ];

  return (
    <section className="w-full p-12 flex items-center justify-center">
      <ul className="flex flex-row items-center gap-x-4">
        {footerLinks.map((link) => (
          <li key={link.label} className="text-sm text-text-muted group">
            <a className="group-hover:underline" href={link.url}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};
