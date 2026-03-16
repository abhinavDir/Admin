import { FaBars, FaBell } from "react-icons/fa";

const Topbar = ({ toggleMenu }) => {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0">
      <div className="flex items-center gap-4">
        <button className="md:hidden" onClick={toggleMenu}>
          <FaBars size={20} />
        </button>
        <h1 className="text-xl font-bold">Canteen Management System</h1>
      </div>

      <div className="relative">
        <FaBell size={20} />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
          5
        </span>
      </div>
    </header>
  );
};

export default Topbar;
