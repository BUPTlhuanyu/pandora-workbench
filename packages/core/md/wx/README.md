<!--
 * @file
-->
md.core.ruler 负责修改token
md.renderer.rules 负责将token渲染成html

有两种常见需求：插入节点，完全替换节点。
1. 后者用于代码块，type具备唯一性的token节点
2. 前者用于各个样式

TODO：
1. 图片，图床
2. 参考文献
3. 加粗，斜体
4. 主题在线编辑，保存，新增到主题
