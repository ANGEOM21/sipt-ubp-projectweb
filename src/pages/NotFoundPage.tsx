import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiHome, FiArrowLeft, FiSearch, FiMeh } from "react-icons/fi";

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}


const NotFoundPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);

  // Efek parallax untuk latar belakang
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Efek partikel
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 5 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 5,
    }));
    
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden relative">
      {/* Efek Partikel */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white opacity-20 animate-float"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Efek Parallax */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundPosition: `${50 + mousePosition.x * 0.01}% ${50 + mousePosition.y * 0.01}%`,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Glow Effect */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-16">
        {/* Animated Number 404 */}
        <div className="relative mb-8">
          <div className="text-9xl md:text-[12rem] font-bold text-white opacity-90">
            <span className="text-gradient animate-bounce inline-block">4</span>
            <span className="text-gradient animate-bounce inline-block animation-delay-200">0</span>
            <span className="text-gradient animate-bounce inline-block animation-delay-400">4</span>
          </div>
          
          {/* Icon Confused Face */}
          <div className="absolute -right-10 -top-10 md:-right-16 md:-top-16">
            <div className="text-5xl md:text-7xl bg-white p-4 rounded-full text-purple-900 animate-spin-slow">
              <FiMeh />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Oops! Halaman Tidak Ditemukan
        </h1>
        
        <p className="text-xl text-purple-100 max-w-2xl mb-10 leading-relaxed">
          Sepertinya Anda tersesat di luar angkasa digital. Jangan khawatir, 
          kami akan membantu Anda kembali ke rumah dengan selamat.
        </p>

        {/* Animated Astronaut */}
        <div className="relative mb-12 w-64 h-64">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="astronaut animate-float">
              <div className="head"></div>
              <div className="body"></div>
              <div className="arm left"></div>
              <div className="arm right"></div>
              <div className="leg left"></div>
              <div className="leg right"></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            to="/"
            className="btn btn-lg btn-primary text-white transform hover:scale-105 transition-all duration-300 group"
          >
            <FiHome className="mr-2 group-hover:animate-bounce" />
            Pulang ke Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn btn-lg btn-outline btn-white text-white transform hover:scale-105 transition-all duration-300 group"
          >
            <FiArrowLeft className="mr-2 group-hover:animate-pulse" />
            Kembali Sebelumnya
          </button>
        </div>

        {/* Search Suggestion */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl w-full">
          <h3 className="text-white text-lg font-semibold mb-3">
            Mencari sesuatu yang spesifik?
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Cari di website..."
              className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="btn btn-white px-6 py-3 rounded-xl font-semibold">
              <FiSearch className="mr-2" />
              Cari
            </button>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {[
            "Did you know? 404 errors date back to the early days of the web",
            "The average person encounters 5-10 broken links per month",
            "Space has a similar concept called 'dark matter' - stuff we know exists but can't find"
          ].map((fact, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 transform hover:scale-105 transition-all duration-300">
              <p className="text-purple-200 text-sm">{fact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS untuk animasi dan efek */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          
          .animation-delay-200 {
            animation-delay: 0.2s;
          }
          
          .animation-delay-400 {
            animation-delay: 0.4s;
          }
          
          .text-gradient {
            background: linear-gradient(45deg, #ff6b6b, #ffa8a8, #ffeaa7, #a29bfe);
            background-size: 300% 300%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient-shift 3s ease infinite;
          }
          
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          /* Astronaut Animation */
          .astronaut {
            position: relative;
            width: 120px;
            height: 180px;
          }
          
          .astronaut .head {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(255,255,255,0.5);
          }
          
          .astronaut .body {
            position: absolute;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            width: 70px;
            height: 80px;
            background: white;
            border-radius: 25px;
          }
          
          .astronaut .arm, .astronaut .leg {
            position: absolute;
            background: white;
          }
          
          .astronaut .arm.left {
            top: 60px;
            left: 15px;
            width: 20px;
            height: 50px;
            border-radius: 10px;
            transform-origin: top center;
            animation: wave 4s ease-in-out infinite;
          }
          
          .astronaut .arm.right {
            top: 60px;
            right: 15px;
            width: 20px;
            height: 50px;
            border-radius: 10px;
            transform-origin: top center;
            animation: wave 4s ease-in-out infinite reverse;
          }
          
          .astronaut .leg.left {
            top: 125px;
            left: 30px;
            width: 20px;
            height: 50px;
            border-radius: 10px;
            transform-origin: top center;
            animation: kick 5s ease-in-out infinite;
          }
          
          .astronaut .leg.right {
            top: 125px;
            right: 30px;
            width: 20px;
            height: 50px;
            border-radius: 10px;
            transform-origin: top center;
            animation: kick 5s ease-in-out infinite reverse;
          }
          
          @keyframes wave {
            0%, 100% { transform: rotate(-10deg); }
            50% { transform: rotate(20deg); }
          }
          
          @keyframes kick {
            0%, 100% { transform: rotate(5deg); }
            50% { transform: rotate(-15deg); }
          }
        `}
      </style>
    </div>
  );
};

export default NotFoundPage;