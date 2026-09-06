//#region node_modules/.nitro/vite/services/ssr/assets/docket-D5nKbO3f.js
function isLoginRequired(result) {
	return result.ok === false && result.loginRequired === true;
}
function isFramed() {
	try {
		return window.self !== window.top;
	} catch {
		return true;
	}
}
function redirectToLoginIfRequired(result) {
	if (!isLoginRequired(result)) return false;
	const url = result.loginUrl;
	if (!url) return false;
	if (typeof window === "undefined") return false;
	if (isFramed()) {
		const opened = window.open(url, "_blank");
		if (opened) {
			opened.opener = null;
			return true;
		}
	}
	window.location.assign(url);
	return true;
}
function classifyCallToolError(result) {
	if (result.ok) return null;
	const detail = result.errorMessage || void 0;
	const raw = (result.errorMessage ?? "").toLowerCase();
	if (isLoginRequired(result)) return {
		kind: "login",
		message: "Continue with Grok to load your data.",
		detail
	};
	if (raw.includes("not_connected") || raw.includes("failed_precondition")) return {
		kind: "not_connected",
		message: "Connect this connector in Grok to load your data.",
		detail
	};
	if (raw.includes("scope_denied")) return {
		kind: "scope_denied",
		message: "This view isn't available — the app requested a tool outside its grant.",
		detail
	};
	if (raw.includes("access_denied")) return {
		kind: "access_denied",
		message: "You don't have access to this data.",
		detail
	};
	return {
		kind: "error",
		message: detail ?? "Something went wrong. Try again.",
		detail
	};
}
var SELF_EMAILS = ["hywelapbuckler@gmail.com", "sion buckler"];
var IGNORE_DOMAINS = [
	"mailer-daemon",
	"googlemail.com",
	"x.ai",
	"substack.com",
	"carfinance247.co.uk",
	"mail.all.com",
	"patrioticalternative.org.uk",
	"opendemocracy.net"
];
var PARTY_DEFS = [
	{
		id: "cadw",
		name: "Cadw",
		shortName: "Cadw",
		org: "Welsh Government",
		kind: "public_authority",
		domains: [
			"gov.wales",
			"llyw.cymru",
			"customersupport.tfw.wales"
		],
		aliases: [
			"andy.wigley",
			"amy.longford",
			"cadwplanning",
			"scheduledmonuments",
			"cadw",
			"michael.weatherhead",
			"matthew.coward",
			"listedbuildings"
		],
		refs: ["1988 listing"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "vale-foi",
		name: "Vale of Glamorgan Council",
		shortName: "Vale Council",
		org: "FOI Unit",
		kind: "public_authority",
		domains: ["valeofglamorgan.gov.uk"],
		aliases: [
			"foiunit",
			"foi unit",
			"hhuggins"
		],
		refs: ["00210772"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "vale-mo",
		name: "Vale Monitoring Officer",
		shortName: "Monitoring Officer",
		org: "Vale of Glamorgan Council",
		kind: "public_authority",
		domains: ["valeofglamorgan.gov.uk"],
		aliases: [
			"vdavidson",
			"complaints@",
			"monitoringofficer",
			"chiefexecutive",
			"s151"
		],
		refs: ["Cllr Carroll complaint"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "moj-hmcts",
		name: "Ministry of Justice / HMCTS",
		shortName: "MoJ / HMCTS",
		org: "National Support Unit",
		kind: "court",
		domains: ["justice.gov.uk"],
		aliases: [
			"nsukilo",
			"data.access",
			"disclosure team",
			"cardiff.countycourt"
		],
		refs: [
			"260803049 SAR",
			"260805002 FOIA",
			"260702090"
		],
		regime: "mixed",
		cprEligible: true
	},
	{
		id: "swp",
		name: "South Wales Police",
		shortName: "SWP",
		org: "FOI / Data Protection",
		kind: "public_authority",
		domains: ["south-wales.police.uk"],
		aliases: [
			"information@south-wales",
			"sally-anne.hillman",
			"commissioner@south-wales"
		],
		refs: ["719/26"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "tna",
		name: "The National Archives",
		shortName: "TNA",
		kind: "archive",
		domains: ["nationalarchives.gov.uk", "whatdotheyknow.com"],
		aliases: ["foirequests@nationalarchives", "contactcentre@nationalarchives"],
		refs: [
			"CAS-347296-M0V4Y1",
			"CAS-343481-X5H3M6",
			"CRM:007302446"
		],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "museum-wales",
		name: "Amgueddfa Cymru",
		shortName: "Museum Wales",
		org: "National Museum Wales",
		kind: "public_authority",
		domains: ["museumwales.ac.uk"],
		aliases: ["foi.requests@museumwales"],
		refs: ["FOI 2026-024"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "welsh-water",
		name: "Dŵr Cymru Welsh Water",
		shortName: "Welsh Water",
		kind: "public_authority",
		domains: ["dwrcymru.com"],
		aliases: ["datasubjectrightsrequest", "customercareteam"],
		refs: ["DP/2961/2026", "92994223/01"],
		regime: "gdpr",
		cprEligible: true
	},
	{
		id: "hmlr",
		name: "HM Land Registry",
		shortName: "HMLR",
		kind: "public_authority",
		domains: ["landregistry.gov.uk"],
		aliases: [
			"wales.office",
			"coventry.office",
			"customersupport@landregistry",
			"central@landregistry"
		],
		refs: [
			"WA231076",
			"WA240304",
			"N610CGV",
			"260812-6565153"
		],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "ico",
		name: "Information Commissioner's Office",
		shortName: "ICO",
		kind: "regulator",
		domains: ["ico.org.uk"],
		aliases: ["icocasework"],
		refs: ["IC-546505-W6P0"],
		regime: "mixed",
		cprEligible: false
	},
	{
		id: "rcahmw",
		name: "RCAHMW",
		shortName: "RCAHMW",
		org: "Royal Commission on the Ancient and Historical Monuments of Wales",
		kind: "archive",
		domains: ["rcahmw.gov.uk"],
		aliases: ["nmr.wales", "dr driver"],
		refs: [],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "nlw",
		name: "National Library of Wales",
		shortName: "NLW",
		kind: "archive",
		domains: ["llgc.org.uk"],
		aliases: ["enquiry@llgc"],
		refs: ["FOI/2026/09"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "cardiff-foi",
		name: "Cardiff Council",
		shortName: "Cardiff Council",
		org: "FOI / Glamorgan Archives host",
		kind: "public_authority",
		domains: ["cardiff.gov.uk", "houseonthehill.com"],
		aliases: ["foi@cardiff", "glamro@cardiff"],
		refs: ["FOI25766"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "dcms",
		name: "Department for Culture, Media and Sport",
		shortName: "DCMS",
		kind: "public_authority",
		domains: ["dcms.gov.uk"],
		aliases: ["foi@dcms"],
		refs: ["FOI2026/06174", "IR2026/06711"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "science-museum",
		name: "Science Museum Group",
		shortName: "Science Museum",
		kind: "archive",
		domains: ["sciencemuseum.ac.uk", "sciencemuseumgroup.ac.uk"],
		aliases: ["freedomofinformation@sciencemuseum", "info@sciencemuseumgroup"],
		refs: ["FOI/2026/0038"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "bp-archive",
		name: "BP Archive",
		shortName: "BP Archive",
		org: "University of Warwick",
		kind: "archive",
		domains: ["bp.com", "warwick.ac.uk"],
		aliases: ["bparchive", "mrc_archive"],
		refs: ["Reading Room"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "cps",
		name: "Crown Prosecution Service",
		shortName: "CPS Wales",
		org: "Victim Liaison Cymru",
		kind: "public_authority",
		domains: ["cps.gov.uk"],
		aliases: ["victimliaison.cymru"],
		refs: ["BP v Buckler 1987"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "fca",
		name: "Financial Conduct Authority",
		shortName: "FCA",
		kind: "regulator",
		domains: ["fca.org.uk"],
		aliases: ["consumer.queries", "noreply@fca"],
		refs: ["212515385", "212515386"],
		regime: "foi",
		cprEligible: false
	},
	{
		id: "cavuhb",
		name: "Cardiff and Vale UHB",
		shortName: "CAV UHB",
		org: "Health records / bereavement",
		kind: "public_authority",
		domains: ["wales.nhs.uk"],
		aliases: ["cav.accesstorecords"],
		refs: ["Deceased records"],
		regime: "gdpr",
		cprEligible: true
	},
	{
		id: "medical-examiner",
		name: "South Wales Central Medical Examiner",
		shortName: "Medical Examiner",
		kind: "public_authority",
		domains: ["wales.nhs.uk"],
		aliases: ["southwalescentral.medicalexaminersoffice"],
		refs: [],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "coroner",
		name: "South Wales Central Coroner",
		shortName: "Coroner",
		org: "RCTCBC",
		kind: "court",
		domains: ["rctcbc.gov.uk"],
		aliases: ["coroneradmin"],
		refs: [],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "senedd-culture",
		name: "Senedd Culture Committee",
		shortName: "Senedd Culture",
		org: "Pwyllgor Diwylliant",
		kind: "elected",
		domains: ["senedd.cymru", "senedd.wales"],
		aliases: ["senedddiwylliant", "seneddculture"],
		refs: [],
		regime: "foi",
		cprEligible: false
	},
	{
		id: "doughty",
		name: "Stephen Doughty MP",
		shortName: "Doughty MP",
		org: "Cardiff South and Penarth",
		kind: "elected",
		domains: ["parliament.uk"],
		aliases: ["stephen.doughty.mp"],
		refs: [],
		regime: "foi",
		cprEligible: false
	},
	{
		id: "carroll",
		name: "Cllr George Carroll",
		shortName: "Cllr Carroll",
		org: "Llandough ward",
		kind: "elected",
		domains: ["valeofglamorgan.gov.uk"],
		aliases: ["gdcarroll"],
		refs: [],
		regime: "foi",
		cprEligible: false
	},
	{
		id: "franks",
		name: "Cllr Christopher Franks",
		shortName: "Cllr Franks",
		org: "Vale of Glamorgan",
		kind: "elected",
		domains: ["valeofglamorgan.gov.uk"],
		aliases: ["cpfranks"],
		refs: [],
		regime: "foi",
		cprEligible: false
	},
	{
		id: "ukgov-wales",
		name: "UK Government in Wales",
		shortName: "SoS Wales",
		org: "Secretary of State",
		kind: "public_authority",
		domains: ["ukgovwales.gov.uk"],
		aliases: ["correspondence@ukgovwales"],
		refs: [],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "phso",
		name: "Parliamentary and Health Service Ombudsman",
		shortName: "PHSO",
		kind: "regulator",
		domains: ["ombudsman.org.uk"],
		aliases: ["phso.enquiries"],
		refs: ["C-2205633"],
		regime: "foi",
		cprEligible: false
	},
	{
		id: "ace",
		name: "Arts Council England",
		shortName: "Arts Council",
		kind: "public_authority",
		domains: ["artscouncil.org.uk"],
		aliases: ["information@artscouncil"],
		refs: [],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "nactso",
		name: "National Counter Terrorism Security Office",
		shortName: "NaCTSO",
		kind: "public_authority",
		domains: ["whatdotheyknow.com"],
		aliases: ["national counter terrorism"],
		refs: ["WDTK BP vs Buckler 1987"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "media-wales",
		name: "Media Wales / South Wales Echo",
		shortName: "Media Wales",
		org: "Reach plc",
		kind: "other",
		domains: [
			"reachplc.com",
			"walesonline.co.uk",
			"mediawales.co.uk"
		],
		aliases: ["tryst.williams"],
		refs: [],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "cardiff-uni",
		name: "Cardiff University Special Collections",
		shortName: "Cardiff Uni",
		kind: "archive",
		domains: ["cardiff.ac.uk"],
		aliases: ["specialcollections"],
		refs: ["Marconi / GPO"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "royal-mail",
		name: "Royal Mail Group",
		shortName: "Royal Mail",
		org: "Information Rights",
		kind: "other",
		domains: ["royalmail.com"],
		aliases: ["irgt", "information.rights@royalmail"],
		refs: ["GPO 1897 / Marconi"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "post-office",
		name: "Post Office Limited",
		shortName: "Post Office",
		kind: "public_authority",
		domains: ["postoffice.co.uk"],
		aliases: ["information.rights@postoffice", "foi2026/00751"],
		refs: ["FOI2026/00751"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "llandough-cc",
		name: "Llandough Community Council",
		shortName: "Llandough CC",
		org: "Clerk",
		kind: "public_authority",
		domains: ["llandough-cc.co.uk"],
		aliases: ["clerk@llandough", "paul egan"],
		refs: ["1988 minutes"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "heneb",
		name: "Heneb — Wales Heritage",
		shortName: "Heneb",
		org: "Historic Environment Record",
		kind: "archive",
		domains: ["heneb.org.uk"],
		aliases: ["barbara.rees", "her@heneb"],
		refs: [],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "os",
		name: "Ordnance Survey",
		shortName: "OS",
		kind: "public_authority",
		domains: ["os.uk"],
		aliases: ["foi@os"],
		refs: [],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "landmark",
		name: "Landmark Chambers",
		shortName: "Landmark",
		org: "Counsel",
		kind: "other",
		domains: ["landmarkchambers.co.uk"],
		aliases: ["cmcgilly", "connor mcgilly"],
		refs: ["Forensic report"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "davies",
		name: "Davies Contractors",
		shortName: "Davies",
		kind: "other",
		domains: ["daviescontractors.co.uk"],
		aliases: ["michelle cueto"],
		refs: ["Site works"],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "ppo",
		name: "Prisons and Probation Ombudsman",
		shortName: "PPO",
		kind: "regulator",
		domains: ["ppo.gov.uk"],
		aliases: ["mail@ppo"],
		refs: [],
		regime: "foi",
		cprEligible: false
	},
	{
		id: "sodexo",
		name: "Sodexo Justice",
		shortName: "Sodexo",
		org: "FB.PDU",
		kind: "other",
		domains: ["sodexogov.co.uk"],
		aliases: ["fb.pdu"],
		refs: [],
		regime: "foi",
		cprEligible: true
	},
	{
		id: "platfform",
		name: "Platfform Wellbeing",
		shortName: "Platfform",
		kind: "other",
		domains: ["platfformwellbeing.com"],
		aliases: ["hello@platfform"],
		refs: [],
		regime: "foi",
		cprEligible: false
	}
];
var PHASE_META = {
	request: {
		label: "FOI / SAR / GDPR",
		shortLabel: "FOI/SAR/GDPR",
		note: "First information-rights step: Freedom of Information, Subject Access, or UK GDPR."
	},
	review: {
		label: "Internal Review",
		shortLabel: "Review",
		note: "Challenge a refusal or inadequate reply before going further."
	},
	cpr: {
		label: "CPR 31.16",
		shortLabel: "CPR 31.16",
		note: "Last resort. Pre-action disclosure under Civil Procedure Rules 31.16 if FOI / SAR / GDPR and internal review fail to yield the records."
	}
};
function norm(s) {
	return s.toLowerCase().replace(/\s+/g, " ").trim();
}
function haystack(email) {
	return norm([
		email.from,
		email.to.join(" "),
		(email.cc ?? []).join(" "),
		email.subject,
		email.snippet,
		email.body ?? ""
	].join(" "));
}
function extractAddress(raw) {
	const m = raw.match(/<([^>]+)>/);
	return (m ? m[1] : raw).toLowerCase().trim();
}
function extractDomain(raw) {
	const addr = extractAddress(raw);
	const at = addr.lastIndexOf("@");
	return at >= 0 ? addr.slice(at + 1) : "";
}
function isSelf(raw) {
	const n = norm(raw);
	return SELF_EMAILS.some((s) => n.includes(s));
}
function isNoise(email) {
	const from = norm(email.from);
	if (IGNORE_DOMAINS.some((d) => from.includes(d))) return true;
	if (from.includes("mail delivery subsystem")) return true;
	if (from.includes("mailer-daemon")) return true;
	const sub = norm(email.subject);
	if (sub.startsWith("delivery status notification")) return true;
	if (sub.startsWith("undeliverable:")) return true;
	return false;
}
function directionOf(email) {
	return isSelf(email.from) ? "sent" : "received";
}
function defMatches(def, text, domains) {
	if (def.domains.some((d) => domains.some((x) => x === d || x.endsWith(`.${d}`)))) {
		if (def.aliases.length === 0) return true;
		if (def.aliases.some((a) => text.includes(a))) return true;
		if (PARTY_DEFS.filter((p) => p.domains.some((d) => def.domains.includes(d))).length === 1) return true;
	}
	if (def.aliases.some((a) => text.includes(a))) return true;
	return false;
}
function uniqueDomains(email) {
	const fields = [
		email.from,
		...email.to,
		...email.cc ?? []
	];
	return [...new Set(fields.map(extractDomain).filter(Boolean))];
}
function counterpartDomains(email) {
	const fields = [
		email.from,
		...email.to,
		...email.cc ?? []
	];
	const out = [];
	for (const f of fields) {
		if (isSelf(f)) continue;
		const d = extractDomain(f);
		if (!d || d === "gmail.com" || d === "googlemail.com") continue;
		if (IGNORE_DOMAINS.some((x) => d.includes(x))) continue;
		if (!out.includes(d)) out.push(d);
	}
	return out;
}
var SHARED_DOMAIN_PRIORITY = {
	"valeofglamorgan.gov.uk": [
		"franks",
		"carroll",
		"vale-mo",
		"vale-foi"
	],
	"whatdotheyknow.com": ["nactso", "tna"],
	"wales.nhs.uk": ["cavuhb", "medical-examiner"],
	"cardiff.gov.uk": ["cardiff-foi"]
};
function matchPartyIds(email) {
	const text = haystack(email);
	const domains = uniqueDomains(email);
	const hits = [];
	for (const def of PARTY_DEFS) if (defMatches(def, text, domains)) hits.push(def);
	if (hits.length <= 1) return hits.map((h) => h.id);
	const aliasHits = hits.filter((d) => d.aliases.some((a) => text.includes(a)));
	if (aliasHits.length === 1) return [aliasHits[0].id];
	if (aliasHits.length > 1) {
		if (aliasHits.filter((d) => d.kind === "elected").length >= 1 && isSelf(email.from)) return aliasHits.map((d) => d.id);
		return [aliasHits[0].id];
	}
	for (const domain of domains) {
		const order = SHARED_DOMAIN_PRIORITY[domain];
		if (!order) continue;
		for (const id of order) if (hits.some((h) => h.id === id)) return [id];
	}
	return [hits[0].id];
}
var REVIEW_RE = /\binternal review\b|\breview of (the )?(sar|foi|foia|eir|eoi|handling)\b|\bir20\d{2}\b|\breview outcome\b|\bcase ref: c-\d+|\breview of eoi\b|\breview of your request\b/i;
var CPR_RE = /\bcpr\s*31(?:\.16)?\b|\bpre-?action disclosure\b|\bpart 31\b|\bnorwich pharmacal\b|\bdisclosure application\b/i;
var SAR_RE = /\bsar\b|\bsubject access\b|\bdsar\b|\bdata subject rights\b|\bgdpr\b|\bdata protection act\b|\bright of access\b/i;
var FOI_RE = /\bfreedom of information\b|\bfoia\b|\bfoi\b|\beir\b|\beoi\b|\batisn\b|\benvironmental information\b/i;
function classifyPhase(email) {
	const text = `${email.subject}\n${email.snippet}\n${email.body ?? ""}`;
	if (CPR_RE.test(text)) return "cpr";
	if (REVIEW_RE.test(text)) return "review";
	return "request";
}
function looksLikeCorrespondence(email) {
	const t = haystack(email);
	return /foi|foia|eir|eoi|atisn|sar|dsar|gdpr|subject access|internal review|great house|ty mawr|llandough|buckler|cadw|disclosure|information rights|freedom of information|data protection|marconi|williams family|bp vs buckler|bp v buckler/i.test(t);
}
function detectRegime(emails) {
	let foi = false;
	let sar = false;
	let gdpr = false;
	for (const e of emails) {
		const t = `${e.subject} ${e.snippet} ${e.body ?? ""}`;
		if (SAR_RE.test(t) && /gdpr|data protection/i.test(t)) gdpr = true;
		else if (SAR_RE.test(t)) sar = true;
		if (FOI_RE.test(t)) foi = true;
	}
	if ([
		foi,
		sar,
		gdpr
	].filter(Boolean).length > 1) return "mixed";
	if (gdpr) return "gdpr";
	if (sar) return "sar";
	return "foi";
}
function isExhaustedLanguage(text) {
	return /do not hold|does not hold|no (recorded )?information|no records|unable to locate|files have been destroyed|nothing further|not the right place|not subject to the (foi|freedom)|no further information|we have now provided all|not obliged to respond|ceased to be subject to the foia|i consider to be self-explanatory|information commissioner/i.test(text);
}
var PHASE_ORDER = [
	"request",
	"review",
	"cpr"
];
function ts(date) {
	const n = Date.parse(date);
	return Number.isFinite(n) ? n : 0;
}
function byDateAsc(a, b) {
	return ts(a.date) - ts(b.date);
}
function emptyPhase(id) {
	const meta = PHASE_META[id];
	return {
		id,
		label: meta.label,
		shortLabel: meta.shortLabel,
		status: "not_started",
		emails: [],
		note: meta.note
	};
}
function textOf(e) {
	return `${e.subject}\n${e.snippet}\n${e.body ?? ""}`;
}
function statusFromEmails(id, emails, ctx) {
	if (emails.length === 0) {
		if (id === "review") return ctx.requestDone ? "ready" : "not_started";
		if (id === "cpr") {
			if (!ctx.cprEligible) return "not_started";
			if (ctx.requestDone && ctx.reviewDone) return "ready";
			if (ctx.requestDone) return "ready";
			return "not_started";
		}
		return "not_started";
	}
	const sorted = [...emails].sort(byDateAsc);
	const last = sorted[sorted.length - 1];
	if (emails.some((e) => e.direction === "received" && isExhaustedLanguage(textOf(e)))) return "exhausted";
	if (last.direction === "sent") return id === "cpr" ? "sent" : "awaiting";
	return "responded";
}
function isDone(status) {
	return status === "exhausted" || status === "responded";
}
function currentStage(phases) {
	if (phases.cpr.status === "ready" || phases.cpr.emails.length > 0) return "cpr";
	if (phases.review.emails.length > 0 || phases.review.status === "ready") return "review";
	return "request";
}
function adHocId(domain) {
	return `domain:${domain}`;
}
function buildParties(raw) {
	const buckets = /* @__PURE__ */ new Map();
	const known = new Map(PARTY_DEFS.map((d) => [d.id, d]));
	for (const email of raw) {
		if (isNoise(email)) continue;
		let ids = matchPartyIds(email);
		if (ids.length === 0) {
			if (!looksLikeCorrespondence(email)) continue;
			const domains = counterpartDomains(email);
			if (domains.length === 0) continue;
			ids = [adHocId(domains[0])];
		}
		const dir = directionOf(email);
		const phase = classifyPhase(email);
		for (const id of ids) {
			const docket = {
				...email,
				direction: dir,
				phase,
				partyId: id
			};
			const bucket = buckets.get(id) ?? {
				emails: [],
				raw: []
			};
			bucket.emails.push(docket);
			bucket.raw.push(email);
			buckets.set(id, bucket);
		}
	}
	const parties = [];
	for (const [id, bucket] of buckets) {
		const def = known.get(id);
		const phases = {
			request: emptyPhase("request"),
			review: emptyPhase("review"),
			cpr: emptyPhase("cpr")
		};
		for (const e of bucket.emails) phases[e.phase].emails.push(e);
		for (const idp of PHASE_ORDER) phases[idp].emails.sort(byDateAsc);
		const requestProbe = statusFromEmails("request", phases.request.emails, {
			requestDone: false,
			reviewDone: false,
			cprEligible: def?.cprEligible ?? true
		});
		const requestDone = isDone(requestProbe);
		const reviewProbe = statusFromEmails("review", phases.review.emails, {
			requestDone,
			reviewDone: false,
			cprEligible: def?.cprEligible ?? true
		});
		const reviewDone = isDone(reviewProbe) || requestProbe === "exhausted" && phases.review.emails.length === 0;
		const cprEligible = def?.cprEligible ?? true;
		phases.request.status = requestProbe;
		phases.review.status = reviewProbe;
		phases.cpr.status = statusFromEmails("cpr", phases.cpr.emails, {
			requestDone,
			reviewDone,
			cprEligible
		});
		if (!cprEligible && phases.cpr.emails.length === 0) {
			phases.cpr.status = "not_started";
			phases.cpr.note = "CPR 31.16 is aimed at a likely party to proceedings, not this correspondent.";
		}
		const all = bucket.emails;
		const last = [...all].sort(byDateAsc).at(-1) ?? null;
		const domainName = id.startsWith("domain:") ? id.slice(7) : id;
		parties.push({
			id,
			name: def?.name ?? domainName,
			shortName: def?.shortName ?? domainName,
			org: def?.org,
			kind: def?.kind ?? "other",
			domains: def?.domains ?? [domainName],
			aliases: def?.aliases ?? [],
			refs: def?.refs ?? [],
			regime: def?.regime ?? detectRegime(bucket.raw),
			cprEligible,
			phases,
			lastActivity: last?.date ?? null,
			emailCount: all.length,
			sentCount: all.filter((e) => e.direction === "sent").length,
			receivedCount: all.filter((e) => e.direction === "received").length,
			currentStage: currentStage(phases)
		});
	}
	parties.sort((a, b) => ts(b.lastActivity ?? "") - ts(a.lastActivity ?? ""));
	return parties;
}
function buildDocket(raw, meta) {
	return {
		...meta,
		parties: buildParties(raw)
	};
}
//#endregion
export { redirectToLoginIfRequired as i, buildDocket as n, classifyCallToolError as r, PHASE_ORDER as t };
