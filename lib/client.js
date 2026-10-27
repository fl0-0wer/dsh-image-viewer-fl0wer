window.__ModuleLoader__.load({
	id: "dsh-image-viewer-fl0wer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		_deepseek_ai_dsh_client_ui_primitives = __toESM(_deepseek_ai_dsh_client_ui_primitives, 1);
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/viewer.js
		const boundedNumber = (value, fallback) => Number.isFinite(value) && value > 0 ? value : fallback;
		const downloadOf = (value) => typeof value?.onInvoke === "function" ? {
			pendingLabel: typeof value.pendingLabel === "string" && value.pendingLabel !== "" ? value.pendingLabel : void 0,
			errorLabel: typeof value.errorLabel === "string" && value.errorLabel !== "" ? value.errorLabel : void 0,
			onInvoke: value.onInvoke
		} : void 0;
		const actionsOf = (value) => Array.isArray(value) ? value.flatMap((action, position) => {
			if (typeof action?.onInvoke !== "function" || typeof action?.label !== "string" || action.label.trim() === "") return [];
			return [{
				id: typeof action.id === "string" && action.id !== "" ? action.id : `action-${position + 1}`,
				label: action.label,
				pendingLabel: typeof action.pendingLabel === "string" && action.pendingLabel !== "" ? action.pendingLabel : action.label,
				errorLabel: typeof action.errorLabel === "string" && action.errorLabel !== "" ? action.errorLabel : action.label,
				closeOnSuccess: action.closeOnSuccess === true,
				onInvoke: action.onInvoke
			}];
		}) : [];
		function normalizeViewerRequest(request) {
			const items = (Array.isArray(request?.items) ? request.items : []).flatMap((item, position) => {
				if (typeof item?.src !== "string" || item.src === "") return [];
				return [{
					id: typeof item.id === "string" && item.id !== "" ? item.id : item.src,
					src: item.src,
					fallbacks: Array.isArray(item.fallbacks) ? item.fallbacks.flatMap((value) => typeof value === "string" && value.trim() !== "" && value.trim() !== item.src ? [value.trim()] : []) : [],
					name: typeof item.name === "string" && item.name !== "" ? item.name : `Image ${position + 1}`,
					width: boundedNumber(item.width, void 0),
					height: boundedNumber(item.height, void 0),
					bytes: boundedNumber(item.bytes, void 0),
					download: downloadOf(item.download),
					actions: actionsOf(item.actions)
				}];
			});
			if (items.length === 0) return void 0;
			const requestedIndex = Number.isInteger(request?.index) ? request.index : 0;
			return {
				items,
				index: Math.max(0, Math.min(items.length - 1, requestedIndex)),
				opener: typeof HTMLElement !== "undefined" && request?.opener instanceof HTMLElement ? request.opener : void 0,
				source: typeof request?.source === "string" ? request.source : "dsh",
				annotations: request?.annotations !== false,
				commitAnnotations: typeof request?.commitAnnotations === "function" ? request.commitAnnotations : void 0
			};
		}
		var NativeImageViewerService = class {
			#listeners = /* @__PURE__ */ new Set();
			#revision = 0;
			#snapshot;
			#annotationsByImage = /* @__PURE__ */ new Map();
			#openingAnnotations = /* @__PURE__ */ new Map();
			#closing = false;
			constructor() {
				this.subscribe = (listener) => {
					this.#listeners.add(listener);
					return () => {
						this.#listeners.delete(listener);
					};
				};
				this.getSnapshot = () => this.#snapshot;
				this.getAnnotationsSnapshot = () => Object.fromEntries([...this.#annotationsByImage].map(([id, annotations]) => [id, annotations.map((annotation) => ({ ...annotation }))]));
			}
			setAnnotations(imageId, annotations) {
				if (typeof imageId !== "string" || imageId === "" || !Array.isArray(annotations)) return;
				if (annotations.length === 0) this.#annotationsByImage.delete(imageId);
				else this.#annotationsByImage.set(imageId, annotations.map((annotation) => ({ ...annotation })));
			}
			open(request) {
				if (this.#closing) return false;
				const normalized = normalizeViewerRequest(request);
				if (normalized === void 0) return false;
				this.#revision += 1;
				this.#snapshot = {
					...normalized,
					revision: this.#revision
				};
				this.#openingAnnotations = new Map(normalized.items.map((item) => [item.id, JSON.stringify(this.#annotationsByImage.get(item.id) || [])]));
				this.#emit();
				return true;
			}
			async close({ discard = false } = {}) {
				if (this.#snapshot === void 0) return;
				if (this.#closing) return;
				const pending = this.#snapshot.items.map((item) => ({
					item,
					annotations: this.#annotationsByImage.get(item.id) || []
				})).filter(({ item, annotations }) => annotations.some((note) => note.note.trim()) && JSON.stringify(annotations) !== this.#openingAnnotations.get(item.id));
				if (!discard && pending.length && this.#snapshot.commitAnnotations) {
					this.#closing = true;
					this.#snapshot = {
						...this.#snapshot,
						committing: true,
						commitError: false
					};
					this.#emit();
					try {
						await this.#snapshot.commitAnnotations(pending);
					} catch {
						this.#snapshot = {
							...this.#snapshot,
							committing: false,
							commitError: true
						};
						this.#closing = false;
						this.#emit();
						return false;
					}
					this.#closing = false;
				}
				const opener = this.#snapshot.opener;
				this.#snapshot = void 0;
				this.#emit();
				if (typeof window === "undefined") opener?.focus();
				else window.requestAnimationFrame(() => {
					opener?.focus();
				});
			}
			#emit() {
				for (const listener of this.#listeners) listener();
			}
		};
		// 缩略图升级：插件市场 / README 卡片上的图是 images.weserv.nl 缩略代理（h=200 / h=520），
		// 直接送进查看器等于把 200px 的图放大到全屏 → 一片模糊。
		// 候选链：元素声明的全尺寸源 → 同一 weserv 代理去掉 h/w 取原图 → weserv 拆包后的原始 URL → 原缩略图兜底。
		const WESERV_HOST = /(^|\.)images\.weserv\.nl$/iu;
		const proxiedTarget = (src) => {
			if (typeof src !== "string" || src === "") return void 0;
			try {
				const url = new URL(src, globalThis.location?.href ?? void 0);
				if (!WESERV_HOST.test(url.hostname)) return void 0;
				const target = url.searchParams.get("url");
				if (target === null || target.trim() === "") return void 0;
				return /^https?:\/\//iu.test(target) ? target : `https://${target}`;
			} catch {
				return void 0;
			}
		};
		const upgradeProxiedThumbnail = (src) => {
			if (typeof src !== "string" || src === "") return void 0;
			try {
				const url = new URL(src, globalThis.location?.href ?? void 0);
				if (!WESERV_HOST.test(url.hostname)) return void 0;
				if (url.searchParams.get("url") === null) return void 0;
				url.searchParams.delete("h");
				url.searchParams.delete("w");
				url.searchParams.set("fit", "inside");
				url.searchParams.set("we", "1");
				return url.href;
			} catch {
				return void 0;
			}
		};
		const imageSourceCandidates = (image) => {
			const list = [];
			const push = (value) => {
				if (typeof value !== "string") return;
				const trimmed = value.trim();
				if (trimmed === "" || list.includes(trimmed)) return;
				list.push(trimmed);
			};
			push(image?.dataset?.nivSrc ?? image?.closest?.("[data-niv-src]")?.getAttribute("data-niv-src") ?? "");
			const current = image?.currentSrc || image?.src || "";
			push(upgradeProxiedThumbnail(current));
			push(proxiedTarget(current));
			push(current);
			return list;
		};
		const fullImageSource = (image) => imageSourceCandidates(image)[0] ?? "";
		const itemSources = (item) => [...new Set([item?.src, ...(Array.isArray(item?.fallbacks) ? item.fallbacks : [])].filter((value) => typeof value === "string" && value !== ""))];
		const itemSourceAt = (item, index) => {
			const sources = itemSources(item);
			if (sources.length === 0) return "";
			return sources[Math.max(0, Math.min(sources.length - 1, index))];
		};
		function nativeImageButton(target) {
			if (!(target instanceof Element)) return void 0;
			const button = target.closest("button");
			if (button instanceof HTMLButtonElement) {
				const image = button.querySelector(":scope > img");
				if (image instanceof HTMLImageElement && fullImageSource(image) !== "") {
					if (button.matches("[data-variant=\"single\"],[data-variant=\"tile\"]")) return {
						button,
						image,
						group: button.parentElement,
						kind: "message"
					};
					const rail = button.closest("[role=\"group\"]");
					if (rail !== null && button.hasAttribute("title")) return {
						button,
						image,
						group: rail,
						kind: "composer"
					};
				}
			}
			// markdown / 内联正文图（无 data-variant 按钮包裹）也走查看器，别落到内置灯箱
			const inline = target instanceof HTMLImageElement ? target : target.closest("img");
			if (!(inline instanceof HTMLImageElement) || fullImageSource(inline) === "") return void 0;
			if (inline.closest(".niv-root,[data-niv-ignore]") !== null) return void 0;
			if (Math.max(inline.naturalWidth, inline.naturalHeight) < 200) return void 0;
			return {
				button: inline,
				image: inline,
				group: inline.parentElement,
				kind: "message"
			};
		}
		function imageItemsForButton(match) {
			const selector = match.kind === "message" ? ":scope > button[data-variant=\"single\"],:scope > button[data-variant=\"tile\"]" : "button[title]";
			const candidates = [...match.group?.querySelectorAll(selector) ?? []].flatMap((button, index) => {
				if (match.kind === "composer" && button.closest("[role=\"group\"]") !== match.group) return [];
				const image = button.querySelector(":scope > img");
				if (!(image instanceof HTMLImageElement)) return [];
				const candidates = imageSourceCandidates(image);
				if (candidates.length === 0) return [];
				return [{
					id: candidates[0],
					src: candidates[0],
					fallbacks: candidates.slice(1),
					name: image.alt || `Image ${index + 1}`,
					width: image.naturalWidth || void 0,
					height: image.naturalHeight || void 0,
					button
				}];
			});
			const fallbackChain = imageSourceCandidates(match.image);
			const items = candidates.length > 0 ? candidates : [{
				id: fallbackChain[0] ?? "",
				src: fallbackChain[0] ?? "",
				fallbacks: fallbackChain.slice(1),
				name: match.image.alt || "Image",
				width: match.image.naturalWidth || void 0,
				height: match.image.naturalHeight || void 0,
				button: match.button
			}];
			const index = Math.max(0, items.findIndex((item) => item.button === match.button));
			return {
				items: items.map(({ button: _button, ...item }) => item),
				index
			};
		}
		//#endregion
		//#region src/styles.js
		const CSS$1 = String.raw`
.niv-draft-status{position:absolute;top:calc(76px + var(--niv-chrome-inset,0px));left:50%;transform:translateX(-50%);z-index:10;max-width:calc(100% - 48px);padding:10px 16px;border-radius:12px;background:#26272a;color:#fff;font-size:13px;line-height:20px}
.niv-root{--niv-chrome-inset:40px;position:fixed;inset:0;z-index:1000;pointer-events:auto;overflow:hidden;background:rgba(7,8,10,.68);color:var(--dsw-alias-label-primary-inverted,#fff);outline:0;backdrop-filter:blur(13px) saturate(.72);-webkit-backdrop-filter:blur(13px) saturate(.72)}
.niv-sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
.niv-title{position:absolute;top:calc(20px + var(--niv-chrome-inset,0px));left:24px;right:84px;display:flex;align-items:baseline;gap:12px;color:#fff;font-size:13px}.niv-title strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.niv-title small{flex:none;opacity:.7}.niv-load-status{position:absolute;z-index:7;display:flex;align-items:center;gap:12px;color:#fff;font-size:14px}
.niv-topbar{position:absolute;right:50%;bottom:22px;z-index:6;max-width:calc(100vw - 36px);padding:5px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(38,39,43,.86);box-shadow:0 10px 34px rgba(0,0,0,.3);transform:translateX(50%);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.niv-actions{display:flex;align-items:center;gap:2px;overflow-x:auto;scrollbar-width:none}.niv-actions::-webkit-scrollbar{display:none}.niv-button,.niv-download{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 10px;border:0;border-radius:999px;background:transparent;color:rgba(255,255,255,.9);font:inherit;font-size:12px;text-decoration:none;white-space:nowrap;cursor:pointer}.niv-button:hover,.niv-download:hover,.niv-button[data-active=true]{background:rgba(255,255,255,.12)}.niv-button:focus-visible,.niv-download:focus-visible,.niv-close-floating:focus-visible{outline:2px solid rgba(255,255,255,.9);outline-offset:2px}.niv-button:disabled,.niv-download:disabled{opacity:.38;cursor:default}.niv-icon-only{width:32px;padding:0}.niv-zoom{min-width:44px;color:rgba(255,255,255,.68);font-size:12px;font-variant-numeric:tabular-nums;text-align:center}
.niv-close-floating{position:absolute;top:calc(20px + var(--niv-chrome-inset,0px));right:20px;z-index:8;display:grid;place-items:center;width:42px;height:42px;padding:0;border:1px solid rgba(255,255,255,.1);border-radius:50%;background:rgba(48,49,53,.82);box-shadow:0 8px 24px rgba(0,0,0,.28);color:#fff;cursor:pointer;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}.niv-close-floating:hover{background:rgba(66,67,72,.92)}
.niv-workspace{position:absolute;inset:0;display:grid;min-width:0;min-height:0;padding:calc(68px + var(--niv-chrome-inset,0px)) 24px 72px;box-sizing:border-box}
.niv-stage{position:relative;display:grid;place-items:center;min-width:0;min-height:0;overflow:hidden;padding:0;touch-action:none;user-select:none}.niv-stage[data-dragging=true]{cursor:grabbing}.niv-stage[data-annotating=true]{cursor:crosshair}
.niv-surface{position:relative;display:inline-flex;max-width:100%;max-height:100%;transform-origin:center;will-change:transform}.niv-image{display:block;max-width:calc(100vw - 72px);max-height:calc(100vh - 154px - var(--niv-chrome-inset,0px));border-radius:12px;object-fit:contain;box-shadow:0 22px 60px rgba(0,0,0,.46);user-select:none;-webkit-user-drag:none}
.niv-annotation{position:absolute;z-index:5;width:24px;height:24px;transform-origin:center;pointer-events:none}.niv-pin{position:absolute;inset:0;display:grid;place-items:center;width:24px;height:24px;padding:0;border:2px solid #fff;border-radius:50%;background:rgba(23,24,27,.94);box-shadow:0 4px 16px rgba(0,0,0,.35);color:#fff;font:inherit;font-size:11px;font-weight:700;cursor:pointer;pointer-events:auto}.niv-pin[data-active=true]{background:var(--dsw-alias-state-business-primary,#3964fe)}
.niv-inline-note{position:absolute;bottom:34px;box-sizing:border-box;display:grid;width:min(300px,calc(100vw - 40px));grid-template-columns:24px minmax(0,1fr) 24px;align-items:center;gap:7px;padding:7px 8px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(32,33,37,.94);box-shadow:0 14px 38px rgba(0,0,0,.38);color:#fff;pointer-events:auto;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}.niv-annotation[data-x=right] .niv-inline-note{left:-8px}.niv-annotation[data-x=left] .niv-inline-note{right:-8px}.niv-annotation[data-x=center] .niv-inline-note{left:50%;transform:translateX(-50%)}.niv-annotation[data-y=down] .niv-inline-note{top:34px;bottom:auto}.niv-inline-note::after{position:absolute;width:9px;height:9px;background:rgba(32,33,37,.94);content:'';transform:rotate(45deg)}.niv-annotation[data-y=up] .niv-inline-note::after{bottom:-5px}.niv-annotation[data-y=down] .niv-inline-note::after{top:-5px}.niv-annotation[data-x=right] .niv-inline-note::after{left:13px}.niv-annotation[data-x=left] .niv-inline-note::after{right:13px}.niv-annotation[data-x=center] .niv-inline-note::after{left:calc(50% - 4px)}.niv-inline-index{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--dsw-alias-state-business-primary,#3964fe);color:#fff;font-size:10px;font-weight:700}.niv-inline-note textarea{box-sizing:border-box;width:100%;min-height:24px;max-height:92px;resize:none;overflow:auto;border:0;outline:0;background:transparent;color:#fff;font:inherit;font-size:12px;line-height:18px}.niv-inline-note textarea::placeholder{color:rgba(255,255,255,.44)}.niv-note-remove{display:grid;place-items:center;width:24px;height:24px;padding:0;border:0;border-radius:50%;background:transparent;color:rgba(255,255,255,.68);cursor:pointer}.niv-note-remove:hover{background:rgba(255,255,255,.1);color:#fff}
.niv-nav{position:absolute;top:50%;z-index:4;width:42px;height:42px;padding:0;transform:translateY(-50%);background:rgba(48,49,53,.82);box-shadow:0 8px 24px rgba(0,0,0,.28);backdrop-filter:blur(16px)}.niv-prev{left:6px}.niv-next{right:6px}.niv-counter{position:absolute;bottom:8px;left:50%;padding:5px 10px;border-radius:999px;background:rgba(38,39,43,.86);color:rgba(255,255,255,.72);font-size:11px;transform:translateX(-50%);backdrop-filter:blur(16px)}
.niv-hint{display:none}
@media(max-width:760px){.niv-root{--niv-chrome-inset:0px}.niv-close-floating{top:12px;right:12px;width:40px;height:40px}.niv-workspace{padding:60px 12px 68px}.niv-image{max-width:calc(100vw - 24px);max-height:calc(100vh - 136px)}.niv-topbar{bottom:12px;max-width:calc(100vw - 24px)}.niv-button{padding:0 8px}.niv-button span.niv-label{display:none}.niv-inline-note{width:min(260px,calc(100vw - 40px))}}
@media(prefers-reduced-motion:reduce){.niv-surface{transition:none}}
.niv-surface[data-inking=true]{cursor:crosshair}
.niv-ink{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.niv-ink polyline{fill:none;stroke-linecap:round;stroke-linejoin:round}
.niv-pen{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 9px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(38,39,43,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.niv-swatch{width:17px;height:17px;padding:0;border:2px solid rgba(255,255,255,.32);border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer}
.niv-swatch[data-active=true]{border-color:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.38),0 1px 4px rgba(0,0,0,.4)}
`;
		//#endregion
		//#region src/image-transform.js
		const clamp$1 = (value, min, max) => Math.min(max, Math.max(min, value));
		const fitted = () => ({
			zoom: 1,
			x: 0,
			y: 0
		});
		function useImageTransform(identity) {
			const [transform, setTransform] = (0, react.useState)(fitted);
			const [dragging, setDragging] = (0, react.useState)(false);
			const [pixelScale, setPixelScale] = (0, react.useState)(1);
			const [geometry, setGeometry] = (0, react.useState)({
				width: 0,
				height: 0,
				stageWidth: 0,
				stageHeight: 0
			});
			const stageRef = (0, react.useRef)(null), surfaceRef = (0, react.useRef)(null), imageRef = (0, react.useRef)(null);
			const transformRef = (0, react.useRef)(transform);
			const pointers = (0, react.useRef)(/* @__PURE__ */ new Map()), gesture = (0, react.useRef)();
			transformRef.current = transform;
			const resetGesture = (0, react.useCallback)(() => {
				pointers.current.clear();
				gesture.current = void 0;
				setDragging(false);
			}, []);
			const fit = (0, react.useCallback)(() => {
				resetGesture();
				setTransform(fitted());
			}, [resetGesture]);
			(0, react.useEffect)(() => {
				fit();
			}, [identity, fit]);
			const actualScale = () => imageRef.current?.naturalWidth / Math.max(1, surfaceRef.current?.offsetWidth || 1) || 1;
			const boundedPan = (0, react.useCallback)((zoom, x, y) => {
				const stage = stageRef.current, surface = surfaceRef.current;
				if (!stage || !surface || zoom <= 1) return {
					x: 0,
					y: 0
				};
				const limitX = Math.max(0, (surface.offsetWidth * zoom - stage.clientWidth) / 2);
				const limitY = Math.max(0, (surface.offsetHeight * zoom - stage.clientHeight) / 2);
				return {
					x: clamp$1(x, -limitX, limitX),
					y: clamp$1(y, -limitY, limitY)
				};
			}, []);
			const setZoomAt = (0, react.useCallback)((zoom, clientX, clientY) => {
				const stage = stageRef.current;
				if (!stage) return;
				setTransform((current) => {
					const next = clamp$1(zoom, .5, Math.max(8, actualScale()));
					const box = stage.getBoundingClientRect();
					const px = clientX - box.left - box.width / 2, py = clientY - box.top - box.height / 2;
					const ratio = next / current.zoom;
					return {
						zoom: next,
						...boundedPan(next, px - (px - current.x) * ratio, py - (py - current.y) * ratio)
					};
				});
			}, [boundedPan]);
			const actual = (0, react.useCallback)(() => {
				if (!imageRef.current?.naturalWidth) return;
				resetGesture();
				setTransform({
					zoom: actualScale(),
					x: 0,
					y: 0
				});
			}, [resetGesture]);
			const measure = (0, react.useCallback)(() => {
				const next = {
					width: surfaceRef.current?.offsetWidth ?? 0,
					height: surfaceRef.current?.offsetHeight ?? 0,
					stageWidth: stageRef.current?.clientWidth ?? 0,
					stageHeight: stageRef.current?.clientHeight ?? 0
				};
				setGeometry((current) => Object.keys(next).every((key) => current[key] === next[key]) ? current : next);
				setPixelScale(1 / actualScale());
				setTransform((current) => ({
					...current,
					...boundedPan(current.zoom, current.x, current.y)
				}));
			}, [boundedPan]);
			(0, react.useEffect)(() => {
				if (!stageRef.current || !surfaceRef.current) return;
				const observer = new ResizeObserver(measure);
				observer.observe(stageRef.current);
				observer.observe(surfaceRef.current);
				measure();
				return () => observer.disconnect();
			}, [identity, measure]);
			(0, react.useEffect)(() => {
				const stage = stageRef.current;
				if (!stage) return;
				const wheel = (event) => {
					event.preventDefault();
					const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1);
					setZoomAt(transformRef.current.zoom * Math.exp(-delta * .0015), event.clientX, event.clientY);
				};
				stage.addEventListener("wheel", wheel, { passive: false });
				return () => stage.removeEventListener("wheel", wheel);
			}, [identity, setZoomAt]);
			const onPointerDown = (event) => {
				if (event.button !== 0 || event.target.closest("button,a,input,textarea,select")) return;
				const current = transformRef.current;
				if (event.pointerType === "mouse" && current.zoom <= 1) return;
				event.currentTarget.setPointerCapture(event.pointerId);
				pointers.current.set(event.pointerId, {
					x: event.clientX,
					y: event.clientY
				});
				if (pointers.current.size === 2) {
					const [a, b] = [...pointers.current.values()];
					gesture.current = {
						kind: "pinch",
						distance: Math.hypot(a.x - b.x, a.y - b.y),
						transform: current
					};
				} else gesture.current = {
					kind: "pan",
					x: event.clientX,
					y: event.clientY,
					transform: current
				};
				setDragging(true);
			};
			const onPointerMove = (event) => {
				if (!pointers.current.has(event.pointerId)) return;
				pointers.current.set(event.pointerId, {
					x: event.clientX,
					y: event.clientY
				});
				const start = gesture.current;
				if (start?.kind === "pinch" && pointers.current.size >= 2) {
					const [a, b] = [...pointers.current.values()];
					setZoomAt(start.transform.zoom * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, start.distance), (a.x + b.x) / 2, (a.y + b.y) / 2);
				} else if (start?.kind === "pan") setTransform({
					zoom: start.transform.zoom,
					...boundedPan(start.transform.zoom, start.transform.x + event.clientX - start.x, start.transform.y + event.clientY - start.y)
				});
			};
			const endPointer = (event) => {
				pointers.current.delete(event.pointerId);
				const remaining = [...pointers.current.values()][0];
				if (remaining) gesture.current = {
					kind: "pan",
					...remaining,
					transform: transformRef.current
				};
				else resetGesture();
			};
			return {
				transform,
				transformRef,
				dragging,
				pixelScale,
				geometry,
				stageRef,
				surfaceRef,
				imageRef,
				fit,
				actual,
				measure,
				setZoomAt,
				resetGesture,
				pointerHandlers: {
					onPointerDown,
					onPointerMove,
					onPointerUp: endPointer,
					onPointerCancel: endPointer,
					onLostPointerCapture: endPointer
				}
			};
		}
		//#endregion
		//#region src/image-download.js
		function downloadPercent(value) {
			const { loaded, total } = value ?? {};
			if (!Number.isFinite(loaded) || loaded < 0 || !Number.isFinite(total) || total <= 0) return void 0;
			return Math.min(100, Math.floor(loaded / total * 100));
		}
		async function readImageBlob(src, { signal, onProgress }) {
			const response = await fetch(src, { signal });
			if (!response.ok) throw new Error(`Image download failed: ${response.status}`);
			if (!response.body) return response.blob();
			const length = response.headers.get("content-encoding") ? void 0 : Number(response.headers.get("content-length"));
			const total = Number.isFinite(length) && length > 0 ? length : void 0;
			const reader = response.body.getReader();
			const chunks = [];
			let loaded = 0;
			try {
				while (true) {
					signal.throwIfAborted();
					const { done, value } = await reader.read();
					if (done) break;
					chunks.push(value);
					loaded += value.byteLength;
					onProgress({
						loaded,
						total
					});
				}
				signal.throwIfAborted();
				return new Blob(chunks, { type: response.headers.get("content-type") || "" });
			} finally {
				reader.releaseLock();
			}
		}
		async function readImageBlobWithFallback(item, options) {
			const sources = [item?.src, ...(Array.isArray(item?.fallbacks) ? item.fallbacks : [])].filter((value) => typeof value === "string" && value !== "");
			let lastError;
			for (const source of sources) {
				try {
					return await readImageBlob(source, options);
				} catch (error) {
					lastError = error;
					if (options?.signal?.aborted) throw error;
				}
			}
			throw lastError ?? new Error("Image download failed");
		}
		//#endregion
		//#region src/annotation-draft.js
		const INK_COLORS = {
			red: "#ef4444",
			blue: "#3b82f6",
			white: "#ffffff"
		};
		const inkRegistry = /* @__PURE__ */ new Map();
		function inkFor(source) {
			return [...inkRegistry.get(source) ?? []];
		}
		async function copyImageToClipboard(blob) {
			if (typeof navigator === "undefined" || navigator.clipboard?.write === void 0 || typeof ClipboardItem === "undefined") throw new Error("Clipboard image write unavailable");
			await navigator.clipboard.write([new ClipboardItem({ [blob.type || "image/png"]: blob })]);
		}
		async function renderAnnotationImage(blob, annotations, strokes, source) {
			const inkStrokes = Array.isArray(strokes) ? strokes : source === void 0 ? [] : inkFor(source);
			const image = await createImageBitmap(blob);
			try {
				const canvas = document.createElement("canvas");
				canvas.width = image.width;
				canvas.height = image.height;
				const context = canvas.getContext("2d");
				if (!context) throw new Error("Canvas unavailable");
				context.drawImage(image, 0, 0);
				const inkWidth = Math.max(2, Math.min(image.width, image.height) * .006);
				inkStrokes.forEach((stroke) => {
					if (Array.isArray(stroke?.points) === false || stroke.points.length < 2) return;
					context.beginPath();
					context.lineWidth = inkWidth;
					context.strokeStyle = INK_COLORS[stroke.color] ?? INK_COLORS.red;
					context.lineCap = "round";
					context.lineJoin = "round";
					stroke.points.forEach((point, position) => {
						const x = point.x * image.width;
						const y = point.y * image.height;
						if (position === 0) context.moveTo(x, y);
						else context.lineTo(x, y);
					});
					context.stroke();
				});
				const radius = Math.max(12, Math.min(image.width, image.height) / 60);
				annotations.forEach((annotation, index) => {
					const x = Math.max(radius, Math.min(image.width - radius, annotation.x * image.width));
					const y = Math.max(radius, Math.min(image.height - radius, annotation.y * image.height));
					context.beginPath();
					context.arc(x, y, radius, 0, Math.PI * 2);
					context.fillStyle = "#26272a";
					context.fill();
					context.strokeStyle = "#ffffff";
					context.lineWidth = Math.max(2, radius / 7);
					context.stroke();
					context.fillStyle = "#ffffff";
					context.font = `600 ${radius}px sans-serif`;
					context.textAlign = "center";
					context.textBaseline = "middle";
					context.fillText(String(index + 1), x, y);
				});
				return await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(/* @__PURE__ */ new Error("Image encoding failed")), "image/png"));
			} finally {
				image.close();
			}
		}
		const hasOwn = Object.prototype.hasOwnProperty;
		function currentSessionId(snapshot) {
			if (snapshot !== null && typeof snapshot === "object" && hasOwn.call(snapshot, "current")) return snapshot.current;
			const retained = Object.entries(snapshot?.byId ?? {}).filter(([, entry]) => (entry?.retainedBy?.mainView ?? 0) > 0);
			return retained.length === 1 ? retained[0][0] : void 0;
		}
		function createAnnotationCommit(ctx, { readBlob, render = renderAnnotationImage, formatNotes }) {
			let sessions, conversation, sessionId;
			try {
				sessions = ctx.get("sessions");
				conversation = ctx.get("conversation");
				sessionId = currentSessionId(sessions.list.getSnapshot());
			} catch {}
			return async (entries) => {
				if (!sessionId || !conversation?.input?.for || currentSessionId(sessions.list.getSnapshot()) !== sessionId) throw new Error("Composer unavailable or session changed");
				const prepared = await Promise.all(entries.map(async ({ item, annotations }) => {
					const sources = [item.src, ...(Array.isArray(item.fallbacks) ? item.fallbacks : [])];
					let blob, readError;
					for (const source of sources) {
						try {
							blob = await readBlob(source);
							break;
						} catch (error) {
							readError = error;
						}
					}
					if (blob === void 0) throw readError;
					const image = await render(blob, annotations, void 0, item.src);
					const name = `${String(item.name || "image").replace(/\.[^.]+$/, "")}-annotated.png`;
					await copyImageToClipboard(image).catch(() => {});
					return {
						file: new File([image], name, { type: "image/png" }),
						text: `${name}\n${formatNotes(annotations)}`
					};
				}));
				if (currentSessionId(sessions.list.getSnapshot()) !== sessionId) throw new Error("Session changed");
				const input = conversation.input.for(sessions.scope(sessionId));
				const state = input.state.getSnapshot();
				if (state.phase !== "plain" || state.occurrences?.length) throw new Error("Composer busy or contains references");
				const modern = typeof conversation.createDrafts === "function";
				const add = modern ? input.addAttachments : input.addImages;
				const release = modern ? conversation.releaseDraftAttachments : conversation.releaseDraftImages;
				if (typeof add !== "function" || typeof release !== "function") throw new Error("Composer unavailable");
				const created = modern ? conversation.createDrafts(sessionId, prepared.map((item) => item.file)) : conversation.createDraftImages(prepared.map((item) => item.file));
				try {
					if (!add.call(input, created.map((item) => item.id))) throw new Error("Composer busy");
				} catch (error) {
					release.call(conversation, created);
					throw error;
				}
				input.setDraft([state.draft, ...prepared.map((item) => item.text)].filter(Boolean).join("\n\n"));
			};
		}
		//#endregion
		//#region src/client.jsx
		const IconChevronLeftOutline14 = _deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineRegular ?? _deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutline14;
		const IconChevronRightOutline14 = _deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular ?? _deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14;
		const IconCloseOutline16 = _deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular ?? _deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16;
		const IconCopyOutline16 = _deepseek_ai_dsh_client_ui_primitives.IconCopyOutlineRegular ?? _deepseek_ai_dsh_client_ui_primitives.IconCopyOutline16;
		const IconDownloadOutline16 = _deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular ?? _deepseek_ai_dsh_client_ui_primitives.IconDownloadOutline16;
		const IconEditOutline16 = _deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular ?? _deepseek_ai_dsh_client_ui_primitives.IconEditOutline16;
		const IconFullscreenOutline16 = _deepseek_ai_dsh_client_ui_primitives.IconFullscreenOutlineRegular ?? _deepseek_ai_dsh_client_ui_primitives.IconFullscreenOutline16;
		const name = "dsh-image-viewer";
		const inject = ["locale", "slots"];
		const LOCALES = {
			en: {
				addingDraft: "Adding image and notes to draft…",
				draftFailed: "Could not add to draft. Return to the original session and keep the composer editable, then close to retry.",
				closeWithoutDraft: "Close without adding",
				dialog: "Image viewer",
				close: "Close",
				fit: "Fit",
				actual: "100%",
				download: "Download",
				annotate: "Draw",
				cancelAnnotate: "Stop drawing",
				regions: "Region notes",
				regionHint: "Click a point on the image, then add a note.",
				note: "Region {value}",
				notePlaceholder: "Describe what should change here…",
				removeNote: "Remove region note",
				hideNotes: "Hide notes",
				copyNotes: "Copy notes",
				copied: "Copied",
				previous: "Previous image",
				next: "Next image",
				zoomHint: "Wheel to zoom · drag to pan · double-click for 100%",
				preparing: "Preparing…",
				failed: "Could not prepare this image.",
				cancelDownload: "Cancel download",
				cancel: "Cancel",
				loading: "Loading image…",
				loadFailed: "Image could not be loaded.",
				retry: "Retry",
				copyFailed: "Copy failed. Try again.",
				penColor: "Pen color",
				pen_red: "Red pen",
				pen_blue: "Blue pen",
				pen_white: "White pen",
				save: "Save",
				saving: "Saving…",
				saved: "Saved · copied",
				saveFailed: "Save failed"
			},
			zh: {
				addingDraft: "正在把图片和备注加入草稿…",
				draftFailed: "未能加入草稿。请回到原会话并确保输入框可编辑，再关闭以重试。",
				closeWithoutDraft: "仅关闭，不加入草稿",
				dialog: "图片查看器",
				close: "关闭",
				fit: "适应窗口",
				actual: "原始大小",
				download: "下载",
				annotate: "画笔",
				cancelAnnotate: "退出画笔",
				regions: "区域备注",
				regionHint: "点击图片中的位置，然后填写备注。",
				note: "区域 {value}",
				notePlaceholder: "描述这里需要怎样调整…",
				removeNote: "删除区域备注",
				hideNotes: "收起备注",
				copyNotes: "复制备注",
				copied: "已复制",
				previous: "上一张图片",
				next: "下一张图片",
				zoomHint: "滚轮缩放 · 拖动查看 · 双击切换原始大小",
				preparing: "正在准备…",
				failed: "暂时无法准备这张图片。",
				cancelDownload: "取消下载",
				cancel: "取消",
				loading: "正在加载图片…",
				loadFailed: "图片加载失败。",
				retry: "重试",
				copyFailed: "复制失败，请重试。",
				penColor: "画笔颜色",
				pen_red: "红色笔",
				pen_blue: "蓝色笔",
				pen_white: "白色笔",
				save: "复制到剪贴板",
				saving: "保存中…",
				saved: "已复制到剪贴板",
				saveFailed: "保存失败"
			}
		};
		const fill = (value, variables) => Object.entries(variables).reduce((text, [key, replacement]) => text.replaceAll(`{${key}}`, String(replacement)), value);
		const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
		const bytesLabel = (bytes) => bytes === void 0 ? void 0 : bytes < 1048576 ? `${Math.max(.1, bytes / 1024).toLocaleString(void 0, { maximumFractionDigits: 1 })} KB` : `${(bytes / 1024 / 1024).toLocaleString(void 0, { maximumFractionDigits: 1 })} MB`;
		const downloadName = (name) => {
			const cleaned = String(name || "image.png").replace(/[<>:"/\\|?*\u0000-\u001f]/gu, "-").replace(/[. ]+$/u, "").trim();
			return cleaned === "" ? "image.png" : cleaned;
		};
		const noteText = (annotations, t) => annotations.map((annotation, index) => {
			return `${fill(t("note"), { value: index + 1 })} (${Math.round(annotation.x * 100)}%, ${Math.round(annotation.y * 100)}%): ${annotation.note.trim()}`;
		}).filter((line) => !line.endsWith(": ")).join("\n");
		function ViewerAction({ action, annotations, item, service, revision }) {
			const [state, setState] = (0, react.useState)("idle");
			const active = (0, react.useRef)(true);
			(0, react.useEffect)(() => {
				active.current = true;
				return () => {
					active.current = false;
				};
			}, []);
			const invoke = async () => {
				if (state === "pending") return;
				setState("pending");
				try {
					await action.onInvoke({
						annotations,
						item,
						src: item.src
					});
					if (!active.current || service.getSnapshot()?.revision !== revision) return;
					setState("idle");
					if (action.closeOnSuccess) service.close();
				} catch {
					if (active.current) setState("failed");
				}
			};
			const label = state === "pending" ? action.pendingLabel : state === "failed" ? action.errorLabel : action.label;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "niv-button",
				disabled: state === "pending",
				onClick: () => {
					invoke();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "niv-label",
					children: label
				})
			});
		}
		function ViewerDownload({ download, item, t }) {
			const [state, setState] = (0, react.useState)("idle");
			const [progress, setProgress] = (0, react.useState)(void 0);
			const controller = (0, react.useRef)(null);
			(0, react.useEffect)(() => () => {
				controller.current?.abort();
				controller.current = null;
			}, [
				item.id,
				item.src,
				download
			]);
			const invoke = async () => {
				if (controller.current !== null) {
					controller.current.abort();
					controller.current = null;
					setState("idle");
					setProgress(void 0);
					return;
				}
				const operation = new AbortController();
				controller.current = operation;
				setState("pending");
				setProgress(void 0);
				const onProgress = (value) => {
					if (controller.current === operation) setProgress(downloadPercent(value));
				};
				try {
					if (download !== void 0) await download.onInvoke({
						item,
						src: item.src,
						signal: operation.signal,
						onProgress
					});
					else {
						const blob = await readImageBlobWithFallback(item, {
							signal: operation.signal,
							onProgress
						});
						if (operation.signal.aborted) return;
						const url = URL.createObjectURL(blob);
						const link = document.createElement("a");
						link.href = url;
						link.download = downloadName(item.name);
						document.body.append(link);
						link.click();
						link.remove();
						setTimeout(() => URL.revokeObjectURL(url), 6e4);
					}
					if (controller.current === operation) setState("idle");
				} catch {
					if (controller.current === operation) setState("failed");
				} finally {
					if (controller.current === operation) controller.current = null;
				}
			};
			const label = state === "pending" ? `${download?.pendingLabel ?? t("preparing")}${progress === void 0 ? "" : ` ${progress}%`} · ${t("cancel")}` : state === "failed" ? download?.errorLabel ?? t("failed") : t("download");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "niv-download",
				"aria-label": state === "pending" ? t("cancelDownload") : label,
				title: label,
				onClick: () => {
					invoke();
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconDownloadOutline16, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "niv-label",
					children: label
				})]
			});
		}
		function ViewerOverlay({ service, t }) {
			const request = (0, react.useSyncExternalStore)(service.subscribe, service.getSnapshot);
			const [cursor, setCursor] = (0, react.useState)({
				revision: 0,
				index: 0
			});
			const index = cursor.revision === request?.revision ? cursor.index : request?.index ?? 0;
			const setIndex = (update) => setCursor((current) => ({
				revision: request.revision,
				index: typeof update === "function" ? update(current.revision === request.revision ? current.index : request.index) : update
			}));
			const [imageState, setImageState] = (0, react.useState)("loading");
			const [attempt, setAttempt] = (0, react.useState)(0);
			const [sourceIndex, setSourceIndex] = (0, react.useState)(0);
			const [copyFailed, setCopyFailed] = (0, react.useState)(false);
			const [annotating, setAnnotating] = (0, react.useState)(false);
			const [penColor, setPenColor] = (0, react.useState)("red");
			const [inkByImage, setInkByImage] = (0, react.useState)({});
			const [inkLive, setInkLive] = (0, react.useState)(null);
			const [natural, setNatural] = (0, react.useState)(null);
			const [saveState, setSaveState] = (0, react.useState)("idle");
			const inkRef = (0, react.useRef)(null);
			const inkByImageRef = (0, react.useRef)(inkByImage);
			inkByImageRef.current = inkByImage;
			const [annotationsByImage, setAnnotationsByImage] = (0, react.useState)(service.getAnnotationsSnapshot);
			const annotationsByImageRef = (0, react.useRef)(annotationsByImage);
			const [selected, setSelected] = (0, react.useState)();
			const [focusNote, setFocusNote] = (0, react.useState)();
			const [copied, setCopied] = (0, react.useState)(false);
			const rootRef = (0, react.useRef)(null);
			annotationsByImageRef.current = annotationsByImage;
			(0, react.useEffect)(() => {
				if (request === void 0) return;
				setAnnotating(false);
				setSelected(void 0);
				setCopied(false);
			}, [request?.revision]);
			const item = request?.items[index];
			(0, react.useEffect)(() => {
				setSourceIndex(0);
			}, [
				item?.id,
				item?.src
			]);
			const { transform, transformRef, dragging, pixelScale, geometry, stageRef, surfaceRef, imageRef, fit, actual, measure, setZoomAt, resetGesture, pointerHandlers } = useImageTransform(`${request?.revision}:${item?.id}:${item?.src}`);
			const annotations = item === void 0 ? [] : annotationsByImage[item.id] ?? [];
			const ink = item === void 0 ? [] : inkByImage[item.id] ?? [];
			const setInk = (0, react.useCallback)((update) => {
				if (item === void 0) return;
				const previous = inkByImageRef.current[item.id] ?? [];
				const next = typeof update === "function" ? update(previous) : update;
				inkByImageRef.current = {
					...inkByImageRef.current,
					[item.id]: next
				};
				inkRegistry.set(item.src, next);
				setInkByImage(inkByImageRef.current);
			}, [item?.id, item?.src]);
			const setAnnotations = (0, react.useCallback)((update) => {
				if (service.getSnapshot()?.committing) return;
				if (item === void 0) return;
				const previous = annotationsByImageRef.current[item.id] ?? [];
				const next = typeof update === "function" ? update(previous) : update;
				const snapshot = {
					...annotationsByImageRef.current,
					[item.id]: next
				};
				annotationsByImageRef.current = snapshot;
				service.setAnnotations(item.id, next);
				setAnnotationsByImage(snapshot);
				setCopied(false);
				setCopyFailed(false);
			}, [item?.id, service]);
			(0, react.useEffect)(() => {
				if (request === void 0) return void 0;
				const previousOverflow = document.body.style.overflow;
				document.body.style.overflow = "hidden";
				rootRef.current?.focus();
				const onKeyDown = (event) => {
					if (service.getSnapshot()?.committing) {
						event.preventDefault();
						event.stopPropagation();
						return;
					}
					if (event.defaultPrevented || event.isComposing) return;
					if (event.key === "Escape") {
						event.preventDefault();
						event.stopPropagation();
						if (event.target instanceof Element && event.target.closest(".niv-inline-note") !== null) {
							setSelected(void 0);
							rootRef.current?.focus();
							return;
						}
						service.close();
						return;
					}
					if (event.ctrlKey || event.metaKey || event.altKey) return;
					const editing = event.target instanceof Element && event.target.closest("input,textarea,select,[contenteditable=\"true\"]") !== null;
					if (!editing && [
						"ArrowLeft",
						"ArrowRight",
						"+",
						"=",
						"-",
						"f",
						"F"
					].includes(event.key)) event.stopPropagation();
					if (!editing && event.key === "ArrowLeft" && request.items.length > 1) {
						event.preventDefault();
						setIndex((value) => (value - 1 + request.items.length) % request.items.length);
					} else if (!editing && event.key === "ArrowRight" && request.items.length > 1) {
						event.preventDefault();
						setIndex((value) => (value + 1) % request.items.length);
					} else if (!editing && (event.key === "+" || event.key === "=")) {
						event.preventDefault();
						const box = stageRef.current?.getBoundingClientRect();
						if (box) setZoomAt(transformRef.current.zoom * 1.2, box.left + box.width / 2, box.top + box.height / 2);
					} else if (!editing && event.key === "-") {
						event.preventDefault();
						const box = stageRef.current?.getBoundingClientRect();
						if (box) setZoomAt(transformRef.current.zoom / 1.2, box.left + box.width / 2, box.top + box.height / 2);
					} else if (!editing && event.key.toLowerCase() === "f") {
						event.preventDefault();
						fit();
					} else if (event.key === "Tab") {
						const controls = [...rootRef.current.querySelectorAll("button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex=\"-1\"])")];
						const first = controls[0];
						const last = controls.at(-1);
						if (event.shiftKey && (document.activeElement === first || document.activeElement === rootRef.current)) {
							event.preventDefault();
							last?.focus();
						} else if (!event.shiftKey && (document.activeElement === last || document.activeElement === rootRef.current)) {
							event.preventDefault();
							first?.focus();
						}
					}
				};
				const root = rootRef.current;
				root.addEventListener("keydown", onKeyDown);
				return () => {
					document.body.style.overflow = previousOverflow;
					root.removeEventListener("keydown", onKeyDown);
				};
			}, [
				request,
				service,
				fit,
				setZoomAt
			]);
			(0, react.useEffect)(() => {
				if (focusNote === void 0) return;
				(rootRef.current?.querySelector(`[data-note-id="${CSS.escape(focusNote)}"] textarea`))?.focus();
				setFocusNote(void 0);
			}, [
				focusNote,
				selected,
				annotations.length
			]);
			(0, react.useEffect)(() => {
				setAnnotating(false);
				setSelected(void 0);
				setImageState("loading");
				setCopyFailed(false);
				setCopied(false);
			}, [
				item?.id,
				item?.src,
				request?.revision
			]);
			const addAnnotation = (event) => {
				if (!annotating || event.target.closest(".niv-annotation")) return;
				const bounds = surfaceRef.current?.getBoundingClientRect();
				if (bounds === void 0) return;
				const annotation = {
					id: crypto.randomUUID(),
					x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
					y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
					note: ""
				};
				setAnnotations((current) => [...current, annotation]);
				setAnnotating(false);
				setSelected(annotation.id);
				setFocusNote(annotation.id);
			};
			const inkPoint = (event) => {
				const bounds = surfaceRef.current?.getBoundingClientRect();
				if (bounds === void 0 || bounds.width === 0 || bounds.height === 0) return void 0;
				return {
					x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
					y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1)
				};
			};
			const inkDown = (event) => {
				if (event.button !== 0 || event.target.closest("button,a,input,textarea,select")) return;
				const point = inkPoint(event);
				if (point === void 0) return;
				event.preventDefault();
				event.currentTarget.setPointerCapture?.(event.pointerId);
				inkRef.current = {
					id: crypto.randomUUID(),
					color: penColor,
					points: [point]
				};
				setInkLive(inkRef.current);
			};
			const inkMove = (event) => {
				const live = inkRef.current;
				if (live === null) return;
				const point = inkPoint(event);
				if (point === void 0) return;
				const last = live.points.at(-1);
				if (last !== void 0 && Math.hypot(point.x - last.x, point.y - last.y) < .0015) return;
				event.preventDefault();
				live.points = [...live.points, point];
				setInkLive({
					...live,
					points: live.points
				});
			};
			const inkUp = () => {
				const live = inkRef.current;
				if (live === null) return;
				inkRef.current = null;
				setInkLive(null);
				if (live.points.length > 1) setInk((current) => [...current, live]);
			};
			const inkHandlers = {
				onPointerDown: inkDown,
				onPointerMove: inkMove,
				onPointerUp: inkUp,
				onPointerCancel: inkUp,
				onLostPointerCapture: inkUp
			};
			const inkOverlay = () => {
				const strokes = inkLive === null ? ink : [...ink, inkLive];
				if (strokes.length === 0) return null;
				const width = natural?.width || 1000;
				const height = natural?.height || 1000;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
					className: "niv-ink",
					viewBox: `0 0 ${width} ${height}`,
					preserveAspectRatio: "none",
					"aria-hidden": "true",
					children: strokes.map((stroke) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("polyline", {
						points: stroke.points.map((point) => `${point.x * width},${point.y * height}`).join(" "),
						stroke: INK_COLORS[stroke.color] ?? INK_COLORS.red,
						strokeWidth: Math.max(2, width * .005)
					}, stroke.id))
				});
			};
			const saveInk = async () => {
				if (item === void 0 || saveState === "saving") return;
				setSaveState("saving");
				let copied = false;
				try {
					const blob = await renderAnnotationImage(await readImageBlobWithFallback(item, {
						signal: new AbortController().signal,
						onProgress: () => {}
					}), annotations, ink, item.src);
					try {
						await copyImageToClipboard(blob);
						copied = true;
					} catch {}
					if (!copied) {
						setSaveState("failed");
						setTimeout(() => {
							setSaveState("idle");
						}, 2600);
						return;
					}
					setSaveState("saved");
					setTimeout(() => {
						setSaveState("idle");
					}, 2600);
					setTimeout(() => {
						try {
							service.close({ discard: true });
						} catch {}
					}, 160);
					return;
				} catch {
					setSaveState("failed");
				}
				setTimeout(() => {
					setSaveState("idle");
				}, 2600);
			};
			const copyNotes = async () => {
				const text = noteText(annotations, t);
				if (text === "") return;
				try {
					await navigator.clipboard.writeText(text);
					setCopied(true);
					setCopyFailed(false);
				} catch {
					setCopyFailed(true);
				}
			};
			if (request === void 0 || item === void 0) return null;
			const sized = natural !== null && natural.width > 0 && natural.height > 0 ? natural : item.width && item.height ? {
				width: item.width,
				height: item.height
			} : void 0;
			const meta = [sized ? `${sized.width} × ${sized.height}` : void 0, bytesLabel(item.bytes)].filter(Boolean).join(" · ");
			const showCounter = request.items.length > 1;
			const annotationPosition = (annotation) => {
				const ratio = globalThis.devicePixelRatio || 1;
				const align = (value) => Math.round(value * ratio) / ratio;
				return {
					left: align(geometry.stageWidth / 2 + transform.x + (annotation.x - .5) * geometry.width * transform.zoom - 12),
					top: align(geometry.stageHeight / 2 + transform.y + (annotation.y - .5) * geometry.height * transform.zoom - 12),
					visibility: imageState === "ready" ? "visible" : "hidden"
				};
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: "niv-root",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": t("dialog"),
				tabIndex: -1,
				children: [
					request.committing || request.commitError ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "niv-draft-status",
						role: "status",
						children: [t(request.committing ? "addingDraft" : "draftFailed"), request.commitError ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "niv-button",
							type: "button",
							onClick: () => {
								service.close({ discard: true });
							},
							children: t("closeWithoutDraft")
						}) : null]
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "niv-title",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: item.name }), meta !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: meta }) : null]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("header", {
						className: "niv-topbar",
						role: "toolbar",
						"aria-label": t("dialog"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "niv-actions",
							children: [
								request.annotations ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "niv-button",
									"data-active": annotating,
									"aria-label": annotating ? t("cancelAnnotate") : t("annotate"),
									"aria-pressed": annotating,
									disabled: imageState !== "ready",
									onClick: () => {
										resetGesture();
										setAnnotating((value) => !value);
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconEditOutline16, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "niv-label",
										children: annotating ? t("cancelAnnotate") : t("annotate")
									})]
								}) : null,
								request.annotations && annotating ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "niv-pen",
									role: "group",
									"aria-label": t("penColor"),
									children: Object.keys(INK_COLORS).map((color) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "niv-swatch",
										"data-active": penColor === color,
										"aria-label": t(`pen_${color}`),
										"aria-pressed": penColor === color,
										style: { background: INK_COLORS[color] },
										onClick: () => {
											setPenColor(color);
										}
									}, color))
								}) : null,
								request.annotations ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "niv-button",
									"aria-label": t("save"),
									disabled: imageState !== "ready" || saveState === "saving",
									onClick: () => {
										saveInk();
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconDownloadOutline16, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "niv-label",
										children: saveState === "saving" ? t("saving") : saveState === "failed" ? t("saveFailed") : saveState === "saved" ? t("saved") : t("save")
									})]
								}) : null,
								annotations.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "niv-button",
									"data-active": selected !== void 0,
									onClick: () => {
										const first = annotations[0];
										setSelected((current) => current === void 0 ? first.id : void 0);
										if (selected === void 0) setFocusNote(first.id);
									},
									children: [
										annotations.length,
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "niv-label",
											children: t("regions")
										})
									]
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "niv-button",
									"aria-label": t("fit"),
									onClick: fit,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconFullscreenOutline16, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "niv-label",
										children: t("fit")
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "niv-button",
									disabled: imageState !== "ready",
									onClick: actual,
									children: t("actual")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "niv-zoom",
									children: [Math.round(transform.zoom * pixelScale * 100), "%"]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ViewerDownload, {
									download: item.download,
									item,
									t
								}, `${request.revision}:${index}:${item.src}`),
								annotations.some((annotation) => annotation.note.trim() !== "") ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "niv-button niv-copy-notes",
									"aria-label": copyFailed ? t("copyFailed") : copied ? t("copied") : t("copyNotes"),
									onClick: () => {
										copyNotes();
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCopyOutline16, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "niv-label",
										children: copyFailed ? t("copyFailed") : copied ? t("copied") : t("copyNotes")
									})]
								}) : null,
								item.actions.map((action) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ViewerAction, {
									action,
									annotations,
									item,
									service,
									revision: request.revision
								}, `${request.revision}:${item.src}:${action.id}`))
							]
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "niv-close-floating",
						"aria-label": t("close"),
						onClick: () => service.close(),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCloseOutline16, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "niv-workspace",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
							ref: stageRef,
							className: "niv-stage",
							"data-dragging": dragging,
							"data-annotating": annotating,
							onClick: (event) => {
								if (event.target === event.currentTarget && !annotating && transform.zoom === 1) service.close();
							},
							...imageState === "ready" ? annotating ? inkHandlers : pointerHandlers : {},
							onDoubleClick: (event) => {
								if (event.target.closest("button,a,input,textarea") || imageState !== "ready") return;
								if (transform.zoom === 1) actual();
								else fit();
							},
							children: [
								imageState !== "ready" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "niv-load-status",
									role: imageState === "error" ? "alert" : "status",
									children: [t(imageState === "error" ? "loadFailed" : "loading"), imageState === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "niv-button",
										onClick: () => {
											setImageState("loading");
											setAttempt((value) => value + 1);
										},
										children: t("retry")
									}) : null]
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									ref: surfaceRef,
									className: "niv-surface",
									"data-inking": annotating,
									style: {
										visibility: imageState === "ready" ? "visible" : "hidden",
										transform: `translate3d(${transform.x}px,${transform.y}px,0) scale(${transform.zoom})`
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
										ref: imageRef,
										className: "niv-image",
										src: itemSourceAt(item, sourceIndex),
										alt: item.name,
										draggable: "false",
										onLoad: () => {
											setNatural({
												width: imageRef.current?.naturalWidth ?? 0,
												height: imageRef.current?.naturalHeight ?? 0
											});
											setImageState("ready");
											measure();
										},
										onError: () => {
										if (sourceIndex + 1 < itemSources(item).length) {
											setSourceIndex(sourceIndex + 1);
											return;
										}
										setImageState("error");
									}
									}, `${request.revision}:${item.id}:${attempt}`), inkOverlay()]
								}),
								annotations.map((annotation, position) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "niv-annotation",
									"data-x": annotation.x < .38 ? "right" : annotation.x > .62 ? "left" : "center",
									"data-y": annotation.y < .28 ? "down" : "up",
									style: annotationPosition(annotation),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "niv-pin",
										"data-active": selected === annotation.id,
										"aria-label": fill(t("note"), { value: position + 1 }),
										onClick: (event) => {
											event.stopPropagation();
											const opening = selected !== annotation.id;
											setSelected(opening ? annotation.id : void 0);
											if (opening) setFocusNote(annotation.id);
										},
										children: position + 1
									}), selected === annotation.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "niv-inline-note",
										"data-note-id": annotation.id,
										onClick: (event) => event.stopPropagation(),
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "niv-inline-index",
												children: position + 1
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
												value: annotation.note,
												rows: 1,
												"aria-label": fill(t("note"), { value: position + 1 }),
												placeholder: t("notePlaceholder"),
												onChange: (event) => {
													const note = event.target.value;
													setAnnotations((current) => current.map((entry) => entry.id === annotation.id ? {
														...entry,
														note
													} : entry));
												},
												onKeyDown: (event) => {
													if (event.nativeEvent?.isComposing || event.isComposing) return;
													if (event.key === "Enter" && !event.shiftKey || event.key === "Escape") {
														event.preventDefault();
														event.stopPropagation();
														event.nativeEvent?.stopImmediatePropagation?.();
														setSelected(void 0);
														rootRef.current?.focus();
													}
												}
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "niv-note-remove",
												"aria-label": t("removeNote"),
												onClick: (event) => {
													event.stopPropagation();
													setAnnotations((current) => current.filter((entry) => entry.id !== annotation.id));
													setSelected(void 0);
													rootRef.current?.focus();
												},
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCloseOutline16, {})
											})
										]
									}) : null]
								}, annotation.id)),
								showCounter ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "niv-button niv-icon-only niv-nav niv-prev",
										"aria-label": t("previous"),
										onClick: (event) => {
											event.stopPropagation();
											setIndex((value) => (value - 1 + request.items.length) % request.items.length);
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronLeftOutline14, {})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "niv-button niv-icon-only niv-nav niv-next",
										"aria-label": t("next"),
										onClick: (event) => {
											event.stopPropagation();
											setIndex((value) => (value + 1) % request.items.length);
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRightOutline14, {})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "niv-counter",
										children: [
											index + 1,
											" / ",
											request.items.length
										]
									})
								] }) : annotating ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "niv-hint",
									children: t("regionHint")
								}) : transform.zoom === 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "niv-hint",
									children: t("zoomHint")
								}) : null
							]
						})
					})
				]
			});
		}
		function installOfficialImageBridge(service, ctx, t) {
			const onClick = (event) => {
				const match = nativeImageButton(event.target);
				if (globalThis.__NIV_DEBUG__ === true) {
					try {
						console.log("[niv-probe]", event.target?.tagName, match?.kind ?? "none", (event.target?.outerHTML ?? "").slice(0, 200));
					} catch {}
				}
				if (match === void 0) return;
				const { items, index } = imageItemsForButton(match);
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation();
				service.open({
					items,
					index,
					opener: match.button,
					source: "dsh-native",
					annotations: true
				});
			};
			document.addEventListener("click", onClick, true);
			return () => {
				document.removeEventListener("click", onClick, true);
			};
		}
		function apply(ctx) {
			const service = new NativeImageViewerService();
			ctx.effect(() => ctx.locale.register(name, LOCALES), `${name}: dictionaries`);
			const t = ctx.locale.bind(name);
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.plugin = name;
				style.textContent = CSS$1;
				document.head.appendChild(style);
				return () => {
					style.remove();
				};
			}, `${name}: styles`);
			ctx.effect(() => {
				const disposeService = ctx.reflect.provide("nativeImageViewer", service);
				const disposeBridge = installOfficialImageBridge(service, ctx, t);
				return () => {
					disposeBridge();
					disposeService();
				};
			}, `${name}: optional viewer service and native image bridge`);
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: name,
				order: 20,
				inject: () => ({
					service,
					t
				})
			}, ViewerOverlay));
		}
		//#endregion
		exports.NativeImageViewerService = NativeImageViewerService;
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		exports.normalizeViewerRequest = normalizeViewerRequest;
		return module.exports;
	}
});
