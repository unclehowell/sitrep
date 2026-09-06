import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { i as redirectToLoginIfRequired, r as classifyCallToolError, t as PHASE_ORDER } from "./docket-D5nKbO3f.mjs";
import { a as ChevronRight, i as LoaderCircle, n as Search, o as ChevronDown, r as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as format } from "../_libs/date-fns.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B59IMedI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var loadDocket = createServerFn({ method: "POST" }).handler(createSsrRpc("e34189b69a45fe554bdd9f916a02b491ba374e8a655d0aa154dd4fe1379ff67b"));
var loadMessage = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("437f4d3362039354b32e266537e94a7755a9f45867c69dc08a7199f33f330208"));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[opacity,transform,background-color,color] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood", {
	variants: {
		variant: {
			default: "bg-oxblood text-oxblood-fg hover:opacity-90",
			ghost: "bg-transparent text-fg hover:bg-raised",
			outline: "bg-transparent text-fg shadow-[var(--shadow-border)] hover:bg-raised",
			paper: "bg-paper text-paper-fg hover:opacity-95"
		},
		size: {
			default: "h-11 px-4 text-sm",
			sm: "h-9 px-3 text-xs",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var STATUS_LABEL = {
	not_started: "Not started",
	open: "Open",
	awaiting: "Awaiting",
	responded: "Replied",
	exhausted: "Exhausted",
	ready: "Ready",
	sent: "Issued"
};
function fmtDate(raw) {
	if (!raw) return "—";
	const d = new Date(raw);
	if (Number.isNaN(d.getTime())) return raw;
	return format(d, "d MMM yyyy");
}
function fmtStamp(raw) {
	const d = new Date(raw);
	if (Number.isNaN(d.getTime())) return raw;
	return format(d, "d MMM yyyy · HH:mm");
}
function displayName(from) {
	const m = from.match(/^(.*?)\s*<[^>]+>/);
	return (m ? m[1] : from).replace(/["<>]/g, "").trim() || from;
}
function DocketApp() {
	const [docket, setDocket] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	const [q, setQ] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [openPhase, setOpenPhase] = (0, import_react.useState)({});
	const [bodies, setBodies] = (0, import_react.useState)({});
	const [bodyLoading, setBodyLoading] = (0, import_react.useState)({});
	const [loginRes, setLoginRes] = (0, import_react.useState)(null);
	async function fetchDocket(isRefresh = false) {
		if (isRefresh) setRefreshing(true);
		else setLoading(true);
		try {
			const res = await loadDocket();
			setDocket(res);
			setLoginRes(res);
			const seed = {};
			for (const p of res.parties) for (const ph of PHASE_ORDER) for (const e of p.phases[ph].emails) if (e.body) seed[e.id] = e.body;
			if (Object.keys(seed).length) setBodies((prev) => ({
				...seed,
				...prev
			}));
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}
	(0, import_react.useEffect)(() => {
		fetchDocket();
	}, []);
	const parties = (0, import_react.useMemo)(() => {
		if (!docket) return [];
		const needle = q.trim().toLowerCase();
		return docket.parties.filter((p) => {
			if (filter === "awaiting") {
				if (!PHASE_ORDER.some((id) => p.phases[id].status === "awaiting")) return false;
			} else if (filter === "exhausted") {
				if (!PHASE_ORDER.some((id) => p.phases[id].status === "exhausted")) return false;
			} else if (filter === "cpr") {
				if (p.phases.cpr.status !== "ready" && p.phases.cpr.emails.length === 0) return false;
			}
			if (!needle) return true;
			return [
				p.name,
				p.shortName,
				p.org ?? "",
				p.refs.join(" "),
				...PHASE_ORDER.flatMap((id) => p.phases[id].emails.map((e) => `${e.subject} ${e.from}`))
			].join(" ").toLowerCase().includes(needle);
		});
	}, [
		docket,
		q,
		filter
	]);
	async function onExpandEmail(email) {
		if (bodies[email.id] || bodyLoading[email.id]) return;
		if (email.body) {
			setBodies((b) => ({
				...b,
				[email.id]: email.body
			}));
			return;
		}
		setBodyLoading((s) => ({
			...s,
			[email.id]: true
		}));
		try {
			const res = await loadMessage({ data: { id: email.id } });
			if (res.body) setBodies((b) => ({
				...b,
				[email.id]: res.body
			}));
			else if (email.snippet) setBodies((b) => ({
				...b,
				[email.id]: email.snippet
			}));
		} finally {
			setBodyLoading((s) => ({
				...s,
				[email.id]: false
			}));
		}
	}
	const errKind = docket?.errorKind;
	const previewToken = (docket?.errorDetail ?? "").startsWith("missing_connector_token");
	const showLogin = errKind === "login" && !previewToken && docket?.loginRequired;
	const cprReady = docket?.parties.filter((p) => p.phases.cpr.status === "ready").length ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-line bg-surface px-4 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-3xl flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted",
							children: "Ty Mawr · Llandough"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 font-display text-3xl font-medium tracking-[-0.03em] text-fg sm:text-4xl",
							children: "Cofnod"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm leading-relaxed text-muted",
							children: "Parties reached. Each row is collapsed so the list stays readable. Open a party, then a step: FOI / SAR / GDPR → Internal Review → CPR 31.16 (last resort)."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						"aria-label": "Refresh from Gmail",
						disabled: loading || refreshing,
						onClick: () => void fetchDocket(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", refreshing && "animate-spin") })
					})]
				}), docket && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-3 gap-2 text-center sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Parties",
							value: docket.parties.length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Letters",
							value: docket.parties.reduce((n, p) => n + p.emailCount, 0)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Awaiting",
							value: docket.parties.filter((p) => PHASE_ORDER.some((id) => p.phases[id].status === "awaiting")).length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "CPR ready",
							value: cprReady,
							accent: true
						})
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-3xl px-4 py-5 sm:px-8",
			children: [
				docket && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceBanner, {
					docket,
					previewToken,
					showLogin: !!showLogin,
					onLogin: () => {
						if (!loginRes) return;
						redirectToLoginIfRequired({
							ok: false,
							data: null,
							loginRequired: loginRes.loginRequired,
							loginUrl: loginRes.loginUrl
						});
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "relative block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "search",
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Search parties, refs, subjects",
							className: "h-11 w-full rounded-lg bg-surface pl-10 pr-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							["all", "All parties"],
							["awaiting", "Awaiting"],
							["exhausted", "Exhausted"],
							["cpr", "CPR ready"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setFilter(id),
							className: cn("h-10 rounded-full px-3.5 text-sm font-medium transition-colors duration-150", filter === id ? "bg-paper text-paper-fg" : "bg-surface text-muted shadow-[var(--shadow-border)]"),
							children: label
						}, id))
					})]
				}),
				loading && !docket ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex items-center gap-2 text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Reading the docket…"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-5 flex flex-col gap-2",
					children: [parties.map((party) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyCard, {
						party,
						openPhase: openPhase[party.id] ?? null,
						onPhase: (id) => setOpenPhase((s) => ({
							...s,
							[party.id]: s[party.id] === id ? null : id
						})),
						bodies,
						bodyLoading,
						onExpandEmail
					}) }, party.id)), parties.length === 0 && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-[var(--shadow-border)]",
						children: "No parties match this filter."
					})]
				})
			]
		})]
	});
}
function Stat({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-raised px-2 py-3 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-[0.65rem] font-medium uppercase tracking-[0.14em] text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: cn("mt-1 font-display text-2xl tabular-nums", accent ? "text-oxblood" : "text-fg"),
			children: value
		})]
	});
}
function SourceBanner({ docket, previewToken, showLogin, onLogin }) {
	const kind = docket.errorKind;
	if (showLogin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-raised px-4 py-3 text-sm shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "Continue with Grok to load live Gmail."
			}),
			docket.errorDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-subtle",
				children: docket.errorDetail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3",
				onClick: onLogin,
				children: "Continue with Grok"
			})
		]
	});
	if (kind === "not_connected") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-raised px-4 py-3 text-sm shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "Connect Gmail in Grok to refresh the live inbox."
			}),
			docket.errorDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-subtle",
				children: docket.errorDetail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-muted",
				children: [
					"Showing the captured Gmail snapshot from ",
					fmtDate(docket.fetchedAt),
					"."
				]
			})
		]
	});
	if (previewToken || docket.source === "snapshot") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-xs text-subtle",
		children: [
			"Gmail snapshot · ",
			fmtDate(docket.fetchedAt),
			previewToken ? " · live inbox temporarily unavailable — reload the preview to retry." : "",
			docket.errorDetail && kind && kind !== "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block",
				children: docket.errorDetail
			}) : null
		]
	});
	if (kind && kind !== "login") {
		const mapped = classifyCallToolError({
			ok: false,
			data: null,
			errorMessage: docket.errorDetail
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl bg-raised px-4 py-3 text-sm shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: mapped?.message ?? docket.error
				}),
				docket.errorDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-subtle",
					children: docket.errorDetail
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: "Showing the last captured snapshot."
				})
			]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-xs text-subtle",
		children: [
			docket.source === "merged" ? "Live Gmail merged with snapshot" : "Live Gmail",
			" ",
			"· ",
			fmtDate(docket.fetchedAt)
		]
	});
}
function PartyCard({ party, openPhase, onPhase, bodies, bodyLoading, onExpandEmail }) {
	const phase = openPhase ? party.phases[openPhase] : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "group rounded-xl bg-surface shadow-[var(--shadow-border)] open:bg-raised",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
			className: "flex min-h-14 cursor-pointer list-none items-center gap-3 px-3 py-3 sm:px-4 [&::-webkit-details-marker]:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-subtle transition-transform duration-200 group-open:rotate-90" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "truncate font-display text-lg font-medium tracking-[-0.02em]",
						children: party.shortName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted",
						children: party.regime
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 truncate text-xs text-muted",
					children: [
						party.org ? `${party.org} · ` : "",
						party.emailCount,
						" ",
						party.emailCount === 1 ? "letter" : "letters",
						" · ",
						fmtDate(party.lastActivity),
						" · ",
						party.phases[party.currentStage].shortLabel
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-line px-3 pb-4 pt-3 sm:px-4",
			children: [
				party.refs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-xs text-subtle",
					children: ["Refs ", party.refs.join(" · ")]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					"aria-label": `${party.shortName} stages`,
					className: "flex flex-wrap items-center gap-1",
					children: PHASE_ORDER.map((id, i) => {
						const ph = party.phases[id];
						const active = openPhase === id;
						const ready = ph.status === "ready" && id === "cpr";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1",
							children: [i > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "px-0.5 text-subtle",
								"aria-hidden": true,
								children: "›"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onPhase(id),
								"aria-expanded": active,
								className: cn("flex min-h-11 flex-col items-start rounded-lg px-2.5 py-1.5 text-left transition-colors duration-150", active ? "bg-paper text-paper-fg" : ready ? "bg-oxblood/20 text-fg" : "bg-inset text-fg hover:bg-surface"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[0.7rem] font-semibold uppercase tracking-[0.08em]",
									children: ph.shortLabel
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("text-[0.65rem]", active ? "text-paper-muted" : "text-muted"),
									children: [STATUS_LABEL[ph.status], ph.emails.length ? ` · ${ph.emails.length}` : ""]
								})]
							})]
						}, id);
					})
				}),
				phase && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-relaxed text-muted",
						children: phase.note
					}), phase.emails.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPhase, {
						party,
						phaseId: phase.id
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-1.5",
						children: phase.emails.map((email) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmailRow, {
							email,
							body: bodies[email.id],
							loading: !!bodyLoading[email.id],
							onExpand: () => onExpandEmail(email)
						}) }, email.id))
					})]
				})
			]
		})]
	});
}
function EmptyPhase({ party, phaseId }) {
	if (phaseId === "cpr") {
		const ready = party.phases.cpr.status === "ready";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 rounded-lg bg-inset px-3 py-3 text-sm leading-relaxed text-muted",
			children: ready ? "No CPR 31.16 letter yet. FOI / SAR / GDPR (and any internal review) have run their course — this is the last-resort disclosure step against a likely party to proceedings." : party.cprEligible ? "CPR 31.16 stays closed until the information-rights steps fail to yield the records." : "Not the right respondent for a CPR 31.16 application."
		});
	}
	if (phaseId === "review") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 rounded-lg bg-inset px-3 py-3 text-sm text-muted",
		children: party.phases.review.status === "ready" ? "No internal review on file. Ready to raise one if the original reply was a refusal or incomplete." : "No internal review correspondence yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 rounded-lg bg-inset px-3 py-3 text-sm text-muted",
		children: "No FOI / SAR / GDPR letters filed against this party in the inbox snapshot."
	});
}
function EmailRow({ email, body, loading, onExpand }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "rounded-lg bg-inset open:bg-bg",
		onToggle: (e) => {
			if (e.currentTarget.open) onExpand();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
			className: "flex min-h-12 cursor-pointer list-none items-start gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "mt-1 size-3.5 shrink-0 text-subtle" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirChip, { dir: email.direction }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm text-fg",
						children: email.subject || "(no subject)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 truncate text-[0.7rem] text-subtle",
						children: [
							fmtStamp(email.date),
							" · ",
							displayName(email.from)
						]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
			className: "border-t border-line px-3 py-3",
			children: loading && !body ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), "Loading full letter…"]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-md bg-paper px-3 py-3 font-sans text-[0.85rem] leading-relaxed text-paper-fg",
				children: body || email.body || email.snippet || "No body on this message."
			})
		})]
	});
}
function DirChip({ dir }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("mt-0.5 inline-flex h-5 shrink-0 items-center rounded-full px-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em]", dir === "sent" ? "bg-slate/15 text-slate" : "bg-await/20 text-await"),
		children: dir === "sent" ? "Sent" : "Recv"
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocketApp, {});
}
//#endregion
export { Home as component };
