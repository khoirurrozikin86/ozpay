export default function HomePage() {
  return (
    <div className="text-center py-20 relative">
      <style>
        {`
        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(20px);
            }
            50% {
                opacity: 0.5;
                transform: translateY(10px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes backgroundCircle {
            0% {
                transform: scale(0.9);
                background-color: #A3D8FF; /* Light Blue */
            }
            50% {
                transform: scale(1.2);
                background-color: #2C3E50; /* Navy */
            }
            100% {
                transform: scale(0.9);
                background-color: #A3D8FF; /* Light Blue */
            }
        }

        .animate-fadeInUp {
            animation: fadeInUp 2s ease-out forwards;
        }

        .animate-background {
            animation: backgroundCircle 5s infinite ease-in-out;
        }

        .circle {
            position: absolute;
            border-radius: 50%;
            z-index: -1;
        }
        `}
      </style>

      {/* Background Circles */}
      <div className="circle animate-background w-48 h-48 top-10 left-1/2 transform -translate-x-1/2"></div>
      <div className="circle animate-background w-72 h-72 top-32 left-1/2 transform -translate-x-1/2"></div>

      {/* Animated Text */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800">
        <span className="inline-block animate-fadeInUp opacity-0 delay-100">A</span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-200">P</span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-300">P</span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-400"> - </span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-500">M</span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-600">O</span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-700">N</span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-800">I</span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-900">T</span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-1000">O</span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-1100">R</span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-1200">I</span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-1300">N</span>
        <span className="inline-block animate-fadeInUp opacity-0 delay-1400">G</span>
      </h1>
    </div>

  );
}
