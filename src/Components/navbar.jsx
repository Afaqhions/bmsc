import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="text-2xl font-bold tracking-wide">
            <Link to="/" className="hover:text-yellow-300 transition duration-300">
              CampaignSoft
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <Link to="/" className="hover:text-yellow-300 transition duration-200">
              Home
            </Link>
            <Link to="/login" className="hover:text-yellow-300 transition duration-200">
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden flex flex-col space-y-3 py-4 animate-slideDown text-sm font-medium">
            <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-yellow-300 transition">
              Home
            </Link>
            <Link to="/login" onClick={() => setIsOpen(false)} className="hover:text-yellow-300 transition">
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
