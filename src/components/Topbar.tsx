import { useAuthStore } from "@/store/useAuthStore"
import { BiBook, BiHome, BiUser } from "react-icons/bi"
import { Link, useLocation } from "react-router-dom"

const Topbar = () => {
	const { authUser, logout } = useAuthStore()
	const location = useLocation()

	return (
		<div className="navbar bg-base-100 shadow-lg px-4 sm:px-8 sticky top-0 z-50">
			{/* Logo/Brand */}
			<div className="navbar-start">
				<Link to="/" className="btn btn-ghost text-xl p-0 hover:bg-transparent">
					<img
						src="/logo.png"
						alt="logo"
						draggable={false}
						className="w-32 sm:w-40 h-auto"
					/>
				</Link>
			</div>

			{/* Desktop Navigation */}
			<div className="navbar-center hidden lg:flex">
				<ul className="menu menu-horizontal px-1 font-medium gap-1">
					<li>
						<Link
							to="/"
							className={`flex items-center gap-2 ${location.pathname === "/" ? "bg-primary/50 font-semibold" : "hover:bg-base-200"}`}
						>
							<BiHome className="text-lg" />
							<span>Home</span>
						</Link>
					</li>
					<li>
						<Link
							to="/nilai-mhs"
							className={`flex items-center gap-2 ${location.pathname === "/nilai-mhs" ? "bg-primary/50 font-semibold" : "hover:bg-base-200"}`}
						>
							<BiBook className="text-lg" />
							<span>Nilai</span>
						</Link>
					</li>
				</ul>
			</div>

			{/* Auth Section */}
			<div className="navbar-end gap-2">
				<span className="hidden md:block text-sm font-semibold truncate max-w-[120px] lg:max-w-[160px]">
					{authUser?.nama}
				</span>

				<div className="flex-none">
					{authUser ? (
						<div className="dropdown dropdown-end">
							<div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
								<div className="w-10 rounded-full">
									<span className="text-xl w-full h-full flex items-center justify-center bg-primary">
										{authUser?.nama?.slice(0, 2)?.toUpperCase() || "ST"}
									</span>
								</div>
							</div>
							<ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-black/50">
								{/* Mobile Navigation Items */}
								<li className="block lg:hidden">
									<Link
										to="/"
										className={`justify-between ${location.pathname === "/" ? "font-semibold" : ""}`}
									>
										<div className="flex items-center gap-2">
											<BiHome />
											Home
										</div>
									</Link>
								</li>
								<li className="block lg:hidden">
									<Link
										to="/nilai-mhs"
										className={`justify-between ${location.pathname === "/nilai-mhs" ? "font-semibold" : ""}`}
									>
										<div className="flex items-center gap-2">
											<BiBook />
											Nilai
										</div>
									</Link>
								</li>
								<li className="block lg:hidden">
									<Link
										to="/profile"
										className={`justify-between ${location.pathname === "/profile" ? "font-semibold" : ""}`}
									>
										<div className="flex items-center gap-2">
											<BiUser />
											Profile
										</div>
									</Link>
								</li>

								{/* Separator */}
								<div className="h-[1px] w-full bg-black my-1 block lg:hidden"></div>

								{/* Profile Link (visible in both mobile and desktop) */}
								<li className="hidden lg:block">
									<Link
										to="/profile"
										className={`justify-between ${location.pathname === "/profile" ? "font-semibold" : ""}`}
									>
										<div className="flex items-center gap-2">
											<BiUser />
											Profile
										</div>
									</Link>
								</li>

								{/* Logout Button */}
								<li>
									<button
										onClick={() => logout()}
										className="text-error justify-between hover:bg-error hover:text-error-content"
									>
										<span>Logout</span>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
										</svg>
									</button>
								</li>
							</ul>
						</div>
					) : (
						<Link to="/login" className="btn btn-primary btn-sm md:btn-md">
							Login
						</Link>
					)}
				</div>
			</div>
		</div>
	)
}

export default Topbar