import * as React from "react";
import { useState } from "react";
import { Steps, Typography, theme, Tabs } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { Card } from "antd";
import { useStyles } from "../../style";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const { Step } = Steps;
const { Paragraph, Title } = Typography;
const { TabPane } = Tabs;

const codeSummaries: { [key: string]: { code: string; language: string } } = {
  frontend: {
    code: `// McpLandingView.tsx
const handleLocalMessage = async (text: string) => {
  // 添加用户消息
  const userMessage: Message = {
    id: generateId(),
    text,
    sender: "user",
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, userMessage]);
  
  try {
    // 调用MCP API
    const response = await fetch(
      \`/api/v1/mcp?prompt=\${encodeURIComponent(text)}\`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    
    // 添加机器人回复
    const botMessage: Message = {
      id: generateId(),
      text: data.data,
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};`,
    language: "typescript",
  },

  webserver: {
    code: `// SAAMcpController.java
@RestController
@Tag(name = "MCP APIs")
@RequestMapping("/api/v1")
public class SAAMcpController {

    private final SAAMcpService mcpService;

    public SAAMcpController(SAAMcpService webSearch) {
        this.mcpService = webSearch;
    }

    @UserIp
    @GetMapping("/mcp")
    @Operation(summary = "DashScope Mcp Chat")
    public String chat(
            HttpServletResponse response,
            @Validated @RequestParam("prompt") String prompt,
            @RequestHeader(value = "chatId", required = false, defaultValue = "spring-ai-alibaba-playground-mcp") String chatId
    ) {
        response.setCharacterEncoding("UTF-8");
        return mcpService.chat(chatId, prompt);
    }
}`,
    language: "java",
  },

  mcpclient: {
    code: `// SAAMcpService.java
@Service
public class SAAMcpService {

    private final ChatClient defaultChatClient;

    public SAAMcpService(ChatModel chatModel, ToolCallbackProvider tools) {
        // Initialize chat client with non-blocking configuration
        this.defaultChatClient = ChatClient.builder(chatModel)
                .defaultAdvisors(
                        new MessageChatMemoryAdvisor(new InMemoryChatMemory()),
                        new SimpleLoggerAdvisor())
                .defaultTools(tools)
                .build();
    }

    public String chat(String chatId, String prompt) {
        return defaultChatClient.prompt()
                .options(DashScopeChatOptions.builder()
                        .withTemperature(0.8)
                        .withResponseFormat(DashScopeResponseFormat.builder()
                                .type(DashScopeResponseFormat.Type.TEXT)
                                .build())
                        .build())
                .user(prompt)
                .advisors(memoryAdvisor ->
                        memoryAdvisor.param(
                                CHAT_MEMORY_CONVERSATION_ID_KEY,
                                chatId
                        ).param(CHAT_MEMORY_RETRIEVE_SIZE_KEY, 100)
                ).call().content();
    }
}`,
    language: "java",
  },

  mcpserver: {
    code: `// mcp-servers-config.json
{
    "mcpServers": {
        "weather": {
            "command": "java",
            "args": [
                "-Dspring.ai.mcp.server.stdio=true",
                "-Dspring.main.web-application-type=none",
                "-Dlogging.pattern.console=",
                "-jar",
                "path/to/weather.jar"
            ],
            "env": {}
        }
    }
}`,
    language: "json",
  },
};

const CodePreview = ({
  codeData,
  isVisible,
  onClose,
  anchorEl,
}: {
  codeData: { code: string; language: string };
  isVisible: boolean;
  onClose: () => void;
  anchorEl: React.RefObject<HTMLElement>;
}) => {
  const { token } = theme.useToken();
  // 获取点击位置作为动画起点
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [heightConstraint, setHeightConstraint] = React.useState<number | null>(
    null
  );
  const previewRef = React.useRef<HTMLDivElement>(null);
  const codePreviewRef = React.useRef<HTMLDivElement>(null);

  // 适应不同的屏幕大小
  const isMobile = window.innerWidth < 768;
  const previewWidth = isMobile ? "90vw" : "800px";

  // 检查元素是否在视口内并调整位置和大小
  const adjustToViewport = React.useCallback(() => {
    if (!previewRef.current || !anchorEl.current) return;

    const previewRect = previewRef.current.getBoundingClientRect();
    const anchorRect = anchorEl.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // 检查顶部和底部边界
    const isTopVisible = previewRect.top >= 0;
    const isBottomVisible = previewRect.bottom <= viewportHeight;
    const isLeftVisible = previewRect.left >= 0;
    const isRightVisible = previewRect.right <= viewportWidth;

    let newTop = position.top;
    let newLeft = position.left;
    let newHeight: number | null = null;

    // 如果底部超出视口
    if (!isBottomVisible) {
      // 计算超出的高度
      const overflowHeight = previewRect.bottom - viewportHeight;

      // 首先尝试向上移动弹窗
      newTop = position.top - overflowHeight;

      // 检查移动后顶部是否还在视口内
      if (previewRect.top - overflowHeight < 0) {
        // 如果向上移动后顶部也超出，则需要缩小高度
        newTop = 10; // 留出一点边距
        newHeight = viewportHeight - 20; // 两边各留10px边距
      }
    }

    // 如果顶部超出视口
    if (!isTopVisible) {
      newTop = 10; // 顶部留出10px边距
    }

    // 如果右侧超出视口
    if (!isRightVisible) {
      // 尝试放到左侧
      newLeft = anchorRect.left - previewRect.width - 20;

      // 如果左侧也不可行，则居中显示
      if (newLeft < 0) {
        newLeft = (viewportWidth - previewRect.width) / 2;
      }
    }

    // 如果左侧超出视口
    if (!isLeftVisible) {
      newLeft = 10; // 左侧留出10px边距
    }

    // 应用新的位置和高度限制
    setPosition({ top: newTop, left: newLeft });
    if (newHeight !== null) {
      setHeightConstraint(newHeight);
    }
  }, [position]);

  // 监听窗口尺寸变化
  React.useEffect(() => {
    if (!isVisible) return;

    const handleResize = () => adjustToViewport();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isVisible, adjustToViewport]);

  // 当弹窗显示或位置变化时调整
  React.useEffect(() => {
    if (!isVisible) return;

    // 设置初始位置
    if (anchorEl.current) {
      const rect = anchorEl.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + 20,
      });
    }

    // 渲染后检查并调整
    const checkTimer = setTimeout(() => {
      adjustToViewport();
    }, 50);

    return () => clearTimeout(checkTimer);
  }, [isVisible, adjustToViewport]);

  // 持续监控位置
  React.useEffect(() => {
    if (!isVisible || !previewRef.current) return;

    // 创建一个 MutationObserver 来监视DOM变化
    const observer = new MutationObserver(() => {
      adjustToViewport();
    });

    // 观察整个文档的变化
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [isVisible, adjustToViewport]);

  // 点击外部关闭
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        codePreviewRef.current &&
        !codePreviewRef.current.contains(event.target as Node) &&
        anchorEl.current !== event.target &&
        !anchorEl.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, isVisible, anchorEl]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={previewRef}
          initial={{
            opacity: 0,
            scale: 0.3,
            x: 0,
            y: 0,
            transformOrigin: "top left",
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            transformOrigin: "top left",
          }}
          exit={{
            opacity: 0,
            scale: 0.3,
            x: 0,
            y: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            zIndex: 1000,
            background: token.colorBgElevated,
            borderRadius: "8px",
            boxShadow: token.boxShadow,
            maxWidth: previewWidth,
            maxHeight: heightConstraint ? `${heightConstraint}px` : "50vh", // 默认最大高度改为50vh
            overflow: "hidden",
            width: "auto",
          }}
        >
          <div ref={codePreviewRef} style={{ position: "relative" }}>
            <div
              style={{
                padding: "10px 12px",
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                color: token.colorText,
                fontFamily: token.fontFamily,
                fontSize: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{`${codeData.language.toUpperCase()} 代码`}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: token.colorFillTertiary,
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "10px",
                  color: token.colorText,
                }}
                onClick={onClose}
              >
                ✕
              </motion.button>
            </div>
            <div
              style={{
                maxHeight: heightConstraint
                  ? `${heightConstraint - 40}px`
                  : "calc(50vh - 40px)",
                overflow: "auto",
                background: token.colorBgContainer,
              }}
            >
              <SyntaxHighlighter
                language={codeData.language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: "16px",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  borderRadius: "0 0 8px 8px",
                  background: token.colorBgContainer,
                }}
                showLineNumbers={true}
                wrapLines={true}
              >
                {codeData.code}
              </SyntaxHighlighter>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CustomDot = ({ index }: { index: number }) => {
  const { styles } = useStyles();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const buttonRef = React.useRef<HTMLSpanElement>(null);

  const showPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPreviewVisible(true);
  };

  const hidePreview = () => {
    setIsPreviewVisible(false);
  };

  return (
    <>
      <motion.span
        ref={buttonRef}
        className={styles.codeInfoIcon}
        onClick={showPreview}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "8px",
          cursor: "pointer",
        }}
      >
        <EyeOutlined />
      </motion.span>

      <CodePreview
        codeData={codeSummaries[Object.keys(codeSummaries)[index]]}
        isVisible={isPreviewVisible}
        onClose={hidePreview}
        anchorEl={buttonRef}
      />
    </>
  );
};

const ArchitectureFlow: React.FC = () => {
  const { styles } = useStyles();

  return (
    <>
      <Typography>
        <Paragraph className={styles.codeInfoIntro}>
          Model Context Protocol (MCP) 架构中关键实现
        </Paragraph>
      </Typography>

      <Steps
        direction="vertical"
        current={4}
        className={styles.codeInfoSteps}
        progressDot={(iconDot, { index }) => iconDot}
      >
        <Step
          title={
            <div className={styles.codeInfoStepTitle}>
              <span className={styles.codeInfoTitleText}>前端</span>
              <CustomDot index={0} />
            </div>
          }
          description={
            <div className={styles.codeInfoStepDesc}>
              React 应用发送用户输入到后端 API
            </div>
          }
          className={styles.codeInfoStepItem}
        />
        <Step
          title={
            <div className={styles.codeInfoStepTitle}>
              <span className={styles.codeInfoTitleText}>WebServer</span>
              <CustomDot index={1} />
            </div>
          }
          description={
            <div className={styles.codeInfoStepDesc}>
              Spring Boot 控制器接收请求并传递给服务层
            </div>
          }
          className={styles.codeInfoStepItem}
        />
        <Step
          title={
            <div className={styles.codeInfoStepTitle}>
              <span className={styles.codeInfoTitleText}>MCP Client</span>
              <CustomDot index={2} />
            </div>
          }
          description={
            <div className={styles.codeInfoStepDesc}>
              服务层使用 ChatClient 将请求传递给语言模型
            </div>
          }
          className={styles.codeInfoStepItem}
        />
        <Step
          title={
            <div className={styles.codeInfoStepTitle}>
              <span className={styles.codeInfoTitleText}>MCP Server</span>
              <CustomDot index={3} />
            </div>
          }
          description={
            <div className={styles.codeInfoStepDesc}>
              根据配置启动的独立进程，提供实际工具实现
            </div>
          }
          className={styles.codeInfoStepItem}
        />
      </Steps>
    </>
  );
};

const Documentation: React.FC = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.documentationContainer}>
      <Title level={4}>什么是 Spring AI Alibaba MCP?</Title>
      <Paragraph>
        Spring AI Alibaba MCP (Model Context Protocol) 是基于 Spring AI
        框架实现的智能交互系统，它通过整合大语言模型（LLM）与工具调用能力，使 AI
        可以在对话中访问各种外部工具和服务，从而增强模型的功能和实用性。
      </Paragraph>

      <Title level={4}>如何使用 Spring AI Alibaba MCP?</Title>
      <Paragraph>
        要使用 Spring AI Alibaba MCP，您可以通过配置 Spring Boot
        应用程序并注入相关依赖来启用它。系统提供了简单的 API 接口，如{" "}
        <code>/api/v1/mcp</code>
        ，您可以向该接口发送提示（prompt），系统会自动处理用户输入并通过大语言模型生成回复，同时能够调用已配置的工具来执行特定任务。
      </Paragraph>

      <Title level={4}>关键特性</Title>
      <ul>
        <li>基于 Spring 生态系统的无缝集成</li>
        <li>易于配置和扩展的工具调用能力</li>
        <li>对话历史记录管理和上下文保持</li>
        <li>支持温度等参数的模型输出控制</li>
        <li>内置的日志和监控能力</li>
      </ul>

      <Title level={4}>使用场景</Title>
      <ul>
        <li>构建具有工具调用能力的智能聊天应用</li>
        <li>开发需要与外部服务交互的智能代理</li>
        <li>实现基于上下文的问答系统</li>
        <li>创建能够处理复杂任务的对话式应用</li>
      </ul>
    </div>
  );
};

const CodeInfo: React.FC = () => {
  const { styles } = useStyles();
  const [activeTab, setActiveTab] = useState("documentation");

  return (
    <Card
      title="Spring AI Alibaba MCP"
      bordered={false}
      className={styles.codeInfoContainer}
      bodyStyle={{
        flex: 1,
        overflow: "auto",
        padding: "16px 24px",
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className={styles.codeInfoTabs}
      >
        <TabPane tab="文档说明" key="documentation">
          <Documentation />
        </TabPane>
        <TabPane tab="架构流程" key="architecture">
          <ArchitectureFlow />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default CodeInfo;
