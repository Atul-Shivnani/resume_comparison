"use client"

const Intro = () => {
  const handleGetStarted = () => {
    const section = document.getElementById("choose-template");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full h-full snap-center flex flex-col justify-center items-center text-neutral-100 gap-5 p-4 md:p-8">
      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-center">
        Perfect Your Resume with Resume Matcher
      </h1>
      <p className="md:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-center max-w-xl">
        Get real-time feedback to refine your resume and make a lasting impression.
      </p>
      <button 
        onClick={handleGetStarted} 
        className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-md md:text-lg p-3 font-semibold hover:scale-105 duration-200"
      >
        Get Started
      </button>
    </div>
  );
};

export default Intro;
