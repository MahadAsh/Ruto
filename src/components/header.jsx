export default function Header() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7eef3] px-10 py-3 shadow-md">
      <div className="flex items-center gap-4 text-[#0e161b]">
        <img
          src="/updated_logo.png"
          alt="Ruto Logo"
          style={{
            width: "119px",
            height: "33px",
          }}
        />
      </div>

      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <a className="text-md font-medium leading-normal" href="#about">
            About
          </a>
          <a className="text-md font-medium leading-normal" href="#contact">
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}
