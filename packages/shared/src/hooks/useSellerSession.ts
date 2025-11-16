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
			await tonConnectUI.openModal();
		} catch (authError) {
			console.error("[auth] TonConnect modal failed", authError);
			setError("Не удалось открыть TonConnect. Попробуйте повторно.");
		}
	}, [tonConnectUI]);

	useEffect(() => {
		if (!tonWallet?.account || authenticated) {
			return;
		}
		const telegramUser = TWA?.initDataUnsafe?.user;
		setLoading(true);
		setError(null);

		Api.login({
			wallet: {
				address: tonWallet.account.address,
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
			})
			.catch((authError) => {
				console.error("[auth] login failed", authError);
				setError("Не удалось подтвердить кошелёк. Попробуйте ещё раз.");
			})
			.finally(() => setLoading(false));
	}, [tonWallet, authenticated, persistSession]);

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
