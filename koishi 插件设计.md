<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

目录

* <!--[-->
  [应用目录](#应用目录 "应用目录")
  <!---->

* [理解配置文件](#理解配置文件 "理解配置文件")

  * [全局设置](#全局设置 "全局设置")
    <!---->
  * [插件配置](#插件配置 "插件配置")
    <!---->
  * [插件名称](#插件名称 "插件名称")
    <!---->
  * [插件组](#插件组 "插件组")
    <!---->
  * [元信息](#元信息 "元信息")
    <!---->

* [修改配置文件](#修改配置文件 "修改配置文件")
  <!---->

* [使用环境变量](#使用环境变量 "使用环境变量")
  <!---->
  <!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!---->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

# 配置文件 [​](#配置文件)

WARNING

配置文件的结构未来可能会发生变化，请留意后续更新。

每个 Koishi 应用都有一个配置文件，它管理了应用及其插件的全部配置。在绝大多数情况下，我们都可以使用控制台修改这些配置，而无需手动编辑配置文件。但作为开发指南的一部分，我们还是需要了解一下配置文件的结构，并介绍一些你可能会用到的进阶用法。

默认情况下配置文件的格式为 [YAML](https://en.wikipedia.org/wiki/YAML)，它是一种易于阅读和编辑的文本格式，你可以用任何文本编辑器打开。

## 应用目录 [​](#应用目录)

配置文件所在的目录叫**应用目录**。根据你的安装方式，应用目录的位置可能不同：

* 模板项目：你创建的项目目录，例如 `D:/dev/koishi-app`
* 启动器 (zip)：解压目录下 `data/instances/default`
* 启动器 (msi)：`C:/Users/你的用户名/AppData/Roaming/Koishi/Desktop/data/instances/default`
* 启动器 (pkg)：`~/Library/Application Support/Koishi/Desktop/data/instances/default`

配置文件是应用目录下名为 `koishi.yml` 的文件。当你遇到问题时，开发者可能会要求你提供配置文件的内容。此时去上面的地方找就好了。

## 理解配置文件 [​](#理解配置文件)

尝试打开配置文件，你会发现它的内容大致如下：

yaml

```
# 全局设置
host: localhost
port: 5140

# 插件列表
plugins:
  # group 表示这是一个插件组
  group:console:
    # 波浪线前缀表示一个不启用的插件
    ~auth:
    console:
    logger:
    insight:
    market:
      # 以缩进的方式显示插件的配置项
      registry:
        endpoint: https://registry.npmmirror.com

  # 这里是一些零散的插件
  github:
  dialogue:
```

具体而言，配置文件中包含的内容如下。

### 全局设置 [​](#全局设置)

全局设置对应于配置文件中 `plugins:` 一行以上的部分。这里会包含一些最基础的配置项，例如网络设置、指令前缀、默认权限等。修改这里的配置项，会影响整个 Koishi 应用的行为而非某个插件。你可以在 [这个页面](./../../api/core/app.html) 了解全部的全局设置。

### 插件配置 [​](#插件配置)

`plugins` 是一个 YAML 对象，它的每一个键对应于插件的名称，而值则对应于插件的配置。当没有进行配置时，值可以省略 (或者写成 `{}`)。当存在配置时，值需要在插件的基础上缩进并写在接下来的几行中。例如：

yaml

```
plugins:
  dialogue:
    # 这里是 koishi-plugin-dialogue 的配置
    context:
      enable: true
```

### 插件名称 [​](#插件名称)

插件名称通常对应于插件发布时的包名。例如：

* `market` 对应于官方插件 `@koishijs/plugin-market`
* `dialogue` 对应于社区插件 `koishi-plugin-dialogue`

除了插件的包名外，插件名称还可以拥有一个可选的前缀 (`~`) 和后缀 (`:xxx`)。插件名称前的波浪线 (`~`) 表示该插件不会被启用。插件名称后的冒号后是插件的别名，当某个插件需要存在多组配置时这会非常有用。

### 插件组 [​](#插件组)

你可以将插件组理解为一个名为 `group` 的特殊插件。它的语法与 `plugins` 一致，都是一个包含了插件名称和插件配置的 YAML 对象。使用插件组不仅能更好地帮助你整理插件，还能批量控制其中插件的行为。插件组也支持嵌套，例如：

yaml

```
plugins:
  group:official:
    # 一层嵌套插件组下的 help 插件
    help:
    group:console:
      # 两层嵌套插件组下的 market 插件
      market:
```

### 元信息 [​](#元信息)

一些以 `$` 开头的属性会记录插件和插件组的元信息。例如：

yaml

```
plugins:
  group:console:
    # 在控制台中折叠该插件组
    $collapsed: true
    status:
      # 仅对于 telegram 平台启用该插件
      $filter:
        $eq:
          - $: platform
          - telegram
```

## 修改配置文件 [​](#修改配置文件)

TIP

如果你不了解 YAML 的语法，请不要随意修改配置文件，否则将可能导致 Koishi 应用无法运行。你可以在 [这篇教程](https://www.runoob.com/w3cnote/yaml-intro.html) 中学习 YAML 的语法。

当你启动 Koishi 应用时，Koishi 会读取上述配置文件并加载所需的插件。反过来，如果你想调整 Koishi 及其插件的行为，你就需要修改这个配置文件。

如果你使用的是模板项目，你需要手动修改它并重新启动 Koishi 应用；如果你使用的是启动器，则你可以直接在「插件配置」中进行调整，Koishi 会自动将这些改动写入配置文件。事实上你会发现，配置文件的结构与「插件配置」页面基本是一致的。

绝大多数的功能都可以通过「插件配置」页面来完成，但目前尚有一些功能没有做好相应的交互界面，这时你仍然需要手动修改配置文件。具体的步骤与模板项目类似：

1. 关闭当前 Koishi 应用
2. 在 [应用目录](#应用目录) 下找到配置文件并进行编辑
3. 保存配置文件后再次启动 Koishi 应用

## 使用环境变量 [​](#使用环境变量)

你可以通过插值语法在配置文件中使用环境变量。例如：

koishi.yml

```
plugins:
  adapter-discord:
    token: ${{ env.DISCORD_TOKEN }}
```

当项目启动时，会将环境变量中的值替换进去。

除了系统提供的环境变量外，Koishi 还原生支持 [dotenv](https://github.com/motdotla/dotenv)。你可以在当前目录创建一个 `.env.local` 文件，并在里面填写你的环境变量。这个文件已经被包含在 `.gitignore` 中，你可以在其中填写隐私信息 (例如账号密码) 而不用担心被上传到远端。例如在上面的例子中你就可以这样写：

.env

```
DISCORD_TOKEN = xxx
```

环境变量的另一个作用是条件判断。例如官方提供的模板项目里：

koishi.yml

```
plugins:
  desktop:
    $if: env.KOISHI_AGENT?.includes('Desktop')
```

这样一来，只有当你使用桌面客户端启动 Koishi 时，这个插件才会被启用。

<!--[-->

<!--]-->

<!--[-->

[在 GitHub 编辑此页面](https://github.com/koishijs/docs/edit/main/zh-CN/guide/develop/config.md)

<!--]-->

<!---->

Pager

[上一页环境搭建](/zh-CN/guide/develop/setup.html)

<!--[-->

[下一页启动脚本](/zh-CN/guide/develop/script.html)

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

目录

* <!--[-->

  [基本用法](#基本用法 "基本用法")

  * [启动参数](#启动参数 "启动参数")
    <!---->
  * [自动重启](#自动重启 "自动重启")
    <!---->

* [开发模式](#开发模式 "开发模式")

  * [TypeScript 支持](#typescript-支持 "TypeScript 支持")
    <!---->
  * [模块热替换](#hmr "模块热替换")
    <!---->

  <!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!---->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

# 启动脚本 [​](#启动脚本)

Koishi 提供了一套命令行工具，用于读取配置文件快速启动应用。

TIP

本节中介绍的命令行都需要在 [应用目录](./config.html#应用目录) 下运行。

## 基本用法 [​](#基本用法)

我们通常使用 **启动脚本** 来启动 Koishi 应用。打开应用目录下的 `package.json` 文件：

package.json

```
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development koishi start -r esbuild-register -r yml-register",
    "start": "koishi start"
  }
}
```

在应用目录运行下面的命令行以启动 Koishi 应用：

npmyarn

npm

```
npm run start
```

在本节的后续部分，我们会介绍上述启动脚本的更多参数。无论你做何改动，你都可以使用上面的命令行来快速启动。这也是启动脚本的意义所在。

### 启动参数 [​](#启动参数)

启动脚本支持 Node.js 的 [命令行参数](https://nodejs.org/api/cli.html)。例如，上面的 `-r` 对应于 `--require`，它将允许你加载 `.ts` 和 `.yml` 后缀的文件。

除了 Node.js 的命令行参数，Koishi 还提供了一些额外的参数。我们将在下面逐一介绍。

### 自动重启 [​](#自动重启)

Koishi 的命令行工具支持自动重启。当运行 Koishi 的进程崩溃时，如果 Koishi 已经启动成功，则监视进程将自动重新启动一个新的进程。

## 开发模式 [​](#开发模式)

除了 `start` 以外，模板项目还准备了名为 `dev` 的开发模式启动脚本。在应用目录运行下面的命令行可以以开发模式启动应用：

npmyarn

npm

```
npm run dev
```

如你所见，`dev` 相当于在 `start` 指令的基础上添加了额外的参数和环境变量。这些参数为我们启用了额外的特性，而环境变量则能影响插件的部分行为。

### TypeScript 支持 [​](#typescript-支持)

Koishi 模板项目原生地支持 TypeScript 开发。上述 `-r esbuild-register` 参数允许我们在运行时直接使用工作区插件的 TypeScript 源代码。

你也可以自行扩展更多的后缀名支持。例如，如果你更喜欢 CoffeeScript，你可以这样修改你的开发脚本为：

package.json

```
{
  "scripts": {
    "dev": "koishi start -r coffeescript/register"
  },
  "devDependencies": {
    "coffeescript": "^2.7.0"
  }
}
```

这样你就可以使用 CoffeeScript 编写你的插件源代码 (当然你还得自行处理构建逻辑)，甚至连配置文件都可以使用 `koishi.coffee` 书写了。

DANGER

我们并不推荐使用高级语言来编写配置文件，因为动态的配置无法支持环境变量、配置热重载和插件市场等特性。大部分情况下我们建议仅将 `-r` 用于开发目的。

### 模块热替换 [​](#hmr)

如果你开发着一个巨大的 Koishi 项目，可能光是加载一遍全部插件就需要好几秒了。在这种时候，像前端框架一样支持模块热替换就成了一个很棒的主意。幸运的是，Koishi 也做到了这一点！内置插件 @koishijs/plugin-hmr 实现了插件级别的热替换。每当你修改你的本地文件时，Koishi 就会尝试重载你的插件，并在命令行中提醒你。

这里的行为也可以在配置文件中进行定制：

koishi.yml

```
plugins:
  group:develop:
    $if: env.NODE_ENV === 'development'
    hmr:
      root: '.'
      # 要忽略的文件列表，支持 glob patterns
      ignore:
        - some-file
```

TIP

由于部分 Linux 系统有着 8192 个文件的监听数量限制，你可能会发现运行 `yarn dev` 后出现了如下的报错：

text

```
NOSPC: System limit for number of file watchers reached
```

此时你可以使用下面的命令来增加监听数量限制：

sh

```
echo fs.inotify.max_user_watches=524288 |
sudo tee -a /etc/sysctl.conf &&
sudo sysctl -p
```

另一种方案是只监听部分子路径，例如将 `root` 改为 `external/foo` (其中 `foo` 是你正在开发的插件目录，参见下一节的工作区指南)，这将忽略其他目录下的变化，并依然对你的插件进行热重载。当你同时开发多个插件时，你也可以将 `root` 改成一个数组来使用。

<!--[-->

<!--]-->

<!--[-->

[在 GitHub 编辑此页面](https://github.com/koishijs/docs/edit/main/zh-CN/guide/develop/script.md)

<!--]-->

<!---->

Pager

[上一页配置文件](/zh-CN/guide/develop/config.html)

<!--[-->

[下一页工作区开发](/zh-CN/guide/develop/workspace.html)

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

目录

* <!--[-->
  [创建新插件](#setup "创建新插件")
  * [创建私域插件](#scoped "创建私域插件")
    <!---->

* [构建源代码](#build "构建源代码")
  <!---->

* [添加依赖](#add "添加依赖")
  <!---->

* [更新依赖版本](#dep "更新依赖版本")
  <!---->

* [二次开发](#clone "二次开发")

  * [开发插件](#开发插件 "开发插件")
    <!---->
  * [开发 Koishi](#开发-koishi "开发 Koishi")
    <!---->

  <!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!---->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

# 工作区开发 [​](#工作区开发)

Koishi 的核心是插件系统，绝大部分 Koishi 功能都可以通过插件实现。本章节将介绍如何使用模板项目开发和构建自己的 Koishi 插件。

TIP

本节中介绍的命令行都需要在 [应用目录](./config.html#应用目录) 下运行。

## 创建新插件 [​](#setup)

在应用目录运行下面的命令以创建一个新的插件工作区：

npmyarn

npm

```
npm run setup [name] -- [-c] [-m] [-G]
```

* **name:** 插件的包名，缺省时将进行提问
* **-c, --console:** 创建一个带控制台扩展的插件
* **-m, --monorepo:** 创建 monorepo 的插件
* **-G, --no-git:** 跳过 git 初始化

我们假设你创建了一个叫 `example` 的插件。那么，你将看到下面的目录结构：

diff

```
root
├── external
│   └── example
│       ├── src
│       │   └── index.ts
│       └── package.json
├── koishi.yml
└── package.json
```

打开 `index.ts` 文件，并修改其中的代码：

ts

```
import { Context } from 'koishi'

export const name = 'example'

export function apply(ctx: Context) {
  // 如果收到“天王盖地虎”，就回应“宝塔镇河妖”
  ctx.on('message', (session) => {
    if (session.content === '天王盖地虎') {
      session.send('宝塔镇河妖')
    }
  })
}
```

以 [开发模式](./script.html#开发模式) 重新运行你的项目，点击右上角的「添加插件」按钮，选择你刚才创建的插件名称，你会立即在网页控制台的配置界面中看到 `example` 插件。只需点击启用，你就可以实现与机器人的对话了：

<!---->

A

Alice

天王盖地虎

![](https://koishi.chat/logo.png)

Koishi

宝塔镇河妖

### 创建私域插件 [​](#scoped)

如果你发现想要创建的插件名称已经被占用了，除了重新想名字或在后面加上数字之外，你还可以改为创建私域插件。私域插件使用你自己的 [npm 用户名](./setup.html#注册-npm) 作为包名前缀，因此不用担心与其他人的插件冲突。

假设你的 npm 用户名是 `alice`，那么你可以使用下面的命令创建一个私域插件工作区：

npmyarn

npm

```
npm run setup @alice/example
```

此外，你还需要额外修改 `tsconfig.json` 文件。打开这个文件，你将看到下面的内容：

json

```
{
  "extends": "./tsconfig.base",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      // "@scope/koishi-plugin-*": ["external/*/src"],
      "@alice/koishi-plugin-*": ["external/*/src"],
    },
  },
}
```

找到高亮的一行代码，将其复制一份，并将 `@scope` 替换为你的 npm 用户名，然后将复制的这一行代码前面的注释符号去掉。

## 构建源代码 [​](#build)

上面的插件暂时还只能在开发模式下运行。如果想要在生产模式下使用或发布到插件市场，你需要构建你的源代码。在应用目录运行下面的命令：

npmyarn

npm

```
npm run build [...name]
```

* **name:** 要构建的插件列表，缺省时表示全部插件

还是以上面的插件 `example` 为例：

* 后端代码将输出到 `external/example/lib` 目录
* 前端代码将输出到 `external/example/dist` 目录 (如果存在)

## 添加依赖 [​](#add)

插件创建时，`package.json` 中已经包含了一些必要的依赖。如果你需要添加其他依赖，可以使用下面的命令：

npmyarn

npm

```
npm install [...deps] -w koishi-plugin-[name]
```

* **name:** 你的插件名称
* **deps:** 要添加的依赖列表

如果要添加的是 `devDependencies` 或者 `peerDependencies`，你也需要在命令后面加上 `-D` 或 `-P` 参数。关于服务类插件的依赖声明，请参考 [后续章节](./../plugin/service.html#关于-peerdependencies)。

## 更新依赖版本 [​](#dep)

尽管 npm 和 yarn 等包管理器都提供了依赖更新功能，但它们对工作区开发的支持都不是很好。因此，我们也提供了一个简单的命令用于批量更新依赖版本。

npmyarn

npm

```
npm run dep
```

这将按照每个 `package.json` 中声明的依赖版本进行更新。举个例子，如果某个依赖的版本是 `^1.1.4`，而这个依赖之后发布了新版本 `1.2.3` 和 `2.3.3`，那么运行该指令后，依赖的版本将会被更新为 `^1.2.3`。

## 二次开发 [​](#clone)

TIP

阅读本节前请确保你已经完成 [版本控制](./setup.html#版本控制) 中的全部准备工作。

TIP

如果你想要贡献原始仓库，在开始执行下面的操作之前，请确保你对要开发的仓库有写入权限。如果没有，你应当先创建属于自己的 fork，然后将下面的仓库名称替换为你的 fork 仓库名称。举个例子，假如你的 GitHub 用户名是 `alice`，那么下面你使用的仓库名称应当是 `alice/koishi-plugin-forward` 而不是 `koishijs/koishi-plugin-forward`。

二次开发是指调试或修改其他仓库中的插件。这种情况下，你需要先将对应的仓库克隆到本地，然后在本地进行调试和修改。

### 开发插件 [​](#开发插件)

其他人创建的工作区插件可以直接克隆到你的 `external` 目录下。例如，你可以使用下面的命令将 `koishi-plugin-forward` 插件克隆到本地：

npmyarn

npm

```
npm run clone koishijs/koishi-plugin-forward
```

### 开发 Koishi [​](#开发-koishi)

工作区不仅可以用于插件的二次开发，还可以用于开发 Koishi 本身。只需使用下面的命令将 Koishi 仓库克隆到本地，并完成构建：

npmyarn

npm

```
npm run clone koishijs/koishi
npm run build -w @root/koishi
```

通常来说，非插件仓库在克隆下来之后还需经过路径配置才可以正常使用。不过不同担心，模板项目支持已经内置了 Koishi 生态中的几个核心仓库 ([koishi](https://github.com/koishijs/koishi), [satori](https://github.com/satorijs/satori), [minato](https://github.com/shigma/minato)) 的路径配置。

完成上述操作后，现在你的 `yarn dev` 已经能直接使用 Koishi 的 TypeScript 源码了！

<!--[-->

<!--]-->

<!--[-->

[在 GitHub 编辑此页面](https://github.com/koishijs/docs/edit/main/zh-CN/guide/develop/workspace.md)

<!--]-->

<!---->

Pager

[上一页启动脚本](/zh-CN/guide/develop/script.html)

<!--[-->

[下一页发布插件](/zh-CN/guide/develop/publish.html)

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

目录

* <!--[-->
  [准备工作](#准备工作 "准备工作")
  <!---->

* [补充更多信息](#补充更多信息 "补充更多信息")

  * [准入条件](#准入条件 "准入条件")
    <!---->
  * [添加相关信息](#添加相关信息 "添加相关信息")
    <!---->
  * [koishi 字段](#koishi-字段 "koishi 字段")
    <!---->

* [发布插件](#发布插件-1 "发布插件")
  <!---->

* [更新插件版本](#更新插件版本 "更新插件版本")
  <!---->

* [弃用插件](#deprecate "弃用插件")
  <!---->
  <!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!---->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

# 发布插件 [​](#发布插件)

为了让别人更方便地使用你编写的插件，你需要将其作为一个 npm 包进行发布。只需满足一定的规范，你的插件就能显示在 [插件市场](./../../market/) 中，其他人可以通过控制台来安装它。

TIP

本节中介绍的命令行都需要在 [应用目录](./config.html#应用目录) 下运行。

## 准备工作 [​](#准备工作)

首先让我们关注插件目录中的 `package.json` 文件。这个文件非常重要，它包含了要发布插件的一切元信息。

diff

```
root
├── plugins
│   └── example
│       ├── src
│       │   └── index.ts
│       └── package.json        # 你应该修改这里
├── koishi.yml
└── package.json                # 而不是这里
```

TIP

请注意 `package.json` 文件不是唯一的，它在应用目录和每个插件目录都会存在。请确保你修改了正确的文件。

打开上述文件，你会看到它大概长这样：

package.json

```
{
  "name": "koishi-plugin-example",
  "version": "1.0.0",
  // ……
}
```

其中最重要的属性有两个：`name` 是要发布的包名，`version` 是当前版本号。可以看到，这里的包名相比实际在插件市场中看到的插件名多了一个 `koishi-plugin-` 的前缀，这使得我们很容易区分 Koishi 插件与其他 npm 包，同时也方便了用户安装和配置插件。

TIP

请注意：包名和版本号都是唯一的：包名不能与其他已经发布的包相同，而同一个包的同一个版本号也只能发布一次。如果出现了包名冲突或版本号冲突，则会在之后的发布流程中出现错误提示。你可以自行根据错误提示更改包名或更新插件版本。

## 补充更多信息 [​](#补充更多信息)

除了包名和版本号以外，`package.json` 还包括了插件的依赖、描述、贡献者、许可证、关键词等更多信息。你并不需要一上来就把所有信息都填写完整，因为你可以随后再进行修改。但请别忘了，这些内容也是插件的一部分，修改完成后别忘了 [更新版本](#更新插件版本) 并 [再次发布](#发布插件)。

### 准入条件 [​](#准入条件)

TIP

使用模板项目创建的插件一定是符合要求的，因此你可以跳过这一节。

要想显示在插件市场中，插件的 `package.json` 需要满足以下基本要求：

* [`name`](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#name) 必须符合以下格式之一：

  * `koishi-plugin-*`
  * `@bar/koishi-plugin-*`
  * `@koishijs/plugin-*` (官方插件)
  * 其中 `*` 是由数字、小写字母和连字符 `-` 组成的字符串

* [`name`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#name) 不能与已发布的插件重复或相似

* [`version`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#version) 应当符合 [语义化版本](https://semver.org/lang/zh-CN/) (通常从 `1.0.0` 开始)

* [`peerDependencies`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies) 必须包含 `koishi`

* 不能声明 [`private`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#private) 为 `true` (否则你的插件无法发布)

* 最新版本不能被 [弃用](https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions)

一个符合上述标准的示例：

package.json

```
{
  "name": "koishi-plugin-example",
  "version": "1.0.0",
  "peerDependencies": {
    "koishi": "^4.3.2"
  }
}
```

### 添加相关信息 [​](#添加相关信息)

除去上面的基本要求外，`package.json` 中还有一些字段能帮助显示插件的相关信息。

package.json

```
{
  "name": "koishi-plugin-example",
  "version": "1.0.0",
  "contributors": [                         // 贡献者
    "Alice <alice@gmail.com>",
    "Bob <bob@gmail.com>"
  ],
  "license": "MIT",                         // 许可证
  "homepage": "https://example.com",        // 主页
  "repository": {                           // 源码仓库
    "type": "git",
    "url": "git+https://github.com/alice/koishi-plugin-example.git"
  },
  "keywords": ["example"],                  // 关键词
  "peerDependencies": {
    "koishi": "^4.3.2"
  }
}
```

* **contributors:** 插件维护者，应该是一个数组，其中的元素通常使用 `名字 <邮箱>` 的格式
* **license:** 插件许可证，你可以在 [这里](https://choosealicense.com/licenses/) 了解各种许可证的详细信息
* **homepage:** 插件主页，可以是一个网址 (比如你的 GitHub 项目地址)
* **repository:** 插件源码仓库，应该是一个对象，其中 `type` 字段指定仓库类型，`url` 字段指定仓库地址
* **keywords:** 插件关键词，应该是一个字符串数组，会用于插件市场中的搜索功能

TIP

`package.json` 中还有一些字段没有在这里提及，如果你对此感兴趣，可以前往 [npmjs.com](https://docs.npmjs.com/files/package.json/) 查看文档。

### `koishi` 字段 [​](#koishi-字段)

除此以外，我们还提供了一个额外的 `koishi` 字段，用于指定与 Koishi 相关的信息。

package.json

```
{
  "name": "koishi-plugin-dialogue",
  "version": "1.0.0",
  "peerDependencies": {
    "koishi": "^4.3.2"
  },
  "koishi": {
    "description": {                        // 不同语言的插件描述
      "en": "English Description",
      "zh": "中文描述"
    },
    "service": {
      "required": ["database"],             // 必需的服务
      "optional": ["assets"],               // 可选的服务
      "implements": ["dialogue"],           // 实现的服务
    },
  }
}
```

* **description:** 插件描述，应该是一个对象，其中的键代表语言名，值是对应语言下的描述
* **service:** 插件的服务相关信息，详情请参见 [服务与依赖](./../plugin/service.html#package-json)
* **preview:** 配置为 `true` 可以让插件显示为「开发中」状态
* **hidden:** 配置为 `true` 可以让插件市场中不显示该插件 (通常情况下你不需要这么做)

TIP

此外，还有一些字段与 [Koishi Online](./../../cookbook/practice/online.html) 的部署流程相关 (如 `browser`, `exports` 等)。由于不影响主线开发，你可以稍后再进行了解。

## 发布插件 [​](#发布插件-1)

编辑完上面的清单文件并 [构建源代码](./workspace.html#build) 后，你就可以公开发布你的插件了。

npmyarn

npm

```
npm run pub [...name]
```

* **name:** 要发布的插件列表，缺省时表示全部 (此处 `name` 不包含 `koishi-plugin-` 前缀，而是你的工作区目录名)

这将发布所有版本号发生变动的插件。

TIP

从插件成功发布到进插件市场需要一定的时间 (通常在 15 分钟内)，请耐心等待。

TIP

如果你配置了国内镜像，你可能会遇到以下的错误提示：

text

```
No token found and can't prompt for login when running with --non-interactive.
```

此时你需要在发布时使用官方镜像，具体操作如下：

npmyarn

npm

```
npm run pub [...name] -- --registry https://registry.npmjs.org
```

对于 Yarn v2 及以上版本，你还可以分别针对发布和安装设置不同的镜像：

yarn

yarn

```
# 安装时使用国内镜像
yarn config set npmRegistryServer https://registry.npmmirror.com
# 发布时使用官方镜像
yarn config set npmPublishRegistry https://registry.yarnpkg.com
```

## 更新插件版本 [​](#更新插件版本)

初始创建的插件版本号为 `1.0.0`。当你修改过插件后，你需要更新版本号才能重新发布。在应用目录运行下面的命令以更新版本号：

npmyarn

npm

```
npm run bump [...name] -- [-1|-2|-3|-p|-v <ver>] [-r]
```

* **name:** 要更新的插件列表，不能为空

* **-1, --major:** 跳到下一个大版本，例如 `3.1.4` -> `4.0.0`

* **-2, --minor:** 跳到下一个中版本，例如 `3.1.4` -> `3.2.0`

* **-3, --patch:** 跳到下一个小版本，例如 `3.1.4` -> `3.1.5`

* **-p, --prerelease:** 跳到下一个预览版本，具体行为如下

  * 如果当前版本是 `alpha.x`，则跳到 `beta.0`
  * 如果当前版本是 `beta.x`，则跳到 `rc.0`
  * 如果当前版本是 `rc.x`，则移除 prerelease 部分
  * 其他情况下，跳到下一个大版本的 `alpha.0`

* **-v, --version:** 设置具体的版本号

* **-r, --recursive:** 递归更新依赖版本

* 缺省情况：按照当前版本的最后一位递增

当进行此操作时，其他相关插件的依赖版本也会同步更新，确保所有工作区内依赖的插件版本一致。进一步，如果你希望更新了依赖版本的插件也同时更新自身的版本，那么可以附加 `-r, --recursive` 选项。

## 弃用插件 [​](#deprecate)

如果你不再维护某个插件，或者你希望更换一个名字重新发布，那么你可以弃用该插件。在任意目录运行下面的命令以弃用插件：

sh

```
npm deprecate <full-name> <message>
# 例如
npm deprecate koishi-plugin-example "this plugin is deprecated"
```

请注意这里要写出的是完整的包名，而不是插件的目录名。

你也可以弃用某个特定版本或版本区间 (默认情况下将弃用所有版本)：

sh

```
npm deprecate <full-name>[@<version>] <message>
```

弃用插件的最新版本后，该插件将不再显示在插件市场中。未来你仍然可以发布新版本，这将使你的插件重新进入插件市场。

<!--[-->

<!--]-->

<!--[-->

[在 GitHub 编辑此页面](https://github.com/koishijs/docs/edit/main/zh-CN/guide/develop/publish.md)

<!--]-->

<!---->

Pager

[上一页工作区开发](/zh-CN/guide/develop/workspace.html)

<!--[-->

[下一页指令开发](/zh-CN/guide/basic/command.html)

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

目录

* <!--[-->

  [定义参数](#定义参数 "定义参数")

  * [变长参数](#变长参数 "变长参数")
    <!---->
  * [文本参数](#文本参数 "文本参数")
    <!---->
  * [参数类型](#argument-type "参数类型")
    <!---->

* [定义选项](#定义选项 "定义选项")

  * [选项的默认值](#选项的默认值 "选项的默认值")
    <!---->
  * [选项的重载](#选项的重载 "选项的重载")
    <!---->
  * [选项类型](#option-type "选项类型")
    <!---->

* [指令别名](#指令别名 "指令别名")
  <!---->

* [编写帮助](#编写帮助 "编写帮助")

  * [添加使用说明](#添加使用说明 "添加使用说明")
    <!---->
  * [隐藏指令和选项](#隐藏指令和选项 "隐藏指令和选项")
    <!---->

* [注册子指令](#注册子指令 "注册子指令")
  <!---->
  <!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!---->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

# 指令开发 [​](#指令开发)

TIP

在学习本节之前，建议先完整阅读 [入门 > 指令系统](./../../manual/usage/command.html)。

正如我们在入门篇中介绍的那样，一个 Koishi 机器人的绝大部分功能都是通过指令提供给用户的。Koishi 的指令系统能够高效地处理大量消息的并发调用，同时还提供了快捷方式、调用前缀、权限管理、速率限制、本地化等大量功能。因此，只需掌握指令开发并编写少量代码就可以轻松应对各类用户需求。

编写下面的代码，你就实现了一个简单的 echo 指令：

ts

```
ctx.command('echo <message>')
  .action((_, message) => message)
```

<!---->

A

Alice

echo Hello!

![](https://koishi.chat/logo.png)

Koishi

Hello!

让我们回头看看这段代码是如何工作的：

* `.command()` 方法定义了名为 echo 的指令，其有一个必选参数为 `message`
* `.action()` 方法定义了指令触发时的回调函数，第一个参数是一个 `Argv` 对象，第二个参数是输入的 `message`

这种链式的结构能够让我们非常方便地定义和扩展指令。稍后我们将看到这两个函数的更多用法，以及更多指令相关的函数。

## 定义参数 [​](#定义参数)

正如你在上面所见的那样，使用 `ctx.command(decl)` 方法可以定义一个指令，其中 `decl` 是一个字符串，包含了 **指令名** 和 **参数列表**。

* 指令名可以包含数字、字母、短横线甚至中文，但不应该包含空白字符、小数点 `.` 或斜杠 `/`；小数点和斜杠的用途参见 [注册子指令](#注册子指令) 章节
* 一个指令可以含有任意个参数，其中 **必选参数** 用尖括号包裹，**可选参数** 用方括号包裹；这些参数将作为 `action` 回调函数除 `Argv` 以外的的后续参数传入

例如，下面的程序定义了一个拥有三个参数的指令，第一个为必选参数，后面两个为可选参数，它们将分别作为 `action` 回调函数的第 2\~4 个参数：

ts

```
ctx.command('test <arg1> [arg2] [arg3]')
  .action((_, arg1, arg2, arg3) => { /* do something */ })
```

TIP

除去表达的意义不同，以及参数个数不足时使用必选参数可能产生错误信息外，这两种参数在程序上是没有区别的。与此同时，默认情况下 `action` 回调函数从第二个参数起也总是字符串。如果传入的参数不足，则对应的参数不会被传入，因此你需要自己处理可能的 `undefined`。

### 变长参数 [​](#变长参数)

有时我们需要传入未知数量的参数，这时我们可以使用 **变长参数**，它可以通过在括号中前置 `...` 来实现。在下面的例子中，无论传入了多少个参数，都会被放入 `rest` 数组进行处理：

ts

```
ctx.command('test <arg1> [...rest]')
  .action((_, arg1, ...rest) => { /* do something */ })
```

### 文本参数 [​](#文本参数)

通常来说传入的信息被解析成指令调用后，会被空格分割成若干个参数。但如果你想输入的就是含有空格的内容，可以通过在括号中后置 `:text` 来声明一个 **文本参数**。 在下面的例子中，即使 test 后面的内容中含有空格，也会被整体传入 `message` 中：

ts

```
ctx.command('test <message:text>')
  .action((_, message) => { /* do something */ })
```

TIP

文本参数的解析优先级很高，即使是之后的内容中含有选项也会被一并认为是该参数的一部分。因此，当使用文本参数时，应确保选项写在该参数之前，或 [使用引号](./../../manual/recipe/execution.html#使用引号) 将要输入的文本包裹起来。

### 参数类型 [​](#argument-type)

除去 `text` 以外，Koishi 还支持许多其他的类型。它们的用法与 `text` 无异：

ts

```
function showValue(value) {
  return `${typeof value} ${JSON.stringify(value)}`
}

ctx.command('test [arg:number]')
  .option('foo', '<val:string>')
  .action(({ options }, arg) => `${showValue(arg)} ${showValue(options.foo)}`)
```

<!---->

A

Alice

test 100 --foo 200

![](https://koishi.chat/logo.png)

Koishi

number 100 string "200"

A

Alice

test xyz

![](https://koishi.chat/logo.png)

Koishi

参数 arg 输入无效，请提供一个数字。

目前 Koishi 支持的内置类型如下：

* string: `string` 字符串
* number: `number` 数值
* bigint: `bigint` [大整数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
* text: `string` 贪婪匹配的字符串
* user: `string` 用户，格式为 `{platform}:{id}` (调用时可以使用 `at` 元素或者 `@{platform}:{id}` 的格式)
* channel: `string` 频道，格式为 `{platform}:{id}` (调用时可以使用 `sharp` 元素或者 `#{platform}:{id}` 的格式)
* integer: `number` 整数
* posint: `number` 正整数
* natural: `number` 正整数
* date: `Date` 日期
* image: `Dict` 图片

## 定义选项 [​](#定义选项)

使用 `cmd.option(name, decl)` 方法可以给指令定义参数。这个方法也是支持链式调用的，就像这样：

ts

```
ctx.command('test')
  .option('alpha', '-a')          // 定义一个选项
  .option('beta', '-b [beta]')    // 定义一个带参数的可选选项
  .option('gamma', '-c <gamma>')  // 定义一个带参数的必选选项
  .action(({ options }) => JSON.stringify(options))
```

<!---->

A

Alice

test -adb text --gamma=1 --foo-bar baz --no-xyz

![](https://koishi.chat/logo.png)

Koishi

{ "alpha": true, "d": true, "beta": "text", "gamma": 1, "fooBar": "baz", "xyz": false }

从上面的例子中我们不难看出 Koishi 指令系统的许多方便的特性：

* 使用注册的多个别名中的任何一个都会被赋值到 `name` 中
* 选项和参数之间同时支持用空格或等号隔开的语法
* 单个短横线后跟多个字母时，会把之后的参数赋给最后一个字母（如果需要参数的话）
* 多字母中如果有短横线，会被自动进行驼峰式处理
* 类型自动转换：无参数默认为 `true`，如果是数字会转化为数字，其余情况为字符串
* 支持识别未注册选项，同时会根据传入的命令行推测是否需要参数
* 如果一个未注册选项以 `no-` 开头，则会自动去除这个前缀并处理为 `false`

在调用 `cmd.option()` 时，你还可以传入第三个参数，它应该是一个对象，用于配置选项的具体特性。它们将在下面逐一介绍。

### 选项的默认值 [​](#选项的默认值)

使用 `fallback` 配置选项的默认值。配置了默认值的选项，如果没有被使用，则会按照注册的默认值进行赋值。

ts

```
ctx.command('test')
  .option('alpha', '-a', { fallback: 100 })
  .option('beta', '-b', { fallback: 100 })
  .action(({ options }) => JSON.stringify(options))
```

<!---->

A

Alice

test -b 80

![](https://koishi.chat/logo.png)

Koishi

{ "alpha": 100, "beta": 80 }

### 选项的重载 [​](#选项的重载)

将同一个选项注册多次，并结合使用 `value` 配置选项的重载值。如果使用了带有重载值的选项，将按照注册的重载值进行赋值。

ts

```
ctx.command('test')
  .option('writer', '-w <id>')
  .option('writer', '--anonymous', { value: 0 })
  .action(({ options }) => JSON.stringify(options))
```

<!---->

A

Alice

test --anonymous

![](https://koishi.chat/logo.png)

Koishi

{ "writer": 0 }

### 选项类型 [​](#option-type)

选项也可以像参数一样设置类型：

ts

```
ctx.command('text')
  .option('alpha', '-a <value:number>')
```

除了这种写法外，你还可以传入一个 `type` 属性，作为选项的临时类型声明。它可以是像上面的例子一样的回调函数，也可以是一个 `RegExp` 对象，表示传入的选项应当匹配的正则表达式：

ts

```
ctx.command('test')
  .option('beta', '-b <value>', { type: /^ba+r$/ })
  .action(({ options }) => options.beta)
```

<!---->

A

Alice

test -f bar

![](https://koishi.chat/logo.png)

Koishi

bar

A

Alice

test -f baaaz

![](https://koishi.chat/logo.png)

Koishi

选项 beta 输入无效，请检查语法。

## 指令别名 [​](#指令别名)

WARNING

由于指令名可以在用户侧配置，因此**不建议**开发者设置过多别名或以常用词作为别名。如果用户加载的多个插件都注册了同一个指令别名，那么后一个加载的插件将直接加载失败。

你可以为一条指令添加别名：

ts

```
ctx.command('echo <message>').alias('say')
```

这样一来，无论是 `echo` 还是 `say` 都能触发这条指令了。

你还可以为别名添加参数或选项：

ts

```
ctx.command('market <area> <item>').alias('市场', { args: ['China'] })
```

此时调用 `市场` 时将等价于调用 `market China`。如果你传入了更多的参数，那么它们将被添加到 `China` 之后。

## 编写帮助 [​](#编写帮助)

TIP

此功能需要安装 [@koishijs/plugin-help](./../../plugins/common/help.html) 插件。

之前已经介绍了 `ctx.command()` 和 `cmd.option()` 这两个方法，它们都能传入一个 `desc` 参数。你可以在这个参数的结尾补上对于指令或参数的说明文字，就像这样：

ts

```
ctx.command('echo <message:text> 输出收到的信息')
  .option('timeout', '-t <seconds> 设定延迟发送的时间')
```

<!---->

A

Alice

echo -h

![](https://koishi.chat/logo.png)

Koishi

echo \<message>

输出收到的信息

可用的选项有：

-t, --timeout \<seconds> 设定延迟发送的时间

### 添加使用说明 [​](#添加使用说明)

当然，我们还可以加入具体的用法和使用示例，进一步丰富这则使用说明：

ts

```
ctx.command('echo <message:text>', '输出收到的信息')
  .option('timeout', '-t <seconds> 设定延迟发送的时间')
  .usage('注意：参数请写在最前面，不然会被当成 message 的一部分！')
  .example('echo -t 300 Hello World  五分钟后发送 Hello World')
```

这时再调用 `echo -h`，你便会发现使用说明中已经添加了你刚刚的补充文本：

<!---->

A

Alice

echo -h

![](https://koishi.chat/logo.png)

Koishi

echo \<message>

输出收到的信息

注意：参数请写在最前面，不然会被当成 message 的一部分！

可用的选项有：

-t, --timeout \<seconds> 设定延迟发送的时间

使用示例：

echo -t 300 Hello World 五分钟后发送 Hello World

### 隐藏指令和选项 [​](#隐藏指令和选项)

读到这里，细心的你可能会产生一丝好奇：如果 `echo -h` 能够被解析成查看帮助的话，这个 `-h` 为什么不出现在这个帮助中呢？答案很简单，因为这个内置选项被 Koishi 隐藏起来了。如果你希望隐藏一条指令或一个选项，只需要注册时将配置项 `hidden` 设置为 `true` 即可：

ts

```
// 手动导入类型
import {} from '@koishijs/plugin-help'

ctx.command('bar 一条看不见的指令', { hidden: true })
  .option('foo', '<text> 一个看不见的选项', { hidden: true })
  .action(({ options }) => 'secret: ' + options.foo)
```

<!---->

A

Alice

help

![](https://koishi.chat/logo.png)

Koishi

当前可用的指令有：

help 显示帮助信息

输入“帮助+指令名”查看特定指令的语法和使用示例。

A

Alice

help bar

![](https://koishi.chat/logo.png)

Koishi

指令：bar

一条看不见的指令

A

Alice

bar --foo 123

![](https://koishi.chat/logo.png)

Koishi

secret: 123

如果要查看隐藏的指令和选项，可以使用 `help -H`：

<!---->

A

Alice

help -H

![](https://koishi.chat/logo.png)

Koishi

当前可用的指令有：

help 显示帮助信息

bar 一条看不见的指令

输入“帮助+指令名”查看特定指令的语法和使用示例。

A

Alice

help bar -H

![](https://koishi.chat/logo.png)

Koishi

指令：bar

一条看不见的指令

可用的选项有：

\--foo \<text> 一个看不见的选项

## 注册子指令 [​](#注册子指令)

在本节的最后，我们介绍一下[子指令](./../../manual/usage/command.html#子指令)的注册方法：

ts

```
// 层级式子指令
ctx.command('foo/bar')

// 派生式子指令
ctx.command('foo.bar')
```

是的，除了这里用到了斜杠 `/` 和小数点 `.` 来分别表示层级式和派生式子指令外，其他用法都是完全一致的。

对于已经存在的指令，你也可以使用 `cmd.subcommand()` 方法来注册子指令：

ts

```
// 层级式子指令
ctx.command('foo').subcommand('bar')

// 派生式子指令
ctx.command('foo').subcommand('.bar')
```

<!--[-->

<!--]-->

<!--[-->

[在 GitHub 编辑此页面](https://github.com/koishijs/docs/edit/main/zh-CN/guide/basic/command.md)

<!--]-->

<!---->

Pager

[上一页发布插件](/zh-CN/guide/develop/publish.html)

<!--[-->

[下一页事件系统](/zh-CN/guide/basic/events.html)

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

目录

* <!--[-->
  [基本用法](#基本用法 "基本用法")
  <!---->

* [监听事件](#监听事件 "监听事件")

  * [事件的命名](#事件的命名 "事件的命名")
    <!---->
  * [前置事件](#前置事件 "前置事件")
    <!---->

* [触发事件](#触发事件 "触发事件")

  * [触发方式](#触发方式 "触发方式")
    <!---->
  * [过滤触发上下文](#过滤触发上下文 "过滤触发上下文")
    <!---->

* [自定义事件](#自定义事件 "自定义事件")
  <!---->
  <!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!---->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

# 事件系统 [​](#事件系统)

在上一节中我们了解了指令开发，现在让我们回到更加基础的事件系统。事件系统在 Koishi 中扮演着底层的角色，它不仅包含由聊天平台触发的会话事件，还包含了监听运行状态的生命周期事件和提供扩展性的自定义事件。

## 基本用法 [​](#基本用法)

让我们先从一个基本示例开始：

ts

```
ctx.on('message', (session) => {
  if (session.content === '天王盖地虎') {
    session.send('宝塔镇河妖')
  }
})
```

上述代码片段实现了一个简单的功能：当任何用户发送「天王盖地虎」时，机器人将发送「宝塔镇河妖」。如你所见，`ctx.on()` 方法监听了一个事件。传入的第一个参数 `message` 是事件的名称，而第二个参数则是事件的回调函数。每一次 `message` 事件被触发 (即收到消息) 时都会调用该函数。

回调函数接受一个参数 `session`，称为**会话对象**。在这个例子中，我们通过它访问事件相关的数据 (使用 `session.content` 获取消息的内容)，并调用其上的 API 作为对此事件的响应 (使用 `session.send()` 在当前频道内发送消息)。

事件与会话构成了最基础的交互模型。这种模型不仅能够处理消息，还能够处理其他类型的事件。我们再给出一个例子：

ts

```
// 当有好友请求时，接受请求并发送欢迎消息
ctx.on('friend-request', async (session) => {
  // session.bot 是当前会话绑定的机器人实例
  await session.bot.handleFriendRequest(session.messageId, true)
  await session.bot.sendPrivateMessage(session.userId, '很高兴认识你！')
})
```

像这样由聊天平台推送的事件，我们称之为 **会话事件**。除此以外，Koishi 还有着其他类型的事件，例如由 Koishi 自身生成的 **生命周期事件**，又或者是由插件提供的 **自定义事件** 等等。这些事件的监听方式与会话事件基本一致，只不过它们的回调函数接受的参数不同。例如下面的代码实现了当 Bot 上线时自动给自己发送一条消息的功能：

ts

```
// bot-status-updated 不是会话事件
// 所以回调函数接受的参数不是 session 而是 bot
ctx.on('bot-status-updated', (bot) => {
  if (bot.status === Status.ONLINE) {
    // 这里的 userId 换成你的账号
    bot.sendPrivateMessage(userId, '我上线了~')
  }
})
```

在后续的章节中，我们也将介绍更多的事件和会话的使用方法。

## 监听事件 [​](#监听事件)

在上面的例子中，我们已经了解到事件系统的基本用法：使用 `ctx.on()` 注册监听器。它的写法与 Node.js 自带的 [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) 类似：第一个参数表示要监听的事件名称，第二个参数表示事件的回调函数。同时，我们也提供了类似的函数 `ctx.once()`，用于注册一个只触发一次的监听器；以及 `ctx.off()`，用于取消一个已注册的监听器。

这套事件系统与 EventEmitter 的一个不同点在于，无论是 `ctx.on()` 还是 `ctx.once()` 都会返回一个 dispose 函数，调用这个函数即可取消注册监听器。因此你其实不必使用 `ctx.once()` 和 `ctx.off()`。下面给一个只触发一次的监听器的例子：

ts

```
declare module 'koishi' {
  interface Events {
    foo(...args: any[]): void
  }
}
// ---cut---
// 回调函数只会被触发一次
const dispose = ctx.on('foo', (...args) => {
  dispose()
  // do something
})
```

### 事件的命名 [​](#事件的命名)

无论是会话事件，生命周期事件还是插件自定义的事件，Koishi 的事件名都遵循着一些既定的规范。遵守规范能够让开发者获得一致的体验，提高开发和调试的效率。它们包括：

* 总是使用 param-case 作为事件名
* 通过命名空间进行管理，使用 `/` 作为分隔符
* 配对使用 xxx 和 before-xxx 命名具有时序关系的事件

举个例子，koishi-plugin-dialogue 扩展了多达 20 个自定义事件。为了防止命名冲突，所有的事件都以 `dialogue/` 开头，并且在特定操作前触发的事件都包含了 `before-` 前缀，例如：

* dialogue/before-search: 获取搜索结果前触发
* dialogue/search: 获取完搜索结果后触发

### 前置事件 [​](#前置事件)

前面介绍了，Koishi 有不少监听器满足 before-xxx 的形式。对于这类监听器的注册，我们也提供了一个语法糖，那就是 `ctx.before('xxx', callback)`。这种写法也支持命名空间的情况：

ts

```
// @errors: 2304
ctx.before('dialogue/search', callback)
// 相当于
ctx.on('dialogue/before-search', callback, true)
```

默认情况下，事件的多个回调函数的执行顺序取决于它们添加的顺序。先注册的回调函数会先被执行。如果你希望提高某个回调函数的优先级，可以给 `ctx.on()` 传入第三个参数 `prepend`，设置为 true 即表示添加到事件执行队列的开头而非结尾，相当于 [`emitter.prependListener()`](https://nodejs.org/api/events.html#emitterprependlistenereventname-listener)。

对于 `ctx.before()`，情况则正好相反。默认的行为的先注册的回调函数后执行，同时 `ctx.before()` 的第三个参数 `append` 则表示添加到事件执行队列的末尾而非开头。

## 触发事件 [​](#触发事件)

如果你开发的插件希望允许其他插件扩展，那么触发事件就是最简单的方式。

触发事件的基本用法也都与 EventEmitter 类似，第一个参数是事件名称，之后的参数对应回调函数的参数。下面是一个例子：

ts

```
declare module 'koishi' {
  interface Events {
    'custom-event'(...args: any[]): void
  }
}

// ---cut---
// @errors: 2304
ctx.emit('custom-event', arg1, arg2, ...rest)
// 对应于
ctx.on('custom-event', (arg1, arg2, ...rest) => {})
```

### 触发方式 [​](#触发方式)

Koishi 的事件系统与 EventEmitter 的另一个区别在于，触发一个事件可以有着多种形式，目前支持 4 个不同的方法，足以适应绝大多数需求。

* emit: 同时触发所有 event 事件的回调函数
* parallel: 上述方法对应的异步版本
* bail: 依次触发所有 event 事件的回调函数；当返回一个 `false`, `null`, `undefined` 以外的值时将这个值作为结果返回
* serial: 上述方法对应的异步版本

此外，你还将在下一节学习 [中间件](./middleware.html)，它提供了一种更加强大的消息事件处理流程。

### 过滤触发上下文 [​](#过滤触发上下文)

如果你的自定义事件与某个特定会话相关 (并不需要是会话事件)，你可以在触发事件的时候传入一个额外的一参数 `session`，以实现对触发上下文的过滤：

ts

```
declare module 'koishi' {
  interface Events {
    'custom-event'(...args: any[]): void
  }
}

// ---cut---
// @errors: 2304
// 无法匹配该会话的上下文中注册的回调函数不会被执行 (可能有点绕)
ctx.emit(session, 'custom-event', arg1, arg2, ...rest)
```

过滤触发上下文的效果将在 [过滤器](./../plugin/filter.html) 一节中详细介绍。

更一般地，即使是不使用会话的事件也能主动选择触发的上下文，其语法完全一致：

ts

```
const thisArg = { [Context.filter]: callback }
ctx.emit(thisArg, 'custom-event', arg1, arg2, ...rest)
```

触发事件时传入的一参数如果是对象，则会作为事件回调函数的 `this`。并且如果这个对象有 `Context.filter` 属性，那么这个属性将被用于过滤触发上下文。对应的值是一个函数，传入一个上下文对象，返回一个 boolean 表示是否应该在该上下文上触发该事件。而上面介绍的会话事件只是一种特殊情况而已。

## 自定义事件 [​](#自定义事件)

在本节的最后，我们来聊聊插件扩展的事件系统。

如果你是插件的开发者，想要自定义一些事件，那么只需要在你的插件中添加下面的代码：

ts

```
declare module 'koishi' {
  interface Events {
    // 方法名称对应自定义事件的名称
    // 方法签名对应事件的回调函数签名
    'kook/message-btn-click'(...args: any[]): void
  }
}
```

如果你监听的事件由其他插件扩展而来，那么你同样需要通过一行额外的代码来导入相应的类型：

ts

```
// 从 @koishijs/plugin-adapter-kook 导入事件类型
// 这里的 import {} from 会在编译时被删除，不会影响运行时的行为
// 请不要写成 import '@koishijs/plugin-adapter-kook'
import {} from '@koishijs/plugin-adapter-kook'

// 如果没有上面的类型导入，下面的代码会报错
ctx.on('kook/message-btn-click', callback)
```

<!--[-->

<!--]-->

<!--[-->

[在 GitHub 编辑此页面](https://github.com/koishijs/docs/edit/main/zh-CN/guide/basic/events.md)

<!--]-->

<!---->

Pager

[上一页指令开发](/zh-CN/guide/basic/command.html)

<!--[-->

[下一页中间件](/zh-CN/guide/basic/middleware.html)

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

目录

* <!--[-->
  [基本用法](#基本用法 "基本用法")
  <!---->
* [异步中间件](#异步中间件 "异步中间件")
  <!---->
* [前置中间件](#前置中间件 "前置中间件")
  <!---->
* [临时中间件](#临时中间件 "临时中间件")
  <!---->
  <!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!---->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

# 中间件 [​](#中间件)

有了接收事件和发送消息的能力，似乎你就能完成一切工作了——很多机器人框架也的确是这么想的。但是从 Koishi 的角度，这还远远不够。因为当我们面临更复杂的需求时，新的问题也会随之产生：如何限制消息能触发的应答次数？如何进行权限管理？如何提高机器人的性能？这些问题的答案将我们引向另一套更高级的系统——这也就是中间件的由来。

中间件是对消息事件处理流程的再封装。你注册的所有中间件将会由一个事件监听器进行统一管理，数据流向下游，控制权流回上游——这可以有效确保了任意消息都只被处理一次。被认定为无需继续处理的消息不会进入下游的中间件——这让我们能够轻易地实现权限管理。与此同时，Koishi 的中间件也支持异步调用，这使得你可以在中间件函数中实现任何逻辑。事实上，相比更加底层地调用事件监听器，**使用中间件处理消息才是 Koishi 更加推荐的做法**。

TIP

与事件系统的通用性不同，中间件专注于消息事件。你不能使用中间件处理其他类型的事件。

## 基本用法 [​](#基本用法)

还记得上一节介绍的 [基本示例](./events.html#基本用法) 吗？让我们把它改成中间件的形式：

ts

```
// 如果收到“天王盖地虎”，就回应“宝塔镇河妖”
ctx.middleware((session, next) => {
  if (session.content === '天王盖地虎') {
    return '宝塔镇河妖'
  } else {
    // 如果去掉这一行，那么不满足上述条件的消息就不会进入下一个中间件了
    return next()
  }
})
```

中间件与事件的写法非常相似，但有三点区别：

* 事件使用 `ctx.on()` 注册，而中间件使用 `ctx.middleware()` 注册
* 中间件的回调函数接受额外的第二个参数 `next`，只有调用了它才会进入接下来的流程
* 中间件支持直接返回要发送的内容，而事件需要手动调用 `session.send()`

同事件类似，注册中间件时也会返回一个新的函数，调用这个函数就可以取消该中间件：

ts

```
declare const callback: import('koishi').Middleware
// ---cut---
const dispose = ctx.middleware(callback)
dispose() // 取消中间件
```

## 异步中间件 [​](#异步中间件)

中间件也可以是异步的。下面给出一个示例：

ts

```
ctx.middleware(async (session, next) => {
  // 获取数据库中的用户信息
  // 这里只是示例，事实上 Koishi 会自动获取数据库中的信息并存放在 session.user 中
  const user = await session.getUser(session.userId)
  if (user.authority === 0) {
    return '抱歉，你没有权限访问机器人。'
  } else {
    return next()
  }
})
```

注意

异步中间件代码中，`next` 函数被调用时前面必须加上 await (或者 return)。如果删去将可能会导致时序错误，这在 Koishi 中将会抛出一个运行时警告。

## 前置中间件 [​](#前置中间件)

从上面的两个例子中不难看出，中间件是一种消息过滤的利器。但是反过来，当你需要的恰恰是捕获全部消息时，中间件反而不会是最佳选择——因为更早注册的中间件可能会将消息过滤掉，导致你注册的回调函数根本不被执行。因此在这种情况下，我们更推荐使用事件监听器。然而，还存在着这样一种情况：你既需要捕获全部的消息，又要对其中的一些加以回复，这又该怎么处理呢？

听起来这种需求有些奇怪，让我们举个具体点例子吧：假如你写的是一个复读插件，它需要在每次连续接收到 3 条相同消息时进行复读。我们不难使用事件监听器实现这种逻辑：

ts

```
let times = 0 // 复读次数
let message = '' // 当前消息

ctx.on('message', (session) => {
  // 这里其实有个小问题，因为来自不同群的消息都会触发这个回调函数
  // 因此理想的做法应该是分别记录每个群的当前消息和复读次数
  // 但这里我们假设机器人只处理一个群，简化示例的逻辑
  if (session.content === message) {
    times += 1
    if (times === 3) session.send(message)
  } else {
    times = 0
    message = session.content
  }
})
```

但是这样写出的机器人就存在所有用事件监听器写出的机器人的通病——如果这条消息本身可以触发其他回应，机器人就会多次回应。更糟糕的是，你无法预测哪一次回应先发生，因此这样写出的机器人就会产生延迟复读的迷惑行为。为了避免这种情况发生，Koishi 对这种情况也有对应的解决方案，那就是 **前置中间件**。

与前置事件类似，向 `ctx.middleware()` 传入额外的第二个参数 `true` 以注册前置中间件。所有消息会优先经过前置中间件，像事件监听器一样，并且你获得了决定这条消息是否继续触发其他中间件的能力，这是事件监听器所不具有的。

ts

```
let times = 0 // 复读次数
let message = '' // 当前消息

ctx.middleware((session, next) => {
  if (session.content === message) {
    times += 1
    if (times === 3) return message
  } else {
    times = 0
    message = session.content
    return next()
  }
}, true /* true 表示这是前置中间件 */)
```

## 临时中间件 [​](#临时中间件)

有的时候，你也可能需要实现这样一种逻辑：你的中间件产生了一个响应，但你认为这个响应优先级较低，希望等后续中间件执行完毕后，如果信号仍然未被截取，就执行之前的响应。这当然可以通过注册新的中间件并取消的方法来实现，但是由于这个新注册的中间件可能不被执行，你需要手动处理许多的边界情况。

为了应对这种问题 Koishi 提供了更加方便的写法：你只需要在调用 `next` 时再次传入一个回调函数即可！这个回调函数只接受一个 `next` 参数，且只会加入当前的中间件执行队列；无论这个回调函数执行与否，在本次中间件解析完成后，它都会被清除。下面是一个例子：

ts

```
ctx.middleware((session, next) => {
  if (session.content === 'hlep') {
    // 如果该 session 没有被截获，则这里的回调函数将会被执行
    return next('你想说的是 help 吗？')
  } else {
    return next()
  }
})
```

除此以外，临时中间件还有下面的用途。让我们先回到上面介绍的前置中间件。它虽然能够成功解决问题，但是如果有两个插件都注册了类似的前置中间件，就仍然可能发生一个前置中间件截获了消息，导致另一个前置中间件获取不到消息的情况发生。但是，借助临时中间件，我们便有了更好的解决方案：

ts

```
let times = 0 // 复读次数
let message = '' // 当前消息

ctx.middleware((session, next) => {
  if (session.content === message) {
    times += 1
    if (times === 3) return next(message)
  } else {
    times = 0
    message = session.content
    return next()
  }
}, true)
```

搭配使用上面几种中间件，你的机器人便拥有了无限可能。在 koishi-plugin-repeater 库中，就有着一个官方实现的复读功能，它远比上面的示例所显示的更加强大。如果想深入了解中间件机制，可以去研究一下这个功能的 [源代码](https://github.com/koishijs/koishi-plugin-repeater/blob/main/src/index.ts)。

<!--[-->

<!--]-->

<!--[-->

[在 GitHub 编辑此页面](https://github.com/koishijs/docs/edit/main/zh-CN/guide/basic/middleware.md)

<!--]-->

<!---->

Pager

[上一页事件系统](/zh-CN/guide/basic/events.html)

<!--[-->

[下一页消息元素](/zh-CN/guide/basic/element.html)

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

目录

* <!--[-->

  [基本用法](#基本用法 "基本用法")

  * [使用 JSX](#使用-jsx "使用 JSX")
    <!---->
  * [使用 API](#使用-api "使用 API")
    <!---->
  * [混用两种写法](#混用两种写法 "混用两种写法")
    <!---->

* [标准元素](#标准元素 "标准元素")

  * [提及用户和消息](#提及用户和消息 "提及用户和消息")
    <!---->
  * [嵌入图片和其他资源](#嵌入图片和其他资源 "嵌入图片和其他资源")
    <!---->

* [消息组件](#消息组件 "消息组件")

  * [定义消息组件](#定义消息组件 "定义消息组件")
    <!---->
  * [注册全局组件](#注册全局组件 "注册全局组件")
    <!---->

* [转义与解析](#转义与解析 "转义与解析")
  <!---->
  <!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!---->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

# 消息元素 [​](#消息元素)

当然，一个聊天平台所能发送或接收的内容往往不只有纯文本。为此，我们引入了 **消息元素 (Element)** 的概念。

消息元素类似于 HTML 元素，它是组成消息的基本单位。一个元素可以表示具有特定语义的内容，如文本、表情、图片、引用、元信息等。Koishi 会将这些元素转换为平台所支持的格式，以便在不同平台之间发送和接收消息。

## 基本用法 [​](#基本用法)

一个典型的元素包含名称、属性和内容。在 Koishi 中，我们通常使用 JSX 或 API 的方式创建元素。下面是一些例子：

JSXAPI

JSX

```
// 欢迎 @用户名 入群！
session.send(<>欢迎 <at id={userId}/> 入群！</>)

// 发送一张 Koishi 图标
session.send(<img src="https://koishi.chat/logo.png"/>)
```

这两种写法各有优劣，不同人可能会有不同的偏好。但无论哪一种写法都表达了同样的意思。

### 使用 JSX [​](#使用-jsx)

学习 JSX 的写法需要你有一定的 HTML 基础 (如果有 React 基础将更好，尽管这不是必需的)。如果你不熟悉 HTML，可以参考 [这篇文档](https://developer.mozilla.org/zh-CN/docs/Glossary/Element)。

如果你已经学习过 HTML 的相关知识，你唯一额外需要了解的事情就是我们使用单花括号 `{}` 进行插值。你可以在单花括号中使用任何 JavaScript 表达式，它们会在运算完成后成为元素的一部分。此外，我们还为消息元素编写了完整的 [语法规范](./../../api/message/syntax.html)，供你参考。

### 使用 API [​](#使用-api)

对于更喜欢原生 JavaScript 的人，我们也提供了 API 的方式来创建元素。Koishi 提供一个 `h` 函数，它有着灵活的使用方式：

ts

```
// 第一个参数是元素名称 (必选)
h('message')

// 你可以传入一个由属性构成的对象作为第二个参数
h('quote', { id })

// 后续参数是元素的内容，可以是字符串或其他元素
h('p', {}, 'hello')

// 没有属性时二参数可以忽略不写
h('p', 'hello', h('img', { src }))
```

### 混用两种写法 [​](#混用两种写法)

虽然大部分情况下你可能并不想这么做 (看起来很怪不是吗)，但事实上这两种写法也是可以混用的。例如，你可以在 JSX 中使用 `h` 函数：

tsx

```
// 欢迎 @用户名 入群！
<>欢迎 {h('at', { id: userId })} 入群！</>
```

也可以反过来，将由 JSX 创建出的元素传入 `h` 函数的参数中：

tsx

```
// 创建一个仅包含图片的消息
h('message', <img src="https://koishi.chat/logo.png"/>)
```

## 标准元素 [​](#标准元素)

Koishi 提供了一系列标准元素，它们覆盖了绝大部分常见的需求。例如：

* `at`：提及用户
* `quote`：引用回复
* `img`：嵌入图片
* `message`：发送消息

尽管一个平台不太可能支持所有的行为，但适配器对每一个标准元素都进行了最大程度的适配。例如，对于不支持斜体的平台，我们会将斜体元素转换为普通文本；对于无法同时发送多张图片的平台，我们会将多张图片转换为多条消息分别发送等等。这样一来，开发者便可以在不同平台上使用同一套代码，而不用担心平台差异。

我们先对比较常用的一些元素进行介绍，你可以稍后在 [这个页面](./../../api/message/elements.html) 查看所有的标准元素。

### 提及用户和消息 [​](#提及用户和消息)

使用 `at` 元素提及用户：

html

```
欢迎 <at id={userId}/> 入群！
```

<!---->

![](https://koishi.chat/logo.png)

Koishi

欢迎 @用户名 入群！

使用 `quote` 元素引用回复：

html

```
<quote id={messageId}/> 你说得对
```

<!---->

![](https://koishi.chat/logo.png)

Koishi

> 原消息文本

你说得对

### 嵌入图片和其他资源 [​](#嵌入图片和其他资源)

使用 `img`, `audio`, `video` 和 `file` 元素嵌入图片、音频、视频和文件，它们的用法是类似的。这里以图片为例：

html

```
<img src="https://koishi.chat/logo.png"/>
```

<!---->

![](https://koishi.chat/logo.png)

Koishi

![Koishi Logo](https://koishi.chat/logo.png)

上面是对于网络图片的用法，如果你想发送本地图片，可以使用 `file:` URL：

tsx

```
import { pathToFileURL } from 'url'
import { resolve } from 'path'

// 发送相对路径下的 logo.png
h.image(pathToFileURL(resolve(__dirname, 'logo.png')).href)

// 等价于下面的写法
<img src={pathToFileURL(resolve(__dirname, 'logo.png')).href}/>
```

如果图片以二进制数据的形式存在于内存中，你也可以直接通过 `h.image()` 构造 `data:` URL：

tsx

```
// 这里的二参数是图片的 MIME 类型
h.image(buffer, 'image/png')

// 等价于下面的写法
<img src={'data:image/png;base64,' + buffer.toString('base64')}/>
```

## 消息组件 实验性 [​](#消息组件)

**消息组件 (Component)** 是一种对消息元素的扩展和封装。它允许你创建可重用的定制元素，并在渲染时引入自定义逻辑。例如，`<execute>` 组件会将其中的内容作为指令执行，并将执行结果替换该元素：

html

```
这是执行结果：<execute>echo hello</execute>
```

<!---->

![](https://koishi.chat/logo.png)

Koishi

这是执行结果：hello

如你所见，你可以像使用普通的消息元素一样使用消息组件。唯一的区别是消息组件不由适配器实现，而是由 Koishi 直接处理。与之相对的，某些消息组件只有在特定的会话环境下才能使用 (例如在 `ctx.broadcast()` 中传入 `<execute>` 是无意义的，也会抛出错误)。

Koishi 已经内置了一系列消息组件，包括：

* `<execute>`：执行指令
* `<prompt>`：等待输入
* `<i18n>`：国际化
* `<random>`：随机选择

你可以在 [这个页面](./../../api/message/components.html) 了解每个组件的详细用法和适用范围。

### 定义消息组件 [​](#定义消息组件)

一个消息组件本质上是一个函数，它接受三个参数：

* **attrs:** 元素的属性
* **children:** 子元素列表
* **session:** 当前会话

例如，下面的代码就定义了一个简单的消息组件：

ts

```
// 请注意函数名必须以大写字母开头
function Custom(attrs, children, session) {
  return '自定义内容'
}
```

你可以直接在渲染时使用这个组件：

JSXAPI

JSX

```
// 请注意这里的大写字母
session.send(<Custom/>)
```

### 注册全局组件 [​](#注册全局组件)

上面的写法只能在当前文件中使用，并且必须以大写字母开头。如果想要更自然的写法，并将组件提供给其他插件使用，只需使用 `ctx.component()` 将它注册为一个全局组件：

ts

```
ctx.component('custom', (attrs, children, session) => {
  return '自定义内容'
})

// 现在你可以在任何地方使用小写的 <custom/> 了
session.send(<custom/>)
```

## 转义与解析 [​](#转义与解析)

DANGER

直接发送未经转义的用户输入是非常危险的，因为它很容易导致 [XSS 攻击](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%B6%B2%E7%AB%99%E6%8C%87%E4%BB%A4%E7%A2%BC)。在使用诸如 `h.unescape()` 之类的 API 时，请务必确保输入的安全性。

在默认情况下，Koishi 会对指令参数进行转义以确保安全性。但在某些情况下，你可能希望手动处理消息元素的转义和解析。为此，我们提供了一系列实用方法：

* [`h.escape()`](./../../api/message/api.html#h-escape): 转义字符串
* [`h.unescape()`](./../../api/message/api.html#h-unescape): 反转义字符串
* [`h.parse()`](./../../api/message/api.html#h-parse): 将字符串解析为消息元素
* [`h.select()`](./../../api/message/api.html#h-select): 从消息元素中选择指定类型的元素
* [`h.transform()`](./../../api/message/api.html#h-transform): 在消息元素中查找并替换指定类型的元素
* [`h.transformAsync()`](./../../api/message/api.html#h-transformasync): 上述方法的异步版本

<!--[-->

<!--]-->

<!--[-->

[在 GitHub 编辑此页面](https://github.com/koishijs/docs/edit/main/zh-CN/guide/basic/element.md)

<!--]-->

<!---->

Pager

[上一页中间件](/zh-CN/guide/basic/middleware.html)

<!--[-->

[下一页进阶用法](/zh-CN/guide/basic/advanced.html)

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

目录

* <!--[-->
  [机器人对象](#机器人对象 "机器人对象")
  <!---->
* [广播消息](#广播消息 "广播消息")
  <!---->
* [等待输入](#等待输入 "等待输入")
  <!---->
* [延时发送](#延时发送 "延时发送")
  <!---->
* [执行指令](#执行指令 "执行指令")
  <!---->
  <!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!---->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->

# 进阶用法 [​](#进阶用法)

在前面的几节中，我们已经了解了基础的交互概念。以他们为基础，Koishi 提供了一些进阶的用法，用于处理真实应用场景中的交互需求。

## 机器人对象 [​](#机器人对象)

我们通常将机器人做出的交互行为分为两种：主动交互和被动交互。**主动交互**是指机器人主动进行某些操作，而**被动交互**则是指机器人接收到特定事件后做出的响应。一个机器人的大部分交互都应该是被动的，而主动交互则可用于一些特殊情况，比如定时任务、通知推送等。

Koishi 提供的交互性 API 可能存在于 `ctx`，`session` 和 `bot` 三种对象中。其中，上下文对象 `ctx` 可以在插件参数中取得，会话对象 `session` 可以在被动交互中取得，而机器人对象 `bot` 则可以从上述两个对象中访问到：

ts

```
// 从 session 中访问 bot
session.bot

// 从 ctx 中访问 bot，其中 platform 和 selfId 分别是平台名称和机器人 ID
ctx.bots[`${platform}:${selfId}`]
```

在之后的章节中，我们将进一步了解这三种对象的用法。

## 广播消息 [​](#广播消息)

主动交互中的一种常见需求是同时向多个频道发送消息。Koishi 提供了两套方法来实现消息的广播。最基础的写法是直接使用 `bot.broadcast()`：

ts

```
// 一参数填写你要发送到的频道 ID 列表
await bot.broadcast(['123456', '456789'], '全体目光向我看齐')
```

但这样写需要知道每一个频道对应哪个机器人。对于启用了多个机器人的场景下，这么写就有点不方便了。幸运的是，Koishi 还有另一个方法：`ctx.broadcast()`。在启用了数据库的情况下，此方法会自动获取每个频道的 [受理人](./../../manual/usage/customize.html#受理人机制)，并以对应的账号发送消息：

ts

```
await ctx.broadcast(['telegram:123456', 'discord:456789'], '全体目光向我看齐')
```

## 等待输入 [​](#等待输入)

当你需要进行一些交互式操作时，可以使用 `session.prompt()`：

ts

```
await session.send('请输入用户名：')

const name = await session.prompt()
if (!name) return '输入超时。'

// 执行后续操作
return `${name}，请多指教！`
```

你可以给这个方法传入一个 `timeout` 参数，或使用 `delay.prompt` 配置项，来作为等待的时间。

## 延时发送 [​](#延时发送)

如果你需要连续发送多条消息，那么在各条消息之间留下一定的时间间隔是很重要的：一方面它可以防止消息刷屏和消息错位 (后发的条消息呈现在先发的消息前面)，提高了阅读体验；另一方面它能够有效降低机器人发送消息的频率，防止被平台误封。这个时候，`session.sendQueued()` 可以解决你的问题。

ts

```
// 发送两条消息，中间间隔一段时间，这个时间由系统计算决定
await session.sendQueued('message1')
await session.sendQueued('message2')

// 清空等待队列
await session.cancelQueued()
```

你也可以在发送时手动定义等待的时长：

ts

```
import { Time } from 'koishi'

// 如果消息队列非空，在前一条消息发送完成后 1s 发送本消息
await session.sendQueued('message3', Time.second)

// 清空等待队列，并设定下一条消息发送距离现在至少 0.5s
await session.cancelQueued(0.5 * Time.second)
```

事实上，对于不同的消息长度，系统等待的时间也是不一样的，你可以通过配置项修改这个行为：

yaml

```
delay:
  # 消息里每有一个字符就等待 0.02s
  character: 20
  # 每条消息至少等待 0.5s
  message: 500
```

这样一来，一段长度为 60 个字符的消息发送后，下一条消息发送前就需要等待 1.2 秒了。

## 执行指令 [​](#执行指令)

我们还可以实用 `session.execute()` 来让用户执行某条指令：

ts

```
// 当用户输入“查看帮助”时，执行 help 指令
ctx.middleware((session, next) => {
  if (session.content === '查看帮助') {
    return session.execute('help', next)
  } else {
    return next()
  }
})
```

<!--[-->

<!--]-->

<!--[-->

[在 GitHub 编辑此页面](https://github.com/koishijs/docs/edit/main/zh-CN/guide/basic/advanced.md)

<!--]-->

<!---->

Pager

[上一页消息元素](/zh-CN/guide/basic/element.html)

<!--[-->

[下一页认识插件](/zh-CN/guide/plugin/)

<!--]-->

<!--[-->

<!--]-->

<!--[-->

<!--]-->
