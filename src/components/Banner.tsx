import { useId } from "react";
export function Banner({ image }: { image?: string }) {
	const modalId = useId();
	const imageUrl = image;

	return (
		<section>
			{/* Kotak Gambar */}
			<div className="carousel w-full rounded-box shadow-xl cursor-pointer">
				<div className="carousel-item relative w-full"
					onClick={() => {
						const modal = document.getElementById(modalId) as HTMLDialogElement;
						if (modal) modal.showModal();
					}}>
					<img src={imageUrl} alt="banner" className="object-cover w-full h-full" />

					{/* Overlay saat hover */}
					<div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<span className="text-white text-xs font-medium">Bukti Diterima</span>
					</div>
				</div>

				{/* Modal pakai <dialog> */}
				<dialog id={modalId} className="modal">
					<div className="modal-box">
						<img
							src={imageUrl}
							alt="bukti full"
							className="max-w-[100vw] max-h-[80vh] object-contain mx-auto"
						/>
					</div>
					<form method="dialog" className="modal-backdrop">
						{/* <div className="absolute bottom-14 flex items-center w-full font-bold justify-center transition-all duration-200 ease-in-out">
							<button className="btn btn-lg btn-error btn-circle">
								<VscChromeClose size={20} className="text-white" />
							</button>
						</div> */}
						{/* <button>close</button> */}
						<button>close</button>
					</form>
				</dialog>
			</div>
		</section>
	);
}
