import { axiosInstance } from "@/lib/axios";
import { useEffect, useState } from "react";

const ImageFromURL = () => {
	const [imageFile, setImageFile] = useState<File | null>(null);

	useEffect(() => {
		const getImageFromUrl = async () => {
			try {
				const res = await axiosInstance.get("https://api-gateway.ubpkarawang.ac.id/upload/banner/p")

				if (!res.data) throw new Error("Gagal fetch");

				const blob = await res.data.blob();
				const file = new File([blob], "banner.jpg", { type: blob.type });
				setImageFile(file);
			} catch (err) {
				console.error("Gagal ambil gambar:", err);
			}
		};

		getImageFromUrl();
	}, []);

	return (
		imageFile ? (
			<img src={`https://corsproxy.io/?https://api-gateway.ubpkarawang.ac.id/upload/banner/xxx.jpg`} />

		) : (
			<p>Loading banner...</p>
		)
	);
};

export default ImageFromURL;
