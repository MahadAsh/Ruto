import { motion } from "framer-motion";

export default function About() {
  const skills = [
    { name: "JavaScript", color: "bg-purple-600" },
    { name: "React", color: "bg-pink-600" },
    { name: "HTML / Tailwind", color: "bg-blue-600" },
    { name: "Filmmaking", color: "bg-pink-500" },
    { name: "Photography", color: "bg-red-600" },
  ];

  const handleSkillHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.transform = "scale(1.1) rotate(2deg)";
    } else {
      e.target.style.transform = "scale(1) rotate(0deg)";
    }
  };

  return (
    <div className="bg-gray-900 text-white w-full px-6 py-16" id="about">
      {/* Top Section - Avatar + Title + Description */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.h1
          className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          About Me
        </motion.h1>

        <h2 className="text-3xl font-bold mb-2 py-3">Hi, I am Mahad</h2>
        <p className="text-xl text-purple-400 mb-4">
          Creative Developer & Digital Storyteller
        </p>
        <p className="text-gray-300 max-w-xl mx-auto">
          I love crafting digital experiences where creativity meets clean
          functionality. When I’m not deep in code, I’m probably storyboarding
          shots, filming reels, or capturing raw, cinematic moments through my
          lens.
        </p>
        <motion.h1
          className="text-3xl pt-12 font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          About Ruto
        </motion.h1>
        <p className="text-gray-300 max-w-xl mx-auto">
          Ruto is your pocket sized travel buddy built for curious explorers who
          love wandering without the chaos. It helps you find cool spots, map
          out your journey, and vibe through the city without getting lost. No
          fuss, just smooth adventures with a touch of magic.
        </p>
      </div>

      {/* Skills & Tools Section */}
      <div className="max-w-4xl mx-auto space-y-12 ">
        {/* Skills */}
        <div>
          <h3 className="text-2xl font-bold mb-4 flex items-center justify-center">
            Skills & Tools
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {skills.map((skill, index) => (
              <span
                key={index}
                className={`skill-tag ${skill.color} px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-transform duration-200`}
                onMouseEnter={(e) => handleSkillHover(e, true)}
                onMouseLeave={(e) => handleSkillHover(e, false)}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Let's Connect!</h3>
          <p className="text-purple-100 mb-4">
            Ready to create something amazing together?
          </p>
          <a
            href="https://www.linkedin.com/in/mahad-ashraf/" // <-- Replace this with your actual LinkedIn URL
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-primary border-primary border rounded-full shadow-lg hover:shadow-xl inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#571d5b94] hover:border-[#571d5b94] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 active:bg-[#571d5b94] active:border-[#571d5b94]">
              Hit me up on LinkedIn
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
