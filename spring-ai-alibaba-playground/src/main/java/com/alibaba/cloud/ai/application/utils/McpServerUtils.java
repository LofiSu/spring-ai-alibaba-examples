package com.alibaba.cloud.ai.application.utils;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import com.alibaba.cloud.ai.application.entity.McpServerConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

/**
 * @author yuluo
 * @author <a href="mailto:yuluo08290126@gmail.com">yuluo</a>
 */

public final class McpServerUtils {

	private static final String MCP_CONFIG_FILE_PATH = "mcp-config.yml";

	private McpServerUtils() {
	}

	public static McpServerConfig getMcpServerConfig() throws IOException {

		ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
		InputStream resourceAsStream = ModelsUtils.class.getClassLoader().getResourceAsStream(MCP_CONFIG_FILE_PATH);

		return mapper.readValue(resourceAsStream, McpServerConfig.class);
	}

	public static String getLibsPath(List<String> list) {

		if (list != null && !list.isEmpty()) {
			return list.get(list.size() - 1);
		}
		return null;
	}

}
