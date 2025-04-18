import React, { useState, useEffect } from "react";
import { Tooltip, Image, Card, message, theme, Button } from "antd";
import {
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  WarningOutlined,
} from "@ant-design/icons";

interface GeneratedImageProps {
  id: string;
  url: string;
  prompt: string;
  onReload: (prompt: string) => void;
}

const GeneratedImage: React.FC<GeneratedImageProps> = ({
  id,
  url,
  prompt,
  onReload,
}) => {
  const { token } = theme.useToken();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 当URL变化时，重置错误状态
  useEffect(() => {
    setImageError(false);
    console.log("GeneratedImage: 使用URL:", url);
  }, [url]);

  const handleDownload = async () => {
    try {
      console.log("正在下载图像:", url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("Downloaded blob is empty");
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `generated-image-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      message.success("图片下载成功");
    } catch (error) {
      console.error("Download failed:", error);
      message.error("图片下载失败");
    }
  };

  const handleImageError = () => {
    console.error("图像加载失败:", url);
    setImageError(true);
  };

  return (
    <Card
      bodyStyle={{
        padding: 0,
      }}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        padding: 0,
        borderRadius: token.borderRadiusLG,
        maxWidth: "450px",
        margin: "0 auto",
      }}
      onMouseEnter={(e) => {
        const overlay = e.currentTarget.querySelector(
          ".overlay"
        ) as HTMLElement;
        if (overlay) {
          overlay.style.opacity = "1";
        }
      }}
      onMouseLeave={(e) => {
        const overlay = e.currentTarget.querySelector(
          ".overlay"
        ) as HTMLElement;
        if (overlay) {
          overlay.style.opacity = "0";
        }
      }}
    >
      {imageError ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "240px",
            backgroundColor: token.colorBgElevated,
            color: token.colorText,
            padding: token.padding,
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadiusLG,
          }}
        >
          <WarningOutlined
            style={{
              fontSize: "32px",
              marginBottom: "8px",
              color: token.colorWarning,
            }}
          />
          <p style={{ color: token.colorText }}>图像加载失败</p>
          <Button type="primary" onClick={() => onReload(prompt)}>
            重新生成
          </Button>
        </div>
      ) : (
        <>
          <Image
            src={url}
            alt={prompt}
            style={{
              width: "100%",
              height: "240px",
              objectFit: "cover",
            }}
            preview={{
              visible: previewVisible,
              onVisibleChange: setPreviewVisible,
              mask: (
                <div style={{ color: token.colorWhite }}>
                  <EyeOutlined style={{ marginRight: 8 }} />
                  查看图片
                </div>
              ),
            }}
            onError={handleImageError}
          />
          <div
            className="overlay"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: token.paddingLG,
              opacity: 0,
              transition: "opacity 0.3s ease",
            }}
          >
            <p
              style={{
                color: token.colorWhite,
                margin: `0 0 ${token.margin}px 0`,
                fontSize: token.fontSizeSM,
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {prompt}
            </p>
            <div
              style={{
                display: "flex",
                gap: token.padding,
                alignSelf: "flex-start",
              }}
            >
              <Tooltip title="预览图片">
                <EyeOutlined
                  onClick={() => setPreviewVisible(true)}
                  style={{
                    fontSize: "20px",
                    color: token.colorWhite,
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
              </Tooltip>
              <Tooltip title="重新生成">
                <ReloadOutlined
                  onClick={() => onReload(prompt)}
                  style={{
                    fontSize: "20px",
                    color: token.colorWhite,
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
              </Tooltip>
              <Tooltip title="下载图片">
                <DownloadOutlined
                  onClick={handleDownload}
                  style={{
                    fontSize: "20px",
                    color: token.colorWhite,
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
              </Tooltip>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default GeneratedImage;
