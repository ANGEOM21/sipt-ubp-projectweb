import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { FiLock, FiMail, FiEye, FiEyeOff, FiAlertTriangle } from "react-icons/fi";
import Footer from "@/components/Footer";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();
	const { login } = useAuthStore();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await login({ email, password });
			navigate("/");
		} catch (err) {
			setError("Email atau password salah. Silakan coba lagi.");
			console.error("Login error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/10 to-base-100">
			{/* Topbar */}
			<div className="navbar bg-base-100 shadow-lg px-4 sm:px-8">
				{/* Logo/Brand */}
				<div className="flex-1">
					<a className="btn btn-ghost text-xl">
						<img src="/logo.png" alt="logo" draggable={false} className="w-40" />
					</a>
				</div>
				<div className="flex-none gap-2">
					<Link to="/">Home</Link>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-md mx-auto">
					{/* Login Card */}
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<div className="text-center mb-6">
								<h1 className="text-3xl font-bold text-primary mb-2">Masuk</h1>
								<p className="text-gray-600">
									Silakan masuk untuk mengakses akun Anda
								</p>
							</div>

							{error && (
								<div className="alert alert-error shadow-lg">
									<div>
										<FiAlertTriangle />
										<span>{error}</span>
									</div>
								</div>
							)}

							<form onSubmit={handleSubmit} className="space-y-4">
								{/* Email Input */}
								<div className="form-control flex flex-col gap-2">
									<label htmlFor="email">
										<span className="label-text">
											Email
										</span>
									</label>
									<label className="input w-full input-primary">
										<FiMail className="text-gray-500" />
										<input
											type="email"
											placeholder="email@example.com"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											required
										/>
									</label>
								</div>

								{/* Password Input */}
								<div className="form-control flex flex-col gap-2">
									<label className="label">
										<span className="label-text">Password</span>
									</label>
									<label className="input w-full input-primary">
										<FiLock className="text-gray-500" />
										<input
											type={showPassword ? "text" : "password"}
											placeholder="********"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											minLength={6}
										/>
										<button
											type="button"
											className="cursor-pointer"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? (
												<FiEyeOff className="text-gray-500" />
											) : (
												<FiEye className="text-gray-500" />
											)}
										</button>
									</label>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									className={`btn btn-primary w-full`}
									disabled={loading}
								>
									{loading ? (
										<>
											<span className="loading loading-spinner"></span>
										</>
									) : "Masuk"}
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
			<Footer />

		</div>
	);
};

export default Login;