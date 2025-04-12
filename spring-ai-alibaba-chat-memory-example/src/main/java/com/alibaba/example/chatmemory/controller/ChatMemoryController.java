/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.alibaba.example.chatmemory.controller;

import jakarta.servlet.http.HttpServletResponse;
import reactor.core.publisher.Flux;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.ai.chat.client.advisor.AbstractChatMemoryAdvisor.CHAT_MEMORY_CONVERSATION_ID_KEY;
import static org.springframework.ai.chat.client.advisor.AbstractChatMemoryAdvisor.CHAT_MEMORY_RETRIEVE_SIZE_KEY;

/**
 * @author yuluo
 * @author <a href="mailto:yuluo08290126@gmail.com">yuluo</a>
 */

@RestController
@RequestMapping("/chat-memory")
public class ChatMemoryController {

	private final ChatClient chatClient;

	private final MessageChatMemoryAdvisor jdbcChatMemory;

	private final MessageChatMemoryAdvisor redisChatMemory;

	public ChatMemoryController(
			ChatModel chatModel,
			@Qualifier("jdbcMessageChatMemoryAdvisor") MessageChatMemoryAdvisor jdbcChatMemory,
			@Qualifier("redisMessageChatMemoryAdvisor") MessageChatMemoryAdvisor redisChatMemory
	) {

		this.jdbcChatMemory = jdbcChatMemory;
		this.redisChatMemory = redisChatMemory;
		this.chatClient = ChatClient.builder(chatModel).build();
	}

	/**
	 * Spring AI 提供的基于内存的 Chat Memory 实现
	 */
	@GetMapping("/in-memory")
	public Flux<String> memory(
			@RequestParam("prompt") String prompt,
			@RequestParam("chatId") String chatId,
			HttpServletResponse response
	) {

		response.setCharacterEncoding("UTF-8");

		return chatClient.prompt(prompt).advisors(
				new MessageChatMemoryAdvisor(
						new InMemoryChatMemory())
		).advisors(
				a -> a
						.param(CHAT_MEMORY_CONVERSATION_ID_KEY, chatId)
						.param(CHAT_MEMORY_RETRIEVE_SIZE_KEY, 100)
		).stream().content();
	}

	/**
	 * SQLite Chat Memory 实现
	 */
	@GetMapping("/sqlite")
	public Flux<String> sqlite(
			@RequestParam("prompt") String prompt,
			@RequestParam("chatId") String chatId,
			HttpServletResponse response
	) {

		response.setCharacterEncoding("UTF-8");

		return chatClient.prompt(prompt)
				.advisors(jdbcChatMemory)
				.advisors(
						a -> a
								.param(CHAT_MEMORY_CONVERSATION_ID_KEY, chatId)
								.param(CHAT_MEMORY_RETRIEVE_SIZE_KEY, 100)
				).stream().content();
	}

	/**
	 * Redis Chat Memory 实现
	 */
	@GetMapping("/redis")
	public Flux<String> redis(
			@RequestParam("prompt") String prompt,
			@RequestParam("chatId") String chatId,
			HttpServletResponse response
	) {

		response.setCharacterEncoding("UTF-8");

		return chatClient.prompt(prompt).advisors(
				redisChatMemory
		).advisors(
				a -> a
						.param(CHAT_MEMORY_CONVERSATION_ID_KEY, chatId)
						.param(CHAT_MEMORY_RETRIEVE_SIZE_KEY, 100)
		).stream().content();
	}

}
