# 五个项目封面替换设计

## 目标

使用用户指定的原始封面替换官网中 5 个项目的现有封面，并让首页、Projects 页面、详情页及视频 poster 同步显示新图片。页面布局和全屏裁切行为保持不变。

## 文件映射

| 项目 | 源文件 | 网站目标文件 |
| --- | --- | --- |
| Touareg x Wu Jing | `S:/Project/Users/May/网站片子/812/13-Touareg x Wu Jing/Touareg x Wu Jing cover.png` | `assets/images/touareg-x-wu-jing-cover.png` |
| Universal Studio | `S:/Project/Users/May/网站片子/812/07-Universal/Universal cover.jpg` | `assets/images/universal-studio-cover.jpg` |
| HUAWEI｜NORA BAND 10 | `S:/Project/Users/May/网站片子/812/03-HUAWEI｜NORA BAND 10/HUAWEI｜NORA BAND 10 cover.jpg` | `assets/images/huawei-nora-band-10-cover.jpg` |
| HUAWEI FreeBuds Pro 3 | `S:/Project/Users/May/网站片子/812/02-HUAWEI FreeBuds Pro 3/HUAWEI FreeBuds Pro 3 cover.jpg` | `assets/images/huawei-freebuds-pro-3-cover.jpg` |
| Sanrio Brand 2025 | `S:/Project/Users/May/网站片子/812/04-Sanrio Brand 2025/sanrio cover.png` | `assets/images/sanrio-brand-2025-cover.png` |

## 数据与文件处理

- 原始 JPG 保持 JPG，原始 PNG 保持 PNG，不进行二次编码或画质压缩。
- 更新 `data/projects.cjs` 中 FreeBuds、NORA 和 Sanrio 的 poster 扩展名。
- 替换 Touareg 和 Universal 的同名图片内容。
- 删除不再引用的 `huawei-freebuds-pro-3-cover.png`、`huawei-nora-band-10-cover.png` 和 `sanrio-brand-2025-cover.jpg`。
- 继续使用现有 `object-fit: cover` 规则；不修改图片比例，不预先裁切源图。

## 推荐项目卡片

- 推荐项目卡片统一为 `16:9`，封面使用 `object-fit: cover` 填满整个卡片，不留黑边。
- 保留项目标题，标题定位在封面底部并叠加于图片之上。
- 移除标题当前占用的独立黑色区域；只允许使用轻微的底部透明渐变提升文字可读性，不形成实色黑底。
- 桌面端继续显示三列，手机端继续使用横向滑动卡片。
- 悬停缩放、键盘焦点和 reduced-motion 行为保持不变。

## 验收标准

- 5 个网站目标文件的 SHA-256 与对应源文件完全一致。
- 项目数据只引用新目标文件，不再引用 3 个旧格式文件。
- 23 个项目数据验证、构建及全部自动化测试通过。
- 首页、Projects 页面和对应详情页的图片均成功加载。
- 桌面端首页封面仍为全屏 `cover`，Projects 页面仍为两列；手机端 Projects 页面仍为一列，页面无横向溢出。
- 推荐项目卡片为一致的 `16:9` 封面，标题叠加显示，卡片不存在独立黑色标题栏。
- 部署后 5 个正式图片 URL 均返回成功，线上页面加载新图片且无相关 HTTP 错误。

## 范围限制

- 不修改项目标题、分类、服务、推荐顺序、视频或页面样式。
- 不修改或删除 `S:` 共享盘中的源文件。
