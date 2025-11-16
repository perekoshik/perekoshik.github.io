import { useCallback, useEffect, useState } from "react";
import { useTonConnect } from "./useTonConnect";
import {
	Api,
	type AuthChallenge,
	type AuthSession,
	type TonProofPayload,
	onApiUnauthorized,
} from "../lib/api";
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
	const [challenge, setChallenge] = useState<AuthChallenge | null>(null);

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

	const resetChallenge = useCallback(() => {
		setChallenge(null);
		try {
			tonConnectUI.setConnectRequestParameters(null);
		} catch {
			// ignore
		}
	}, [tonConnectUI]);

	const logout = useCallback(() => {
		persistSession(null);
		setError(null);
		resetChallenge();
	}, [persistSession, resetChallenge]);

	const beginAuth = useCallback(async () => {
		setError(null);
		try {
			resetChallenge();
			const challengeResponse = await Api.requestAuthChallenge();
			setChallenge(challengeResponse);
			tonConnectUI.setConnectRequestParameters({
				state: "ready",
				value: {
					tonProof: challengeResponse.payload,
				},
			});
			await tonConnectUI.openModal();
		} catch (authError) {
			console.error("[auth] TonConnect auth failed", authError);
			setError("Не удалось запросить подтверждение кошелька. Попробуйте ещё раз.");
			resetChallenge();
		}
	}, [tonConnectUI, resetChallenge]);

	useEffect(() => {
		if (!tonWallet?.account || authenticated || !challenge) {
			return;
		}
		const proof = tonWallet.connectItems?.tonProof;
		if (!proof || proof.proof.payload !== challenge.payload) {
			return;
		}
		const telegramUser = TWA?.initDataUnsafe?.user;
		const tonProofPayload: TonProofPayload = {
			proof: proof.proof,
			state_init: proof.state_init,
		};
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
			tonProof: tonProofPayload,
		})
			.then((result) => {
				persistSession({
					token: result.token,
					expiresAt: result.expiresAt,
					seller: result.seller,
				});
				resetChallenge();
			})
			.catch((authError) => {
				console.error("[auth] login failed", authError);
				setError("Не удалось подтвердить кошелёк. Попробуйте ещё раз.");
				resetChallenge();
			})
			.finally(() => setLoading(false));
	}, [tonWallet, authenticated, challenge, persistSession, resetChallenge]);

	useEffect(() => {
		const unsubscribe = onApiUnauthorized(() => {
			persistSession(null);
			setError("Авторизация истекла. Подтвердите кошелёк заново.");
			resetChallenge();
		});
		return unsubscribe;
	}, [persistSession, resetChallenge]);

	useEffect(() => {
		if (!tonWallet && challenge) {
			resetChallenge();
		}
	}, [tonWallet, challenge, resetChallenge]);

	useEffect(() => {
		if (!challenge) return;
		const timeout = setTimeout(() => {
			resetChallenge();
		}, Math.max(0, challenge.expiresAt - Date.now()));
		return () => clearTimeout(timeout);
	}, [challenge, resetChallenge]);

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
