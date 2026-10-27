# -*- coding: utf-8 -*-
# 第二版补丁：为 dsh-image-viewer 建立「全尺寸候选链 + 逐级回退」
import io, re, sys, shutil, time

if len(sys.argv) != 2:
    raise SystemExit("Usage: python patch2.py COPY_OF_CLIENT_JS")
PATH = sys.argv[1]
bak = PATH + ".pre-chainfix-" + time.strftime("%Y%m%d-%H%M%S")
shutil.copy2(PATH, bak)
print("backup:", bak)

src = io.open(PATH, encoding="utf-8").read()
orig = src

def rep(old, new, count=1, label=""):
    global src
    n = src.count(old)
    if n < count:
        print("MISS[%s] occurrences=%d" % (label, n))
        sys.exit(2)
    src = src.replace(old, new, count)
    print("ok[%s]" % label)

# ---------- 1. helper 区块：升级为候选链 ----------
start = src.index("\t\t// 缩略图升级：插件市场")
end = src.index("\t\tfunction nativeImageButton(target) {")
helpers = r'''		// 缩略图升级：插件市场 / README 卡片上的图是 images.weserv.nl 缩略代理（h=200 / h=520），
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
		const itemSources = (item) => [item?.src, ...(Array.isArray(item?.fallbacks) ? item.fallbacks : [])].filter((value) => typeof value === "string" && value !== "");
		const itemSourceAt = (item, index) => {
			const sources = itemSources(item);
			if (sources.length === 0) return "";
			return sources[Math.max(0, Math.min(sources.length - 1, index))];
		};
'''
src = src[:start] + helpers + src[end:]
print("ok[helpers]")

# ---------- 2. normalizeViewerRequest: 带上 fallbacks ----------
rep('''					src: item.src,
					name:''', '''					src: item.src,
					fallbacks: Array.isArray(item.fallbacks) ? item.fallbacks.flatMap((value) => typeof value === "string" && value.trim() !== "" && value.trim() !== item.src ? [value.trim()] : []) : [],
					name:''', label="normalize")

# ---------- 3. imageItemsForButton: 生成候选链 ----------
rep('''				const resolved = fullImageSource(image);
				if (resolved === "") return [];
				return [{
					id: resolved,
					src: resolved,''', '''				const candidates = imageSourceCandidates(image);
				if (candidates.length === 0) return [];
				return [{
					id: candidates[0],
					src: candidates[0],
					fallbacks: candidates.slice(1),''', label="items")

rep('''			const items = candidates.length > 0 ? candidates : [{
				id: fullImageSource(match.image),
				src: fullImageSource(match.image),''', '''			const fallbackChain = imageSourceCandidates(match.image);
			const items = candidates.length > 0 ? candidates : [{
				id: fallbackChain[0] ?? "",
				src: fallbackChain[0] ?? "",
				fallbacks: fallbackChain.slice(1),''', label="items-fallback")

# ---------- 4. readImageBlobWithFallback ----------
rep('''		//#endregion
		//#region src/annotation-draft.js''', '''		async function readImageBlobWithFallback(item, options) {
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
		//#region src/annotation-draft.js''', label="blobhelper")

# ---------- 5. 注解提交路径: blob 也走候选链 ----------
rep('''				const prepared = await Promise.all(entries.map(async ({ item, annotations }) => {
					const image = await render(await readBlob(item.src), annotations, void 0, item.src);''', '''				const prepared = await Promise.all(entries.map(async ({ item, annotations }) => {
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
					const image = await render(blob, annotations, void 0, item.src);''', label="commit-blob")

# ---------- 6. 下载 ----------
rep('''						const blob = await readImageBlob(item.src, {
							signal: operation.signal,
							onProgress
						});''', '''						const blob = await readImageBlobWithFallback(item, {
							signal: operation.signal,
							onProgress
						});''', label="download")

# ---------- 7. 保存标注图 ----------
rep('''					const blob = await renderAnnotationImage(await readImageBlob(item.src, {''', '''					const blob = await renderAnnotationImage(await readImageBlobWithFallback(item, {''', label="saveInk")

# ---------- 8. Viewer 状态 ----------
rep('''			const [attempt, setAttempt] = (0, react.useState)(0);''', '''			const [attempt, setAttempt] = (0, react.useState)(0);
			const [sourceIndex, setSourceIndex] = (0, react.useState)(0);''', label="state")

rep('''			const item = request?.items[index];''', '''			const item = request?.items[index];
			(0, react.useEffect)(() => {
				setSourceIndex(0);
			}, [
				item?.id,
				item?.src
			]);''', label="reset-effect")

rep('''										src: item.src,
										alt: item.name,''', '''										src: itemSourceAt(item, sourceIndex),
										alt: item.name,''', label="img-src")

rep('''									onError: () => setImageState("error")''', '''									onError: () => {
										if (sourceIndex + 1 < itemSources(item).length) {
											setSourceIndex(sourceIndex + 1);
											return;
										}
										setImageState("error");
									}''', label="img-onerror")

if src == orig:
    print("no change?!")
    sys.exit(3)
io.open(PATH, "w", encoding="utf-8", newline="").write(src)
print("written, delta bytes:", len(src) - len(orig))
