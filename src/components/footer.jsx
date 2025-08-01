export default function Footer() {
  return (
    <footer className="flex justify-center bg-slate-200">
      <div className="flex max-w-[960px] flex-1 flex-col">
        <div className="flex flex-col gap-6 px-5 py-10 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a className="text-[#4e7a97] text-base" href="#about">
              About Ruto
            </a>
            <a className="text-[#4e7a97] text-base" href="#contact">
              Contact Us
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="https://www.instagram.com/mahaddvx/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-slate-600 border-primary border rounded-full shadow-lg hover:shadow-xl inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#2b2b2b94] hover:border-[#571d5b94] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 active:bg-[#571d5b94] active:border-[#571d5b94]">
                Instagram
              </button>
            </a>
            <a
              href="https://github.com/MahadAsh"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-slate-600 border-primary border rounded-full shadow-lg hover:shadow-xl inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#2b2b2b94] hover:border-[#571d5b94] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 active:bg-[#571d5b94] active:border-[#571d5b94]">
                Github
              </button>
            </a>
            <a
              href="https://www.linkedin.com/in/mahad-ashraf/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-slate-600 border-primary border rounded-full shadow-lg hover:shadow-xl inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#2b2b2b94] hover:border-[#571d5b94] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 active:bg-[#571d5b94] active:border-[#571d5b94]">
                Linkedin
              </button>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
