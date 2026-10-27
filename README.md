# DSH Image Viewer — fl0wer 修改版

> 基于 [WSL043/dsh-image-viewer](https://github.com/WSL043/dsh-image-viewer) 的 MIT 开源修改版，**不是从零原创**。原作者为 WSL043；本分支由 fl0-0wer 整理、发布现用的社区修改。

本次发行 `dsh-image-viewer-fl0wer@0.1.17` 以本机正在使用的 0.1.16 预构建 JavaScript 为基础。可读的 `lib/client.js` 是本版本运行实现；继承仓库中的上游 `src/`、测试与构建配置仅供参考，不代表本分支修改已经完整回移至源码工程。不要运行上游构建来重建本发行包，它会覆盖修改。补丁来源及准确差异见 `MODIFICATIONS.md` 和 `PATCHES/`。

## 功能与归属

原作提供缩放、拖拽、原始大小、多图画廊、下载、区域备注和会话草稿交接。

此分支保留实际使用的修改：

- 自由手绘，红、蓝、白三色画笔；笔迹按图片源隔离。
- 将图片、手绘笔迹和区域标记合成为 PNG，复制到浏览器图像剪贴板。
- 在来源允许访问时，尝试全尺寸声明源、去尺寸参数代理、原图 URL 和原缩略图；显示、下载和标注合成使用候选回退。
- 查看器顶部布局与内联图片入口调整。

来源访问失败、CORS 或浏览器剪贴板权限会影响相应功能；回退链不保证恢复来源本身未提供的高清图。视频中的重绘界面只是操作示意。

## 安装

从本仓库 [Releases](https://github.com/fl0-0wer/dsh-image-viewer-fl0wer/releases) 获取 `dsh-image-viewer-fl0wer-0.1.17.tgz`，在 DSH 插件管理中通过安装包安装。Market 条目以其合并与收录状态为准。

**先停用原版 `dsh-image-viewer`，再启用本分支。** 两者提供同一类图片查看服务并沿用原 Cordis 行 ID `wsl043-native-image-viewer`，请勿同时启用。安装包名及客户端模块 ID 使用 `dsh-image-viewer-fl0wer`。

本包沿用原作 peer dependency 兼容范围；仅做预构建包的静态与交付验证，不宣称在所有列出的 DSH 版本中完成交互测试。具体范围见 `package.json` 与 `compatibility.json`。Node.js 要求沿用 `^22.19.0 || >=24.0.0`。

## 开发与再分发

查看可读 `lib/*.js`、修改说明和补丁文件即可审阅本版实现。上游源码的完整重构移植仍是独立工作，未完成的移植不包含在安装包中。本版不会用不匹配的 source map 伪装源码对应关系。

MIT 许可证见 `LICENSE`，保留 WSL043 的原始版权与许可文本。第三方归属见 `THIRD_PARTY_NOTICES.md`。

修改版仓库：https://github.com/fl0-0wer/dsh-image-viewer-fl0wer

原作仓库：https://github.com/WSL043/dsh-image-viewer
