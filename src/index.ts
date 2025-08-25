import { Context, Schema, h } from 'koishi';
import { promises as fs } from 'node:fs';
import { resolve, dirname } from 'node:path'; // TMD，这里加了 dirname
import { fileURLToPath } from 'node:url'; // TMD，这里加了 fileURLToPath

export const name = 'comfyui-lumi'; // 插件名称

// 定义插件配置接口
export interface Config {
  comfyuiServer: string; // ComfyUI服务器地址
  workflowPath: string;  // 工作流JSON文件路径
  triggerPrefixes: string[]; // 触发前缀列表
  pollInterval: number;  // 轮询ComfyUI任务状态的间隔时间（毫秒）
  pollTimeout: number;   // 等待ComfyUI任务完成的超时时间（毫秒）
  
  // 新增分辨率配置
  defaultWidth: number;
  defaultHeight: number;
  landscapeWidth: number;
  landscapeHeight: number;
  squareSize: number;
  portraitWidth: number;
  portraitHeight: number;
}

// 定义插件配置的Schema，用于Koishi控制台的配置界面
export const Config: Schema<Config> = Schema.object({
  comfyuiServer: Schema.string()
    .pattern(/^https?:\/\/[^\s/$.?#].[^\s]*$/)
    .default('http://127.0.0.1:8189')
    .description('ComfyUI 服务器的地址，例如 http://127.0.0.1:8189。'),
  workflowPath: Schema.string()
    .default('Lumi_Chatglm_1155.json') // TMD，这里改成相对路径了！
    .description('ComfyUI 工作流 JSON 文件的相对路径（相对于插件 src 目录）或绝对路径。'),
  triggerPrefixes: Schema.array(String)
    .default(['鹿鸣', 'lumi', 'Lumi'])
    .description('用户消息以这些前缀开头时，将触发 ComfyUI 生成图片。例如“鹿鸣在海边”会匹配“鹿鸣”。'),
  pollInterval: Schema.number()
    .min(500)
    .max(10000)
    .default(1000)
    .description('轮询 ComfyUI 任务状态的间隔时间（毫秒）。'),
  pollTimeout: Schema.number()
    .min(10000)
    .max(300000)
    .default(60000)
    .description('等待 ComfyUI 任务完成的超时时间（毫秒）。'),

  // 新增分辨率配置项
  defaultWidth: Schema.number().default(896).description('默认图片宽度（未指定横竖屏或正方形时）。'),
  defaultHeight: Schema.number().default(1600).description('默认图片高度（未指定横竖屏或正方形时）。'),
  landscapeWidth: Schema.number().default(1280).description('横屏模式下的图片宽度。'),
  landscapeHeight: Schema.number().default(720).description('横屏模式下的图片高度。'),
  squareSize: Schema.number().default(1024).description('正方形模式下的图片边长。'),
  portraitWidth: Schema.number().default(896).description('竖屏模式下的图片宽度。'),
  portraitHeight: Schema.number().default(1600).description('竖屏模式下的图片高度。'),
});

// 插件的 apply 函数，Koishi启动时会调用
export function apply(ctx: Context, config: Config) {
  let workflowTemplate: any = null; // 用于存储加载的工作流JSON模板

  // 注册 lumi 指令，用于显示帮助信息和触发图片生成
  ctx.command('lumi', 'ComfyUI 鹿鸣画图插件')
    .alias('鹿鸣') // 添加别名，方便用户使用
    .usage('欢迎使用 ComfyUI 鹿鸣画图插件！\n\n' +
           '本插件通过 ComfyUI 服务器为您生成图片。\n' +
           '使用方法：在消息开头输入以下任意前缀，然后加上您想生成图片的描述。\n' +
           `当前支持的前缀有：${config.triggerPrefixes.map(p => `“${p}”`).join('、')}。\n\n` +
           '请注意：\n' +
           '1. 图片生成可能需要一些时间，请耐心等待。\n' +
           '2. 您可以在描述中加入“横屏”、“竖屏”或“正方形”来指定图片尺寸。\n' +
           '3. 如果生成失败或超时，请检查 ComfyUI 服务器是否正常运行，或联系管理员。')
    .example('鹿鸣一只猫 - 生成一张猫的图片')
    .example('lumi 一只狗在草地上奔跑 横屏 - 生成一张横屏的狗的图片')
    .example('Lumi 一座城堡 正方形 - 生成一张正方形的城堡图片')
    .example('Lumi 一个小女孩 竖屏 - 生成一张竖屏的小女孩图片')
    .action(async ({ session, args }) => {
      const prompt = args.join(' ').trim();
      if (!prompt) {
        // 如果没有提供 prompt，则返回详细的帮助信息
        return session.execute('help lumi');
      } else {
        // 如果提供了 prompt，则提示用户使用前缀触发
        return `请使用前缀触发图片生成，例如：“鹿鸣 ${prompt}” 或 “lumi ${prompt}”。`;
      }
    });

  // 监听Koishi的'ready'事件，在插件加载完成后执行
  ctx.on('ready', async () => {
    try {
      // TMD，这里是解析相对路径的逻辑！
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const absoluteWorkflowPath = resolve(__dirname, config.workflowPath); // 使用 resolve 拼接路径

      // 使用Node.js的fs模块异步读取JSON文件
      const workflowContent = await fs.readFile(absoluteWorkflowPath, 'utf-8');
      workflowTemplate = JSON.parse(workflowContent);
      ctx.logger.info(`ComfyUI 工作流 JSON 加载成功: ${absoluteWorkflowPath}`);
    } catch (error) {
      ctx.logger.error(`加载 ComfyUI 工作流 JSON 失败: ${error}`);
      ctx.logger.warn('请检查 workflowPath 配置是否正确，并确保文件可读。');
      workflowTemplate = null; // 如果加载失败，就别指望它能用了
    }
  });

  // 注册一个中间件来监听用户消息
  ctx.middleware(async (session, next) => {
    // 如果工作流模板没加载成功，直接报错
    if (!workflowTemplate) {
      return `ComfyUI 插件未初始化成功，工作流文件加载失败。请联系管理员检查日志。`;
    }

    const userMessage = session.content?.trim();
    if (!userMessage) {
      return next(); // 消息为空，跳过
    }

    // 检查用户消息是否以任何触发前缀开头
    const matchedPrefix = config.triggerPrefixes.find(prefix => userMessage.startsWith(prefix));

    if (matchedPrefix) {
      // 匹配到前缀，给用户一个反馈
      session.send('正在为您生成图片，请稍候...');

      try {
        // 深拷贝工作流模板，避免修改原始模板
        const currentWorkflow = JSON.parse(JSON.stringify(workflowTemplate));

        // --- 开始修改逻辑 ---
        let promptForInputString = userMessage; // 初始值是整个用户消息

        // 1. 移除分辨率指令，并确定最终的 prompt 内容
        let resolutionKeywords = ['横屏', '竖屏', '正方形'];
        let cleanedPrompt = promptForInputString;
        
        for (const keyword of resolutionKeywords) {
            // 使用正则表达式匹配关键词及其可能存在的周围空格，并移除
            const regex = new RegExp(`\\s*${keyword}\\s*`, 'g');
            if (cleanedPrompt.match(regex)) {
                cleanedPrompt = cleanedPrompt.replace(regex, ' ').trim(); // 替换为单个空格并修剪
            }
        }
        // 再次修剪，确保没有多余的空格
        cleanedPrompt = cleanedPrompt.trim();


        // 2. 根据前缀调整 input_string 的内容
        if (matchedPrefix === '画图') {
            // '画图' 前缀，input_string 只包含描述部分，不包含前缀本身
            promptForInputString = cleanedPrompt;
        } else {
            // '鹿鸣', 'lumi' 等角色前缀，input_string 包含角色名和描述
            // 此时 cleanedPrompt 已经移除了分辨率指令，但保留了角色名和描述
            promptForInputString = cleanedPrompt;
        }

        // 3. 检查并设置 input_string
        if (currentWorkflow["1"]?.inputs?.input_string !== undefined) {
            currentWorkflow["1"]["inputs"]["input_string"] = promptForInputString;
        } else {
            ctx.logger.warn('ComfyUI 工作流 JSON 结构不符合预期，无法找到提示词节点 "1.inputs.input_string"。');
            return `ComfyUI 工作流配置错误，无法替换提示词。请联系管理员。`;
        }
        // --- 结束修改逻辑 ---

        // 设置随机种子：根据你的JSON文件，K采样器在节点"3"的"inputs"下的"seed"
        if (currentWorkflow["3"]?.inputs?.seed !== undefined) {
          currentWorkflow["3"]["inputs"]["seed"] = Math.floor(Math.random() * 1_000_000_000_000_000);
        } else {
          ctx.logger.warn('ComfyUI 工作流 JSON 结构不符合预期，无法找到K采样器种子节点 "3.inputs.seed"。');
          // 即使没有种子节点，也可以继续，但最好提醒一下
        }

        // TMD，这里是分辨率调整的逻辑！
        let targetWidth = config.defaultWidth;
        let targetHeight = config.defaultHeight;
        let resolutionMessage = '未指定横竖屏或正方形，将使用默认分辨率。';

        // 注意：这里仍然使用原始 userMessage 来检测分辨率指令，因为 cleanedPrompt 可能已经移除了它
        if (userMessage.includes('横屏')) {
          targetWidth = config.landscapeWidth;
          targetHeight = config.landscapeHeight;
          resolutionMessage = '已识别为横屏模式，将使用横屏分辨率。';
        } else if (userMessage.includes('正方形')) {
          targetWidth = config.squareSize;
          targetHeight = config.squareSize;
          resolutionMessage = '已识别为正方形模式，将使用正方形分辨率。';
        } else if (userMessage.includes('竖屏')) {
          targetWidth = config.portraitWidth;
          targetHeight = config.portraitHeight;
          resolutionMessage = '已识别为竖屏模式，将使用竖屏分辨率。';
        }
        
        // 给用户一个分辨率反馈，但别刷屏，只在日志里详细记录
        ctx.logger.info(`分辨率调整：${resolutionMessage} (Width: ${targetWidth}, Height: ${targetHeight})`);

        // 替换分辨率：根据你的JSON文件，分辨率在节点"2"的"inputs"下的"width"和"height"
        if (currentWorkflow["2"]?.inputs?.width !== undefined && currentWorkflow["2"]?.inputs?.height !== undefined) {
          currentWorkflow["2"]["inputs"]["width"] = targetWidth;
          currentWorkflow["2"]["inputs"]["height"] = targetHeight;
        } else {
          ctx.logger.warn('ComfyUI 工作流 JSON 结构不符合预期，无法找到分辨率节点 "2.inputs.width" 或 "2.inputs.height"。');
          return `ComfyUI 工作流配置错误，无法设置分辨率。请联系管理员。`;
        }

        // 1. 提交绘图任务到ComfyUI
        const promptUrl = `${config.comfyuiServer}/prompt`;
        const promptPayload = {
          prompt: currentWorkflow,
          client_id: session.bot.selfId, // 使用机器人ID作为客户端ID，方便ComfyUI识别
        };
        ctx.logger.debug('提交 ComfyUI 任务:', promptPayload);

        const promptResponse = await ctx.http.post(promptUrl, promptPayload);
        const promptId = promptResponse.prompt_id;
        if (!promptId) {
          ctx.logger.error('提交 ComfyUI 任务失败，未获取到 prompt_id:', promptResponse);
          return `提交绘图任务失败，请稍后再试。`;
        }
        ctx.logger.info(`ComfyUI 任务已提交，prompt_id: ${promptId}`);

        // 2. 轮询任务状态并获取图片信息
        const historyUrl = `${config.comfyuiServer}/history/${promptId}`;
        let outputImages: any[] = [];
        let startTime = Date.now();

        while (Date.now() - startTime < config.pollTimeout) {
          await new Promise(resolve => setTimeout(resolve, config.pollInterval)); // 等待一段时间再轮询
          const historyResponse = await ctx.http.get(historyUrl);
          const history = historyResponse[promptId];

          if (history && history.outputs) {
            let completed = false;
            for (const nodeId in history.outputs) {
              const nodeOutput = history.outputs[nodeId];
              if (nodeOutput.images && nodeOutput.images.length > 0) {
                outputImages = nodeOutput.images;
                completed = true;
                break; // 找到图片就退出循环
              }
              // 如果你的工作流也可能输出视频，可以在这里处理
              if (nodeOutput.videos && nodeOutput.videos.length > 0) {
                outputImages = nodeOutput.videos; // 假设也处理视频
                completed = true;
                break;
              }
            }
            if (completed) {
              ctx.logger.info(`ComfyUI 任务 ${promptId} 完成，获取到 ${outputImages.length} 个输出。`);
              break;
            }
          }
          ctx.logger.debug(`ComfyUI 任务 ${promptId} 仍在执行...`);
        }

        if (outputImages.length === 0) {
          ctx.logger.error(`ComfyUI 任务 ${promptId} 超时或未生成任何输出。`);
          return `生成图片超时或未获取到任何输出，请稍后再试。`;
        }

        // 3. 下载并发送图片/视频
        for (const output of outputImages) {
          const fileUrl = `${config.comfyuiServer}/view?filename=${output.filename}&subfolder=${output.subfolder}&type=${output.type}`;
          ctx.logger.debug('下载文件:', fileUrl);
          // 使用 arraybuffer 获取二进制数据
          const fileData = await ctx.http.get(fileUrl, { responseType: 'arraybuffer' });

          // 根据文件类型发送，这里假设是图片，如果是视频需要调整
          if (output.type === 'output' && output.filename.endsWith('.png')) { // 简单判断为图片
            await session.send(h.image(fileData, 'image/png'));
          } else if (output.type === 'output' && output.filename.endsWith('.mp4')) { // 简单判断为视频
            await session.send(h.video(fileData, 'video/mp4'));
          } else {
            ctx.logger.warn(`未知文件类型或格式，无法发送: ${output.filename}`);
            await session.send(`生成了未知类型的文件: ${output.filename}，无法发送。`);
          }
        }

        return; // 任务已处理，不再传递给下一个中间件
      } catch (error: any) {
        ctx.logger.error(`调用 ComfyUI 失败: ${error.message || error}`);
        return `生成图片时发生错误：${error.message || '未知错误'}。请联系管理员。`;
      }
    }

    return next(); // 如果不匹配关键词，则传递给下一个中间件
  });
}