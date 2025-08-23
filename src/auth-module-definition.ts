import { ConfigurableModuleBuilder } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import type { Auth } from "better-auth";
import { APIErrorExceptionFilter } from "./api-error-exception-filter.ts";
import { AUTH_INSTANCE_KEY } from "./symbols.ts";

export type AuthModuleOptions = {
	disableExceptionFilter?: boolean;
	disableTrustedOriginsCors?: boolean;
	disableBodyParser?: boolean;
};

export const {
	ConfigurableModuleClass,
	MODULE_OPTIONS_TOKEN,
	OPTIONS_TYPE,
	ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthModuleOptions>()
	.setClassMethodName("forRoot")
	.setExtras(
		{
			isGlobal: true,
			disableExceptionFilter: false,
			auth: undefined as unknown as Auth | undefined,
		},
		(definition, extras) => ({
			...definition,
			global: extras.isGlobal,
			providers: [
				...(definition.providers ?? []),
				...(extras.auth
					? [
							{
								provide: AUTH_INSTANCE_KEY,
								useValue: extras.auth,
							},
						]
					: []),
				...(extras.disableExceptionFilter
					? []
					: [
							{
								provide: APP_FILTER,
								useClass: APIErrorExceptionFilter,
							},
						]),
			],
			exports: [
				...(definition.exports ?? []),
				...(extras.auth
					? [
							{
								provide: AUTH_INSTANCE_KEY,
								useValue: extras.auth,
							},
						]
					: []),
			],
		}),
	)
	.build();
