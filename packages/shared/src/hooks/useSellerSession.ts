import { useCallback, useEffect, useMemo, useState } from "react";
import { useTonConnect } from "./useTonConnect";
import { Api, type AuthSession } from "../lib/api";
import { TWA } from "../lib/twa";

const TOKEN_KEY = "seller_token";

type PersistedSession = {
	token: string;
	expiresAt: number;
	seller: AuthSession["seller"];
};

export function useSellerSession() {
	const { tonWallet, tonConnectUI } = useTonConnect();
	const [session, setSession] = useState<PersistedSession | null>(() =>
		readSession(),
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const authenticated = Boolean(session?.token);

	const persistSession = useCallback((next: PersistedSession | null) => {
		setSession(next);
		try {
			if (next) {
				window.localStorage.setItem(TOKEN_KEY, JSON.stringify(next));
			} else {
				window.localStorage.removeItem(TOKEN_KEY);
			}
		} catch (storageError) {
			console.warn("[session] persist failed", storageError);
		}
	}, []);

	const logout = useCallback(() => {
		persistSession(null);
		setError(null);
	}, [persistSession]);

	const beginAuth = useCallback(async () => {
		setError(null);
		try {
			const challenge = await Api.createChallenge();
			tonConnectUI.setConnectRequestParameters({
				state: "ready",
				value: { tonProof: challenge.payload },
			});
			await tonConnectUI.openModal();
		} catch (authError) {
			console.error("[auth] challenge request failed", authError);
			setError("Не удалось запросить авторизацию. Попробуйте ещё раз.");
		}
	}, [tonConnectUI]);

	useEffect(() => {
		if (!tonWallet?.connectItems?.tonProof || !tonWallet.account) {
			return;
		}
		if ("error" in tonWallet.connectItems.tonProof) {
			setError("Подпись ton-proof была отклонена кошельком.");
			return;
		}
		if (authenticated) {
			return;
		}

		const proof = tonWallet.connectItems.tonProof.proof;
		const telegramUser = TWA?.initDataUnsafe?.user;
		setLoading(true);
		setError(null);

		Api.verifyProof({
			proof,
			wallet: {
				address: tonWallet.account.address,
				publicKey: tonWallet.account.publicKey,
				telegram: telegramUser
					? {
							id: telegramUser.id,
							username: telegramUser.username,
							name: `${telegramUser.first_name ?? ""} ${telegramUser.last_name ?? ""}`.trim(),
						}
					: undefined,
			},
		})
			.then((result) => {
				persistSession({
					token: result.token,
					expiresAt: result.expiresAt,
					seller: result.seller,
				});
				tonConnectUI.setConnectRequestParameters(null);
			})
			.catch((authError) => {
				console.error("[auth] verification failed", authError);
				setError("Не удалось подтвердить кошелёк. Попробуйте ещё раз.");
			})
			.finally(() => setLoading(false));
	}, [tonWallet, authenticated, persistSession, tonConnectUI]);

	const token = session?.token ?? null;

	return {
		authenticated,
		token,
		seller: session?.seller ?? null,
		loading,
		error,
		beginAuth,
		logout,
	};
}

function readSession(): PersistedSession | null {
	if (typeof window === "undefined") {
		return null;
	}
	try {
		const raw = window.localStorage.getItem(TOKEN_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as PersistedSession;
		if (!parsed.token || Date.now() > parsed.expiresAt) {
			window.localStorage.removeItem(TOKEN_KEY);
			return null;
		}
		return parsed;
	} catch (error) {
		console.warn("[session] read failed", error);
		return null;
	}
}
