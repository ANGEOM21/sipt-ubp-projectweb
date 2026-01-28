import { useAuthStore } from "@/store/useAuthStore";
import { Link, useLocation } from "react-router-dom";
import { 
    FiHome, FiGrid, FiUser, FiLogOut, 
    FiBook, FiLayers,
} from "react-icons/fi";

const Topbar = () => {
    const { authUser, logout } = useAuthStore();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;
    const activeClass = "bg-blue-50 text-blue-600 font-semibold";

    const appLinks = [
        { name: "Nilai Mahasiswa", path: "/nilai-mhs", icon: FiBook },
        { name: "Kurikulum", path: "/mahasiswa/kurikulum", icon: FiLayers },
		{ name: "Aktivitas", path: "/aktivitas-perkuliahan", icon: FiBook },
    ];

    return (
        <div className="navbar bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-100 px-4 sm:px-8 sticky top-0 z-50 h-16">
            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost p-0 hover:bg-transparent transition-transform hover:scale-105">
                    <img
                        src="/logo.png"
                        alt="logo"
                        draggable={false}
                        className="w-28 sm:w-36 h-auto"
                    />
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-2 font-medium text-slate-600">
                    <li>
                        <Link
                            to="/"
                            className={`flex items-center gap-2 rounded-lg ${isActive("/") ? activeClass : "hover:bg-slate-50 hover:text-blue-600"}`}
                        >
                            <FiHome className="text-lg" />
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    <li>
                        <details>
                            <summary className={`rounded-lg hover:bg-slate-50 hover:text-blue-600 ${(isActive('/nilai-mhs') || isActive('/mahasiswa-kurikulum')) ? 'text-blue-600' : ''}`}>
                                <FiGrid className="text-lg" />
                                <span>Akademik</span>
                            </summary>
                            <ul className="p-2 bg-white shadow-xl border border-slate-100 rounded-xl min-w-[200px] mt-2">
                                {appLinks.map((link) => (
                                    <li key={link.path}>
                                        <Link 
                                            to={link.path}
                                            className={`mb-1 ${isActive(link.path) ? activeClass : "hover:bg-slate-50"}`}
                                        >
                                            <link.icon /> {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    </li>
                </ul>
            </div>

            <div className="navbar-end gap-3">
                <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">
                        {authUser?.nama || "Mahasiswa"}
                    </span>
                </div>

                <div className="flex-none">
                    {authUser ? (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar ring-2 ring-slate-100 hover:ring-blue-200 transition-all">
                                <div className="w-10 rounded-full border border-slate-100 p-[2px]">
                                    <div className="bg-white w-full h-full rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {authUser?.nama?.slice(0, 2)?.toUpperCase() || <FiUser />}
                                    </div>
                                </div>
                            </div>

                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-2xl bg-white rounded-xl w-64 border border-slate-100">
                                
                                <li className="menu-title px-4 py-3 border-b border-slate-100 mb-2 lg:hidden">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-800 font-bold text-base">{authUser?.nama}</span>
                                    </div>
                                </li>

                                <li className="block lg:hidden">
                                    <Link to="/" className={`py-3 px-4 rounded-lg mb-1 ${isActive("/") ? activeClass : "text-slate-600"}`}>
                                        <FiHome className="text-lg" />
                                        Dashboard
                                    </Link>
                                </li>

                                <li className="block lg:hidden">
                                    <details open={isActive('/nilai-mhs') || isActive('/mahasiswa-kurikulum')}>
                                        <summary className="py-3 px-4 rounded-lg mb-1 text-slate-600 group">
                                            <div className="flex items-center gap-2">
                                                <FiGrid className="text-lg group-open:text-blue-600" />
                                                <span className="group-open:font-semibold group-open:text-blue-600">Apps</span>
                                            </div>
                                        </summary>
                                        <ul className="before:bg-slate-200"> 
                                            {appLinks.map((link) => (
                                                <li key={link.path}>
                                                    <Link 
                                                        to={link.path}
                                                        className={`py-2 pl-4 rounded-lg my-0.5 ${isActive(link.path) ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-500 hover:text-slate-700"}`}
                                                    >
														<link.icon className="text-sm" />
                                                        {link.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                </li>

                                <li>
                                    <Link to="/profile" className={`py-3 px-4 rounded-lg mb-1 ${isActive("/profile") ? activeClass : "text-slate-600"}`}>
                                        <FiUser className="text-lg" />
                                        Profile
                                    </Link>
                                </li>

                                <div className="h-px bg-slate-100 my-2"></div>

                                <li>
                                    <button
                                        onClick={() => logout()}
                                        className="py-3 px-4 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 font-medium transition-colors"
                                    >
                                        <FiLogOut className="text-lg" />
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary bg-blue-600 border-blue-600 hover:bg-blue-700 text-white px-6 rounded-full font-bold shadow-md shadow-blue-200">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Topbar;