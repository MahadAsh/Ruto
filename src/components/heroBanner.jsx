export default function HeroBanner() {
  return (
    <div className="@container">
      <div
        className="flex min-h-[480px] flex-col gap-6 items-center justify-center p-4 shadow-xl rounded-xl @[480px]:gap-8 @[480px]:rounded-xl @[480px]: bg-cover "
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("/ruto-hero-img3.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-white text-4xl font-black @[480px]:text-5xl">
            Discover the best stops between two locations
          </h1>
          <h2 className="text-white text-sm @[480px]:text-base">
            Plan your perfect road trip with Ruto. Find interesting places along
            your route.
          </h2>
        </div>
        <div className="flex-wrap gap-3 flex justify-center">
          <button className="bg-primary border-primary border rounded-full shadow-lg hover:shadow-xl inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#571d5b94] hover:border-[#571d5b94] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 active:bg-[#571d5b94] active:border-[#571d5b94]">
            Get Started
          </button>
          <a
            href="#about"
            className="bg-primary border-primary border rounded-full shadow-lg hover:shadow-xl inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#571d5b94] hover:border-[#571d5b94] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 active:bg-[#571d5b94] active:border-[#571d5b94]"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}
