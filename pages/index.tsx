import { GetServerSideProps, NextPage } from "next";
import { useState } from "react";
import styles from "./index.module.css"; //CSS Modulesの読み込み

type IndexPageProps = {
	initialCatImageUrl: string;
};

const IndexPage: NextPage<IndexPageProps> = ({ initialCatImageUrl }) => {
	const [catImageUrl, setCatImageUrl] = useState(initialCatImageUrl);
	const [loading, setLoading] = useState(false);

	const handleClick = async () => {
		setLoading(true);
		const newImage = await fetchCatImage();
		setCatImageUrl(newImage.url);
		setLoading(false);
	};

	return (
		<div className={styles.page}>
			<button onClick={handleClick} className={styles.button}>
				他のにゃんこも見る
			</button>
			<div className={styles.frame}>
				{loading || <img src={catImageUrl} className={styles.image} />}
			</div>
		</div >
	);
};
export default IndexPage;

// サーバーサイドで実行する処理
export const getServerSideProps: GetServerSideProps<IndexPageProps> = async () => {
	const image = await fetchCatImage();
	return {
		props: {
			initialCatImageUrl: image.url,
		},
	};
};

type Image = {
	url: string;
};
//The Cat APIにリクエストし、猫画像を取得する関数
//より防衛的に、サーバのレスポンスをチェックする
const fetchCatImage = async (): Promise<Image> => {
	const res = await fetch("https://api.thecatapi.com/v1/images/search");
	// 一旦unknown型で受け取り、型アサーションで型を指定する
	const images: unknown = await res.json();

	console.log(images); //テスト用

	//配列として表現されているか？
	if (!Array.isArray(images)) {
		throw new Error("APIのレスポンスが妙だにゃん");
	}
	const image: unknown = images[0];
	//Imageの構造をなしているか？
	if (!isImage(image)) {
		throw new Error("にゃんこ画像が取得できにゃかったにゃ");
	}
	return image;
};

//型ガード関数
const isImage = (value: unknown): value is Image => {
	//値がnullでなく、object型であるか？
	if (!value || typeof value !== "object") {
		return false;
	}
	// "url"プロパティが存在し、かつ文字列型であるか？
	//if文で真偽値を判別後にreturnでもいいが、&&演算子を使うと簡潔に書ける
	return "url" in value && typeof value.url === "string";
};
